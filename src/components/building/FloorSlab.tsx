import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { RoomTile, RoomTileSkeleton } from './RoomTile';
import type { Floor, Unit } from '@/types/building';
import { cn } from '@/utils/cn';

interface FloorSlabProps {
  floor:          Floor;
  units:          Unit[];
  loading?:       boolean;
  editable?:      boolean;
  index?:         number;
  onRoomClick?:   (unit: Unit) => void;
  onRoomEdit?:    (unit: Unit) => void;   // ← new: open edit drawer
  onRoomAssign?:  (unit: Unit) => void;   // ← new: open assign-tenant flow
  onAddRoom?:     () => void;
  onEditFloor?:   () => void;
  onDeleteFloor?: () => void;
}

export function FloorSlab({
  floor, units, loading, editable, index = 0,
  onRoomClick, onRoomEdit, onRoomAssign, onAddRoom, onEditFloor, onDeleteFloor,
}: FloorSlabProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const occupied = units.filter(u => u.isOccupied || u.status === 'occupied').length;
  const total    = units.length;
  const fillPct  = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16, height: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: index * 0.04 }}
      className="relative rounded-2xl border border-line bg-white/70 backdrop-blur-sm"
    >
      {/* Floor header */}
      <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="font-display text-sm font-semibold text-ink">{floor.name}</span>
          <span className="hidden text-xs text-ink-faint sm:inline">Floor {floor.floorNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper-dim">
              <motion.div className="h-full rounded-full bg-crimson-500" initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <span className="text-[11px] font-medium text-ink-faint">{occupied}/{total}</span>
          </div>
          {editable && (
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)} className="rounded-lg p-1.5 text-ink-faint transition hover:bg-paper-dim hover:text-ink">
                <MoreVertical className="size-4" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-[var(--shadow-pop)]"
                    >
                      <button onClick={() => { setMenuOpen(false); onEditFloor?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink-soft hover:bg-paper-dim hover:text-ink">
                        <Pencil className="size-3.5" /> Edit floor
                      </button>
                      <button onClick={() => { setMenuOpen(false); onDeleteFloor?.(); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-crimson-600 hover:bg-crimson-50">
                        <Trash2 className="size-3.5" /> Delete floor
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Rooms */}
      <div className={cn('flex flex-wrap gap-2.5 p-3.5 pt-5', total === 0 && !loading && 'items-center')}>
        <AnimatePresence initial={false}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RoomTileSkeleton key={i} />)
            : units.map((unit, i) => (
              <RoomTile
                key={unit._id}
                unit={unit}
                index={i}
                onClick={() => onRoomClick?.(unit)}
                onEdit={editable ? () => onRoomEdit?.(unit) : undefined}
                onAssign={editable ? () => onRoomAssign?.(unit) : undefined}
              />
            ))}
        </AnimatePresence>

        {editable && !loading && (
          <motion.button
            layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAddRoom}
            className="flex h-20 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-faint transition hover:border-crimson-300 hover:text-crimson-500 sm:h-24 sm:w-28"
          >
            <Plus className="size-4" />
            <span className="text-[11px] font-medium">Add room</span>
          </motion.button>
        )}
        {total === 0 && !editable && !loading && <p className="px-1 py-2 text-xs text-ink-faint">No rooms on this floor.</p>}
      </div>
    </motion.div>
  );
}
