'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, Pencil } from 'lucide-react';
import { truncateHtml } from '@/lib/utils/html';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { listAllCourses } from '@/lib/api/courses';
import { useAuthStore } from '@/lib/auth/store';

type Row = { id: string; title: string; status: string; slug: string; shortDescription?: string | null };

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-gray-100 text-gray-600',
};

export default function TrainerCoursesPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data, isLoading } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: () => listAllCourses(token),
    enabled: !!token,
  });

  const rows: Row[] = (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status ?? 'DRAFT',
    slug: c.slug,
  }));

  const columns: DataColumn<Row>[] = [
    { id: 'title', header: 'Course', accessor: (r) => <span className="font-medium">{r.title}</span>, sortValue: (r) => r.title },
    { id: 'status', header: 'Status', accessor: (r) => (
      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES.DRAFT}`}>{r.status}</span>
    ), sortValue: (r) => r.status },
    { id: 'actions', header: '', accessor: (r) => (
      <Link href={`/trainer/courses/${r.id}/edit`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Link>
    ), filterable: false },
  ];

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="My courses"
        description="Create, edit, and publish your courses."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Courses' }]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
            <Link href="/trainer/courses/new"><Plus className="h-3.5 w-3.5" /> New course</Link>
          </Button>
        }
      />

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start teaching students."
          primaryAction={{ label: 'Create course', href: '/trainer/courses/new' }}
        />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          searchPlaceholder="Search courses…"
          searchKeys={[(r) => r.title, (r) => r.shortDescription ?? '']}
          pageSize={12}
          compact
        />
      )}
    </DashboardShell>
  );
}
