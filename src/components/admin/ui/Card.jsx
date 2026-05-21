import React from 'react';
import { cn } from '../../../lib/utils';

/**
 * Card — surface dasar untuk grouping konten. Flat dengan border tipis,
 * minimal shadow. Linear/Notion-style.
 */
export default function Card({ className, children, padded = true, ...props }) {
    return (
        <div
            className={cn(
                'bg-white border border-gray-200 rounded-[8px] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]',
                padded && 'p-5',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, action, className }) {
    return (
        <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
            <div className="min-w-0 flex-1">
                {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function CardBody({ children, className }) {
    return <div className={cn(className)}>{children}</div>;
}
