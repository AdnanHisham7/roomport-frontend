import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Phone, Save, User } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { PageLoader } from '@/components/ui/Avatar';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/userApi';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';

interface FormValues { first_name: string; last_name: string; phone_number: string; }

export default function ProfilePage() {
  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const dispatch = useAppDispatch();
  const profile = data?.data;

  const { register, handleSubmit, formState: { isDirty } } = useForm<FormValues>({
    values: profile ? { first_name: profile.first_name, last_name: profile.last_name, phone_number: profile.phone_number ?? '' } : undefined,
  });

  if (isLoading) return <PageLoader />;
  if (!profile) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await updateProfile(values).unwrap();
      dispatch(updateUser({ first_name: res.data.first_name, last_name: res.data.last_name }));
      toast.success('Profile updated.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not update profile.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-ink-soft">Update your personal details.</p>
      </div>

      <Card padding="lg">
        <div className="mb-6 flex items-center gap-4">
          <Avatar firstName={profile.first_name} lastName={profile.last_name} size="lg" src={profile.profile_image} />
          <div>
            <p className="font-display text-lg font-semibold text-ink">{profile.first_name} {profile.last_name}</p>
            <p className="text-sm text-ink-faint capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" leftIcon={<User className="size-4" />} {...register('first_name', { required: true })} />
            <Input label="Last name" {...register('last_name', { required: true })} />
          </div>
          <Input label="Email" type="email" value={profile.email} disabled leftIcon={<Mail className="size-4" />} hint="Email cannot be changed." />
          <Input label="Phone number" leftIcon={<Phone className="size-4" />} {...register('phone_number')} />

          <Button type="submit" loading={saving} disabled={!isDirty} icon={<Save className="size-4" />} className="w-fit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
