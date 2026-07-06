import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useResetPasswordMutation } from '@/store/api/authApi';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().length(6, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get('email') ?? '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword(values).unwrap();
      toast.success('Password reset — sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not reset password.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-500">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Enter the code we emailed you and choose a new password.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email" type="email" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        <Input label="Reset code" placeholder="000000" inputMode="numeric" maxLength={6} className="tracking-[0.4em]" error={errors.otp?.message} {...register('otp')} />
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          leftIcon={<Lock className="size-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="pointer-events-auto text-ink-faint hover:text-ink">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Button type="submit" size="lg" loading={isLoading} iconRight={<ArrowRight className="size-4" />} className="justify-center">
          Reset password
        </Button>
      </form>

      <p className="mt-7 text-center text-sm">
        <Link to="/login" className="text-ink-faint hover:text-ink">Back to sign in</Link>
      </p>
    </motion.div>
  );
}
