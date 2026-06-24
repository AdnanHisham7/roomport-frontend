import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Pencil, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { useGetSuperAdminSubscriptionsQuery, useUpdateSuperAdminSubscriptionMutation } from '@/store/api/superAdminApi';
import { formatCurrency, formatDate } from '@/utils/format';
import { useForm } from 'react-hook-form';
import type { Subscription } from '@/types/platform';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [editSub, setEditSub] = useState<(Subscription & { ownerName?: string }) | null>(null);
  const { data, isLoading } = useGetSuperAdminSubscriptionsQuery({ page, limit: 25 });
  const [updateSub, { isLoading: saving }] = useUpdateSuperAdminSubscriptionMutation();

  const { register, handleSubmit, reset } = useForm<{ status: string; amount: number }>();

  const openEdit = (s: Subscription & { ownerName?: string }) => { setEditSub(s); reset({ status: s.status, amount: s.amount }); };

  const onSave = async (values: { status: string; amount: number }) => {
    if (!editSub) return;
    try {
      await updateSub({ id: editSub._id, body: { status: values.status, amount: Number(values.amount) } }).unwrap();
      toast.success('Subscription updated.');
      setEditSub(null);
    } catch (err: any) { toast.error(err?.data?.message ?? 'Could not update.'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Subscriptions</h1>
        <p className="mt-1 text-sm text-ink-soft">All builder billing records.</p>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && <EmptyState icon={<CreditCard className="size-6" />} title="No subscriptions found" />}
        <div className="divide-y divide-line">
          {data?.data.map(s => (
            <div key={s._id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{(s as any).ownerName}</p>
                <p className="text-xs text-ink-faint">{s.numberOfBuildings}B / {s.numberOfUnits}R · Due {formatDate(s.dueDate)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-ink">{formatCurrency(s.amount)}</span>
                <StatusPill status={s.status} />
                <button onClick={() => openEdit(s)} className="flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"><Pencil className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {data && data.totalPages > 1 && <div className="mt-5"><Pagination page={page} totalPages={data.totalPages} onChange={setPage} /></div>}

      <Modal open={!!editSub} onClose={() => setEditSub(null)} title="Edit subscription" size="sm">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Select label="Status" options={statusOptions} {...register('status')} />
          <Input label="Amount (USD)" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
          <Button type="submit" loading={saving} icon={<Check className="size-4" />} className="justify-center">Save changes</Button>
        </form>
      </Modal>
    </div>
  );
}
