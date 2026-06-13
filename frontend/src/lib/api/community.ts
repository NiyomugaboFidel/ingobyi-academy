import { apiRequest } from './client';
import type { Paginated } from './types';
import { clampLimit, clampPage } from './pagination';

export type CommunityAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

export type CommunityPost = {
  id: string;
  content: string;
  orgId?: string | null;
  likesCount: number;
  isPinned: boolean;
  createdAt: string;
  author: CommunityAuthor;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: CommunityAuthor;
  }>;
};

export type CommunityProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  posts: CommunityPost[];
  achievements: Array<{ id: string; earnedAt: string; definition: { name: string } }>;
  followers: Array<{ followerId: string }>;
  following: Array<{ followingId: string }>;
};

export function getCommunityFeed(token: string, params: { orgId?: string; page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.orgId) search.set('orgId', params.orgId);
  search.set('page', String(clampPage(params.page)));
  search.set('limit', String(clampLimit(params.limit, 20)));
  const qs = search.toString();
  return apiRequest<Paginated<CommunityPost>>(`/community/feed?${qs}`, { token });
}

export function createCommunityPost(token: string, body: { content: string; orgId?: string }) {
  return apiRequest<CommunityPost>('/community/posts', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function likeCommunityPost(postId: string, token: string) {
  return apiRequest(`/community/posts/${postId}/like`, { method: 'POST', token });
}

export function commentOnPost(postId: string, token: string, content: string) {
  return apiRequest(`/community/posts/${postId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
}

export function toggleFollow(userId: string, token: string) {
  return apiRequest<{ following: boolean }>(`/community/follow/${userId}`, {
    method: 'POST',
    token,
  });
}

export function getCommunityLeaderboard(token: string) {
  return apiRequest<Array<{ user?: CommunityAuthor; points: number }>>('/community/leaderboard', { token });
}

export function getCommunityProfile(userId: string, token: string) {
  return apiRequest<CommunityProfile>(`/community/${userId}/profile`, { token });
}

export function deleteCommunityPost(postId: string, token: string) {
  return apiRequest(`/community/posts/${postId}`, { method: 'DELETE', token });
}

export function adminListPosts(token: string, page = 1, limit = 20, orgId?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (orgId) qs.set('orgId', orgId);
  return apiRequest<Paginated<CommunityPost & { _count?: { comments: number } }>>(
    `/community/admin/posts?${qs}`,
    { token },
  );
}

export function adminDeletePost(postId: string, token: string) {
  return apiRequest(`/community/admin/posts/${postId}`, { method: 'DELETE', token });
}

export function adminDeleteComment(commentId: string, token: string) {
  return apiRequest(`/community/admin/comments/${commentId}`, { method: 'DELETE', token });
}
