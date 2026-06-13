'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Trophy, Users } from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { Button } from '@/components/ui/button';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import {
  commentOnPost,
  createCommunityPost,
  getCommunityFeed,
  getCommunityLeaderboard,
  likeCommunityPost,
} from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { DraftBadge } from '@/components/ui/draft-badge';
import { toast } from 'sonner';
import { PostCommentForm } from '@/components/community/post-comment-form';

export default function CommunityPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const {
    text: content,
    setText: setContent,
    clearDraft: clearPostDraft,
    restored: postRestored,
    lastSaved: postLastSaved,
  } = useTextDraft(draftKey('community', 'post'), '', {
    onRestore: () => toast.info('Restored unsaved post draft'),
  });
  const { data: feed, error, refetch, isLoading } = useQuery({
    queryKey: ['community', 'feed'],
    queryFn: () => getCommunityFeed(token, { limit: 20 }),
    enabled: !!token,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: () => getCommunityLeaderboard(token),
    enabled: !!token,
  });

  const postMutation = useMutation({
    mutationFn: (text: string) => createCommunityPost(token, { content: text }),
    onSuccess: () => {
      setContent('');
      clearPostDraft();
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
      toast.success('Post published');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not publish post')),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likeCommunityPost(postId, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'feed'] }),
    onError: (err) => toast.error(getErrorMessage(err, 'Could not like post')),
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      commentOnPost(postId, token, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not post comment')),
  });

  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Community</h1>
            <p className="mt-1 text-sm text-muted-foreground">Share milestones, ask questions, and connect with learners.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (content.trim()) postMutation.mutate(content.trim());
            }}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <DraftBadge restored={postRestored} lastSaved={postLastSaved} onDiscard={clearPostDraft} className="mb-2" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a learning milestone or ask the community…"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green/40"
            />
            <div className="mt-3 flex justify-end">
              <Button type="submit" size="sm" disabled={!content.trim() || postMutation.isPending} className="rounded-full bg-brand-green hover:bg-brand-green-dark">
                <Send className="mr-1.5 h-4 w-4" /> Post
              </Button>
            </div>
          </form>

          {error && <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} />}

          {isLoading && <p className="text-sm text-muted-foreground">Loading feed…</p>}

          <div className="space-y-4">
            {feed?.data.map((post) => (
              <article key={post.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Link href={`/users/${post.author.id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      post.author.firstName[0]
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/users/${post.author.id}`} className="font-semibold text-foreground hover:text-brand-green">
                      {post.author.firstName} {post.author.lastName}
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      <button type="button" onClick={() => likeMutation.mutate(post.id)} className="inline-flex items-center gap-1 hover:text-brand-green">
                        <Heart className="h-3.5 w-3.5" /> {post.likesCount}
                      </button>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments?.length ?? 0}</span>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-border pt-3">
                        {post.comments.map((comment) => (
                          <li key={comment.id} className="text-sm">
                            <span className="font-medium">{comment.author.firstName}</span>{' '}
                            <span className="text-muted-foreground">{comment.content}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <PostCommentForm
                      postId={post.id}
                      disabled={commentMutation.isPending}
                      onSubmit={async (text) => {
                        await commentMutation.mutateAsync({ postId: post.id, text });
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-brand-green" />
              <h2 className="font-bold text-foreground">Leaderboard</h2>
            </div>
            <ol className="mt-4 space-y-3">
              {leaderboard.slice(0, 8).map((entry, i) => (
                <li key={entry.user?.id ?? i} className="flex items-center gap-3 text-sm">
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', i < 3 ? 'bg-brand-green text-white' : 'bg-muted text-muted-foreground')}>
                    {i + 1}
                  </span>
                  {entry.user ? (
                    <Link href={`/users/${entry.user.id}`} className="flex-1 font-medium hover:text-brand-green">
                      {entry.user.firstName} {entry.user.lastName}
                    </Link>
                  ) : (
                    <span className="flex-1">Learner</span>
                  )}
                  <span className="text-xs text-muted-foreground">{entry.points} pts</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-green" />
              <h2 className="font-bold text-foreground">Your profile</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Share achievements and connect with other learners.</p>
            {user && (
              <Button asChild size="sm" className="mt-4 w-full rounded-full bg-brand-green hover:bg-brand-green-dark">
                <Link href={`/users/${user.id}`}>View public profile</Link>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </LearningShell>
  );
}
