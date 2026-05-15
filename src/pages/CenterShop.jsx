import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Users, Banknote, Clock, ArrowRight, Crown, ChevronRight } from 'lucide-react';
import { networkApi } from '../api/networkApi';

function StatCard({ icon, label, value, sub, colorClass = 'text-[var(--color-primary)]' }) {
    const IconComp = icon;
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 ${colorClass}`}>
                <IconComp size={20} />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default function CenterShop() {
    const { currentUser, userRole, userData, loading: authLoading } = useAuth();
    const [network, setNetwork] = useState(null);
    const [commissions, setCommissions] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Support both 'starcenter' and 'center' role names
    const isCenter = userRole === 'starcenter' || userRole === 'center' || userRole === 'admin';

    useEffect(() => {
        if (!currentUser || !isCenter) return;
        const fetchStats = async () => {
            try {
                const [netData, commData] = await Promise.all([
                    networkApi.getReferralInfo(),
                    networkApi.getCommissions(1),
                ]);
                setNetwork(netData);
                setCommissions(commData);
            } catch (e) {
                console.error('Failed to fetch center stats:', e);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [currentUser, isCenter]);

    if (authLoading) return <div className="min-h-screen pt-24 text-center text-gray-500">Memuat...</div>;
    if (!currentUser) return <Navigate to="/login" replace />;

    if (!isCenter) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
                <p className="text-gray-500 max-w-md mb-6">
                    Halaman ini khusus untuk member Starcenter. Upgrade akunmu untuk mendapatkan komisi multi-level dan harga grosir.
                </p>
                <Link
                    to="/join-starcenter"
                    className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition flex items-center gap-2"
                >
                    <Crown size={18} /> Upgrade ke Starcenter
                </Link>
            </div>
        );
    }

    // Compute commission stats
    const commList = commissions?.data?.data || [];
    const totalPending = commList.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
    const totalPaid = commList.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

    // Commission this month
    const now = new Date();
    const thisMonthComm = commList.filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

    const totalDownlines = network?.total_referrals || 0;

    const fmt = (v) => `Rp ${parseFloat(v || 0).toLocaleString('id-ID')}`;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Hero Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-emerald-800 text-white rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={20} className="text-yellow-300" />
                            <span className="text-yellow-300 text-sm font-semibold uppercase tracking-widest">Starcenter Member</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-1">Selamat datang, {userData?.name?.split(' ')[0] || 'Center'}!</h1>
                        <p className="text-emerald-100/80 text-sm">
                            Pantau komisi, downline, dan performa jaringan Anda dari satu tempat.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                {loadingStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Banknote}
                            label="Komisi Bulan Ini"
                            value={fmt(thisMonthComm)}
                            colorClass="text-emerald-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Komisi Pending"
                            value={fmt(totalPending)}
                            sub="Menunggu pencairan"
                            colorClass="text-amber-500"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Total Dibayar"
                            value={fmt(totalPaid)}
                            colorClass="text-blue-600"
                        />
                        <StatCard
                            icon={Users}
                            label="Total Downline"
                            value={totalDownlines}
                            sub="Anggota jaringan"
                            colorClass="text-purple-600"
                        />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/profile?tab=commissions"
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <Banknote size={20} className="text-emerald-600" />
                            <span className="font-semibold text-gray-800">Riwayat Komisi</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition" />
                    </Link>
                    <Link
                        to="/profile?tab=network"
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-purple-600" />
                            <span className="font-semibold text-gray-800">Jaringan Saya</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition" />
                    </Link>
                    <Link
                        to="/products"
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={20} className="text-[var(--color-accent)]" />
                            <span className="font-semibold text-gray-800">Belanja Sekarang</span>
                        </div>
                        <ArrowRight size={18} className="text-gray-400 group-hover:translate-x-1 transition" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
