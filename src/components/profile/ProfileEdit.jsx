import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, Lock, Save, MapPin, Eye, EyeOff, KeyRound, Building2, Landmark, FileText, Instagram, CreditCard, Calendar, IdCard } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import Swal from 'sweetalert2';

export default function ProfileEdit() {
    const { userData, updateProfile, updatePassword } = useAuth();

    // ── Profile Form State ──
    const [profile, setProfile] = useState({
        name: userData?.name || '',
        center_name: userData?.center_name || '',
        nik: userData?.nik || '',
        birth_date: userData?.birth_date || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        city: userData?.city || '',
        postal_code: userData?.postal_code || '',
        bank_name: userData?.bank_name || '',
        bank_account_number: userData?.bank_account_number || '',
        bank_account_holder: userData?.bank_account_holder || '',
        bank_branch: userData?.bank_branch || '',
        npwp_number: userData?.npwp_number || '',
        npwp_holder_name: userData?.npwp_holder_name || '',
        ig_account: userData?.ig_account || '',
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
        const fields = [
            'name', 'center_name', 'nik', 'birth_date',
            'phone', 'address', 'city', 'postal_code',
            'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_branch',
            'npwp_number', 'npwp_holder_name', 'ig_account',
        ];
        fields.forEach((f) => {
            if (profile[f] !== (userData?.[f] || '')) payload[f] = profile[f];
        });

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
        `w-full h-11 px-3 rounded-md bg-white text-sm border transition-colors focus:outline-none focus:ring-1 placeholder:text-gray-400 ${
            fieldError ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-gray-200 focus:ring-gray-900 focus:border-gray-900'
        }`;

    const fieldError = (errors, field) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field][0]}</p> : null;

    return (
        <div className="space-y-8">

            {/* ── Section 1: Informasi Personal ── */}
            <div className="bg-white p-7 md:p-8 border border-gray-200 rounded-lg">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Profile</p>
                <h2 className="text-base font-medium text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    Informasi Personal
                </h2>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                    {/* Member ID (read-only) */}
                    {userData?.member_id && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-0.5">Kode Center</p>
                                <p className="font-mono text-sm text-gray-900 tracking-wider">{userData.member_id}</p>
                            </div>
                            {userData?.initiator_name && (
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-0.5">Inisiator</p>
                                    <p className="text-sm text-gray-700">{userData.initiator_name}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Center Name */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pendaftaran Center</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.center_name}
                                    onChange={(e) => setProfile(p => ({ ...p, center_name: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.center_name)}`}
                                    placeholder="Contoh: Starinc Official Surabaya"
                                />
                            </div>
                            {fieldError(profileErrors, 'center_name')}
                        </div>

                        {/* Nama */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Nomor WhatsApp / HP</label>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={userData?.email || ''}
                                    disabled
                                    className="pl-10 w-full h-11 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Email tidak dapat diubah.</p>
                        </div>

                        {/* Kota */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Kota / Kabupaten</label>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat Pengiriman</label>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Kode Pos</label>
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

                        {/* NIK */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">NIK (KTP)</label>
                            <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.nik}
                                    onChange={(e) => setProfile(p => ({ ...p, nik: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                                    className={`pl-10 font-mono tracking-wider ${inputClass(profileErrors.nik)}`}
                                    placeholder="16 digit"
                                    maxLength={16}
                                />
                            </div>
                            {fieldError(profileErrors, 'nik')}
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={profile.birth_date}
                                    onChange={(e) => setProfile(p => ({ ...p, birth_date: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.birth_date)}`}
                                />
                            </div>
                            {fieldError(profileErrors, 'birth_date')}
                        </div>

                        {/* IG */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Akun Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.ig_account}
                                    onChange={(e) => setProfile(p => ({ ...p, ig_account: e.target.value }))}
                                    className={`pl-10 ${inputClass(profileErrors.ig_account)}`}
                                    placeholder="@username"
                                />
                            </div>
                            {fieldError(profileErrors, 'ig_account')}
                        </div>

                    </div>

                    {/* ── Sub-section: Rekening Bank ── */}
                    <div className="border-t border-gray-100 pt-6 mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Landmark size={14} className="text-gray-400" /> Rekening Bank
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Bank</label>
                                <input
                                    type="text"
                                    value={profile.bank_name}
                                    onChange={(e) => setProfile(p => ({ ...p, bank_name: e.target.value }))}
                                    className={inputClass(profileErrors.bank_name)}
                                    placeholder="BCA, BNI, Mandiri…"
                                />
                                {fieldError(profileErrors, 'bank_name')}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Cabang Bank</label>
                                <input
                                    type="text"
                                    value={profile.bank_branch}
                                    onChange={(e) => setProfile(p => ({ ...p, bank_branch: e.target.value }))}
                                    className={inputClass(profileErrors.bank_branch)}
                                    placeholder="KCP …"
                                />
                                {fieldError(profileErrors, 'bank_branch')}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">No. Rekening</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.bank_account_number}
                                        onChange={(e) => setProfile(p => ({ ...p, bank_account_number: e.target.value }))}
                                        className={`pl-10 ${inputClass(profileErrors.bank_account_number)}`}
                                        placeholder="Nomor rekening"
                                    />
                                </div>
                                {fieldError(profileErrors, 'bank_account_number')}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pemilik Rekening</label>
                                <input
                                    type="text"
                                    value={profile.bank_account_holder}
                                    onChange={(e) => setProfile(p => ({ ...p, bank_account_holder: e.target.value }))}
                                    className={inputClass(profileErrors.bank_account_holder)}
                                    placeholder="Sesuai buku tabungan"
                                />
                                {fieldError(profileErrors, 'bank_account_holder')}
                            </div>
                        </div>
                    </div>

                    {/* ── Sub-section: NPWP ── */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" /> NPWP
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">No. NPWP</label>
                                <input
                                    type="text"
                                    value={profile.npwp_number}
                                    onChange={(e) => setProfile(p => ({ ...p, npwp_number: e.target.value }))}
                                    className={`font-mono ${inputClass(profileErrors.npwp_number)}`}
                                    placeholder="00.000.000.0-000.000"
                                />
                                {fieldError(profileErrors, 'npwp_number')}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pemilik NPWP</label>
                                <input
                                    type="text"
                                    value={profile.npwp_holder_name}
                                    onChange={(e) => setProfile(p => ({ ...p, npwp_holder_name: e.target.value }))}
                                    className={inputClass(profileErrors.npwp_holder_name)}
                                    placeholder="Sesuai NPWP"
                                />
                                {fieldError(profileErrors, 'npwp_holder_name')}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="inline-flex items-center gap-2 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-60"
                        >
                            {profileLoading
                                ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span> Menyimpan…</>
                                : <><Save size={12} /> Simpan Profil</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Section 2: Ubah Password ── */}
            <div className="bg-white p-7 md:p-8 border border-gray-200 rounded-lg">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Security</p>
                <h2 className="text-base font-medium text-gray-900 tracking-tight mb-2 flex items-center gap-2">
                    <KeyRound size={14} className="text-gray-400" />
                    Ubah Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Masukkan password lama kamu dan buat password baru yang kuat.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* Current Password */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Saat Ini</label>
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
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Baru</label>
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
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
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
                            className="inline-flex items-center gap-2 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-60"
                        >
                            {passwordLoading
                                ? <><span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span> Memperbarui…</>
                                : <><KeyRound size={12} /> Ubah Password</>
                            }
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
