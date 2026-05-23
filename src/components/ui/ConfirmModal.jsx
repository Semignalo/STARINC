import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * ConfirmModal - Reusable destructive confirmation dialog
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - title: string
 * - message: string
 * - confirmLabel: string (default: "Hapus")
 * - cancelLabel: string (default: "Batal")
 * - variant: "danger" | "warning" (default: "danger")
 * - loading: boolean (optional)
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Aksi',
    message = 'Apakah Anda yakin ingin melanjutkan? Aksi ini tidak dapat dibatalkan.',
    confirmLabel = 'Hapus',
    cancelLabel = 'Batal',
    variant = 'danger',
    loading = false,
}) {
    const dialogRef = useRef(null);
    const confirmBtnRef = useRef(null);

    // Escape key closes the modal
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            // Basic focus trap: keep Tab within modal
            if (e.key === 'Tab' && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        // Auto-focus confirm button when modal opens
        setTimeout(() => confirmBtnRef.current?.focus(), 50);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            ref={dialogRef}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Tutup"
                >
                    <X size={16} />
                </button>

                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-11 h-11 rounded-full border flex items-center justify-center ${
                        isDanger ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                    }`}>
                        {isDanger ? (
                            <Trash2 size={16} className="text-red-700" />
                        ) : (
                            <AlertTriangle size={16} className="text-amber-700" />
                        )}
                    </div>
                    <div>
                        <h3
                            id="confirm-modal-title"
                            className="text-base font-medium text-gray-900 leading-tight tracking-tight"
                        >
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Actions */}
                <div className="flex gap-2.5 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="min-w-[88px] h-10 px-4 text-xs uppercase tracking-[0.2em] text-gray-700 bg-white border border-gray-200 rounded-md hover:border-gray-400 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={onConfirm}
                        disabled={loading}
                        className={`min-w-[88px] h-10 px-4 text-xs uppercase tracking-[0.2em] text-white rounded-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                    >
                        {loading && (
                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
