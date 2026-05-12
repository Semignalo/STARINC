import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const copy = {
    en: {
        heroLabel: 'Our Concept',
        heroTitle: 'Beauty That\nStarts Within',
        heroDesc: 'Starinc was founded on the belief that true beauty is born from consistent care, carefully chosen natural ingredients, and confidence that grows from within.',
        whoLabel: 'Who We Are',
        whoTitle: 'We believe everyone deserves healthy, radiant skin.',
        whoDesc: 'Starinc is an Indonesian body care brand born from a passion for natural beauty. Every product is formulated with high-quality ingredients, clinically tested, and halal-certified — because we believe that caring for yourself is a form of self-respect.',
        storyLabel: 'Our Story',
        storyTitle: 'From Passion,\nto Product',
        storyP1: 'Starinc began from our founder\'s frustration in finding body care products that were truly effective, safe, and affordable for Indonesian women.',
        storyP2: 'After extensive research with our formulation team, Starinc was born — a brand that combines the finest natural ingredients with modern skincare technology. Today, thousands of Indonesian women have experienced the difference.',
        storyLink: 'View Our Products',
        valuesLabel: 'What We Stand For',
        valuesTitle: 'Our Values',
        values: [
            { title: '100% Natural', desc: 'Premium natural ingredients, free from harmful substances that damage skin.' },
            { title: 'Cruelty Free', desc: 'Never tested on animals. Our production is eco-friendly and ethical.' },
            { title: 'Halal & BPOM', desc: 'MUI halal certified and officially registered with BPOM Indonesia.' },
            { title: 'Dermatologist Tested', desc: 'Clinically tested and safe for all skin types, including sensitive skin.' },
        ],
        rangeLabel: 'Our Range',
        rangeTitle: 'Our Product Range',
        snow: {
            label: 'Body Serum',
            title: 'Snow Kissed\nMilk Life',
            desc: 'A tone-up body serum with a unique formula of milk protein and vitamin C that delivers visibly brighter, more hydrated, and healthier-looking skin every day.',
        },
        prime: {
            label: 'Supplement',
            title: 'Primeherb\nNatural Formula',
            desc: 'A premium herbal supplement with fig extract and selected natural ingredients that support health from within — because true beauty starts from a healthy body.',
        },
        philLabel: 'Our Philosophy',
        philTitle: 'Ingredients\nWe Believe In',
        philDesc: 'Every ingredient we use is rigorously selected. We only work with suppliers who are transparent in their production chain and committed to the highest quality standards.',
        ingredients: [
            'Vitamin C — Natural brightener and antioxidant',
            'Fig Extract — Nourishes skin from within',
            'Aloe Vera — Hydrates and soothes',
            'Milk Protein — Nourishes and firms',
        ],
        quote: 'True beauty is not merely about appearance, but about how you nurture yourself every single day.',
        quoteBy: '— Starinc Philosophy',
        ctaTitle: 'Ready to Start Your Journey?',
        ctaDesc: 'Find the right Starinc product for you and feel the difference within the first 2 weeks.',
        ctaBtn: 'Explore Products',
    },
    id: {
        heroLabel: 'Our Concept',
        heroTitle: 'Beauty That\nStarts Within',
        heroDesc: 'Starinc hadir dengan keyakinan bahwa kecantikan sejati lahir dari perawatan yang konsisten, bahan-bahan alami pilihan, dan rasa percaya diri yang tumbuh dari dalam.',
        whoLabel: 'Who We Are',
        whoTitle: 'Kami percaya setiap orang berhak merasakan kulit yang sehat dan bercahaya.',
        whoDesc: 'Starinc adalah brand perawatan tubuh Indonesia yang lahir dari passion terhadap kecantikan alami. Setiap produk kami diformulasikan dengan bahan-bahan berkualitas tinggi, telah melalui uji klinis, dan tersertifikasi halal — karena kami percaya bahwa merawat diri adalah bentuk menghargai diri sendiri.',
        storyLabel: 'Our Story',
        storyTitle: 'Dari Passion,\nMenjadi Produk',
        storyP1: 'Starinc dimulai dari kegelisahan pendiri kami yang sulit menemukan produk perawatan tubuh yang benar-benar efektif, aman, dan terjangkau untuk wanita Indonesia.',
        storyP2: 'Setelah riset panjang bersama tim formulasi, lahirlah Starinc — brand yang menggabungkan bahan alami terbaik dengan teknologi perawatan kulit modern. Hari ini, ribuan wanita Indonesia telah merasakan perbedaannya.',
        storyLink: 'Lihat Produk Kami',
        valuesLabel: 'What We Stand For',
        valuesTitle: 'Nilai-Nilai Kami',
        values: [
            { title: '100% Natural', desc: 'Bahan alami pilihan, bebas dari bahan berbahaya yang merusak kulit.' },
            { title: 'Cruelty Free', desc: 'Tidak diuji pada hewan. Produksi kami ramah lingkungan dan etis.' },
            { title: 'Halal & BPOM', desc: 'Tersertifikasi halal MUI dan terdaftar resmi di BPOM Indonesia.' },
            { title: 'Dermatologist Tested', desc: 'Teruji secara klinis dan aman untuk semua jenis kulit, termasuk kulit sensitif.' },
        ],
        rangeLabel: 'Our Range',
        rangeTitle: 'Rangkaian Produk Kami',
        snow: {
            label: 'Body Serum',
            title: 'Snow Kissed\nMilk Life',
            desc: 'Tone up body serum dengan formulasi unik dari protein susu dan vitamin C yang memberikan tampilan kulit lebih cerah, lembab, dan sehat setiap hari.',
        },
        prime: {
            label: 'Supplement',
            title: 'Primeherb\nNatural Formula',
            desc: 'Suplemen herbal premium dengan kandungan fig dan bahan alami pilihan yang mendukung kesehatan dari dalam — karena kecantikan sejati dimulai dari tubuh yang sehat.',
        },
        philLabel: 'Our Philosophy',
        philTitle: 'Bahan-Bahan\nYang Kami Percaya',
        philDesc: 'Setiap bahan yang kami gunakan dipilih secara ketat. Kami hanya bekerja sama dengan supplier yang transparan dalam rantai produksi mereka dan berkomitmen terhadap standar kualitas yang tinggi.',
        ingredients: [
            'Vitamin C — Pencerah dan antioksidan alami',
            'Fig Extract — Menyehatkan kulit dari dalam',
            'Aloe Vera — Melembabkan dan menenangkan',
            'Milk Protein — Menutrisi dan mengencangkan',
        ],
        quote: 'Kecantikan sejati bukan hanya tentang penampilan, tapi tentang bagaimana kamu merawat dirimu setiap hari.',
        quoteBy: '— Starinc Philosophy',
        ctaTitle: 'Siap Memulai Perjalananmu?',
        ctaDesc: 'Temukan produk Starinc yang tepat untukmu dan rasakan perbedaannya dalam 2 minggu pertama.',
        ctaBtn: 'Jelajahi Produk',
    },
};

