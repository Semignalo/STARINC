import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';
import { Wallet, DollarSign } from 'lucide-react';

export default function ProfileCommissions() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchCommissions = async () => {
            setLoading(true);
            try {
                const res = await networkApi.getCommissions(page);
                setData(res);
            } catch (error) {
                console.error('Error fetching commissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommissions();
    }, [page]);

    const commissionsList = data?.data || [];
    const totalPending = commissionsList.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);
    const totalPaid = commissionsList.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':   return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'paid':      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
            default:          return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':   return 'Menunggu';
            case 'paid':      return 'Dibayar';
            case 'cancelled': return 'Batal';
            default:          return status;
        }
    };

    if (loading && !data) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-28 w-full bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-28 w-full bg-gray-100 rounded-lg animate-pulse" />
                </div>
                <div className="h-64 w-full bg-gray-50 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Section header */}
            <div className="flex items-center gap-2">
                <Wallet size={14} className="text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">Komisi Saya</h2>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">Sudah Dibayar</p>
                    <p className="text-2xl font-medium text-gray-900 tabular-nums tracking-tight">{fmt(totalPaid)}</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">Menunggu Pencairan</p>
                    <p className="text-2xl font-medium text-gray-900 tabular-nums tracking-tight">{fmt(totalPending)}</p>
                    <p className="text-xs text-gray-500 mt-2">Komisi diproses setiap akhir bulan</p>
                </div>
            </div>

            {/* Commissions List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">History</p>
                    <h3 className="text-sm font-medium text-gray-900 tracking-tight mt-0.5">Riwayat Komisi</h3>
                </div>

                {commissionsList.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-4">
                            <DollarSign size={18} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Belum ada komisi tercatat</p>
                        <p className="text-xs text-gray-500 mt-1">Ajak temanmu berbelanja dengan kode referralmu.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                    <th className="px-6 py-3 font-medium">Tanggal</th>
                                    <th className="px-6 py-3 font-medium">No. Pesanan</th>
                                    <th className="px-6 py-3 font-medium">Dari Anggota</th>
                                    <th className="px-6 py-3 font-medium text-right">Nilai Pesanan</th>
                                    <th className="px-6 py-3 font-medium text-right">Komisi ({data.data[0]?.commission_rate}%)</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {commissionsList.map((comm) => (
                                    <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3.5 text-gray-500 text-xs">
                                            {new Date(comm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-3.5 font-mono text-xs text-gray-700">
                                            #{comm.order?.order_number || comm.order_id}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="text-sm text-gray-900">{comm.source_user?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-gray-500 tabular-nums text-xs">
                                            {fmt(comm.order_amount)}
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-medium text-gray-900 tabular-nums">
                                            + {fmt(comm.commission_amount)}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.15em] border ${getStatusStyle(comm.status)}`}>
                                                {getStatusLabel(comm.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data?.last_page > 1 && (
                    <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 h-9 text-xs uppercase tracking-[0.15em] text-gray-700 bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <span className="text-xs text-gray-500 tabular-nums">Halaman {page} / {data.last_page}</span>
                        <button
                            disabled={page === data.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 h-9 text-xs uppercase tracking-[0.15em] text-gray-700 bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
