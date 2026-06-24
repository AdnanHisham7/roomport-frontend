import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useRegisterMutation } from '@/store/api/authApi';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone_number: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values).unwrap();
      toast.success('Account created — check your email for a verification code.');
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not create your account.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-2xl font-semibold text-ink">Create your builder account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Start listing and managing your rental properties.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" placeholder="Jordan" leftIcon={<User className="size-4" />} error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" placeholder="Rivera" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        <Input label="Phone (optional)" placeholder="+1 555 0100" leftIcon={<Phone className="size-4" />} error={errors.phone_number?.message} {...register('phone_number')} />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          leftIcon={<Lock className="size-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="pointer-events-auto text-ink-faint hover:text-ink">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" size="lg" loading={isLoading} iconRight={<ArrowRight className="size-4" />} className="mt-2 justify-center">
          Create account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-crimson-600 hover:text-crimson-700">Sign in</Link>
      </p>
    </motion.div>
  );
}
