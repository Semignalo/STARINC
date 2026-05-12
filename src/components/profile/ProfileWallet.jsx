import React, { useEffect, useState } from 'react';
import { walletApi } from '../../api/walletApi';
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
            await Swal.fire({ icon: 'success', title: 'Berhasil!', text: res.message, confirmButtonColor: '#047857' });
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
        if (status === 'pending') return <Clock size={14} className="text-amber-500" />;
        if (status === 'rejected') return <XCircle size={14} className="text-red-500" />;
        if (type === 'credit') return <TrendingUp size={14} className="text-emerald-500" />;
        return <TrendingDown size={14} className="text-red-500" />;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800';
            case 'pending': return 'bg-amber-100 text-amber-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const balance = data?.balance ?? 0;
    const transactions = data?.transactions?.data ?? [];
    const meta = data?.transactions;

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1 opacity-80">
                    <Wallet size={16} />
                    <span className="text-sm font-medium uppercase tracking-wider">Saldo Wallet</span>
                </div>
                <div className="text-3xl font-bold mb-4">
                    {loading ? '...' : `Rp ${balance.toLocaleString('id-ID')}`}
                </div>
                <button
                    onClick={() => setShowWithdrawForm(v => !v)}
                    disabled={balance <= 0}
                    className="bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
                >
                    Tarik Saldo
                </button>
            </div>

            {/* Withdrawal Form */}
            {showWithdrawForm && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Permintaan Penarikan</h3>
                    <form onSubmit={handleWithdraw} className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Jumlah (min. Rp 50.000)</label>
                            <input
                                type="number"
                                min="50000"
                                max={balance}
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. 500000"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Bank</label>
                            <input
                                type="text"
                                value={form.bank_name}
                                onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. BCA"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Nomor Rekening</label>
                            <input
                                type="text"
                                value={form.account_number}
                                onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. 1234567890"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Atas Nama</label>
                            <input
                                type="text"
                                value={form.account_name}
                                onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Nama sesuai rekening"
                            />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={withdrawing}
                                className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition"
                            >
                                {withdrawing ? 'Memproses...' : 'Kirim Permintaan'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowWithdrawForm(false)}
                                className="flex-1 border border-gray-300 text-gray-700 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Riwayat Transaksi</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada transaksi wallet.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    {getStatusIcon(tx.type, tx.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}Rp {parseFloat(tx.amount).toLocaleString('id-ID')}
                                    </p>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                                        {tx.status === 'completed' ? 'Selesai' : tx.status === 'pending' ? 'Pending' : 'Ditolak'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                            Hal {meta.current_page} dari {meta.last_page}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
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
