import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyScope, CourseStatus } from '@prisma/client';
import { ApiKeyScopes } from '../../common/decorators/api-key-scopes.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { ParseCuidPipe } from '../../common/pipes/parse-cuid.pipe';
import { PrismaService } from '../../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { Req, Param } from '@nestjs/common';

@ApiTags('Partner API')
@Controller('partner')
@Public()
@UseGuards(ApiKeyGuard)
@ApiSecurity('api-key')
export class PartnerApiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
    private readonly certificates: CertificatesService,
  ) {}

  @Get('courses')
  @ApiKeyScopes(ApiKeyScope.COURSE_READ)
  @ApiOperation({ summary: 'Fetch publishable catalog' })
  listCourses(@Req() req: RequestWithUser) {
    const orgId = req.apiKey?.orgId;
    return this.prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        ...(orgId ? { orgId } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailUrl: true,
        type: true,
        level: true,
        price: true,
      },
    });
  }

  @Get('courses/:id')
  @ApiKeyScopes(ApiKeyScope.COURSE_READ)
  @ApiOperation({ summary: 'Course detail' })
  getCourse(@Param('id', ParseCuidPipe) id: string) {
    return this.prisma.course.findFirst({
      where: { id, status: CourseStatus.PUBLISHED },
      include: {
        modules: {
          where: { isPublished: true },
          include: {
            lessons: {
              where: { isPublished: true, isFree: true },
              select: { id: true, title: true, type: true, order: true },
            },
          },
        },
      },
    });
  }

  @Post('enrollments')
  @ApiKeyScopes(ApiKeyScope.ENROLLMENT_WRITE)
  @ApiOperation({ summary: 'Enroll learner' })
  enroll(
    @Body('userId', ParseCuidPipe) userId: string,
    @Body('courseId', ParseCuidPipe) courseId: string,
  ) {
    return this.enrollments.enroll(userId, courseId, 'API_KEY');
  }

  @Get('enrollments')
  @ApiKeyScopes(ApiKeyScope.ENROLLMENT_READ)
  @ApiOperation({ summary: 'Check enrollment' })
  checkEnrollment(
    @Query('learnerId', ParseCuidPipe) learnerId: string,
    @Query('courseId', ParseCuidPipe) courseId: string,
  ) {
    return this.enrollments.check(learnerId, courseId);
  }

  @Get('certificates/verify/:code')
  @ApiKeyScopes(ApiKeyScope.CERTIFICATE_VERIFY)
  @ApiOperation({ summary: 'Verify certificate' })
  verifyCert(@Param('code') code: string) {
    return this.certificates.verify(code);
  }

  @Get('learners/:id/records')
  @ApiKeyScopes(ApiKeyScope.LEARNER_READ)
  @ApiOperation({ summary: 'Learning records' })
  learnerRecords(@Param('id', ParseCuidPipe) id: string) {
    return this.prisma.enrollment.findMany({
      where: { userId: id },
      include: {
        course: { select: { title: true, slug: true } },
        progress: { include: { lesson: { select: { title: true } } } },
      },
    });
  }
}
