import Link from 'next/link';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { Check, Globe2, School, Users } from 'lucide-react';

const TEAM = [
  { name: 'Tumukunde Victoria', role: 'Operations Manager', image: '/tumukunde.jpeg' },
  { name: 'Aisha Khaitou koita', role: 'Project Manager', image: '/aisha.jpeg' },
  { name: 'Mano Victoria', role: 'Mathematics & Physics Educator', image: '/mano.jpeg' },
  { name: 'Ishimwe Jesus Dollar', role: 'Soft Skills Trainer', image: '/dollar.jpeg' },
  { name: 'Imanirankunda Plaisir', role: 'UI/UX Designer', image: '/plassire.jpeg' },
  { name: 'Ndatimana Edison', role: 'Video Editor & Multimedia', image: '/ndatimana.jpeg' },
  { name: 'Olivier Dusenge', role: 'Marketing & Communications', image: '/dusenge.jpeg' },
  { name: 'Albert Izina', role: 'Robotics & Embedded Systems', image: '/albert.jpeg' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav showCatalogQuickNav={false} />

      <main id="main">
        {/* Hero */}
        <section className="border-b border-brand-green/10 bg-gradient-to-b from-brand-page-bg to-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Core Group Ltd</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink md:text-4xl">About us</h1>
              <p className="mt-4 text-base leading-relaxed text-brand-ink/70 md:text-lg">
                Core Group Ltd is a Rwandan technology and innovation company. Through Ingobyi Innovation Hub, Ingobyi Academy, and Ingobyi Innovation Clubs in schools, we help learners build real skills with mentors, local kits, and structured online courses.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
                  <Link href="/programs">Our programs</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full font-bold">
                  <Link href="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className="border-b border-brand-green/8 bg-white py-14 md:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-green/60">Our mission</p>
                <h2 className="mt-2 text-2xl font-extrabold text-brand-ink md:text-3xl">What we do in schools</h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  Ingobyi Innovation Hub works with schools to support teachers in integrating hands-on STEM activities into the classroom and conducting after-school STEM workshops for children.
                </p>
                <p className="mt-3 text-base leading-relaxed text-brand-ink/70">
                  Our team collaborates with school teachers to explore the curriculum and identify practical lessons, produce teaching kits, and build teacher capacity to deliver engaging STEM education effectively.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Curriculum mapped to Rwandan education standards',
                    'Locally made kits and teaching resources',
                    'Trained instructors in 12+ partner schools',
                    'Online courses for self-paced learning',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-mint/40 text-brand-green">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm text-brand-ink">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['/blog-1/ingobyi-first-1.jpg', '/blog-1/ingobyi-first-2.jpg', '/blog-1/ingobyi-first-3.jpg', '/blog-1/ingobyi-first-4.jpg'].map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl border border-brand-green/10 shadow-sm">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="border-b border-brand-green/8 bg-brand-mint-wash py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Our three pillars</h2>
              <p className="mt-3 text-base text-brand-ink/65">The three ways Core Group Ltd reaches learners across Rwanda.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { Icon: Globe2, title: 'Ingobyi Academy', desc: 'Online courses for STEM, creative arts, sports and life skills — accessible to every learner with internet access.' },
                { Icon: School, title: 'Innovation Hub', desc: 'Physical bootcamps, maker-space sessions and competitions at our hub in Kigali for hands-on learning.' },
                { Icon: Users, title: 'Innovation Clubs', desc: 'After-school clubs in partner schools that bring structured activities directly to children in their communities.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-brand-green/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                    <item.Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brand-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/65">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="border-b border-brand-green/8 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink md:text-3xl">Meet the team</h2>
              <p className="mt-3 text-base text-brand-ink/65">Rwandan professionals dedicated to education, technology, and youth development.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {TEAM.map((member) => (
                <div key={member.name} className="flex flex-col items-center rounded-2xl border border-brand-green/8 bg-brand-mint-wash p-6 text-center shadow-sm">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-brand-mint/40 shadow-sm">
                    <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-4 font-bold text-brand-ink">{member.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Local STEM */}
        <section className="bg-brand-green py-14 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Local, accessible STEM education</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
              Our teaching resources are locally made so technology is designed for Rwanda&apos;s education system — accessible and affordable for schools nationwide.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-brand-mint font-bold text-brand-green-darker hover:bg-brand-mint-hover">
                <Link href="/programs">Explore programs</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-transparent font-bold text-white hover:bg-white/10">
                <Link href="/contact">Partner with us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
