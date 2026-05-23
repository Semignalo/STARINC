import React, { useEffect, useState } from 'react';
import { walletApi } from '../../api/walletApi';
import { Wallet, TrendingUp, TrendingDown, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfileWallet() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [form, setForm] = useState({ amount: '', bank_name: '', account_number: '', account_name: '' });

    const fetchWallet = async (p = page) => {
        setLoading(true);
        try {
            const res = await walletApi.getWallet(p);
            setData(res);
        } catch (err) {
            console.error('Error fetching wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWallet(page); }, [page]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawing(true);
        try {
            const res = await walletApi.requestWithdrawal({
                ...form,
                amount: parseFloat(form.amount),
            });
            await Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, confirmButtonColor: '#0F172A' });
            setShowWithdrawForm(false);
            setForm({ amount: '', bank_name: '', account_number: '', account_name: '' });
            fetchWallet(1);
            setPage(1);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal mengirim permintaan penarikan.';
            Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
        } finally {
            setWithdrawing(false);
        }
    };

    const getStatusIcon = (type, status) => {
        if (status === 'pending')   return <Clock size={12} className="text-amber-600" />;
        if (status === 'rejected')  return <XCircle size={12} className="text-gray-500" />;
        if (type === 'credit')      return <TrendingUp size={12} className="text-emerald-700" />;
        return <TrendingDown size={12} className="text-gray-700" />;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':   return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'rejected':  return 'bg-gray-100 text-gray-500 border-gray-200';
            default:          return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const balance = data?.balance ?? 0;
    const transactions = data?.transactions?.data ?? [];
    const meta = data?.transactions;

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;
    const inputClass = "w-full h-11 px-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors rounded-md";

    return (
        <div className="space-y-5">

            {/* Section header */}
            <div className="flex items-center gap-2">
                <Wallet size={14} className="text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">Wallet</h2>
            </div>

            {/* Balance Card */}
            <div className="bg-[#0F172A] text-white p-7 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2">Saldo Wallet</p>
                <p className="text-3xl font-medium tabular-nums tracking-tight mb-5">
                    {loading ? '…' : fmt(balance)}
                </p>
                <button
                    onClick={() => setShowWithdrawForm(v => !v)}
                    disabled={balance <= 0}
                    className="inline-flex items-center gap-2 h-10 px-5 bg-white text-gray-900 text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                    Tarik Saldo
                </button>
            </div>

            {/* Withdrawal Form */}
            {showWithdrawForm && (
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-1">Form</p>
                    <h3 className="text-sm font-medium text-gray-900 tracking-tight mb-5">Permintaan Penarikan</h3>
                    <form onSubmit={handleWithdraw} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Jumlah (min. Rp50.000)</label>
                            <input type="number" min="50000" max={balance} value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                required className={inputClass} placeholder="e.g. 500000" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Bank</label>
                            <input type="text" value={form.bank_name}
                                onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                                required className={inputClass} placeholder="e.g. BCA" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nomor Rekening</label>
                            <input type="text" value={form.account_number}
                                onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                                required className={inputClass} placeholder="e.g. 1234567890" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Atas Nama</label>
                            <input type="text" value={form.account_name}
                                onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
                                required className={inputClass} placeholder="Nama sesuai rekening" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={withdrawing}
                                className="flex-1 h-11 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-50">
                                {withdrawing ? 'Memproses…' : 'Kirim Permintaan'}
                            </button>
                            <button type="button" onClick={() => setShowWithdrawForm(false)}
                                className="flex-1 h-11 border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.25em] rounded-md transition-colors">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">History</p>
                    <h3 className="text-sm font-medium text-gray-900 tracking-tight mt-0.5">Riwayat Transaksi</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-sm text-gray-400">Memuat…</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-sm text-gray-500">Belum ada transaksi wallet.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3 px-6 py-4">
                                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
                                    {getStatusIcon(tx.type, tx.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">{tx.description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                                    <p className={`text-sm font-medium tabular-nums ${tx.type === 'credit' ? 'text-emerald-700' : 'text-gray-700'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                                    </p>
                                    <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border ${getStatusBadge(tx.status)}`}>
                                        {tx.status === 'completed' ? 'Selesai' : tx.status === 'pending' ? 'Pending' : 'Ditolak'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-xs text-gray-500 tabular-nums">
                            Halaman {meta.current_page} / {meta.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 disabled:opacity-40 hover:border-gray-400 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 disabled:opacity-40 hover:border-gray-400 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
