import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, DoorOpen, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetMySubscriptionQuery, useGetMyPeriodsQuery, useGetSubscriptionHistoryQuery, useRequestUpgradeMutation } from '@/store/api/subscriptionApi';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { SubscriptionPeriod } from '@/types/platform';

interface UpgradeForm {
  additionalBuildings: number;
  additionalUnits:     number;
  message:             string;
}

const periodStatusStyle: Record<string, string> = {
  paid:    'bg-sage-100 text-sage-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-crimson-100 text-crimson-700',
};

function PeriodRow({ period }: { period: SubscriptionPeriod }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <div>
        <p className="font-medium text-ink">{period.periodLabel}</p>
        <p className="text-xs text-ink-faint">{formatDate(period.periodStart)} → {formatDate(period.periodEnd)}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono font-semibold text-ink">{formatCurrency(period.amount)}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', periodStatusStyle[period.status] ?? 'bg-paper-deep text-ink-faint')}>
          {period.status}
        </span>
        {period.paidAt && <span className="hidden text-[11px] text-ink-faint sm:block">Paid {formatDate(period.paidAt)}</span>}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { data: subData,     isLoading }  = useGetMySubscriptionQuery();
  const { data: periodsData }             = useGetMyPeriodsQuery();
  const { data: historyData }             = useGetSubscriptionHistoryQuery();
  const [requestUpgrade, { isLoading: requesting }] = useRequestUpgradeMutation();
  const [upgradeSubmitted, setUpgradeSubmitted]       = useState(false);

  const { register, handleSubmit } = useForm<UpgradeForm>({
    defaultValues: { additionalBuildings: 0, additionalUnits: 0 },
  });

  const subscription = subData?.data;
  const periods      = periodsData?.data ?? [];

  const onSubmitUpgrade = async (values: UpgradeForm) => {
    try {
      await requestUpgrade({
        additionalBuildings: Number(values.additionalBuildings),
        additionalUnits:     Number(values.additionalUnits),
        message:             values.message,
      }).unwrap();
      setUpgradeSubmitted(true);
      toast.success('Upgrade request sent. Our team will contact you shortly.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not send upgrade request.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">Your subscription details and payment history.</p>
      </div>

      {/* Current subscription */}
      {subscription ? (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Current plan</h2>
            <StatusPill status={subscription.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-xs text-ink-faint">Cycle</p>
              <p className="mt-0.5 font-medium text-ink capitalize">{subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Buildings</p>
              <p className="mt-0.5 font-medium text-ink">{subscription.numberOfBuildings}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Rooms</p>
              <p className="mt-0.5 font-medium text-ink">{subscription.numberOfUnits}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Amount / {subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
              <p className="mt-0.5 font-mono font-semibold text-ink">{formatCurrency(subscription.amount)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
            <Clock className="size-3.5" />
            Current period: {formatDate(subscription.currentPeriodStart)} → {formatDate(subscription.currentPeriodEnd)}
          </div>
          {subscription.notes && (
            <p className="mt-3 rounded-lg bg-paper-dim px-3 py-2 text-xs text-ink-soft">{subscription.notes}</p>
          )}
        </Card>
      ) : (
        <Card padding="lg" className="text-center">
          <AlertCircle className="mx-auto mb-2 size-8 text-amber-500" />
          <p className="font-medium text-ink">No active subscription</p>
          <p className="mt-1 text-sm text-ink-soft">Contact your administrator or reach out to us to get started.</p>
        </Card>
      )}

      {/* Payment periods */}
      {periods.length > 0 && (
        <Card padding="lg">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Payment periods</h2>
          <div className="divide-y divide-line">
            {periods.map((p) => <PeriodRow key={p._id} period={p} />)}
          </div>
        </Card>
      )}

      {/* Upgrade / renewal request */}
      <Card padding="lg">
        <h2 className="mb-1 font-display text-base font-semibold text-ink">Request upgrade or renewal</h2>
        <p className="mb-5 text-sm text-ink-soft">
          Need more buildings or rooms? Submit a quotation request and our team will contact you. All payments are handled in-person.
        </p>

        {upgradeSubmitted ? (
          <div className="flex items-center gap-3 rounded-xl bg-sage-50 border border-sage-200 px-4 py-3">
            <CheckCircle className="size-5 text-sage-600 shrink-0" />
            <p className="text-sm text-sage-800">Request submitted. We'll reach out within 24 hours to confirm and apply your changes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitUpgrade)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Additional buildings needed"
                type="number"
                min={0}
                leftIcon={<Building2 className="size-4" />}
                {...register('additionalBuildings', { valueAsNumber: true })}
              />
              <Input
                label="Additional rooms needed"
                type="number"
                min={0}
                leftIcon={<DoorOpen className="size-4" />}
                {...register('additionalUnits', { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink">Message (optional)</label>
              <textarea
                rows={3}
                placeholder="Describe what you need — new buildings, more rooms per building, renewal for next cycle, etc."
                className="w-full resize-none rounded-xl border border-line bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder-ink-faint focus:border-crimson-400 focus:outline-none"
                {...register('message')}
              />
            </div>
            <Button type="submit" loading={requesting} icon={<Send className="size-4" />} className="w-fit">
              Send upgrade request
            </Button>
          </form>
        )}
      </Card>

      {/* Subscription history */}
      {(historyData?.data?.length ?? 0) > 1 && (
        <Card padding="lg">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Subscription history</h2>
          <div className="divide-y divide-line">
            {historyData!.data.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-ink capitalize">{s.billingCycle} — {s.numberOfBuildings}B / {s.numberOfUnits}R</p>
                  <p className="text-xs text-ink-faint">{formatDate(s.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">{formatCurrency(s.amount)}</span>
                  <StatusPill status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
