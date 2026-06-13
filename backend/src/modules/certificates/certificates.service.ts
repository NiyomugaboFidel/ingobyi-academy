import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../../shared/email/email.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly email: EmailService,
  ) {}

  async generate(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Course not completed');
    }
    const cert = await this.prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
      include: {
        course: { select: { title: true, slug: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
    await this.audit.log({
      userId,
      action: AuditAction.GRANT,
      entity: 'Certificate',
      entityId: cert.id,
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) {
      void this.email.sendCertificate(
        user.email,
        cert.course.title,
        cert.verifyCode,
      );
    }
    return cert;
  }

  async mine(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId, revokedAt: null },
      include: {
        course: {
          select: { id: true, title: true, slug: true, thumbnailUrl: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: { verifyCode: code, revokedAt: null },
      include: {
        user: { select: { firstName: true, lastName: true } },
        course: { select: { title: true, slug: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      valid: true,
      issuedAt: cert.issuedAt,
      learner: `${cert.user.firstName} ${cert.user.lastName}`,
      course: cert.course.title,
      verifyCode: cert.verifyCode,
    };
  }
}
