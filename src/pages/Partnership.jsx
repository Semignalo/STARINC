import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
    ArrowRight, Crown, TrendingUp, ShieldCheck,
    Package, Headphones, Star, ChevronDown, Users
} from 'lucide-react';

const copy = {
    en: {
        badge: 'Partnership Program',
        heroTitle: 'Become an\nOfficial Partner',
        heroDesc: 'Join hundreds of Starcenter partners across Indonesia. Get exclusive access and the best wholesale prices for a profitable business.',
        heroCta1: 'Apply Now',
        heroCta2: 'Learn More',
        stats: [
            { val: '500+', label: 'Active Partners' },
            { val: '7 Products', label: 'Product Lines' },
            { val: '34 Provinces', label: 'National Reach' },
        ],
        benefitsLabel: 'Exclusive Benefits',
        benefitsTitle: 'Why Become a Starcenter?',
        benefits: [
            { title: 'Exclusive Wholesale Pricing', desc: 'Access partner pricing with maximum profit margins. Purchase stock at the lowest prices not available to the public.' },
            { title: 'High Profit Margin', desc: 'Partner wholesale prices are designed so you can sell competitively while keeping strong profit margins.' },
            { title: 'Permanent Partner Status', desc: 'Once active, your Starcenter status never drops. Focus on building your business without worrying about losing partner privileges.' },
            { title: 'Early Product Access', desc: 'Our partners get exclusive access to new products before public launch, including free samples for testing.' },
            { title: 'Partner Community', desc: 'Join the Starinc partner community across Indonesia — share sales tips, strategies, and experiences together.' },
            { title: 'Dedicated Support', desc: 'Our dedicated team is ready to accompany your business journey — from onboarding and promotional materials to sales strategies.' },
        ],
        compLabel: 'Comparison',
        compTitle: 'Regular vs\nStarcenter',
        quote: '"Products fly off the shelves — customers reorder every month."',
        quoteBy: '— Starcenter Member, Jakarta',
        compRows: [
            { label: 'Product Price', regular: 'Retail Price', star: 'Wholesale Price' },
            { label: 'Partner Status', regular: 'Tier-based', star: 'Permanent' },
            { label: 'New Product Access', regular: 'After Launch', star: 'Early Access' },
            { label: 'Promo Materials', regular: '—', star: 'Provided' },
            { label: 'Dedicated Support', regular: '—', star: 'Dedicated Team' },
        ],
        stepsLabel: 'How to Join',
        stepsTitle: '4 Easy Steps',
        steps: [
            { num: '01', title: 'Register Online', desc: 'Fill in the online registration form in 5 minutes. Prepare your ID and bank account number.' },
            { num: '02', title: 'Verification & Activation', desc: 'Our team will verify your data within 1–3 business days. You will be notified via email/WhatsApp.' },
            { num: '03', title: 'Access Partner Pricing', desc: 'Starcenter account activated. You can immediately access exclusive wholesale prices and start ordering stock.' },
            { num: '04', title: 'Start Selling', desc: 'Sell Starinc products to your customers and enjoy attractive profit margins. Our team is here to support you.' },
        ],
        stepsCta: 'Start Registering Now',
        faqLabel: 'FAQ',
        faqTitle: 'Common Questions',
        faqs: [
            { q: 'Is there a registration fee?', a: 'There is no registration fee to become a Starcenter. You only need to meet the minimum first purchase requirement (MOQ) to activate your partner account.' },
            { q: 'What is the minimum order for Starcenter?', a: 'The Minimum Order Quantity (MOQ) for Starcenter will be communicated by our team during the verification process. Full details can be asked directly to our customer service.' },
            { q: 'Is there training for new Starcenters?', a: 'Yes, every new Starcenter gets access to onboarding materials, a sales guide, and a briefing session with the Starinc team to ensure you are ready to start.' },
            { q: 'What is the difference between partner and regular pricing?', a: 'Starcenter partners receive a special wholesale price significantly lower than retail price, providing enough margin to resell competitively.' },
            { q: 'Can I sell online?', a: 'Absolutely! Many of our partners sell through social media, marketplaces, or their own online stores. Starinc will provide support materials such as product photos and promotional content.' },
        ],
        ctaReadyLabel: 'Ready to Join?',
        ctaTitle: 'Be Part of the\nStarcenter Family',
        ctaDesc: 'Hundreds of partners have proven that with Starinc, a profitable beauty business can be started from anywhere.',
        ctaBtn1: 'Apply Now',
        ctaBtn2: 'Ask via WhatsApp',
    },
    id: {
        badge: 'Program Kemitraan',
        heroTitle: 'Become an\nOfficial Partner',
        heroDesc: 'Bergabunglah bersama ratusan mitra Starcenter di seluruh Indonesia. Dapatkan akses eksklusif dan harga grosir terbaik untuk bisnis yang menguntungkan.',
        heroCta1: 'Daftar Sekarang',
        heroCta2: 'Pelajari Lebih Lanjut',
        stats: [
            { val: '500+', label: 'Mitra Aktif' },
            { val: '7 Produk', label: 'Lini Produk Unggulan' },
            { val: '34 Provinsi', label: 'Jangkauan Nasional' },
        ],
        benefitsLabel: 'Keuntungan Eksklusif',
        benefitsTitle: 'Mengapa Menjadi Starcenter?',
        benefits: [
            { title: 'Harga Grosir Eksklusif', desc: 'Akses harga mitra dengan margin profit maksimal. Belanja stok dengan potongan harga terbesar yang tidak tersedia untuk umum.' },
            { title: 'Margin Profit Tinggi', desc: 'Harga grosir mitra dirancang agar kamu bisa menjual dengan margin yang kompetitif dan tetap menguntungkan di pasar.' },
            { title: 'Status Mitra Permanen', desc: 'Setelah aktif, status Starcenter tidak pernah turun. Fokus membangun bisnis tanpa khawatir kehilangan hak istimewa mitra.' },
            { title: 'Early Product Access', desc: 'Mitra kami mendapatkan akses eksklusif ke produk terbaru sebelum diluncurkan ke publik, termasuk sampel gratis untuk testing.' },
            { title: 'Komunitas Mitra', desc: 'Bergabung dengan komunitas mitra Starinc di seluruh Indonesia — berbagi tips penjualan, strategi, dan pengalaman bersama.' },
            { title: 'Dedicated Support', desc: 'Tim dedicated kami siap mendampingi perjalanan bisnismu — dari onboarding, materi promosi, hingga strategi penjualan.' },
        ],
        compLabel: 'Perbandingan',
        compTitle: 'Regular vs\nStarcenter',
        quote: '"Produknya laku keras, pelanggan langsung repeat order setiap bulan."',
        quoteBy: '— Starcenter Member, Jakarta',
        compRows: [
            { label: 'Harga Produk', regular: 'Harga Normal', star: 'Harga Grosir' },
            { label: 'Status Mitra', regular: 'Tier-based', star: 'Permanen' },
            { label: 'Akses Produk Baru', regular: 'Setelah Rilis', star: 'Early Access' },
            { label: 'Materi Promosi', regular: '—', star: 'Disediakan' },
            { label: 'Dedicated Support', regular: '—', star: 'Tim Khusus' },
        ],
        stepsLabel: 'Cara Bergabung',
        stepsTitle: '4 Langkah Mudah',
        steps: [
            { num: '01', title: 'Daftar Online', desc: 'Isi formulir pendaftaran online dalam 5 menit. Siapkan KTP dan nomor rekening bank.' },
            { num: '02', title: 'Verifikasi & Aktivasi', desc: 'Tim kami akan memverifikasi data dalam 1–3 hari kerja. Kamu akan mendapatkan notifikasi melalui email/WhatsApp.' },
            { num: '03', title: 'Akses Harga Mitra', desc: 'Akun Starcenter aktif. Kamu langsung bisa mengakses harga grosir eksklusif dan mulai belanja stok.' },
            { num: '04', title: 'Mulai Berjualan', desc: 'Jual produk Starinc ke pelanggan dan rasakan margin profit yang menarik. Tim kami siap mendukungmu.' },
        ],
        stepsCta: 'Mulai Daftar Sekarang',
        faqLabel: 'FAQ',
        faqTitle: 'Pertanyaan Umum',
        faqs: [
            { q: 'Apakah ada biaya pendaftaran?', a: 'Tidak ada biaya pendaftaran untuk menjadi Starcenter. Kamu hanya perlu memenuhi syarat minimum pembelian pertama (MOQ) untuk aktivasi akun mitra.' },
            { q: 'Berapa minimum order untuk Starcenter?', a: 'Minimum Order Quantity (MOQ) Starcenter akan diinformasikan oleh tim kami saat proses verifikasi. Detail selengkapnya dapat ditanyakan langsung ke customer service kami.' },
            { q: 'Apakah ada pelatihan untuk Starcenter baru?', a: 'Ya, setiap Starcenter baru mendapatkan akses ke materi onboarding, panduan penjualan, dan sesi briefing bersama tim Starinc untuk memastikan kamu siap memulai.' },
            { q: 'Apa perbedaan harga mitra dengan harga normal?', a: 'Mitra Starcenter mendapatkan harga grosir khusus yang jauh lebih rendah dari harga eceran, memberikan ruang margin yang cukup untuk dijual kembali secara kompetitif.' },
            { q: 'Apakah saya bisa menjual secara online?', a: 'Tentu! Banyak mitra kami berjualan melalui media sosial, marketplace, atau toko online pribadi. Tim Starinc akan memberikan materi pendukung seperti foto produk dan konten promosi.' },
        ],
        ctaReadyLabel: 'Siap Bergabung?',
        ctaTitle: 'Jadilah Bagian dari\nKeluarga Starcenter',
        ctaDesc: 'Ratusan mitra telah membuktikan bahwa bersama Starinc, bisnis kecantikan yang menguntungkan bisa dimulai dari mana saja.',
        ctaBtn1: 'Daftar Sekarang',
        ctaBtn2: 'Tanya via WhatsApp',
    },
};

