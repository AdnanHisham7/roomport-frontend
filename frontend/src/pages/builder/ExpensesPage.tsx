import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Wallet, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetExpensesQuery, useCreateExpenseMutation, useDeleteExpenseMutation } from '@/store/api/expenseApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { formatCurrency, formatDate, titleCase } from '@/utils/format';

const categoryOptions = ['repair','utility','salary','tax','renovation','cleaning','insurance','security','commission','legal','marketing','other']
  .map(c => ({ value: c, label: titleCase(c) }));
const methodOptions = ['cash','bank_transfer','upi','cheque','card'].map(m => ({ value: m, label: titleCase(m) }));

interface FormValues {
  buildingId: string; category: string; title: string; description: string;
  amount: number; date: string; method: string; paidTo: string;
}

export default function ExpensesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { data, isLoading } = useGetExpensesQuery();
  const { data: buildingsData } = useGetBuildingsQuery();
  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [deleteExpense, { isLoading: deleting }] = useDeleteExpenseMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { date: new Date().toISOString().split('T')[0], method: 'cash' } });

  const expenses = data?.data ?? [];
  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

  const onSubmit = async (values: FormValues) => {
    try {
      await createExpense({ ...values, amount: Number(values.amount), status: 'pending' as any, recordedBy: '', category: values.category as any, method: values.method as any }).unwrap();
      toast.success('Expense recorded.');
      reset();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not record expense.');
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget).unwrap();
      toast.success('Expense removed.');
      setDeleteTarget(null);
    } catch { toast.error('Could not delete.'); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Expenses</h1>
          <p className="mt-1 text-sm text-ink-soft">Track property costs and outgoings.</p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Log expense</Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card padding="sm" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-crimson-50 text-crimson-500"><TrendingDown className="size-4.5" /></span>
          <div>
            <p className="text-xs text-ink-faint">Paid</p>
            <p className="font-display text-lg font-semibold text-ink">{formatCurrency(totalPaid)}</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><TrendingUp className="size-4.5" /></span>
          <div>
            <p className="text-xs text-ink-faint">Pending</p>
            <p className="font-display text-lg font-semibold text-ink">{formatCurrency(totalPending)}</p>
          </div>
        </Card>
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !expenses.length && (
          <EmptyState icon={<Wallet className="size-6" />} title="No expenses yet" description="Log maintenance costs, utilities, salaries and more." action={<Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Log first expense</Button>} />
        )}
        <div className="divide-y divide-line">
          {expenses.map(e => (
            <div key={e._id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                <p className="text-xs text-ink-faint">{titleCase(e.category)} · {formatDate(e.date)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-ink">{formatCurrency(e.amount)}</span>
                <StatusPill status={e.status} />
                <button onClick={() => setDeleteTarget(e._id)} className="text-crimson-400 hover:text-crimson-600"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log an expense">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select label="Building" placeholder="Select building" options={(buildingsData?.data ?? []).map(b => ({ value: b._id, label: b.name }))} {...register('buildingId', { required: true })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" options={categoryOptions} {...register('category', { required: true })} />
            <Select label="Payment method" options={methodOptions} {...register('method')} />
          </div>
          <Input label="Title" placeholder="e.g. Plumbing repair — Unit 201" {...register('title', { required: true })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount" type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} />
            <Input label="Date" type="date" {...register('date')} />
          </div>
          <Input label="Paid to (optional)" placeholder="Contractor or vendor name" {...register('paidTo')} />
          <Textarea label="Description (optional)" {...register('description')} />
          <Button type="submit" loading={creating} className="mt-1 justify-center">Save expense</Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete} loading={deleting} title="Delete this expense?" confirmLabel="Delete" />
    </div>
  );
}
