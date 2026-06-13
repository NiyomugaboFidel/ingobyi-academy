import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginatedMeta,
  PaginationDto,
} from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(orgId: string | undefined, pagination: PaginationDto) {
    const where = orgId ? { orgId } : {};
    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          comments: { take: 3, orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.communityPost.count({ where }),
    ]);
    return {
      data,
      meta: buildPaginatedMeta(pagination.page, pagination.limit, total),
    };
  }

  async createPost(authorId: string, dto: CreatePostDto) {
    return this.prisma.communityPost.create({
      data: { authorId, ...dto },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deletePost(postId: string, userId: string, isModerator = false) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });
    if (!post || (!isModerator && post.authorId !== userId)) {
      throw new NotFoundException('Post not found');
    }
    return this.prisma.communityPost.delete({ where: { id: postId } });
  }

  async toggleLike(postId: string) {
    const post = await this.prisma.communityPost.findUniqueOrThrow({
      where: { id: postId },
    });
    return this.prisma.communityPost.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });
  }

  async comment(postId: string, authorId: string, dto: CreateCommentDto) {
    return this.prisma.communityComment.create({
      data: { postId, authorId, ...dto },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string, isModerator = false) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || (!isModerator && comment.authorId !== userId)) {
      throw new NotFoundException('Comment not found');
    }
    return this.prisma.communityComment.delete({ where: { id: commentId } });
  }

  async adminListPosts(pagination: PaginationDto, orgId?: string) {
    const where = orgId ? { orgId } : {};
    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.communityPost.count({ where }),
    ]);
    return {
      data,
      meta: buildPaginatedMeta(pagination.page, pagination.limit, total),
    };
  }

  async toggleFollow(followerId: string, followingId: string) {
    const existing = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.userFollow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.userFollow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async leaderboard() {
    const achievements = await this.prisma.studentAchievement.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: achievements.map((a) => a.userId) } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });
    return achievements.map((a) => ({
      user: users.find((u) => u.id === a.userId),
      points: a._count.id * 10,
    }));
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        posts: { take: 10, orderBy: { createdAt: 'desc' } },
        achievements: { include: { definition: true } },
        followers: { select: { followerId: true } },
        following: { select: { followingId: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
