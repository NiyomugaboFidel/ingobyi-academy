import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  listDefinitions() {
    return this.prisma.achievementDefinition.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDefinition(dto: CreateAchievementDto) {
    return this.prisma.achievementDefinition.create({ data: dto });
  }

  updateDefinition(id: string, dto: Partial<CreateAchievementDto>) {
    return this.prisma.achievementDefinition.update({
      where: { id },
      data: dto,
    });
  }

  mine(userId: string) {
    return this.prisma.studentAchievement.findMany({
      where: { userId },
      include: { definition: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  award(userId: string, definitionId: string, awardedBy: string) {
    return this.prisma.studentAchievement.upsert({
      where: { userId_definitionId: { userId, definitionId } },
      create: { userId, definitionId, awardedBy, approvedAt: new Date() },
      update: { awardedBy, approvedAt: new Date() },
      include: { definition: true },
    });
  }
}
