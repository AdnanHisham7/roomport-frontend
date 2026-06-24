import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Phone, Briefcase, Save, Trash2, FileSignature, Plus } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { PageLoader } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetTenantByIdQuery, useUpdateTenantMutation, useDeleteTenantMutation } from '@/store/api/tenantApi';
import { useGetAgreementsQuery } from '@/store/api/agreementApi';
import { formatCurrency, formatDate, titleCase } from '@/utils/format';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'blacklisted', label: 'Blacklisted' },
];

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  rentAmount: number;
  job: string;
  notes: string;
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useGetTenantByIdQuery(id!, { skip: !id });
  const { data: agreementsData } = useGetAgreementsQuery({ tenantId: id }, { skip: !id });
  const [updateTenant, { isLoading: saving }] = useUpdateTenantMutation();
  const [deleteTenant, { isLoading: deleting }] = useDeleteTenantMutation();

  const tenant = data?.data;
  const { register, handleSubmit } = useForm<FormValues>({
    values: tenant ? { firstName: tenant.firstName, lastName: tenant.lastName, email: tenant.email, phone: tenant.phone, status: tenant.status, rentAmount: tenant.rentAmount, job: tenant.job ?? '', notes: tenant.notes ?? '' } : undefined,
  });

  if (isLoading) return <PageLoader />;
  if (!tenant || !id) return <p className="text-ink-soft">Tenant not found.</p>;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateTenant({ id, body: { ...values, rentAmount: Number(values.rentAmount) } }).unwrap();
      toast.success('Tenant updated.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update tenant.');
    }
  };

  const onDelete = async () => {
    try {
      await deleteTenant(id).unwrap();
      toast.success('Tenant removed.');
      navigate('/dashboard/tenants');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not delete tenant.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate('/dashboard/tenants')} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Tenants
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={tenant.firstName} lastName={tenant.lastName} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{tenant.firstName} {tenant.lastName}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
              <Mail className="size-3.5" /> {tenant.email}
            </div>
          </div>
        </div>
        <StatusPill status={tenant.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-semibold text-ink">Tenant details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" {...register('firstName', { required: true })} />
              <Input label="Last name" {...register('lastName', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" type="email" leftIcon={<Mail className="size-4" />} {...register('email', { required: true })} />
              <Input label="Phone" leftIcon={<Phone className="size-4" />} {...register('phone', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Status" options={statusOptions} {...register('status')} />
              <Input label="Rent amount" type="number" step="0.01" {...register('rentAmount', { valueAsNumber: true })} />
            </div>
            <Input label="Occupation" leftIcon={<Briefcase className="size-4" />} {...register('job')} />
            <Textarea label="Notes" {...register('notes')} />

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" loading={saving} icon={<Save className="size-4" />}>Save changes</Button>
              <Button type="button" variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setDeleteOpen(true)}>Remove tenant</Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card padding="lg">
            <p className="text-xs font-medium text-ink-faint">Rent</p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">{formatCurrency(tenant.rentAmount)}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{titleCase(tenant.rentType)} · due day {tenant.dueDate}</p>
          </Card>

          <Card padding="lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold text-ink"><FileSignature className="size-4 text-crimson-500" /> Agreements</h3>
              <Link to="/dashboard/agreements" className="text-xs font-medium text-crimson-600 hover:text-crimson-700">
                <Plus className="size-3.5" />
              </Link>
            </div>
            {!agreementsData?.data.length ? (
              <p className="text-xs text-ink-faint">No agreements yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {agreementsData.data.map((a) => (
                  <Link key={a._id} to={`/dashboard/agreements/${a._id}`} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs hover:border-crimson-200">
                    <span className="text-ink-soft">{formatDate(a.startDate)} – {formatDate(a.endDate)}</span>
                    <StatusPill status={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={onDelete} loading={deleting} title="Remove this tenant?" description="This won't delete their lease history." confirmLabel="Remove tenant" />
    </div>
  );
}
