import React, { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

/**
 * Input — Linear-style monochrome.
 * Props standar input HTML + label, error, hint, icon, prefix.
 */
const Input = forwardRef(function Input(
    {
        label,
        error,
        hint,
        icon: Icon,
        prefix,
        suffix,
        className,
        id,
        ...props
    },
    ref
) {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-xs font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className={cn(
                'flex items-center bg-white border rounded-[6px] transition-colors',
                'focus-within:ring-2 focus-within:ring-[var(--admin-accent)]/30 focus-within:border-[var(--admin-accent)]',
                error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
            )}>
                {prefix && (
                    <span className="pl-3 text-sm text-gray-400 select-none">{prefix}</span>
                )}
                {Icon && (
                    <span className="pl-3 text-gray-400 flex items-center">
                        <Icon size={14} strokeWidth={2} />
                    </span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'flex-1 h-9 px-3 text-sm bg-transparent placeholder:text-gray-400 outline-none disabled:cursor-not-allowed disabled:text-gray-400',
                        (Icon || prefix) && 'pl-2',
                        className,
                    )}
                    {...props}
                />
                {suffix && (
                    <span className="pr-3 text-sm text-gray-400 select-none">{suffix}</span>
                )}
            </div>
            {error ? (
                <p className="text-xs text-red-600">{error}</p>
            ) : hint ? (
                <p className="text-xs text-gray-500">{hint}</p>
            ) : null}
        </div>
    );
});

export default Input;

export const Textarea = forwardRef(function Textarea(
    { label, error, hint, className, id, rows = 4, ...props },
    ref
) {
    const inputId = id || (label ? `ta-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label htmlFor={inputId} className="text-xs font-medium text-gray-700">{label}</label>}
            <textarea
                ref={ref}
                id={inputId}
                rows={rows}
                className={cn(
                    'bg-white border rounded-[6px] px-3 py-2 text-sm placeholder:text-gray-400 outline-none transition-colors resize-y',
                    'focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)]',
                    error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
                    className,
                )}
                {...props}
            />
            {error ? <p className="text-xs text-red-600">{error}</p>
                : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
        </div>
    );
});

export const Select = forwardRef(function Select(
    { label, error, hint, className, id, children, ...props },
    ref
) {
    const inputId = id || (label ? `sel-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label htmlFor={inputId} className="text-xs font-medium text-gray-700">{label}</label>}
            <select
                ref={ref}
                id={inputId}
                className={cn(
                    'h-9 px-3 pr-8 bg-white border rounded-[6px] text-sm outline-none transition-colors cursor-pointer',
                    'focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)]',
                    error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
                    'appearance-none bg-no-repeat bg-right',
                    className,
                )}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '16px',
                    backgroundPosition: 'right 8px center',
                }}
                {...props}
            >
                {children}
            </select>
            {error ? <p className="text-xs text-red-600">{error}</p>
                : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
        </div>
    );
});
