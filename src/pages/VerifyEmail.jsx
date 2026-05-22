import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const error = searchParams.get('error'); // 'expired' | 'invalid'

    const [resendLoading, setResendLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState(null); // null | 'sent' | 'error'
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleResend = async () => {
        if (!email || resendLoading || countdown > 0) return;
        setResendLoading(true);
        setResendStatus(null);
        try {
            await authApi.resendVerification(email);
            setResendStatus('sent');
            setCountdown(60);
        } catch {
            setResendStatus('error');
        } finally {
            setResendLoading(false);
        }
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 mx-auto mb-5 border border-gray-200 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-900" />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Verification</p>
                        <h1 className="text-2xl font-medium text-gray-900 tracking-tight mb-2">
                            {error === 'expired' ? 'Link Kadaluarsa' : 'Link Tidak Valid'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {error === 'expired'
                                ? 'Link verifikasi sudah kadaluarsa (berlaku 60 menit).'
                                : 'Link verifikasi tidak valid. Pastikan kamu membuka link yang benar dari email.'}
                        </p>
                    </div>

                    {email && (
                        <div className="bg-white border border-gray-200 p-7 space-y-4 rounded-lg">
                            <p className="text-xs text-gray-500 text-center">
                                Kirim ulang ke: <span className="font-medium text-gray-900">{email}</span>
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resendLoading || countdown > 0}
                                className="w-full h-11 inline-flex items-center justify-center gap-2 btn-primary text-xs uppercase tracking-[0.25em] rounded-md"
                            >
                                <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                                {resendLoading ? 'Mengirim…' : countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang Link'}
                            </button>
                            {resendStatus === 'sent' && (
                                <p className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                                    <CheckCircle size={12} /> Link baru telah dikirim.
                                </p>
                            )}
                            {resendStatus === 'error' && (
                                <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                                    <XCircle size={12} /> Gagal mengirim. Coba lagi.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                            ← Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default state
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto mb-5 border border-gray-200 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-900" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">One More Step</p>
                    <h1 className="text-2xl font-medium text-gray-900 tracking-tight mb-2">Cek Email Anda</h1>
                    <p className="text-sm text-gray-500">Satu langkah lagi untuk aktivasi akun</p>
                </div>

                <div className="bg-white border border-gray-200 p-7 space-y-5 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500 text-center mb-3">Kami mengirimkan link verifikasi ke:</p>
                        {email && (
                            <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm font-mono text-gray-900 text-center break-all">
                                {email}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Klik link di email untuk mengaktifkan akun. Link berlaku <span className="text-gray-900 font-medium">60 menit</span>.
                    </p>

                    <div className="pt-5 border-t border-gray-100 space-y-3">
                        <p className="text-xs text-gray-500 text-center">Belum menerima email? Cek folder spam atau:</p>
                        <button
                            onClick={handleResend}
                            disabled={!email || resendLoading || countdown > 0}
                            className="w-full h-11 inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 text-xs uppercase tracking-[0.25em] rounded-md hover:bg-gray-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                            {resendLoading ? 'Mengirim…' : countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang Email'}
                        </button>

                        {resendStatus === 'sent' && (
                            <p className="text-xs text-emerald-600 flex items-center justify-center gap-1">
                                <CheckCircle size={12} /> Link baru sudah dikirim.
                            </p>
                        )}
                        {resendStatus === 'error' && (
                            <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                                <XCircle size={12} /> Gagal mengirim. Coba lagi.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
