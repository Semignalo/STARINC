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
            Swal.fire({
                icon: 'success',
                title: 'Email Terkirim',
                text: 'Silakan periksa email Anda untuk link reset password',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: getErrorMessage(error)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-primary text-white p-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
                    <p className="text-emerald-100/80 text-sm">
                        Masukkan email Anda untuk menerima link reset password
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 w-full rounded-xl border-neutral-300 bg-neutral-50 p-3 text-base focus:ring-primary focus:border-primary border transition"
                                        autoComplete="email"
                                        placeholder="kamu@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white p-3 rounded-xl font-medium transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Mengirim...</span>
                                ) : (
                                    'Kirim Link Reset'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Email Terkirim!</h3>
                            <p className="text-sm text-neutral-600 mb-4">
                                Silakan periksa email Anda untuk tautan reset password. Link berlaku selama 1 jam.
                            </p>
                            <p className="text-xs text-neutral-500 mb-4">
                                Email dikirim ke: <span className="font-medium">{email}</span>
                            </p>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
                        >
                            <ArrowLeft size={18} />
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
