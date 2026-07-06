import { useState } from 'react';
import { History, User, Building2, Hash, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useGetSuperAdminActivityLogsQuery } from '@/store/api/superAdminApi';
import { timeAgo, titleCase } from '@/utils/format';
import type { ActivityLog } from '@/types/activity';

const ACTION_COLORS: Record<string, string> = {
  tenant_created:          'bg-sage-50 text-sage-700',
  tenant_updated:          'bg-blue-50 text-blue-700',
  tenant_deleted:          'bg-red-50 text-red-700',
  tenant_status_changed:   'bg-amber-50 text-amber-700',
  building_created:        'bg-sage-50 text-sage-700',
  building_updated:        'bg-blue-50 text-blue-700',
  building_deleted:        'bg-red-50 text-red-700',
  subscription_created:    'bg-purple-50 text-purple-700',
  subscription_upgraded:   'bg-purple-50 text-purple-700',
  subscription_expired:    'bg-red-50 text-red-700',
  subscription_period_paid:'bg-sage-50 text-sage-700',
  builder_registered:      'bg-sage-50 text-sage-700',
  builder_status_changed:  'bg-amber-50 text-amber-700',
  builder_deleted:         'bg-red-50 text-red-700',
  upgrade_request_received:'bg-amber-50 text-amber-700',
  demo_request_received:   'bg-blue-50 text-blue-700',
  rent_payment_created:    'bg-sage-50 text-sage-700',
  payment_updated:         'bg-blue-50 text-blue-700',
  document_uploaded:       'bg-blue-50 text-blue-700',
  document_deleted:        'bg-red-50 text-red-700',
  user_login:              'bg-paper-dim text-ink-soft',
};

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? 'bg-paper-dim text-ink-soft';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {titleCase(action.replace(/_/g, ' '))}
    </span>
  );
}

function LogRow({ log }: { log: ActivityLog }) {
  const [expanded, setExpanded] = useState(false);
  const actorName = log.user
    ? `${log.user.first_name} ${log.user.last_name}`
    : 'System';
  const actorRole = log.user?.role;

  return (
    <div className="border-b border-line last:border-0">
      <button
        className="flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left hover:bg-paper-dim/50 transition-colors sm:px-5"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-500">
            <History className="size-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ActionBadge action={log.action} />
              {log.entityType && (
                <span className="text-xs text-ink-faint capitalize">{log.entityType}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink leading-snug">
              {log.description ?? titleCase(log.action.replace(/_/g, ' '))}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
              <span className="flex items-center gap-1">
                <User className="size-3" />
                {actorName}
                {actorRole ? ` · ${titleCase(actorRole.replace(/_/g, ' '))}` : ''}
              </span>
              <span>{timeAgo(log.createdAt)}</span>
            </div>
          </div>
        </div>
        <span className="mt-1 shrink-0 text-xs text-ink-faint whitespace-nowrap">
          {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-line/50 bg-paper-dim/40 px-4 py-3 sm:px-5">
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="col-span-full flex items-center gap-1.5 text-ink-faint">
              <Hash className="size-3 shrink-0" />
              <span>Activity ID: <span className="font-mono text-ink-soft break-all">{log._id}</span></span>
            </div>
            {log.entityId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <Hash className="size-3 shrink-0" />
                <span>Entity ID: <span className="font-mono text-ink-soft break-all">{log.entityId}</span></span>
              </div>
            )}
            {log.buildingId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <Building2 className="size-3 shrink-0" />
                <span>Building ID: <span className="font-mono text-ink-soft">{log.buildingId}</span></span>
              </div>
            )}
            {log.unitId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <span>Unit ID: <span className="font-mono text-ink-soft">{log.unitId}</span></span>
              </div>
            )}
            {log.user && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <User className="size-3 shrink-0" />
                <span>User: <span className="text-ink-soft">{log.user.email}</span></span>
              </div>
            )}
            {log.ipAddress && (
              <div className="text-ink-faint">
                IP: <span className="font-mono text-ink-soft">{log.ipAddress}</span>
              </div>
            )}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="col-span-full mt-1">
                <p className="text-ink-faint mb-1">Metadata</p>
                <pre className="rounded-lg bg-white border border-line px-3 py-2 text-[10px] font-mono text-ink-soft overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'tenant_created', label: 'Tenant created' },
  { value: 'tenant_updated', label: 'Tenant updated' },
  { value: 'tenant_deleted', label: 'Tenant deleted' },
  { value: 'tenant_status_changed', label: 'Tenant status changed' },
  { value: 'building_created', label: 'Building created' },
  { value: 'building_updated', label: 'Building updated' },
  { value: 'building_deleted', label: 'Building deleted' },
  { value: 'subscription_created', label: 'Subscription created' },
  { value: 'subscription_upgraded', label: 'Subscription upgraded' },
  { value: 'subscription_period_paid', label: 'Period paid' },
  { value: 'subscription_expired', label: 'Subscription expired' },
  { value: 'builder_registered', label: 'Builder registered' },
  { value: 'builder_status_changed', label: 'Builder status changed' },
  { value: 'upgrade_request_received', label: 'Upgrade request' },
  { value: 'demo_request_received', label: 'Demo request' },
  { value: 'rent_payment_created', label: 'Rent payment created' },
  { value: 'document_uploaded', label: 'Document uploaded' },
  { value: 'user_login', label: 'User login' },
];

export default function ActivityLogsPage() {
  const [page, setPage]     = useState(1);
  const [action, setAction] = useState('');
  const limit = 30;

  const { data, isLoading } = useGetSuperAdminActivityLogsQuery({
    page,
    limit,
    action: action || undefined,
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Activity Logs</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Platform-wide audit trail — click any row for full details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-ink-faint" />
          <select
            value={action}
            onChange={e => { setAction(e.target.value); setPage(1); }}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-crimson-300"
          >
            {ACTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState
            icon={<History className="size-6" />}
            title="No activity logs"
            description={action ? 'No logs match the selected filter.' : 'Platform activity will appear here.'}
          />
        )}
        <div>
          {data?.data.map(log => <LogRow key={log._id} log={log} />)}
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
