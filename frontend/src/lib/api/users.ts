import { apiRequest } from './client';
import type { User } from './types';

export interface Achievement {
  id: string;
  earnedAt: string;
  definition: { id: string; name: string; description?: string; iconUrl?: string | null; points?: number };
}

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  status: string;
}

export function updateMe(token: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'bio'>>) {
  return apiRequest<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data), token });
}

export function updateAvatar(token: string, avatarUrl: string) {
  return apiRequest<User>('/users/me/avatar', { method: 'PATCH', body: JSON.stringify({ avatarUrl }), token });
}

export function getUserAchievements(userId: string) {
  return apiRequest<Achievement[]>(`/users/${userId}/achievements`);
}

export function getUserCourses(userId: string) {
  return apiRequest<PublicCourse[]>(`/users/${userId}/courses`);
}
