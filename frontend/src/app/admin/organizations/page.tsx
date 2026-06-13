'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api/errors';
import { listMyMemberships, updateOrganization } from '@/lib/api/organizations';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';

export default function AdminOrgsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const { orgId, orgName } = useActiveOrg();
  const queryClient = useQueryClient();

  const { data: memberships = [] } = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => listMyMemberships(token),
    enabled: !!token,
  });

  const activeMembership = memberships.find((m) => m.org.id === orgId);
  const org = activeMembership?.org;

  const [form, setForm] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    website: '',
  });

  const { isLoading } = useQuery({
    queryKey: ['organizations', 'detail', orgId],
    queryFn: async () => {
      if (!org) return null;
      setForm({
        name: org.name ?? '',
        description: '',
        country: '',
        city: '',
        website: '',
      });
      return org;
    },
    enabled: !!org,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('No organization selected');
      return updateOrganization(orgId, token, {
        name: form.name,
        description: form.description || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        website: form.website || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Organization updated');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!orgId) {
    return (
      <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <PageHeader
          title="Organization"
          description="Manage your workspace settings."
          breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Organization' }]}
        />
        <EmptyState
          icon={Building2}
          title="No workspace selected"
          description="Join or create an organization to manage settings."
          primaryAction={{ label: 'Go to onboarding', href: '/onboarding' }}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Organization"
        description={`Settings for ${orgName ?? 'your workspace'}.`}
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Organization' }]}
      />

      {isLoading ? (
        <div className="dash-card h-64 animate-pulse bg-brand-canvas" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="dash-card max-w-xl space-y-4 p-6"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-brand-green/18 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Country</label>
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">City</label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Website</label>
            <Input
              type="url"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://"
            />
          </div>
          <p className="text-xs text-brand-muted">
            Slug: <span className="font-mono">{org?.slug}</span> · Type: {org?.type}
          </p>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="gap-2 bg-brand-green hover:bg-brand-green-dark"
          >
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </form>
      )}
    </DashboardShell>
  );
}
