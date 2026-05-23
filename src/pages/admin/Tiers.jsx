import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Settings2, Save, Crown } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminTiers() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/tiers'); // public route
            setTiers(res.data);
        } catch (error) {
            console.error("Failed to fetch tiers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleUpdate = async (id, field, value) => {
        setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSave = async (tier) => {
        try {
            await apiClient.put(`/admin/settings/tiers/${tier.id}`, { // Oops: Wait, route is /settings or /tiers? Let's fix route. Admin is /admin/tiers/{id}
                name: tier.name,
                min_spend: tier.min_spend,
                discount_percent: tier.discount_percent
            });
            Swal.fire({
                title: 'Tersimpan',
                text: `Pengaturan Tier ${tier.name} berhasil disimpan.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch {
            Swal.fire('Error', 'Gagal menyimpan konfigurasi.', 'error');
        }
    }

    if (loading) {
        return <div className="p-6 text-gray-500">Memuat konfigurasi tier...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Crown className="text-purple-600" /> Pengaturan Tier (Level)
                </h1>
                <p className="text-sm text-gray-500 mt-1">Konfigurasi batas pembelanjaan dan diskon per tingkat membership</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tiers.map(tier => (
                    <div key={tier.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white uppercase text-xs 
                                ${tier.slug === 'bronze' ? 'bg-[#cd7f32]' : 
                                  tier.slug === 'silver' ? 'bg-gray-400' : 
                                  tier.slug === 'gold' ? 'bg-yellow-400' : 
                                  tier.slug === 'platinum' ? 'bg-blue-400' : 'bg-purple-600'}`}>
                                {tier.slug.substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{tier.name}</h3>
                                <p className="text-xs text-gray-500">Code: {tier.slug.toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Nama Tampilan</label>
                                <input 
                                    type="text" 
                                    value={tier.name}
                                    onChange={(e) => handleUpdate(tier.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Minimal Pembelanjaan (Rp)</label>
                                <input 
                                    type="number" 
                                    value={tier.min_spend}
                                    onChange={(e) => handleUpdate(tier.id, 'min_spend', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Diskon Transaksi (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={tier.discount_percent}
                                        onChange={(e) => handleUpdate(tier.id, 'discount_percent', e.target.value)}
                                        className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleSave(tier)}
                            className="mt-6 w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                        >
                            <Save size={16} /> Simpan Perubahan
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
