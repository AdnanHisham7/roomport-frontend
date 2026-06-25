import { motion } from 'framer-motion';
import { BedDouble, Bath, Lock, Pencil, UserPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import type { Unit } from '@/types/building';

const statusStyles: Record<string, string> = {
  available:         'bg-white border-sage-400/50 text-ink hover:border-sage-500 hover:shadow-[0_8px_20px_-8px_rgba(63,122,92,0.35)]',
  occupied:          'bg-gradient-to-br from-crimson-500 to-crimson-600 border-crimson-600 text-white hover:from-crimson-600 hover:to-crimson-700',
  reserved:          'bg-amber-50 border-amber-400/60 text-amber-700 hover:border-amber-500',
  'under maintenance': 'bg-paper-deep border-line text-ink-faint hover:border-ink-faint',
};

export function RoomTile({
  unit,
  onClick,
  onEdit,
  onAssign,
  index = 0,
  compact = false,
}: {
  unit: Pick<Unit, '_id' | 'unitNumber' | 'status' | 'rentAmount' | 'bedrooms' | 'bathrooms' | 'isOccupied'>;
  onClick?: () => void;
  onEdit?:   () => void;
  onAssign?: () => void;
  index?: number;
  compact?: boolean;
}) {
  const isOccupied = unit.isOccupied || unit.status === 'occupied';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26, delay: Math.min(index * 0.02, 0.3) }}
      className="group/tile relative shrink-0"
    >
      <motion.button
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className={cn(
          'relative flex shrink-0 flex-col items-start justify-between overflow-hidden rounded-xl border-2 px-3 py-2.5 text-left transition-colors duration-200',
          compact ? 'h-16 w-20' : 'h-20 w-24 sm:h-24 sm:w-28',
          statusStyles[unit.status] ?? statusStyles.available
        )}
      >
        <div className="flex w-full items-center justify-between">
          <span className={cn('font-mono font-semibold', compact ? 'text-[11px]' : 'text-[13px]')}>{unit.unitNumber}</span>
          {isOccupied && <Lock className="size-3 opacity-80" />}
        </div>

        {!compact && (
          <div className="flex w-full items-center gap-2 text-[10px] opacity-80">
            <span className="flex items-center gap-0.5"><BedDouble className="size-2.5" />{unit.bedrooms}</span>
            <span className="flex items-center gap-0.5"><Bath className="size-2.5" />{unit.bathrooms}</span>
          </div>
        )}

        <span className={cn('font-mono font-medium', compact ? 'text-[10px]' : 'text-[11.5px]', isOccupied ? 'text-white/90' : 'text-ink-soft')}>
          {unit.rentAmount > 0 ? formatCurrency(unit.rentAmount) : '—'}
        </span>
      </motion.button>

      {/* Hover action icons — show above the tile */}
      {(onEdit || onAssign) && (
        <div className="absolute -top-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 opacity-0 transition-all duration-150 group-hover/tile:opacity-100">
          {onEdit && (
            <button
              title="Edit room"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex size-6 items-center justify-center rounded-full bg-white border border-line shadow-sm text-ink-soft hover:text-ink hover:border-ink-faint"
            >
              <Pencil className="size-3" />
            </button>
          )}
          {onAssign && (
            <button
              title={isOccupied ? 'View tenant' : 'Assign tenant'}
              onClick={(e) => { e.stopPropagation(); onAssign(); }}
              className={cn(
                'flex size-6 items-center justify-center rounded-full border shadow-sm',
                isOccupied
                  ? 'bg-crimson-50 border-crimson-200 text-crimson-600 hover:bg-crimson-100'
                  : 'bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100'
              )}
            >
              <UserPlus className="size-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function RoomTileSkeleton() {
  return <div className="h-20 w-24 shrink-0 animate-pulse rounded-xl bg-paper-deep sm:h-24 sm:w-28" />;
}
