import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Banknote, Download, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Commissions() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [exporting, setExporting] = useState(false);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getCommissions(1, statusFilter);
            setCommissions(res.data || res);
        } catch (error) {
            console.error("Failed to fetch commissions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const pendingIds = commissions.filter(c => c.status === 'pending').map(c => c.id);
            setSelectedIds(pendingIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (e, id) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(item => item !== id));
        }
    };

    const handlePaySingle = async (id) => {
        try {
            const confirm = await Swal.fire({
                title: 'Konfirmasi',
                text: 'Tandai komisi ini sebagai lunas?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Ya, Tandai Lunas'
            });

            if (confirm.isConfirmed) {
                await adminApi.payCommission(id);
                Swal.fire('Berhasil', 'Komisi berhasil dicairkan.', 'success');
                fetchCommissions();
            }
        } catch {
            Swal.fire('Error', 'Gagal memproses pembayaran.', 'error');
        }
    };

    const handleBulkPay = async () => {
        if (selectedIds.length === 0) return;
        
        try {
            const confirm = await Swal.fire({
                title: `Bayar ${selectedIds.length} Komisi?`,
                text: 'Komisi yang dipilih akan ditandai sebagai lunas.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#22c55e',
                confirmButtonText: 'Ya, Lunasi Semua'
            });

            if (confirm.isConfirmed) {
                await adminApi.bulkPayCommissions(selectedIds);
                Swal.fire('Berhasil', 'Semua komisi terpilih telah dicairkan.', 'success');
                setSelectedIds([]);
                fetchCommissions();
            }
        } catch {
            Swal.fire('Error', 'Gagal memproses bulk payment.', 'error');
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const data = await adminApi.exportCommissions();
            
            // Simple JSON to CSV converter
            if (data.length === 0) {
                Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info');
                return;
            }
            
            const headers = Object.keys(data[0]);
            const csvRows = [];
            csvRows.push(headers.join(',')); // Header row

            for (const row of data) {
                const values = headers.map(header => {
                    const escaped = ('' + row[header]).replace(/"/g, '\\"');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }

            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `export_commissions_${new Date().getTime()}.csv`);
            a.click();
            
        } catch {
            Swal.fire('Error', 'Gagal mengekspor data komisi.', 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Komisi</h1>
                    <p className="text-xs text-gray-500 mt-1">Otorisasi pencairan komisi dan riwayat</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 px-3 pr-8 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '16px',
                            backgroundPosition: 'right 8px center',
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>

                    <button
                        onClick={handleBulkPay}
                        disabled={selectedIds.length === 0}
                        className="h-9 px-3 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-[6px] text-sm font-medium transition"
                    >
                        <CheckCircle size={14} /> Bayar Terpilih ({selectedIds.length})
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="h-9 px-3 inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-[6px] text-sm font-medium transition"
                    >
                        {exporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <RefreshCw className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : commissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                        <Banknote size={48} className="mb-4 text-gray-200" />
                        <p>Belum ada komisi tercatat.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4 w-12 border-r text-center">
                                        <input 
                                            type="checkbox" 
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length > 0 && selectedIds.length === commissions.filter(c => c.status === 'pending').length}
                                        />
                                    </th>
                                    <th className="p-4 border-r">Rincian Komisi</th>
                                    <th className="p-4 border-r">Penerima Upline</th>
                                    <th className="p-4 border-r">Sumber Transaksi</th>
                                    <th className="p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {commissions.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 border-r text-center">
                                            {c.status === 'pending' && (
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(c.id)}
                                                    onChange={(e) => handleSelect(e, c.id)}
                                                />
                                            )}
                                        </td>
                                        <td className="p-4 border-r">
                                            <div className="font-bold text-gray-900 text-lg mb-1">{formatCurrency(c.commission_amount)}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <span>Rating: <b className="text-gray-800">{Number(c.commission_rate)}%</b></span>
                                                • 
                                                <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wide
                                                    ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r">
                                            <div className="font-bold text-blue-600">{c.user?.name}</div>
                                            <div className="text-xs text-gray-500">{c.user?.email}</div>
                                        </td>
                                        <td className="p-4 border-r">
                                            <div className="font-medium text-gray-900 mb-1">Downline: {c.source_user?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">Order: #{c.order?.order_number}</div>
                                            <div className="text-xs text-gray-500">Base: {formatCurrency(c.order_amount)}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4 font-medium">
                                            {c.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handlePaySingle(c.id)}
                                                    className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded text-xs transition"
                                                >
                                                    Bayar Lunas
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                                    <CheckCircle size={14} /> Selesai
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
