import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private gateway!: AppGateway;

  constructor(
    private readonly prisma: PrismaService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    const { AppGateway: Gateway } = require('../gateway/app.gateway') as {
      AppGateway: new (...args: never[]) => AppGateway;
    };
    this.gateway = this.moduleRef.get(Gateway, { strict: false });
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, link },
    });
    this.gateway?.emitNotification(userId, notification);
    return notification;
  }

  async list(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
