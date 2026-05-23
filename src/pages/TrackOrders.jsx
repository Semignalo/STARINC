import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { Package, Clock, CheckCircle, Truck, XCircle, Search, ArrowRight, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ORDER_STEPS = [
    { key: 'pending_payment', label: 'Menunggu Bayar', icon: CreditCard },
    { key: 'awaiting_confirmation', label: 'Konfirmasi', icon: Clock },
    { key: 'processing', label: 'Diproses', icon: Package },
    { key: 'completed', label: 'Selesai', icon: CheckCircle },
];

const CANCELLED_STEP = { key: 'cancelled', label: 'Dibatalkan', icon: XCircle };

function OrderTimeline({ status }) {
    const isCancelled = status === 'cancelled' || status === 'Ditolak';
    const steps = isCancelled ? [...ORDER_STEPS.slice(0, 2), CANCELLED_STEP] : ORDER_STEPS;

    const statusToKey = {
        pending_payment: 'pending_payment',
        'Menunggu Pembayaran': 'pending_payment',
        awaiting_confirmation: 'awaiting_confirmation',
        'Pesanan Diproses': 'processing',
        processing: 'processing',
        Dikirim: 'processing',
        completed: 'completed',
        Selesai: 'completed',
        cancelled: 'cancelled',
        Ditolak: 'cancelled',
    };
    const currentKey = statusToKey[status] || 'pending_payment';
    const currentIdx = steps.findIndex(s => s.key === currentKey);

    return (
        <div className="flex items-center gap-0 mt-3 mb-1">
            {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                                isActive || isCompleted
                                    ? 'bg-gray-900 border-gray-900 text-white'
                                    : 'bg-white border-gray-200 text-gray-300'
                            }`}>
                                <Icon size={11} />
                            </div>
                            <span className={`text-[10px] mt-1.5 uppercase tracking-[0.15em] whitespace-nowrap ${
                                isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                                idx < currentIdx ? 'bg-gray-900' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

const STATUS_INFO = {
    'Menunggu Pembayaran': { color: 'bg-amber-50 text-amber-700 border-amber-200',       icon: Clock,       label: 'Menunggu Bayar' },
    'Pesanan Diproses':    { color: 'bg-blue-50 text-blue-700 border-blue-200',          icon: Package,     label: 'Diproses' },
    'Dikirim':             { color: 'bg-indigo-50 text-indigo-700 border-indigo-200',    icon: Truck,       label: 'Dikirim' },
    'Selesai':             { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Selesai' },
    'Ditolak':             { color: 'bg-gray-100 text-gray-500 border-gray-200',         icon: XCircle,     label: 'Dibatalkan' },
};

export default function TrackOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const myOrderIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (myOrderIds.length === 0) {
                    setLoading(false);
                    return;
                }

                const orderPromises = myOrderIds.map(id => orderApi.getInvoice(id).catch(() => null));
                const orderDocs = await Promise.all(orderPromises);

                const fetchedOrders = orderDocs
                    .filter(doc => doc !== null)
                    .sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                        return dateB - dateA;
                    });

                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching my orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setLoading(true);
        try {
            const orderDoc = await orderApi.getInvoice(searchId.trim());

            if (orderDoc) {
                const myOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (!myOrders.includes(orderDoc.order_number)) {
                    myOrders.push(orderDoc.order_number);
                    localStorage.setItem('my_orders', JSON.stringify(myOrders));
                }

                setOrders(prev => {
                    if (prev.find(o => o.order_number === orderDoc.order_number)) return prev;
                    return [orderDoc, ...prev];
                });

                Swal.fire({
                    title: 'Pesanan Ditemukan',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                setSearchId('');
            }
        } catch (error) {
            console.error("Error searching order:", error);
            Swal.fire({
                title: 'Tidak Ditemukan',
                text: 'ID Pesanan tidak valid.',
                icon: 'error',
                confirmButtonColor: '#0F172A'
            });
        } finally {
            setLoading(false);
        }
    };

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header + Search */}
                <div className="bg-white border border-gray-200 p-7 md:p-9 mb-6 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Order Tracking</p>
                            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-1">Pesanan Saya</h1>
                            <p className="text-sm text-gray-500">Pantau status pesanan dan riwayat belanja Anda.</p>
                        </div>

                        <form onSubmit={handleSearch} className="flex w-full md:max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari ID Pesanan…"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="flex-1 h-11 px-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors rounded-l-md"
                            />
                            <button
                                type="submit"
                                className="h-11 px-4 bg-gray-900 text-white rounded-r-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                                aria-label="Cari"
                            >
                                <Search size={14} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white border border-gray-200 rounded-lg h-48 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                            <span className="text-sm text-gray-500">Memuat pesanan…</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-12 rounded-lg flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-5">
                            <Package size={18} className="text-gray-400" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">No Orders</p>
                        <h2 className="text-base font-medium text-gray-900 tracking-tight mb-2">Belum ada pesanan</h2>
                        <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                            Anda belum memiliki riwayat pesanan di perangkat ini. Jika sudah pernah memesan,
                            cari pesanan Anda menggunakan ID Pesanan di atas.
                        </p>
                        <Link to="/products" className="inline-flex items-center h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const dateStr = order.created_at
                                ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : '-';
                            const statusInfo = STATUS_INFO[order.status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package, label: order.status };
                            const StatusIcon = statusInfo.icon;
                            const orderId = order.order_number || order.id;

                            return (
                                <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">

                                    {/* Order Header */}
                                    <div className="border-b border-gray-100 px-5 py-4 flex flex-wrap justify-between items-center gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono mb-1">
                                                #{String(orderId).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-700">{dateStr}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Penerima: <span className="text-gray-900">{order.customer?.name || order.customer_info?.name || '-'}</span>
                                            </p>
                                        </div>

                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-[0.2em] border ${statusInfo.color}`}>
                                            <StatusIcon size={10} />
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Timeline */}
                                    <div className="px-5 pt-3 pb-1 border-b border-gray-100">
                                        <OrderTimeline status={order.status} />
                                    </div>

                                    {/* Items + Action */}
                                    <div className="p-5 flex flex-col md:flex-row gap-5 bg-gray-50/50">

                                        <div className="flex-1 flex gap-4 items-center">
                                            {order.items && order.items[0] && (
                                                <>
                                                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={order.items[0].product?.main_image || order.items[0].image || '/logo.png'}
                                                            alt={order.items[0].product?.title || order.items[0].title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = '/logo.png'; }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                            {order.items[0].product?.title || order.items[0].title}
                                                        </h4>
                                                        {order.items[0].variant?.name && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{order.items[0].variant.name}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{order.items[0].quantity}× barang</p>
                                                        {order.items.length > 1 && (
                                                            <p className="text-[11px] text-gray-400 mt-1">+ {order.items.length - 1} produk lainnya</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="md:w-48 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-5">
                                            <div className="mb-3 w-full text-left md:text-right">
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Total Pembayaran</p>
                                                <p className="text-base font-medium text-gray-900 tabular-nums tracking-tight">{fmt(order.total)}</p>
                                            </div>

                                            {order.status === 'Menunggu Pembayaran' ? (
                                                <button
                                                    onClick={() => navigate(`/invoice/${orderId}`)}
                                                    className="w-full h-10 btn-primary text-xs uppercase tracking-[0.2em] rounded-md"
                                                >
                                                    Bayar Sekarang
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/invoice/${orderId}`)}
                                                    className="w-full h-10 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.2em] rounded-md transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    Lihat Invoice <ArrowRight size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
