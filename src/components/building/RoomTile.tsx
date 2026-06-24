import { motion } from 'framer-motion';
import { BedDouble, Bath, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import type { Unit } from '@/types/building';

const statusStyles: Record<string, string> = {
  available: 'bg-white border-sage-400/50 text-ink hover:border-sage-500 hover:shadow-[0_8px_20px_-8px_rgba(63,122,92,0.35)]',
  occupied: 'bg-gradient-to-br from-crimson-500 to-crimson-600 border-crimson-600 text-white hover:from-crimson-600 hover:to-crimson-700',
  reserved: 'bg-amber-50 border-amber-400/60 text-amber-700 hover:border-amber-500',
  'under maintenance': 'bg-paper-deep border-line text-ink-faint hover:border-ink-faint',
};

export function RoomTile({
  unit,
  onClick,
  index = 0,
  compact = false,
}: {
  unit: Pick<Unit, 'unitNumber' | 'status' | 'rentAmount' | 'bedrooms' | 'bathrooms' | 'isOccupied'>;
  onClick?: () => void;
  index?: number;
  compact?: boolean;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: Math.min(index * 0.02, 0.3) }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        'group relative flex shrink-0 flex-col items-start justify-between overflow-hidden rounded-xl border-2 px-3 py-2.5 text-left transition-colors duration-200',
        compact ? 'h-16 w-20' : 'h-20 w-24 sm:h-24 sm:w-28',
        statusStyles[unit.status] ?? statusStyles.available
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn('font-mono font-semibold', compact ? 'text-[11px]' : 'text-[13px]')}>{unit.unitNumber}</span>
        {unit.status === 'occupied' && <Lock className="size-3 opacity-80" />}
      </div>

      {!compact && (
        <div className="flex w-full items-center gap-2 text-[10px] opacity-80">
          <span className="flex items-center gap-0.5"><BedDouble className="size-2.5" />{unit.bedrooms}</span>
          <span className="flex items-center gap-0.5"><Bath className="size-2.5" />{unit.bathrooms}</span>
        </div>
      )}

      <span className={cn('font-mono font-medium', compact ? 'text-[10px]' : 'text-[11.5px]', unit.status === 'occupied' ? 'text-white/90' : 'text-ink-soft')}>
        {unit.rentAmount > 0 ? formatCurrency(unit.rentAmount) : '—'}
      </span>
    </motion.button>
  );
}

export function RoomTileSkeleton() {
  return <div className="h-20 w-24 shrink-0 animate-pulse rounded-xl bg-paper-deep sm:h-24 sm:w-28" />;
}
