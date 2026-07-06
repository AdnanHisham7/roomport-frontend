import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export function Tabs({ tabs, value, onChange, className }: { tabs: Tab[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl bg-paper-dim p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors',
            value === tab.value ? 'text-ink' : 'text-ink-soft hover:text-ink'
          )}
        >
          {value === tab.value && (
            <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold', value === tab.value ? 'bg-crimson-50 text-crimson-600' : 'bg-ink/5 text-ink-soft')}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
