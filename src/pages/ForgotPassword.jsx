import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            setSubmitted(true);
            Swal.fire({ icon: 'success', title: 'Email Terkirim', text: 'Periksa email Anda untuk link reset password', timer: 2000, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Account Recovery</p>
                    <h1 className="text-3xl font-medium text-gray-900 tracking-tight mb-2">Reset Password</h1>
                    <p className="text-sm text-gray-500">
                        Masukkan email untuk menerima link reset password
                    </p>
                </div>

                <div className="bg-white border border-gray-200 p-7">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="kamu@email.com"
                                        className="w-full h-11 pl-9 pr-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                            >
                                {loading ? 'Mengirim…' : 'Kirim Link Reset'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-5">
                                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-gray-900" />
                                </div>
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-2">Email Terkirim</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Periksa email Anda untuk tautan reset password. Link berlaku 1 jam.
                            </p>
                            <p className="text-xs text-gray-500">
                                Dikirim ke: <span className="font-medium text-gray-900">{email}</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={12} />
                        Kembali ke Login
                    </button>
                </div>
            </div>
        </div>
    );
}
