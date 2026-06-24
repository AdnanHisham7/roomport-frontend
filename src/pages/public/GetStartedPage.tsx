import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Building2, DoorOpen, ArrowRight, Zap, DollarSign } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useGetPricingQuery } from '@/store/api/subscriptionApi';
import { usePublicCheckoutMutation } from '@/store/api/paymentApi';
import { formatCurrency } from '@/utils/format';

interface FormValues {
  firstName: string; lastName: string; email: string; phone: string;
  numberOfBuildings: number; numberOfUnits: number;
}

export default function GetStartedPage() {
  const { data: pricingData } = useGetPricingQuery();
  const [publicCheckout, { isLoading }] = usePublicCheckoutMutation();
  const navigate = useNavigate();
  const pricing = pricingData?.data;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { numberOfBuildings: 1, numberOfUnits: 10 },
  });
  const buildings = Number(watch('numberOfBuildings') || 0);
  const units = Number(watch('numberOfUnits') || 0);
  const amount = pricing ? buildings * pricing.pricePerBuilding + units * pricing.pricePerUnit : 0;

  const onSubmit = async (values: FormValues) => {
    try {
      const origin = window.location.origin;
      const res = await publicCheckout({
        firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone,
        numberOfBuildings: buildings, numberOfUnits: units,
        successUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/get-started`,
      }).unwrap();
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not start checkout.');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-ink">List your property on Brift</h1>
        <p className="mt-2 text-sm text-ink-soft">Get set up in minutes. Choose your plan size, pay once a year, and start adding buildings immediately.</p>

        <Card padding="lg" className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
            </div>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
            <Input label="Phone (optional)" {...register('phone')} />

            <div className="border-t border-line pt-5">
              <p className="mb-3 text-sm font-semibold text-ink">Plan size</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Buildings" type="number" min={1} leftIcon={<Building2 className="size-4" />} error={errors.numberOfBuildings?.message} {...register('numberOfBuildings', { required: true, valueAsNumber: true, min: 1 })} />
                <Input label="Rooms total" type="number" min={1} leftIcon={<DoorOpen className="size-4" />} error={errors.numberOfUnits?.message} {...register('numberOfUnits', { required: true, valueAsNumber: true, min: 1 })} />
              </div>
            </div>

            {pricing && (
              <div className="flex items-center justify-between rounded-xl bg-crimson-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-crimson-700">
                  <DollarSign className="size-4" /> Annual total
                </div>
                <span className="font-display text-xl font-semibold text-crimson-700">{formatCurrency(amount)}</span>
              </div>
            )}

            <Button type="submit" size="lg" loading={isLoading} icon={<Zap className="size-4.5" />} iconRight={<ArrowRight className="size-4.5" />} className="justify-center">
              Continue to payment
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Secure payment via Stripe. Cancel or change plan at any time.
          Already have an account? <a href="/login" className="text-crimson-600 hover:underline">Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}
