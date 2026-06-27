import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, UserCog, CreditCard,
  CheckCircle2, RefreshCw, X, Check, ShieldOff, ShieldCheck, Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar, PageLoader } from '@/components/ui/Avatar';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  useGetBuilderDetailQuery,
  useUpdateBuilderStatusMutation,
  useDeleteBuilderMutation,
  useMarkPeriodPaidMutation,
} from '@/store/api/superAdminApi';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { SubscriptionPeriod } from '@/types/platform';

const periodBadge: Record<string, string> = {
  paid:    'bg-sage-100 text-sage-700 border-sage-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  overdue: 'bg-crimson-100 text-crimson-700 border-crimson-200',
};

function PeriodRow({ period }: { period: SubscriptionPeriod }) {
  const [noteOpen, setNoteOpen]               = useState(false);
  const [note, setNote]                       = useState('');
  const [markPaid, { isLoading: markingPaid }] = useMarkPeriodPaidMutation();

  const handleMarkPaid = async () => {
    try {
      const result = await markPaid({
        periodId: period._id,
        paidAt:   new Date().toISOString(),
        notes:    note || undefined,
      }).unwrap();
      toast.success(result.message ?? `Period "${period.periodLabel}" marked as paid.`);
      setNoteOpen(false);
      setNote('');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not mark period as paid.', {
        description: err?.data?.suggestion,
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 py-3 last:border-0">
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

      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-sm font-semibold text-ink">
          {formatCurrency(period.amount)}
        </span>

        {period.status !== 'paid' && (
          noteOpen ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                autoFocus
                className="w-28 rounded-lg border border-line bg-white px-2 py-1 text-xs focus:border-crimson-400 focus:outline-none"
              />
              <button
                onClick={handleMarkPaid}
                disabled={markingPaid}
                title="Confirm"
                className="flex size-7 items-center justify-center rounded-lg bg-sage-500 text-white hover:bg-sage-600 disabled:opacity-60"
              >
                {markingPaid
                  ? <RefreshCw className="size-3.5 animate-spin" />
                  : <CheckCircle2 className="size-3.5" />
                }
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
          )
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

export default function BuilderDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading }                    = useGetBuilderDetailQuery(id!, { skip: !id });
  const [updateStatus, { isLoading: toggling }] = useUpdateBuilderStatusMutation();
  const [deleteBuilder, { isLoading: deleting }] = useDeleteBuilderMutation();

  if (isLoading) return <PageLoader />;
  const b = data?.data;
  if (!b) return <p className="py-10 text-center text-ink-soft">Builder not found.</p>;

  const handleToggle = async () => {
    const next = b.status === 'active' ? 'suspended' : 'active';
    try {
      await updateStatus({ id: b._id, status: next }).unwrap();
      toast.success(`Builder ${next === 'active' ? 'activated' : 'suspended'}.`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update status.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBuilder(b._id).unwrap();
      toast.success('Builder account deleted.');
      navigate('/super-admin/builders');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not delete builder.', {
        description: err?.data?.suggestion,
      });
    }
  };

  const sub     = b.subscription;
  const periods = sub?.periods ?? [];
  const pendingPeriods = periods.filter((p) => p.status === 'pending');

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/super-admin/builders')}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Builders
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar firstName={b.first_name} lastName={b.last_name} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {b.first_name} {b.last_name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              {b.email}
              {b.phone_number && ` · ${b.phone_number}`}
              {' · '}Joined {formatDate(b.createdAt)}
            </p>
          </div>
          <StatusPill status={b.status} />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={b.status === 'active' ? 'danger' : 'subtle'}
            icon={b.status === 'active'
              ? <ShieldOff className="size-3.5" />
              : <ShieldCheck className="size-3.5" />
            }
            onClick={handleToggle}
            loading={toggling}
          >
            {b.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="size-3.5 text-crimson-500" />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Buildings */}
          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
              <Building2 className="size-4 text-crimson-500" />
              Buildings ({b.buildings.length})
            </h3>
            {!b.buildings.length ? (
              <p className="text-xs text-ink-faint">No buildings yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {b.buildings.map((bl) => (
                  <div
                    key={bl._id}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{bl.name}</p>
                      <p className="text-xs text-ink-faint">
                        {bl.totalFloors} floor{bl.totalFloors !== 1 ? 's' : ''} ·{' '}
                        {bl.totalUnits} room{bl.totalUnits !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={bl.status} />
                      {bl.isPublished && (
                        <span className="text-xs font-medium text-sage-500">Live</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Managers */}
          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
              <UserCog className="size-4 text-crimson-500" />
              Managers ({b.managers.length})
            </h3>
            {!b.managers.length ? (
              <p className="text-xs text-ink-faint">No managers.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {b.managers.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={m.first_name} lastName={m.last_name} size="xs" />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {m.first_name} {m.last_name}
                        </p>
                        <p className="text-xs text-ink-faint">{m.email}</p>
                      </div>
                    </div>
                    <StatusPill status={m.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Subscription summary */}
          <Card padding="lg">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
              <CreditCard className="size-4 text-crimson-500" />
              Subscription
            </h3>
            {!sub ? (
              <p className="text-xs text-ink-faint">No subscription created yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-faint">Status</span>
                  <StatusPill status={sub.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Cycle</span>
                  <span className="capitalize font-medium text-ink">{sub.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Amount</span>
                  <span className="font-mono font-semibold text-ink">
                    {formatCurrency(sub.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Buildings</span>
                  <span>{sub.numberOfBuildings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Rooms</span>
                  <span>{sub.numberOfUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-faint">Period ends</span>
                  <span>{formatDate(sub.currentPeriodEnd)}</span>
                </div>
                {pendingPeriods.length > 0 && (
                  <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {pendingPeriods.length} period{pendingPeriods.length !== 1 ? 's' : ''} awaiting payment
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Billing periods */}
          {periods.length > 0 && (
            <Card padding="lg">
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">
                Billing periods
              </h3>
              <div className="divide-y divide-line/60">
                {periods.map((p) => (
                  <PeriodRow key={p._id} period={p} />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${b.first_name} ${b.last_name}?`}
        description="This will permanently delete the builder account, all their buildings and rooms. All tenants must be vacated first. This action cannot be undone."
        confirmLabel="Delete builder"
        variant="danger"
      />
    </div>
  );
}
