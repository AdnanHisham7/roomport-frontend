import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials(res.data));
      const from = (location.state as { from?: string })?.from;
      const dest = from ?? (res.data.user.role === 'super_admin' ? '/super-admin' : '/dashboard');
      toast.success(`Welcome back, ${res.data.user.first_name}`);
      navigate(dest, { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not sign in. Check your credentials.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Sign in to manage your buildings and tenants.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="size-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="pointer-events-auto text-ink-faint hover:text-ink">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-xs font-medium text-crimson-600 hover:text-crimson-700">Forgot password?</Link>
          </div>
        </div>

        <Button type="submit" size="lg" loading={isLoading} iconRight={<ArrowRight className="size-4" />} className="mt-2 justify-center">
          Sign in
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-soft">
        New to RoomPort?{' '}
        <Link to="/get-started" className="font-medium text-crimson-600 hover:text-crimson-700">List your property</Link>
      </p>
    </motion.div>
  );
}
