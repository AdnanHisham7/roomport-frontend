import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper texture-grid px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-400">
          <Compass className="size-7" />
        </div>
        <h1 className="font-display text-5xl font-semibold text-ink">404</h1>
        <p className="mt-3 text-ink-soft">This space doesn't exist — at least not at this address.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back to home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
