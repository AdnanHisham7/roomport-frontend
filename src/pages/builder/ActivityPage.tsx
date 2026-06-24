import { useState } from 'react';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useGetActivityLogsQuery } from '@/store/api/activityLogApi';
import { timeAgo, titleCase } from '@/utils/format';

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, isLoading } = useGetActivityLogsQuery({ page, limit });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Activity Log</h1>
        <p className="mt-1 text-sm text-ink-soft">Audit trail for all actions on your buildings.</p>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState icon={<History className="size-6" />} title="No activity yet" description="Actions taken on your buildings will appear here." />
        )}
        <div className="divide-y divide-line">
          {data?.data.map(log => (
            <div key={log._id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-500">
                  <History className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{titleCase(log.action)}</p>
                  {log.entityType && <p className="text-xs text-ink-faint">{titleCase(log.entityType)}</p>}
                </div>
              </div>
              <span className="shrink-0 text-xs text-ink-faint">{timeAgo(log.createdAt)}</span>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40 hover:bg-paper-dim">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs text-ink-faint">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex size-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40 hover:bg-paper-dim">
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
