import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useForgotPasswordMutation } from '@/store/api/authApi';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword(values).unwrap();
      setSent(true);
      toast.success('Reset code sent to your email.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not send reset code.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-500">
        <KeyRound className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Enter your email and we'll send you a reset code.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        <Button type="submit" size="lg" loading={isLoading} iconRight={<ArrowRight className="size-4" />} className="justify-center">
          Send reset code
        </Button>
      </form>

      {sent && (
        <Button variant="subtle" className="mt-4 w-full justify-center" onClick={() => navigate(`/reset-password?email=${encodeURIComponent(getValues('email'))}`)}>
          I have my code — reset password
        </Button>
      )}

      <p className="mt-7 text-center text-sm">
        <Link to="/login" className="text-ink-faint hover:text-ink">Back to sign in</Link>
      </p>
    </motion.div>
  );
}
