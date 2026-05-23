import React, { useState } from 'react';
import { Crown, TrendingUp, ShieldCheck, ChevronRight, CheckCircle2, Network, Coins, ArrowRight } from 'lucide-react';
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
            icon: Crown,
            title: 'Diskon Grosir Permanen',
            desc: 'Margin profit maksimal dengan status Diamond permanen. Bebas belanja kebutuhan stok dengan potongan harga terbesar.',
        },
        {
            icon: Network,
            title: 'Komisi 7 Level',
            desc: 'Terima komisi dari seluruh downline hingga generasi ke-7, otomatis tercatat di dashboard kamu setiap transaksi.',
        },
        {
            icon: ShieldCheck,
            title: 'Anti-Downgrade',
            desc: 'Ranking Starcenter kebal terhadap penalti tutup poin bulanan. Fokus memperluas jaringan tanpa khawatir.',
        },
        {
            icon: TrendingUp,
            title: 'Passive Income Otomatis',
            desc: 'Komisi dibagi otomatis real-time setiap kali anggota jaringan kamu checkout. Tanpa kerja ekstra.',
        },
    ];

    const commissionLevels = [
        { level: 'Level 1 (Direct)', rate: '10%' },
        { level: 'Level 2', rate: '5%' },
        { level: 'Level 3', rate: '2%' },
        { level: 'Level 4', rate: '1%' },
        { level: 'Level 5', rate: '0.75%' },
        { level: 'Level 6', rate: '0.5%' },
        { level: 'Level 7', rate: '0.25%' },
    ];

    return (
        <div className="min-h-screen bg-white">

            {/* Hero */}
            <section className="relative bg-[#0F172A] text-white pt-28 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">Partnership Program</p>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-tight mb-6">
                        Jadilah Mitra Starcenter
                    </h1>
                    <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
                        Buka penghasilan pasif eksponensial lewat sistem afiliasi multi-level kami.
                        Tidak ada penalti, tidak ada target mengikat — murni profit dari jaringan di tangan kamu.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                        <a
                            href="#join-form"
                            className="inline-flex items-center gap-2 h-12 px-8 bg-white text-gray-900 text-xs uppercase tracking-[0.25em] hover:bg-gray-100 transition-colors rounded-md"
                        >
                            Daftar Mitra <ArrowRight size={14} />
                        </a>
                        <a
                            href="#commission-structure"
                            className="inline-flex items-center gap-2 h-12 px-8 border border-white/20 text-white text-xs uppercase tracking-[0.25em] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-md"
                        >
                            Lihat Struktur Komisi
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-2 max-w-lg mx-auto">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-medium text-white tabular-nums">7</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1.5">Level Komisi</div>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <div className="text-2xl md:text-3xl font-medium text-[var(--color-accent)] tabular-nums">10%</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1.5">Komisi Level 1</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-medium text-white tabular-nums">0</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1.5">Penalti Bulanan</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">Keunggulan</p>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
                            Ekosistem Starcenter
                        </h2>
                        <div className="h-px w-12 bg-gray-900 mx-auto mt-5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {benefits.map((b, i) => {
                            const Icon = b.icon;
                            return (
                                <div
                                    key={i}
                                    className="border border-gray-200 hover:border-gray-400 transition-colors p-7 rounded-lg"
                                >
                                    <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center mb-5">
                                        <Icon size={18} className="text-gray-700" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2 tracking-tight">{b.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Commission Levels */}
            <section id="commission-structure" className="bg-[#0F172A] py-20 md:py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">Komisi Multi-Level</p>
                        <h2 className="text-3xl font-medium text-white tracking-tight mb-3">Struktur Komisi</h2>
                        <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                            Dapatkan komisi dari setiap transaksi anggota di bawah jaringan kamu, otomatis hingga 7 generasi.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {commissionLevels.map((l, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-4 border border-white/10 rounded-md bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full border border-[var(--color-accent)]/40 text-[var(--color-accent)] flex items-center justify-center text-xs font-medium">
                                        {i + 1}
                                    </div>
                                    <span className="text-white/80 text-sm">{l.level}</span>
                                </div>
                                <span className="text-[var(--color-accent)] text-base font-medium tabular-nums">{l.rate}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-[11px] text-white/40 mt-6">
                        Persentase komisi dapat berubah berdasarkan kebijakan internal Starcenter.
                    </p>
                </div>
            </section>

            {/* Registration Form */}
            <section id="join-form" className="py-20 md:py-24 px-6 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-3">Mulai Sekarang</p>
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">
                            Daftarkan Akun Starcenter
                        </h2>
                    </div>

                    <div className="bg-white border border-gray-200 p-8 md:p-10 rounded-lg">
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Punya kode referral dari upline? Masukkan di bawah agar kamu otomatis terhubung ke jaringannya.
                            Atau lewati jika mendaftar sebagai pelopor mandiri.
                        </p>

                        <form onSubmit={handleJoinClick} className="space-y-5">
                            <div>
                                <label htmlFor="refCode" className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Kode Referral
                                    <span className="ml-1 text-xs text-gray-400 font-normal">(opsional)</span>
                                </label>
                                <input
                                    id="refCode"
                                    type="text"
                                    value={refCode}
                                    onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                                    placeholder="Contoh: SCJT0001"
                                    maxLength={8}
                                    className="w-full h-11 px-3 bg-white border border-gray-200 text-sm font-mono uppercase tracking-wider placeholder:text-gray-400 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors rounded-md"
                                />
                                {refCode && (
                                    <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Kode referral akan digunakan saat pendaftaran
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full h-12 btn-primary text-xs uppercase tracking-[0.25em] rounded-md inline-flex items-center justify-center gap-2"
                            >
                                Lanjut ke Pendaftaran <ChevronRight size={14} />
                            </button>

                            <p className="text-[11px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
                                <CheckCircle2 size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                Dengan mendaftar, kamu menyetujui syarat &amp; ketentuan program mitra Starcenter.
                            </p>
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <Link to="/products" className="text-xs text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5">
                            <Coins size={12} /> Jelajahi produk terlebih dahulu
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
