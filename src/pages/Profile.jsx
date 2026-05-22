import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, Crown, ChevronRight, ShoppingBag, Settings, Home, Package, Users, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import ProfileEdit from '../components/profile/ProfileEdit';
import ProfileOrders from '../components/profile/ProfileOrders';
import ProfileNetwork from '../components/profile/ProfileNetwork';
import ProfileCommissions from '../components/profile/ProfileCommissions';
import ProfileWallet from '../components/profile/ProfileWallet';

const STARCENTER_DISCOUNT = 23;

const TABS = [
    { id: 'overview',    icon: Home,       label: 'Overview' },
    { id: 'orders',      icon: Package,    label: 'Pesanan' },
    { id: 'network',     icon: Users,      label: 'Jaringan' },
    { id: 'commissions', icon: Wallet,     label: 'Komisi' },
    { id: 'wallet',      icon: TrendingUp, label: 'Wallet' },
];

export default function Profile() {
    const { currentUser, userData, userRole, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) return <div className="min-h-screen pt-32 text-center text-sm text-gray-400">Memuat profil…</div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (!userData) return <div className="min-h-screen pt-32 text-center text-sm text-gray-400">Memuat profil…</div>;

    const isInactive = userData.status === 'inactive';

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="bg-white border border-gray-200 p-7 md:p-9 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Account</p>
                        <button onClick={() => setActiveTab('settings')}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                            <Settings size={12} /> Edit Profil
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-2xl font-medium uppercase text-white">
                            {userData.name?.charAt(0) || userData.email?.charAt(0)}
                        </div>
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight mb-1">{userData.name || 'Member STARINC'}</h1>
                            <p className="text-sm text-gray-500 mb-4">{userData.email}</p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {userRole === 'admin' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em]">
                                        <ShieldCheck size={11} /> Administrator
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em]">
                                        <Crown size={11} /> Starcenter
                                    </span>
                                )}
                                {isInactive && userRole !== 'admin' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] uppercase tracking-[0.15em]">
                                        <AlertTriangle size={11} /> Tidak Aktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                {activeTab !== 'settings' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex justify-center items-center gap-1.5 h-10 px-3 text-xs uppercase tracking-[0.15em] transition-colors ${
                                        active
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}>
                                    <Icon size={12} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="mb-4 flex justify-between items-center bg-white p-4 border border-gray-200">
                        <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Settings size={14} className="text-gray-400" /> Pengaturan Profil
                        </h2>
                        <button onClick={() => setActiveTab('overview')}
                            className="text-xs text-gray-500 hover:text-gray-900 px-3 h-8 border border-gray-200 hover:border-gray-400 transition-colors">
                            Kembali
                        </button>
                    </div>
                )}

                {activeTab === 'settings' && <ProfileEdit />}
                {activeTab === 'orders' && <ProfileOrders />}
                {activeTab === 'network' && <ProfileNetwork />}
                {activeTab === 'commissions' && <ProfileCommissions />}
                {activeTab === 'wallet' && <ProfileWallet />}

                {activeTab === 'overview' && (
                    <>
                        {isInactive && (
                            <div className="bg-amber-50 border border-amber-200 p-5 mb-6 flex items-start gap-3">
                                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900 mb-0.5">Akun Tidak Aktif</p>
                                    <p className="text-xs text-amber-700">
                                        Akun Anda dinonaktifkan karena tidak ada transaksi selama 3 bulan. Hubungi admin untuk mengaktifkan kembali.
                                    </p>
                                </div>
                            </div>
                        )}

                        {userRole === 'starcenter' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Stats */}
                                <div className="lg:col-span-2 bg-white border border-gray-200 p-7">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Account Summary</p>
                                    <h2 className="text-lg font-medium text-gray-900 mb-6 tracking-tight">Ringkasan Akun</h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <Stat
                                            label="Total Pembelanjaan"
                                            value={`Rp${(userData.cumulative_spending || 0).toLocaleString('id-ID')}`}
                                        />
                                        <Stat
                                            label="Diskon Member"
                                            value={`${STARCENTER_DISCOUNT}%`}
                                        />
                                        <Stat
                                            label="Status Akun"
                                            value={isInactive
                                                ? <span className="inline-flex items-center gap-1.5 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Tidak Aktif</span>
                                                : <span className="inline-flex items-center gap-1.5 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>}
                                        />
                                        <Stat
                                            label="Transaksi Terakhir"
                                            value={userData.last_transaction_at
                                                ? new Date(userData.last_transaction_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        />
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="bg-gray-900 text-white p-7 flex flex-col justify-center text-center">
                                    <Crown className="mx-auto text-white/80 mb-3" size={28} />
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2">Members Only</p>
                                    <h3 className="text-base font-medium mb-3 tracking-tight">Center Shop</h3>
                                    <p className="text-xs text-white/60 mb-5 leading-relaxed">
                                        Diskon {STARCENTER_DISCOUNT}% untuk semua produk. Komisi 5% rekrutan baru, 1% transaksi berikutnya.
                                    </p>
                                    <Link to="/center"
                                        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white text-gray-900 text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors">
                                        <ShoppingBag size={12} /> Katalog Center
                                    </Link>
                                </div>
                            </div>
                        )}

                        {userRole === 'admin' && (
                            <div className="bg-white border border-gray-200 p-7 text-center">
                                <div className="w-12 h-12 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="text-gray-900" size={18} />
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Admin Access</p>
                                <h2 className="text-lg font-medium text-gray-900 mb-2 tracking-tight">Administrator</h2>
                                <p className="text-xs text-gray-500 mb-5 max-w-md mx-auto">
                                    Akses penuh ke admin panel untuk mengelola produk, pesanan, dan pengguna.
                                </p>
                                <Link to="/admin"
                                    className="inline-flex items-center gap-2 h-10 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs uppercase tracking-[0.2em] transition-colors">
                                    Buka Admin Panel <ChevronRight size={12} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">{label}</p>
            <p className="text-lg font-medium text-gray-900 tabular-nums">{value}</p>
        </div>
    );
}
