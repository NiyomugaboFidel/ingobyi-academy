import { apiRequest } from './client';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

export function listNotifications(token: string, unreadOnly = false) {
  const qs = unreadOnly ? '?unread=true' : '';
  return apiRequest<AppNotification[]>(`/notifications${qs}`, { token });
}

export function markNotificationRead(id: string, token: string) {
  return apiRequest<AppNotification>(`/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
}
