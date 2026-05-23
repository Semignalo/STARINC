import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Users, Banknote, Clock, ArrowRight, Crown, ChevronRight } from 'lucide-react';
import { networkApi } from '../api/networkApi';

function Stat({ label, value, sub }) {
    return (
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">{label}</p>
            <p className="text-xl font-medium text-gray-900 tabular-nums tracking-tight">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

function QuickLink({ to, icon: Icon, label }) {
    return (
        <Link
            to={to}
            className="bg-white border border-gray-200 hover:border-gray-400 transition-colors p-5 rounded-lg flex items-center justify-between group"
        >
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-900">{label}</span>
            </div>
            <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-0.5 group-hover:text-gray-600 transition-all" />
        </Link>
    );
}

export default function CenterShop() {
    const { currentUser, userRole, userData, loading: authLoading } = useAuth();
    const [network, setNetwork] = useState(null);
    const [commissions, setCommissions] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

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

    if (authLoading) return <div className="min-h-screen pt-32 text-center text-sm text-gray-400">Memuat…</div>;
    if (!currentUser) return <Navigate to="/login" replace />;

    if (!isCenter) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mb-5">
                    <ShoppingBag size={20} className="text-gray-400" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Members Only</p>
                <h1 className="text-2xl font-medium text-gray-900 tracking-tight mb-2">Akses Terbatas</h1>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                    Halaman ini khusus untuk member Starcenter. Daftar sekarang untuk dapat komisi multi-level dan harga grosir.
                </p>
                <Link
                    to="/join-starcenter"
                    className="inline-flex items-center gap-2 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md"
                >
                    <Crown size={12} /> Daftar Starcenter
                </Link>
            </div>
        );
    }

    const commList = commissions?.data?.data || [];
    const totalPending = commList.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);
    const totalPaid = commList.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

    const now = new Date();
    const thisMonthComm = commList.filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, c) => s + parseFloat(c.commission_amount || 0), 0);

    const totalDownlines = network?.total_referrals || 0;
    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="bg-white border border-gray-200 p-7 md:p-9 mb-6 rounded-lg">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Starcenter Dashboard</p>
                    <h1 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-2">
                        Halo, {userData?.name?.split(' ')[0] || 'Center'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Pantau komisi, downline, dan performa jaringan Anda dari satu tempat.
                    </p>
                </div>

                {/* Stats */}
                {loadingStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white border border-gray-200 h-28 animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Stat label="Komisi Bulan Ini" value={fmt(thisMonthComm)} />
                        <Stat label="Komisi Pending" value={fmt(totalPending)} sub="Menunggu pencairan" />
                        <Stat label="Total Dibayar" value={fmt(totalPaid)} />
                        <Stat label="Total Downline" value={totalDownlines} sub="Anggota jaringan" />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickLink to="/profile?tab=commissions" icon={Banknote} label="Riwayat Komisi" />
                    <QuickLink to="/profile?tab=network" icon={Users} label="Jaringan Saya" />
                    <QuickLink to="/products" icon={ShoppingBag} label="Belanja Sekarang" />
                </div>

            </div>
        </div>
    );
}
