import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone, Mail, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useGetMySubscriptionQuery, useGetMyPeriodsQuery } from '@/store/api/subscriptionApi';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:    { label: 'Active',    className: 'bg-sage-50 text-sage-600' },
    inactive:  { label: 'Inactive',  className: 'bg-amber-50 text-amber-600' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600' },
    pending:   { label: 'Pending',   className: 'bg-blue-50 text-blue-600' },
    expired:   { label: 'Expired',   className: 'bg-red-50 text-red-600' },
  };
  const { label, className } = map[status] ?? { label: status, className: 'bg-paper-dim text-ink-soft' };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>;
}

export default function SubscriptionExpiredPage() {
  const { user, logout } = useAuth();
  const { data: subData }     = useGetMySubscriptionQuery();
  const { data: periodsData } = useGetMyPeriodsQuery(undefined, { skip: !subData?.data });

  const sub     = subData?.data;
  const periods = periodsData?.data ?? [];
  const now     = new Date();

  const activePeriod = periods.find(p =>
    p.status === 'paid' &&
    new Date(p.periodStart) <= now &&
    new Date(p.periodEnd)   >= now
  );

  const lastPaidPeriod = [...periods]
    .filter(p => p.status === 'paid')
    .sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime())[0];

  const getReasonMessage = (): { title: string; body: string } => {
    if (!sub) {
      return {
        title: 'No subscription found',
        body:  'Your account does not have an active subscription. Contact us to get started.',
      };
    }
    if (sub.status !== 'active') {
      return {
        title: `Subscription ${sub.status}`,
        body:  `Your subscription is currently ${sub.status}. Please contact us to reactivate it.`,
      };
    }
    if (!activePeriod) {
      return {
        title: 'Payment required for current period',
        body: lastPaidPeriod
          ? `Your last paid period ended on ${new Date(lastPaidPeriod.periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Please contact us to renew your subscription for the current period.`
          : 'No payment has been recorded for the current billing period. Contact us to renew.',
      };
    }
    return {
      title: 'Subscription expired',
      body:  'Your subscription has expired. Contact us to renew and regain full access.',
    };
  };

  const { title, body } = getReasonMessage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-100">
            <AlertTriangle className="size-8 text-amber-600" />
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">{body}</p>
        </div>

        {sub && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Subscription details</p>
              <StatusBadge status={sub.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-ink-faint">Plan</p>
                <p className="font-medium text-ink capitalize">{sub.billingCycle}</p>
              </div>
              <div>
                <p className="text-ink-faint">Buildings allowed</p>
                <p className="font-medium text-ink">{sub.numberOfBuildings}</p>
              </div>
              <div>
                <p className="text-ink-faint">Units allowed</p>
                <p className="font-medium text-ink">{sub.numberOfUnits}</p>
              </div>
              <div>
                <p className="text-ink-faint">Amount</p>
                <p className="font-medium text-ink">₹{sub.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            {lastPaidPeriod && (
              <div className="mt-1 rounded-lg bg-paper-dim p-3 text-xs">
                <p className="text-ink-faint">Last paid period</p>
                <p className="font-medium text-ink">{lastPaidPeriod.periodLabel}</p>
                <p className="text-ink-faint mt-0.5">
                  {new Date(lastPaidPeriod.periodStart).toLocaleDateString('en-IN')} – {new Date(lastPaidPeriod.periodEnd).toLocaleDateString('en-IN')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-line bg-white p-5 space-y-3">
          <p className="text-sm font-semibold text-ink">Contact us to renew</p>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Phone className="size-4 text-crimson-500" />
            <span>+91 — (support number)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Mail className="size-4 text-crimson-500" />
            <span>support@roomport.in</span>
          </div>
          <p className="text-xs text-ink-faint">
            Your registered email: <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <Link to="/dashboard/billing">
            <Button className="w-full justify-center gap-2">
              <CreditCard className="size-4" />
              View billing &amp; payment history
            </Button>
          </Link>
          <Button variant="subtle" className="w-full gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Refresh status
          </Button>
          <Button variant="ghost" onClick={() => logout()} className="w-full text-ink-faint">
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
