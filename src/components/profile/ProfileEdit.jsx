import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, Lock, Save, MapPin, Eye, EyeOff, KeyRound } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import Swal from 'sweetalert2';

export default function ProfileEdit() {
    const { userData, updateProfile, updatePassword } = useAuth();

    // ── Profile Form State ──
    const [profile, setProfile] = useState({
        name: userData?.name || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        city: userData?.city || '',
        postal_code: userData?.postal_code || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});

    // ── Password Form State ──
    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // ── Handle Profile Submit ──
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileErrors({});

        // Check if anything changed
        const payload = {};
        if (profile.name !== userData?.name) payload.name = profile.name;
        if (profile.phone !== userData?.phone) payload.phone = profile.phone;
        if (profile.address !== (userData?.address || '')) payload.address = profile.address;
        if (profile.city !== (userData?.city || '')) payload.city = profile.city;
        if (profile.postal_code !== (userData?.postal_code || '')) payload.postal_code = profile.postal_code;

        if (Object.keys(payload).length === 0) {
            Swal.fire({ icon: 'info', title: 'Tidak Ada Perubahan', text: 'Tidak ada data yang berubah.', timer: 1500, showConfirmButton: false });
            return;
        }

        setProfileLoading(true);
        try {
            await updateProfile(payload);
            Swal.fire({ icon: 'success', title: 'Profil Diperbarui', text: 'Data profil berhasil disimpan.', timer: 1500, showConfirmButton: false });
        } catch (error) {
            if (error?.validationErrors) {
                setProfileErrors(error.validationErrors);
            } else {
                Swal.fire('Gagal', getErrorMessage(error), 'error');
            }
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Handle Password Submit ──
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordErrors({});

        // Client-side validation
        if (passwords.password.length < 6) {
            setPasswordErrors({ password: ['Password baru minimal 6 karakter.'] });
            return;
        }
        if (passwords.password !== passwords.password_confirmation) {
            setPasswordErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] });
            return;
        }

        setPasswordLoading(true);
        try {
            await updatePassword(passwords.current_password, passwords.password);
            Swal.fire({ icon: 'success', title: 'Password Diperbarui', text: 'Password berhasil diubah.', timer: 1500, showConfirmButton: false });
            setPasswords({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            if (error?.validationErrors) {
                setPasswordErrors(error.validationErrors);
            } else {
                Swal.fire('Gagal', getErrorMessage(error), 'error');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const inputClass = (fieldError) =>
        `w-full rounded-xl bg-gray-50 p-3 text-sm border transition focus:outline-none focus:ring-2 ${
            fieldError ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
        }`;

    const fieldError = (errors, field) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field][0]}</p> : null;

    return (
        <div className="space-y-8">

            {/* ── Section 1: Informasi Personal ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="text-[var(--color-primary)]" />
                    Informasi Personal
                </h2>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Nama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.name)}`}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>
                            {fieldError(profileErrors, 'name')}
                        </div>

                        {/* Telepon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.phone)}`}
                                    placeholder="Contoh: 08123456789"
                                />
                            </div>
                            {fieldError(profileErrors, 'phone')}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={userData?.email || ''}
                                    disabled
                                    className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
                        </div>

                        {/* Kota */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.city}
                                    onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.city)}`}
                                    placeholder="Contoh: Jakarta Selatan"
                                />
                            </div>
                            {fieldError(profileErrors, 'city')}
                        </div>

                        {/* Alamat */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
                            <textarea
                                value={profile.address}
                                onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                                rows="2"
                                className={`resize-none ${inputClass(profileErrors.address)}`}
                                placeholder="Nama jalan, nomor, RT/RW, kelurahan..."
                            />
                            {fieldError(profileErrors, 'address')}
                        </div>

                        {/* Kode Pos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                            <input
                                type="text"
                                value={profile.postal_code}
                                onChange={(e) => setProfile(p => ({ ...p, postal_code: e.target.value }))}
                                className={inputClass(profileErrors.postal_code)}
                                placeholder="Contoh: 12345"
                                maxLength={10}
                            />
                            {fieldError(profileErrors, 'postal_code')}
                        </div>

                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition-transform active:scale-95"
                        >
                            {profileLoading
                                ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Menyimpan...</>
                                : <><Save size={16} /> Simpan Profil</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Section 2: Ubah Password ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <KeyRound className="text-[var(--color-primary)]" />
                    Ubah Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Masukkan password lama kamu dan buat password baru yang kuat.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* Current Password */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={passwords.current_password}
                                    onChange={(e) => setPasswords(p => ({ ...p, current_password: e.target.value }))}
                                    className={`pl-10 pr-10 ${inputClass(passwordErrors.current_password)}`}
                                    placeholder="Masukkan password lama"
                                    required
                                />
                                <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {fieldError(passwordErrors, 'current_password')}
                        </div>

                        {/* New Password */}
                        <div className="md:col-span-3 md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={passwords.password}
                                        onChange={(e) => setPasswords(p => ({ ...p, password: e.target.value }))}
                                        className={`pl-10 pr-10 ${inputClass(passwordErrors.password)}`}
                                        placeholder="Minimal 6 karakter"
                                        minLength={6}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNewPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {fieldError(passwordErrors, 'password')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showConfirmPw ? 'text' : 'password'}
                                        value={passwords.password_confirmation}
                                        onChange={(e) => setPasswords(p => ({ ...p, password_confirmation: e.target.value }))}
                                        className={`pl-10 pr-10 ${inputClass(passwordErrors.password_confirmation)}`}
                                        placeholder="Ulangi password baru"
                                        minLength={6}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {fieldError(passwordErrors, 'password_confirmation')}
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition-transform active:scale-95"
                        >
                            {passwordLoading
                                ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Memperbarui...</>
                                : <><KeyRound size={16} /> Ubah Password</>
                            }
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
