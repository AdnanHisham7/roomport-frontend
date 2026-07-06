import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper-dim/50 px-6 py-16 text-center"
    >
      {icon && <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-400">{icon}</div>}
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
