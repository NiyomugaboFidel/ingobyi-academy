'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { enroll } from '@/lib/api/enrollments';
import { useAuthStore } from '@/lib/auth/store';

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { accessToken, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    if (!isAuthenticated() || !accessToken) {
      router.push(`/login?redirect=/catalog`);
      return;
    }
    setLoading(true);
    try {
      await enroll(courseId, accessToken);
      toast.success('Enrolled successfully!');
      if (user?.platformRole === 'STUDENT') {
        router.push('/student/enrolled');
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} variant="secondary">
      {loading ? 'Enrolling…' : 'Enroll for free'}
    </Button>
  );
}
