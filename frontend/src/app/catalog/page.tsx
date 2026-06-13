import { ExploreNav } from '@/components/layout/explore-nav';
import { CourseCard } from '@/components/course-card';
import { searchCatalog } from '@/lib/api/catalog';
import { LandingFooter } from '@/components/landing/landing-footer';
import type { Course } from '@/lib/api/types';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const params = await searchParams;
  let data: Course[] = [];
  let total = 0;
  try {
    const result = await searchCatalog({
      ...(params.q ? { q: params.q } : {}),
      ...(params.category ? { category: params.category } : {}),
      page: params.page || '1',
      limit: '24',
    });
    data = result.data;
    total = result.meta.total;
  } catch {
    /* API offline */
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav />

      {/* Page header */}
      <div className="border-b border-brand-green/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full bg-brand-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">
            Catalog
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink md:text-4xl">
            Course catalog
          </h1>
          <p className="mt-2 text-base leading-relaxed text-brand-ink/70">
            {total} published course{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Course grid */}
      <section className="bg-gradient-to-b from-brand-mint-wash to-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {data.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-base font-semibold text-brand-green">No courses found</p>
              <p className="mt-1 text-sm text-brand-ink/55">
                Try a different search or browse all categories.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
