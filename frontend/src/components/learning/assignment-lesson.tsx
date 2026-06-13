'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { getAssignmentByLesson, submitAssignment } from '@/lib/api/assignments';
import { uploadDocument } from '@/lib/api/uploads';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { HtmlContent } from '@/components/editor/html-content';

export function AssignmentLesson({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete?: () => void;
}) {
  const token = useAuthStore((s) => s.accessToken)!;
  const [submitting, setSubmitting] = useState(false);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', lessonId],
    queryFn: () => getAssignmentByLesson(lessonId, token),
    enabled: !!token,
  });

  const {
    text,
    setText,
    clearDraft,
    restored,
    lastSaved,
  } = useTextDraft(
    draftKey('assignment', lessonId),
    '',
    { enabled: !!lessonId, onRestore: () => toast.info('Restored unsaved assignment draft') },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment) return;
    setSubmitting(true);
    try {
      await submitAssignment(assignment.id, token, { textContent: text.trim() });
      clearDraft();
      toast.success('Assignment submitted');
      onComplete?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFile(file: File) {
    if (!assignment) return;
    setSubmitting(true);
    try {
      const uploaded = await uploadDocument(file, token);
      await submitAssignment(assignment.id, token, { fileUrl: uploaded.url, textContent: text.trim() || undefined });
      clearDraft();
      toast.success('File submitted');
      onComplete?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading assignment…</p>;
  if (!assignment) return <p className="text-sm text-muted-foreground">No assignment for this lesson.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-5">
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />
      <h3 className="font-bold">{assignment.title}</h3>
      <HtmlContent html={assignment.instructions} className="text-muted-foreground" />
      {assignment.dueDate && (
        <p className="text-xs text-amber-700">Due {new Date(assignment.dueDate).toLocaleString()}</p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Your answer…"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark">Submit</Button>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
          Attach file
          <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </div>
    </form>
  );
}
