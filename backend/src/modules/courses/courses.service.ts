import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  CourseStatus,
  NotificationType,
  ResourceVisibility,
  UserRole,
} from '@prisma/client';
import {
  buildPaginatedMeta,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';
import {
  courseVisibilityFilter,
  userCanViewCourse,
} from '../../common/utils/course-visibility';
import { guardRole } from '../../common/utils/resolve-effective-role';
import { uniqueSlug } from '../../common/utils/slug.util';
import { sanitizeUser } from '../../common/utils/sanitize-user';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConversationsService } from '../messaging/conversations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly conversations: ConversationsService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(user: AuthenticatedUser, dto: CreateCourseDto) {
    if (user.role !== UserRole.SUPERADMIN && !user.orgId) {
      throw new ForbiddenException('Choose a workspace first');
    }
    const slug = await uniqueSlug(dto.title, async (s) => {
      return !!(await this.prisma.course.findUnique({ where: { slug: s } }));
    });
    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        slug,
        orgId:
          user.role === UserRole.SUPERADMIN ? (dto.orgId ?? null) : user.orgId,
        visibility:
          user.role === UserRole.SUPERADMIN && !dto.orgId
            ? ResourceVisibility.PUBLIC_GLOBAL
            : ResourceVisibility.ORG_PRIVATE,
        description: dto.description,
        shortDescription: dto.shortDescription,
        type: dto.type,
        tags: dto.tags ?? [],
        categoryId: dto.categoryId,
        requiresPhysical: dto.requiresPhysical,
        certificateDelivery: dto.certificateDelivery,
        price: dto.price,
        trainers: { create: { userId: user.userId, isPrimary: true } },
      },
    });
    await this.prisma.courseChatRoom.create({ data: { courseId: course.id } });
    await this.conversations.ensureCourseConversation(course.id, course.title);
    return course;
  }

  async list(user: AuthenticatedUser, pagination: PaginationDto) {
    const effectiveRole = guardRole(user);
    const visibilityWhere = courseVisibilityFilter(user);
    let where: Record<string, unknown> = { ...visibilityWhere };

    if (user.role === UserRole.SUPERADMIN) {
      where = {};
    } else if (effectiveRole === UserRole.ADMIN && user.orgId) {
      where = { orgId: user.orgId };
    } else if (effectiveRole === UserRole.TRAINER) {
      where = {
        AND: [visibilityWhere, { trainers: { some: { userId: user.userId } } }],
      };
    }
    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          trainers: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);
    return {
      data,
      meta: buildPaginatedMeta(pagination.page, pagination.limit, total),
    };
  }

  async getById(id: string, user?: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        trainers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        category: true,
        org: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (!userCanViewCourse(user, course)) {
      throw new ForbiddenException('Course not accessible');
    }
    if (
      course.status !== CourseStatus.PUBLISHED &&
      (!user ||
        (user.role !== UserRole.SUPERADMIN &&
          !course.trainers.some((t) => t.userId === user.userId)))
    ) {
      throw new ForbiddenException('Course not accessible');
    }
    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.ARCHIVED },
    });
  }

  async listPending(user: AuthenticatedUser) {
    const include = {
      org: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      trainers: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    };

    if (user.role === UserRole.SUPERADMIN) {
      return this.prisma.course.findMany({
        where: { status: CourseStatus.PENDING_REVIEW },
        orderBy: { updatedAt: 'desc' },
        include,
      });
    }

    const effectiveRole = guardRole(user);
    if (effectiveRole === UserRole.ADMIN && user.orgId) {
      return this.prisma.course.findMany({
        where: { orgId: user.orgId, status: CourseStatus.PENDING_REVIEW },
        orderBy: { updatedAt: 'desc' },
        include,
      });
    }

    if (effectiveRole === UserRole.TRAINER) {
      return this.prisma.course.findMany({
        where: {
          status: CourseStatus.PENDING_REVIEW,
          trainers: { some: { userId: user.userId } },
        },
        orderBy: { updatedAt: 'desc' },
        include,
      });
    }

    throw new ForbiddenException('Not allowed to view pending courses');
  }

  async getPreviewBySlug(slug: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findFirst({
      where: { slug },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        trainers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        category: true,
        org: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const isTrainer = course.trainers.some((t) => t.userId === user.userId);
    const isOrgAdmin =
      user.orgRole === UserRole.ADMIN &&
      user.orgId &&
      course.orgId === user.orgId;
    const canPreview =
      user.role === UserRole.SUPERADMIN || isOrgAdmin || isTrainer;

    if (!canPreview) {
      throw new ForbiddenException('Course preview not available');
    }

    return course;
  }

  async requestPublish(id: string, userId: string) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      include: { org: { select: { name: true } } },
    });
    if (!existing) throw new NotFoundException('Course not found');

    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PENDING_REVIEW },
    });
    await this.audit.log({
      userId,
      orgId: course.orgId ?? undefined,
      action: AuditAction.PUBLISH,
      entity: 'Course',
      entityId: id,
    });

    const notifyTitle = `Course pending approval — ${existing.title}`;
    const notifyBody = `A trainer submitted "${existing.title}" for publication review.`;
    const link = '/admin/course-approvals';

    if (course.orgId) {
      const orgAdmins = await this.prisma.membership.findMany({
        where: {
          orgId: course.orgId,
          role: UserRole.ADMIN,
          status: 'ACTIVE',
        },
        select: { userId: true },
      });
      for (const admin of orgAdmins) {
        void this.notifications.create(
          admin.userId,
          NotificationType.ANNOUNCEMENT,
          notifyTitle,
          notifyBody,
          link,
        );
      }
    }

    const superadmins = await this.prisma.user.findMany({
      where: { platformRole: UserRole.SUPERADMIN, isActive: true },
      select: { id: true },
    });
    for (const sa of superadmins) {
      void this.notifications.create(
        sa.id,
        NotificationType.ANNOUNCEMENT,
        notifyTitle,
        notifyBody,
        '/superadmin/course-approvals',
      );
    }

    return course;
  }

  async approve(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      include: {
        trainers: { select: { userId: true } },
      },
    });
    if (!existing) throw new NotFoundException('Course not found');

    if (user.role !== UserRole.SUPERADMIN) {
      const isOrgAdmin =
        user.orgRole === UserRole.ADMIN &&
        user.orgId &&
        existing.orgId === user.orgId;
      if (!isOrgAdmin) {
        throw new ForbiddenException(
          'Only organization admin or superadmin can approve courses',
        );
      }
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PUBLISHED, publishedAt: new Date() },
    });
    await this.audit.log({
      userId: user.userId,
      orgId: course.orgId ?? undefined,
      action: AuditAction.APPROVE,
      entity: 'Course',
      entityId: id,
    });

    for (const trainer of existing.trainers) {
      void this.notifications.create(
        trainer.userId,
        NotificationType.COURSE_APPROVED,
        `Course approved — ${existing.title}`,
        'Your course is now published in the catalog.',
        `/catalog/${existing.slug}`,
      );
    }

    return course;
  }

  async reject(id: string, user: AuthenticatedUser) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      include: { trainers: { select: { userId: true } } },
    });
    if (!existing) throw new NotFoundException('Course not found');

    if (user.role !== UserRole.SUPERADMIN) {
      const isOrgAdmin =
        user.orgRole === UserRole.ADMIN &&
        user.orgId &&
        existing.orgId === user.orgId;
      if (!isOrgAdmin) {
        throw new ForbiddenException(
          'Only organization admin or superadmin can reject courses',
        );
      }
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.DRAFT },
    });
    await this.audit.log({
      userId: user.userId,
      orgId: course.orgId ?? undefined,
      action: AuditAction.REJECT,
      entity: 'Course',
      entityId: id,
    });

    for (const trainer of existing.trainers) {
      void this.notifications.create(
        trainer.userId,
        NotificationType.ANNOUNCEMENT,
        `Course needs changes — ${existing.title}`,
        'Your publication request was sent back to draft. Review feedback and resubmit.',
        `/trainer/courses/${existing.id}/edit`,
      );
    }

    return course;
  }

  async listStudents(courseId: string, pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { courseId, status: 'ACTIVE' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where: { courseId, status: 'ACTIVE' } }),
    ]);
    return {
      data: data.map((e) => ({
        ...e,
        user: sanitizeUser(e.user as { passwordHash?: string }),
      })),
      meta: buildPaginatedMeta(pagination.page, pagination.limit, total),
    };
  }

  async addTrainer(courseId: string, userId: string) {
    return this.prisma.courseTrainer.create({
      data: { courseId, userId },
    });
  }

  async removeTrainer(courseId: string, userId: string) {
    return this.prisma.courseTrainer.delete({
      where: { courseId_userId: { courseId, userId } },
    });
  }

  async createModule(courseId: string, dto: CreateModuleDto) {
    return this.prisma.courseModule.create({
      data: { courseId, ...dto },
    });
  }

  async updateModule(moduleId: string, dto: Partial<CreateModuleDto>) {
    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
    });
  }

  async deleteModule(moduleId: string) {
    return this.prisma.courseModule.delete({ where: { id: moduleId } });
  }
}
