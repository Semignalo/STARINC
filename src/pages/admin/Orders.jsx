import React, { useState, useEffect } from 'react';
import { adminOrderApi } from '../../api/orderApi';
import { adminApi } from '../../api/adminApi';
import { Eye, Edit2, CheckCircle, XCircle, Search, Clock, Box, Rocket, Download, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText, Check, X, Printer, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { printInvoice, printSuratJalan } from '../../utils/printOrder';
import CreateOrderModal from '../../components/admin/CreateOrderModal';

// Status enum values (backend)
const STATUS_ENUM = {
    PENDING_PAYMENT: 'pending_payment',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    COMPLETED: 'completed',
    REJECTED: 'rejected'
};

// Display labels in Indonesian
const STATUS_DISPLAY = {
    pending_payment: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    processing: { label: 'Pesanan Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Box },
    shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Rocket },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
};

const ALL_STATUSES = Object.keys(STATUS_ENUM).map(key => STATUS_ENUM[key]);

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [createOrderModal, setCreateOrderModal] = useState(false);

    // Date range filter
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Payment review modal
    const [paymentReviewModal, setPaymentReviewModal] = useState(false);
    const [paymentReviewStatus, setPaymentReviewStatus] = useState('');
    const [paymentReviewNotes, setPaymentReviewNotes] = useState('');
    const [submittingPaymentReview, setSubmittingPaymentReview] = useState(false);
    const [paymentProofUrl, setPaymentProofUrl] = useState('');

    // Tracking modal
    const [trackingModal, setTrackingModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingProvider, setShippingProvider] = useState('');
    const [submittingTracking, setSubmittingTracking] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const data = await adminApi.exportOrders(params);
            if (data.length === 0) {
                Swal.fire('Info', 'Tidak ada data pesanan.', 'info');
                return;
            }
            const headers = Object.keys(data[0]);
            const csvRows = [];
            csvRows.push(headers.join(','));
            for (const row of data) {
                csvRows.push(headers.map(h => `"${('' + row[h]).replace(/"/g, '\\"')}"`).join(','));
            }
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `export_orders_${new Date().getTime()}.csv`);
            a.click();
        } catch {
            Swal.fire('Error', 'Gagal ekspor data pesanan.', 'error');
        } finally {
            setExporting(false);
        }
    };

    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const data = await adminOrderApi.getOrders(params);

            if (data.data) {
                setOrders(data.data);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);
                setTotal(data.total || 0);
            } else {
                setOrders(data);
                setCurrentPage(1);
                setLastPage(1);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders(1);
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchOrders(currentPage);
        }
    }, [currentPage]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const targetOrder = orders.find(o => o.id === orderId);
            const oldStatus = targetOrder.status;

            if (oldStatus !== newStatus) {
                await adminOrderApi.updateStatus(orderId, newStatus);
            }

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            Swal.fire({
                title: 'Berhasil',
                text: `Status pesanan berhasil diubah menjadi ${STATUS_DISPLAY[newStatus].label}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire('Error', 'Gagal memperbarui status.', 'error');
        }
    };

    const handlePaymentReview = async () => {
        if (!paymentReviewStatus) {
            Swal.fire('Error', 'Pilih status review pembayaran.', 'error');
            return;
        }

        try {
            setSubmittingPaymentReview(true);
            await adminOrderApi.reviewPayment(selectedOrder.id, paymentReviewStatus, paymentReviewNotes);

            // Update payment proof in selectedOrder
            setSelectedOrder({
                ...selectedOrder,
                payment_proof: {
                    ...selectedOrder.payment_proof,
                    status: paymentReviewStatus,
                    admin_notes: paymentReviewNotes,
                    reviewed_at: new Date()
                }
            });

            // If approved, also update order status to processing
            if (paymentReviewStatus === 'approved' && selectedOrder.status === 'pending_payment') {
                setSelectedOrder({ ...selectedOrder, status: 'processing' });
                setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'processing' } : o));
            }

            setPaymentReviewModal(false);
            setPaymentReviewStatus('');
            setPaymentReviewNotes('');

            Swal.fire('Berhasil', 'Review pembayaran berhasil disimpan.', 'success');
        } catch (error) {
            console.error("Error reviewing payment:", error);
            Swal.fire('Error', 'Gagal menyimpan review pembayaran.', 'error');
        } finally {
            setSubmittingPaymentReview(false);
        }
    };

    const openPaymentProof = (proofId) => {
        if (proofId) {
            const url = `/api/admin/payment-proofs/${proofId}/file`;
            window.open(url, '_blank');
        }
    };

    const handleUpdateTracking = async () => {
        if (!trackingNumber.trim()) {
            Swal.fire('Error', 'Nomor resi harus diisi.', 'error');
            return;
        }

        try {
            setSubmittingTracking(true);
            await adminOrderApi.updateTracking(selectedOrder.id, trackingNumber, shippingProvider);

            setSelectedOrder({
                ...selectedOrder,
                tracking_number: trackingNumber,
                shipping_provider: shippingProvider
            });

            setOrders(orders.map(o => o.id === selectedOrder.id ? {
                ...o,
                tracking_number: trackingNumber,
                shipping_provider: shippingProvider
            } : o));

            setTrackingModal(false);
            setTrackingNumber('');
            setShippingProvider('');

            Swal.fire('Berhasil', 'Nomor resi berhasil diperbarui.', 'success');
        } catch (error) {
            console.error("Error updating tracking:", error);
            Swal.fire('Error', 'Gagal memperbarui nomor resi.', 'error');
        } finally {
            setSubmittingTracking(false);
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setPaymentReviewModal(false);
        setPaymentReviewStatus('');
        setPaymentReviewNotes('');
        setTrackingModal(false);
        setTrackingNumber(order.tracking_number || '');
        setShippingProvider(order.shipping_provider || '');
    };

    const statusCounts = ALL_STATUSES.reduce((acc, status) => {
        acc[status] = orders.filter(o => o.status === status).length;
        return acc;
    }, {});

    const filteredOrders = orders.filter(o => {
        const _id = o.order_number || o.id;
        const matchesSearch = String(_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
               (o.customer_info?.name || o.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-sm text-gray-500">Kelola pesanan dari customer</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari ID Pesanan / Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setCreateOrderModal(true)}
                        className="bg-[var(--color-accent)] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                    >
                        <Plus size={16} />
                        Buat Pesanan
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                    >
                        {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                        Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100 space-y-3">
                <div className="flex gap-3 items-end flex-wrap">
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        />
                    </div>
                    <button
                        onClick={() => { setDateFrom(''); setDateTo(''); }}
                        className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                    >
                        Reset Tanggal
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'all'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Semua
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {total}
                    </span>
                </button>
                {ALL_STATUSES.map(status => {
                    const display = STATUS_DISPLAY[status];
                    const Icon = display.icon;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                statusFilter === status
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Icon size={14} />
                            {display.label}
                            {statusCounts[status] > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${statusFilter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {statusCounts[status]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Memuat pesanan...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada pesanan ditemukan.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 text-sm">
                                    <tr>
                                        <th className="p-4">Tanggal / ID</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map((order) => {
                                        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tanggal tidak tersedia';
                                        const orderId = order.order_number || order.id;
                                        const customer = order.customer_info || order.customer || {};
                                        const display = STATUS_DISPLAY[order.status];

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="text-xs text-gray-400 mb-1">{dateStr}</div>
                                                    <div className="text-sm font-medium text-gray-900">#{String(orderId).slice(-6).toUpperCase()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-xs text-gray-500">{customer.city}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center w-max ${display.color}`}>
                                                        <display.icon size={14} className="mr-1" />
                                                        {display.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900">
                                                    Rp. {Number(order.total || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openOrderDetails(order)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail Pesanan"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => printInvoice(order)}
                                                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Cetak Faktur"
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((currentPage - 1) * 30) + 1} - {Math.min(currentPage * 30, total)} dari {total} pesanan
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ChevronLeft size={16} /> Sebelumnya
                                    </button>
                                    <div className="px-3 py-2 text-sm font-medium text-gray-600">
                                        {currentPage} / {lastPage}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
                                        disabled={currentPage === lastPage}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        Selanjutnya <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col pt-6 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Detail Pesanan</h2>
                                <p className="text-sm text-gray-500">#{selectedOrder.order_number || String(selectedOrder.id)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => printInvoice(selectedOrder)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-semibold transition"
                                    title="Cetak Faktur Penjualan"
                                >
                                    <Printer size={14} /> Faktur
                                </button>
                                <button
                                    onClick={() => printSuratJalan(selectedOrder)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
                                    title="Cetak Surat Jalan"
                                >
                                    <Printer size={14} /> Surat Jalan
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">

                            {/* Update Status Actions */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Ubah Status Pesanan</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_STATUSES.map(status => {
                                        const display = STATUS_DISPLAY[status];
                                        const Icon = display.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border flex items-center gap-1 ${selectedOrder.status === status ? display.color : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <Icon size={14} />
                                                {display.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Payment Proof Review */}
                            {selectedOrder.payment_proof && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-3">📋 Bukti Pembayaran</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Status:</span>
                                                    {selectedOrder.payment_proof.status === 'pending' && (
                                                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Menunggu Review</span>
                                                    )}
                                                    {selectedOrder.payment_proof.status === 'approved' && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Disetujui</span>
                                                    )}
                                                    {selectedOrder.payment_proof.status === 'rejected' && (
                                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Ditolak</span>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => openPaymentProof(selectedOrder.payment_proof.id)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <FileText size={14} /> Lihat File
                                            </button>
                                        </div>
                                        {selectedOrder.payment_proof.admin_notes && (
                                            <p className="text-xs text-blue-700 bg-white p-2 rounded border border-blue-200">
                                                <strong>Catatan Admin:</strong> {selectedOrder.payment_proof.admin_notes}
                                            </p>
                                        )}
                                        {selectedOrder.payment_proof.status === 'pending' && (
                                            <button
                                                onClick={() => setPaymentReviewModal(true)}
                                                className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
                                            >
                                                Review Bukti Pembayaran
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tracking Number Section */}
                            {(selectedOrder.status === 'shipped' || selectedOrder.tracking_number) && (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <h3 className="text-sm font-semibold text-purple-900 mb-3">📦 Nomor Resi</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.tracking_number ? (
                                            <>
                                                <div className="bg-white p-3 rounded border border-purple-200">
                                                    <p className="text-xs text-purple-600 mb-1">Nomor Resi</p>
                                                    <p className="text-sm font-bold text-purple-900">{selectedOrder.tracking_number}</p>
                                                    {selectedOrder.shipping_provider && (
                                                        <p className="text-xs text-purple-600 mt-1">via {selectedOrder.shipping_provider}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setTrackingNumber(selectedOrder.tracking_number || '');
                                                        setShippingProvider(selectedOrder.shipping_provider || '');
                                                        setTrackingModal(true);
                                                    }}
                                                    className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition"
                                                >
                                                    Ubah Nomor Resi
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setTrackingModal(true)}
                                                className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition"
                                            >
                                                Tambah Nomor Resi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-3">Informasi Customer</h3>
                                    <div className="text-sm space-y-2 text-gray-600">
                                        <p><span className="font-medium text-gray-900">Nama:</span> {(selectedOrder.customer_info || selectedOrder.customer)?.name}</p>
                                        <p><span className="font-medium text-gray-900">Telepon:</span> {(selectedOrder.customer_info || selectedOrder.customer)?.phone}</p>
                                        <p><span className="font-medium text-gray-900">Alamat:</span><br />{(selectedOrder.customer_info || selectedOrder.customer)?.address}</p>
                                        <p>{(selectedOrder.customer_info || selectedOrder.customer)?.city}, {(selectedOrder.customer_info || selectedOrder.customer)?.postal_code || (selectedOrder.customer_info || selectedOrder.customer)?.postalCode}</p>
                                    </div>
                                </div>

                                {/* Order Summary Block */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-max">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">Rincian Biaya</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>Rp. {Number(selectedOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        {selectedOrder.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Diskon ({selectedOrder.discount_percent || 0}%)</span>
                                                <span>-Rp. {Number(selectedOrder.discount_amount).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Ongkos Kirim</span>
                                            <span>Rp. {Number(selectedOrder.shipping_cost || selectedOrder.shipping || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-gray-900 text-base">
                                            <span>Total</span>
                                            <span>Rp. {Number(selectedOrder.total || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-3">Daftar Produk ({selectedOrder.items?.length || 0})</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center border border-gray-100 rounded-lg p-3 bg-white">
                                            <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={item.product?.main_image_url || item.product?.main_image || item.image || '/logo.png'} alt={item.product?.title || item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900">{item.product?.title || item.title}</h4>
                                                {item.variant?.name && <p className="text-xs font-medium text-[var(--color-primary)] mb-1">{item.variant.name}</p>}
                                                <p className="text-xs text-gray-500">{item.product?.category || item.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{item.quantity}x @ Rp. {Number(item.unit_price || item.price).toLocaleString('id-ID')}</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    Rp. {(Number(item.unit_price || item.price) * item.quantity).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Payment Review Modal */}
            {paymentReviewModal && selectedOrder?.payment_proof && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Review Bukti Pembayaran</h3>
                            <button onClick={() => setPaymentReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {/* File Preview */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">File Bukti</label>
                                <button
                                    onClick={() => openPaymentProof(selectedOrder.payment_proof.id)}
                                    className="w-full px-4 py-3 border-2 border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-blue-600 font-medium text-sm"
                                >
                                    <FileText size={18} /> Buka File Bukti Pembayaran
                                </button>
                            </div>

                            {/* Status Options */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Review</label>
                                <div className="space-y-2">
                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-green-50" style={{borderColor: paymentReviewStatus === 'approved' ? 'var(--color-accent)' : '#ccc'}}>
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value="approved"
                                            checked={paymentReviewStatus === 'approved'}
                                            onChange={(e) => setPaymentReviewStatus(e.target.value)}
                                            className="mr-3"
                                        />
                                        <Check size={18} className="text-green-600 mr-2" />
                                        <span className="font-medium text-gray-900">Disetujui</span>
                                        <span className="text-xs text-gray-500 ml-auto">(Otomatis ubah status ke Diproses)</span>
                                    </label>
                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-red-50" style={{borderColor: paymentReviewStatus === 'rejected' ? 'var(--color-accent)' : '#ccc'}}>
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value="rejected"
                                            checked={paymentReviewStatus === 'rejected'}
                                            onChange={(e) => setPaymentReviewStatus(e.target.value)}
                                            className="mr-3"
                                        />
                                        <X size={18} className="text-red-600 mr-2" />
                                        <span className="font-medium text-gray-900">Ditolak</span>
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Opsional)</label>
                                <textarea
                                    value={paymentReviewNotes}
                                    onChange={(e) => setPaymentReviewNotes(e.target.value)}
                                    placeholder="Tulis alasan jika ditolak, atau catatan lainnya..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] resize-none"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
                            <button
                                onClick={() => setPaymentReviewModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePaymentReview}
                                disabled={submittingPaymentReview}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submittingPaymentReview ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                                Simpan Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingModal && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Nomor Resi Pengiriman</h3>
                            <button onClick={() => setTrackingModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {/* Tracking Number */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Resi</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Contoh: 1234567890"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
                                />
                            </div>

                            {/* Shipping Provider */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kurir Pengiriman (Opsional)</label>
                                <select
                                    value={shippingProvider}
                                    onChange={(e) => setShippingProvider(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
                                >
                                    <option value="">-- Pilih Kurir --</option>
                                    <option value="JNE">JNE</option>
                                    <option value="TIKI">TIKI</option>
                                    <option value="Pos Indonesia">Pos Indonesia</option>
                                    <option value="GoSend">GoSend</option>
                                    <option value="Grab">Grab</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
                            <button
                                onClick={() => setTrackingModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateTracking}
                                disabled={submittingTracking}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submittingTracking ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                                Simpan Resi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={createOrderModal}
                onClose={() => setCreateOrderModal(false)}
                onOrderCreated={() => fetchOrders(currentPage)}
            />
        </div>
    );
}
