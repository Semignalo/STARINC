import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';
import { Share2, Users, Copy, TrendingUp, Search, Network, Table, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';
// import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import NetworkTree from './NetworkTree';

export default function ProfileNetwork() {
    const [network, setNetwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'tree'
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const data = await networkApi.getReferralInfo();
                setNetwork(data);
            } catch (error) {
                console.error('Error fetching network:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNetwork();
    }, []);

    const handleCopy = (text, type = 'Kode') => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            title: 'Tersalin!',
            text: `${type} berhasil disalin ke clipboard.`,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-32 w-full bg-gray-100 rounded-3xl animate-pulse" />
                <div className="h-64 w-full bg-gray-50 rounded-3xl animate-pulse" />
            </div>
        );
    }

    const referrals = network?.referrals || [];
    const filteredReferrals = referrals.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));
    
    // Calculate total spending by downlines
    const totalDownlineSpend = referrals.reduce((sum, r) => sum + parseFloat(r.cumulative_spending || 0), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Users className="text-[var(--color-primary)]" /> Jaringan Saya
            </h2>

            {/* Top Stats & Invitation Link */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Referral Link Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2 relative z-10"><Share2 size={20} className="text-[var(--color-primary)]" /> Ajak Teman & Dapatkan Komisi</h3>
                    <p className="text-gray-400 text-sm mb-6 relative z-10">Bagikan kode atau link referral kamu untuk mendapatkan komisi dari setiap transaksi mereka.</p>
                    
                    <div className="space-y-4 relative z-10">
                        <div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Kode Referral</div>
                            <div className="flex items-center gap-2">
                                <div className="bg-white/10 border border-white/20 px-4 py-2.5 rounded-xl font-mono text-lg font-bold tracking-widest text-[#FFE066] flex-1">
                                    {network?.referral_code}
                                </div>
                                <button 
                                    onClick={() => handleCopy(network?.referral_code, 'Kode Referral')}
                                    className="bg-white text-gray-900 p-3 rounded-xl hover:bg-gray-100 transition active:scale-95"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Link Pendaftaran</div>
                            <div className="flex items-center gap-2">
                                <div className="bg-black/30 border border-white/10 px-4 py-2.5 rounded-xl text-sm text-gray-300 truncate flex-1">
                                    {network?.referral_url}
                                </div>
                                <button
                                    onClick={() => handleCopy(network?.referral_url, 'Link Referral')}
                                    className="bg-black/50 text-white p-3 rounded-xl hover:bg-black/70 transition border border-white/10 active:scale-95 flex-shrink-0"
                                    title="Salin link"
                                >
                                    <Copy size={20} />
                                </button>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Bergabunglah bersama saya di STARINC! Daftar dengan link referral saya: ${network?.referral_url}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-500 transition active:scale-95 flex-shrink-0"
                                    title="Bagikan via WhatsApp"
                                >
                                    <MessageCircle size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Share actions row */}
                        <div className="flex items-center gap-2 mt-2 relative z-10">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Bergabung di STARINC',
                                            text: `Daftar dengan kode referral saya: ${network?.referral_code}`,
                                            url: network?.referral_url,
                                        }).catch(() => {});
                                    } else {
                                        handleCopy(network?.referral_url, 'Link Referral');
                                    }
                                }}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-2 rounded-lg transition active:scale-95"
                            >
                                <Share2 size={14} /> Bagikan Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Users size={16}/> Total Anggota</div>
                        <div className="text-4xl font-extrabold text-gray-900">{network?.total_referrals || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><TrendingUp size={16}/> Omzet Anggota</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">Rp. {totalDownlineSpend.toLocaleString('id-ID')}</div>
                    </div>
                </div>
            </div>

            {/* Downlines List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="font-bold text-gray-900 text-lg">Daftar Anggota ({filteredReferrals.length})</h3>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <Table size={16}/> Tabel
                            </button>
                            <button 
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'tree' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <Network size={16}/> Visualisasi Web
                            </button>
                        </div>
                        
                        {viewMode === 'table' && (
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama atau email..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full transition"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === 'tree' ? (
                    <NetworkTree referrals={referrals} currentUser={currentUser} />
                ) : filteredReferrals.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {search ? 'Tidak ada anggota yang cocok dengan pencarian.' : 'Kamu belum memiliki anggota terdaftar.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Anggota</th>
                                    <th className="px-6 py-4 font-medium">Level</th>
                                    <th className="px-6 py-4 font-medium">Tier</th>
                                    <th className="px-6 py-4 font-medium text-right">Total Transaksi</th>
                                    <th className="px-6 py-4 font-medium">Bergabung Pada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReferrals.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Lvl {user.level || 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                                                {user.tier?.name || 'Bronze'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            Rp. {parseFloat(user.cumulative_spending || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
