import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { CheckCircle, Copy, AlertCircle, Printer, Upload, Zap, CreditCard, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../api/client';

export default function Invoice() {
    const { id } = useParams(); // order_number from Laravel
    const [searchParams] = useSearchParams();
    const isPrintMode = searchParams.get('print') === 'true';

    const [order, setOrder] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [repaying, setRepaying] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const snapReady = useRef(false);

    // Load Midtrans Snap script
    useEffect(() => {
        const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
        const snapUrl = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const existing = document.getElementById('midtrans-snap-script');
        if (existing) { snapReady.current = true; return; }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = snapUrl;
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
        script.onload = () => { snapReady.current = true; };
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Backend returns: { order: {..., items: [...], payment_proof: {...}}, payment_config: {...} }
                const resp = await orderApi.getInvoice(id);
                setOrder(resp.order ?? resp); // support both nested and flat
                setPaymentConfig(resp.payment_config ?? null);
            } catch (error) {
                console.error('Error fetching invoice:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id]);

    useEffect(() => {
        if (!loading && order && isPrintMode) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, order, isPrintMode]);

    // Show success toast when navigated from Midtrans onSuccess callback
    useEffect(() => {
        if (!loading && order && searchParams.get('paid') === '1') {
            Swal.fire({
                title: 'Pembayaran Berhasil!',
                text: 'Pesananmu sedang kami proses.',
                icon: 'success',
                confirmButtonColor: '#047857',
                confirmButtonText: 'Lihat Pesanan',
                timer: 5000,
            });
        }
    }, [loading, order]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(String(text || ''));
        Swal.fire({ title: 'Tersalin!', text: 'Nomor rekening telah disalin.', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    };

    const handleRepay = async () => {
        if (!order || repaying) return;
        setRepaying(true);
        try {
            const data = await orderApi.repaySnapToken(order.order_number);
            if (data.snap_token && window.snap) {
                window.snap.pay(data.snap_token, {
                    onSuccess: () => window.location.reload(),
                    onPending: () => window.location.reload(),
                    onError: () => {
                        Swal.fire({ title: 'Pembayaran Gagal', text: 'Silakan coba lagi.', icon: 'error', confirmButtonColor: '#111827' });
                    },
                    onClose: () => {},
                });
            }
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: getErrorMessage(err, 'Gagal membuat sesi pembayaran.'), icon: 'error', confirmButtonColor: '#111827' });
        } finally {
            setRepaying(false);
        }
    };

    const handleCancel = async () => {
        if (!order || cancelling) return;
        const result = await Swal.fire({
            title: 'Batalkan Pesanan?',
            text: 'Pesanan yang dibatalkan tidak dapat dipulihkan. Stok akan dikembalikan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Kembali',
        });
        if (!result.isConfirmed) return;

        setCancelling(true);
        try {
            await orderApi.cancelOrder(order.order_number);
            await Swal.fire({ title: 'Pesanan Dibatalkan', text: 'Pesananmu telah berhasil dibatalkan.', icon: 'success', confirmButtonColor: '#111827' });
            window.location.reload();
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err, 'Gagal membatalkan pesanan.'), 'error');
        } finally {
            setCancelling(false);
        }
    };

    const handleUploadProof = async (file) => {
        if (!file || !order) return;

        // Validate file size (max 2MB)
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            Swal.fire('Ukuran File Terlalu Besar', 'File harus maksimal 2MB. File Anda berukuran ' + (file.size / 1024 / 1024).toFixed(2) + 'MB.', 'error');
            return;
        }

        // Validate file type
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!ALLOWED_TYPES.includes(file.type)) {
            Swal.fire('Format File Tidak Didukung', 'File harus berupa JPG, PNG, atau PDF.', 'error');
            return;
        }

        setUploadingProof(true);
        try {
            await orderApi.uploadPaymentProof(order.order_id, file);
            Swal.fire('Berhasil!', 'Bukti pembayaran berhasil diunggah dan sedang diverifikasi.', 'success');
        } catch (err) {
            Swal.fire('Gagal', getErrorMessage(err), 'error');
        } finally {
            setUploadingProof(false);
        }
    };

    // Derive payment status from proof or order status
    const proofStatus = order?.payment_proof?.status; // pending | approved | rejected
    const isPaidViaMidtrans = !!order?.payment_method;
    const midtransPaid = isPaidViaMidtrans && ['processing', 'shipped', 'completed'].includes(order?.status);

    const paymentStatusLabel = (proofStatus === 'approved' || midtransPaid || order?.status === 'completed') ? 'Lunas'
        : proofStatus === 'rejected' ? 'Ditolak'
        : 'Menunggu Pembayaran';
    const paymentStatusClass = (proofStatus === 'approved' || midtransPaid || order?.status === 'completed')
        ? 'text-green-600 bg-green-100'
        : proofStatus === 'rejected' ? 'text-red-600 bg-red-100'
        : 'text-orange-600 bg-orange-100';

    // Storage base URL (digunakan untuk konstruksi URL gambar bukti bayar)
    const _storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-serif mb-4">Invoice Not Found</h2>
                <Link to="/" className="text-[var(--color-accent)] underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center">
            <div className="invoice-print-wrapper w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className={`invoice-print-header p-8 text-center text-white ${midtransPaid ? 'bg-[#047857]' : 'bg-gray-800'}`}>
                    {midtransPaid
                        ? <Zap className="mx-auto h-16 w-16 mb-4 text-green-300" />
                        : <CheckCircle className="mx-auto h-16 w-16 mb-4 text-gray-400" />
                    }
                    <h1 className="text-3xl font-serif mb-2">
                        {midtransPaid ? 'Pembayaran Berhasil!' : 'Order Dibuat!'}
                    </h1>
                    <p className="text-green-100">
                        {midtransPaid
                            ? 'Pesananmu sedang kami proses. Terima kasih!'
                            : 'Silakan selesaikan pembayaran agar pesanan Anda dapat segera kami proses.'
                        }
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">

                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                        <h2 className="text-4xl font-bold text-gray-900">
                            Rp. {order.total?.toLocaleString('id-ID')}
                        </h2>
                    </div>

                    {/* Payment Info */}
                    {isPaidViaMidtrans ? (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                                <Zap size={18} /> Pembayaran via {order.payment_method?.replace(/_/g, ' ').toUpperCase()}
                            </h3>
                            <p className="text-sm text-green-700">
                                {midtransPaid
                                    ? 'Pembayaran telah dikonfirmasi. Pesanan sedang diproses.'
                                    : 'Pembayaran sedang diverifikasi oleh penyedia layanan.'
                                }
                            </p>
                        </div>
                    ) : paymentConfig && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Informasi Transfer</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Bank</p>
                                    <p className="font-medium text-lg uppercase">{paymentConfig.bank_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Nomor Rekening</p>
                                    <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-md mt-1">
                                        <span className="font-bold text-xl tracking-wider text-gray-900">
                                            {paymentConfig.account_number}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(paymentConfig.account_number)}
                                            className="text-[var(--color-accent)] hover:text-gray-900 flex items-center gap-1 text-sm font-medium transition-colors"
                                        >
                                            <Copy size={16} /> Salin
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Atas Nama</p>
                                    <p className="font-medium">{paymentConfig.account_name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Meta */}
                    <div className="border-t border-gray-100 pt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">No. Order</span>
                            <span className="font-mono font-medium">#{order.order_number}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Diskon Tier ({order.discount_percent}%)</span>
                                <span className="font-medium text-[var(--color-primary)]">- Rp. {parseFloat(order.discount_amount).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ongkos Kirim</span>
                            <span className="font-medium">Rp. {parseFloat(order.shipping_cost || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status Pembayaran</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${paymentStatusClass}`}>
                                {paymentStatusLabel}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    {order.items?.length > 0 && (
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Pesanan Kamu</h4>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.product_title}</p>
                                            {item.variant_name && <p className="text-xs text-[var(--color-primary)]">{item.variant_name}</p>}
                                            <p className="text-xs text-gray-500">{item.quantity} × Rp. {parseFloat(item.unit_price || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <p className="font-medium text-gray-900 whitespace-nowrap ml-4">
                                            Rp. {parseFloat(item.line_total || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tombol Bayar Sekarang — untuk order pending yang belum dibayar via Midtrans */}
                    {order.status === 'pending_payment' && !isPaidViaMidtrans && (
                        <div className="border-t border-gray-100 pt-6 print:hidden">
                            <button
                                onClick={handleRepay}
                                disabled={repaying}
                                className="w-full flex items-center justify-center gap-2 bg-[#047857] text-white py-3.5 rounded-lg font-bold text-sm tracking-widest hover:bg-[#065F46] transition disabled:opacity-60 uppercase"
                            >
                                {repaying
                                    ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Memproses...</>
                                    : <><CreditCard size={18} /> Bayar Sekarang</>
                                }
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-2">Atau transfer manual di bawah</p>
                        </div>
                    )}

                    {/* Batalkan Pesanan — hanya pending_payment, belum bayar */}
                    {order.status === 'pending_payment' && (
                        <div className="border-t border-gray-100 pt-4 print:hidden">
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-60"
                            >
                                {cancelling
                                    ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" /> Membatalkan...</>
                                    : <><XCircle size={16} /> Batalkan Pesanan</>
                                }
                            </button>
                        </div>
                    )}

                    {/* Upload Bukti Bayar — hanya untuk transfer manual (bukan Midtrans) */}
                    {!isPaidViaMidtrans && order.status === 'pending_payment' && proofStatus !== 'approved' && (
                        <div className="border-t border-gray-100 pt-6 print:hidden">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Upload Bukti Pembayaran</h4>
                            <p className="text-xs text-gray-500 mb-4">Pastikan nominal transfer sesuai. Tim kami akan verifikasi max. 1×24 jam.</p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                id="paymentProofInvoice"
                                className="hidden"
                                onChange={(e) => handleUploadProof(e.target.files[0])}
                            />
                            <button
                                onClick={() => document.getElementById('paymentProofInvoice').click()}
                                disabled={uploadingProof}
                                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                            >
                                {uploadingProof
                                    ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" /> Mengunggah...</>
                                    : <><Upload size={18} /> Pilih File Bukti Transfer</>
                                }
                            </button>
                        </div>
                    )}

                    <div className="text-center pt-4 flex flex-col md:flex-row justify-center items-center gap-4 print:hidden">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition"
                        >
                            <Printer size={18} /> Cetak / Download Invoice
                        </button>
                        <Link to="/" className="text-sm text-gray-500 underline hover:text-gray-900">
                            Kembali ke Halaman Utama
                        </Link>
                    </div>

                </div>
            </div>
            
            {/* Print styles handled globally in index.css */}
        </div>
    );
}
