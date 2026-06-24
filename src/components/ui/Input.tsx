import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

const fieldBase =
  'w-full rounded-[0.85rem] border border-line bg-white/80 px-3.5 text-[14.5px] text-ink placeholder:text-ink-faint transition-all duration-150 focus:border-crimson-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-crimson-100 disabled:cursor-not-allowed disabled:opacity-60';

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrap({ label, error, hint, required, children, className }: FieldWrapProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-[13px] font-medium text-ink-soft">
          {label}
          {required && <span className="text-crimson-500"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-crimson-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, leftIcon, rightIcon, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required}>
      <div className="relative flex items-center">
        {leftIcon && <span className="pointer-events-none absolute left-3.5 text-ink-faint">{leftIcon}</span>}
        <input
          ref={ref}
          className={cn(fieldBase, 'h-11', leftIcon && 'pl-10', rightIcon && 'pr-10', error && 'border-crimson-300 ring-crimson-100', className)}
          {...props}
        />
        {rightIcon && <span className="absolute right-3.5 text-ink-faint">{rightIcon}</span>}
      </div>
    </FieldWrap>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        className={cn(fieldBase, 'min-h-24 resize-y py-2.5', error && 'border-crimson-300 ring-crimson-100', className)}
        {...props}
      />
    </FieldWrap>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, options, placeholder, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        className={cn(fieldBase, 'h-11 cursor-pointer appearance-none bg-[url(\'data:image/svg+xml;utf8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2218%22 height%3D%2218%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22%236B5458%22 stroke-width%3D%222%22%3E%3Cpath d%3D%22m6 9 6 6 6-6%22%2F%3E%3C%2Fsvg%3E\')] bg-[right_0.75rem_center] bg-no-repeat pr-9', error && 'border-crimson-300 ring-crimson-100', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldWrap>
  )
);
Select.displayName = 'Select';
