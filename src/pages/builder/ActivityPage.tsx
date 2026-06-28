import { useState } from 'react';
import { History, ChevronLeft, ChevronRight, User, Building2, Hash } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useGetActivityLogsQuery } from '@/store/api/activityLogApi';
import { timeAgo, titleCase } from '@/utils/format';
import type { ActivityLog } from '@/types/activity';

const ACTION_COLORS: Record<string, string> = {
  tenant_created:          'bg-sage-50 text-sage-600',
  tenant_updated:          'bg-blue-50 text-blue-600',
  tenant_deleted:          'bg-red-50 text-red-600',
  tenant_status_changed:   'bg-amber-50 text-amber-600',
  tenant_transferred:      'bg-purple-50 text-purple-600',
  building_created:        'bg-sage-50 text-sage-600',
  building_updated:        'bg-blue-50 text-blue-600',
  building_deleted:        'bg-red-50 text-red-600',
  building_published:      'bg-sage-50 text-sage-600',
  building_unpublished:    'bg-amber-50 text-amber-600',
  room_created:            'bg-sage-50 text-sage-600',
  room_updated:            'bg-blue-50 text-blue-600',
  room_deleted:            'bg-red-50 text-red-600',
  room_status_changed:     'bg-amber-50 text-amber-600',
  rent_payment_created:    'bg-sage-50 text-sage-600',
  rent_payment_completed:  'bg-sage-50 text-sage-600',
  payment_recorded:        'bg-sage-50 text-sage-600',
  payment_updated:         'bg-blue-50 text-blue-600',
  payment_deleted:         'bg-red-50 text-red-600',
  document_uploaded:       'bg-blue-50 text-blue-600',
  document_deleted:        'bg-red-50 text-red-600',
  lease_created:           'bg-sage-50 text-sage-600',
  lease_signed:            'bg-sage-50 text-sage-600',
  lease_terminated:        'bg-red-50 text-red-600',
  user_login:              'bg-paper-dim text-ink-soft',
  user_logout:             'bg-paper-dim text-ink-soft',
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
                {actorName}{actorRole ? ` · ${titleCase(actorRole)}` : ''}
              </span>
              <span>{timeAgo(log.createdAt)}</span>
            </div>
          </div>
        </div>
        <span className="mt-1 shrink-0 text-xs text-ink-faint">{new Date(log.createdAt ?? '').toLocaleDateString('en-IN')}</span>
      </button>

      {expanded && (
        <div className="border-t border-line/50 bg-paper-dim/40 px-4 py-3 sm:px-5">
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="flex items-center gap-1.5 text-ink-faint">
              <Hash className="size-3 shrink-0" />
              <span className="font-mono text-ink-soft break-all">Activity ID: {log._id}</span>
            </div>
            {log.entityId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <Hash className="size-3 shrink-0" />
                <span className="font-mono text-ink-soft break-all">Entity ID: {log.entityId}</span>
              </div>
            )}
            {log.buildingId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <Building2 className="size-3 shrink-0" />
                <span className="font-mono text-ink-soft break-all">Building: {log.buildingId}</span>
              </div>
            )}
            {log.unitId && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <span>Room: <span className="font-mono text-ink-soft">{log.unitId}</span></span>
              </div>
            )}
            {log.user && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <User className="size-3 shrink-0" />
                <span>By: <span className="text-ink-soft">{log.user.email}</span></span>
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

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const limit = 25;
  const { data, isLoading } = useGetActivityLogsQuery({ page, limit, action: action || undefined });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Activity Log</h1>
          <p className="mt-1 text-sm text-ink-soft">Detailed audit trail for all actions on your buildings.</p>
        </div>
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-crimson-300"
        >
          <option value="">All actions</option>
          <option value="tenant_created">Tenant created</option>
          <option value="tenant_updated">Tenant updated</option>
          <option value="tenant_deleted">Tenant deleted</option>
          <option value="tenant_status_changed">Tenant status changed</option>
          <option value="tenant_transferred">Tenant transferred</option>
          <option value="building_created">Building created</option>
          <option value="building_updated">Building updated</option>
          <option value="room_created">Room created</option>
          <option value="room_updated">Room updated</option>
          <option value="rent_payment_created">Rent payment created</option>
          <option value="payment_updated">Payment updated</option>
          <option value="document_uploaded">Document uploaded</option>
          <option value="document_deleted">Document deleted</option>
          <option value="lease_created">Lease created</option>
          <option value="lease_signed">Lease signed</option>
        </select>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState
            icon={<History className="size-6" />}
            title="No activity yet"
            description={action ? 'No logs match the selected filter.' : 'Actions taken on your buildings will appear here.'}
          />
        )}
        <div>
          {data?.data.map(log => <LogRow key={log._id} log={log} />)}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40 hover:bg-paper-dim"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs text-ink-faint">
              Page {page} of {totalPages} · {data?.total ?? 0} total
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40 hover:bg-paper-dim"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
