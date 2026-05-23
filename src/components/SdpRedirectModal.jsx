import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Sparkles } from 'lucide-react';

// URL SDP marketplace — TODO: pindah ke system_settings saat SDP launch
const SDP_URL = '#';

export default function SdpRedirectModal({ open, onClose, isLoggedIn = false }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-md w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Tutup"
                >
                    <X size={20} />
                </button>

                <div className="p-7 pt-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 mb-5">
                        <Sparkles size={18} className="text-[var(--color-accent)]" />
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Members Only</p>
                    <h3 className="text-xl font-medium tracking-tight text-gray-900 mb-3">
                        Pembelian Eksklusif Starcenter
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Halaman ini adalah katalog brand <span className="text-gray-900">STARINC</span>. Transaksi langsung
                        hanya tersedia untuk member Starcenter. Untuk pembelian retail, silakan kunjungi marketplace mitra
                        kami <span className="text-gray-900">SDP</span>.
                    </p>

                    <div className="flex flex-col gap-2.5">
                        <a
                            href={SDP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 btn-primary text-xs uppercase tracking-[0.25em] rounded-md flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={12} />
                            Beli di SDP
                        </a>

                        {!isLoggedIn && (
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="w-full h-11 border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.25em] rounded-md text-center transition-colors flex items-center justify-center"
                            >
                                Login sebagai Starcenter
                            </Link>
                        )}

                        <Link
                            to="/partnership"
                            onClick={onClose}
                            className="w-full py-2 text-gray-500 text-xs text-center hover:text-gray-900 transition-colors"
                        >
                            Belum jadi member? Pelajari Become Center →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
