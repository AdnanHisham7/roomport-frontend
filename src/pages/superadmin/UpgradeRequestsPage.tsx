import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpCircle, Check, X, ChevronDown, ChevronUp,
  Building2, DoorOpen, MessageSquare, Clock, User,
  IndianRupee, Info, Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, Input } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import {
  useGetUpgradeRequestsQuery,
  useResolveUpgradeRequestMutation,
  useGetBuilderDetailQuery,
  type UpgradeRequest,
} from '@/store/api/superAdminApi';
import { useGetPlatformSettingsQuery } from '@/store/api/superAdminApi';
import { timeAgo, formatDate, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { PlatformSetting } from '@/types/platform';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  approved:  'bg-sage-50 text-sage-700 border-sage-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

function getBuilderInfo(req: UpgradeRequest) {
  if (typeof req.userId === 'object' && req.userId !== null) {
    return {
      _id:   req.userId._id,
      name:  `${req.userId.first_name} ${req.userId.last_name}`,
      email: req.userId.email,
      phone: req.userId.phone_number,
    };
  }
  return { _id: req.userId as string, name: 'Unknown builder', email: '', phone: '' };
}

function computeFullAmount(
  buildings: number,
  units: number,
  cycle: string,
  pricing: PlatformSetting
): number {
  if (cycle === 'yearly') {
    return buildings * (pricing.yearlyPricePerBuilding ?? pricing.pricePerBuilding) +
           units     * (pricing.yearlyPricePerUnit     ?? pricing.pricePerUnit);
  }
  return buildings * (pricing.monthlyPricePerBuilding ?? pricing.pricePerBuilding) +
         units     * (pricing.monthlyPricePerUnit     ?? pricing.pricePerUnit);
}

function computeProRatedAmount(
  deltaBuildings: number,
  deltaUnits:     number,
  cycle:          string,
  pricing:        PlatformSetting,
  today:          Date,
  periodEnd:      Date
): number {
  const fullDelta = computeFullAmount(deltaBuildings, deltaUnits, cycle, pricing);
  const totalDays = cycle === 'yearly' ? 365 : 30;
  const msInDay   = 1000 * 60 * 60 * 24;
  const remaining = Math.max(1, Math.round((periodEnd.getTime() - today.getTime()) / msInDay));
  return Math.round(fullDelta * (remaining / totalDays));
}

interface ResolveModalProps {
  request: UpgradeRequest;
  onClose: () => void;
  onDone:  () => void;
}

function ResolveModal({ request, onClose, onDone }: ResolveModalProps) {
  const builder = getBuilderInfo(request);

  const { data: settingsData } = useGetPlatformSettingsQuery();
  const { data: builderData }  = useGetBuilderDetailQuery(builder._id, { skip: !builder._id });

  const pricing   = settingsData?.data;
  const sub       = builderData?.data?.subscription;
  const billingCycle = sub?.billingCycle ?? 'monthly';

  const existingBuildings = sub?.numberOfBuildings ?? 0;
  const existingUnits     = sub?.numberOfUnits     ?? 0;
  const addBuildings      = request.additionalBuildings ?? 0;
  const addUnits          = request.additionalUnits     ?? 0;

  // Pre-fill: existing + requested additional
  const [newTotalBuildings, setNewTotalBuildings] = useState(existingBuildings + addBuildings);
  const [newTotalUnits, setNewTotalUnits]         = useState(existingUnits + addUnits);
  const [action, setAction]                       = useState<'approved' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes]               = useState('');
  const [resolve, { isLoading }]                  = useResolveUpgradeRequestMutation();

  // Keep totals in sync if builder data loads after mount
  useEffect(() => {
    if (sub) {
      setNewTotalBuildings(sub.numberOfBuildings + addBuildings);
      setNewTotalUnits(sub.numberOfUnits + addUnits);
    }
  }, [sub, addBuildings, addUnits]);

  // ── Amount calculations ──────────────────────────────────────────────────
  const newFullAmount = pricing
    ? computeFullAmount(newTotalBuildings, newTotalUnits, billingCycle, pricing)
    : null;

  const deltaBuildings = Math.max(0, newTotalBuildings - existingBuildings);
  const deltaUnits     = Math.max(0, newTotalUnits     - existingUnits);

  // Find the currently active paid period (covers today)
  const today          = new Date();
  const activePeriod   = sub?.periods?.find(p =>
    p.status === 'paid' &&
    new Date(p.periodStart) <= today &&
    new Date(p.periodEnd)   >= today
  );

  const deltaAmount = (pricing && activePeriod && (deltaBuildings > 0 || deltaUnits > 0))
    ? computeProRatedAmount(deltaBuildings, deltaUnits, billingCycle, pricing, today, new Date(activePeriod.periodEnd))
    : null;

  const handleSubmit = async () => {
    if (!action) return;

    if (action === 'approved') {
      if (newTotalBuildings < 1) { toast.error('Total buildings must be at least 1.'); return; }
      if (newTotalUnits     < 1) { toast.error('Total units must be at least 1.'); return; }
      if (newTotalBuildings < existingBuildings) {
        toast.error('New total buildings cannot be less than existing count.');
        return;
      }
      if (newTotalUnits < existingUnits) {
        toast.error('New total units cannot be less than existing count.');
        return;
      }
    }

    try {
      const result = await resolve({
        id:               request._id,
        status:           action,
        adminNotes:       adminNotes || undefined,
        newTotalBuildings: action === 'approved' ? newTotalBuildings : undefined,
        newTotalUnits:    action === 'approved' ? newTotalUnits     : undefined,
      }).unwrap();

      if (result.deltaAmount && result.deltaAmount > 0) {
        toast.success(result.message, {
          description: `Delta top-up period created: ${result.deltaLabel} — ₹${result.deltaAmount}. Next full period: ₹${result.newFullAmount}.`,
          duration: 8000,
        });
      } else {
        toast.success(result.message);
      }
      onDone();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to resolve request.');
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Resolve Upgrade Request">
      <div className="space-y-5">

        {/* Builder & request summary */}
        <div className="rounded-xl bg-paper-dim p-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 text-ink-faint shrink-0" />
            <div>
              <p className="font-medium text-ink">{builder.name}</p>
              <p className="text-xs text-ink-faint">{builder.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-white p-2.5 text-center">
              <p className="text-[10px] text-ink-faint uppercase tracking-wide">Current bldgs</p>
              <p className="mt-0.5 text-lg font-bold text-ink">{existingBuildings}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-2.5 text-center">
              <p className="text-[10px] text-ink-faint uppercase tracking-wide">Current units</p>
              <p className="mt-0.5 text-lg font-bold text-ink">{existingUnits}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-center">
              <p className="text-[10px] text-amber-600 uppercase tracking-wide">Requested</p>
              <p className="mt-0.5 text-xs font-semibold text-amber-700">
                +{addBuildings} bldg / +{addUnits} units
              </p>
            </div>
          </div>
          {request.message && (
            <div className="flex gap-2 text-xs text-ink-soft italic">
              <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
              "{request.message}"
            </div>
          )}
        </div>

        {/* Decision */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Decision <span className="text-crimson-500">*</span></p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAction('approved')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition',
                action === 'approved'
                  ? 'border-sage-400 bg-sage-50 text-sage-700'
                  : 'border-line text-ink-soft hover:border-sage-300 hover:bg-sage-50/50'
              )}
            >
              <Check className="size-4" /> Approve
            </button>
            <button
              onClick={() => setAction('rejected')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition',
                action === 'rejected'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-line text-ink-soft hover:border-red-300 hover:bg-red-50/50'
              )}
            >
              <X className="size-4" /> Reject
            </button>
          </div>
        </div>

        {/* Approve: subscription fields */}
        {action === 'approved' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden space-y-4"
          >
            <div>
              <p className="text-sm font-medium text-ink mb-3">
                New subscription totals <span className="text-crimson-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-faint">
                    Total buildings (new)
                  </label>
                  <Input
                    type="number"
                    min={Math.max(1, existingBuildings)}
                    value={newTotalBuildings}
                    onChange={e => setNewTotalBuildings(Math.max(existingBuildings, Number(e.target.value)))}
                  />
                  {addBuildings > 0 && (
                    <p className="mt-1 text-[10px] text-ink-faint">
                      Pre-filled: {existingBuildings} existing + {addBuildings} requested
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-faint">
                    Total units (new)
                  </label>
                  <Input
                    type="number"
                    min={Math.max(1, existingUnits)}
                    value={newTotalUnits}
                    onChange={e => setNewTotalUnits(Math.max(existingUnits, Number(e.target.value)))}
                  />
                  {addUnits > 0 && (
                    <p className="mt-1 text-[10px] text-ink-faint">
                      Pre-filled: {existingUnits} existing + {addUnits} requested
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-computed amount breakdown */}
            {pricing && newFullAmount !== null && (
              <div className="rounded-xl border border-line bg-white divide-y divide-line/60">
                {/* New full-period amount */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-ink">
                    <IndianRupee className="size-4 text-sage-500" />
                    <span>New full period amount</span>
                    <span className="rounded-full bg-paper-dim px-2 py-0.5 text-[10px] text-ink-faint capitalize">
                      {billingCycle}
                    </span>
                  </div>
                  <span className="font-semibold text-ink">{formatCurrency(newFullAmount)}</span>
                </div>

                {/* Delta top-up (if active paid period exists and there's a delta) */}
                {activePeriod && (deltaBuildings > 0 || deltaUnits > 0) && deltaAmount !== null && (
                  <div className="px-4 py-3 bg-amber-50/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="mt-0.5 size-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-medium text-amber-700">Pro-rated top-up for current period</p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Today → {formatDate(activePeriod.periodEnd)}
                            {' · '}+{deltaBuildings} buildings, +{deltaUnits} units
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-amber-700 shrink-0">{formatCurrency(deltaAmount)}</span>
                    </div>
                    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-600">
                      <Info className="mt-0.5 size-3 shrink-0" />
                      Builder already paid for {existingBuildings} bldg + {existingUnits} units until {formatDate(activePeriod.periodEnd)}. Only the delta ({deltaBuildings} bldg + {deltaUnits} units) is charged for the remaining days.
                    </div>
                  </div>
                )}

                {/* No current paid period */}
                {!activePeriod && (
                  <div className="px-4 py-3 bg-blue-50/40">
                    <div className="flex items-start gap-2 text-xs text-blue-700">
                      <Info className="mt-0.5 size-3.5 shrink-0" />
                      No active paid period covering today. A fresh period starting today at {formatCurrency(newFullAmount)} will be created as pending.
                    </div>
                  </div>
                )}

                <div className="px-4 py-2.5">
                  <p className="text-[10px] text-ink-faint flex items-center gap-1">
                    <Info className="size-3" />
                    Amounts are auto-calculated from platform pricing config and cannot be changed manually.
                  </p>
                </div>
              </div>
            )}

            {!pricing && (
              <div className="rounded-xl border border-line bg-paper-dim px-4 py-3 text-xs text-ink-faint">
                Loading pricing configuration…
              </div>
            )}
          </motion.div>
        )}

        {/* Admin notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Admin note{' '}
            <span className="text-ink-faint font-normal">
              (sent to builder{action === 'rejected' ? ' as rejection reason' : ''})
            </span>
          </label>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={3}
            placeholder={
              action === 'rejected'
                ? 'Reason for rejection...'
                : action === 'approved'
                ? 'Any notes for the builder (optional)...'
                : 'Select a decision first...'
            }
            disabled={!action}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-crimson-300 focus:outline-none focus:ring-1 focus:ring-crimson-200 disabled:bg-paper-dim disabled:text-ink-faint"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!action || isLoading || (action === 'approved' && !pricing)}
          >
            {isLoading
              ? 'Saving…'
              : action === 'approved'
              ? 'Approve & apply'
              : action === 'rejected'
              ? 'Reject request'
              : 'Select decision'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RequestCard({ req }: { req: UpgradeRequest }) {
  const [expanded, setExpanded]   = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const builder  = getBuilderInfo(req);
  const isPending = req.status === 'pending';

  return (
    <>
      <div className="border-b border-line last:border-0">
        <button
          className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left hover:bg-paper-dim/40 transition-colors sm:px-5"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ArrowUpCircle className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink text-sm">{builder.name}</p>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                    STATUS_STYLES[req.status] ?? 'bg-paper-dim text-ink-faint border-line'
                  )}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-ink-faint mt-0.5">{builder.email}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                {(req.additionalBuildings ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3" /> +{req.additionalBuildings} buildings
                  </span>
                )}
                {(req.additionalUnits ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <DoorOpen className="size-3" /> +{req.additionalUnits} units
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {timeAgo(req.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isPending && (
              <Button
                size="sm"
                onClick={e => { e.stopPropagation(); setResolveOpen(true); }}
                className="text-xs"
              >
                Resolve
              </Button>
            )}
            {expanded
              ? <ChevronUp className="size-4 text-ink-faint" />
              : <ChevronDown className="size-4 text-ink-faint" />
            }
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line/50 bg-paper-dim/30"
            >
              <div className="px-4 py-3 sm:px-5 space-y-3">
                {req.message && (
                  <div className="flex gap-2 text-sm text-ink-soft">
                    <MessageSquare className="size-4 mt-0.5 shrink-0 text-ink-faint" />
                    <p>"{req.message}"</p>
                  </div>
                )}
                {req.additionalBuildingData && req.additionalBuildingData.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-ink-faint mb-1.5">Requested buildings</p>
                    <div className="flex flex-wrap gap-2">
                      {req.additionalBuildingData.map((b, i) => (
                        <span key={i} className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs text-ink">
                          {b.name} · {b.rooms} rooms
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-ink-faint">Submitted</p>
                    <p className="text-ink">{req.createdAt ? formatDate(req.createdAt) : '—'}</p>
                  </div>
                  {req.resolvedAt && (
                    <div>
                      <p className="text-ink-faint">Resolved</p>
                      <p className="text-ink">{formatDate(req.resolvedAt)}</p>
                    </div>
                  )}
                  {req.subscriptionId && (
                    <div>
                      <p className="text-ink-faint">Subscription ID</p>
                      <p className="font-mono text-ink text-[10px] break-all">{req.subscriptionId}</p>
                    </div>
                  )}
                </div>
                {req.adminNotes && (
                  <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs">
                    <p className="text-ink-faint mb-0.5">Admin note</p>
                    <p className="text-ink-soft">{req.adminNotes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {resolveOpen && (
        <ResolveModal
          request={req}
          onClose={() => setResolveOpen(false)}
          onDone={() => setResolveOpen(false)}
        />
      )}
    </>
  );
}

export default function UpgradeRequestsPage() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const limit = 20;

  const { data, isLoading } = useGetUpgradeRequestsQuery(
    { status: status || undefined, page, limit },
    { pollingInterval: 30000 }
  );

  const pendingCount = data?.data.filter(r => r.status === 'pending').length ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Upgrade Requests</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Review and action subscription upgrade / renewal requests from builders.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-crimson-300"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState
            icon={<ArrowUpCircle className="size-6" />}
            title="No upgrade requests"
            description={
              status
                ? `No ${status} requests found.`
                : 'Upgrade and renewal requests from builders will appear here.'
            }
          />
        )}
        <div>
          {data?.data.map(req => <RequestCard key={req._id} req={req} />)}
        </div>
      </Card>

      {data && (data.totalPages ?? 1) > 1 && (
        <div className="mt-5">
          <Pagination page={page} totalPages={data.totalPages ?? 1} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
