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
import { listCourses } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import {
  approveCourse,
  listPendingCourses,
  rejectCourse,
  type PendingCourse,
} from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
export default function AdminCourseApprovalsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const role = useAuthStore((s) => s.user?.platformRole);
  const isSuperadmin = role === 'SUPERADMIN';
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: courses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'courses-pending', role],
    queryFn: async () => {
      if (isSuperadmin) {
        return listPendingCourses(token);
      }
      const page = await listCourses(token, 1, 100);
      return (page.data ?? [])
        .filter((c) => c.status === 'PENDING_REVIEW')
        .map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          status: c.status ?? 'PENDING_REVIEW',
          level: c.level,
          createdAt: new Date().toISOString(),
          org: c.org,
          category: c.category,
        })) as PendingCourse[];
    },
    enabled: !!token,
  });

  async function handleAction(id: string, action: 'approve' | 'reject') {
    if (!isSuperadmin) return;
    setActingId(id);
    try {
      if (action === 'approve') {
        await approveCourse(id, token);
        toast.success('Course approved');
      } else {
        await rejectCourse(id, token);
        toast.success('Course rejected');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<PendingCourse>[] = [
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
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Link href={`/catalog/${r.slug}`} title="Preview">
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {isSuperadmin && (
            <>
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
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      
        <PageHeader
          title="Course approvals"
          description={
            isSuperadmin
              ? 'Review and approve courses submitted for publication.'
              : 'Pending courses in your organization. Platform approval requires a superadmin.'
          }
          breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Approvals' },
          ]}
        />

        {!isSuperadmin && (
          <p className="rounded border border-brand-green/10 bg-brand-canvas px-3 py-2 text-[11px] text-brand-muted">
            You can preview pending courses here. Approve and reject actions are available to superadmins only.
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
