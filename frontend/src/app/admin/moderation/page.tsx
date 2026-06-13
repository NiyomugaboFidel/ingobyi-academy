'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { adminDeletePost, adminListPosts } from '@/lib/api/community';
import { dismissReport, listAllReports, resolveReport } from '@/lib/api/reports';
import { suspendOrgMember } from '@/lib/api/organizations';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { toast } from 'sonner';

export default function AdminModerationPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const { orgId: activeOrgId } = useActiveOrg();
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ['reports', 'admin', activeOrgId],
    queryFn: () => listAllReports(token, 1, 50, activeOrgId),
    enabled: !!token,
  });

  const { data: posts } = useQuery({
    queryKey: ['community', 'admin', activeOrgId],
    queryFn: () => adminListPosts(token, 1, 50, activeOrgId),
    enabled: !!token,
  });

  async function handleResolve(id: string) {
    await resolveReport(id, token);
    toast.success('Report resolved');
    queryClient.invalidateQueries({ queryKey: ['reports', 'admin'] });
  }

  async function handleDismiss(id: string) {
    await dismissReport(id, token);
    toast.success('Report dismissed');
    queryClient.invalidateQueries({ queryKey: ['reports', 'admin'] });
  }

  async function handleDeletePost(id: string) {
    await adminDeletePost(id, token);
    toast.success('Post removed');
    queryClient.invalidateQueries({ queryKey: ['community', 'admin'] });
  }

  async function handleSuspend(userId: string) {
    if (!activeOrgId) return;
    await suspendOrgMember(activeOrgId, userId, token);
    toast.success('User suspended from organization');
  }

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Moderation"
        description="Review reports, community posts, and take action on users."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Moderation' }]}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Issue reports</h2>
        <div className="space-y-3">
          {(reports?.data ?? []).map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type} · {r.status} · {r.user?.email}</p>
                  <p className="mt-2 text-sm">{r.description}</p>
                </div>
                {r.status === 'OPEN' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDismiss(r.id)}>Dismiss</Button>
                    <Button size="sm" onClick={() => handleResolve(r.id)} className="bg-brand-green hover:bg-brand-green-dark">Resolve</Button>
                    {r.user && activeOrgId && (
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleSuspend(r.user!.id)}>Suspend user</Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Community posts</h2>
        <div className="space-y-3">
          {(posts?.data ?? []).map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">{p.author.firstName} {p.author.lastName}</p>
              <p className="mt-1 text-sm">{p.content}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeletePost(p.id)}>Remove post</Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleSuspend(p.author.id)}>Suspend author</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
