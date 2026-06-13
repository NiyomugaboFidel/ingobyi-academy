'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ExternalLink } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { listCourses } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import type { Course } from '@/lib/api/types';
import { useAuthStore } from '@/lib/auth/store';

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'border border-green-200 bg-green-50 text-green-800',
  PENDING_REVIEW: 'border border-amber-200 bg-amber-50 text-amber-800',
  DRAFT: 'border border-gray-200 bg-gray-50 text-gray-600',
  ARCHIVED: 'border border-red-200 bg-red-50 text-red-700',
};

export default function SuperadminCoursesPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['superadmin', 'courses'],
    queryFn: () => listCourses(token, 1, 100),
    enabled: !!token,
  });

  const rows = data?.data ?? [];

  const columns: DataColumn<Course>[] = [
    {
      id: 'title',
      header: 'Course',
      accessor: (r) => (
        <Link href={`/catalog/${r.slug}`} className="font-medium text-brand-green hover:underline">
          {r.title}
        </Link>
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
      id: 'level',
      header: 'Level',
      accessor: (r) => r.level,
      sortValue: (r) => r.level,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status ?? 'DRAFT'] ?? STATUS_STYLES.DRAFT}`}>
          {(r.status ?? 'DRAFT').replace('_', ' ')}
        </span>
      ),
      sortValue: (r) => r.status ?? '',
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (r) => r.type,
      sortValue: (r) => r.type,
    },
    {
      id: 'view',
      header: '',
      accessor: (r) => (
        <Link href={`/catalog/${r.slug}`} className="inline-flex items-center gap-1 text-[11px] text-brand-green hover:underline">
          Open <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="All courses"
          description={`Platform-wide course registry — ${data?.meta.total ?? rows.length} total.`}
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Courses' },
          ]}
        />

        {error && (
          <ApiErrorBanner
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
            retrying={isLoading}
          />
        )}

        {isLoading ? (
          <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
        ) : rows.length === 0 && !error ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Courses created by trainers and organizations will appear here."
            primaryAction={{ label: 'View catalog', href: '/catalog' }}
            secondaryAction={{ label: 'Pending approvals', href: '/superadmin/course-approvals' }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search courses…"
            searchKeys={[(r) => r.title, (r) => r.org?.name ?? '']}
            exportFilename="all-courses.csv"
            pageSize={15}
          />
        )}
      
    </DashboardShell>
  );
}
