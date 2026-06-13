import Link from 'next/link';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { Building2, GraduationCap, Laptop, Trophy, Palette, Users, BookOpen, Cpu } from 'lucide-react';

const PROGRAMS = [
  {
    id: 'valued',
    icon: Trophy,
    title: 'VALUED After-School Program',
    subtitle: 'InnovaKidz · RTIC · ValueXchange · Connect & Cheers',
    description: 'The VALUED Program delivers four structured activity pillars after school hours in partner schools: creative arts (InnovaKidz), robotics & tech innovation (RTIC), entrepreneurship & life skills (ValueXchange), and social activities (Connect & Cheers).',
    tags: ['Creative Arts', 'Technology', 'Sports', 'Life Skills'],
    image: '/blog-1/ingobyi-first-1.jpg',
  },
  {
    id: 'hub',
    icon: Building2,
    title: 'Ingobyi Innovation Hub',
    subtitle: 'Bootcamps & Maker Space — Kigali',
    description: 'A physical learning space in Kigali for hands-on robotics, electronics, coding, and innovation. The Hub runs holiday bootcamps, weekly club sessions, and special events for students of all ages.',
    tags: ['Bootcamps', 'Robotics', 'Electronics', 'Competitions'],
    image: '/blog-1/ingobyi-first-2.jpg',
  },
  {
    id: 'academy',
    icon: Laptop,
    title: 'Ingobyi Academy (iA)',
    subtitle: 'Online courses for self-paced learning',
    description: 'The online platform for structured, self-paced courses in STEM, creative arts, sports, media, and life skills. Students earn certificates and track progress with built-in quizzes and assignments.',
    tags: ['Online', 'Self-paced', 'Certificates', 'All ages'],
    image: '/blog-1/ingobyi-first-3.jpg',
  },
  {
    id: 'clubs',
    icon: Users,
    title: 'Innovation Clubs in Schools',
    subtitle: 'School-embedded learning communities',
    description: 'Ingobyi Innovation Clubs operate inside partner schools, giving children a weekly structured technology and creativity session run by trained coaches alongside regular school teachers.',
    tags: ['In-school', 'Weekly sessions', 'Teacher training', 'Partner schools'],
    image: '/blog-1/ingobyi-first-4.jpg',
  },
];

const ACTIVITIES = [
  { icon: Palette, label: 'Creative Arts', desc: 'Music, dance, painting, graphic design, photography, video, audio' },
  { icon: Cpu, label: 'Technology', desc: 'Coding, robotics, embedded systems, digital content creation' },
  { icon: Trophy, label: 'Sports', desc: 'Football, basketball, fitness — structured with certified coaches' },
  { icon: GraduationCap, label: 'Life Skills', desc: 'Leadership, entrepreneurship, public speaking' },
  { icon: BookOpen, label: 'Media', desc: 'Video production, photography, audio recording' },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav showCatalogQuickNav={false} />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-brand-green/10 bg-gradient-to-br from-brand-green via-brand-green-darker to-brand-green py-16 text-white md:py-20">
          <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-mint/15 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-mint">Core Group · Ingobyi Innovation Hub</p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Programs &amp; Activities
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              From online courses to in-school clubs and innovation bootcamps — Ingobyi reaches learners wherever they are in Rwanda.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-brand-mint px-8 font-bold text-brand-green-darker hover:bg-brand-mint-hover">
                <Link href="/catalog">Browse courses</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/35 bg-white/5 font-bold text-white hover:bg-white/10">
                <Link href="/partners">Partner with us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who is it for */}
        <section className="border-b border-brand-green/8 bg-brand-mint-wash py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Who is it for?</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">Our programs serve three main communities.</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { Icon: Building2, title: 'Schools', body: 'Partner with Ingobyi to bring structured after-school programs and in-class STEM activities to your students.' },
                { Icon: GraduationCap, title: 'Students', body: 'Build real skills with hands-on activities, online courses, and certification you can share with employers.' },
                { Icon: Laptop, title: 'Parents', body: 'Track your child\'s progress, see their achievements, and support their learning journey through the parent portal.' },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-brand-green/8 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-brand-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="border-b border-brand-green/8 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-2xl font-extrabold text-brand-ink md:text-3xl">Our programs</h2>
            <div className="space-y-12">
              {PROGRAMS.map((prog, i) => (
                <div key={prog.id} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 !== 0 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                      <prog.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-brand-ink">{prog.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-brand-green">{prog.subtitle}</p>
                    <p className="mt-3 text-base leading-relaxed text-brand-ink/70">{prog.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {prog.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-brand-green/8 px-3 py-1 text-xs font-semibold text-brand-green">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-brand-green/10 shadow-sm">
                    <img src={prog.image} alt={prog.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="border-b border-brand-green/8 bg-brand-mint-wash py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Activities &amp; services</h2>
              <p className="mt-3 text-base text-muted-foreground">15+ activities across 5 categories delivered in schools and online.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ACTIVITIES.map((a) => (
                <div key={a.label} className="rounded-2xl border border-brand-green/8 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/8 text-brand-green">
                    <a.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-bold text-brand-ink">{a.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-green py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to bring Ingobyi to your school?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
              Reach out to discuss school partnerships, curriculum integration, or sponsoring a student cohort.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
                <Link href="/contact">Contact us</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent font-bold text-white hover:bg-white/10">
                <a href="https://coregroup.rw" target="_blank" rel="noopener noreferrer">Visit coregroup.rw</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
