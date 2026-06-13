'use client';

import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { listAllOrgMembers } from '@/lib/api/organizations';
import { listAllSuperadminUsers } from '@/lib/api/superadmin';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
};

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN: 'border border-red-200 bg-red-50 text-red-800',
  ADMIN: 'border border-orange-200 bg-orange-50 text-orange-800',
  TRAINER: 'border border-blue-200 bg-blue-50 text-blue-800',
  STUDENT: 'border border-green-200 bg-green-50 text-green-800',
  PARENT: 'border border-purple-200 bg-purple-50 text-purple-800',
};

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const { orgId, effectiveRole } = useActiveOrg();
  const isSuperadmin = user?.platformRole === 'SUPERADMIN';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', effectiveRole, orgId],
    queryFn: async () => {
      if (isSuperadmin) {
        const users = await listAllSuperadminUsers(token);
        return {
          data: users,
          meta: { page: 1, limit: users.length, total: users.length, totalPages: 1 },
        };
      }
      if (!orgId) return { data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } };
      const members = await listAllOrgMembers(orgId, token);
      return {
        data: members.map((m) => ({
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          email: m.user.email,
          platformRole: m.role,
          isActive: m.status === 'ACTIVE',
          createdAt: '',
        })),
        meta: { page: 1, limit: members.length, total: members.length, totalPages: 1 },
      };
    },
    enabled: !!token,
  });

  const rows: UserRow[] = (data?.data ?? []).map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.platformRole,
    status: u.isActive !== false ? 'Active' : 'Inactive',
    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
  }));

  const columns: DataColumn<UserRow>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (r) => <span className="font-medium text-brand-ink">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    { id: 'email', header: 'Email', accessor: (r) => r.email, sortValue: (r) => r.email },
    {
      id: 'role',
      header: 'Role',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[r.role] ?? 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
          {r.role}
        </span>
      ),
      sortValue: (r) => r.role,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${r.status === 'Active' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-gray-200 bg-gray-50 text-gray-500'}`}>
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    { id: 'joined', header: 'Joined', accessor: (r) => r.joined, sortValue: (r) => r.joined },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Users"
        description={
          isSuperadmin
            ? `All ${data?.meta.total ?? ''} platform users.`
            : 'Members in your organization.'
        }
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Users' }]}
      />

      {!orgId && !isSuperadmin && (
        <ApiErrorBanner message="No organization linked to your account." />
      )}

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {isLoading ? (
        <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
      ) : rows.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Users will appear here once they join your organization."
          primaryAction={{ label: 'Admin dashboard', href: '/admin/dashboard' }}
        />
      ) : (
        <div className="dash-table-fill">
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search by name or email…"
            searchKeys={[(r) => r.name, (r) => r.email]}
            exportFilename="users.csv"
            pageSize={15}
          />
        </div>
      )}
    </DashboardShell>
  );
}
