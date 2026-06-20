'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { getErrorMessage } from '@/lib/api/errors';
=======
>>>>>>> 0e94140 (add cetificate)
import {
  approveCourse,
  listCourses,
  rejectCourse,
} from '@/lib/api/courses';
<<<<<<< HEAD
import { useAuthStore } from '@/lib/auth/store';
=======
import { getErrorMessage } from '@/lib/api/errors';
import {
  approveCourse as approveCourseSuperadmin,
  listPendingCourses,
  rejectCourse as rejectCourseSuperadmin,
  type PendingCourse,
} from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
>>>>>>> 0e94140 (add cetificate)
import type { Course } from '@/lib/api/types';

export default function AdminCourseApprovalsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const role = useAuthStore((s) => s.user?.platformRole);
  const orgRole = useAuthStore((s) => s.user?.orgRole);
  const canApprove = role === 'SUPERADMIN' || orgRole === 'ADMIN';
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

<<<<<<< HEAD
  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses-pending'],
    queryFn: () => listPendingCourses(token),
=======
  const {
    rows: courseRows,
    meta,
    page,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaginatedQuery<Course | PendingCourse>({
    queryKey: ['admin', 'courses-pending', role],
    queryFn: async (p, limit) => {
      if (isSuperadmin) {
        return listPendingCourses(token, p, limit);
      }
      return listCourses(token, p, limit, { status: 'PENDING_REVIEW' });
    },
    pageSize: 10,
>>>>>>> 0e94140 (add cetificate)
    enabled: !!token,
  });

  const courses = courseRows.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status ?? 'PENDING_REVIEW',
    level: 'level' in c ? c.level : undefined,
    createdAt: 'createdAt' in c && c.createdAt ? c.createdAt : new Date().toISOString(),
    org: c.org,
    category: c.category,
  })) as PendingCourse[];

  async function handleAction(id: string, action: 'approve' | 'reject') {
<<<<<<< HEAD
    if (!canApprove) return;
    setActingId(id);
    try {
      if (action === 'approve') {
        await approveCourse(id, token);
        toast.success('Course approved and published');
      } else {
        await rejectCourse(id, token);
        toast.success('Course returned to draft');
=======
    setActingId(id);
    try {
      if (action === 'approve') {
        if (isSuperadmin) {
          await approveCourseSuperadmin(id, token);
        } else {
          await approveCourse(id, token);
        }
        toast.success('Course approved and published');
      } else {
        if (isSuperadmin) {
          await rejectCourseSuperadmin(id, token);
        } else {
          await rejectCourse(id, token);
        }
        toast.success('Course sent back to draft');
>>>>>>> 0e94140 (add cetificate)
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<Course>[] = [
    {
      id: 'title',
      header: 'Course',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.title}</p>
          <p className="text-[11px] text-brand-muted">{r.level ?? 'All levels'}</p>
        </div>
      ),
      sortValue: (r) => r.title,
    },
    {
      id: 'org',
      header: 'Organization',
      accessor: (r) => r.org?.name ?? '—',
      sortValue: (r) => r.org?.name ?? '',
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (r) => r.category?.name ?? '—',
      sortValue: (r) => r.category?.name ?? '',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          {r.status ?? 'PENDING_REVIEW'}
        </span>
      ),
      sortValue: (r) => r.status ?? '',
    },
    {
      id: 'actions',
      header: 'Review & approve',
      accessor: (r) => (
<<<<<<< HEAD
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-[11px]">
            <Link href={`/courses/preview/${r.slug}`}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Link>
          </Button>
          {canApprove && (
            <>
              <Button
                type="button"
                size="sm"
                disabled={actingId === r.id}
                className="h-8 gap-1 bg-brand-green text-[11px] hover:bg-brand-green-dark"
                onClick={() => handleAction(r.id, 'approve')}
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={actingId === r.id}
                className="h-8 gap-1 border-red-200 text-[11px] text-red-700 hover:bg-red-50"
                onClick={() => handleAction(r.id, 'reject')}
              >
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
=======
        <div className="flex items-center justify-end gap-1">
          <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0" title="Preview as learner">
            <Link href={`/admin/courses/${r.id}/preview`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={actingId === r.id}
            className="h-7 gap-1 rounded bg-brand-green text-[11px] hover:bg-brand-green-dark"
            onClick={() => handleAction(r.id, 'approve')}
          >
            <Check className="h-3 w-3" /> Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actingId === r.id}
            className="h-7 gap-1 rounded border-red-200 text-[11px] text-red-700 hover:bg-red-50"
            onClick={() => handleAction(r.id, 'reject')}
          >
            <X className="h-3 w-3" /> Reject
          </Button>
>>>>>>> 0e94140 (add cetificate)
        </div>
      ),
    },
  ];

  return (
<<<<<<< HEAD
    <DashboardShell allowedRoles={['ADMIN', 'TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Course approvals"
        description={
          canApprove
            ? 'Review pending courses, preview content, and publish when ready.'
            : 'Track courses you submitted for publication review.'
=======
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Course approvals"
        description={
          isSuperadmin
            ? 'Review and approve courses submitted for publication across the platform.'
            : 'Review pending courses in your organization. Preview each course like a learner, then approve or reject.'
>>>>>>> 0e94140 (add cetificate)
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Approvals' },
        ]}
      />

<<<<<<< HEAD
      {!canApprove && (
        <p className="rounded border border-brand-green/10 bg-brand-canvas px-3 py-2 text-[11px] text-brand-muted">
          Trainers can preview pending courses here. Organization admins approve and publish courses for your workspace.
        </p>
      )}

=======
>>>>>>> 0e94140 (add cetificate)
      {error && (
        <ApiErrorBanner
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isLoading}
        />
      )}

      {isLoading ? (
<<<<<<< HEAD
        <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
=======
        <ListPageSkeleton />
>>>>>>> 0e94140 (add cetificate)
      ) : courses.length === 0 && !error ? (
        <EmptyState
          icon={BookOpen}
          title="No pending courses"
          description="Courses awaiting review will appear here when trainers submit them."
          primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
        />
      ) : (
        <DataTable
          data={courses}
          columns={columns}
<<<<<<< HEAD
=======
          loading={isFetching}
>>>>>>> 0e94140 (add cetificate)
          searchPlaceholder="Search pending courses…"
          searchKeys={[(r) => r.title, (r) => r.org?.name ?? '']}
          exportFilename="pending-courses.csv"
          pageSize={10}
<<<<<<< HEAD
=======
          serverPagination={
            meta ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage } : undefined
          }
>>>>>>> 0e94140 (add cetificate)
        />
      )}
    </DashboardShell>
  );
}
