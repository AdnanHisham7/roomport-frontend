import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  motionProps?: HTMLMotionProps<'button'>;
}

const variants: Record<Variant, string> = {
  primary: 'bg-crimson-500 text-white shadow-[0_10px_24px_-8px_rgba(200,30,61,0.55)] hover:bg-crimson-600 disabled:bg-crimson-300',
  secondary: 'bg-ink text-white hover:bg-ink/85',
  outline: 'border border-line bg-white/70 text-ink hover:border-crimson-300 hover:bg-crimson-50',
  ghost: 'text-ink-soft hover:bg-paper-dim hover:text-ink',
  danger: 'bg-white text-crimson-600 border border-crimson-200 hover:bg-crimson-50',
  subtle: 'bg-crimson-50 text-crimson-700 hover:bg-crimson-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[0.7rem]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[0.85rem]',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-[0.85rem] justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconRight, children, disabled, motionProps, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.015 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center font-medium tracking-[-0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        {...(props as HTMLMotionProps<'button'>)}
        {...motionProps}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
