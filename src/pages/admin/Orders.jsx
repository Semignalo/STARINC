import React, { useState, useEffect } from 'react';
import { adminOrderApi } from '../../api/orderApi';
import { adminApi } from '../../api/adminApi';
import { Eye, Edit2, CheckCircle, XCircle, Search, Clock, Box, Rocket, Download, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText, Check, X, Printer, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { printInvoice, printSuratJalan } from '../../utils/printOrder';
import CreateOrderModal from '../../components/admin/CreateOrderModal';
import Button from '../../components/admin/ui/Button';
import Input, { Textarea, Select } from '../../components/admin/ui/Input';
import Badge from '../../components/admin/ui/Badge';
import Modal from '../../components/admin/ui/Modal';
import { cn } from '../../lib/utils';

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
    pending_payment: { label: 'Menunggu Pembayaran', badge: 'warning', icon: Clock },
    processing: { label: 'Diproses', badge: 'info', icon: Box },
    shipped: { label: 'Dikirim', badge: 'info', icon: Rocket },
    completed: { label: 'Selesai', badge: 'success', icon: CheckCircle },
    rejected: { label: 'Ditolak', badge: 'danger', icon: XCircle }
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
        <div className="max-w-7xl">
            <div className="flex justify-between items-end mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Pesanan</h1>
                    <p className="text-xs text-gray-500 mt-1">Kelola pesanan dari customer</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-64">
                        <Input
                            icon={Search}
                            type="text"
                            placeholder="Cari ID / Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" icon={Plus} onClick={() => setCreateOrderModal(true)}>
                        Buat Pesanan
                    </Button>
                    <Button variant="primary" icon={exporting ? RefreshCw : Download} onClick={handleExport} disabled={exporting}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white border border-gray-200 rounded-[8px] p-3 mb-4">
                <div className="flex gap-2 items-end flex-wrap">
                    <div>
                        <label className="text-[11px] font-medium text-gray-700 block mb-1">Dari</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-9 px-3 border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)]"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-medium text-gray-700 block mb-1">Sampai</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-9 px-3 border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)]"
                        />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                        Reset
                    </Button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={cn('px-2.5 h-8 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-colors border',
                        statusFilter === 'all'
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
                >
                    Semua
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold',
                        statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
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
                            className={cn('px-2.5 h-8 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-medium whitespace-nowrap transition-colors border',
                                statusFilter === status
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
                        >
                            <Icon size={12} />
                            {display.label}
                            {statusCounts[status] > 0 && (
                                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold',
                                    statusFilter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
                                    {statusCounts[status]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat pesanan…</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-sm text-gray-400">Tidak ada pesanan.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/60 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Tanggal / ID</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Customer</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Status</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Total</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map((order) => {
                                        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                                        const orderId = order.order_number || order.id;
                                        const customer = order.customer_info || order.customer || {};
                                        const display = STATUS_DISPLAY[order.status];

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <div className="text-[11px] text-gray-400">{dateStr}</div>
                                                    <div className="text-sm font-mono text-gray-900">#{String(orderId).slice(-6).toUpperCase()}</div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-xs text-gray-500">{customer.city}</div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <Badge color={display?.badge || 'gray'} dot>
                                                        {display?.label || order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-medium text-gray-900 tabular-nums">
                                                    Rp{Number(order.total || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center justify-end gap-0.5">
                                                        <button
                                                            onClick={() => openOrderDetails(order)}
                                                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => printInvoice(order)}
                                                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                            title="Cetak Faktur"
                                                        >
                                                            <Printer size={14} />
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
            <Modal
                open={isModalOpen && !!selectedOrder}
                onClose={() => setIsModalOpen(false)}
                title="Detail Pesanan"
                subtitle={selectedOrder ? `#${selectedOrder.order_number || String(selectedOrder.id)}` : ''}
                size="xl"
                footer={
                    <>
                        <Button variant="secondary" size="sm" icon={Printer} onClick={() => printInvoice(selectedOrder)}>
                            Faktur
                        </Button>
                        <Button variant="secondary" size="sm" icon={Printer} onClick={() => printSuratJalan(selectedOrder)}>
                            Surat Jalan
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Tutup</Button>
                    </>
                }
            >
                {selectedOrder && (
                    <div className="space-y-5">
                        {/* Status Actions */}
                        <section>
                            <h4 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Ubah Status</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_STATUSES.map(status => {
                                    const display = STATUS_DISPLAY[status];
                                    const Icon = display.icon;
                                    const isActive = selectedOrder.status === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                            className={cn('px-2.5 h-8 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-medium border transition-colors',
                                                isActive
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
                                        >
                                            <Icon size={12} />
                                            {display.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Payment Proof Review */}
                        {selectedOrder.payment_proof && (
                            <section className="bg-gray-50/60 border border-gray-200 rounded-[8px] p-4">
                                <h4 className="text-xs font-semibold text-gray-900 mb-3">Bukti Pembayaran</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span>Status:</span>
                                            <Badge color={
                                                selectedOrder.payment_proof.status === 'approved' ? 'success'
                                                : selectedOrder.payment_proof.status === 'rejected' ? 'danger'
                                                : 'warning'
                                            } dot>
                                                {selectedOrder.payment_proof.status === 'approved' ? 'Disetujui'
                                                : selectedOrder.payment_proof.status === 'rejected' ? 'Ditolak'
                                                : 'Menunggu Review'}
                                            </Badge>
                                        </div>
                                        <Button variant="secondary" size="xs" icon={FileText} onClick={() => openPaymentProof(selectedOrder.payment_proof.id)}>
                                            Lihat File
                                        </Button>
                                    </div>
                                    {selectedOrder.payment_proof.admin_notes && (
                                        <p className="text-xs text-gray-700 bg-white border border-gray-200 p-2.5 rounded-md">
                                            <span className="font-medium">Catatan Admin:</span> {selectedOrder.payment_proof.admin_notes}
                                        </p>
                                    )}
                                    {selectedOrder.payment_proof.status === 'pending' && (
                                        <Button variant="primary" size="sm" fullWidth onClick={() => setPaymentReviewModal(true)}>
                                            Review Bukti Pembayaran
                                        </Button>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Tracking Number */}
                        {(selectedOrder.status === 'shipped' || selectedOrder.tracking_number) && (
                            <section className="bg-gray-50/60 border border-gray-200 rounded-[8px] p-4">
                                <h4 className="text-xs font-semibold text-gray-900 mb-3">Nomor Resi</h4>
                                <div className="space-y-2.5">
                                    {selectedOrder.tracking_number ? (
                                        <>
                                            <div className="bg-white border border-gray-200 rounded-md p-2.5">
                                                <p className="text-[11px] text-gray-500">Resi</p>
                                                <p className="text-sm font-mono text-gray-900">{selectedOrder.tracking_number}</p>
                                                {selectedOrder.shipping_provider && (
                                                    <p className="text-[11px] text-gray-500 mt-1">via {selectedOrder.shipping_provider}</p>
                                                )}
                                            </div>
                                            <Button variant="secondary" size="sm" fullWidth onClick={() => {
                                                setTrackingNumber(selectedOrder.tracking_number || '');
                                                setShippingProvider(selectedOrder.shipping_provider || '');
                                                setTrackingModal(true);
                                            }}>
                                                Ubah Nomor Resi
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="primary" size="sm" fullWidth onClick={() => setTrackingModal(true)}>
                                            Tambah Nomor Resi
                                        </Button>
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Customer */}
                            <section>
                                <h4 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">Customer</h4>
                                <div className="text-xs space-y-1.5 text-gray-700">
                                    <p><span className="text-gray-400">Nama:</span> <span className="text-gray-900">{(selectedOrder.customer_info || selectedOrder.customer)?.name}</span></p>
                                    <p><span className="text-gray-400">Telepon:</span> <span className="text-gray-900">{(selectedOrder.customer_info || selectedOrder.customer)?.phone}</span></p>
                                    <p className="text-gray-900">{(selectedOrder.customer_info || selectedOrder.customer)?.address}</p>
                                    <p className="text-gray-500">{(selectedOrder.customer_info || selectedOrder.customer)?.city}, {(selectedOrder.customer_info || selectedOrder.customer)?.postal_code || (selectedOrder.customer_info || selectedOrder.customer)?.postalCode}</p>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className="bg-gray-50/60 border border-gray-200 rounded-[8px] p-3 h-max">
                                <h4 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-200">Rincian</h4>
                                <div className="space-y-1.5 text-xs tabular-nums">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>Rp{Number(selectedOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                    {selectedOrder.discount_amount > 0 && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Diskon ({selectedOrder.discount_percent || 0}%)</span>
                                            <span>-Rp{Number(selectedOrder.discount_amount).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Ongkir</span>
                                        <span>Rp{Number(selectedOrder.shipping_cost || selectedOrder.shipping || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 mt-1 border-t border-gray-200 font-semibold text-gray-900 text-sm">
                                        <span>Total</span>
                                        <span>Rp{Number(selectedOrder.total || 0).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Items */}
                        <section>
                            <h4 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
                                Produk ({selectedOrder.items?.length || 0})
                            </h4>
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-center border border-gray-200 rounded-md p-2.5 bg-white">
                                        <div className="w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                            <img src={item.product?.main_image_url || item.product?.main_image || item.image || '/logo.png'} alt={item.product?.title || item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-medium text-gray-900 truncate">{item.product?.title || item.title}</h5>
                                            {item.variant?.name && <p className="text-[11px] text-[var(--admin-accent-hover)]">{item.variant.name}</p>}
                                            <p className="text-[11px] text-gray-400">{item.product?.category || item.category}</p>
                                        </div>
                                        <div className="text-right tabular-nums shrink-0">
                                            <p className="text-[11px] text-gray-500">{item.quantity}x @ Rp{Number(item.unit_price || item.price).toLocaleString('id-ID')}</p>
                                            <p className="text-sm font-semibold text-gray-900">Rp{(Number(item.unit_price || item.price) * item.quantity).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </Modal>

            {/* Payment Review Modal */}
            <Modal
                open={paymentReviewModal && !!selectedOrder?.payment_proof}
                onClose={() => setPaymentReviewModal(false)}
                title="Review Bukti Pembayaran"
                size="md"
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setPaymentReviewModal(false)}>Batal</Button>
                        <Button variant="primary" size="sm" icon={Check} loading={submittingPaymentReview} onClick={handlePaymentReview}>
                            Simpan Review
                        </Button>
                    </>
                }
            >
                {selectedOrder?.payment_proof && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-[11px] font-medium text-gray-700 mb-1.5">File Bukti</p>
                            <Button
                                variant="secondary"
                                size="md"
                                icon={FileText}
                                fullWidth
                                onClick={() => openPaymentProof(selectedOrder.payment_proof.id)}
                            >
                                Buka File Bukti Pembayaran
                            </Button>
                        </div>

                        <div>
                            <p className="text-[11px] font-medium text-gray-700 mb-1.5">Status Review</p>
                            <div className="space-y-2">
                                {[
                                    { v: 'approved', label: 'Disetujui', icon: Check, hint: '(otomatis ubah ke Diproses)', tone: 'text-emerald-600' },
                                    { v: 'rejected', label: 'Ditolak', icon: X, hint: '', tone: 'text-red-600' },
                                ].map(opt => (
                                    <label
                                        key={opt.v}
                                        className={cn('flex items-center p-2.5 border rounded-md cursor-pointer transition-colors',
                                            paymentReviewStatus === opt.v
                                                ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]'
                                                : 'border-gray-200 hover:border-gray-300')}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_status"
                                            value={opt.v}
                                            checked={paymentReviewStatus === opt.v}
                                            onChange={(e) => setPaymentReviewStatus(e.target.value)}
                                            className="mr-2.5"
                                        />
                                        <opt.icon size={14} className={`${opt.tone} mr-2`} />
                                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                                        {opt.hint && <span className="text-[11px] text-gray-500 ml-auto">{opt.hint}</span>}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            label="Catatan (Opsional)"
                            value={paymentReviewNotes}
                            onChange={(e) => setPaymentReviewNotes(e.target.value)}
                            placeholder="Alasan ditolak atau catatan lain..."
                            rows={3}
                        />
                    </div>
                )}
            </Modal>

            {/* Tracking Modal */}
            <Modal
                open={trackingModal && !!selectedOrder}
                onClose={() => setTrackingModal(false)}
                title="Nomor Resi Pengiriman"
                size="md"
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setTrackingModal(false)}>Batal</Button>
                        <Button variant="primary" size="sm" icon={Check} loading={submittingTracking} onClick={handleUpdateTracking}>
                            Simpan Resi
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <Input
                        label="Nomor Resi"
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Contoh: 1234567890"
                    />
                    <Select
                        label="Kurir Pengiriman (Opsional)"
                        value={shippingProvider}
                        onChange={(e) => setShippingProvider(e.target.value)}
                    >
                        <option value="">-- Pilih Kurir --</option>
                        <option value="JNE">JNE</option>
                        <option value="TIKI">TIKI</option>
                        <option value="Pos Indonesia">Pos Indonesia</option>
                        <option value="GoSend">GoSend</option>
                        <option value="Grab">Grab</option>
                        <option value="Lainnya">Lainnya</option>
                    </Select>
                </div>
            </Modal>

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={createOrderModal}
                onClose={() => setCreateOrderModal(false)}
                onOrderCreated={() => fetchOrders(currentPage)}
            />
        </div>
    );
}
