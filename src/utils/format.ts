export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: string | Date | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', opts ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

export function formatDateTime(date: string | Date | undefined | null): string {
  return formatDate(date, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

export function titleCase(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ordinalFloorName(floorNumber: number): string {
  if (floorNumber === 0) return 'Ground Floor';
  if (floorNumber < 0) return `Basement ${Math.abs(floorNumber)}`;
  const j = floorNumber % 10, k = floorNumber % 100;
  if (j === 1 && k !== 11) return `${floorNumber}st Floor`;
  if (j === 2 && k !== 12) return `${floorNumber}nd Floor`;
  if (j === 3 && k !== 13) return `${floorNumber}rd Floor`;
  return `${floorNumber}th Floor`;
}
