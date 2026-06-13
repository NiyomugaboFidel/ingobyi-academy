'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Heart,
  Link2,
  MessageCircle,
  Search,
  Send,
  Share2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import {
  commentOnPost,
  createCommunityPost,
  getCommunityFeed,
  getCommunityLeaderboard,
  likeCommunityPost,
  searchCommunityUsers,
  sharePostOnLinkedIn,
  toggleFollow,
  type CommunityAuthor,
} from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { DraftBadge } from '@/components/ui/draft-badge';
import { toast } from 'sonner';
import { PostCommentForm } from '@/components/community/post-comment-form';

function authorName(author?: CommunityAuthor | null) {
  if (!author) return 'Learner';
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Learner';
}

export default function CommunityPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

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

  const { data: searchResults = [], isFetching: searchingUsers } = useQuery({
    queryKey: ['community', 'user-search', userSearch],
    queryFn: () => searchCommunityUsers(token, userSearch),
    enabled: !!token && userSearch.trim().length >= 2,
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

  const followMutation = useMutation({
    mutationFn: (userId: string) => toggleFollow(userId, token),
    onSuccess: (data, userId) => {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (data.following) next.add(userId);
        else next.delete(userId);
        return next;
      });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not update follow')),
  });

  const filteredSearchResults = useMemo(
    () => searchResults.filter((u) => u.id !== user?.id),
    [searchResults, user?.id],
  );

  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Community</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share milestones, follow learners, and connect with the Ingobyi network.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Find people
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="pl-9"
              />
            </div>
            {userSearch.trim().length >= 2 && (
              <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                {searchingUsers && (
                  <li className="px-2 py-2 text-xs text-muted-foreground">Searching…</li>
                )}
                {!searchingUsers && filteredSearchResults.length === 0 && (
                  <li className="px-2 py-2 text-xs text-muted-foreground">No learners found.</li>
                )}
                {filteredSearchResults.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <Link href={`/users/${person.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {authorName(person)}
                      </p>
                    </Link>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 gap-1 text-xs"
                      onClick={() => followMutation.mutate(person.id)}
                    >
                      <UserPlus className="h-3 w-3" />
                      {followingIds.has(person.id) ? 'Following' : 'Follow'}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
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
                  <Link href={`/users/${post.author?.id ?? '#'}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                    {post.author?.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      authorName(post.author)[0] ?? '?'
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/users/${post.author?.id ?? '#'}`} className="font-semibold text-foreground hover:text-brand-green">
                      {authorName(post.author)}
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{post.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      <button type="button" onClick={() => likeMutation.mutate(post.id)} className="inline-flex items-center gap-1 hover:text-brand-green">
                        <Heart className="h-3.5 w-3.5" /> {post.likesCount}
                      </button>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments?.length ?? 0}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-brand-green"
                        onClick={() => {
                          const url = `${window.location.origin}/community#post-${post.id}`;
                          sharePostOnLinkedIn(url, post.content.slice(0, 200));
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" /> LinkedIn
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-brand-green"
                        onClick={() => {
                          void navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
                          toast.success('Link copied');
                        }}
                      >
                        <Link2 className="h-3.5 w-3.5" /> Copy link
                      </button>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                      <ul className="mt-4 space-y-2 border-t border-border pt-3">
                        {post.comments.map((comment) => (
                          <li key={comment.id} className="text-sm">
                            <span className="font-medium">{authorName(comment.author)}</span>{' '}
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
                      {authorName(entry.user)}
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
