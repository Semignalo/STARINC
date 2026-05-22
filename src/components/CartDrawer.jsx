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

    // Timer state for "Cart reserved"
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    // Feedback state: track which item had a recent quantity change
    const [changedItemId, setChangedItemId] = useState(null);
    // MOQ threshold from API
    const [moqThreshold, setMoqThreshold] = useState(5000000); // Default fallback

    // Focus close button when drawer opens (keyboard accessibility)
    useEffect(() => {
        if (isCartOpen && closeButtonRef.current) {
            setTimeout(() => closeButtonRef.current?.focus(), 100);
        }
    }, [isCartOpen]);

    // Fetch MOQ threshold from server
    useEffect(() => {
        if (isStarcenter) {
            settingsApi.getSystemSettings()
                .then((data) => {
                    setMoqThreshold(data.moq_threshold ?? 5000000);
                })
                .catch((error) => {
                    console.error('Failed to fetch MOQ threshold:', error);
                    // Use default fallback
                });
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
        // Brief visual feedback on the changed item
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

    // MOQ (Minimum Order Quantity) logic for starcenter
    const moqProgress = isStarcenter ? Math.min((cartTotal / moqThreshold) * 100, 100) : 0;
    const moqRemaining = isStarcenter ? Math.max(moqThreshold - cartTotal, 0) : 0;
    const moqMet = isStarcenter ? cartTotal >= moqThreshold : true;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 backdrop-blur-sm",
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
                    "fixed inset-y-0 right-0 z-[80] w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                    isCartOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-medium tracking-tight font-medium text-gray-900">
                        Keranjang ({getCartCount()})
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={closeCart}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Tutup keranjang"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-5 py-4 bg-gray-50/50">
                    <p className="text-sm text-gray-600 mb-2">
                        {remainingForFreeShipping > 0 ? (
                            <>Tambah <span className="font-bold text-black">Rp. {remainingForFreeShipping.toLocaleString('id-ID')}</span> lagi untuk <span className="font-bold text-black">gratis ongkir!</span></>
                        ) : (
                            <span className="font-bold text-green-600">Selamat! Kamu dapat gratis ongkir.</span>
                        )}
                    </p>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* MOQ Warning for Starcenter */}
                {isStarcenter && cart.length > 0 && (
                    <div className={cn(
                        "px-5 py-4 border-b",
                        moqMet
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-amber-50 border-amber-100"
                    )}>
                        <div className="flex items-start gap-3 mb-2">
                            {moqMet ? (
                                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={cn("text-xs font-semibold uppercase tracking-wider mb-0.5",
                                    moqMet ? "text-emerald-700" : "text-amber-700"
                                )}>
                                    Starcenter MOQ
                                </p>
                                <p className={cn("text-sm",
                                    moqMet ? "text-emerald-800" : "text-amber-800"
                                )}>
                                    {moqMet ? (
                                        <span>Minimum order terpenuhi. Anda bisa checkout!</span>
                                    ) : (
                                        <>Tambah <span className="font-bold">Rp {moqRemaining.toLocaleString('id-ID')}</span> lagi untuk memenuhi MOQ Starcenter (Min. Rp 5.000.000)</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/70 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    moqMet ? "bg-emerald-500" : "bg-amber-400"
                                )}
                                style={{ width: `${moqProgress}%` }}
                            />
                        </div>
                        <p className={cn("text-xs mt-1.5 text-right font-medium",
                            moqMet ? "text-emerald-600" : "text-amber-600"
                        )}>
                            Rp {cartTotal.toLocaleString('id-ID')} / Rp {moqThreshold.toLocaleString('id-ID')}
                        </p>
                    </div>
                )}

                {/* Hot Choice Timer */}
                {cart.length > 0 && (
                    <div className="bg-[#FFF4C3] px-5 py-3 flex items-center gap-2 text-sm text-yellow-900">
                        <Clock size={16} />
                        <span>Stok dicadangkan! Selesaikan pesanan dalam <strong>{formatTime(timeLeft)}</strong></span>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-12">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <ShoppingBag size={36} className="text-gray-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Keranjang kamu kosong</p>
                                <p className="text-sm text-gray-400">Tambahkan produk untuk memulai belanja</p>
                            </div>
                            <Link
                                to="/products"
                                onClick={closeCart}
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition"
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
                                        "flex gap-4 p-3 -mx-3 rounded-xl transition-colors duration-300",
                                        isChanged ? "bg-emerald-50" : "bg-transparent"
                                    )}
                                >
                                    <div className="w-20 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                                        <img
                                            src={item.main_image_url || item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                                                {item.variantName && (
                                                    <p className="text-xs font-medium text-gray-900 mt-0.5">{item.variantName}</p>
                                                )}
                                                <p className="text-gray-500 text-xs mt-1">Rp. {item.price}</p>
                                            </div>
                                            <div className={cn(
                                                "text-sm font-bold whitespace-nowrap transition-colors duration-300",
                                                isChanged ? "text-emerald-700" : "text-gray-900"
                                            )}>
                                                Rp. {lineTotal.toLocaleString('id-ID')}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 active:bg-gray-100"
                                                    aria-label="Kurangi jumlah"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-1 text-sm font-bold min-w-[36px] text-center select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                                    className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 active:bg-gray-100"
                                                    aria-label="Tambah jumlah"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(itemId)}
                                                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                                                aria-label={`Hapus ${item.title} dari keranjang`}
                                            >
                                                <Trash2 size={16} />
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
                    <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Subtotal:</span>
                            <span>Rp. {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-gray-500">Pajak dan ongkir dihitung saat checkout</p>

                        <div className="space-y-2">
                            <button
                                onClick={() => { if (moqMet) { closeCart(); navigate('/checkout'); } }}
                                disabled={!moqMet}
                                title={!moqMet ? `Minimum order Rp ${moqThreshold.toLocaleString('id-ID')} belum terpenuhi` : ''}
                                className={cn(
                                    "w-full font-bold py-3.5 rounded-sm shadow-md transition-colors uppercase tracking-widest text-sm",
                                    moqMet
                                        ? "bg-[#047857] hover:bg-[#065F46] text-white cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                {!moqMet && isStarcenter ? `MOQ Belum Terpenuhi` : 'Checkout'}
                            </button>
                            <button
                                onClick={closeCart}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3.5 rounded-sm transition-colors uppercase tracking-widest text-sm"
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
