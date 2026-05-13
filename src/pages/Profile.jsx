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

export default function Profile() {
    const { currentUser, userData, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!userData) return <div className="min-h-screen pt-24 pb-12 text-center text-gray-500">Memuat profil...</div>;

    const isInactive = userData.status === 'inactive';

    const getThemeClass = () => {
        if (userRole === 'admin') return 'bg-red-600';
        return 'bg-gradient-to-r from-blue-700 to-indigo-900';
    };

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4 relative">
            <div className="container mx-auto max-w-5xl">

                {/* Header Banner */}
                <div className={`${getThemeClass()} rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-8 transition-all duration-700`}>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                    <button onClick={() => setActiveTab('settings')}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition z-20 flex items-center gap-2">
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

                            {userRole === 'admin' ? (
                                <div className="inline-flex items-center gap-2 bg-white text-red-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                    <ShieldCheck size={16} /> Administrator
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <div className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-black/10">
                                        <Crown size={16} /> Official STARINC Distributor
                                    </div>
                                    {isInactive && (
                                        <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                            <AlertTriangle size={16} /> Tidak Aktif
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MENU TABS */}
                {activeTab !== 'settings' && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                        {[
                            { id: 'overview', icon: <Home size={18} />, label: 'Overview', mobileLabel: 'Dash' },
                            { id: 'orders', icon: <Package size={18} />, label: 'Order History', mobileLabel: 'Pesanan' },
                            { id: 'network', icon: <Users size={18} />, label: 'Jaringan', mobileLabel: 'Jaringan' },
                            { id: 'commissions', icon: <Wallet size={18} />, label: 'Komisi', mobileLabel: 'Komisi' },
                            { id: 'wallet', icon: <TrendingUp size={18} />, label: 'Wallet', mobileLabel: 'Wallet' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex justify-center items-center gap-2 p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
                                    activeTab === tab.id
                                        ? (tab.id === 'wallet' ? 'bg-emerald-700 text-white shadow-lg' : 'bg-primary text-white shadow-lg')
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.mobileLabel}</span>
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Settings size={20} className="text-primary" /> Pengaturan Profil</h2>
                        <button onClick={() => setActiveTab('overview')}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                            Kembali ke Dashboard
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
                        {/* Inactive Warning */}
                        {isInactive && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
                                <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-800 mb-1">Akun Tidak Aktif</h3>
                                    <p className="text-sm text-red-700">
                                        Akun Anda dinonaktifkan karena tidak ada transaksi selama 3 bulan. Hubungi admin untuk mengaktifkan kembali akun Anda.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Starcenter Overview */}
                        {userRole === 'starcenter' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Stats */}
                                <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-[var(--color-primary)]" /> Ringkasan Akun
                                    </h2>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Pembelanjaan</p>
                                            <p className="text-2xl font-bold text-gray-900">Rp {(userData.cumulative_spending || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Diskon Member</p>
                                            <p className="text-2xl font-bold text-[var(--color-primary)]">{STARCENTER_DISCOUNT}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Status Akun</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isInactive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {isInactive ? 'Tidak Aktif' : 'Aktif'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Transaksi Terakhir</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {userData.last_transaction_at
                                                    ? new Date(userData.last_transaction_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : 'Belum ada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 flex flex-col justify-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                                    <Crown className="mx-auto text-blue-500 mb-3" size={36} />
                                    <h3 className="font-bold text-gray-900 mb-2">Distributor Panel</h3>
                                    <p className="text-xs text-gray-500 mb-4">Nikmati diskon {STARCENTER_DISCOUNT}% di semua produk. Komisi 5% untuk rekrutan baru, 1% untuk transaksi berikutnya.</p>
                                    <Link to="/center"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm">
                                        <ShoppingBag size={16} /> Katalog Center <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Admin Overview */}
                        {userRole === 'admin' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 text-center">
                                <ShieldCheck className="mx-auto text-red-500 mb-3" size={40} />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Administrator</h2>
                                <p className="text-gray-500 text-sm mb-4">Akses penuh ke admin panel untuk mengelola produk, pesanan, dan pengguna.</p>
                                <Link to="/admin" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition text-sm">
                                    Buka Admin Panel <ChevronRight size={16} />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
