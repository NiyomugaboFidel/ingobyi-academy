'use client';

import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';

export default function AdminCoursesPage() {
  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Courses"
        description="Create and manage courses for your organization."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Courses' }]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
            <Link href="/admin/courses/new"><Plus className="h-3.5 w-3.5" /> New course</Link>
          </Button>
        }
      />
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Create your first course to start enrolling students."
        primaryAction={{ label: 'Create course', href: '/admin/courses/new' }}
        secondaryAction={{ label: 'Browse catalog', href: '/catalog' }}
      />
    </DashboardShell>
  );
}
