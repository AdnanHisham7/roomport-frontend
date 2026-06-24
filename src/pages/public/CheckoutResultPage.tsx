import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function CheckoutResultPage() {
  const { status } = useParams<{ status: string }>();
  const { isAuthenticated } = useAuth();
  const success = status === 'success';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
        <div className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-full ${success ? 'bg-sage-50 text-sage-500' : 'bg-crimson-50 text-crimson-500'}`}>
          {success ? <CheckCircle className="size-10" /> : <XCircle className="size-10" />}
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {success ? 'Payment successful!' : 'Payment cancelled'}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          {success
            ? 'Your subscription is now active. Head to your dashboard to start adding buildings and rooms.'
            : "No charge was made. You can try again whenever you're ready."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {success ? (
            isAuthenticated ? (
              <Link to="/dashboard"><Button icon={<LayoutDashboard className="size-4" />}>Go to dashboard</Button></Link>
            ) : (
              <Link to="/login"><Button>Sign in to your new account</Button></Link>
            )
          ) : (
            <>
              <Link to="/get-started"><Button icon={<ArrowLeft className="size-4" />} variant="outline">Try again</Button></Link>
              <Link to="/"><Button variant="ghost">Back to home</Button></Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
