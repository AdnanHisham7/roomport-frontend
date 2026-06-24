import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useBootstrapSuperAdminMutation } from '@/store/api/authApi';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function SetupPage() {
  const [bootstrap, { isLoading }] = useBootstrapSuperAdminMutation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await bootstrap(values).unwrap();
      toast.success('Platform initialized. Sign in with your new super admin account.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Setup already completed, or something went wrong.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-500">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Initialize Brift</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        This one-time setup creates the platform's first super admin account. It only works while the database has no users yet.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" leftIcon={<User className="size-4" />} error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <Input label="Email" type="email" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" leftIcon={<Lock className="size-4" />} error={errors.password?.message} {...register('password')} />
        <Button type="submit" size="lg" loading={isLoading} iconRight={<ArrowRight className="size-4" />} className="justify-center">
          Initialize platform
        </Button>
      </form>

      <p className="mt-7 text-center text-sm">
        <Link to="/login" className="text-ink-faint hover:text-ink">Back to sign in</Link>
      </p>
    </motion.div>
  );
}
