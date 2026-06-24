import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, children, width = 'max-w-md' }: DrawerProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={cn('relative z-10 flex h-full w-full flex-col bg-paper shadow-[var(--shadow-pop)]', width)}
          >
            <button onClick={onClose} className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-2 text-ink-faint shadow-sm transition hover:text-ink">
              <X className="size-4.5" />
            </button>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
