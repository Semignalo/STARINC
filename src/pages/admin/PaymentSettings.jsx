import React, { useState, useEffect } from 'react';
import { adminSettingsApi } from '../../api/settingsApi';
import { Save, Building2, CreditCard, User } from 'lucide-react';
import Swal from 'sweetalert2';
import Button from '../../components/admin/ui/Button';
import Input from '../../components/admin/ui/Input';
import Card from '../../components/admin/ui/Card';

export default function PaymentSettings() {
    const [config, setConfig] = useState({
        bankName: 'BCA',
        accountNumber: '888888888',
        accountName: 'PT BBK'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const data = await adminSettingsApi.getSettings();
                // Backend mengembalikan settings sebagai key-value
                // Merge data dari API ke config state
                if (data && data.settings) {
                    const s = data.settings;
                    setConfig(prev => ({
                        ...prev,
                        bankName: s.bankName ?? prev.bankName,
                        accountNumber: s.accountNumber ?? prev.accountNumber,
                        accountName: s.accountName ?? prev.accountName,
                    }));
                }
            } catch (error) {
                console.error('Error fetching payment settings:', error);
                // Tidak tampilkan error - gunakan default value
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentSettings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminSettingsApi.updateSettings({
                bankName: config.bankName,
                accountNumber: config.accountNumber,
                accountName: config.accountName,
            });
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pengaturan pembayaran berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } catch (error) {
            console.error('Error saving payment settings:', error);
            Swal.fire({
                title: 'Gagal!',
                text: error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
                icon: 'error',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-400">Memuat pengaturan…</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="flex justify-between items-end mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Rekening Pembayaran</h1>
                    <p className="text-xs text-gray-500 mt-1">Rekening bank tujuan transfer customer</p>
                </div>
                <Button variant="primary" icon={Save} onClick={handleSave} loading={saving}>
                    {saving ? 'Menyimpan…' : 'Simpan'}
                </Button>
            </div>

            <Card className="space-y-5">
                <Input
                    icon={Building2}
                    label="Nama Bank"
                    name="bankName"
                    value={config.bankName}
                    onChange={handleInputChange}
                    placeholder="BCA, BNI, MANDIRI"
                />
                <Input
                    icon={CreditCard}
                    label="Nomor Rekening"
                    name="accountNumber"
                    value={config.accountNumber}
                    onChange={handleInputChange}
                    placeholder="888888888"
                    className="font-mono tracking-wider"
                />
                <Input
                    icon={User}
                    label="Nama Pemilik Rekening (A/N)"
                    name="accountName"
                    value={config.accountName}
                    onChange={handleInputChange}
                    placeholder="PT BBK"
                />
            </Card>
        </div>
    );
}
