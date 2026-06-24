import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { titleCase } from '@/utils/format';

type Tone = 'crimson' | 'sage' | 'amber' | 'ink' | 'neutral';

const toneClasses: Record<Tone, string> = {
  crimson: 'bg-crimson-50 text-crimson-700 border-crimson-100',
  sage: 'bg-sage-50 text-sage-600 border-sage-50',
  amber: 'bg-amber-50 text-amber-600 border-amber-50',
  ink: 'bg-ink/5 text-ink border-ink/5',
  neutral: 'bg-paper-dim text-ink-soft border-line',
};

const statusToneMap: Record<string, Tone> = {
  available: 'sage',
  active: 'sage',
  paid: 'sage',
  completed: 'sage',
  verified: 'sage',
  published: 'sage',
  occupied: 'crimson',
  suspended: 'crimson',
  blacklisted: 'crimson',
  cancelled: 'crimson',
  expired: 'crimson',
  overdue: 'crimson',
  spam: 'crimson',
  reserved: 'amber',
  pending: 'amber',
  pending_verification: 'amber',
  sent: 'amber',
  viewed: 'amber',
  otp_sent: 'amber',
  new: 'amber',
  contacted: 'amber',
  draft: 'neutral',
  inactive: 'neutral',
  closed: 'neutral',
  'under maintenance': 'amber',
  under_maintenance: 'amber',
  under_construction: 'amber',
  maintenance: 'amber',
};

export function StatusPill({ status, icon, className }: { status: string; icon?: ReactNode; className?: string }) {
  const tone = statusToneMap[status?.toLowerCase()] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]',
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {titleCase(status ?? '')}
    </span>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
