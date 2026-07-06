import { motion } from 'framer-motion';
import { BedDouble, Bath, Lock, Pencil, UserPlus, Eye, CreditCard, CheckCircle, Wrench, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import type { Unit } from '@/types/building';

const statusStyles: Record<string, string> = {
  available:           'bg-white border-sage-400/50 text-ink hover:border-sage-500 hover:shadow-[0_8px_20px_-8px_rgba(63,122,92,0.35)]',
  occupied:            'bg-gradient-to-br from-crimson-500 to-crimson-600 border-crimson-600 text-white hover:from-crimson-600 hover:to-crimson-700',
  reserved:            'bg-amber-50 border-amber-400/60 text-amber-700 hover:border-amber-500',
  'under maintenance': 'bg-paper-deep border-line text-ink-faint hover:border-ink-faint',
};

interface RoomTileProps {
  unit:        Pick<Unit, '_id' | 'unitNumber' | 'status' | 'rentAmount' | 'bedrooms' | 'bathrooms' | 'isOccupied'>;
  onClick?:    () => void;
  onEdit?:     () => void;
  // Status-specific actions
  onAssign?:       () => void;  // available: assign new tenant
  onViewTenant?:   () => void;  // occupied/reserved: go to tenant profile
  onAddPayment?:   () => void;  // occupied: record payment
  onConfirm?:      () => void;  // reserved: confirm tenant
  onMakeAvailable?: () => void; // maintenance: make available
  onTransfer?:     () => void;  // occupied: transfer tenant
  index?:      number;
  compact?:    boolean;
}

export function RoomTile({
  unit,
  onClick,
  onEdit,
  onAssign,
  onViewTenant,
  onAddPayment,
  onConfirm,
  onMakeAvailable,
  onTransfer,
  index = 0,
  compact = false,
}: RoomTileProps) {
  const isOccupied    = unit.isOccupied || unit.status === 'occupied';
  const isReserved    = unit.status === 'reserved';
  const isMaintenance = unit.status === 'under maintenance';
  const isAvailable   = unit.status === 'available';

  const ActionBtn = ({
    title,
    onClick: handleClick,
    icon: Icon,
    className,
  }: {
    title: string;
    onClick: () => void;
    icon: React.ElementType;
    className: string;
  }) => (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); handleClick(); }}
      className={cn('flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors', className)}
    >
      <Icon className="size-3" />
    </button>
  );

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
          {isOccupied    && <Lock    className="size-3 opacity-80" />}
          {isMaintenance && <Wrench  className="size-3 opacity-60" />}
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

      {/* Contextual action buttons on hover */}
      <div className="absolute -top-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 opacity-0 transition-all duration-150 group-hover/tile:opacity-100">
        {/* Edit is always available */}
        {onEdit && (
          <ActionBtn
            title="Edit room"
            onClick={onEdit}
            icon={Pencil}
            className="bg-white border-line text-ink-soft hover:text-ink hover:border-ink-faint"
          />
        )}

        {/* OCCUPIED: view tenant, add payment, transfer */}
        {isOccupied && onViewTenant && (
          <ActionBtn
            title="View tenant"
            onClick={onViewTenant}
            icon={Eye}
            className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
          />
        )}
        {isOccupied && onAddPayment && (
          <ActionBtn
            title="Record payment"
            onClick={onAddPayment}
            icon={CreditCard}
            className="bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100"
          />
        )}
        {isOccupied && onTransfer && (
          <ActionBtn
            title="Transfer tenant"
            onClick={onTransfer}
            icon={ArrowRightLeft}
            className="bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
          />
        )}

        {/* AVAILABLE: assign tenant */}
        {isAvailable && onAssign && (
          <ActionBtn
            title="Assign tenant"
            onClick={onAssign}
            icon={UserPlus}
            className="bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100"
          />
        )}

        {/* RESERVED: view tenant, confirm */}
        {isReserved && onViewTenant && (
          <ActionBtn
            title="View tenant"
            onClick={onViewTenant}
            icon={Eye}
            className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
          />
        )}
        {isReserved && onConfirm && (
          <ActionBtn
            title="Confirm tenant"
            onClick={onConfirm}
            icon={CheckCircle}
            className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
          />
        )}

        {/* MAINTENANCE: make available */}
        {isMaintenance && onMakeAvailable && (
          <ActionBtn
            title="Mark as available"
            onClick={onMakeAvailable}
            icon={CheckCircle}
            className="bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100"
          />
        )}
      </div>
    </motion.div>
  );
}

export function RoomTileSkeleton() {
  return <div className="h-20 w-24 shrink-0 animate-pulse rounded-xl bg-paper-deep sm:h-24 sm:w-28" />;
}
