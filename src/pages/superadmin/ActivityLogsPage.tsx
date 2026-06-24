import { useState } from 'react';
import { History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useGetSuperAdminActivityLogsQuery } from '@/store/api/superAdminApi';
import { timeAgo, titleCase } from '@/utils/format';

export default function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 30;
  const { data, isLoading } = useGetSuperAdminActivityLogsQuery({ page, limit });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Activity Logs</h1>
        <p className="mt-1 text-sm text-ink-soft">Platform-wide audit trail.</p>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && <EmptyState icon={<History className="size-6" />} title="No activity" />}
        <div className="divide-y divide-line">
          {data?.data.map(log => (
            <div key={log._id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-crimson-50 text-crimson-500">
                  <History className="size-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{titleCase(log.action)}</p>
                  {log.entityType && <p className="text-xs text-ink-faint">{titleCase(log.entityType)}</p>}
                </div>
              </div>
              <span className="shrink-0 text-xs text-ink-faint">{timeAgo(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </Card>

      {data && data.totalPages > 1 && <div className="mt-5"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>}
    </div>
  );
}
