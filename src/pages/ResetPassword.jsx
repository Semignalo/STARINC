import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token || !email) {
            setError('Link reset password tidak valid. Parameter yang diperlukan tidak ditemukan.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok');
            return;
        }
        setLoading(true);
        try {
            await authApi.resetPassword({ email, token, password, password_confirmation: confirmPassword });
            setSubmitted(true);
            Swal.fire({ icon: 'success', title: 'Password Berhasil Direset', text: 'Silakan login dengan password baru', timer: 2000, showConfirmButton: false });
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            setError(getErrorMessage(error));
            Swal.fire({ icon: 'error', title: 'Oops...', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    };

    if (error && !submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-gray-200 p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-5 border border-gray-200 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-gray-900" />
                        </div>
                        <h2 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">Link Tidak Valid</h2>
                        <p className="text-sm text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full h-11 pl-9 pr-9 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">New Password</p>
                    <h1 className="text-3xl font-medium text-gray-900 tracking-tight mb-2">Reset Password</h1>
                    <p className="text-sm text-gray-500">Masukkan password baru Anda</p>
                </div>

                <div className="bg-white border border-gray-200 p-7">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Baru</label>
                                <div className="relative">
                                    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        className={inputClass}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
                                <div className="relative">
                                    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        className={inputClass}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                            >
                                {loading ? 'Mereset…' : 'Reset Password'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-5 border border-gray-200 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-gray-900" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-2">Password Berhasil Direset</h3>
                            <p className="text-sm text-gray-600">Mengarahkan ke halaman login…</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
