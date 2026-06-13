'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/errors';
import {
  approveCourse,
  listPendingCourses,
  rejectCourse,
} from '@/lib/api/courses';
import { useAuthStore } from '@/lib/auth/store';
import type { Course } from '@/lib/api/types';

export default function AdminCourseApprovalsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const role = useAuthStore((s) => s.user?.platformRole);
  const orgRole = useAuthStore((s) => s.user?.orgRole);
  const canApprove = role === 'SUPERADMIN' || orgRole === 'ADMIN';
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses-pending'],
    queryFn: () => listPendingCourses(token),
    enabled: !!token,
  });

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
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
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
        </div>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Course approvals"
        description={
          canApprove
            ? 'Review pending courses, preview content, and publish when ready.'
            : 'Track courses you submitted for publication review.'
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Approvals' },
        ]}
      />

      {!canApprove && (
        <p className="rounded border border-brand-green/10 bg-brand-canvas px-3 py-2 text-[11px] text-brand-muted">
          Trainers can preview pending courses here. Organization admins approve and publish courses for your workspace.
        </p>
      )}

      {error && (
        <ApiErrorBanner
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isLoading}
        />
      )}

      {isLoading ? (
        <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
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
          searchPlaceholder="Search pending courses…"
          searchKeys={[(r) => r.title, (r) => r.org?.name ?? '']}
          exportFilename="pending-courses.csv"
          pageSize={10}
        />
      )}
    </DashboardShell>
  );
}
