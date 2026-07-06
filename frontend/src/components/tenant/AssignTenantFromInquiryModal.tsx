/**
 * Shown when an inquiry with a unitId is closed.
 * Pre-fills name/email/phone from the inquiry, asks for additional tenant data,
 * then creates the tenant and marks the unit as occupied.
 */
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, DollarSign, UserCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useCreateTenantMutation } from '@/store/api/tenantApi';
import { useUpdateUnitMutation } from '@/store/api/unitApi';
import type { Inquiry } from '@/types/platform';

const rentTypeOptions = [
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half-yearly' },
  { value: 'yearly',      label: 'Yearly' },
  { value: 'custom',      label: 'Custom' },
];

interface FormValues {
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  rentType:   string;
  rentAmount: number;
  dueDate:    number;
  job:        string;
  notes:      string;
}

interface Props {
  open:     boolean;
  onClose:  () => void;
  inquiry:  Inquiry;
}

export function AssignTenantFromInquiryModal({ open, onClose, inquiry }: Props) {
  const [createTenant, { isLoading: creating }] = useCreateTenantMutation();
  const [updateUnit,   { isLoading: updating }] = useUpdateUnitMutation();

  // Pre-fill from inquiry
  const nameParts = inquiry.name.trim().split(' ');
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      firstName:  nameParts[0] ?? '',
      lastName:   nameParts.slice(1).join(' ') || '',
      email:      inquiry.email,
      phone:      inquiry.phone ?? '',
      rentType:   'monthly',
      dueDate:    1,
      rentAmount: 0,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createTenant({
        firstName:  values.firstName,
        lastName:   values.lastName,
        email:      values.email,
        phone:      values.phone,
        buildingId: inquiry.buildingId,
        unitId:     inquiry.unitId,
        rentType:   values.rentType,
        rentAmount: Number(values.rentAmount),
        dueDate:    Number(values.dueDate),
        job:        values.job,
        notes:      values.notes,
      }).unwrap();

      // Mark unit occupied
      if (inquiry.unitId) {
        await updateUnit({ id: inquiry.unitId, body: { status: 'occupied', isOccupied: true } }).unwrap();
      }

      toast.success(`${values.firstName} added as a tenant.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not add tenant.', { description: err?.data?.suggestion });
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Convert inquiry to tenant" size="lg">
      <p className="mb-5 text-sm text-ink-soft">
        This inquiry came from <strong>{inquiry.name}</strong>. Fill in the remaining details to create the tenant record and mark the room as occupied.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" leftIcon={<User className="size-4" />} error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Select label="Rent cycle" options={rentTypeOptions} {...register('rentType')} />
          <Input label="Rent amount" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} error={errors.rentAmount?.message} {...register('rentAmount', { required: true, valueAsNumber: true })} />
          <Input label="Due day" type="number" min={1} max={28} hint="Day of month" {...register('dueDate', { required: true, valueAsNumber: true })} />
        </div>
        <Input label="Occupation (optional)" {...register('job')} />
        <Textarea label="Notes (optional)" {...register('notes')} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="subtle" onClick={onClose}>Skip for now</Button>
          <Button type="submit" loading={creating || updating} icon={<UserCheck className="size-4" />}>Create tenant</Button>
        </div>
      </form>
    </Modal>
  );
}
