'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { myEnrollments } from '@/lib/api/enrollments';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

export default function StudentEnrolledPage() {
  const token = useAuthStore((s) => s.accessToken);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: learningKeys.myEnrollments(),
    queryFn: () => myEnrollments(token!),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">My learning</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrollments.length} course{enrollments.length === 1 ? '' : 's'} in progress
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[200px] animate-pulse rounded-xl bg-brand-green/5" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-green/20 bg-brand-mint-wash p-10 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-brand-green/30" />
            <p className="mt-3 text-sm font-medium text-brand-green">No courses yet</p>
            <Link
              href="/catalog"
              className="mt-3 inline-flex items-center rounded-full bg-brand-green px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green-dark"
            >
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => (
              <div
                key={e.id}
                className="flex flex-col rounded-xl border border-brand-green/10 bg-white shadow-sm transition hover:border-brand-green/25 hover:shadow-md"
              >
                {/* Thumbnail */}
                <Link href={`/student/learn?courseId=${e.course.id}`} className="block">
                  <div className="relative h-32 overflow-hidden rounded-t-xl bg-gradient-to-br from-brand-green to-brand-green-dark">
                    {e.course.thumbnailUrl ? (
                      <img src={e.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl font-extrabold text-white/30">{e.course.title.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/student/learn?courseId=${e.course.id}`} className="group">
                    <p className="line-clamp-2 text-sm font-semibold text-brand-ink group-hover:text-brand-green">
                      {e.course.title}
                    </p>
                  </Link>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        e.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      }`}
                    >
                      {e.status === 'COMPLETED' ? '✓ Completed' : '● Enrolled'}
                    </span>
                    <Link
                      href={`/student/learn?courseId=${e.course.id}`}
                      className="rounded-full bg-brand-green px-3 py-1 text-[10px] font-bold text-white hover:bg-brand-green-dark"
                    >
                      {e.status === 'COMPLETED' ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </LearningShell>
  );
}
