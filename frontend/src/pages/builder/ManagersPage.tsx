import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, UserCog, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetMyManagersQuery, useCreateManagerMutation, useUpdateManagerStatusMutation, useDeleteManagerMutation } from '@/store/api/userApi';
import { formatDate } from '@/utils/format';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

interface FormValues { email: string; password: string; first_name: string; last_name: string; phone_number?: string; }

export default function ManagersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const { data, isLoading } = useGetMyManagersQuery();
  const [createManager, { isLoading: creating }] = useCreateManagerMutation();
  const [updateStatus] = useUpdateManagerStatusMutation();
  const [deleteManager, { isLoading: deleting }] = useDeleteManagerMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await createManager(values).unwrap();
      toast.success(`${values.first_name} added as a manager.`);
      reset();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not create manager.');
    }
  };

  const onStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success('Status updated.');
    } catch { toast.error('Could not update status.'); }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteManager(deleteTarget).unwrap();
      toast.success('Manager removed.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not remove manager.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Managers</h1>
          <p className="mt-1 text-sm text-ink-soft">Property managers who can access and manage your buildings.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Add manager</Button>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && (
          <EmptyState icon={<UserCog className="size-6" />} title="No managers yet" description="Add a property manager to delegate access across your buildings." action={<Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Add manager</Button>} />
        )}
        <div className="divide-y divide-line">
          {data?.data.map(m => (
            <div key={m._id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar firstName={m.first_name} lastName={m.last_name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{m.first_name} {m.last_name}</p>
                  <p className="truncate text-xs text-ink-faint">{m.email} · Added {formatDate(m.createdAt)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Select options={statusOptions} value={m.status} onChange={e => onStatusChange(m._id, e.target.value)} className="w-32 h-8 text-xs py-0" />
                <StatusPill status={m.status} />
                <button onClick={() => setDeleteTarget(m._id)} className="flex size-8 items-center justify-center rounded-lg text-crimson-400 hover:bg-crimson-50">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a manager" description="The manager will be able to sign in and access your portfolio.">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" {...register('first_name', { required: true })} />
            <Input label="Last name" {...register('last_name', { required: true })} />
          </div>
          <Input label="Email" type="email" {...register('email', { required: true })} />
          <Input label="Temporary password" type={showPw ? 'text' : 'password'} leftIcon={<Lock className="size-4" />} rightIcon={<button type="button" className="pointer-events-auto" onClick={() => setShowPw(s => !s)}>{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} {...register('password', { required: true, minLength: 8 })} hint="Share this with the manager so they can log in." />
          <Input label="Phone (optional)" {...register('phone_number')} />
          <Button type="submit" loading={creating} className="mt-1 justify-center">Add manager</Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting} title="Remove this manager?" description="They will lose access to your buildings immediately." confirmLabel="Remove manager" />
    </div>
  );
}
