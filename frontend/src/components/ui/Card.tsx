import type { ReactNode, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const padMap = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-7 sm:p-8' };

export function Card({ children, className, glass = true, hover = false, padding = 'md', onClick }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'rounded-2xl border border-white/70',
        glass ? 'glass shadow-[var(--shadow-glass)]' : 'bg-white shadow-[var(--shadow-glass)]',
        padMap[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
