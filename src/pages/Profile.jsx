import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTierProgress, TIER_CONFIG } from '../lib/tierUtils';
import { Navigate, Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Clock, Crown, ChevronRight, AlertCircle, ShoppingBag, User, Package, Settings, Home, Info, X, Users, Wallet } from 'lucide-react';
import ProfileEdit from '../components/profile/ProfileEdit';
import ProfileOrders from '../components/profile/ProfileOrders';
import ProfileNetwork from '../components/profile/ProfileNetwork';
import ProfileCommissions from '../components/profile/ProfileCommissions';
import ProfileWallet from '../components/profile/ProfileWallet';

export default function Profile() {
    const { currentUser, userData, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showTierInfo, setShowTierInfo] = useState(false);

    // Hitung sisa waktu tier (computed dari userData, tidak perlu state terpisah)
    const timeLeft = useMemo(() => {
        if (!userData || userRole === 'starcenter' || userRole === 'admin') {
            return { days: 30, text: '' };
        }
        const rawDate = userData.last_transaction_at || userData.created_at;
        const lastTx = rawDate ? new Date(rawDate) : new Date();
        const now = new Date();
        const diffDays = Math.ceil((now - lastTx) / (1000 * 60 * 60 * 24));
        const remaining = 30 - diffDays;

        let text = '';
        if (remaining > 15) text = 'Aman! Transaksi terakhir kamu masih baru.';
        else if (remaining > 5) text = 'Yuk belanja lagi untuk mempertahankan tier kamu!';
        else if (remaining > 0) text = 'Gawat! Tier kamu akan turun sebentar lagi, buruan checkout!';
        else text = 'Waktu habis, tier kamu sedang dievaluasi ulang.';

        return { days: Math.max(0, remaining), text };
    }, [userData, userRole]);

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!userData) return <div className="min-h-screen pt-24 pb-12 text-center text-gray-500">Memuat profil...</div>;

    const tierData = userData.tier || TIER_CONFIG.bronze; // Backend returns full tier details
    const tierSlug = userData.tier?.slug || 'bronze';
    const progressData = getTierProgress(tierSlug, userData.cumulative_spending || 0);

    const getThemeClass = () => {
        if (userRole === 'admin') return 'bg-red-600';
        if (userRole === 'starcenter') return 'bg-gradient-to-r from-blue-700 to-indigo-900';
        
        switch(tierSlug.toLowerCase()) {
            case 'bronze': return 'bg-gradient-to-r from-[#8C5E35] to-[#593922]';
            case 'silver': return 'bg-gradient-to-r from-slate-500 to-gray-600';
            case 'gold': return 'bg-gradient-to-r from-yellow-600 to-amber-600';
            case 'platinum': return 'bg-gradient-to-r from-[#173e43] to-[#264653]';
            case 'diamond': return 'bg-gradient-to-r from-violet-700 to-purple-900';
            default: return 'bg-primary';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4 relative">
            <div className="container mx-auto max-w-5xl">

                {/* Header Banner */}
                <div className={`${getThemeClass()} rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-8 transition-all duration-700`}>
                    {/* Background abstract decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                    {/* Settings Button on Top Right */}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition z-20 flex items-center gap-2"
                    >
                        <Settings size={20} />
                        <span className="hidden md:inline text-sm font-bold">Edit Profil</span>
                    </button>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
                        <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center flex-shrink-0 text-3xl font-bold uppercase backdrop-blur-sm">
                            {userData.name?.charAt(0) || userData.email?.charAt(0)}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{userData.name || 'Member Starinc'}</h1>
                            <p className="text-white/80 mb-4">{userData.email}</p>

                            {userRole === 'starcenter' ? (
                                <div className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-black/10">
                                    <Crown size={16} /> Official Starinc Distributor
                                </div>
                            ) : userRole === 'admin' ? (
                                <div className="inline-flex items-center gap-2 bg-white text-red-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    <ShieldCheck size={16} /> Administrator
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                    <span className="uppercase font-bold text-white">{tierData.name}</span> Member
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MENU TABS */}
                {activeTab !== 'settings' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Home size={18} /> <span className="hidden sm:inline">Overview</span><span className="sm:hidden">Dash</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Package size={18} /> <span className="hidden sm:inline">Order History</span><span className="sm:hidden">Pesanan</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('network')}
                            className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${activeTab === 'network' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Users size={18} /> Jaringan
                        </button>
                        <button
                            onClick={() => setActiveTab('commissions')}
                            className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${activeTab === 'commissions' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Wallet size={18} /> Komisi
                        </button>
                        <button
                            onClick={() => setActiveTab('wallet')}
                            className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${activeTab === 'wallet' ? 'bg-emerald-700 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            <TrendingUp size={18} /> Wallet
                        </button>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Settings size={20} className="text-primary" /> Pengaturan Profil</h2>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                )}

                {/* TAB CONTENT: Edit Profil */}
                {activeTab === 'settings' && <ProfileEdit />}

                {/* TAB CONTENT: Riwayat Pesanan */}
                {activeTab === 'orders' && <ProfileOrders />}

                {/* TAB CONTENT: Jaringan */}
                {activeTab === 'network' && <ProfileNetwork />}

                {/* TAB CONTENT: Komisi */}
                {activeTab === 'commissions' && <ProfileCommissions />}

                {/* TAB CONTENT: Wallet */}
                {activeTab === 'wallet' && <ProfileWallet />}

                {/* TAB CONTENT: Overview */}
                {activeTab === 'overview' && (
                    <>
                        {/* Tier Progress Section (Only for Regular User) */}
                        {userRole !== 'starcenter' && userRole !== 'admin' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                                <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <TrendingUp className="text-[var(--color-primary)]" />
                                            Progress Member
                                        </h2>
                                        <button 
                                            onClick={() => setShowTierInfo(!showTierInfo)} 
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[var(--color-primary)] bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-[var(--color-primary)] rounded-lg transition-colors tracking-wide uppercase"
                                        >
                                            <Info size={16} /> Info Tier
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Saat ini: <span className="font-bold text-gray-900">{tierData.name}</span>
                                            </div>
                                            {!progressData.maxReached && (
                                                <div className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">
                                                    Menuju: <span className="font-bold">{progressData.nextTierName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-3 rounded-full transition-all duration-1000 relative"
                                                style={{ width: `${progressData.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {!progressData.maxReached ? (
                                        <p className="text-sm text-gray-600">
                                            Sebentar lagi! Kamu tinggal <span className="font-bold text-[var(--color-primary)] text-base">Rp. {progressData.needed.toLocaleString('id-ID')}</span> lagi ke {progressData.nextTierName} untuk menikmati diskon {TIER_CONFIG[progressData.nextTierName.toLowerCase()]?.discount}% di seluruh produk.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-emerald-600 font-medium">
                                            Luar Biasa! Kamu sudah mencapai jajaran tier tetinggi. Nikmati diskon maksimalmu.
                                        </p>
                                    )}

                                    {/* Urgency Downgrade Widget */}
                                    <div className={`mt-6 p-4 rounded-2xl flex items-start gap-3 border ${timeLeft.days < 10 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                                        <Clock size={20} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">{timeLeft.days} Hari Tersisa</h4>
                                            <p className="text-xs leading-relaxed opacity-90">
                                                {timeLeft.text} <br /> Belanja dalam {timeLeft.days} hari untuk mempertahankan status tier kamu.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Widget */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                                    <div className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wide">Total Pengeluaran</div>
                                    <div className="text-3xl font-bold text-gray-900 mb-6">
                                        Rp{(userData.cumulative_spending || 0).toLocaleString('id-ID')}
                                    </div>

                                    <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Diskon Aktifmu</div>
                                    <div className="text-4xl font-extrabold text-[var(--color-primary)] mb-6">
                                        {tierData.discount_percent ?? tierData.discount ?? 0}%
                                    </div>

                                    <Link to="/products" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex justify-center items-center gap-2">
                                        <ShoppingBag size={18} /> Belanja Sekarang
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Starcenter Specific Message */}
                        {userRole === 'starcenter' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 mb-8 max-w-2xl mx-auto text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                                <AlertCircle className="text-blue-500 mx-auto mb-4" size={40} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Distributor Panel</h2>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Sebagai Starcenter, rank kamu dikunci secara permanen di Diamond (Diskon {tierData?.discount_percent ?? tierData?.discount}%) dan tidak dapat di-downgrade. Pembelian harus dilakukan dalam batch grosir secara rutin melalui halaman Center khusus.
                                </p>
                                <Link to="/center" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                    Masuk Katalog Center <ChevronRight size={18} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Tier Info */}
            {showTierInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowTierInfo(false)} 
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Crown className="text-primary"/> Tingkatan Member
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Patuhi minimal transaksi (Minimum Spend) yang dihitung secara berkala. Berhenti transaksi lebih dari 30 hari akan menyebabkan tier kamu turun 1 level setiap kelipatannya.
                        </p>
                        
                        <div className="space-y-3">
                            {Object.entries(TIER_CONFIG).map(([key, data]) => {
                                let bgStyle = 'bg-gray-900';
                                if (key === 'bronze') bgStyle = 'bg-gradient-to-br from-[#8C5E35] to-[#593922]';
                                if (key === 'silver') bgStyle = 'bg-gradient-to-br from-slate-400 to-gray-600';
                                if (key === 'gold') bgStyle = 'bg-gradient-to-br from-yellow-500 to-amber-600';
                                if (key === 'platinum') bgStyle = 'bg-gradient-to-br from-[#173e43] to-[#264653]';
                                if (key === 'diamond') bgStyle = 'bg-gradient-to-br from-violet-600 to-indigo-900';

                                return (
                                    <div key={key} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm ${bgStyle}`}>
                                            {data.discount}%
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 uppercase tracking-wide mb-0.5">{data.name}</h4>
                                            <p className="text-sm font-bold text-[var(--color-primary)] mb-1">Syarat: Rp{(data.minSpend).toLocaleString('id-ID')}</p>
                                            <p className="text-xs text-gray-500 leading-snug">Menikmati diskon permanen {data.discount}% untuk semua pembelanjaan produk eceran.</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                            <button 
                                onClick={() => setShowTierInfo(false)} 
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold w-full hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
