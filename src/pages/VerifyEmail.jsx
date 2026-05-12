import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email') || '';
    const error = searchParams.get('error'); // 'expired' | 'invalid'

    const [resendLoading, setResendLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState(null); // null | 'sent' | 'error'
    const [countdown, setCountdown] = useState(0);

    // Countdown timer after resend
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

    // Error state (link expired or invalid)
    if (error) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="bg-amber-500 text-white p-8 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-90" />
                        <h2 className="text-2xl font-bold">
                            {error === 'expired' ? 'Link Kadaluarsa' : 'Link Tidak Valid'}
                        </h2>
                    </div>
                    <div className="p-8 text-center space-y-4">
                        <p className="text-neutral-600">
                            {error === 'expired'
                                ? 'Link verifikasi sudah kadaluarsa (berlaku 60 menit). Minta link baru di bawah.'
                                : 'Link verifikasi tidak valid. Pastikan kamu membuka link yang benar dari email.'}
                        </p>

                        {email && (
                            <div className="space-y-3 pt-2">
                                <p className="text-sm text-neutral-500">Kirim ulang ke: <strong>{email}</strong></p>
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                                    {resendLoading ? 'Mengirim...' : countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang Link'}
                                </button>
                                {resendStatus === 'sent' && (
                                    <p className="text-sm text-emerald-600 flex items-center justify-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> Link baru telah dikirim ke email Anda.
                                    </p>
                                )}
                                {resendStatus === 'error' && (
                                    <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                                        <XCircle className="w-4 h-4" /> Gagal mengirim. Coba lagi.
                                    </p>
                                )}
                            </div>
                        )}

                        <Link to="/login" className="block text-sm text-neutral-500 hover:text-neutral-700 mt-4">
                            ← Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default state: show "check your email" screen
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-emerald-600 text-white p-8 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-90" />
                    <h2 className="text-2xl font-bold">Cek Email Anda</h2>
                    <p className="text-emerald-100/80 text-sm mt-1">Satu langkah lagi untuk aktivasi akun</p>
                </div>

                <div className="p-8 text-center space-y-5">
                    <p className="text-neutral-600">
                        Kami mengirimkan link verifikasi ke:
                    </p>
                    {email && (
                        <div className="bg-neutral-100 rounded-lg px-4 py-3 font-medium text-neutral-800 text-sm break-all">
                            {email}
                        </div>
                    )}
                    <p className="text-sm text-neutral-500">
                        Klik link di email untuk mengaktifkan akun Anda. Link berlaku selama <strong>60 menit</strong>.
                    </p>

                    <div className="border-t border-neutral-100 pt-5 space-y-3">
                        <p className="text-sm text-neutral-500">Belum menerima email? Cek folder spam atau:</p>
                        <button
                            onClick={handleResend}
                            disabled={!email || resendLoading || countdown > 0}
                            className="w-full flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 py-3 px-4 rounded-xl font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                            {resendLoading ? 'Mengirim...' : countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang Email'}
                        </button>

                        {resendStatus === 'sent' && (
                            <p className="text-sm text-emerald-600 flex items-center justify-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Link baru sudah dikirim.
                            </p>
                        )}
                        {resendStatus === 'error' && (
                            <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                                <XCircle className="w-4 h-4" /> Gagal mengirim. Coba lagi.
                            </p>
                        )}
                    </div>

                    <Link to="/login" className="block text-sm text-neutral-500 hover:text-neutral-700">
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
