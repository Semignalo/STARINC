import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderApi } from '../../api/orderApi';
import { Package, ExternalLink, Printer, Upload, CheckCircle, Clock, Truck, XCircle, AlertCircle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../../api/client';

const STATUS_MAP = {
    pending_payment: { label: 'Menunggu Bayar', color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock },
    processing:      { label: 'Diproses',       color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: Package },
    shipped:         { label: 'Dikirim',        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',   icon: Truck },
    completed:       { label: 'Selesai',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected:        { label: 'Ditolak',        color: 'bg-gray-100 text-gray-500 border-gray-200',        icon: XCircle },
};

const STEPS = ['pending_payment', 'processing', 'shipped', 'completed'];

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-[0.2em] border ${cfg.color}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
}

function TrackingBar({ status }) {
    const isRejected = status === 'rejected';
    const currentIdx = STEPS.indexOf(status);

    return (
        <div className="relative py-4 hidden md:block">
            <div className="absolute top-1/2 left-5 right-5 h-px bg-gray-200 -translate-y-1/2 z-0" />
            <div className="relative z-10 flex justify-between px-2">
                {STEPS.map((step, idx) => {
                    const isPast = !isRejected && currentIdx >= idx;
                    const isActive = !isRejected && currentIdx === idx;
                    const cfg = STATUS_MAP[step];

                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                                ${isRejected ? 'bg-white border-gray-200 text-gray-300' :
                                  isActive ? 'bg-gray-900 border-gray-900 text-white' :
                                  isPast ? 'bg-gray-900 border-gray-900 text-white' :
                                  'bg-white border-gray-200 text-gray-300'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            </div>
                            <span className={`text-[9px] uppercase tracking-[0.15em] leading-tight text-center max-w-[80px]
                                ${isActive ? 'text-gray-900' : isPast && !isRejected ? 'text-gray-700' : 'text-gray-400'}`}>
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

            if (silent && Object.keys(prevStatusesRef.current).length > 0) {
                newOrders.forEach(order => {
                    const prev = prevStatusesRef.current[order.id];
                    if (prev && prev !== order.status) {
                        const newLabel = STATUS_LABELS[order.status] || order.status;
                        Swal.fire({
                            title: 'Status Pesanan Berubah',
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

    useEffect(() => { fetchMyOrders(); }, [fetchMyOrders]);

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
            confirmButtonColor: '#0F172A',
            cancelButtonColor: '#9ca3af',
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
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Bukti pembayaran berhasil diunggah dan sedang diverifikasi.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err), 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex justify-between mb-4">
                            <div className="h-4 w-36 bg-gray-100 rounded" />
                            <div className="h-4 w-24 bg-gray-100 rounded-md" />
                        </div>
                        <div className="h-16 w-full bg-gray-50 rounded-md" />
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white border border-gray-200 p-12 rounded-lg text-center flex flex-col items-center">
                <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-5">
                    <Package size={18} className="text-gray-400" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">No Orders</p>
                <h3 className="text-base font-medium text-gray-900 tracking-tight mb-2">Belum ada pesanan</h3>
                <p className="text-sm text-gray-500 mb-6">Yuk mulai belanja sekarang.</p>
                <Link to="/products" className="inline-flex items-center h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md">
                    Belanja Sekarang
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Section header */}
            <div className="flex items-center gap-2">
                <Package size={14} className="text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">Riwayat Pesanan</h2>
            </div>

            <div className="flex flex-col gap-4">
                {orders.map((order) => {
                    const dateStr = order.created_at
                        ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '-';

                    const canUploadProof = order.status === 'pending_payment';

                    return (
                        <div key={order.id} className="bg-white p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">

                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono mb-1">
                                        #{order.order_number}
                                    </p>
                                    <p className="text-xs text-gray-700">{dateStr}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>

                            {/* Tracking Bar */}
                            <TrackingBar status={order.status} />

                            {/* Items + Summary */}
                            <div className="flex flex-col md:flex-row gap-5 bg-gray-50 p-4 rounded-md border border-gray-100">

                                {/* Items list */}
                                <div className="flex-1 space-y-3">
                                    {order.items?.map((item, idx) => {
                                        const imageUrl = item.product?.main_image_url || '/logo.png';
                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-14 h-14 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                    <OptimizedImage src={imageUrl} alt={item.product_title} width={56} height={56} blur={false} wrapperClassName="w-full h-full" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_title}</p>
                                                    {item.variant_name && <p className="text-xs text-gray-500">{item.variant_name}</p>}
                                                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                                                        {item.quantity} × {fmt(item.unit_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Order Summary & Actions */}
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between min-w-[200px]">
                                    <div>
                                        {order.discount_amount > 0 && (
                                            <div className="text-xs text-gray-500 mb-1 flex justify-between tabular-nums">
                                                <span>Subtotal</span>
                                                <span>{fmt(order.subtotal)}</span>
                                            </div>
                                        )}
                                        {order.discount_amount > 0 && (
                                            <div className="text-xs text-gray-900 mb-2 flex justify-between tabular-nums">
                                                <span>Diskon Center</span>
                                                <span>- {fmt(order.discount_amount)}</span>
                                            </div>
                                        )}
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Total Tagihan</p>
                                        <p className="text-lg font-medium text-gray-900 tabular-nums tracking-tight mb-4">
                                            {fmt(order.total)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to={`/invoice/${order.order_number}`}
                                            className="text-[11px] uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 w-full h-9 bg-white border border-gray-200 text-gray-700 rounded-md hover:border-gray-400 transition-colors"
                                        >
                                            <ExternalLink size={12} /> Lihat Invoice
                                        </Link>

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
                                                    className="text-[11px] uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 w-full h-9 btn-primary rounded-md disabled:opacity-60"
                                                >
                                                    {uploadingId === order.id
                                                        ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Mengunggah…</>
                                                        : <><Upload size={12} /> Upload Bukti Bayar</>
                                                    }
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'completed' && (
                                            <button
                                                onClick={() => window.open(`/invoice/${order.order_number}?print=true`, '_blank')}
                                                className="text-[11px] uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 w-full h-9 bg-white border border-gray-200 text-gray-700 rounded-md hover:border-gray-400 transition-colors"
                                            >
                                                <Printer size={12} /> Cetak / Download
                                            </button>
                                        )}

                                        {order.status === 'pending_payment' && (
                                            <button
                                                onClick={() => handleCancelOrder(order)}
                                                disabled={cancellingId === order.id}
                                                className="text-[11px] uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 w-full h-9 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-md transition-colors disabled:opacity-60"
                                            >
                                                {cancellingId === order.id
                                                    ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500" /> Membatalkan…</>
                                                    : <><Ban size={12} /> Batalkan Pesanan</>
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
