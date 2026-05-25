import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload, CheckCircle2, XCircle, Loader2,
    ChevronRight, ChevronLeft, User, Phone, Landmark, Users, Building2,
    CreditCard, FileText, Instagram, MapPin
} from 'lucide-react';
import { centerApi } from '../api/centerApi';
import { authApi } from '../api/authApi';

const STEPS = [
    { id: 1, label: 'Identitas', icon: User },
    { id: 2, label: 'Kontak', icon: Phone },
    { id: 3, label: 'Bank & Pajak', icon: Landmark },
    { id: 4, label: 'Inisiator', icon: Users },
];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = current > step.id;
                const active = current === step.id;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                                done || active ? 'bg-gray-900 border-gray-900 text-white' :
                                'bg-white border-gray-200 text-gray-300'
                            }`}>
                                {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                            </div>
                            <span className={`text-[10px] uppercase tracking-[0.15em] ${active ? 'text-gray-900' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-10 sm:w-16 h-px mx-2 mb-5 ${done ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FileUploadField({ label, value, onChange, hint, required }) {
    const inputRef = useRef();
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-900 hover:bg-gray-50 transition-colors"
            >
                {value ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium truncate max-w-[200px]">{value.name}</span>
                    </div>
                ) : (
                    <div className="text-gray-400">
                        <Upload size={24} className="mx-auto mb-1" />
                        <p className="text-sm">Klik untuk upload</p>
                        {hint && <p className="text-xs mt-1">{hint}</p>}
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onChange(e.target.files[0] || null)}
            />
        </div>
    );
}

export default function DaftarCenter() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // Step 1 — Identitas Center
    const [centerName, setCenterName] = useState('');
    const [centerNameStatus, setCenterNameStatus] = useState('idle');
    const [fullName, setFullName] = useState('');
    const [nik, setNik] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [idCardFile, setIdCardFile] = useState(null);

    // Step 2 — Kontak
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [igAccount, setIgAccount] = useState('');

    // Step 3 — Bank & Pajak (opsional)
    const [bankName, setBankName] = useState('');
    const [bankNumber, setBankNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankBranch, setBankBranch] = useState('');
    const [bankBookFile, setBankBookFile] = useState(null);
    const [taxNumber, setTaxNumber] = useState('');
    const [npwpHolderName, setNpwpHolderName] = useState('');
    const [taxDocFile, setTaxDocFile] = useState(null);

    // Step 4 — Inisiator
    const [referralCode, setReferralCode] = useState('');
    const [referralStatus, setReferralStatus] = useState('idle');
    const [referralOwner, setReferralOwner] = useState('');

    const centerNameTimer = useRef(null);
    const referralTimer = useRef(null);

    useEffect(() => {
        if (!centerName.trim()) { setCenterNameStatus('idle'); return; }
        setCenterNameStatus('checking');
        clearTimeout(centerNameTimer.current);
        centerNameTimer.current = setTimeout(async () => {
            try {
                const data = await centerApi.checkCenterName(centerName.trim());
                setCenterNameStatus(data.available ? 'available' : 'taken');
            } catch {
                setCenterNameStatus('idle');
            }
        }, 500);
        return () => clearTimeout(centerNameTimer.current);
    }, [centerName]);

    useEffect(() => {
        const code = referralCode.trim().toUpperCase();
        if (code.length < 10) { setReferralStatus('idle'); setReferralOwner(''); return; }
        setReferralStatus('checking');
        clearTimeout(referralTimer.current);
        referralTimer.current = setTimeout(async () => {
            try {
                const data = await authApi.lookupReferral(code);
                setReferralOwner(data.name);
                setReferralStatus('valid');
            } catch {
                setReferralStatus('invalid');
                setReferralOwner('');
            }
        }, 500);
        return () => clearTimeout(referralTimer.current);
    }, [referralCode]);

    const validateStep = (s) => {
        const errs = {};
        if (s === 1) {
            if (!centerName.trim()) errs.center_name = 'Nama center wajib diisi';
            else if (centerNameStatus === 'taken') errs.center_name = 'Nama center sudah digunakan';
            if (!fullName.trim()) errs.full_name = 'Nama lengkap wajib diisi';
        }
        if (s === 2) {
            if (!email.trim()) errs.email = 'Email wajib diisi';
            else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
            if (!phone.trim()) errs.phone = 'No. telepon wajib diisi';
            if (!address.trim()) errs.address = 'Alamat wajib diisi';
            if (!city.trim()) errs.city = 'Kota wajib diisi';
        }
        if (s === 4) {
            if (!referralCode.trim()) errs.referral_code = 'Kode inisiator wajib diisi';
            else if (referralStatus === 'invalid') errs.referral_code = 'Kode inisiator tidak ditemukan';
        }
        return errs;
    };

    const goNext = () => {
        const errs = validateStep(step);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setStep(s => s + 1);
    };

    const goBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        const errs = validateStep(4);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('center_name', centerName.trim());
            fd.append('full_name', fullName.trim());
            if (nik.trim()) fd.append('nik', nik.trim());
            if (birthDate) fd.append('birth_date', birthDate);
            if (idCardFile) fd.append('id_card', idCardFile);
            fd.append('email', email.trim());
            fd.append('phone', phone.trim());
            fd.append('address', address.trim());
            fd.append('city', city.trim());
            if (igAccount.trim()) fd.append('ig_account', igAccount.trim());
            if (bankName.trim()) fd.append('bank_name', bankName.trim());
            if (bankNumber.trim()) fd.append('bank_number', bankNumber.trim());
            if (bankAccountName.trim()) fd.append('bank_account_name', bankAccountName.trim());
            if (bankBranch.trim()) fd.append('bank_branch', bankBranch.trim());
            if (bankBookFile) fd.append('bank_book', bankBookFile);
            if (taxNumber.trim()) fd.append('tax_number', taxNumber.trim());
            if (npwpHolderName.trim()) fd.append('npwp_holder_name', npwpHolderName.trim());
            if (taxDocFile) fd.append('tax_doc', taxDocFile);
            fd.append('referral_code', referralCode.trim().toUpperCase());

            await centerApi.submitApplication(fd);
            setSubmitted(true);
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(data.errors);
                const errKeys = Object.keys(data.errors);
                const step1 = ['center_name','full_name','nik','birth_date','id_card'];
                const step2 = ['email','phone','address','city','ig_account'];
                const step3 = ['bank_name','bank_number','bank_account_name','bank_branch','bank_book','tax_number','npwp_holder_name','tax_doc'];
                if (errKeys.some(k => step1.includes(k))) setStep(1);
                else if (errKeys.some(k => step2.includes(k))) setStep(2);
                else if (errKeys.some(k => step3.includes(k))) setStep(3);
            } else {
                setErrors({ _global: data?.message || 'Terjadi kesalahan. Silakan coba lagi.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (field) => `w-full h-11 px-3 bg-white border text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 transition-colors rounded-md ${
        errors[field] ? 'border-red-300 focus:ring-red-400 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:ring-gray-900 focus:border-gray-900'
    }`;

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white border border-gray-200 rounded-lg p-10 max-w-md w-full text-center">
                    <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={20} className="text-emerald-700" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Submitted</p>
                    <h2 className="text-xl font-medium text-gray-900 tracking-tight mb-3">Pendaftaran Terkirim</h2>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Terima kasih telah mendaftar sebagai mitra Starcenter. Tim kami akan meninjau
                        pendaftaran Anda dalam <strong className="text-gray-900">1–3 hari kerja</strong> dan menghubungi via email.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full h-11 btn-primary text-xs uppercase tracking-[0.25em] rounded-md"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 border border-gray-200 rounded-full mb-4">
                        <Building2 size={18} className="text-gray-700" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Partner Application</p>
                    <h1 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">Daftar sebagai Starcenter</h1>
                    <p className="text-sm text-gray-500 mt-2">Isi data center untuk bergabung sebagai mitra.</p>
                </div>

                <StepIndicator current={step} />

                <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                    {errors._global && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {errors._global}
                        </div>
                    )}

                    {/* Step 1: Identitas */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-sm font-medium text-gray-900 tracking-tight flex items-center gap-2">
                                <User size={14} className="text-gray-400" /> Identitas Center
                            </h2>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Nama Pendaftaran Center <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={centerName}
                                        onChange={(e) => setCenterName(e.target.value)}
                                        placeholder="Contoh: Starinc Official Surabaya"
                                        className={inputCls('center_name')}
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                        {centerNameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-gray-400" />}
                                        {centerNameStatus === 'available' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                        {centerNameStatus === 'taken' && <XCircle size={16} className="text-red-500" />}
                                    </div>
                                </div>
                                {centerNameStatus === 'available' && <p className="text-xs text-emerald-600 mt-1">Nama tersedia</p>}
                                {centerNameStatus === 'taken' && <p className="text-xs text-red-500 mt-1">Nama sudah digunakan</p>}
                                {errors.center_name && <p className="text-xs text-red-500 mt-1">{errors.center_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Sesuai KTP"
                                    className={inputCls('full_name')}
                                />
                                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        NIK <span className="text-gray-400 font-normal">(opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nik}
                                        onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                        placeholder="16 digit"
                                        maxLength={16}
                                        className={`${inputCls('nik')} font-mono tracking-wider`}
                                    />
                                    {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Tanggal Lahir <span className="text-gray-400 font-normal">(opsional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className={inputCls('birth_date')}
                                    />
                                    {errors.birth_date && <p className="text-xs text-red-500 mt-1">{errors.birth_date}</p>}
                                </div>
                            </div>

                            <FileUploadField
                                label="Foto KTP (opsional)"
                                value={idCardFile}
                                onChange={setIdCardFile}
                                hint="JPG/PNG, maks 5MB — bisa diupload nanti dari profil"
                            />
                            {errors.id_card && <p className="text-xs text-red-500 mt-1">{errors.id_card}</p>}
                        </div>
                    )}

                    {/* Step 2: Kontak */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-sm font-medium text-gray-900 tracking-tight flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" /> Kontak & Alamat
                            </h2>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com"
                                    className={inputCls('email')}
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    No. Telepon / WhatsApp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className={inputCls('phone')}
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Akan dijadikan password default akun Anda.</p>
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Jl. ..."
                                    rows={3}
                                    className={`${inputCls('address')} h-auto py-2.5`}
                                />
                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Kota <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <MapPin size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Surabaya"
                                        className={`${inputCls('city')} pl-9`}
                                    />
                                </div>
                                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Akun Instagram <span className="text-gray-400 font-normal">(opsional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Instagram size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={igAccount}
                                        onChange={(e) => setIgAccount(e.target.value)}
                                        placeholder="@username"
                                        className={`${inputCls('ig_account')} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank & Pajak (opsional) */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-sm font-medium text-gray-900 tracking-tight flex items-center gap-2">
                                <Landmark size={14} className="text-gray-400" /> Rekening Bank & NPWP
                            </h2>

                            <p className="text-xs text-gray-500 leading-relaxed -mt-2">
                                Semua field di bawah <strong>opsional</strong> — bisa dilengkapi nanti dari halaman profil Anda.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Bank</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="BCA, BNI, Mandiri…"
                                        className={inputCls('bank_name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Cabang</label>
                                    <input
                                        type="text"
                                        value={bankBranch}
                                        onChange={(e) => setBankBranch(e.target.value)}
                                        placeholder="KCP …"
                                        className={inputCls('bank_branch')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nomor Rekening</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <CreditCard size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={bankNumber}
                                        onChange={(e) => setBankNumber(e.target.value)}
                                        placeholder="Nomor rekening"
                                        className={`${inputCls('bank_number')} pl-9`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pemilik Rekening</label>
                                <input
                                    type="text"
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="Sesuai buku tabungan"
                                    className={inputCls('bank_account_name')}
                                />
                            </div>

                            <FileUploadField
                                label="Foto Buku Tabungan"
                                value={bankBookFile}
                                onChange={setBankBookFile}
                                hint="Halaman depan dengan nama & nomor rekening"
                            />

                            <div className="border-t pt-4 space-y-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">NPWP</p>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">No. NPWP</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <FileText size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={taxNumber}
                                            onChange={(e) => setTaxNumber(e.target.value)}
                                            placeholder="00.000.000.0-000.000"
                                            className={`${inputCls('tax_number')} pl-9`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Pemilik NPWP</label>
                                    <input
                                        type="text"
                                        value={npwpHolderName}
                                        onChange={(e) => setNpwpHolderName(e.target.value)}
                                        placeholder="Nama sesuai NPWP"
                                        className={inputCls('npwp_holder_name')}
                                    />
                                </div>

                                <FileUploadField
                                    label="Foto NPWP"
                                    value={taxDocFile}
                                    onChange={setTaxDocFile}
                                    hint="JPG/PNG, maks 5MB"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Inisiator */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-sm font-medium text-gray-900 tracking-tight flex items-center gap-2">
                                <Users size={14} className="text-gray-400" /> Kode Inisiator (Upline)
                            </h2>

                            <p className="text-sm text-gray-500">
                                Masukkan <strong>Kode ID Center</strong> dari Starcenter yang mengajak Anda bergabung
                                (format: <span className="font-mono">SC230200001</span>).
                            </p>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Kode Inisiator <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        placeholder="SC230200001"
                                        maxLength={20}
                                        className={`${inputCls('referral_code')} pr-10 font-mono tracking-widest`}
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                        {referralStatus === 'checking' && <Loader2 size={16} className="animate-spin text-gray-400" />}
                                        {referralStatus === 'valid' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                        {referralStatus === 'invalid' && <XCircle size={16} className="text-red-500" />}
                                    </div>
                                </div>
                                {referralStatus === 'valid' && (
                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Inisiator: <strong>{referralOwner}</strong>
                                    </p>
                                )}
                                {referralStatus === 'invalid' && (
                                    <p className="text-xs text-red-500 mt-1">Kode inisiator tidak ditemukan</p>
                                )}
                                {errors.referral_code && <p className="text-xs text-red-500 mt-1">{errors.referral_code}</p>}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-md p-5 space-y-2 text-sm">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Ringkasan</p>
                                <div className="flex justify-between"><span className="text-gray-500">Nama Center</span><span className="text-gray-900">{centerName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Nama Lengkap</span><span className="text-gray-900">{fullName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{email}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">No. HP</span><span className="text-gray-900 tabular-nums">{phone}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Kota</span><span className="text-gray-900">{city}</span></div>
                            </div>

                            <div className="bg-amber-50/50 border border-amber-200 rounded-md p-4 text-xs text-amber-800 leading-relaxed">
                                Setelah disetujui admin, akun Anda akan dibuat dengan password = <strong>No. HP Anda</strong>.
                                Mohon ganti password setelah login pertama.
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className="inline-flex items-center gap-1.5 h-11 px-5 rounded-md border border-gray-200 hover:border-gray-400 text-gray-700 text-xs uppercase tracking-[0.25em] transition-colors"
                            >
                                <ChevronLeft size={14} /> Sebelumnya
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={step === 1 && centerNameStatus === 'checking'}
                                className="inline-flex items-center gap-1.5 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-50"
                            >
                                Lanjut <ChevronRight size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || referralStatus !== 'valid'}
                                className="inline-flex items-center gap-1.5 h-11 px-6 btn-primary text-xs uppercase tracking-[0.25em] rounded-md disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 size={12} className="animate-spin" /> Mengirim…</>
                                ) : (
                                    <><CheckCircle2 size={12} /> Kirim Pendaftaran</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Sudah punya akun?{' '}
                    <button onClick={() => navigate('/login')} className="text-gray-900 hover:underline">
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    );
}
