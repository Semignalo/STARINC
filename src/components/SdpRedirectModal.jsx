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
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent-light)] mb-5">
                        <Sparkles size={26} className="text-[var(--color-accent)]" />
                    </div>

                    <h3 className="text-xl font-serif text-gray-900 mb-3">
                        Pembelian eksklusif untuk Starcenter
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                        Halaman ini adalah katalog brand <span className="font-semibold">STARINC</span>. Transaksi langsung
                        hanya tersedia untuk member Starcenter. Untuk pembelian retail, silakan kunjungi marketplace mitra
                        kami <span className="font-semibold">SDP</span>.
                    </p>

                    <div className="flex flex-col gap-2.5">
                        <a
                            href={SDP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-[var(--color-accent)] text-white font-semibold text-sm rounded-md text-center hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} />
                            Beli di SDP
                        </a>

                        {!isLoggedIn && (
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="w-full py-3 border border-gray-900 text-gray-900 font-semibold text-sm rounded-md text-center hover:bg-gray-900 hover:text-white transition"
                            >
                                Login sebagai Starcenter
                            </Link>
                        )}

                        <Link
                            to="/partnership"
                            onClick={onClose}
                            className="w-full py-3 text-gray-500 font-medium text-xs text-center hover:text-gray-900 transition"
                        >
                            Belum jadi member? Pelajari Become Center →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
