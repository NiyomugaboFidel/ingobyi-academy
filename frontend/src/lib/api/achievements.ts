import { apiRequest } from './client';
import type { Achievement } from './users';

export function getMyAchievements(token: string) {
  return apiRequest<Achievement[]>('/achievements/mine', { token });
}
