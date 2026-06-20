'use client';

import { useState } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, Eye, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
=======
import { BookOpen, ExternalLink, Pencil, Plus } from 'lucide-react';
>>>>>>> 0e94140 (add cetificate)
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { approveCourse, listAllCourses, rejectCourse } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import type { Course } from '@/lib/api/types';
import { useAuthStore } from '@/lib/auth/store';
=======
import { listCourses } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import type { Course } from '@/lib/api/types';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
>>>>>>> 0e94140 (add cetificate)

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'border border-green-200 bg-green-50 text-green-800',
  PENDING_REVIEW: 'border border-amber-200 bg-amber-50 text-amber-800',
  DRAFT: 'border border-gray-200 bg-gray-50 text-gray-600',
  ARCHIVED: 'border border-red-200 bg-red-50 text-red-700',
};

export default function AdminCoursesPage() {
  const token = useAuthStore((s) => s.accessToken)!;
<<<<<<< HEAD
  const role = useAuthStore((s) => s.user?.platformRole);
  const orgRole = useAuthStore((s) => s.user?.orgRole);
  const canApprove = role === 'SUPERADMIN' || orgRole === 'ADMIN';
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: rows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: () => listAllCourses(token),
    enabled: !!token,
  });

  const pendingCount = rows.filter((c) => c.status === 'PENDING_REVIEW').length;

  async function handleAction(id: string, action: 'approve' | 'reject') {
    if (!canApprove) return;
    setActingId(id);
    try {
      if (action === 'approve') {
        await approveCourse(id, token);
        toast.success('Course approved and published');
      } else {
        await rejectCourse(id, token);
        toast.success('Course returned to draft');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

=======
  const { orgName } = useActiveOrg();

  const {
    rows,
    meta,
    page,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaginatedQuery<Course>({
    queryKey: ['admin', 'courses'],
    queryFn: (p, limit) => listCourses(token, p, limit),
    pageSize: 15,
    enabled: !!token,
  });

>>>>>>> 0e94140 (add cetificate)
  const columns: DataColumn<Course>[] = [
    {
      id: 'title',
      header: 'Course',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.title}</p>
<<<<<<< HEAD
          <p className="text-[11px] text-brand-muted">{r.level ?? 'All levels'}</p>
=======
          {r.trainers?.length ? (
            <p className="text-[11px] text-brand-muted">
              {r.trainers.map((t) => `${t.user.firstName} ${t.user.lastName}`).join(', ')}
            </p>
          ) : null}
>>>>>>> 0e94140 (add cetificate)
        </div>
      ),
      sortValue: (r) => r.title,
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
<<<<<<< HEAD
        <span
          className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status ?? 'DRAFT'] ?? STATUS_STYLES.DRAFT}`}
        >
          {(r.status ?? 'DRAFT').replace('_', ' ')}
        </span>
      ),
      sortValue: (r) => r.status ?? '',
    },
    {
      id: 'actions',
      header: 'Review & approve',
      accessor: (r) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-[11px]">
            <Link href={`/courses/preview/${r.slug}`}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Link>
          </Button>
          {r.status === 'PENDING_REVIEW' && canApprove && (
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
          {r.status === 'PUBLISHED' && (
            <Button asChild size="sm" variant="ghost" className="h-8 text-[11px] text-brand-green">
              <Link href={`/catalog/${r.slug}`}>Live</Link>
            </Button>
          )}
        </div>
      ),
      filterable: false,
=======
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status ?? 'DRAFT'] ?? STATUS_STYLES.DRAFT}`}>
          {(r.status ?? 'DRAFT').replace('_', ' ')}
        </span>
      ),
      sortValue: (r) => r.status ?? 'DRAFT',
      filterValue: (r) => (r.status ?? 'DRAFT').replace('_', ' '),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/courses/${r.id}/preview`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green hover:underline">
            Preview <ExternalLink className="h-3 w-3" />
          </Link>
          <Link href={`/trainer/courses/${r.id}/edit`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green hover:underline">
            <Pencil className="h-3 w-3" /> Edit
          </Link>
        </div>
      ),
>>>>>>> 0e94140 (add cetificate)
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
<<<<<<< HEAD
        title="Courses"
        description={
          pendingCount > 0
            ? `${rows.length} courses · ${pendingCount} awaiting your approval`
            : 'Create and manage courses for your organization.'
        }
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Courses' }]}
        actions={
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href="/admin/course-approvals">Approval queue ({pendingCount})</Link>
              </Button>
            )}
            <Button asChild size="sm" className="h-8 gap-1.5 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
              <Link href="/admin/courses/new">
                <Plus className="h-3.5 w-3.5" /> New course
              </Link>
            </Button>
          </div>
        }
      />

      {pendingCount > 0 && canApprove && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {pendingCount} course{pendingCount === 1 ? '' : 's'} need review. Use <strong>Preview</strong>, then
          click <strong>Approve</strong> in the table to publish immediately.
        </p>
      )}

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {isLoading ? (
        <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
      ) : rows.length === 0 && !error ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start enrolling students."
          primaryAction={{ label: 'Create course', href: '/admin/courses/new' }}
          secondaryAction={{ label: 'Browse catalog', href: '/catalog' }}
=======
        title="Organization courses"
        description={orgName ? `All courses in ${orgName}. You can edit, preview, and approve submissions.` : 'All courses in your organization.'}
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Courses' }]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
            <Link href="/trainer/courses/new"><Plus className="h-3.5 w-3.5" /> New course</Link>
          </Button>
        }
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {!isLoading && rows.length === 0 && !error ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create a course or wait for trainers to submit content for your organization."
          primaryAction={{ label: 'Create course', href: '/trainer/courses/new' }}
          secondaryAction={{ label: 'Course approvals', href: '/admin/course-approvals' }}
>>>>>>> 0e94140 (add cetificate)
        />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
<<<<<<< HEAD
          searchPlaceholder="Search courses…"
          searchKeys={[(r) => r.title, (r) => r.category?.name ?? '']}
          exportFilename="admin-courses.csv"
          pageSize={12}
=======
          loading={isLoading || isFetching}
          searchPlaceholder="Search courses…"
          searchKeys={[(r) => r.title, (r) => r.category?.name ?? '']}
          exportFilename="org-courses.csv"
          pageSize={15}
          serverPagination={
            meta
              ? {
                  page,
                  totalPages: meta.totalPages,
                  total: meta.total,
                  onPageChange: setPage,
                }
              : undefined
          }
>>>>>>> 0e94140 (add cetificate)
        />
      )}
    </DashboardShell>
  );
}
