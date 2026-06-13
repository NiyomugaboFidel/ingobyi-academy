'use client';

import { use } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BookOpen, UserPlus, UserMinus } from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { Button } from '@/components/ui/button';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { getCommunityProfile, toggleFollow } from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuthStore((s) => s.accessToken)!;
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: profile, error, refetch, isLoading } = useQuery({
    queryKey: ['community', 'profile', id],
    queryFn: () => getCommunityProfile(id, token),
    enabled: !!token && !!id,
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'profile', id] }),
  });

  const isSelf = currentUser?.id === id;
  const isFollowing = profile?.followers.some((f) => f.followerId === currentUser?.id);

  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      {error && <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} className="mb-4" />}

      {isLoading && <p className="text-sm text-muted-foreground">Loading profile…</p>}

      {profile && (
        <div className="space-y-8">
          <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-3xl font-bold text-brand-green">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                profile.firstName[0]
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold text-foreground">
                {profile.firstName} {profile.lastName}
              </h1>
              {profile.bio && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{profile.followers.length} followers</span>
                <span>{profile.following.length} following</span>
                <span>{profile.achievements.length} achievements</span>
              </div>
              {!isSelf && (
                <Button
                  size="sm"
                  className="mt-4 rounded-full"
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                >
                  {isFollowing ? (
                    <><UserMinus className="mr-1.5 h-4 w-4" /> Unfollow</>
                  ) : (
                    <><UserPlus className="mr-1.5 h-4 w-4" /> Follow</>
                  )}
                </Button>
              )}
              {isSelf && (
                <Button asChild size="sm" variant="outline" className="mt-4 rounded-full">
                  <Link href="/profile">Edit profile</Link>
                </Button>
              )}
            </div>
          </section>

          {profile.achievements.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Award className="h-5 w-5 text-brand-green" /> Achievements
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.achievements.map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{(a.definition as { name?: string; title?: string }).name ?? (a.definition as { title?: string }).title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(a.earnedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.posts.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <BookOpen className="h-5 w-5 text-brand-green" /> Recent posts
              </h2>
              <div className="space-y-3">
                {profile.posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-border bg-card p-4 text-sm">
                    <p className="text-foreground">{post.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </LearningShell>
  );
}
