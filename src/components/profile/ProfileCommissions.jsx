import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';
import { Wallet, Clock, CheckCircle, Search, DollarSign } from 'lucide-react';
// import { getErrorMessage } from '../../api/client';

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

    // Calculate totals from the current page (in a real app, backend should provide global totals)
    const commissionsList = data?.data || [];
    const totalPending = commissionsList.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);
    const totalPaid = commissionsList.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Menunggu Cair';
            case 'paid': return 'Sudah Dibayar';
            case 'cancelled': return 'Batal';
            default: return status;
        }
    };

    if (loading && !data) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 w-full bg-gray-100  animate-pulse" />
                    <div className="h-32 w-full bg-gray-100  animate-pulse" />
                </div>
                <div className="h-64 w-full bg-gray-50  animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Wallet className="text-gray-900" /> Komisi Saya
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600  p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-white/20">
                        <CheckCircle size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-emerald-100 mb-1">Sudah Dibayar</div>
                        <div className="text-3xl font-bold">Rp. {totalPaid.toLocaleString('id-ID')}</div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-400 to-red-500  p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-white/20">
                        <Clock size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium text-orange-100 mb-1">Menunggu Pencairan</div>
                        <div className="text-3xl font-bold">Rp. {totalPending.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-white/80 mt-2">Komisi akan diproses setiap akhir bulan</p>
                    </div>
                </div>
            </div>

            {/* Commissions List */}
            <div className="bg-white  shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">Riwayat Komisi</h3>
                </div>

                {commissionsList.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <DollarSign size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada komisi tercatat.</p>
                        <p className="text-sm text-gray-400 mt-1">Ajak temanmu berbelanja dengan kode referralmu.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Tanggal</th>
                                    <th className="px-6 py-4 font-medium">No. Pesanan</th>
                                    <th className="px-6 py-4 font-medium">Dari (Anggota)</th>
                                    <th className="px-6 py-4 font-medium text-right">Nilai Pesanan</th>
                                    <th className="px-6 py-4 font-medium text-right">Komisi ({data.data[0]?.commission_rate}%)</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {commissionsList.map((comm) => (
                                    <tr key={comm.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(comm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700">
                                            #{comm.order?.order_number || comm.order_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{comm.source_user?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            Rp. {parseFloat(comm.order_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            + Rp. {parseFloat(comm.commission_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(comm.status)}`}>
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
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            Sebelumnya
                        </button>
                        <span className="text-sm text-gray-500">Halaman {page} dari {data.last_page}</span>
                        <button 
                            disabled={page === data.last_page}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            Selanjutnya
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
