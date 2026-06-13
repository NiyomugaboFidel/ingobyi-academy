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
    return this.prisma.lessonProgress.upsert({
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
