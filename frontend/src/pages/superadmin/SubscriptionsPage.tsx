import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, ChevronDown, ChevronUp, CheckCircle2,
  Pencil, Check, IndianRupee, RefreshCw, X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import {
  useGetSuperAdminSubscriptionsQuery,
  useUpdateSuperAdminSubscriptionMutation,
  useMarkPeriodPaidMutation,
} from '@/store/api/superAdminApi';
import { formatCurrency, formatDate } from '@/utils/format';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils/cn';
import type { Subscription, SubscriptionPeriod } from '@/types/platform';

// ── Period Status Badge ───────────────────────────────────────────────────────
const periodBadge: Record<string, string> = {
  paid:    'bg-sage-100 text-sage-700 border-sage-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  overdue: 'bg-crimson-100 text-crimson-700 border-crimson-200',
};

// ── Single Period Row ─────────────────────────────────────────────────────────
function PeriodRow({
  period,
  }: {
  period:         SubscriptionPeriod;
  subscriptionId: string;
}) {
  const [markPaid, { isLoading }] = useMarkPeriodPaidMutation();
  const [noteOpen, setNoteOpen]   = useState(false);
  const [note, setNote]           = useState('');

  const handleMarkPaid = async () => {
    try {
      const result = await markPaid({
        periodId: period._id,
        paidAt:   new Date().toISOString(),
        notes:    note || undefined,
      }).unwrap();
      toast.success(result.message ?? `Period "${period.periodLabel}" marked as paid. Next period created.`);
      setNoteOpen(false);
      setNote('');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not mark period as paid.', {
        description: err?.data?.suggestion,
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-3 last:border-0 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{period.periodLabel}</p>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
              periodBadge[period.status] ?? 'bg-paper-deep text-ink-faint border-line'
            )}
          >
            {period.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">
          {formatDate(period.periodStart)} → {formatDate(period.periodEnd)}
          {period.paidAt && ` · Paid ${formatDate(period.paidAt)}`}
        </p>
        {period.notes && (
          <p className="mt-0.5 text-[11px] italic text-ink-faint">{period.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-sm font-semibold text-ink">
          {formatCurrency(period.amount)}
        </span>

        {period.status !== 'paid' && (
          <>
            {noteOpen ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="w-32 rounded-lg border border-line bg-white px-2 py-1 text-xs focus:border-crimson-400 focus:outline-none"
                />
                <button
                  onClick={handleMarkPaid}
                  disabled={isLoading}
                  title="Confirm payment"
                  className="flex size-7 items-center justify-center rounded-lg bg-sage-500 text-white hover:bg-sage-600 disabled:opacity-60"
                >
                  {isLoading ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setNoteOpen(false)}
                  title="Cancel"
                  className="flex size-7 items-center justify-center rounded-lg border border-line text-ink-faint hover:bg-paper-dim"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="subtle"
                icon={<CheckCircle2 className="size-3.5" />}
                onClick={() => setNoteOpen(true)}
              >
                Mark paid
              </Button>
            )}
          </>
        )}

        {period.status === 'paid' && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-sage-600">
            <Check className="size-3" /> Paid
          </span>
        )}
      </div>
    </div>
  );
}

// ── Subscription Row with expandable periods ──────────────────────────────────
function SubscriptionRow({
  sub,
  onEdit,
}: {
  sub:    Subscription & { ownerName?: string; periods?: SubscriptionPeriod[] };
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const periods = sub.periods ?? [];

  const pendingCount = periods.filter((p) => p.status === 'pending').length;
  const overdueCount = periods.filter((p) => p.status === 'overdue').length;

  return (
    <div className="border-b border-line last:border-0">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <button
          onClick={() => setExpanded((o) => !o)}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"
          title={expanded ? 'Collapse periods' : 'Expand periods'}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">{sub.ownerName ?? '—'}</p>
            <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[10px] font-medium capitalize text-ink-soft">
              {sub.billingCycle}
            </span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-crimson-100 px-2 py-0.5 text-[10px] font-semibold text-crimson-700">
                {overdueCount} overdue
              </span>
            )}
            {pendingCount > 0 && overdueCount === 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-faint">
            {sub.numberOfBuildings}B / {sub.numberOfUnits}R ·{' '}
            Current period ends {formatDate(sub.currentPeriodEnd)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-mono text-sm font-semibold text-ink sm:block">
            {formatCurrency(sub.amount)}
          </span>
          <StatusPill status={sub.status} />
          <button
            onClick={onEdit}
            className="flex size-7 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"
            title="Edit subscription"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Periods panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line/60 bg-paper-dim/60"
          >
            {periods.length === 0 ? (
              <p className="px-5 py-3 text-xs text-ink-faint">No periods recorded yet.</p>
            ) : (
              periods.map((p) => (
                <PeriodRow key={p._id} period={p} subscriptionId={sub._id} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Edit modal form ───────────────────────────────────────────────────────────
const statusOptions = [
  { value: 'active',    label: 'Active' },
  { value: 'pending',   label: 'Pending' },
  { value: 'expired',   label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const cycleOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
];

interface EditForm {
  status:            string;
  amount:            number;
  numberOfBuildings: number;
  numberOfUnits:     number;
  billingCycle:      string;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [page,    setPage]    = useState(1);
  const [statusF, setStatusF] = useState('');
  const [editSub, setEditSub] = useState<(Subscription & { ownerName?: string; periods?: SubscriptionPeriod[] }) | null>(null);

  const { data, isLoading } = useGetSuperAdminSubscriptionsQuery({
    page,
    limit: 20,
    status: statusF || undefined,
  });
  const [updateSub, { isLoading: saving }] = useUpdateSuperAdminSubscriptionMutation();

  const { register, handleSubmit, reset } = useForm<EditForm>();

  const openEdit = (s: typeof editSub) => {
    setEditSub(s);
    reset({
      status:            s!.status,
      amount:            s!.amount,
      numberOfBuildings: s!.numberOfBuildings,
      numberOfUnits:     s!.numberOfUnits,
      billingCycle:      s!.billingCycle,
    });
  };

  const onSave = async (values: EditForm) => {
    if (!editSub) return;
    try {
      await updateSub({
        id:   editSub._id,
        body: {
          status:            values.status,
          amount:            Number(values.amount),
          numberOfBuildings: Number(values.numberOfBuildings),
          numberOfUnits:     Number(values.numberOfUnits),
          billingCycle:      values.billingCycle as 'monthly' | 'yearly',
        },
      }).unwrap();
      toast.success('Subscription updated.');
      setEditSub(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update subscription.');
    }
  };

  // summary counts
  const totalPending = (data?.data ?? []).reduce(
    (acc, s) => acc + (s.periods?.filter((p) => p.status === 'pending').length ?? 0),
    0
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Subscriptions</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage billing cycles and mark period payments.
            {totalPending > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {totalPending} period{totalPending !== 1 ? 's' : ''} awaiting payment
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex gap-3">
        <Select
          value={statusF}
          onChange={(e) => { setStatusF(e.target.value); setPage(1); }}
          options={[
            { value: '',          label: 'All statuses' },
            { value: 'active',    label: 'Active' },
            { value: 'pending',   label: 'Pending' },
            { value: 'expired',   label: 'Expired' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          className="w-44"
        />
      </div>

      {/* How-to hint */}
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        <ChevronDown className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Click the <strong>chevron</strong> on any subscription row to expand its billing periods. Use <strong>"Mark paid"</strong> on a pending period to record payment and auto-create the next period.
        </span>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState
            icon={<CreditCard className="size-6" />}
            title="No subscriptions found"
            description="Register a builder to create their first subscription."
          />
        )}
        {data?.data.map((s) => (
          <SubscriptionRow key={s._id} sub={s} onEdit={() => openEdit(s)} />
        ))}
      </Card>

      {data && data.totalPages > 1 && (
        <div className="mt-5">
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={!!editSub}
        onClose={() => setEditSub(null)}
        title="Edit subscription"
        size="sm"
      >
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Select
            label="Status"
            options={statusOptions}
            {...register('status')}
          />
          <Select
            label="Billing cycle"
            options={cycleOptions}
            {...register('billingCycle')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Buildings"
              type="number"
              min={1}
              {...register('numberOfBuildings', { valueAsNumber: true })}
            />
            <Input
              label="Rooms"
              type="number"
              min={1}
              {...register('numberOfUnits', { valueAsNumber: true })}
            />
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            step="1"
            leftIcon={<IndianRupee className="size-4" />}
            {...register('amount', { valueAsNumber: true })}
          />
          <Button
            type="submit"
            loading={saving}
            icon={<Check className="size-4" />}
            className="justify-center"
          >
            Save changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
