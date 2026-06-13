'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera, Mail, User, Trophy, BookOpen, Award, Building2,
  GraduationCap, Calendar, Shield,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { getMe } from '@/lib/api/auth';
import { updateMe, updateAvatar, getUserAchievements, getUserCourses } from '@/lib/api/users';
import { uploadImage } from '@/lib/api/uploads';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { myEnrollments } from '@/lib/api/enrollments';
import { getEffectiveRole, useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const token = useAuthStore((s) => s.accessToken);
  const storeUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '' });
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => getMe(token!),
    enabled: !!token,
  });

  const user = profile ?? storeUser;
  const { orgId, orgName, effectiveRole } = useActiveOrg();
  const role = user ? getEffectiveRole(user, orgId) : 'STUDENT';

  useEffect(() => {
    if (profile) {
      setForm({ firstName: profile.firstName, lastName: profile.lastName, bio: profile.bio ?? '' });
    }
  }, [profile]);

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: () => getUserCourses(user!.id),
    enabled: !!user?.id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => myEnrollments(token!),
    enabled: !!token && role === 'STUDENT',
  });

  async function handleAvatar(file: File) {
    if (!token) return;
    setAvatarUploading(true);
    try {
      const uploaded = await uploadImage(file, token);
      const updated = await updateAvatar(token, uploaded.url);
      setAuth(token, updated);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Avatar upload failed'));
    } finally {
      setAvatarUploading(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  }

  const saveMutation = useMutation({
    mutationFn: () => updateMe(token!, form),
    onSuccess: (updated) => {
      if (token) setAuth(token, updated);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const roleStats = {
    STUDENT: [
      { title: 'Enrolled', value: enrollments.length, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Completed', value: completed, icon: <GraduationCap className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
      { title: 'Certificates', value: completed, icon: <Award className="h-5 w-5" /> },
    ],
    TRAINER: [
      { title: 'Courses taught', value: courses.length, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
      { title: 'Students', value: '—', icon: <GraduationCap className="h-5 w-5" /> },
      { title: 'Rating', value: '4.5★', icon: <Award className="h-5 w-5" /> },
    ],
    PARENT: [
      { title: 'Children', value: 2, icon: <User className="h-5 w-5" /> },
      { title: 'Courses', value: 5, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Avg. progress', value: '58%', icon: <GraduationCap className="h-5 w-5" /> },
      { title: 'Messages', value: 3, icon: <Mail className="h-5 w-5" /> },
    ],
    ADMIN: [
      { title: 'Organization', value: orgName ?? '—', icon: <Building2 className="h-5 w-5" /> },
      { title: 'Role', value: 'Admin', icon: <Shield className="h-5 w-5" /> },
      { title: 'Members', value: '—', icon: <User className="h-5 w-5" /> },
      { title: 'Courses', value: '—', icon: <BookOpen className="h-5 w-5" /> },
    ],
  };

  const stats = roleStats[role as keyof typeof roleStats] ?? roleStats.STUDENT;

  return (
    <DashboardShell>
        <PageHeader title="My profile" description="Your account, achievements, and learning history." />

        {/* Hero card */}
        <div className="overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-brand-green to-brand-green-dark" />
          <div className="relative px-6 pb-6">
            <div className="absolute -top-10 left-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-green text-2xl font-extrabold text-white shadow-md">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : initials}
                </div>
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-green text-white hover:bg-brand-green-dark disabled:opacity-60"
                  title="Change profile photo"
                >
                  <Camera className={cn('h-3.5 w-3.5', avatarUploading && 'animate-pulse')} />
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && void handleAvatar(e.target.files[0])}
                />
              </div>
            </div>
            <div className="pt-12">
              <h2 className="text-xl font-extrabold text-brand-ink">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-green/8 px-3 py-0.5 text-xs font-bold capitalize text-brand-green">{role.toLowerCase()}</span>
                {user?.isVerified && <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-800">Verified</span>}
                {orgName && (
                  <span className="rounded-full bg-brand-mint/20 px-3 py-0.5 text-xs font-bold text-brand-green">{orgName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <StatGrid cols={4}>
          {stats.map((s) => (
            <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
          ))}
        </StatGrid>

        {/* Edit form */}
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="space-y-5 rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-brand-ink">Personal information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['firstName', 'lastName'] as const).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold capitalize text-brand-ink">{field.replace(/([A-Z])/, ' $1')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={form[field]} onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full rounded-lg border border-brand-green/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-green" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-ink">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input defaultValue={user?.email ?? ''} disabled
                className="w-full rounded-lg border border-brand-green/15 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-brand-ink">Bio</label>
            <RichTextEditor
              value={form.bio || '<p></p>'}
              onChange={(html) => setForm((p) => ({ ...p, bio: html }))}
              placeholder="Tell us about yourself, your expertise, and interests…"
              size="md"
            />
          </div>
          <Button type="submit" disabled={saveMutation.isPending}
            className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
            {saved ? '✓ Saved!' : saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-brand-ink">
              <Trophy className="h-5 w-5 text-brand-green" /> Achievements &amp; badges
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-xl border border-brand-green/10 bg-white p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint/25">
                    <Award className="h-6 w-6 text-brand-green" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink">{a.definition.name}</p>
                    {a.definition.description && <p className="text-xs text-muted-foreground">{a.definition.description}</p>}
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />{new Date(a.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses for student/trainer */}
        {courses.length > 0 && (
          <div>
            <h2 className="mb-4 text-base font-extrabold text-brand-ink">
              {role === 'TRAINER' ? 'Courses taught' : 'Public courses'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-brand-green/10 bg-white p-4 shadow-sm">
                  <BookOpen className="h-5 w-5 shrink-0 text-brand-green" />
                  <div>
                    <p className="font-semibold text-brand-ink">{c.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{c.status?.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </DashboardShell>
  );
}
