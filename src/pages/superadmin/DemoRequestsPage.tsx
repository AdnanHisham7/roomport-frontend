import { useState } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare, Mail, Phone, Building2, DoorOpen,
  RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp,
  UserPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button, Select } from '@/components/ui';
import {
  useGetDemoRequestsQuery,
  useUpdateDemoRequestMutation,
  useRegisterBuilderMutation,
  useGetPlatformSettingsQuery,
} from '@/store/api/superAdminApi';
import { formatDate, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { DemoRequest } from '@/types/platform';

const statusStyles: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  converted: 'bg-sage-100 text-sage-700 border-sage-200',
  closed:    'bg-paper-deep text-ink-faint border-line',
};

const statusLabels: Record<string, string> = {
  new: 'New', contacted: 'Contacted', converted: 'Converted', closed: 'Closed',
};

function DemoRequestRow({ req }: { req: DemoRequest }) {
  const [expanded, setExpanded]             = useState(false);
  const [converting, setConverting]         = useState(false);
  const [updateDemo, { isLoading: updating }] = useUpdateDemoRequestMutation();
  const [registerBuilder, { isLoading: registering }] = useRegisterBuilderMutation();
  const { data: settingsData } = useGetPlatformSettingsQuery();
  const pricing = settingsData?.data;

  const estimatedMonthly = pricing
    ? req.numberOfBuildings * pricing.monthlyPricePerBuilding +
      req.numberOfUnits * pricing.monthlyPricePerUnit
    : 0;

  const changeStatus = async (status: string) => {
    try {
      await updateDemo({ id: req._id, status }).unwrap();
      toast.success(`Status updated to "${statusLabels[status]}".`);
    } catch {
      toast.error('Could not update status.');
    }
  };

  const handleConvert = async () => {
    // Auto-register using the demo request data
    try {
      const result = await registerBuilder({
        firstName:         req.firstName,
        lastName:          req.lastName,
        email:             req.email,
        phone:             req.phone,
        billingCycle:      'monthly',
        numberOfBuildings: req.numberOfBuildings,
        numberOfUnits:     req.numberOfUnits,
        amount:            estimatedMonthly,
        notes:             `Converted from demo request. Company: ${req.companyName ?? 'N/A'}`,
      }).unwrap();

      // Also mark demo as converted
      await updateDemo({ id: req._id, status: 'converted', adminNotes: 'Auto-registered via convert button.' }).unwrap();

      toast.success(result.message ?? 'Builder registered & welcome email sent.');
      setConverting(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not register builder.', {
        description: err?.data?.suggestion,
      });
    }
  };

  return (
    <div className="border-b border-line last:border-0">
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        <button
          onClick={() => setExpanded((o) => !o)}
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink">
              {req.firstName} {req.lastName}
            </p>
            {req.companyName && (
              <span className="text-xs text-ink-faint">· {req.companyName}</span>
            )}
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize',
                statusStyles[req.status] ?? 'bg-paper-deep text-ink-faint border-line'
              )}
            >
              {statusLabels[req.status] ?? req.status}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="flex items-center gap-1">
              <Mail className="size-3" /> {req.email}
            </span>
            {req.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3" /> {req.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Building2 className="size-3" /> {req.numberOfBuildings} building{req.numberOfBuildings !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <DoorOpen className="size-3" /> {req.numberOfUnits} rooms
            </span>
            <span className="text-ink-faint">Received {formatDate(req.createdAt)}</span>
          </div>

          {req.message && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-soft">
              <MessageSquare className="mt-0.5 size-3 shrink-0" />
              {req.message}
            </p>
          )}
          {req.adminNotes && (
            <p className="mt-1 text-[11px] italic text-ink-faint">
              Admin: {req.adminNotes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {req.status === 'new' && (
            <Button
              size="sm"
              variant="subtle"
              icon={<RefreshCw className="size-3.5" />}
              onClick={() => changeStatus('contacted')}
              disabled={updating}
            >
              Mark contacted
            </Button>
          )}

          {(req.status === 'new' || req.status === 'contacted') && !converting && (
            <Button
              size="sm"
              icon={<UserPlus className="size-3.5" />}
              onClick={() => setConverting(true)}
              disabled={updating || registering}
            >
              Convert & register
            </Button>
          )}

          {req.status !== 'closed' && req.status !== 'converted' && (
            <Button
              size="sm"
              variant="ghost"
              icon={<XCircle className="size-3.5" />}
              onClick={() => changeStatus('closed')}
              disabled={updating}
            >
              Close
            </Button>
          )}

          {req.status === 'converted' && (
            <span className="flex items-center gap-1 text-xs font-medium text-sage-600">
              <CheckCircle className="size-3.5" /> Converted
            </span>
          )}
        </div>
      </div>

      {/* Convert confirmation panel */}
      <AnimatePresence initial={false}>
        {converting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-amber-200 bg-amber-50 px-5 py-4"
          >
            <p className="mb-1 text-sm font-semibold text-amber-900">
              Register builder from this demo request?
            </p>
            <p className="mb-3 text-xs text-amber-800">
              This will create a builder account for <strong>{req.email}</strong> with{' '}
              <strong>{req.numberOfBuildings}</strong> building(s) and{' '}
              <strong>{req.numberOfUnits}</strong> rooms on a <strong>monthly</strong> billing cycle
              at an estimated amount of{' '}
              <strong>{formatCurrency(estimatedMonthly)}/mo</strong>.
              A welcome email with login credentials will be sent automatically.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                loading={registering}
                icon={<CheckCircle className="size-4" />}
                onClick={handleConvert}
              >
                Yes, register builder
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConverting(false)}
                disabled={registering}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && !converting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-line/60 bg-paper-dim/50 px-5 py-3"
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <p className="text-ink-faint">First name</p>
                <p className="font-medium text-ink">{req.firstName}</p>
              </div>
              <div>
                <p className="text-ink-faint">Last name</p>
                <p className="font-medium text-ink">{req.lastName}</p>
              </div>
              <div>
                <p className="text-ink-faint">Email</p>
                <p className="font-medium text-ink">{req.email}</p>
              </div>
              <div>
                <p className="text-ink-faint">Phone</p>
                <p className="font-medium text-ink">{req.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-ink-faint">Company</p>
                <p className="font-medium text-ink">{req.companyName ?? '—'}</p>
              </div>
              <div>
                <p className="text-ink-faint">Buildings</p>
                <p className="font-medium text-ink">{req.numberOfBuildings}</p>
              </div>
              <div>
                <p className="text-ink-faint">Rooms</p>
                <p className="font-medium text-ink">{req.numberOfUnits}</p>
              </div>
              <div>
                <p className="text-ink-faint">Est. monthly</p>
                <p className="font-mono font-semibold text-ink">
                  {formatCurrency(estimatedMonthly)}
                </p>
              </div>
            </div>
            {req.message && (
              <div className="mt-2">
                <p className="text-ink-faint text-xs">Message</p>
                <p className="mt-0.5 text-xs text-ink-soft">{req.message}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DemoRequestsPage() {
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useGetDemoRequestsQuery({
    status: status || undefined,
    page,
    limit:  20,
  });

  const counts = {
    new:       (data?.data ?? []).filter((r) => r.status === 'new').length,
    contacted: (data?.data ?? []).filter((r) => r.status === 'contacted').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Demo Requests</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Incoming enquiries from <code className="rounded bg-paper-deep px-1 text-xs">/get-started</code>.
          Convert them directly into builder accounts.
        </p>
      </div>

      {/* Quick stats */}
      {data && (counts.new > 0 || counts.contacted > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {counts.new > 0 && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {counts.new} new
            </span>
          )}
          {counts.contacted > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {counts.contacted} contacted
            </span>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '',          label: 'All statuses' },
            { value: 'new',       label: 'New' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'converted', label: 'Converted' },
            { value: 'closed',    label: 'Closed' },
          ]}
          className="w-44"
        />
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {!isLoading && !data?.data.length && (
          <EmptyState
            icon={<MessageSquare className="size-6" />}
            title="No demo requests yet"
            description={
              status
                ? `No requests with status "${statusLabels[status] ?? status}".`
                : 'When visitors submit the form on /get-started they will appear here.'
            }
          />
        )}

        {data?.data.map((req) => (
          <DemoRequestRow key={req._id} req={req} />
        ))}
      </Card>

      {data && data.totalPages > 1 && (
        <div className="mt-5">
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
