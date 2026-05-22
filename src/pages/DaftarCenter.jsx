import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload, ScanLine, CheckCircle2, XCircle, Loader2,
    ChevronRight, ChevronLeft, User, Phone, Landmark, Link2,
    Building2, CreditCard, FileText, Users
} from 'lucide-react';
import { centerApi } from '../api/centerApi';
import { authApi } from '../api/authApi';

const STEPS = [
    { id: 1, label: 'Identitas', icon: User },
    { id: 2, label: 'Kontak', icon: Phone },
    { id: 3, label: 'Bank & Pajak', icon: Landmark },
    { id: 4, label: 'Referral', icon: Users },
];

const RELIGIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const MARITAL_STATUSES = ['Lajang', 'Menikah', 'Cerai'];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = current > step.id;
                const active = current === step.id;
                return (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                done ? 'bg-emerald-500 border-emerald-500 text-white' :
                                active ? 'bg-gray-900 border-primary text-white' :
                                'bg-white border-gray-300 text-gray-400'
                            }`}>
                                {done ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                            </div>
                            <span className={`text-xs font-medium ${active ? 'text-gray-900' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FileUploadField({ label, name, value, onChange, hint, required }) {
    const inputRef = useRef();
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-gray-900/5 transition-all"
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

function OcrScanButton({ onScanned, disabled }) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef();

    const handleScan = async (file) => {
        if (!file) return;
        setScanning(true);
        setError('');
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('ind');
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();
            onScanned(text);
        } catch {
            setError('Gagal membaca teks. Coba foto lebih jelas.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                disabled={disabled || scanning}
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-gray-900 text-sm font-medium hover:bg-gray-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                {scanning ? 'Memindai...' : 'Scan OCR'}
            </button>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleScan(e.target.files[0])}
            />
        </div>
    );
}

function KtpUploadWithOcr({ onFileChange, onScanned }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanDone, setScanDone] = useState(false);
    const [scanError, setScanError] = useState('');
    const [rawText, setRawText] = useState('');
    const [showRaw, setShowRaw] = useState(false);
    const inputRef = useRef();
    const prevUrlRef = useRef(null);

    const runOcr = async (f) => {
        setScanning(true);
        setScanDone(false);
        setScanError('');
        setRawText('');
        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('ind');
            const { data: { text } } = await worker.recognize(f);
            await worker.terminate();
            setRawText(text);
            onScanned(text);
            setScanDone(true);
        } catch {
            setScanError('Gagal membaca KTP. Pastikan foto jelas dan coba lagi.');
        } finally {
            setScanning(false);
        }
    };

    const handleFileChange = (f) => {
        if (!f) return;
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        const url = URL.createObjectURL(f);
        prevUrlRef.current = url;
        setFile(f);
        setPreviewUrl(url);
        setScanDone(false);
        setScanError('');
        onFileChange(f);
        runOcr(f);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto KTP <span className="text-red-500">*</span>
            </label>

            {!file ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-gray-900/5 transition-all"
                >
                    <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Klik untuk upload foto KTP</p>
                    <p className="text-xs text-gray-400 mt-1">JPG/PNG, maks 5MB — akan di-scan otomatis</p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                        src={previewUrl}
                        alt="Preview KTP"
                        className="w-full object-cover max-h-52 rounded-xl"
                    />

                    {/* Scanning overlay */}
                    {scanning && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl">
                            <div className="relative">
                                <ScanLine size={36} className="text-white/40" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={20} className="animate-spin text-white" />
                                </div>
                            </div>
                            <span className="text-white text-sm font-medium">Memindai KTP...</span>
                            <span className="text-white/60 text-xs">Mengisi data secara otomatis</span>
                        </div>
                    )}

                    {/* Success badge */}
                    {scanDone && !scanning && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <CheckCircle2 size={12} /> Data terisi otomatis
                        </div>
                    )}

                    {/* Change photo button */}
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-md hover:bg-white transition font-medium"
                    >
                        Ganti Foto
                    </button>
                </div>
            )}

            {scanError && (
                <div className="flex items-center gap-2 mt-2">
                    <XCircle size={14} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-500">{scanError}</p>
                    <button
                        type="button"
                        onClick={() => file && runOcr(file)}
                        className="text-xs text-gray-900 underline font-medium whitespace-nowrap"
                    >
                        Scan ulang
                    </button>
                </div>
            )}

            {rawText && !scanning && (
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={() => setShowRaw(v => !v)}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        {showRaw ? 'Sembunyikan' : 'Lihat'} teks OCR mentah
                    </button>
                    {showRaw && (
                        <pre className="mt-1 p-2 bg-gray-100 rounded-lg text-[10px] text-gray-600 whitespace-pre-wrap break-all max-h-40 overflow-y-auto font-mono leading-relaxed">
                            {rawText}
                        </pre>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
            />
        </div>
    );
}

function parseKtpOcr(text) {
    const norm = text.replace(/[ \t\u00A0]+/g, ' ');
    const rawLines = norm.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const fieldMap = {};
    for (const line of rawLines) {
        const ci = line.indexOf(':');
        if (ci < 1 || ci > 45) continue;
        const key = line.slice(0, ci).trim().toLowerCase();
        const val = line.slice(ci + 1).trim().split(/  +/)[0].trim();
        if (key && val && !fieldMap[key]) fieldMap[key] = val;
    }

    const fromMap = (...pats) => {
        for (const p of pats) {
            const re = new RegExp(p, 'i');
            const k = Object.keys(fieldMap).find(k => re.test(k));
            if (k) return fieldMap[k];
        }
        return '';
    };

    const fromLine = (labelRe) => {
        const re = new RegExp(labelRe + '[^:\\n]*:\\s*([^\\n]+)', 'i');
        for (const line of rawLines) {
            const m = line.match(re);
            if (m && m[1] && m[1].trim()) return m[1].trim().split(/  +/)[0].trim();
        }
        return '';
    };

    const fromNext = (labelRe) => {
        const re = new RegExp('^' + labelRe + '\\s*$', 'i');
        for (let i = 0; i < rawLines.length - 1; i++) {
            if (re.test(rawLines[i])) return rawLines[i + 1].replace(/^[:\-]\s*/, '').trim();
        }
        return '';
    };

    const find = (mapPats, lineRe) =>
        fromMap(...mapPats) || fromLine(lineRe) || fromNext(lineRe);

    const result = {};

    const nikM = norm.match(/NIK[^:\n]*:\s*([\d ]{14,20})/i);
    if (nikM) result.nik = nikM[1].replace(/\s/g, '').slice(0, 16);

    result.full_name = find(['^nama$', 'nama'], 'Nama');

    const birthRaw = find(['^tempat', 'tempat.{0,14}lahir'], 'Tempat.{0,14}Lahir');
    if (birthRaw) {
        const ci = birthRaw.indexOf(',');
        if (ci > 0) {
            result.birth_place = birthRaw.slice(0, ci).trim();
            const dm = birthRaw.slice(ci).match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (dm) result.birth_date = dm[3] + '-' + dm[2].padStart(2,'0') + '-' + dm[1].padStart(2,'0');
        } else {
            const dm = birthRaw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            if (dm) {
                result.birth_date = dm[3] + '-' + dm[2].padStart(2,'0') + '-' + dm[1].padStart(2,'0');
                result.birth_place = birthRaw.replace(dm[0], '').trim();
            } else {
                result.birth_place = birthRaw;
            }
        }
    }
    if (!result.birth_date) {
        const dm = norm.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (dm) result.birth_date = dm[3] + '-' + dm[2].padStart(2,'0') + '-' + dm[1].padStart(2,'0');
    }

    const gRaw = find(['^jenis kelamin$', 'jenis.{0,5}kelamin'], 'Jenis.{0,5}Kelamin');
    if (/laki/i.test(gRaw)) result.gender = 'L';
    else if (/perempuan/i.test(gRaw)) result.gender = 'P';

    result.religion = find(['^agama$', 'agama'], 'Agama');
    if (!result.religion) {
        const hit = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']
            .find(r => new RegExp('\\b' + r + '\\b', 'i').test(norm));
        if (hit) result.religion = hit;
    }

    result.marital_status = find(
        ['^status perkawinan$', 'status perkawinan', '^status$'],
        'Status.{0,15}Perkawinan'
    );
    result.occupation = find(['^pekerjaan$', 'pekerjaan'], 'Pekerjaan');

    return result;
}

function parseTaxOcr(text) {
    const match = text.match(/\d[\d\s.]{14,}/);
    if (match) {
        return match[0].replace(/[\s.]/g, '').slice(0, 15);
    }
    return '';
}

export default function DaftarCenter() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // Layer 1
    const [centerName, setCenterName] = useState('');
    const [centerNameStatus, setCenterNameStatus] = useState('idle'); // idle | checking | available | taken
    const [idCardFile, setIdCardFile] = useState(null);
    const [fullName, setFullName] = useState('');
    const [nik, setNik] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [gender, setGender] = useState('');
    const [religion, setReligion] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [occupation, setOccupation] = useState('');

    // Layer 2
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [shopLink, setShopLink] = useState('');

    // Layer 3
    const [bankName, setBankName] = useState('');
    const [bankNumber, setBankNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [bankBookFile, setBankBookFile] = useState(null);
    const [taxNumber, setTaxNumber] = useState('');
    const [taxDocFile, setTaxDocFile] = useState(null);

    // Layer 4
    const [referralCode, setReferralCode] = useState('');
    const [referralStatus, setReferralStatus] = useState('idle');
    const [referralOwner, setReferralOwner] = useState('');

    const centerNameTimer = useRef(null);
    const referralTimer = useRef(null);

    // Center name debounce check
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

    // Referral code debounce lookup
    useEffect(() => {
        if (referralCode.length !== 8) { setReferralStatus('idle'); setReferralOwner(''); return; }
        setReferralStatus('checking');
        clearTimeout(referralTimer.current);
        referralTimer.current = setTimeout(async () => {
            try {
                const data = await authApi.lookupReferral(referralCode.toUpperCase());
                setReferralOwner(data.name);
                setReferralStatus('valid');
            } catch {
                setReferralStatus('invalid');
                setReferralOwner('');
            }
        }, 500);
        return () => clearTimeout(referralTimer.current);
    }, [referralCode]);

    const handleKtpOcr = useCallback((text) => {
        const parsed = parseKtpOcr(text);
        if (parsed.nik) setNik(parsed.nik);
        if (parsed.full_name) setFullName(parsed.full_name);
        if (parsed.birth_date) setBirthDate(parsed.birth_date);
        if (parsed.birth_place) setBirthPlace(parsed.birth_place);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.religion) {
            const matched = RELIGIONS.find(r => parsed.religion.toLowerCase().includes(r.toLowerCase()));
            if (matched) setReligion(matched);
        }
        if (parsed.marital_status) {
            const s = parsed.marital_status.toLowerCase();
            if (s.includes('belum') || s.includes('lajang')) setMaritalStatus('Lajang');
            else if (s.includes('kawin') || s.includes('menikah')) setMaritalStatus('Menikah');
            else if (s.includes('cerai')) setMaritalStatus('Cerai');
        }
        if (parsed.occupation) setOccupation(parsed.occupation);
    }, []);

    const handleTaxOcr = useCallback((text) => {
        const num = parseTaxOcr(text);
        if (num) setTaxNumber(num);
    }, []);

    const validateStep = (s) => {
        const errs = {};
        if (s === 1) {
            if (!centerName.trim()) errs.center_name = 'Nama center wajib diisi';
            else if (centerNameStatus === 'taken') errs.center_name = 'Nama center sudah digunakan';
            if (!idCardFile) errs.id_card = 'Upload foto KTP wajib';
            if (!fullName.trim()) errs.full_name = 'Nama lengkap wajib diisi';
            if (!birthDate) errs.birth_date = 'Tanggal lahir wajib diisi';
            if (!birthPlace.trim()) errs.birth_place = 'Tempat lahir wajib diisi';
            if (!gender) errs.gender = 'Pilih jenis kelamin';
            if (!religion) errs.religion = 'Pilih agama';
            if (!maritalStatus) errs.marital_status = 'Pilih status pernikahan';
            if (!occupation.trim()) errs.occupation = 'Pekerjaan wajib diisi';
        }
        if (s === 2) {
            if (!email.trim()) errs.email = 'Email wajib diisi';
            else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
            if (!phone.trim()) errs.phone = 'No. telepon wajib diisi';
        }
        if (s === 3) {
            if (!bankName.trim()) errs.bank_name = 'Nama bank wajib diisi';
            if (!bankNumber.trim()) errs.bank_number = 'Nomor rekening wajib diisi';
            if (!bankAccountName.trim()) errs.bank_account_name = 'Nama pemilik rekening wajib diisi';
            if (!bankBookFile) errs.bank_book = 'Upload buku tabungan wajib';
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
        if (referralStatus === 'invalid') {
            setErrors({ referral_code: 'Kode referral tidak valid' });
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('center_name', centerName.trim());
            fd.append('full_name', fullName.trim());
            if (nik.trim()) fd.append('nik', nik.trim());
            fd.append('birth_date', birthDate);
            fd.append('birth_place', birthPlace.trim());
            fd.append('gender', gender);
            fd.append('religion', religion);
            fd.append('marital_status', maritalStatus);
            fd.append('occupation', occupation.trim());
            fd.append('id_card', idCardFile);
            fd.append('email', email.trim());
            fd.append('phone', phone.trim());
            if (shopLink.trim()) fd.append('shop_link', shopLink.trim());
            fd.append('bank_name', bankName.trim());
            fd.append('bank_number', bankNumber.trim());
            fd.append('bank_account_name', bankAccountName.trim());
            fd.append('bank_book', bankBookFile);
            if (taxNumber.trim()) fd.append('tax_number', taxNumber.trim());
            if (taxDocFile) fd.append('tax_doc', taxDocFile);
            if (referralCode.trim()) fd.append('referral_code', referralCode.toUpperCase());

            await centerApi.submitApplication(fd);
            setSubmitted(true);
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setErrors(data.errors);
                // Jump back to step with first error
                const errKeys = Object.keys(data.errors);
                const step1Keys = ['center_name','full_name','birth_date','birth_place','gender','religion','marital_status','occupation','id_card'];
                const step2Keys = ['email','phone','shop_link'];
                const step3Keys = ['bank_name','bank_number','bank_account_name','bank_book','tax_number','tax_doc'];
                if (errKeys.some(k => step1Keys.includes(k))) setStep(1);
                else if (errKeys.some(k => step2Keys.includes(k))) setStep(2);
                else if (errKeys.some(k => step3Keys.includes(k))) setStep(3);
            } else {
                setErrors({ _global: data?.message || 'Terjadi kesalahan. Silakan coba lagi.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (field) => `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition ${
        errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

    if (submitted) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <div className="bg-white  shadow-lg p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Terkirim!</h2>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                        Terima kasih telah mendaftar sebagai mitra Starcenter. Tim kami akan meninjau
                        pendaftaran Anda dalam <strong>1–3 hari kerja</strong> dan menghubungi via email.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-900/90 transition"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900/10  mb-3">
                        <Building2 size={28} className="text-gray-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Daftar sebagai Starcenter</h1>
                    <p className="text-gray-500 text-sm mt-1">Isi data lengkap untuk bergabung sebagai mitra</p>
                </div>

                <StepIndicator current={step} />

                <div className="bg-white  shadow-sm border border-gray-100 p-6 sm:p-8">
                    {errors._global && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {errors._global}
                        </div>
                    )}

                    {/* ── Step 1: Identitas ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <User size={20} className="text-gray-900" /> Identitas Diri
                            </h2>

                            {/* Center Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Center <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={centerName}
                                        onChange={(e) => setCenterName(e.target.value)}
                                        placeholder="Contoh: Starcenter Surabaya Timur"
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

                            {/* KTP Upload + Auto OCR */}
                            <div>
                                <KtpUploadWithOcr
                                    onFileChange={setIdCardFile}
                                    onScanned={handleKtpOcr}
                                />
                                {errors.id_card && <p className="text-xs text-red-500 mt-1">{errors.id_card}</p>}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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

                            {/* NIK */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIK (16 digit)
                                </label>
                                <input
                                    type="text"
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    placeholder="Nomor Induk Kependudukan"
                                    maxLength={16}
                                    className={`${inputCls('nik')} font-mono tracking-wider`}
                                />
                                {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
                            </div>

                            {/* Birth Place & Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tempat Lahir <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={birthPlace}
                                        onChange={(e) => setBirthPlace(e.target.value)}
                                        placeholder="Kota"
                                        className={inputCls('birth_place')}
                                    />
                                    {errors.birth_place && <p className="text-xs text-red-500 mt-1">{errors.birth_place}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Lahir <span className="text-red-500">*</span>
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

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    {[{ v: 'L', l: 'Laki-laki' }, { v: 'P', l: 'Perempuan' }].map(({ v, l }) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setGender(v)}
                                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                                gender === v ? 'border-primary bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-primary/50'
                                            }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                            </div>

                            {/* Religion */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agama <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={religion}
                                    onChange={(e) => setReligion(e.target.value)}
                                    className={inputCls('religion')}
                                >
                                    <option value="">Pilih agama</option>
                                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {errors.religion && <p className="text-xs text-red-500 mt-1">{errors.religion}</p>}
                            </div>

                            {/* Marital Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Pernikahan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={maritalStatus}
                                    onChange={(e) => setMaritalStatus(e.target.value)}
                                    className={inputCls('marital_status')}
                                >
                                    <option value="">Pilih status</option>
                                    {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.marital_status && <p className="text-xs text-red-500 mt-1">{errors.marital_status}</p>}
                            </div>

                            {/* Occupation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pekerjaan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={occupation}
                                    onChange={(e) => setOccupation(e.target.value)}
                                    placeholder="Pekerjaan utama"
                                    className={inputCls('occupation')}
                                />
                                {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Kontak ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Phone size={20} className="text-gray-900" /> Informasi Kontak
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    No. Telepon / WhatsApp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className={inputCls('phone')}
                                />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link Online Shop
                                    <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Link2 size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={shopLink}
                                        onChange={(e) => setShopLink(e.target.value)}
                                        placeholder="https://tokopedia.com/toko-saya"
                                        className={`${inputCls('shop_link')} pl-9`}
                                    />
                                </div>
                                {errors.shop_link && <p className="text-xs text-red-500 mt-1">{errors.shop_link}</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Bank & Pajak ── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Landmark size={20} className="text-gray-900" /> Rekening Bank & Pajak
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Bank <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="Contoh: BCA, BNI, Mandiri"
                                    className={inputCls('bank_name')}
                                />
                                {errors.bank_name && <p className="text-xs text-red-500 mt-1">{errors.bank_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Rekening <span className="text-red-500">*</span>
                                </label>
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
                                {errors.bank_number && <p className="text-xs text-red-500 mt-1">{errors.bank_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Pemilik Rekening <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    placeholder="Sesuai buku tabungan"
                                    className={inputCls('bank_account_name')}
                                />
                                {errors.bank_account_name && <p className="text-xs text-red-500 mt-1">{errors.bank_account_name}</p>}
                            </div>

                            {/* Bank Book Upload */}
                            <div>
                                <FileUploadField
                                    label="Foto Buku Tabungan"
                                    name="bank_book"
                                    value={bankBookFile}
                                    onChange={setBankBookFile}
                                    hint="Halaman depan yang menampilkan nama & nomor rekening"
                                    required
                                />
                                {errors.bank_book && <p className="text-xs text-red-500 mt-1">{errors.bank_book}</p>}
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
                                    NPWP (Opsional)
                                </p>

                                {/* Tax Doc Upload + OCR */}
                                <div className="space-y-2 mb-4">
                                    <FileUploadField
                                        label="Foto NPWP"
                                        name="tax_doc"
                                        value={taxDocFile}
                                        onChange={setTaxDocFile}
                                        hint="JPG/PNG, maks 5MB"
                                    />
                                    <div className="flex items-center gap-2">
                                        <OcrScanButton onScanned={handleTaxOcr} disabled={!taxDocFile} />
                                        <span className="text-xs text-gray-400">
                                            {taxDocFile ? 'Scan untuk isi nomor pajak otomatis' : 'Upload NPWP terlebih dahulu'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor NPWP
                                        <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <FileText size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={taxNumber}
                                            onChange={(e) => setTaxNumber(e.target.value)}
                                            placeholder="15 digit nomor NPWP"
                                            maxLength={15}
                                            className={`${inputCls('tax_number')} pl-9`}
                                        />
                                    </div>
                                    {errors.tax_number && <p className="text-xs text-red-500 mt-1">{errors.tax_number}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Referral ── */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-gray-900" /> Kode Referral Inisiator
                            </h2>

                            <p className="text-sm text-gray-500">
                                Masukkan kode referral dari Starcenter yang mengajak Anda bergabung.
                                Jika tidak ada, kosongkan saja.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kode Referral
                                    <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        placeholder="8 karakter"
                                        maxLength={8}
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
                                    <p className="text-xs text-red-500 mt-1">Kode referral tidak ditemukan</p>
                                )}
                                {errors.referral_code && <p className="text-xs text-red-500 mt-1">{errors.referral_code}</p>}
                            </div>

                            {/* Summary box */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <p className="font-semibold text-gray-700 mb-2">Ringkasan Pendaftaran</p>
                                <div className="flex justify-between"><span className="text-gray-500">Nama Center</span><span className="font-medium">{centerName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Nama Lengkap</span><span className="font-medium">{fullName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{email}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">No. HP</span><span className="font-medium">{phone}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium">{bankName} · {bankNumber}</span></div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
                                Dengan mengirim formulir ini, Anda menyetujui bahwa data yang diberikan
                                adalah benar dan dapat dipertanggungjawabkan. Tim kami akan menghubungi
                                Anda dalam 1–3 hari kerja.
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                            >
                                <ChevronLeft size={16} /> Sebelumnya
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={step === 1 && centerNameStatus === 'checking'}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-900/90 transition disabled:opacity-50"
                            >
                                Lanjut <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || referralStatus === 'invalid'}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-900/90 transition disabled:opacity-50"
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                                ) : (
                                    <><CheckCircle2 size={16} /> Kirim Pendaftaran</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Sudah punya akun?{' '}
                    <button onClick={() => navigate('/login')} className="text-gray-900 hover:underline font-medium">
                        Masuk di sini
                    </button>
                </p>
            </div>
        </div>
    );
}
