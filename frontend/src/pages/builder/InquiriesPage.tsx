import { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AssignTenantFromInquiryModal } from '@/components/tenant/AssignTenantFromInquiryModal';
import { useGetInquiriesQuery, useUpdateInquiryStatusMutation, useDeleteInquiryMutation } from '@/store/api/inquiryApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { timeAgo } from '@/utils/format';
import type { Inquiry, InquiryStatus } from '@/types/platform';

const STATUS_NEXT: Record<string, { label: string; next: InquiryStatus }> = {
  new:       { label: 'Mark contacted', next: 'contacted' },
  contacted: { label: 'Close inquiry',  next: 'closed' },
  closed:    { label: 'Reopen',         next: 'new' },
};

export default function InquiriesPage() {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [tenantInquiry, setTenantInquiry] = useState<Inquiry | null>(null); // drives convert-to-tenant modal

  const { data, isLoading } = useGetInquiriesQuery();
  const { data: buildingsData } = useGetBuildingsQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateInquiryStatusMutation();
  const [deleteInquiry, { isLoading: deleting }] = useDeleteInquiryMutation();

  const buildingMap = new Map((buildingsData?.data ?? []).map(b => [b._id, b]));

  const onStatusChange = async (inq: Inquiry, status: InquiryStatus) => {
    try {
      await updateStatus({ id: inq._id, status }).unwrap();
      toast.success('Status updated.');
      // When closing an inquiry that has a unitId → prompt to convert to tenant
      if (status === 'closed' && inq.unitId) {
        setTenantInquiry(inq);
      }
    } catch { toast.error('Could not update status.'); }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInquiry(deleteTarget).unwrap();
      toast.success('Inquiry deleted.');
      setDeleteTarget(null);
    } catch { toast.error('Could not delete.'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Inquiries</h1>
        <p className="mt-1 text-sm text-ink-soft">Prospective tenant leads from your public listings.</p>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState icon={<MessageSquare className="size-6" />} title="No inquiries yet" description="Publish a building listing and inquiries from interested tenants will appear here." />
        )}
        <div className="divide-y divide-line">
          {data?.data.map(inq => {
            const building = buildingMap.get(inq.buildingId);
            return (
              <div key={inq._id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{inq.name}</p>
                    <StatusPill status={inq.status} />
                  </div>
                  <p className="text-sm text-ink-soft">{inq.email}{inq.phone && ` · ${inq.phone}`}</p>
                  {building && <p className="text-xs text-ink-faint">{building.name}{inq.unitId ? ` · Room requested` : ''}</p>}
                  {inq.message && <p className="mt-1.5 text-sm text-ink-faint line-clamp-2">{inq.message}</p>}
                  <p className="mt-1 text-xs text-ink-faint">{timeAgo(inq.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {STATUS_NEXT[inq.status] && (
                    <Button size="sm" variant="subtle" onClick={() => onStatusChange(inq, STATUS_NEXT[inq.status].next)} disabled={updating}>
                      {STATUS_NEXT[inq.status].label}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(inq._id)}>
                    <Trash2 className="size-4 text-crimson-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting} title="Delete this inquiry?" confirmLabel="Delete" />

      {/* Convert inquiry → tenant modal */}
      {tenantInquiry && (
        <AssignTenantFromInquiryModal
          open={!!tenantInquiry}
          onClose={() => setTenantInquiry(null)}
          inquiry={tenantInquiry}
        />
      )}
    </div>
  );
}
