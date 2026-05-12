import React, { useEffect, useState, lazy, Suspense } from 'react';
import { TrendingUp, ShoppingCart, Users, AlertCircle, RefreshCw, ArrowUpRight, Clock, FileDown } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import apiClient from '../../api/client';

const DashboardCharts = lazy(() => import('./DashboardCharts'));

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

    useEffect(() => {
        fetchDashboard();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <RefreshCw className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (!data) return <div>Error loading data</div>;

    const {
        total_revenue,
        active_orders,
        total_customers,
        pending_payments,
        monthly_stats,
        top_products,
        pending_commissions,
        paid_commissions,
        recent_orders
    } = data;

    const totalCommissions = (pending_commissions || 0) + (paid_commissions || 0);

    return (
        <div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Ringkasan performa bisnis hari ini</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            const month = new Date().toISOString().slice(0, 7);
                            const res = await apiClient.get(`/admin/reports/monthly?month=${month}`, { responseType: 'blob' });
                            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                            Object.assign(document.createElement('a'), { href: url, download: `laporan-${month}.pdf` }).click();
                            URL.revokeObjectURL(url);
                        }}
                        className="text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2"
                    >
                        <FileDown size={14} /> Laporan PDF
                    </button>
                    <button onClick={fetchDashboard} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Urgent Alert: Pending Payments */}
            {pending_payments > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-amber-900">
                            {pending_payments} Pembayaran Menunggu Verifikasi
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Segera tinjau dan konfirmasi bukti pembayaran dari pelanggan.
                        </p>
                    </div>
                    <a
                        href="/admin/orders"
                        className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                        Lihat Orders <ArrowUpRight size={12} />
                    </a>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Pendapatan"
                    value={formatCurrency(total_revenue)}
                    subtext="Total Lifetime"
                    trend="up"
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Pesanan Aktif"
                    value={active_orders.toString()}
                    subtext="Perlu Diproses/Dikirim"
                    trend="neutral"
                    icon={ShoppingCart}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Customer"
                    value={total_customers.toString()}
                    subtext="Terdaftar (non-admin)"
                    trend="up"
                    icon={Users}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Pending Payment"
                    value={pending_payments.toString()}
                    subtext="Menunggu Validasi"
                    trend={pending_payments > 0 ? "down" : "neutral"}
                    icon={AlertCircle}
                    color="bg-yellow-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Suspense fallback={
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px] flex items-center justify-center text-gray-400">Memuat grafik...</div>
                        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[300px] flex items-center justify-center text-gray-400">Memuat grafik...</div>
                    </>
                }>
                    <DashboardCharts monthly_stats={monthly_stats} top_products={top_products} />
                </Suspense>
            </div>

            {/* Commissions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Commission Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Ringkasan Komisi</h3>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm text-gray-500">Menunggu Pencairan</p>
                                <span className="text-xs font-bold text-yellow-600">
                                    {totalCommissions > 0 ? Math.round((pending_commissions / totalCommissions) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pending_commissions)}</p>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                    style={{width: totalCommissions > 0 ? `${(pending_commissions / totalCommissions) * 100}%` : '0%'}}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm text-gray-500">Sudah Dibayar</p>
                                <span className="text-xs font-bold text-green-600">
                                    {totalCommissions > 0 ? Math.round((paid_commissions / totalCommissions) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(paid_commissions)}</p>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{width: totalCommissions > 0 ? `${(paid_commissions / totalCommissions) * 100}%` : '0%'}}
                                />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Komisi</span>
                                <span className="font-bold text-gray-800">{formatCurrency(totalCommissions)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">10 Pesanan Terbaru</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Total</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recent_orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada pesanan.</td>
                                    </tr>
                                ) : recent_orders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-blue-600">{order.order_number}</td>
                                        <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 border-l">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                  order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}

function StatCard({ title, value, subtext, trend, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                    {subtext}
                </p>
            </div>
            <div className={`p-3 rounded-lg text-white ${color} shadow-lg`}>
                <Icon size={20} />
            </div>
        </div>
    )
}
