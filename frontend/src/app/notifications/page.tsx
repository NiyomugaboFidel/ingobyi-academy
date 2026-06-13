'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BookOpen, Trophy, MessageSquare, Info, Megaphone } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { listNotifications, markNotificationRead } from '@/lib/api/notifications';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, typeof Bell> = {
  COURSE: BookOpen,
  COURSE_APPROVED: BookOpen,
  ACHIEVEMENT: Trophy,
  ACHIEVEMENT_EARNED: Trophy,
  MESSAGE: MessageSquare,
  MESSAGE_RECEIVED: MessageSquare,
  ANNOUNCEMENT: Megaphone,
  ENROLLMENT: BookOpen,
  SYSTEM: Info,
};

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications(token),
    enabled: !!token,
  });

  const unreadCount = items.filter((n) => !n.isRead).length;

  async function markAllRead() {
    const unread = items.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markNotificationRead(n.id, token)));
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function markOneRead(id: string) {
    await markNotificationRead(id, token);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
        actions={
          unreadCount > 0 ? (
            <Button type="button" size="sm" variant="outline" className="h-8 rounded border-brand-green/15 text-xs" onClick={() => void markAllRead()}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {isLoading ? (
        <div className="dash-card h-48 animate-pulse bg-brand-canvas" />
      ) : items.length === 0 && !error ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Updates about your courses, messages, and achievements will appear here."
          primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
        />
      ) : (
        <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] ?? Bell;
            const content = (
              <div
                className={cn(
                  'dash-card flex w-full items-start gap-4 p-4 text-left transition hover:border-brand-green/20',
                  !notif.isRead && 'border-brand-green/20 bg-brand-mint-wash/50',
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded border',
                  notif.isRead ? 'border-brand-green/8 bg-brand-canvas text-brand-muted' : 'border-brand-green/15 bg-brand-green/8 text-brand-green',
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', notif.isRead ? 'text-brand-ink' : 'text-brand-green')}>{notif.title}</p>
                  {notif.body && <p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{notif.body}</p>}
                  <p className="mt-1.5 text-[10px] text-brand-muted-light">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />}
              </div>
            );

            if (notif.link) {
              return (
                <Link key={notif.id} href={notif.link} onClick={() => void markOneRead(notif.id)}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={notif.id} type="button" onClick={() => void markOneRead(notif.id)}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
