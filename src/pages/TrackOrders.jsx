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

    // Map display/API status to step key
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
                const isCancelledStep = step.key === 'cancelled';

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCancelledStep && isActive
                                    ? 'bg-red-100 border-red-400 text-red-600'
                                    : isActive
                                    ? 'bg-gray-900 border-gray-900 text-white'
                                    : isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                                <Icon size={13} />
                            </div>
                            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                                isCancelledStep && isActive ? 'text-red-500'
                                    : isActive ? 'text-gray-500'
                                    : isCompleted ? 'text-green-600'
                                    : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                                idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default function TrackOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                // Get orders saved in local storage on this device
                const myOrderIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (myOrderIds.length === 0) {
                    setLoading(false);
                    return;
                }

                const orderPromises = myOrderIds.map(id => orderApi.getInvoice(id).catch(() => null));
                const orderDocs = await Promise.all(orderPromises);

                const fetchedOrders = orderDocs
                    .filter(doc => doc !== null)
                    // Sort descending by created date
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
                // If found but not in local storage, add it so they can track it later
                const myOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
                if (!myOrders.includes(orderDoc.order_number)) {
                    myOrders.push(orderDoc.order_number);
                    localStorage.setItem('my_orders', JSON.stringify(myOrders));
                }

                // Add to current state if not already there
                setOrders(prev => {
                    if (prev.find(o => o.order_number === orderDoc.order_number)) return prev;
                    return [orderDoc, ...prev];
                });

                Swal.fire({
                    title: 'Pesanan Ditemukan!',
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
                text: 'ID Pesanan yang Anda masukkan tidak valid.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Menunggu Pembayaran':
                return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, label: 'Menunggu Pembayaran' };
            case 'Pesanan Diproses':
                return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package, label: 'Pesanan Diproses' };
            case 'Dikirim':
                return { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck, label: 'Dikirim' };
            case 'Selesai':
                return { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, label: 'Selesai' };
            case 'Ditolak':
                return { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, label: 'Dibatalkan' };
            default:
                return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Package, label: status };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-14 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header & Search */}
                <div className="mb-8 md:flex justify-between items-end space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-2">Pesanan Saya</h1>
                        <p className="text-gray-500">Pantau status pesanan dan riwayat belanja Anda.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex max-w-sm w-full">
                        <input
                            type="text"
                            placeholder="Cari ID Pesanan..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                        />
                        <button
                            type="submit"
                            className="bg-[#111827] text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                            <span className="text-gray-500 text-sm">Memuat pesanan...</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Belum ada pesanan</h2>
                        <p className="text-gray-500 mb-6 max-w-md">Anda belum memiliki riwayat pesanan di perangkat ini. Jika Anda sudah pernah memesan, silakan cari pesanan Anda menggunakan ID Pesanan.</p>
                        <Link to="/products" className="bg-gray-900 text-white px-6 py-3 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-accent-dark)] transition-colors">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tanggal tidak tersedia';
                            const StatusIcon = getStatusInfo(order.status).icon;
                            
                            const orderId = order.order_number || order.id;

                            return (
                                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                                    {/* Order Header */}
                                    <div className="border-b border-gray-50 p-4 md:p-5 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">Order #{String(orderId).toUpperCase()}</span>
                                                <span className="text-xs text-gray-400">|</span>
                                                <span className="text-xs text-gray-500">{dateStr}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Penerima: <span className="font-medium text-gray-900">{order.customer?.name || order.customer_info?.name || '-'}</span></p>
                                        </div>

                                        <div className={`px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium flex items-center gap-2 ${getStatusInfo(order.status).color}`}>
                                            <StatusIcon size={16} />
                                            {getStatusInfo(order.status).label}
                                        </div>
                                    </div>

                                    {/* Status Timeline */}
                                    <div className="px-4 md:px-5 pb-0 pt-3 border-b border-gray-50">
                                        <OrderTimeline status={order.status} />
                                    </div>

                                    {/* Order Items Summary */}
                                    <div className="p-4 md:p-5">
                                        <div className="flex flex-col md:flex-row gap-6">

                                            {/* Items snapshot (Showing first item preview) */}
                                            <div className="flex-1 flex gap-4 items-center">
                                                {order.items && order.items[0] && (
                                                    <>
                                                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                                            <img
                                                                src={order.items[0].product?.main_image || order.items[0].image || '/logo.png'}
                                                                alt={order.items[0].product?.title || order.items[0].title}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{order.items[0].product?.title || order.items[0].title}</h4>
                                                            {order.items[0].variant?.name && <p className="text-xs font-medium text-gray-900 mb-1">{order.items[0].variant.name}</p>}
                                                            <p className="text-xs text-gray-500 mb-1">{order.items[0].quantity}x barang</p>
                                                            {order.items.length > 1 && (
                                                                <p className="text-xs font-medium text-gray-500">
                                                                    + {order.items.length - 1} produk lainnya
                                                                </p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Action & Total */}
                                            <div className="md:w-48 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                                <div className="mb-3 w-full text-left md:text-right">
                                                    <p className="text-xs text-gray-500 mb-0.5">Total Pembayaran</p>
                                                    <p className="text-lg font-bold text-gray-900">Rp. {order.total?.toLocaleString('id-ID')}</p>
                                                </div>

                                                {/* If Waiting for payment, show pay button */}
                                                {order.status === 'Menunggu Pembayaran' ? (
                                                    <button
                                                        onClick={() => navigate(`/invoice/${orderId}`)}
                                                        className="w-full bg-[#047857] hover:bg-[#065F46] text-white py-2 px-4 rounded font-bold text-sm transition-colors"
                                                    >
                                                        Bayar Sekarang
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/invoice/${orderId}`)}
                                                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        Lihat Invoice <ArrowRight size={16} />
                                                    </button>
                                                )}
                                            </div>

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
