import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap, Building2, DoorOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetMySubscriptionQuery, useGetSubscriptionHistoryQuery, useGetPricingQuery, useCreateQuoteMutation } from '@/store/api/subscriptionApi';
import { useCreateCheckoutSessionMutation } from '@/store/api/paymentApi';
import { formatCurrency, formatDate } from '@/utils/format';
import { useForm } from 'react-hook-form';

interface QuoteForm { numberOfBuildings: number; numberOfUnits: number; }

export default function BillingPage() {
  const navigate = useNavigate();
  const { data: subData, isLoading } = useGetMySubscriptionQuery();
  const { data: historyData } = useGetSubscriptionHistoryQuery();
  const { data: pricingData } = useGetPricingQuery();
  const [createQuote, { isLoading: quoting }] = useCreateQuoteMutation();
  const [checkout, { isLoading: checkingOut }] = useCreateCheckoutSessionMutation();
  const [quote, setQuote] = useState<{ _id: string; amount: number } | null>(null);

  const { register, handleSubmit, watch } = useForm<QuoteForm>({ defaultValues: { numberOfBuildings: 1, numberOfUnits: 10 } });
  const buildings = watch('numberOfBuildings');
  const units = watch('numberOfUnits');
  const pricing = pricingData?.data;
  const previewAmount = pricing ? buildings * pricing.pricePerBuilding + units * pricing.pricePerUnit : 0;

  const subscription = subData?.data;

  const onGetQuote = async (values: QuoteForm) => {
    try {
      const res = await createQuote(values).unwrap();
      setQuote({ _id: res.data._id, amount: res.data.amount });
      toast.success('Quote ready — proceed to checkout when ready.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not generate quote.');
    }
  };

  const onCheckout = async () => {
    if (!quote) return;
    try {
      const origin = window.location.origin;
      const res = await checkout({ subscriptionId: quote._id, successUrl: `${origin}/checkout/success`, cancelUrl: `${origin}/dashboard/billing` }).unwrap();
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not start checkout.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">Your subscription limits the buildings and rooms you can manage.</p>
      </div>

      {subscription && (
        <Card padding="lg" className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-crimson-500" />
                <span className="font-display text-base font-semibold text-ink">Current plan</span>
                <StatusPill status={subscription.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-5">
                <div className="flex items-center gap-1.5 text-sm text-ink-soft"><Building2 className="size-4 text-crimson-400" /> {subscription.numberOfBuildings} buildings</div>
                <div className="flex items-center gap-1.5 text-sm text-ink-soft"><DoorOpen className="size-4 text-crimson-400" /> {subscription.numberOfUnits} rooms</div>
              </div>
              <p className="mt-2 text-sm text-ink-soft">Renews {formatDate(subscription.dueDate)} · {formatCurrency(subscription.amount)}/year</p>
            </div>
            {subscription.status === 'active' && <CheckCircle className="size-7 text-sage-500" />}
          </div>
        </Card>
      )}

      <Card padding="lg">
        <h3 className="mb-1 font-display text-base font-semibold text-ink">Get a quote</h3>
        <p className="mb-5 text-sm text-ink-soft">
          {pricing ? `${formatCurrency(pricing.pricePerBuilding)}/building · ${formatCurrency(pricing.pricePerUnit)}/room per year` : 'Calculating pricing...'}
        </p>
        <form onSubmit={handleSubmit(onGetQuote)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Buildings" type="number" min={1} leftIcon={<Building2 className="size-4" />} {...register('numberOfBuildings', { required: true, valueAsNumber: true, min: 1 })} />
            <Input label="Rooms" type="number" min={1} leftIcon={<DoorOpen className="size-4" />} {...register('numberOfUnits', { required: true, valueAsNumber: true, min: 1 })} />
          </div>
          {pricing && (
            <div className="rounded-xl bg-crimson-50 px-4 py-3 text-sm font-medium text-crimson-700">
              Estimated annual cost: {formatCurrency(previewAmount)}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={quoting} variant="outline">Generate quote</Button>
            {quote && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Button icon={<Zap className="size-4" />} iconRight={<ArrowRight className="size-4" />} loading={checkingOut} onClick={onCheckout}>
                  Pay {formatCurrency(quote.amount)}
                </Button>
              </motion.div>
            )}
          </div>
        </form>
      </Card>

      {!!historyData?.data.length && (
        <Card padding="none" className="mt-5">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-ink">Billing history</h3>
          </div>
          <div className="divide-y divide-line">
            {historyData.data.map(h => (
              <div key={h._id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-ink-soft">{formatDate(h.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <StatusPill status={h.status} />
                  <span className="font-medium text-ink">{formatCurrency(h.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
