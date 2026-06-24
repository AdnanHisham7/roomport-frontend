import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn('relative z-10 w-full glass-dark-none rounded-2xl bg-white shadow-[var(--shadow-pop)] max-h-[88vh] flex flex-col', sizeMap[size])}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  {title && <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>}
                  {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
                </div>
                <button onClick={onClose} className="rounded-full p-1.5 text-ink-faint transition hover:bg-paper-dim hover:text-ink">
                  <X className="size-4.5" />
                </button>
              </div>
            )}
            {!title && !description && (
              <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-ink-faint shadow-sm transition hover:text-ink">
                <X className="size-4.5" />
              </button>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
