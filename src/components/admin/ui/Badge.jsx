import React from 'react';
import { cn } from '../../../lib/utils';

const colors = {
    gray:    'bg-gray-100 text-gray-700 ring-gray-200',
    accent:  'bg-[var(--admin-accent-soft)] text-[var(--admin-accent-hover)] ring-[var(--admin-accent)]/20',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger:  'bg-red-50 text-red-700 ring-red-200',
    info:    'bg-blue-50 text-blue-700 ring-blue-200',
};

export default function Badge({ color = 'gray', children, dot = false, className }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-md ring-1 ring-inset',
            colors[color],
            className,
        )}>
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[color])} />}
            {children}
        </span>
    );
}

const dotColors = {
    gray: 'bg-gray-400',
    accent: 'bg-[var(--admin-accent)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
};
