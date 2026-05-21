import React from 'react';
import { cn } from '../../../lib/utils';

/**
 * Button — Linear/Notion-style monochrome dengan gold accent.
 *
 * Variants:
 *  - primary  : background gelap, white text (default action)
 *  - secondary: border + transparent (alternate action)
 *  - ghost    : transparent (tertiary)
 *  - danger   : merah (destructive)
 *  - accent   : gold accent (highlight action)
 *
 * Sizes:
 *  - xs (24px), sm (28px), md (32px), lg (40px)
 */
const variants = {
    primary:   'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 disabled:bg-gray-300',
    secondary: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400',
    ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    accent:    'bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] disabled:opacity-50',
};

const sizes = {
    xs: 'h-6 px-2 text-xs gap-1',
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-sm gap-2',
};

export default function Button({
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    fullWidth = false,
    className,
    children,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={loading || props.disabled}
            className={cn(
                'inline-flex items-center justify-center font-medium rounded-[6px] transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className,
            )}
            {...props}
        >
            {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : Icon ? (
                <Icon size={size === 'xs' ? 12 : size === 'sm' ? 13 : size === 'lg' ? 16 : 14} strokeWidth={2} />
            ) : null}
            {children}
            {IconRight && <IconRight size={size === 'xs' ? 12 : size === 'sm' ? 13 : size === 'lg' ? 16 : 14} strokeWidth={2} />}
        </button>
    );
}
