'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/table-skeleton';
import { myEnrollments } from '@/lib/api/enrollments';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { Trophy, BookOpen, Target } from 'lucide-react';

export default function StudentProgressPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: enrollments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => myEnrollments(token),
    enabled: !!token,
  });

  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const inProgress = enrollments.filter((e) => e.status !== 'COMPLETED').length;

  return (
    <DashboardShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      <PageHeader
        title="My progress"
        description="Track your learning journey and achievements."
        breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Progress' }]}
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: 'Total enrolled', value: enrollments.length },
          { icon: Target, label: 'In progress', value: inProgress },
          { icon: Trophy, label: 'Completed', value: completed },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="dash-card flex items-center gap-4 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-brand-green/10 bg-brand-green/5 text-brand-green">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl text-brand-ink">{value}</p>
              <p className="text-[11px] text-brand-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-ink">Your courses</h2>
        {isLoading ? (
          <CardGridSkeleton count={3} columns="sm:grid-cols-2 lg:grid-cols-3" />
        ) : enrollments.length === 0 && !error ? (
          <EmptyState
            icon={BookOpen}
            title="No enrollments yet"
            description="Enroll in a course to start tracking your progress."
            primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
          />
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {enrollments.map((e) => {
              const pct = e.status === 'COMPLETED' ? 100 : 0;
              return (
                <Link
                  key={e.id}
                  href={`/student/learn?courseId=${e.course.id}`}
                  className="dash-card flex items-center gap-4 p-4 transition hover:border-brand-green/20"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-brand-green/10 bg-brand-green/8 text-xs font-bold text-brand-green">
                    {e.course.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-ink line-clamp-1">{e.course.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-canvas">
                        <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="shrink-0 text-[10px] text-brand-muted">{pct}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-brand-muted">
                      {e.status === 'COMPLETED' ? 'Completed' : 'In progress'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
