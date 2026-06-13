import Link from 'next/link';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { Check, Heart, Building2, Globe2 } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav showCatalogQuickNav={false} />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-brand-green/10 bg-gradient-to-b from-brand-page-bg to-white py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Partnership</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink md:text-4xl">
              Partner with Ingobyi
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-ink/70 md:text-lg">
              Join schools, companies, and donors helping bring quality education to Rwandan learners.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Partnership types */}
        <section className="border-b border-brand-green/8 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink">Ways to partner</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  Icon: Building2, title: 'School Partnership',
                  desc: 'Integrate Ingobyi programs into your school — after-school clubs, in-class STEM activities, and teacher training.',
                  benefits: ['On-site instructor support', 'Curriculum materials', 'Progress reporting for parents', 'Certified student achievements'],
                },
                {
                  Icon: Globe2, title: 'Corporate Sponsorship',
                  desc: 'Sponsor student cohorts, equipment, or entire programs. Get brand recognition and impact reports.',
                  benefits: ['Named sponsorship recognition', 'Impact reports & data', 'Employee volunteering opportunities', 'CSR documentation'],
                },
                {
                  Icon: Heart, title: 'Individual Donor',
                  desc: 'Support a student\'s learning journey through a direct donation. Every contribution funds hands-on kits and mentor time.',
                  benefits: ['Tax-deductible receipts', 'Student progress updates', 'Impact storytelling', 'Community recognition'],
                },
              ].map(({ Icon, title, desc, benefits }) => (
                <div key={title} className="flex flex-col rounded-2xl border border-brand-green/10 bg-white p-7 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/8 text-brand-green">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-brand-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <ul className="mt-5 space-y-2">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-brand-ink">
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Button asChild className="w-full rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
                      <Link href="/contact">Learn more</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current partners */}
        <section className="bg-brand-mint-wash py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-brand-ink">Our partners</h2>
              <p className="mt-3 text-base text-muted-foreground">Schools and organizations working with us to reach Rwandan learners.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {["LE PLAISIR D'ENFANT", 'École Internationale', 'Lycée de Kigali', 'GS Kabuga', 'GS Remera', 'ECD Gisozi', 'TechPartner Rwanda', 'Youth Dev Foundation'].map((name) => (
                <div key={name} className="flex items-center justify-center rounded-xl border border-brand-green/8 bg-white p-6 shadow-sm">
                  <p className="text-center text-sm font-bold text-brand-ink">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
