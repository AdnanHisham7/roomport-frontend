import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useRecordPaymentMutation } from '@/store/api/paymentRecordApi';
import { formatCurrency } from '@/utils/format';

const methodOptions = [
  { value: 'cash',          label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'upi',           label: 'UPI' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'card',          label: 'Card' },
  { value: 'other',         label: 'Other' },
];

const statusOptions = [
  { value: 'paid',    label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'waived',  label: 'Waived' },
];

interface FormValues {
  amount:      number;
  periodDate:  string;    // date used to compute period label (blank = today)
  status:      string;
  method:      string;
  notes:       string;
}

interface Props {
  open:    boolean;
  onClose: () => void;
  tenant: {
    _id:        string;
    firstName:  string;
    lastName:   string;
    rentAmount: number;
    rentType:   string;
  };
}

// Helper: label for "next period" button
function nextPeriodDate(rentType: string): string {
  const d = new Date();
  if (rentType === 'monthly')     { d.setMonth(d.getMonth() + 1); }
  if (rentType === 'quarterly')   { d.setMonth(d.getMonth() + 3); }
  if (rentType === 'half_yearly') { d.setMonth(d.getMonth() + 6); }
  if (rentType === 'yearly')      { d.setFullYear(d.getFullYear() + 1); }
  return d.toISOString().slice(0, 10);
}

export function RecordPaymentModal({ open, onClose, tenant }: Props) {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();
  const [nextPeriod, setNextPeriod] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      amount:     tenant.rentAmount,
      periodDate: '',   // blank = current period
      status:     'paid',
      method:     'cash',
    },
  });

  const handleNextPeriod = (v: boolean) => {
    setNextPeriod(v);
    setValue('periodDate', v ? nextPeriodDate(tenant.rentType) : '');
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await recordPayment({
        tenantId:   tenant._id,
        amount:     Number(values.amount),
        periodDate: values.periodDate || undefined,
        status:     values.status as any,
        method:     values.method as any || undefined,
        notes:      values.notes || undefined,
      }).unwrap();
      toast.success('Payment recorded.');
      reset();
      setNextPeriod(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not record payment.');
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={`Record payment — ${tenant.firstName} ${tenant.lastName}`} size="md">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Quick-period selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleNextPeriod(false)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition ${!nextPeriod ? 'border-crimson-400 bg-crimson-50 text-crimson-700' : 'border-line text-ink-soft hover:border-ink-faint'}`}
          >
            Current period
          </button>
          <button
            type="button"
            onClick={() => handleNextPeriod(true)}
            className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition ${nextPeriod ? 'border-crimson-400 bg-crimson-50 text-crimson-700' : 'border-line text-ink-soft hover:border-ink-faint'}`}
          >
            Next period
          </button>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-faint">
            <Calendar className="size-3" /> Cycle: {tenant.rentType}
          </div>
        </div>

        {/* Optional specific date override */}
        <Input
          label="Period date (optional)"
          type="date"
          hint="Leave blank for current period, or pick a date in the desired period"
          {...register('periodDate')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number" step="0.01"
            leftIcon={<DollarSign className="size-4" />}
            hint={`Default: ${formatCurrency(tenant.rentAmount)}`}
            error={errors.amount?.message}
            {...register('amount', { required: true, valueAsNumber: true })}
          />
          <Select label="Status" options={statusOptions} {...register('status')} />
        </div>

        <Select label="Payment method" options={methodOptions} {...register('method')} />
        <Textarea label="Notes (optional)" placeholder="Reference number, remarks..." {...register('notes')} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="subtle" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading} icon={<CreditCard className="size-4" />}>Record payment</Button>
        </div>
      </form>
    </Modal>
  );
}
