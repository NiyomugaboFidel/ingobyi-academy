import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  CourseStatus,
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
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly conversations: ConversationsService,
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

  async requestPublish(id: string, userId: string) {
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
    return course;
  }

  async approve(id: string, userId: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PUBLISHED, publishedAt: new Date() },
    });
    await this.audit.log({
      userId,
      action: AuditAction.APPROVE,
      entity: 'Course',
      entityId: id,
    });
    return course;
  }

  async reject(id: string, userId: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.DRAFT },
    });
    await this.audit.log({
      userId,
      action: AuditAction.REJECT,
      entity: 'Course',
      entityId: id,
    });
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
