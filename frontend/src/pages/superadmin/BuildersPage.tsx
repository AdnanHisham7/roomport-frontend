import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, Users2, ShieldOff, ShieldCheck, ChevronRight, UserPlus, X, Building2, DoorOpen, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Select } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useGetBuildersQuery, useUpdateBuilderStatusMutation, useRegisterBuilderMutation } from '@/store/api/superAdminApi';
import { useGetPlatformSettingsQuery } from '@/store/api/superAdminApi';
import { formatDate, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import type { BillingCycle } from '@/types/platform';

interface RegisterFormValues {
  firstName:         string;
  lastName:          string;
  email:             string;
  phone:             string;
  billingCycle:      BillingCycle;
  numberOfBuildings: number;
  numberOfUnits:     number;
  notes:             string;
}

function RegisterBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [registerBuilder, { isLoading }] = useRegisterBuilderMutation();
  const { data: settingsData }           = useGetPlatformSettingsQuery();
  const pricing                          = settingsData?.data;

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<RegisterFormValues>({
    defaultValues: { billingCycle: 'monthly', numberOfBuildings: 1, numberOfUnits: 10 },
  });

  const cycle    = watch('billingCycle') as BillingCycle;
  const buildings = Number(watch('numberOfBuildings') || 0);
  const units     = Number(watch('numberOfUnits') || 0);

  const pricePerBuilding = pricing
    ? (cycle === 'monthly' ? pricing.monthlyPricePerBuilding : pricing.yearlyPricePerBuilding)
    : 0;
  const pricePerUnit = pricing
    ? (cycle === 'monthly' ? pricing.monthlyPricePerUnit : pricing.yearlyPricePerUnit)
    : 0;
  const estimatedAmount = buildings * pricePerBuilding + units * pricePerUnit;

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerBuilder({
        firstName:         values.firstName,
        lastName:          values.lastName,
        email:             values.email,
        phone:             values.phone || undefined,
        billingCycle:      values.billingCycle,
        numberOfBuildings: buildings,
        numberOfUnits:     units,
        amount:            estimatedAmount,
        notes:             values.notes || undefined,
      }).unwrap();
      toast.success(result.message ?? 'Builder registered. Welcome email sent.');
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Registration failed.', { description: err?.data?.suggestion });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Register Builder</h3>
                <p className="text-xs text-ink-faint mt-0.5">Create account, set subscription, send welcome email</p>
              </div>
              <button onClick={handleClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-paper-dim hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-h-[75vh] overflow-y-auto">
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
                  <Input label="Last name"  error={errors.lastName?.message}  {...register('lastName',  { required: 'Required' })} />
                </div>
                <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
                <Input label="Phone (optional)" {...register('phone')} />

                <div className="border-t border-line pt-4">
                  <p className="mb-3 text-sm font-semibold text-ink">Subscription</p>
                  <div className="mb-3 flex gap-2">
                    {(['monthly', 'yearly'] as BillingCycle[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValue('billingCycle', c)}
                        className={cn(
                          'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
                          cycle === c ? 'bg-crimson-500 text-white' : 'bg-paper-dim text-ink-soft hover:bg-paper-deep'
                        )}
                      >
                        {c === 'monthly' ? 'Monthly' : 'Yearly'}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Buildings" type="number" min={1} leftIcon={<Building2 className="size-4" />} error={errors.numberOfBuildings?.message} {...register('numberOfBuildings', { required: true, valueAsNumber: true, min: 1 })} />
                    <Input label="Rooms"     type="number" min={1} leftIcon={<DoorOpen className="size-4" />}   error={errors.numberOfUnits?.message}     {...register('numberOfUnits',     { required: true, valueAsNumber: true, min: 1 })} />
                  </div>
                </div>

                {pricing && (
                  <div className="rounded-xl border border-line bg-paper-dim p-3 text-sm">
                    <div className="flex justify-between text-ink-soft">
                      <span>{buildings} × {formatCurrency(pricePerBuilding)}/building</span>
                      <span>{formatCurrency(buildings * pricePerBuilding)}</span>
                    </div>
                    <div className="flex justify-between text-ink-soft">
                      <span>{units} × {formatCurrency(pricePerUnit)}/room</span>
                      <span>{formatCurrency(units * pricePerUnit)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-line pt-2 font-semibold text-ink">
                      <span className="flex items-center gap-1"><IndianRupee className="size-3.5" /> {cycle === 'monthly' ? 'Monthly' : 'Yearly'} amount</span>
                      <span className="text-crimson-600">{formatCurrency(estimatedAmount)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink">Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Internal notes about this builder…"
                    className="w-full resize-none rounded-xl border border-line bg-paper-dim px-3 py-2.5 text-sm text-ink placeholder-ink-faint focus:border-crimson-400 focus:outline-none"
                    {...register('notes')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
                <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
                <Button type="submit" loading={isLoading} icon={<UserPlus className="size-4" />}>
                  Register builder
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function BuildersPage() {
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [page,        setPage]        = useState(1);
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading }                    = useGetBuildersQuery({ search: search || undefined, status: status || undefined, page, limit: 20 });
  const [updateStatus, { isLoading: updating }] = useUpdateBuilderStatusMutation();

  const toggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast.success(`Builder ${next === 'active' ? 'activated' : 'suspended'}.`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update status.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Builders</h1>
          <p className="mt-1 text-sm text-ink-soft">All registered property managers and building owners.</p>
        </div>
        <Button icon={<UserPlus className="size-4" />} onClick={() => setRegisterOpen(true)}>
          Register builder
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search by name or email…" leftIcon={<Search className="size-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'inactive', label: 'Inactive' }]}
          className="w-40"
        />
      </div>

      <Card padding="none">
        {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        {!isLoading && !data?.data.length && <EmptyState icon={<Users2 className="size-6" />} title="No builders found" description="Register your first builder using the button above." />}
        <div className="divide-y divide-line">
          {data?.data.map(b => (
            <div key={b._id} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
              <button onClick={() => navigate(`/super-admin/builders/${b._id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar firstName={b.first_name} lastName={b.last_name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{b.first_name} {b.last_name}</p>
                  <p className="truncate text-xs text-ink-faint">{b.email} · Joined {formatDate(b.createdAt)}</p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-ink-faint sm:block">{b.buildingsCount}B / {b.unitsCount}R</span>
                <StatusPill status={b.status} />
                <Button
                  size="sm"
                  variant={b.status === 'active' ? 'danger' : 'subtle'}
                  icon={b.status === 'active' ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                  onClick={() => toggle(b._id, b.status)}
                  disabled={updating}
                >
                  {b.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
                <button onClick={() => navigate(`/super-admin/builders/${b._id}`)} className="text-ink-faint hover:text-ink">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="mt-5">
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      <RegisterBuilderModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
