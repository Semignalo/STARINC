import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * Modal — Linear-style: centered, max-width, backdrop blur, escape to close.
 *
 * Props:
 *  - open: boolean
 *  - onClose: function
 *  - title, subtitle: optional
 *  - size: 'sm' | 'md' | 'lg' | 'xl'
 *  - footer: ReactNode (action buttons)
 */
const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, subtitle, size = 'md', footer, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    'w-full bg-white rounded-[10px] shadow-xl border border-gray-200 max-h-[90vh] flex flex-col',
                    sizes[size],
                )}
            >
                {(title || onClose) && (
                    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-gray-100">
                        <div className="min-w-0 flex-1">
                            {title && <h2 className="text-sm font-semibold text-gray-900">{title}</h2>}
                            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 -mr-1 p-1 rounded hover:bg-gray-100"
                            aria-label="Tutup"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="px-5 py-4 overflow-y-auto flex-1">
                    {children}
                </div>
                {footer && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/40 rounded-b-[10px]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
