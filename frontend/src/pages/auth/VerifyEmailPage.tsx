import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { useVerifyEmailMutation, useResendOtpMutation } from '@/store/api/authApi';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail({ email, otp }).unwrap();
      toast.success('Email verified! You can sign in now.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Invalid or expired code.');
    }
  };

  const onResend = async () => {
    try {
      await resendOtp({ email, purpose: 'EMAIL_VERIFICATION' }).unwrap();
      toast.success('A new code is on its way.');
      setCooldown(45);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Could not resend code.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-500">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Verify your email</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        We sent a 6-digit code to <span className="font-medium text-ink">{email || 'your email'}</span>.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Verification code"
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="text-center text-lg tracking-[0.5em]"
        />
        <Button type="submit" size="lg" loading={isLoading} disabled={otp.length !== 6} iconRight={<ArrowRight className="size-4" />} className="justify-center">
          Verify email
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-ink-soft">
        Didn't get a code?{' '}
        <button onClick={onResend} disabled={cooldown > 0 || resending} className="font-medium text-crimson-600 hover:text-crimson-700 disabled:text-ink-faint">
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
      <p className="mt-3 text-center text-sm">
        <Link to="/login" className="text-ink-faint hover:text-ink">Back to sign in</Link>
      </p>
    </motion.div>
  );
}
