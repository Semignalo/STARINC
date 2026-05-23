import React, { useEffect, useState } from 'react';
import { networkApi } from '../../api/networkApi';
import { Share2, Users, Copy, TrendingUp, Search, Network, Table, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import NetworkTree from './NetworkTree';

export default function ProfileNetwork() {
    const [network, setNetwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('table');
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
            title: 'Tersalin',
            text: `${type} berhasil disalin.`,
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
                <div className="h-32 w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-64 w-full bg-gray-50 rounded-lg animate-pulse" />
            </div>
        );
    }

    const referrals = network?.referrals || [];
    const filteredReferrals = referrals.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalDownlineSpend = referrals.reduce((sum, r) => sum + parseFloat(r.cumulative_spending || 0), 0);
    const fmt = (v) => `Rp${parseFloat(v || 0).toLocaleString('id-ID')}`;

    return (
        <div className="space-y-5">

            {/* Section header */}
            <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">Jaringan Saya</h2>
            </div>

            {/* Referral + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Referral Card (dark) */}
                <div className="lg:col-span-2 bg-[#0F172A] text-white p-7 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-2">Invite & Earn</p>
                    <h3 className="text-base font-medium text-white tracking-tight mb-1">Ajak Teman, Dapat Komisi</h3>
                    <p className="text-xs text-white/60 leading-relaxed mb-6">
                        Bagikan kode atau link referral untuk dapat komisi dari setiap transaksi mereka.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1.5">Kode Referral</p>
                            <div className="flex items-center gap-2">
                                <div className="bg-white/5 border border-white/10 px-4 h-11 flex items-center font-mono text-sm tracking-[0.2em] text-[var(--color-accent)] flex-1 rounded-md">
                                    {network?.referral_code}
                                </div>
                                <button
                                    onClick={() => handleCopy(network?.referral_code, 'Kode Referral')}
                                    className="w-11 h-11 flex items-center justify-center bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                                    aria-label="Salin kode"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1.5">Link Pendaftaran</p>
                            <div className="flex items-center gap-2">
                                <div className="bg-black/30 border border-white/10 px-4 h-11 flex items-center text-xs text-white/70 truncate flex-1 rounded-md">
                                    {network?.referral_url}
                                </div>
                                <button
                                    onClick={() => handleCopy(network?.referral_url, 'Link Referral')}
                                    className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/10 text-white rounded-md hover:bg-white/20 transition-colors flex-shrink-0"
                                    title="Salin link"
                                >
                                    <Copy size={14} />
                                </button>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(`Bergabunglah bersama saya di STARINC! Daftar dengan link referral saya: ${network?.referral_url}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-11 h-11 flex items-center justify-center bg-white/10 border border-white/10 text-white rounded-md hover:bg-white/20 transition-colors flex-shrink-0"
                                    title="Bagikan via WhatsApp"
                                >
                                    <MessageCircle size={14} />
                                </a>
                            </div>
                        </div>

                        <div className="pt-2">
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
                                className="inline-flex items-center gap-2 px-4 h-9 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] uppercase tracking-[0.2em] rounded-md transition-colors"
                            >
                                <Share2 size={12} /> Bagikan Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 p-6 rounded-lg flex-1 flex flex-col justify-center">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2 flex items-center gap-1.5">
                            <Users size={12} /> Total Anggota
                        </div>
                        <div className="text-3xl font-medium text-gray-900 tabular-nums tracking-tight">{network?.total_referrals || 0}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-lg flex-1 flex flex-col justify-center">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2 flex items-center gap-1.5">
                            <TrendingUp size={12} /> Omzet Anggota
                        </div>
                        <div className="text-xl font-medium text-gray-900 tabular-nums tracking-tight">{fmt(totalDownlineSpend)}</div>
                    </div>
                </div>
            </div>

            {/* Downlines List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Members</p>
                        <h3 className="text-sm font-medium text-gray-900 tracking-tight mt-0.5">
                            Daftar Anggota ({filteredReferrals.length})
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-gray-100 p-0.5 rounded-md">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 h-8 rounded text-xs flex items-center gap-1.5 transition-colors ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <Table size={12} /> Tabel
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 h-8 rounded text-xs flex items-center gap-1.5 transition-colors ${viewMode === 'tree' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <Network size={12} /> Tree
                            </button>
                        </div>

                        {viewMode === 'table' && (
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Cari nama / email…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-md pl-8 pr-3 h-9 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 w-full transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === 'tree' ? (
                    <NetworkTree referrals={referrals} currentUser={currentUser} />
                ) : filteredReferrals.length === 0 ? (
                    <div className="p-12 text-center text-sm text-gray-500">
                        {search ? 'Tidak ada anggota yang cocok.' : 'Kamu belum memiliki anggota terdaftar.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                    <th className="px-6 py-3 font-medium">Anggota</th>
                                    <th className="px-6 py-3 font-medium text-center">Level</th>
                                    <th className="px-6 py-3 font-medium text-right">Total Transaksi</th>
                                    <th className="px-6 py-3 font-medium">Bergabung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReferrals.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium text-xs uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">L{user.level || 1}</span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-gray-700 tabular-nums">
                                            {fmt(user.cumulative_spending)}
                                        </td>
                                        <td className="px-6 py-3.5 text-gray-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