const ICONS = [Crown, TrendingUp, ShieldCheck, Package, Users, Headphones];

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start justify-between py-5 text-left gap-4 group outline-none"
                style={{ background: 'none' }}
            >
                <span className={`text-sm font-medium leading-relaxed transition-colors ${open ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{q}</span>
                <ChevronDown size={16} className={`shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'text-white/40'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-white/70 leading-relaxed">{a}</p>
            </div>
        </div>
    );
}

export default function Partnership() {
    const { lang } = useLanguage();
    const tx = copy[lang] ?? copy.id;

    return (
        <div className="bg-white text-gray-900 overflow-hidden">

            {/* ── 1. Hero ───────────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a0a0a]">
                <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative overflow-hidden">
                        <img src="/partnership/duo-girls.jpg" alt="" className="w-full h-full object-cover object-center opacity-40" />
                    </div>
                    <div className="relative overflow-hidden">
                        <img src="/partnership/trio-girls.jpg" alt="" className="w-full h-full object-cover object-center opacity-40" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />

                <div className="relative z-10 container mx-auto px-6 py-24 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight mb-6 whitespace-pre-line">
                        {tx.heroTitle}
                    </h1>
                    <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
                        {tx.heroDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/daftar-center"
                            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-100 transition-colors"
                        >
                            {tx.heroCta1} <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="container mx-auto px-6 py-5 grid grid-cols-3 gap-4 max-w-2xl text-center">
                        {tx.stats.map((s, i) => (
                            <div key={i}>
                                <p className="text-xl font-medium tracking-tight text-white">{s.val}</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/80 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 2. Benefits ──────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">{tx.benefitsLabel}</p>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight">{tx.benefitsTitle}</h2>
                        <div className="h-px w-12 bg-gray-900 mx-auto mt-5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tx.benefits.map((b, i) => {
                            const Icon = ICONS[i];
                            return (
                                <div key={i} className="group border border-gray-100 rounded-sm p-7 hover:border-gray-900/40 hover:shadow-lg hover:shadow-[var(--color-accent)]/5 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-gray-900/8 flex items-center justify-center mb-5 group-hover:bg-gray-900/15 transition-colors">
                                        <Icon size={22} className="text-gray-500" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 3. Photo + Comparison ────────────────────────────── */}
            <section className="grid md:grid-cols-2 gap-0">
                <div className="relative h-[500px] overflow-hidden">
                    <img src="/partnership/community.jpg" alt="Komunitas Starcenter" className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-white font-medium tracking-tight text-xl">{tx.quote}</p>
                        <p className="text-white/60 text-xs mt-2 uppercase tracking-widest">{tx.quoteBy}</p>
                    </div>
                </div>
                <div className="bg-[#faf8f5] flex flex-col justify-center px-10 py-16">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-4">{tx.compLabel}</p>
                    <h2 className="text-2xl font-medium tracking-tight mb-8 leading-snug whitespace-pre-line">{tx.compTitle}</h2>
                    <div className="space-y-4">
                        {tx.compRows.map((row, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 items-center text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <span className="text-gray-500 text-xs">{row.label}</span>
                                <div className="text-center text-xs text-gray-400 bg-gray-100 rounded px-2 py-1.5">{row.regular}</div>
                                <div className="text-center text-xs text-gray-500 bg-gray-900/8 rounded px-2 py-1.5 font-semibold">{row.star}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. How to Join ───────────────────────────────────── */}
            <section id="cara-bergabung" className="py-20 md:py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">{tx.stepsLabel}</p>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight">{tx.stepsTitle}</h2>
                        <div className="h-px w-12 bg-gray-900 mx-auto mt-5" />
                    </div>
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[var(--color-accent)]/20 via-[var(--color-accent)]/50 to-[var(--color-accent)]/20" />
                        {tx.steps.map((step, i) => (
                            <div key={i} className="relative text-center">
                                <div className="w-16 h-16 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center mx-auto mb-5 relative z-10">
                                    <span className="font-medium tracking-tight text-lg text-gray-500">{step.num}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{step.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            to="/daftar-center"
                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors"
                        >
                            {tx.stepsCta} <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 5. Photo strip ───────────────────────────────────── */}
            <section className="grid grid-cols-3 h-64 md:h-80">
                <div className="overflow-hidden">
                    <img src="/partnership/three-hands.png" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden">
                    <img src="/partnership/skin-tones.png" alt="" className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden">
                    <img src="/partnership/product-hero.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
            </section>

            {/* ── 6. FAQ ───────────────────────────────────────────── */}
            <section className="bg-[#0f0f0f] py-20 md:py-28 px-6 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent" />
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-3">{tx.faqLabel}</p>
                        <h2 className="text-3xl font-medium tracking-tight text-white">{tx.faqTitle}</h2>
                    </div>
                    <div className="divide-y divide-white/10 border border-white/10 rounded-sm px-6">
                        {tx.faqs.map((f, i) => <FaqItem key={`${lang}-${i}`} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── 7. Final CTA ─────────────────────────────────────── */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/partnership/duo-girls.jpg')] bg-cover bg-center opacity-5" />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 mb-4">{tx.ctaReadyLabel}</p>
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-5 leading-snug whitespace-pre-line">
                        {tx.ctaTitle}
                    </h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                        {tx.ctaDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/daftar-center"
                            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[var(--color-accent-dark)] transition-colors"
                        >
                            {tx.ctaBtn1} <ArrowRight size={14} />
                        </Link>
                        <a
                            href="https://wa.me/62811253599"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-4 text-xs font-bold tracking-widest uppercase hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                            {tx.ctaBtn2}
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
