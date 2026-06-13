import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';
import { ParseCuidPipe } from '../../common/pipes/parse-cuid.pipe';
import { CommunityService } from './community.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Global or org feed' })
  feed(
    @Query('orgId') orgId: string | undefined,
    @Query() pagination: PaginationDto,
  ) {
    return this.communityService.feed(orgId, pagination);
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create post' })
  createPost(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.createPost(user.userId, dto);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete post' })
  deletePost(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseCuidPipe) id: string,
  ) {
    const isModerator =
      user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;
    return this.communityService.deletePost(id, user.userId, isModerator);
  }

  @Get('admin/posts')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'List posts for moderation' })
  adminPosts(
    @Query() pagination: PaginationDto,
    @Query('orgId') orgId?: string,
  ) {
    return this.communityService.adminListPosts(pagination, orgId);
  }

  @Delete('admin/posts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Moderator delete post' })
  adminDeletePost(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseCuidPipe) id: string,
  ) {
    return this.communityService.deletePost(id, user.userId, true);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Like post' })
  like(@Param('id', ParseCuidPipe) id: string) {
    return this.communityService.toggleLike(id);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comment on post' })
  comment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.comment(id, user.userId, dto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete comment' })
  deleteComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseCuidPipe) id: string,
  ) {
    const isModerator =
      user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;
    return this.communityService.deleteComment(id, user.userId, isModerator);
  }

  @Delete('admin/comments/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Moderator delete comment' })
  adminDeleteComment(@Param('id', ParseCuidPipe) id: string) {
    return this.communityService.deleteComment(id, '', true);
  }

  @Post('follow/:userId')
  @ApiOperation({ summary: 'Follow/unfollow user' })
  follow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseCuidPipe) userId: string,
  ) {
    return this.communityService.toggleFollow(user.userId, userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top learners by points' })
  leaderboard() {
    return this.communityService.leaderboard();
  }

  @Get(':userId/profile')
  @ApiOperation({ summary: 'Public learner profile' })
  profile(@Param('userId', ParseCuidPipe) userId: string) {
    return this.communityService.profile(userId);
  }
}
