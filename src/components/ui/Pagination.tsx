import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-crimson-200 hover:text-crimson-600 disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink-faint">…</span>}
          <button
            onClick={() => onChange(p)}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition',
              p === page ? 'bg-crimson-500 text-white shadow-sm' : 'text-ink-soft hover:bg-paper-dim'
            )}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-crimson-200 hover:text-crimson-600 disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
