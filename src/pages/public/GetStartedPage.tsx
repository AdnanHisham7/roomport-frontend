import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Building2, DoorOpen, CheckCircle2, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useGetPricingQuery, useBookDemoMutation } from '@/store/api/subscriptionApi';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { BillingCycle } from '@/types/platform';
import { useLocation } from 'react-router-dom';

interface FormValues {
  firstName:         string;
  lastName:          string;
  email:             string;
  phone:             string;
  companyName:       string;
  numberOfBuildings: number;
  numberOfUnits:     number;
  message:           string;
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Book a demo',       desc: 'Fill out your details and well reach out within 24 hours.' },
  { step: '02', title: 'We set you up',     desc: 'Our team manually registers your account and buildings.' },
  { step: '03', title: 'Start managing',    desc: 'Login with your credentials and manage rooms & tenants.' },
];

export default function GetStartedPage() {
  const { data: pricingData }    = useGetPricingQuery();
  const [bookDemo, { isLoading }] = useBookDemoMutation();
  const [submitted, setSubmitted] = useState(false);
  const location = useLocation();
  const initialCycle = location.state?.billingCycle || 'monthly';
  const [cycle, setCycle]        = useState<BillingCycle>(initialCycle);
  const pricing                  = pricingData?.data;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { numberOfBuildings: 1, numberOfUnits: 10 },
  });
  const buildings = Number(watch('numberOfBuildings') || 0);
  const units     = Number(watch('numberOfUnits') || 0);

  const estimatedMonthly = pricing
    ? buildings * pricing.monthlyPricePerBuilding + units * pricing.monthlyPricePerUnit
    : 0;
  const estimatedYearly = pricing
    ? buildings * pricing.yearlyPricePerBuilding + units * pricing.yearlyPricePerUnit
    : 0;
  const estimate = cycle === 'monthly' ? estimatedMonthly : estimatedYearly;

  const onSubmit = async (values: FormValues) => {
    try {
      await bookDemo({
        firstName:         values.firstName,
        lastName:          values.lastName,
        email:             values.email,
        phone:             values.phone,
        companyName:       values.companyName,
        numberOfBuildings: buildings,
        numberOfUnits:     units,
        message:           values.message,
      }).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not submit your request. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-sage-100">
            <CheckCircle2 className="size-8 text-sage-600" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink">Request received!</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Our team will contact you at your email within 24 hours to get you set up. All payments are handled in-person by our team.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/" className="text-sm text-crimson-600 hover:underline">Go to home</a>
            <span className="text-ink-faint">·</span>
            <a href="/login" className="text-sm text-crimson-600 hover:underline">Login</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-ink">Get started with RoomPort</h1>
        <p className="mt-2 text-sm text-ink-soft">
          No online payment required. Book a demo and our team will register your account manually, tailored to your needs.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="rounded-2xl border border-line bg-paper-dim/40 p-5">
              <span className="font-mono text-xs font-semibold text-crimson-500">{s.step}</span>
              <h3 className="mt-1 font-display text-sm font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-xs text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card padding="lg" className="lg:col-span-3">
            <h2 className="font-display text-lg font-semibold text-ink mb-5">Book a demo</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
                <Input label="Last name"  error={errors.lastName?.message}  {...register('lastName',  { required: 'Required' })} />
              </div>
              <Input label="Work email" type="email" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email', { required: 'Required' })} />
              <Input label="Phone number" leftIcon={<Phone className="size-4" />} {...register('phone')} />
              <Input label="Company / Organization (optional)" {...register('companyName')} />

              <div className="border-t border-line pt-4">
                <p className="mb-3 text-sm font-semibold text-ink">What are you looking for?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Buildings" type="number" min={1} leftIcon={<Building2 className="size-4" />} error={errors.numberOfBuildings?.message} {...register('numberOfBuildings', { required: true, valueAsNumber: true, min: 1 })} />
                  <Input label="Rooms total" type="number" min={1} leftIcon={<DoorOpen className="size-4" />} error={errors.numberOfUnits?.message} {...register('numberOfUnits', { required: true, valueAsNumber: true, min: 1 })} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink">Message (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your property management needs..."
                  className="w-full resize-none rounded-xl border border-line bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder-ink-faint focus:border-crimson-400 focus:outline-none"
                  {...register('message')}
                />
              </div>

              <Button type="submit" size="lg" loading={isLoading} icon={<MessageSquare className="size-4.5" />} className="justify-center">
                Submit demo request
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card padding="lg">
              <h3 className="font-display text-sm font-semibold text-ink mb-3">Estimated pricing</h3>
              <div className="flex gap-2 mb-4">
                {(['monthly', 'yearly'] as BillingCycle[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={cn(
                      'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                      cycle === c ? 'bg-crimson-500 text-white' : 'bg-paper-dim text-ink-soft hover:bg-paper-deep'
                    )}
                  >
                    {c === 'monthly' ? 'Monthly' : 'Yearly'}
                    {c === 'yearly' && <span className="ml-1 text-[9px] opacity-80">Save ~17%</span>}
                  </button>
                ))}
              </div>

              {pricing ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <span>{buildings} building{buildings !== 1 && 's'}</span>
                    <span>{formatCurrency(buildings * (cycle === 'monthly' ? pricing.monthlyPricePerBuilding : pricing.yearlyPricePerBuilding))}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>{units} room{units !== 1 && 's'}</span>
                    <span>{formatCurrency(units * (cycle === 'monthly' ? pricing.monthlyPricePerUnit : pricing.yearlyPricePerUnit))}</span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                    <span>Estimated {cycle}</span>
                    <span className="text-crimson-600">{formatCurrency(estimate)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink-faint">Loading pricing…</p>
              )}

              <p className="mt-3 text-[11px] text-ink-faint">
                Final pricing confirmed by our team. Payment is made in-person. No online payment required.
              </p>
            </Card>

            <Card padding="md" className="bg-crimson-50 border-crimson-200">
              <p className="text-sm font-semibold text-crimson-800">Why RoomPort?</p>
              <ul className="mt-2 space-y-1 text-xs text-crimson-700">
                <li>✓ Manage rooms, tenants & payments in one place</li>
                <li>✓ Track rent collections & pending dues</li>
                <li>✓ Lease agreements with digital signing</li>
                <li>✓ Multi-building support</li>
                <li>✓ Dedicated support</li>
              </ul>
            </Card>

            <p className="text-center text-xs text-ink-faint">
              Already have an account?{' '}
              <a href="/login" className="text-crimson-600 hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
