import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AtSign, Lock, User, LogIn, UserPlus, Eye, EyeOff, CheckCircle, XCircle, Phone, MapPin, Building2, Hash, Tag } from 'lucide-react';
import Swal from 'sweetalert2';
import { getErrorMessage } from '../api/client';
import { authApi } from '../api/authApi';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/login';

function getPasswordStrength(pwd, tx) {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: tx.weak,      color: 'bg-red-400',    width: '25%',  textColor: 'text-red-600' };
    if (score === 2) return { label: tx.fair,      color: 'bg-yellow-400', width: '50%',  textColor: 'text-yellow-600' };
    if (score === 3) return { label: tx.strong,    color: 'bg-blue-400',   width: '75%',  textColor: 'text-blue-600' };
    return            { label: tx.veryStrong,      color: 'bg-green-500',  width: '100%', textColor: 'text-green-600' };
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { lang } = useLanguage();
    const tx = t[lang];

    const from = location.state?.from?.pathname || "/";
    const searchParams = new URLSearchParams(location.search);
    const verifiedParam = searchParams.get('verified');
    const refCodeParam = searchParams.get('ref') || '';

    // Initialize isLogin based on URL parameter — MUST be before useMemo
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'register' ? false : true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [referralCode, setReferralCode] = useState(refCodeParam);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const [referralStatus, setReferralStatus] = useState(null); // null | 'loading' | 'valid' | 'invalid'
    const [referralOwner, setReferralOwner] = useState('');
    const debounceRef = useRef(null);

    // Show success toast if redirected after email verification
    useEffect(() => {
        if (verifiedParam === '1') {
            Swal.fire({
                icon: 'success',
                title: tx.verifiedTitle,
                text: tx.verifiedText,
                timer: 3000,
                showConfirmButton: false,
            });
        } else if (verifiedParam === 'already') {
            Swal.fire({
                icon: 'info',
                title: tx.alreadyVerifiedTitle,
                text: tx.alreadyVerifiedText,
                timer: 2500,
                showConfirmButton: false,
            });
        }
    }, [verifiedParam]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (referralCode.length !== 8) {
            setReferralStatus(null);
            setReferralOwner('');
            return;
        }
        setReferralStatus('loading');
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await authApi.lookupReferral(referralCode);
                setReferralOwner(data.name);
                setReferralStatus('valid');
            } catch {
                setReferralOwner('');
                setReferralStatus('invalid');
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [referralCode]);

    const passwordStrength = useMemo(() => !isLogin ? getPasswordStrength(password, tx) : null, [password, isLogin, tx]);
    const emailError = emailTouched && email && !isValidEmail(email) ? tx.emailError : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                Swal.fire({
                    icon: 'success',
                    title: tx.loginSuccessTitle,
                    text: tx.loginSuccessText,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                const result = await signup({
                    name,
                    email,
                    password,
                    phone: phone || null,
                    referral_code: referralCode || null,
                    address: address || null,
                    city: city || null,
                    postal_code: postalCode || null,
                });
                navigate(`/verify-email?email=${encodeURIComponent(result.email)}`, { replace: true });
                return;
            }
            navigate(from, { replace: true });
        } catch (error) {
            console.error(error);
            // Redirect to verify-email page if email is unverified
            if (error.response?.data?.email_unverified) {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
                return;
            }
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: getErrorMessage(error)
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (extra = '') => `w-full h-11 px-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors ${extra}`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Heading */}
                <div className="text-center mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </p>
                    <h1 className="text-3xl font-medium text-gray-900 tracking-tight mb-2">
                        {isLogin ? tx.loginTitle : tx.registerTitle}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isLogin ? tx.loginSubtitle : tx.registerSubtitle}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-gray-200 p-7">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                {/* Nama Lengkap */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.fullName}</label>
                                    <div className="relative">
                                        <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className={inputClass('pl-9')}
                                            placeholder={tx.namePlaceholder}
                                        />
                                    </div>
                                </div>

                                {/* No. HP */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        {tx.phone} <span className="text-gray-400 font-normal">{tx.phoneOptional}</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={inputClass('pl-9')}
                                            placeholder={tx.phonePlaceholder}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.email}</label>
                            <div className="relative">
                                <AtSign className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${emailError ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => setEmailTouched(true)}
                                    required
                                    className={`w-full h-11 pl-9 pr-9 bg-white border text-sm placeholder:text-gray-400 outline-none transition-colors ${
                                        emailError
                                            ? 'border-red-300 focus:ring-1 focus:ring-red-400 focus:border-red-400'
                                            : 'border-gray-200 focus:ring-1 focus:ring-gray-900 focus:border-gray-900'
                                    }`}
                                    placeholder={tx.emailPlaceholder}
                                />
                                {emailTouched && email && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {isValidEmail(email)
                                            ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            : <XCircle className="h-4 w-4 text-red-400" />}
                                    </div>
                                )}
                            </div>
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.password}</label>
                            <div className="relative">
                                <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    className={inputClass('pl-9 pr-9')}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition"
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {!isLogin && password && passwordStrength && (
                                <div className="mt-2">
                                    <div className="h-px w-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full bg-gray-900 transition-all duration-300"
                                            style={{ width: passwordStrength.width }}
                                        />
                                    </div>
                                    <p className="text-[11px] mt-1.5 text-gray-500">
                                        {tx.passwordStrength} <span className="text-gray-900 font-medium">{passwordStrength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <>
                                {/* Alamat */}
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                                        {tx.addressSection} <span className="text-gray-400 font-normal normal-case">{tx.addressOptional}</span>
                                    </p>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.addressFull}</label>
                                            <div className="relative">
                                                <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className={inputClass('pl-9')}
                                                    placeholder={tx.addressPlaceholder}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.city}</label>
                                                <div className="relative">
                                                    <Building2 className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        className={inputClass('pl-9')}
                                                        placeholder={tx.cityPlaceholder}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">{tx.postalCode}</label>
                                                <div className="relative">
                                                    <Hash className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={postalCode}
                                                        onChange={(e) => setPostalCode(e.target.value)}
                                                        maxLength={10}
                                                        className={inputClass('pl-9')}
                                                        placeholder={tx.postalPlaceholder}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Referral */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        {tx.referral} <span className="text-gray-400 font-normal">{tx.referralOptional}</span>
                                    </label>
                                    <div className="relative">
                                        <Tag className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                            className={inputClass('pl-9 uppercase tracking-widest font-mono')}
                                            placeholder={tx.referralPlaceholder}
                                            maxLength={8}
                                        />
                                    </div>
                                    {referralStatus === 'loading' && (
                                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 border border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                            {tx.referralChecking}
                                        </p>
                                    )}
                                    {referralStatus === 'valid' && (
                                        <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {tx.referralValid} <span className="font-semibold text-gray-900">{referralOwner}</span>
                                        </p>
                                    )}
                                    {referralStatus === 'invalid' && (
                                        <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                                            <XCircle className="w-3 h-3" />
                                            {tx.referralInvalid}
                                        </p>
                                    )}
                                    {!referralStatus && (
                                        <p className="text-[11px] text-gray-400 mt-1.5">{tx.referralHint}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 h-11 btn-primary text-xs uppercase tracking-[0.2em]"
                        >
                            {loading ? (
                                <span>{tx.processing}</span>
                            ) : isLogin ? (
                                <><LogIn size={14} /> {tx.loginBtn}</>
                            ) : (
                                <><UserPlus size={14} /> {tx.registerBtn}</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Toggle + Forgot Password */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    {isLogin ? tx.noAccount : tx.hasAccount}{' '}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                    >
                        {isLogin ? tx.registerHere : tx.loginHere}
                    </button>
                </div>

                {isLogin && (
                    <div className="mt-2 text-center text-xs">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {tx.forgotPassword}
                        </button>
                    </div>
                )}

                {!isLogin && (
                    <div className="mt-5 p-4 bg-white border border-gray-200 text-center text-xs text-gray-600">
                        {tx.partnerCta}{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/daftar-center')}
                            className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                        >
                            {tx.registerCenter}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