const VALUE_ICONS = [Leaf, Heart, ShieldCheck, Award];

export default function About() {
    const { lang } = useLanguage();
    const tx = copy[lang] ?? copy.id;

    return (
        <div className="bg-white text-gray-900 overflow-hidden">

            {/* ── 1. Hero ───────────────────────────────────────────── */}
            <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
                <img
                    src="/about/body-care.jpg"
                    alt="Starinc Body Care"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="relative z-10 px-8 pb-14 max-w-3xl">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">{tx.heroLabel}</p>
                    <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-4 whitespace-pre-line">
                        {tx.heroTitle}
                    </h1>
                    <p className="text-white/80 text-base max-w-md leading-relaxed">
                        {tx.heroDesc}
                    </p>
                </div>
            </section>

            {/* ── 2. Manifesto ─────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto text-center">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-5">{tx.whoLabel}</p>
                <h2 className="text-3xl md:text-4xl font-serif leading-snug text-gray-900 mb-8">
                    {tx.whoTitle}
                </h2>
                <div className="h-px w-12 bg-[var(--color-accent)] mx-auto mb-8" />
                <p className="text-gray-500 leading-relaxed text-base max-w-2xl mx-auto">
                    {tx.whoDesc}
                </p>
            </section>

            {/* ── 3. Split: Story Left, Photo Right ────────────────── */}
            <section className="grid md:grid-cols-2 gap-0">
                <div className="bg-[#faf8f5] flex flex-col justify-center px-10 py-16 md:py-24 order-2 md:order-1">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">{tx.storyLabel}</p>
                    <h2 className="text-3xl font-serif mb-6 leading-snug whitespace-pre-line">{tx.storyTitle}</h2>
                    <p className="text-gray-500 leading-relaxed mb-4">{tx.storyP1}</p>
                    <p className="text-gray-500 leading-relaxed mb-8">{tx.storyP2}</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border-b border-gray-900 pb-0.5 w-fit hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                    >
                        {tx.storyLink} <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="relative order-1 md:order-2 h-[400px] md:h-auto overflow-hidden">
                    <img src="/about/team-girls.jpg" alt="Starinc Team" className="w-full h-full object-cover" />
                </div>
            </section>

            {/* ── 4. Three photos mosaic ───────────────────────────── */}
            <section className="grid grid-cols-3 gap-1">
                <div className="col-span-2 h-[400px] overflow-hidden">
                    <img src="/about/hands-cream.jpg" alt="Skincare" className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex-1 overflow-hidden">
                        <img src="/about/cstar-lemon.jpg" alt="C-Star" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <img src="/about/product-aloe.jpg" alt="Confidence Burst" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                </div>
            </section>

            {/* ── 5. Values ────────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">{tx.valuesLabel}</p>
                        <h2 className="text-3xl md:text-4xl font-serif">{tx.valuesTitle}</h2>
                        <div className="h-px w-12 bg-[var(--color-accent)] mx-auto mt-5" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {tx.values.map((v, i) => {
                            const Icon = VALUE_ICONS[i];
                            return (
                                <div key={i} className="text-center group">
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                                        <Icon size={24} className="text-[var(--color-accent)]" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 6. Full-width photo ──────────────────────────────── */}
            <section className="relative h-[50vh] overflow-hidden">
                <img src="/about/you-need-this.jpg" alt="You need this" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-black/20" />
            </section>

            {/* ── 7. Product Range with varied layout ─────────────── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">{tx.rangeLabel}</p>
                        <h2 className="text-3xl md:text-4xl font-serif">{tx.rangeTitle}</h2>
                    </div>

                    {/* Row 1: wide left, narrow right */}
                    <div className="grid md:grid-cols-5 gap-6 mb-6">
                        <div className="md:col-span-3 h-[320px] overflow-hidden rounded-sm group">
                            <img src="/about/snow-kissed-bag.jpg" alt="Snow Kissed" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-center pl-0 md:pl-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">{tx.snow.label}</p>
                            <h3 className="text-2xl font-serif mb-4 whitespace-pre-line">{tx.snow.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{tx.snow.desc}</p>
                        </div>
                    </div>

                    {/* Row 2: narrow left, wide right */}
                    <div className="grid md:grid-cols-5 gap-6 mb-6">
                        <div className="md:col-span-2 flex flex-col justify-center pr-0 md:pr-4 order-2 md:order-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">{tx.prime.label}</p>
                            <h3 className="text-2xl font-serif mb-4 whitespace-pre-line">{tx.prime.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{tx.prime.desc}</p>
                        </div>
                        <div className="md:col-span-3 h-[320px] overflow-hidden rounded-sm group order-1 md:order-2">
                            <img src="/about/primeherb-fig.png" alt="Primeherb" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>

                    {/* Row 3: two equal */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="h-[280px] overflow-hidden rounded-sm group">
                            <img src="/about/skin-swatches.png" alt="For All Skin Tones" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="h-[280px] overflow-hidden rounded-sm group">
                            <img src="/about/products-fridge.png" alt="Product Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 8. Ingredients philosophy ───────────────────────── */}
            <section className="bg-[#111] py-20 md:py-28 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">{tx.philLabel}</p>
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 leading-snug whitespace-pre-line">
                            {tx.philTitle}
                        </h2>
                        <p className="text-white/60 leading-relaxed mb-6">{tx.philDesc}</p>
                        <div className="space-y-3">
                            {tx.ingredients.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                                    <p className="text-white/70 text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-52 overflow-hidden rounded-sm">
                            <img src="/about/cstar-lemon.jpg" alt="C-Star" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-52 overflow-hidden rounded-sm mt-8">
                            <img src="/about/product-aloe.jpg" alt="Aloe" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 9. Quote ─────────────────────────────────────────── */}
            <section className="py-24 px-6 text-center max-w-3xl mx-auto">
                <div className="text-5xl font-serif text-[var(--color-accent)]/30 mb-4">"</div>
                <blockquote className="text-2xl md:text-3xl font-serif text-gray-900 leading-relaxed italic mb-6">
                    {tx.quote}
                </blockquote>
                <p className="text-sm text-[var(--color-accent)] tracking-widest uppercase">{tx.quoteBy}</p>
            </section>

            {/* ── 10. CTA ──────────────────────────────────────────── */}
            <section className="bg-[#faf8f5] py-16 px-6 text-center border-t border-stone-100">
                <h2 className="text-2xl md:text-3xl font-serif mb-4">{tx.ctaTitle}</h2>
                <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">{tx.ctaDesc}</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[var(--color-accent)] transition-colors"
                >
                    {tx.ctaBtn} <ArrowRight size={15} />
                </Link>
            </section>

        </div>
    );
}
