import React, { useState } from 'react';
import { Network, Crown, TrendingUp, ShieldCheck, ChevronRight, CheckCircle2, UserPlus, Coins, ShoppingBag, Check, X, Star, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function JoinStarcenter() {
    const [searchParams] = useSearchParams();
    const [refCode, setRefCode] = useState(searchParams.get('ref') || '');
    const navigate = useNavigate();

    const handleJoinClick = (e) => {
        e.preventDefault();
        const url = refCode ? `/login?ref=${refCode}&mode=register` : '/login?mode=register';
        navigate(url);
    };

    const benefits = [
        {
            icon: <Crown className="text-yellow-500" size={28} />,
            title: "Diskon Grosir Permanen",
            desc: "Margin profit maksimal dengan status Diamond permanen. Bebas belanja kebutuhan stok mingguan dengan potongan harga terbesar."
        },
        {
            icon: <Network className="text-blue-500" size={28} />,
            title: "Komisi 7 Level",
            desc: "Terima komisi dari seluruh downline hingga generasi ke-7, otomatis tercatat di dashboard kamu setiap transaksi."
        },
        {
            icon: <ShieldCheck className="text-emerald-500" size={28} />,
            title: "Sistem Anti-Downgrade",
            desc: "Ranking Starcenter kamu kebal terhadap pinalti tutup poin bulanan. Fokus memperluas jaringan bisnis tanpa khawatir."
        },
        {
            icon: <TrendingUp className="text-purple-500" size={28} />,
            title: "Passive Income Otomatis",
            desc: "Komisi dibagi otomatis real-time setiap kali anggota jaringan kamu checkout. Tanpa kerja ekstra."
        }
    ];

    const comparisonRows = [
        { feature: 'Diskon Harga Produk', regular: 'Tier-based (0–15%)', starcenter: 'Grosir Maksimal' },
        { feature: 'Komisi Referral', regular: '1 Level saja', starcenter: 'Hingga 7 Level' },
        { feature: 'Proteksi Downgrade', regular: false, starcenter: true },
        { feature: 'Dashboard Jaringan', regular: false, starcenter: true },
        { feature: 'Akses Network Tree', regular: false, starcenter: true },
        { feature: 'Target Penjualan Bulanan', regular: false, starcenter: false },
        { feature: 'Minimum Order (MOQ)', regular: false, starcenter: 'Rp 5.000.000 / order' },
    ];

    const commissionLevels = [
        { level: 'Level 1 (Direct)', rate: '10%', opacity: 'opacity-100' },
        { level: 'Level 2 (Cucu)', rate: '5%', opacity: 'opacity-90' },
        { level: 'Level 3', rate: '2%', opacity: 'opacity-80' },
        { level: 'Level 4', rate: '1%', opacity: 'opacity-70' },
        { level: 'Level 5', rate: '0.75%', opacity: 'opacity-60' },
        { level: 'Level 6', rate: '0.5%', opacity: 'opacity-50' },
        { level: 'Level 7', rate: '0.25%', opacity: 'opacity-40' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 pb-24 font-sans">

            {/* Hero Section */}
            <div className="relative bg-[#111827] text-white pt-28 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[150%] bg-gradient-to-l from-blue-900/40 to-transparent blur-3xl transform rotate-12" />
                    <div className="absolute top-[60%] -left-[10%] w-[50%] h-[100%] bg-gradient-to-tr from-purple-900/40 to-transparent blur-3xl rounded-full" />
                </div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col items-center text-center gap-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-300 text-sm font-semibold uppercase tracking-widest">
                            <Star size={14} /> Peluang Kemitraan Eksklusif
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight max-w-3xl">
                            Jadilah Mitra{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                Starcenter
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed">
                            Buka penghasilan pasif yang eksponensial lewat sistem afiliasi multi-level kami.
                            Tidak ada penalti, tidak ada target mengikat — murni profit dari jaringan di tangan kamu.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <a
                                href="#join-form"
                                className="min-h-[48px] px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 text-white font-bold text-base shadow-lg shadow-blue-900/40 transition flex items-center gap-2"
                            >
                                <UserPlus size={20} /> Daftar Jadi Mitra
                            </a>
                            <a
                                href="#comparison"
                                className="min-h-[48px] px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 text-white font-semibold text-base backdrop-blur-sm transition flex items-center gap-2 border border-white/10"
                            >
                                Lihat Perbandingan <ArrowRight size={18} />
                            </a>
                        </div>

                        {/* Quick stats row */}
                        <div className="grid grid-cols-3 gap-6 pt-4 w-full max-w-lg">
                            <div className="text-center">
                                <div className="text-3xl font-extrabold text-white">7</div>
                                <div className="text-xs text-gray-400 mt-1">Level Komisi</div>
                            </div>
                            <div className="text-center border-x border-white/10">
                                <div className="text-3xl font-extrabold text-emerald-400">10%</div>
                                <div className="text-xs text-gray-400 mt-1">Komisi Level 1</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-extrabold text-white">0</div>
                                <div className="text-xs text-gray-400 mt-1">Penalti Bulanan</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="container mx-auto max-w-5xl px-4 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Keunggulan Ekosistem Starcenter
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        Sistem kemitraan kami dirancang seratus persen untuk mendukung profit mitra dan mempermudah penetrasi pasar.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((b, i) => (
                        <div
                            key={i}
                            className="bg-white p-7  shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                {b.icon}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{b.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commission Levels */}
            <div className="bg-gray-900 py-20 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">Struktur Komisi Multi-Level</h2>
                        <p className="text-gray-400 text-sm max-w-md mx-auto">
                            Dapatkan komisi dari setiap transaksi anggota di bawah jaringan kamu, otomatis hingga 7 generasi.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {commissionLevels.map((l, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 ${l.opacity}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <span className="text-gray-300 text-sm">{l.level}</span>
                                </div>
                                <span className="font-bold text-emerald-400 text-lg tabular-nums">{l.rate}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-gray-600 mt-6">
                        * Persentase komisi dapat berubah berdasarkan kebijakan internal Starcenter
                    </p>
                </div>
            </div>

            {/* Comparison Table */}
            <div id="comparison" className="container mx-auto max-w-4xl px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Regular vs Starcenter</h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Bandingkan langsung manfaat yang kamu dapatkan sebagai anggota reguler vs mitra Starcenter.
                    </p>
                </div>

                <div className="bg-white  shadow-sm border border-gray-100 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                        <div className="p-5 text-sm font-semibold text-gray-500">Fitur</div>
                        <div className="p-5 text-center">
                            <div className="text-sm font-bold text-gray-700">Regular</div>
                            <div className="text-xs text-gray-400 mt-0.5">Anggota biasa</div>
                        </div>
                        <div className="p-5 text-center bg-blue-50 border-l border-blue-100">
                            <div className="text-sm font-bold text-blue-700 flex items-center justify-center gap-1.5">
                                <Crown size={14} /> Starcenter
                            </div>
                            <div className="text-xs text-blue-400 mt-0.5">Mitra premium</div>
                        </div>
                    </div>

                    {/* Table rows */}
                    {comparisonRows.map((row, i) => (
                        <div key={i} className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                            <div className="p-4 px-5 text-sm text-gray-700 font-medium flex items-center">{row.feature}</div>
                            <div className="p-4 flex items-center justify-center">
                                {row.regular === true ? (
                                    <Check size={18} className="text-emerald-500" />
                                ) : row.regular === false ? (
                                    <X size={16} className="text-gray-300" />
                                ) : (
                                    <span className="text-xs text-gray-500 text-center">{row.regular}</span>
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-center bg-blue-50/40">
                                {row.starcenter === true ? (
                                    <Check size={18} className="text-blue-600" />
                                ) : row.starcenter === false ? (
                                    <X size={16} className="text-gray-300" />
                                ) : (
                                    <span className="text-xs text-blue-700 font-medium text-center">{row.starcenter}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* CTA row */}
                    <div className="grid grid-cols-3 bg-gray-50 pt-4 pb-5 px-5">
                        <div />
                        <div className="flex items-center justify-center">
                            <Link
                                to="/login?mode=register"
                                className="text-xs text-gray-500 underline hover:text-gray-700 transition"
                            >
                                Daftar Gratis
                            </Link>
                        </div>
                        <div className="flex items-center justify-center">
                            <a
                                href="#join-form"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-xs font-bold rounded-lg transition"
                            >
                                <UserPlus size={14} /> Upgrade Sekarang
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <div id="join-form" className="container mx-auto max-w-3xl px-4">
                <div className="bg-white  p-8 md:p-12 shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1 w-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mulai Perjalanan Starcenter</h2>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                Punya kode referral dari upline? Masukkan di bawah agar kamu otomatis terhubung ke jaringannya.
                                Atau lewati jika mendaftar sebagai pelopor mandiri.
                            </p>

                            <form onSubmit={handleJoinClick} className="space-y-4">
                                <div>
                                    <label htmlFor="refCode" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Kode Referral
                                        <span className="ml-1 text-xs text-gray-400 font-normal">(opsional)</span>
                                    </label>
                                    <input
                                        id="refCode"
                                        type="text"
                                        value={refCode}
                                        onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                                        placeholder="Contoh: AB12CD34"
                                        maxLength={8}
                                        className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-base uppercase transition shadow-sm focus:outline-none"
                                    />
                                    {refCode && (
                                        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Kode referral akan digunakan saat pendaftaran
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full min-h-[52px] px-6 py-3 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition shadow-sm"
                                >
                                    Lanjutkan ke Pendaftaran <ChevronRight size={18} />
                                </button>

                                <p className="text-xs text-gray-400 flex items-start gap-1.5">
                                    <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    Dengan mendaftar, kamu menyetujui syarat &amp; ketentuan program mitra Starcenter.
                                </p>
                            </form>
                        </div>

                        {/* Visual — desktop only */}
                        <div className="flex-shrink-0 hidden md:flex flex-col items-center gap-4">
                            <div className="w-36 h-36 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-xl">
                                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center">
                                    <Coins className="text-yellow-500 mb-1" size={36} />
                                    <span className="font-extrabold text-gray-900 text-xs tracking-wider">STARINC</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <ShoppingBag size={14} />
                                <Link to="/products" className="hover:text-gray-900 underline transition text-xs">
                                    Jelajahi produk dulu
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
