import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpCircle, Check, X, ChevronDown, ChevronUp,
  Building2, DoorOpen, MessageSquare, Clock, User,
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
  type UpgradeRequest,
} from '@/store/api/superAdminApi';
import { timeAgo, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  approved:  'bg-sage-50 text-sage-700 border-sage-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

function getBuilderInfo(req: UpgradeRequest) {
  if (typeof req.userId === 'object' && req.userId !== null) {
    return {
      name:  `${req.userId.first_name} ${req.userId.last_name}`,
      email: req.userId.email,
      phone: req.userId.phone_number,
    };
  }
  return { name: 'Unknown builder', email: '', phone: '' };
}

interface ResolveModalProps {
  request:  UpgradeRequest;
  onClose:  () => void;
  onDone:   () => void;
}

function ResolveModal({ request, onClose, onDone }: ResolveModalProps) {
  const builder = getBuilderInfo(request);
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes]           = useState('');
  const [numberOfBuildings, setNBuildings]     = useState('');
  const [numberOfUnits, setNUnits]             = useState('');
  const [amount, setAmount]                    = useState('');
  const [resolve, { isLoading }]               = useResolveUpgradeRequestMutation();

  const handleSubmit = async () => {
    if (!action) return;
    try {
      const result = await resolve({
        id:     request._id,
        status: action,
        adminNotes: adminNotes || undefined,
        numberOfBuildings: action === 'approved' && numberOfBuildings ? Number(numberOfBuildings) : undefined,
        numberOfUnits:     action === 'approved' && numberOfUnits     ? Number(numberOfUnits)     : undefined,
        amount:            action === 'approved' && amount            ? Number(amount)            : undefined,
      }).unwrap();
      toast.success(result.message);
      onDone();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to resolve request.');
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Resolve Upgrade Request">
      <div className="space-y-4">
        <div className="rounded-xl bg-paper-dim p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-medium text-ink">
            <User className="size-4 text-ink-faint" />
            {builder.name}
          </div>
          <p className="text-ink-faint text-xs">{builder.email}</p>
          <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
            <div>
              <p className="text-ink-faint">Additional buildings</p>
              <p className="font-semibold text-ink">+{request.additionalBuildings ?? 0}</p>
            </div>
            <div>
              <p className="text-ink-faint">Additional units</p>
              <p className="font-semibold text-ink">+{request.additionalUnits ?? 0}</p>
            </div>
          </div>
          {request.message && (
            <div className="mt-2 text-xs text-ink-soft italic">
              "{request.message}"
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Decision</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
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
              type="button"
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

        {action === 'approved' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-ink">Apply subscription changes <span className="text-ink-faint font-normal">(optional)</span></p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs text-ink-faint">Buildings</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 5"
                  value={numberOfBuildings}
                  onChange={e => setNBuildings(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-ink-faint">Units</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 50"
                  value={numberOfUnits}
                  onChange={e => setNUnits(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-ink-faint">Amount (₹)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 4999"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-ink-faint">Leave blank to keep the builder's existing subscription values unchanged.</p>
          </motion.div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Admin note <span className="text-ink-faint font-normal">(shown to builder)</span>
          </label>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={3}
            placeholder={action === 'rejected' ? 'Reason for rejection...' : 'Any notes for the builder...'}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-crimson-300 focus:outline-none focus:ring-1 focus:ring-crimson-200"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!action || isLoading}
          >
            {isLoading ? 'Saving…' : action === 'approved' ? 'Approve request' : 'Reject request'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface RequestCardProps {
  req: UpgradeRequest;
  onResolveClick: () => void;
}

function RequestCard({ req, onResolveClick }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const builder = getBuilderInfo(req);
  const isPending = req.status === 'pending';

  return (
    <div className="border-b border-line last:border-0">
      <div
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left hover:bg-paper-dim/40 transition-colors sm:px-5 cursor-pointer"
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
              onClick={e => {
                console.log("clickedd")
                e.stopPropagation();
                onResolveClick();
              }}
              className="text-xs"
            >
              Resolve
            </Button>
          )}
          {expanded ? <ChevronUp className="size-4 text-ink-faint" /> : <ChevronDown className="size-4 text-ink-faint" />}
        </div>
      </div>

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
  );
}

export default function UpgradeRequestsPage() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  // Track the currently selected request for resolution globally at the page layer
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  
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
            description={status ? `No ${status} requests found.` : 'Upgrade and renewal requests from builders will appear here.'}
          />
        )}
        <div>
          {data?.data.map(req => (
            <RequestCard 
              key={req._id} 
              req={req} 
              onResolveClick={() => setSelectedRequest(req)} 
            />
          ))}
        </div>
      </Card>

      {data && (data.totalPages ?? 1) > 1 && (
        <div className="mt-5">
          <Pagination page={page} totalPages={data.totalPages ?? 1} onChange={setPage} />
        </div>
      )}

      {/* Renders safely outside the loop grid to survive re-queries */}
      {selectedRequest && (
        <ResolveModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDone={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}