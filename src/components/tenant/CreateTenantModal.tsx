import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Mail, Phone, DollarSign, Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useCreateTenantMutation } from '@/store/api/tenantApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { useGetUnitsQuery } from '@/store/api/unitApi';
import { useState } from 'react';

const rentTypeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half-yearly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buildingId: string;
  unitId: string;
  rentType: string;
  rentAmount: number;
  dueDate: number;
  job: string;
  notes: string;
}

export function CreateTenantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createTenant, { isLoading }] = useCreateTenantMutation();
  const { data: buildingsData } = useGetBuildingsQuery();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({ defaultValues: { rentType: 'monthly', dueDate: 1 } });
  const buildingId = watch('buildingId');
  const { data: unitsData } = useGetUnitsQuery(buildingId ? { buildingId, status: 'available' } : undefined, { skip: !buildingId });

  const onSubmit = async (values: FormValues) => {
    try {
      await createTenant({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        buildingId: values.buildingId || undefined,
        unitId: values.unitId || undefined,
        rentType: values.rentType,
        rentAmount: Number(values.rentAmount),
        dueDate: Number(values.dueDate),
        job: values.job,
        notes: values.notes,
      }).unwrap();
      toast.success(`${values.firstName} added as a tenant.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not add tenant.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a tenant" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" leftIcon={<User className="size-4" />} error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" leftIcon={<Phone className="size-4" />} error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Building" placeholder="Select a building" options={(buildingsData?.data ?? []).map((b) => ({ value: b._id, label: b.name }))} {...register('buildingId')} />
          <Select label="Room (optional)" placeholder="Unassigned" options={(unitsData?.data ?? []).map((u) => ({ value: u._id, label: `${u.unitNumber} — ${u.rentAmount > 0 ? '$' + u.rentAmount : 'no rent set'}` }))} {...register('unitId')} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select label="Rent cycle" options={rentTypeOptions} {...register('rentType')} />
          <Input label="Rent amount" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} error={errors.rentAmount?.message} {...register('rentAmount', { required: true, valueAsNumber: true })} />
          <Input label="Due day" type="number" min={1} max={28} hint="Day of month" error={errors.dueDate?.message} {...register('dueDate', { required: true, valueAsNumber: true })} />
        </div>

        <Input label="Occupation (optional)" leftIcon={<Briefcase className="size-4" />} {...register('job')} />
        <Textarea label="Notes (optional)" {...register('notes')} />

        <Button type="submit" loading={isLoading} className="mt-1 justify-center">Add tenant</Button>
      </form>
    </Modal>
  );
}
