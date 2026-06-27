import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/store/api/authApi';

export default function SubscriptionExpiredPage() {
  const { user }          = useAuth();
  const [logout]          = useLogoutMutation();

  const handleLogout = async () => {
    try { await logout(undefined).unwrap(); } catch {}
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-100">
          <AlertTriangle className="size-8 text-amber-600" />
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">Subscription expired</h1>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Your subscription has expired or no payment has been recorded for the current period.
          Please contact us to renew your plan and regain access.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-left space-y-3">
          <p className="text-sm font-semibold text-ink">Contact us to renew</p>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Phone className="size-4 text-crimson-500" />
            <span>+91 — (our support number)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Mail className="size-4 text-crimson-500" />
            <span>support@brift.in</span>
          </div>
          <p className="text-xs text-ink-faint mt-1">
            Mention your registered email: <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link to="/dashboard/billing">
            <Button variant="subtle" className="w-full">View billing details</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="w-full text-ink-faint">
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
