import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Layers3, DoorOpen, FileSignature, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useGetFeaturedBuildingsQuery } from '@/store/api/publicApi';
import { useGetPricingQuery } from '@/store/api/subscriptionApi';
import { formatCurrency } from '@/utils/format';

const features = [
  { icon: Layers3, title: 'Floor-by-floor diagram', desc: 'See every room across every floor — click to view details, drag to resize.' },
  { icon: DoorOpen, title: 'Live availability', desc: 'Track occupied, reserved, and vacant rooms in real time.' },
  { icon: FileSignature, title: 'E-signature leases', desc: 'Draft, send, and sign agreements without leaving the platform.' },
  { icon: Building2, title: 'Multi-building portfolio', desc: 'Manage dozens of buildings from one unified dashboard.' },
];

export default function LandingPage() {
  const { data: featuredData } = useGetFeaturedBuildingsQuery({ limit: 6 });
  const { data: pricingData } = useGetPricingQuery();
  const pricing = pricingData?.data;

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <div className="texture-grid absolute inset-0 opacity-50" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-crimson-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-crimson-600">
            <Star className="size-3.5" /> Property management, rethought
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Every floor, every room —<br /><span className="text-crimson-500">one living blueprint.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Browse available spaces as a renter, or manage your entire rental portfolio floor-by-floor as a builder. No spreadsheets required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/listings"><Button size="lg" iconRight={<ArrowRight className="size-4.5" />}>Browse spaces</Button></Link>
            <Link to="/get-started"><Button size="lg" variant="outline">List your property</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* Featured */}
      {!!featuredData?.data.length && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">Featured spaces</h2>
              <p className="mt-1 text-sm text-ink-soft">Hand-picked properties from our collection.</p>
            </div>
            <Link to="/listings" className="flex items-center gap-1 text-sm font-medium text-crimson-600 hover:text-crimson-700">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredData.data.map((b, i) => (
              <motion.div key={b.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/listings/${b.slug}`}>
                  <Card hover padding="none" className="overflow-hidden">
                    <div className="relative h-44 bg-gradient-to-br from-crimson-100 to-paper-deep">
                      {b.images?.[0] ? <img src={b.images[0]} alt={b.name} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-crimson-200"><Building2 className="size-12" /></div>}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-sage-600">{b.availableUnitsCount} available</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-base font-semibold text-ink">{b.name}</h3>
                      <p className="mt-0.5 text-xs text-ink-faint">{b.location.city}, {b.location.state}</p>
                      {(b.minRent !== null) && (
                        <p className="mt-2 text-sm font-semibold text-crimson-600">From {formatCurrency(b.minRent)}/mo</p>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="bg-paper-dim/60 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Built different, for builders</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft sm:text-base">Stop juggling spreadsheets. Brift gives you a visual representation of your entire portfolio — the way you actually think about it.</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Card padding="md" className="text-left">
                  <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-crimson-50 text-crimson-500"><f.icon className="size-5" /></span>
                  <h3 className="font-display text-sm font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">Simple, transparent pricing</h2>
          <p className="mt-3 text-sm text-ink-soft">Pay only for what you use. No seat fees, no hidden costs.</p>
          {pricing && (
            <Card padding="lg" className="mt-8 text-left">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold text-ink">{formatCurrency(pricing.pricePerBuilding)}<span className="text-sm font-normal text-ink-soft">/building/year</span></p>
                  <p className="mt-1 font-display text-lg text-ink-soft">{formatCurrency(pricing.pricePerUnit)}<span className="text-sm font-normal">/room/year</span></p>
                </div>
                <span className="rounded-full bg-crimson-50 px-3 py-1 text-xs font-semibold text-crimson-600">Annual</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                {['Unlimited floors per building', 'Real-time occupancy tracking', 'E-signature lease agreements', 'Tenant & expense management', 'Inquiry leads from public listings'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-sage-400" />{f}</li>
                ))}
              </ul>
              <Link to="/get-started" className="mt-6 block">
                <Button className="w-full justify-center">Get started</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
