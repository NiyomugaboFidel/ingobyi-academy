import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEnrollment(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new BadRequestException('Lesson not found');
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: lesson.module.courseId },
      },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Not enrolled');
    }
    return { enrollment, lesson };
  }

  async checkAndCompleteEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        progress: true,
        course: {
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      return enrollment;
    }

    const lessonIds = enrollment.course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    if (lessonIds.length === 0) return enrollment;

    const completedIds = new Set(
      enrollment.progress.filter((p) => p.isCompleted).map((p) => p.lessonId),
    );
    const allDone = lessonIds.every((id) => completedIds.has(id));
    if (!allDone) return enrollment;

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async markLessonCompleteForUser(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) return null;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: lesson.module.courseId },
      },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      return null;
    }

    await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: { isCompleted: true, completedAt: new Date() },
    });

    return this.checkAndCompleteEnrollment(userId, lesson.module.courseId);
  }

  async heartbeat(userId: string, lessonId: string, watchedSec: number) {
    const { enrollment } = await this.getEnrollment(userId, lessonId);
    return this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        watchedSec,
        lastSeenAt: new Date(),
      },
      update: { watchedSec, lastSeenAt: new Date() },
    });
  }

  async complete(userId: string, lessonId: string) {
    const { enrollment } = await this.getEnrollment(userId, lessonId);
    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: { isCompleted: true, completedAt: new Date() },
    });

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (lesson) {
      await this.checkAndCompleteEnrollment(userId, lesson.module.courseId);
    }

    return progress;
  }

  async courseProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        progress: {
          include: {
            lesson: { select: { id: true, title: true, order: true } },
          },
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: { select: { id: true, title: true, order: true } },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    if (!enrollment) throw new BadRequestException('Not enrolled');
    const totalLessons = enrollment.course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0,
    );
    const completed = enrollment.progress.filter((p) => p.isCompleted).length;
    const totalWatchedSec = enrollment.progress.reduce(
      (sum, p) => sum + (p.watchedSec ?? 0),
      0,
    );
    return {
      enrollment,
      stats: {
        totalLessons,
        completed,
        percent: totalLessons
          ? Math.round((completed / totalLessons) * 100)
          : 0,
        learningMinutes: Math.round(totalWatchedSec / 60),
        learningHours: Math.round((totalWatchedSec / 3600) * 10) / 10,
      },
    };
  }
}
