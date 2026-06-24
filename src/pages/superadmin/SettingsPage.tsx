import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DollarSign, Save, Star } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation } from '@/store/api/superAdminApi';

interface FormValues {
  platformName: string;
  supportEmail: string;
  pricePerBuilding: number;
  pricePerUnit: number;
  currency: string;
  maxFeaturedBuildings: number;
}

export default function SettingsPage() {
  const { data, isLoading } = useGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdatePlatformSettingsMutation();
  const s = data?.data;

  const { register, handleSubmit } = useForm<FormValues>({ values: s ? { platformName: s.platformName, supportEmail: s.supportEmail ?? '', pricePerBuilding: s.pricePerBuilding, pricePerUnit: s.pricePerUnit, currency: s.currency, maxFeaturedBuildings: s.maxFeaturedBuildings } : undefined });

  if (isLoading) return <PageLoader />;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateSettings({ ...values, pricePerBuilding: Number(values.pricePerBuilding), pricePerUnit: Number(values.pricePerUnit), maxFeaturedBuildings: Number(values.maxFeaturedBuildings) }).unwrap();
      toast.success('Platform settings updated.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not save settings.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Platform Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Control pricing, branding, and global limits.</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input label="Platform name" {...register('platformName', { required: true })} />
          <Input label="Support email" type="email" {...register('supportEmail')} />

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-sm font-semibold text-ink">Subscription pricing</p>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Per building / year" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} {...register('pricePerBuilding', { required: true, valueAsNumber: true })} />
              <Input label="Per room / year" type="number" step="0.01" leftIcon={<DollarSign className="size-4" />} {...register('pricePerUnit', { required: true, valueAsNumber: true })} />
              <Input label="Currency" placeholder="USD" {...register('currency', { required: true })} />
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="mb-3 text-sm font-semibold text-ink">Featured listings</p>
            <Input label="Max featured buildings" type="number" min={1} max={50} leftIcon={<Star className="size-4" />} hint="Max simultaneous featured listings on the public homepage." {...register('maxFeaturedBuildings', { required: true, valueAsNumber: true })} />
          </div>

          <Button type="submit" loading={saving} icon={<Save className="size-4" />} className="w-fit">Save settings</Button>
        </form>
      </Card>
    </div>
  );
}
