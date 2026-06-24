import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DollarSign, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useCreateAgreementMutation } from '@/store/api/agreementApi';
import { useGetTenantsQuery } from '@/store/api/tenantApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';

interface FormValues {
  tenantId: string;
  buildingId: string;
  title: string;
  body: string;
  terms: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
}

export function CreateAgreementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [createAgreement, { isLoading }] = useCreateAgreementMutation();
  const { data: tenantsData } = useGetTenantsQuery();
  const { data: buildingsData } = useGetBuildingsQuery();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { title: 'Residential Lease Agreement', body: 'This agreement is entered into between the property owner and the tenant for the rental of the specified unit, under the terms outlined below.' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createAgreement({ ...values, monthlyRent: Number(values.monthlyRent) }).unwrap();
      toast.success('Agreement drafted.');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not create agreement.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Draft a new agreement" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tenant" placeholder="Select tenant" options={(tenantsData?.data ?? []).map((t) => ({ value: t._id, label: `${t.firstName} ${t.lastName}` }))} error={errors.tenantId?.message} {...register('tenantId', { required: 'Required' })} />
          <Select label="Building" placeholder="Select building" options={(buildingsData?.data ?? []).map((b) => ({ value: b._id, label: b.name }))} error={errors.buildingId?.message} {...register('buildingId', { required: 'Required' })} />
        </div>
        <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Required' })} />
        <Textarea label="Agreement body" hint="The main legal text of the agreement" error={errors.body?.message} {...register('body', { required: 'Required' })} />
        <Textarea label="Additional terms (optional)" {...register('terms')} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Monthly rent" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} error={errors.monthlyRent?.message} {...register('monthlyRent', { required: true, valueAsNumber: true })} />
          <Input label="Start date" type="date" leftIcon={<Calendar className="size-4" />} error={errors.startDate?.message} {...register('startDate', { required: 'Required' })} />
          <Input label="End date" type="date" leftIcon={<Calendar className="size-4" />} error={errors.endDate?.message} {...register('endDate', { required: 'Required' })} />
        </div>
        <Button type="submit" loading={isLoading} className="mt-1 justify-center">Create draft</Button>
      </form>
    </Modal>
  );
}
