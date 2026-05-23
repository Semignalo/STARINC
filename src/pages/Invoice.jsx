import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { CheckCircle, Copy, AlertCircle, Printer, Upload, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../api/client';

export default function Invoice() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!id) return;
        orderApi.getInvoice(id)
            .then(resp => {
                setOrder(resp.order ?? resp);
                setPaymentConfig(resp.payment_config ?? null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(String(text || ''));
        Swal.fire({ title: 'Tersalin', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    };

    const handleCancel = async () => {
        if (!order || cancelling) return;
        const result = await Swal.fire({
            title: 'Batalkan Pesanan?',
            text: 'Pesanan yang dibatalkan tidak dapat dipulihkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0F172A',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Kembali',
        });
        if (!result.isConfirmed) return;

        setCancelling(true);
        try {
            await orderApi.cancelOrder(order.order_number);
            await Swal.fire({ title: 'Pesanan Dibatalkan', icon: 'success', confirmButtonColor: '#0F172A' });
            window.location.reload();
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err, 'Gagal membatalkan pesanan.'), 'error');
        } finally {
            setCancelling(false);
        }
    };

    const handleUploadProof = async (file) => {
        if (!file || !order) return;

        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('File Terlalu Besar', 'Maksimal 2MB.', 'error');
            return;
        }
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
            Swal.fire('Format Tidak Didukung', 'Gunakan JPG, PNG, atau PDF.', 'error');
            return;
        }

        setUploadingProof(true);
        try {
            await orderApi.uploadPaymentProof(order.order_id, file);
            Swal.fire('Berhasil', 'Bukti pembayaran diunggah dan sedang diverifikasi.', 'success');
            window.location.reload();
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err), 'error');
        } finally {
            setUploadingProof(false);
        }
    };

    const proofStatus = order?.payment_proof?.status;
    const isPaid = proofStatus === 'approved' || ['processing', 'shipped', 'completed'].includes(order?.status);
    const paymentStatusLabel = isPaid
        ? 'Lunas'
        : proofStatus === 'rejected' ? 'Bukti Ditolak'
        : proofStatus === 'pending' ? 'Menunggu Verifikasi'
        : 'Menunggu Pembayaran';

    const paymentStatusClass = isPaid
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : proofStatus === 'rejected' ? 'bg-gray-100 text-gray-500 border-gray-200'
        : proofStatus === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-5">
                    <AlertCircle size={18} className="text-gray-400" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">404</p>
                <h2 className="text-xl font-medium tracking-tight text-gray-900 mb-2">Invoice Tidak Ditemukan</h2>
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors mt-2">
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
            <div className="invoice-print-wrapper max-w-xl mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">

                {/* Header — navy with gold accent */}
                <div className="invoice-print-header bg-[#0F172A] text-white p-9 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />
                    <div className="w-14 h-14 mx-auto mb-4 border border-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-[var(--color-accent)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2">Order Created</p>
                    <h1 className="text-2xl font-medium tracking-tight mb-2">Pesanan Berhasil Dibuat</h1>
                    <p className="text-sm text-white/60 leading-relaxed">
                        Selesaikan pembayaran agar pesanan segera diproses.
                    </p>
                </div>

                {/* Content */}
                <div className="p-7 md:p-8 space-y-7">

                    {/* Total */}
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Total Pembayaran</p>
                        <p className="text-3xl md:text-4xl font-medium text-gray-900 tabular-nums tracking-tight">
                            {fmt(order.total)}
                        </p>
                    </div>

                    {/* Bank Transfer Info */}
                    {paymentConfig && (
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-1">Bank Transfer</p>
                            <h3 className="text-sm font-medium text-gray-900 tracking-tight mb-5">Informasi Transfer</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Bank</p>
                                    <p className="text-base font-medium text-gray-900 uppercase">{paymentConfig.bank_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1.5">Nomor Rekening</p>
                                    <div className="flex items-center justify-between bg-white border border-gray-200 px-4 h-12 rounded-md">
                                        <span className="text-lg font-medium tabular-nums tracking-wider text-gray-900">
                                            {paymentConfig.account_number}
                                        </span>
                                        <button onClick={() => handleCopy(paymentConfig.account_number)}
                                            className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 text-xs transition-colors">
                                            <Copy size={12} /> Salin
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">Atas Nama</p>
                                    <p className="text-sm font-medium text-gray-900">{paymentConfig.account_name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Meta */}
                    <div className="border-t border-gray-100 pt-6 space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">No. Order</span>
                            <span className="font-mono text-xs text-gray-900">#{order.order_number}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Diskon Member ({order.discount_percent}%)</span>
                                <span className="text-gray-900 tabular-nums">- {fmt(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ongkos Kirim</span>
                            <span className="text-gray-900 tabular-nums">{fmt(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Status Pembayaran</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.15em] border ${paymentStatusClass}`}>
                                {paymentStatusLabel}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    {order.items?.length > 0 && (
                        <div className="border-t border-gray-100 pt-6">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">Items</p>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900">{item.product_title}</p>
                                            {item.variant_name && <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>}
                                            <p className="text-xs text-gray-500 mt-0.5 tabular-nums">{item.quantity} × {fmt(item.unit_price)}</p>
                                        </div>
                                        <p className="font-medium text-gray-900 whitespace-nowrap ml-4 tabular-nums">
                                            {fmt(item.line_total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Bukti Transfer */}
                    {order.status === 'pending_payment' && proofStatus !== 'approved' && proofStatus !== 'pending' && (
                        <div className="border-t border-gray-100 pt-6 print:hidden">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-1">Payment Proof</p>
                            <h4 className="text-sm font-medium text-gray-900 tracking-tight mb-1">Upload Bukti Transfer</h4>
                            <p className="text-xs text-gray-500 mb-4">Verifikasi max. 1×24 jam setelah bukti diterima.</p>
                            <input type="file" accept="image/jpeg,image/png,application/pdf"
                                id="paymentProofInvoice" className="hidden"
                                onChange={(e) => handleUploadProof(e.target.files[0])} />
                            <button onClick={() => document.getElementById('paymentProofInvoice').click()}
                                disabled={uploadingProof}
                                className="w-full h-11 flex items-center justify-center gap-2 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-60">
                                {uploadingProof
                                    ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Mengunggah…</>
                                    : <><Upload size={12} /> Pilih File Bukti</>
                                }
                            </button>
                        </div>
                    )}

                    {/* Batalkan Pesanan */}
                    {order.status === 'pending_payment' && (
                        <div className="print:hidden">
                            <button onClick={handleCancel} disabled={cancelling}
                                className="w-full h-11 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-900 text-xs uppercase tracking-[0.25em] rounded-md transition-colors disabled:opacity-60">
                                {cancelling
                                    ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500" /> Membatalkan…</>
                                    : <><XCircle size={12} /> Batalkan Pesanan</>
                                }
                            </button>
                        </div>
                    )}

                    {/* Print + Back */}
                    <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-center items-center gap-3 print:hidden">
                        <button onClick={() => window.print()}
                            className="inline-flex items-center gap-2 h-11 px-6 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.25em] rounded-md transition-colors">
                            <Printer size={12} /> Cetak Invoice
                        </button>
                        <Link to="/" className="text-xs text-gray-500 hover:text-gray-900 underline transition-colors">
                            Kembali ke Beranda
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
