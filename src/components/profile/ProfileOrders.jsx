import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderApi } from '../../api/orderApi';
import { Package, ExternalLink, Printer, Upload, CheckCircle, Clock, Truck, XCircle, AlertCircle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../../api/client';

// ── Status mapping: backend → display (bahasa Indonesia) ──
const STATUS_MAP = {
    pending_payment: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
    processing:      { label: 'Pesanan Diproses',    color: 'bg-blue-100 text-blue-800 border-blue-300',   icon: Package },
    shipped:         { label: 'Dalam Pengiriman',    color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Truck },
    completed:       { label: 'Selesai',             color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle },
    rejected:        { label: 'Ditolak',             color: 'bg-red-100 text-red-800 border-red-300',     icon: XCircle },
};

// Steps for the tracking progress bar (in order)
const STEPS = ['pending_payment', 'processing', 'shipped', 'completed'];

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-300', icon: AlertCircle };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
        </span>
    );
}

function TrackingBar({ status }) {
    const isRejected = status === 'rejected';
    const currentIdx = STEPS.indexOf(status);

    return (
        <div className="relative py-4 hidden md:block">
            {/* Line */}
            <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div className="relative z-10 flex justify-between px-2">
                {STEPS.map((step, idx) => {
                    const isPast = !isRejected && currentIdx >= idx;
                    const isActive = !isRejected && currentIdx === idx;
                    const cfg = STATUS_MAP[step];

                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                ${isRejected ? 'bg-gray-50 border-gray-200 text-gray-300' :
                                  isActive ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white scale-110 shadow-lg shadow-primary/20' :
                                  isPast ? 'bg-gray-800 border-gray-800 text-white' :
                                  'bg-white border-gray-200 text-gray-300'}`}>
                                <span className="w-2 h-2 rounded-full bg-current" />
                            </div>
                            <span className={`text-[9px] uppercase tracking-wide font-bold leading-tight text-center max-w-[64px]
                                ${isActive ? 'text-[var(--color-primary)]' : isPast && !isRejected ? 'text-gray-700' : 'text-gray-400'}`}>
                                {cfg.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const STATUS_LABELS = {
    pending_payment: 'Menunggu Pembayaran',
    processing: 'Pesanan Diproses',
    shipped: 'Dalam Pengiriman',
    completed: 'Selesai',
    rejected: 'Ditolak',
};

export default function ProfileOrders() {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const prevStatusesRef = React.useRef({});

    const fetchMyOrders = React.useCallback(async (silent = false) => {
        if (!currentUser) return;
        if (!silent) setLoading(true);
        try {
            const resp = await orderApi.getMyOrders();
            const newOrders = resp.data || [];

            // Detect status changes and toast notification
            if (silent && Object.keys(prevStatusesRef.current).length > 0) {
                newOrders.forEach(order => {
                    const prev = prevStatusesRef.current[order.id];
                    if (prev && prev !== order.status) {
                        const newLabel = STATUS_LABELS[order.status] || order.status;
                        Swal.fire({
                            title: 'Status Pesanan Berubah!',
                            html: `Pesanan <b>#${order.order_number}</b><br/>sekarang: <b>${newLabel}</b>`,
                            icon: 'info',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 5000,
                            timerProgressBar: true,
                        });
                    }
                });
            }

            // Update status reference
            const statusMap = {};
            newOrders.forEach(o => { statusMap[o.id] = o.status; });
            prevStatusesRef.current = statusMap;

            setOrders(newOrders);
        } catch (error) {
            console.error('Gagal menarik data pesanan:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    // Poll every 30 seconds for status changes
    useEffect(() => {
        const interval = setInterval(() => fetchMyOrders(true), 30000);
        return () => clearInterval(interval);
    }, [fetchMyOrders]);

    const handleCancelOrder = async (order) => {
        const result = await Swal.fire({
            title: 'Batalkan Pesanan?',
            text: `Pesanan #${order.order_number} akan dibatalkan. Tindakan ini tidak dapat diurungkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Kembali',
        });
        if (!result.isConfirmed) return;

        setCancellingId(order.id);
        try {
            await orderApi.cancelOrder(order.order_number);
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'rejected' } : o));
            Swal.fire({ icon: 'success', title: 'Dibatalkan', text: 'Pesanan berhasil dibatalkan.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err, 'Gagal membatalkan pesanan.'), 'error');
        } finally {
            setCancellingId(null);
        }
    };

    const handleUploadProof = async (orderId, file) => {
        if (!file) return;
        setUploadingId(orderId);
        try {
            await orderApi.uploadPaymentProof(orderId, file);
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Bukti pembayaran berhasil diunggah dan sedang diverifikasi.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err), 'error');
        } finally {
            setUploadingId(null);
        }
    };

    // ── Loading skeleton ──
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
                        <div className="flex justify-between mb-4">
                            <div className="h-4 w-36 bg-gray-100 rounded" />
                            <div className="h-4 w-24 bg-gray-100 rounded-full" />
                        </div>
                        <div className="h-16 w-full bg-gray-50 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                    <Package size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-500 mb-6 text-sm">Kamu belum pernah melakukan transaksi. Yuk mulai belanja sekarang!</p>
                <Link to="/products" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-md">
                    Belanja Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-[var(--color-primary)]" /> Riwayat Pesanan
            </h2>

            <div className="flex flex-col gap-5">
                {orders.map((order) => {
                    const dateStr = order.created_at
                        ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '-';

                    const canUploadProof = order.status === 'pending_payment';

                    return (
                        <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">

                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
                                <div>
                                    <div className="text-xs text-gray-400 font-mono tracking-widest mb-0.5 uppercase">
                                        #{order.order_number}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">{dateStr}</div>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            {/* Tracking Bar */}
                            <TrackingBar status={order.status} />

                            {/* Items + Summary */}
                            <div className="flex flex-col md:flex-row gap-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">

                                {/* Items list */}
                                <div className="flex-1 space-y-3">
                                    {order.items?.map((item, idx) => {
                                        // Backend kirim main_image_url (accessor) — pakai itu langsung.
                                        // Tidak ada fallback ke localhost biar tidak bocor ke production.
                                        const imageUrl = item.product?.main_image_url || '/logo.png';

                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    <img src={imageUrl} alt={item.product_title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.product_title}</p>
                                                    {item.variant_name && <p className="text-xs text-[var(--color-primary)]">{item.variant_name}</p>}
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {item.quantity} × Rp. {parseFloat(item.unit_price || 0).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Order Summary & Actions */}
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between min-w-[190px]">
                                    <div>
                                        {order.discount_amount > 0 && (
                                            <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                                <span>Subtotal</span>
                                                <span>Rp. {parseFloat(order.subtotal || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {order.discount_amount > 0 && (
                                            <div className="text-xs text-[var(--color-primary)] font-medium mb-1 flex justify-between">
                                                <span>Diskon Tier</span>
                                                <span>- Rp. {parseFloat(order.discount_amount || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Tagihan</div>
                                        <div className="text-xl font-bold text-gray-900 mb-3">
                                            Rp. {parseFloat(order.total || 0).toLocaleString('id-ID')}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to={`/invoice/${order.order_number}`}
                                            className="text-xs font-bold flex justify-center items-center gap-1.5 w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            <ExternalLink size={13} /> Lihat Invoice
                                        </Link>

                                        {/* Upload Bukti Bayar — only for pending_payment */}
                                        {canUploadProof && (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    id={`proof-${order.id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleUploadProof(order.id, e.target.files[0])}
                                                />
                                                <button
                                                    onClick={() => document.getElementById(`proof-${order.id}`).click()}
                                                    disabled={uploadingId === order.id}
                                                    className="text-xs font-bold flex justify-center items-center gap-1.5 w-full bg-yellow-50 border border-yellow-300 text-yellow-800 py-2 rounded-lg hover:bg-yellow-100 transition disabled:opacity-60"
                                                >
                                                    {uploadingId === order.id
                                                        ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-700" /> Mengunggah...</>
                                                        : <><Upload size={13} /> Upload Bukti Bayar</>
                                                    }
                                                </button>
                                            </>
                                        )}

                                        {/* Download Invoice — only for completed orders */}
                                        {order.status === 'completed' && (
                                            <button
                                                onClick={() => window.open(`/invoice/${order.order_number}?print=true`, '_blank')}
                                                className="text-xs font-bold flex justify-center items-center gap-1.5 w-full bg-gray-900 text-white border border-gray-900 py-2 rounded-lg hover:bg-gray-800 transition"
                                            >
                                                <Printer size={13} /> Cetak / Download
                                            </button>
                                        )}

                                        {/* Batalkan Pesanan — only for pending_payment */}
                                        {order.status === 'pending_payment' && (
                                            <button
                                                onClick={() => handleCancelOrder(order)}
                                                disabled={cancellingId === order.id}
                                                className="text-xs font-bold flex justify-center items-center gap-1.5 w-full border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                                            >
                                                {cancellingId === order.id
                                                    ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500" /> Membatalkan...</>
                                                    : <><Ban size={13} /> Batalkan Pesanan</>
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
