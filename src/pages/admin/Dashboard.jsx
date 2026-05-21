import React, { useEffect, useState, lazy, Suspense } from 'react';
import { TrendingUp, ShoppingCart, Users, AlertCircle, RefreshCw, ArrowUpRight, Clock, FileDown } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import apiClient from '../../api/client';
import Button from '../../components/admin/ui/Button';
import Card, { CardHeader } from '../../components/admin/ui/Card';
import Badge from '../../components/admin/ui/Badge';
import DataTable from '../../components/admin/ui/Table';

const DashboardCharts = lazy(() => import('./DashboardCharts'));

const STATUS_COLOR = {
    completed: 'success',
    pending_payment: 'warning',
    processing: 'info',
    shipped: 'info',
    rejected: 'danger',
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getDashboard();
            setData(res);
        } catch (e) {
            console.error('Failed to load dashboard', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(val);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-gray-400" size={24} />
            </div>
        );
    }
    if (!data) return <div className="text-sm text-gray-500">Gagal memuat data.</div>;

    const {
        total_revenue, active_orders, total_customers, pending_payments,
        monthly_stats, top_products, pending_commissions, paid_commissions, recent_orders,
    } = data;

    const totalCommissions = (pending_commissions || 0) + (paid_commissions || 0);
    const pendingPct = totalCommissions > 0 ? Math.round((pending_commissions / totalCommissions) * 100) : 0;
    const paidPct = 100 - pendingPct;

    const downloadReport = async () => {
        const month = new Date().toISOString().slice(0, 7);
        const res = await apiClient.get(`/admin/reports/monthly?month=${month}`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        Object.assign(document.createElement('a'), { href: url, download: `laporan-${month}.pdf` }).click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-xs text-gray-500 mt-1">Ringkasan performa bisnis</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={FileDown} onClick={downloadReport}>
                        Laporan PDF
                    </Button>
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchDashboard}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Urgent Alert */}
            {pending_payments > 0 && (
                <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px] flex items-center gap-3">
                    <Clock size={16} className="text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-900">
                            {pending_payments} pembayaran menunggu verifikasi
                        </p>
                        <p className="text-xs text-amber-700/80 mt-0.5">
                            Segera tinjau dan konfirmasi bukti pembayaran.
                        </p>
                    </div>
                    <a
                        href="/admin/orders"
                        className="text-xs font-medium text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
                    >
                        Lihat <ArrowUpRight size={12} />
                    </a>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Pendapatan" value={formatCurrency(total_revenue)} icon={TrendingUp} />
                <Stat label="Pesanan Aktif" value={active_orders.toLocaleString('id-ID')} icon={ShoppingCart} />
                <Stat label="Total Customer" value={total_customers.toLocaleString('id-ID')} icon={Users} />
                <Stat label="Pending Payment" value={pending_payments.toLocaleString('id-ID')} icon={AlertCircle} tone={pending_payments > 0 ? 'warning' : 'default'} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Suspense fallback={
                    <>
                        <Card className="min-h-[280px] flex items-center justify-center text-sm text-gray-400">Memuat grafik…</Card>
                        <Card className="min-h-[280px] flex items-center justify-center text-sm text-gray-400">Memuat grafik…</Card>
                    </>
                }>
                    <DashboardCharts monthly_stats={monthly_stats} top_products={top_products} />
                </Suspense>
            </div>

            {/* Commissions + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card padded>
                    <CardHeader title="Ringkasan Komisi" />
                    <div className="space-y-5">
                        <Bar
                            label="Menunggu Pencairan"
                            value={formatCurrency(pending_commissions)}
                            percent={pendingPct}
                            barClass="bg-amber-400"
                            labelClass="text-amber-700"
                        />
                        <Bar
                            label="Sudah Dibayar"
                            value={formatCurrency(paid_commissions)}
                            percent={paidPct}
                            barClass="bg-emerald-500"
                            labelClass="text-emerald-700"
                        />
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-500">Total Komisi</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(totalCommissions)}</span>
                        </div>
                    </div>
                </Card>

                <Card padded={false} className="lg:col-span-2 overflow-hidden">
                    <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">10 Pesanan Terbaru</h3>
                        <a href="/admin/orders" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">
                            Semua <ArrowUpRight size={11} />
                        </a>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/60 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Order ID</th>
                                <th className="px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Customer</th>
                                <th className="px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Total</th>
                                <th className="px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recent_orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada pesanan.</td>
                                </tr>
                            ) : recent_orders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-2.5 font-mono text-xs text-gray-900">{order.order_number}</td>
                                    <td className="px-5 py-2.5 text-gray-700">{order.customer}</td>
                                    <td className="px-5 py-2.5 text-right font-medium text-gray-900">{formatCurrency(order.total)}</td>
                                    <td className="px-5 py-2.5">
                                        <Badge color={STATUS_COLOR[order.status] || 'gray'} dot>
                                            {order.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
}

// ── helpers ─────────────────────────────────────

function Stat({ label, value, icon: Icon, tone = 'default' }) {
    const iconTone = tone === 'warning' ? 'text-amber-500 bg-amber-50' : 'text-gray-400 bg-gray-50';
    return (
        <div className="bg-white border border-gray-200 rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{label}</span>
                <span className={`w-7 h-7 rounded-md flex items-center justify-center ${iconTone}`}>
                    <Icon size={14} strokeWidth={2} />
                </span>
            </div>
            <p className="text-xl font-semibold text-gray-900 tabular-nums">{value}</p>
        </div>
    );
}

function Bar({ label, value, percent, barClass, labelClass }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{label}</p>
                <span className={`text-[11px] font-semibold ${labelClass}`}>{percent}%</span>
            </div>
            <p className={`text-lg font-semibold ${labelClass} tabular-nums`}>{value}</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`${barClass} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
