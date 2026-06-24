import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', loading, danger = true }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex size-12 items-center justify-center rounded-full ${danger ? 'bg-crimson-50 text-crimson-500' : 'bg-amber-50 text-amber-500'}`}>
          <AlertTriangle className="size-5.5" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink-soft">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={danger ? 'primary' : 'secondary'} className="flex-1" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
