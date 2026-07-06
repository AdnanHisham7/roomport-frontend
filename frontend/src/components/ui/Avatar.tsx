import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

export function Avatar({
  firstName,
  lastName,
  src,
  size = 'md',
  className,
}: {
  firstName?: string;
  lastName?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = { xs: 'size-6 text-[10px]', sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };
  if (src) {
    return <img src={src} alt="" className={cn('rounded-full object-cover', sizeMap[size], className)} />;
  }
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-crimson-400 to-crimson-600 font-semibold text-white', sizeMap[size], className)}>
      {initials(firstName, lastName)}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <Spinner className="size-7 text-crimson-400" />
    </div>
  );
}
