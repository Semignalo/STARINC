import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, Clock, AlertTriangle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { settingsApi } from '../api/settingsApi';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount
    } = useCart();

    const { userData } = useAuth();
    const isStarcenter = userData?.role === 'starcenter';

    const navigate = useNavigate();
    const closeButtonRef = useRef(null);

    const [timeLeft, setTimeLeft] = useState(300);
    const [changedItemId, setChangedItemId] = useState(null);
    const [moqThreshold, setMoqThreshold] = useState(5000000);

    useEffect(() => {
        if (isCartOpen && closeButtonRef.current) {
            setTimeout(() => closeButtonRef.current?.focus(), 100);
        }
    }, [isCartOpen]);

    useEffect(() => {
        if (isStarcenter) {
            settingsApi.getSystemSettings()
                .then((data) => setMoqThreshold(data.moq_threshold ?? 5000000))
                .catch((error) => console.error('Failed to fetch MOQ threshold:', error));
        }
    }, [isStarcenter]);

    useEffect(() => {
        if (!isCartOpen) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isCartOpen]);

    const handleUpdateQuantity = (itemId, newQty) => {
        updateQuantity(itemId, newQty);
        setChangedItemId(itemId);
        setTimeout(() => setChangedItemId(null), 600);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const cartTotal = getCartTotal();
    const freeShippingThreshold = 500000;
    const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const remainingForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);

    const moqProgress = isStarcenter ? Math.min((cartTotal / moqThreshold) * 100, 100) : 0;
    const moqRemaining = isStarcenter ? Math.max(moqThreshold - cartTotal, 0) : 0;
    const moqMet = isStarcenter ? cartTotal >= moqThreshold : true;

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 backdrop-blur-sm",
                    isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Keranjang belanja"
                className={cn(
                    "fixed inset-y-0 right-0 z-[80] w-full sm:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Keranjang</p>
                        <h2 className="text-base font-medium text-gray-900 tracking-tight mt-0.5">
                            {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
                        </h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={closeCart}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
                        aria-label="Tutup keranjang"
                    >
                        <X size={16} className="text-gray-700" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                {cart.length > 0 && (
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                            {remainingForFreeShipping > 0 ? (
                                <>Tambah <span className="font-medium text-gray-900">{fmt(remainingForFreeShipping)}</span> lagi untuk <span className="font-medium text-gray-900">gratis ongkir</span></>
                            ) : (
                                <span className="font-medium text-gray-900">Selamat! Kamu dapat gratis ongkir.</span>
                            )}
                        </p>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gray-900 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* MOQ Warning for Starcenter */}
                {isStarcenter && cart.length > 0 && (
                    <div className={cn(
                        "px-5 py-4 border-b",
                        moqMet ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"
                    )}>
                        <div className="flex items-start gap-2.5 mb-2">
                            {moqMet ? (
                                <ShieldCheck size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={cn("text-[10px] uppercase tracking-[0.25em] mb-1",
                                    moqMet ? "text-emerald-700" : "text-amber-700"
                                )}>
                                    Starcenter MOQ
                                </p>
                                <p className={cn("text-xs leading-relaxed",
                                    moqMet ? "text-emerald-800" : "text-amber-800"
                                )}>
                                    {moqMet ? (
                                        'Minimum order terpenuhi. Siap checkout.'
                                    ) : (
                                        <>Tambah <span className="font-medium">{fmt(moqRemaining)}</span> lagi untuk memenuhi MOQ (Min. {fmt(moqThreshold)})</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-white rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    moqMet ? "bg-emerald-600" : "bg-amber-500"
                                )}
                                style={{ width: `${moqProgress}%` }}
                            />
                        </div>
                        <p className={cn("text-[11px] mt-1.5 text-right tabular-nums",
                            moqMet ? "text-emerald-700" : "text-amber-700"
                        )}>
                            {fmt(cartTotal)} / {fmt(moqThreshold)}
                        </p>
                    </div>
                )}

                {/* Hot Choice Timer */}
                {cart.length > 0 && (
                    <div className="bg-gray-50 px-5 py-2.5 flex items-center gap-2 text-xs text-gray-600 border-b border-gray-100">
                        <Clock size={12} className="text-gray-400" />
                        <span>Stok dicadangkan • Selesaikan dalam <span className="font-medium text-gray-900 tabular-nums">{formatTime(timeLeft)}</span></span>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-12">
                            <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center">
                                <ShoppingBag size={20} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Keranjang kosong</p>
                                <p className="text-xs text-gray-500">Tambahkan produk untuk memulai belanja</p>
                            </div>
                            <Link
                                to="/products"
                                onClick={closeCart}
                                className="inline-flex items-center gap-2 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md"
                            >
                                Lihat Produk
                            </Link>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const itemId = item.cartItemId || item.id;
                            const lineTotal = parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity;
                            const isChanged = changedItemId === itemId;
                            return (
                                <div
                                    key={itemId}
                                    className={cn(
                                        "flex gap-4 transition-colors duration-300",
                                        isChanged ? "bg-emerald-50/40 -mx-3 px-3 py-2 rounded-md" : ""
                                    )}
                                >
                                    <div className="w-20 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                        <img
                                            src={item.main_image_url || item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.title}</h3>
                                                {item.variantName && (
                                                    <p className="text-[11px] text-gray-500 mt-0.5">{item.variantName}</p>
                                                )}
                                                <p className="text-gray-400 text-xs mt-1 tabular-nums">{fmt(item.price)}</p>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-medium whitespace-nowrap tabular-nums transition-colors duration-300",
                                                isChanged ? "text-emerald-700" : "text-gray-900"
                                            )}>
                                                {fmt(lineTotal)}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                                                    aria-label="Kurangi jumlah"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="px-2 text-xs font-medium min-w-[32px] text-center select-none tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                                                    aria-label="Tambah jumlah"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(itemId)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors rounded-md"
                                                aria-label={`Hapus ${item.title} dari keranjang`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-5 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Subtotal</span>
                            <span className="text-lg font-medium text-gray-900 tabular-nums tracking-tight">{fmt(cartTotal)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">Pajak dan ongkir dihitung saat checkout</p>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => { if (moqMet) { closeCart(); navigate('/checkout'); } }}
                                disabled={!moqMet}
                                title={!moqMet ? `Minimum order ${fmt(moqThreshold)} belum terpenuhi` : ''}
                                className={cn(
                                    "w-full h-12 rounded-md text-xs uppercase tracking-[0.25em] transition-colors",
                                    moqMet
                                        ? "btn-primary cursor-pointer"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed border-b-2 border-gray-200"
                                )}
                            >
                                {!moqMet && isStarcenter ? 'MOQ Belum Terpenuhi' : 'Checkout'}
                            </button>
                            <button
                                onClick={closeCart}
                                className="w-full h-12 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.25em] rounded-md transition-colors"
                            >
                                Lanjut Belanja
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
