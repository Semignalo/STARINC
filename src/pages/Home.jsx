import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../contexts/AppearanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/home';
import { productApi } from '../api/productApi';
import { testimonialsApi } from '../api/settingsApi';
import { ArrowRight, ArrowLeft, Star, Quote } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';

/* ─────────────────────────────────────────────────────────────
   Home Product Card  (Aesop-style)
───────────────────────────────────────────────────────────── */
function HomeProductCard({ id, title, price, main_image_url, main_image, image, category, variants, stock, viewLabel, outOfStockLabel }) {
    const parsePrice = (p) => parseFloat(String(p || '0').replace(/[^0-9.]/g, '')) || 0;
    const displayPrice = variants?.length > 0
        ? `Rp ${Math.min(...variants.map(v => parsePrice(v.price))).toLocaleString('id-ID')}`
        : `Rp ${parsePrice(price).toLocaleString('id-ID')}`;
    const imageUrl = main_image_url || main_image || image;
    const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;

    return (
        <Link to={`/product/${id}`} className="group flex flex-col w-full shrink-0 md:shrink md:w-auto">
            <div className="relative aspect-square overflow-hidden bg-stone-100 mb-3">
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <span className="text-white text-[10px] uppercase tracking-[0.2em]">{outOfStockLabel}</span>
                    </div>
                )}
                <OptimizedImage
                    src={imageUrl || '/logo.png'} alt={title}
                    width={400} height={400}
                    sizes="(min-width: 768px) 33vw, 46vw"
                    className="group-hover:scale-[1.04] transition-transform duration-700"
                    wrapperClassName="absolute inset-0"
                    onError={e => { e.target.src = '/logo.png'; }}
                />
            </div>
            <div className="text-center flex-1 flex flex-col px-1">
                <p className="text-[10px] text-gray-400 mb-1 tracking-wide truncate">{category}</p>
                <h3 className="font-serif text-gray-900 text-sm mb-2 leading-snug line-clamp-2">{title}</h3>
                <p className="text-xs text-gray-600 mb-3">{displayPrice}</p>
                <span className="mt-auto block w-full bg-[#1a1a1a] text-white text-[10px] tracking-[0.15em] uppercase py-2.5 group-hover:bg-[var(--color-accent)] transition-colors duration-300">
                    {viewLabel}
                </span>
            </div>
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function Home() {
    const { settings }              = useAppearance();
    const { lang }                  = useLanguage();
    const tx                        = t[lang];

    const [allProducts, setAllProducts]   = useState([]);
    const [productsError, setProductsError] = useState(false);
    const [promoProducts, setPromoProducts] = useState([]);
    const [testimonials, setTestimonials] = useState(null); // null = loading

    useEffect(() => {
        productApi.getProducts({ per_page: 9 })
            .then(r => { setAllProducts(r.data || []); setProductsError(false); })
            .catch(() => setProductsError(true));

        productApi.getProducts({ promo: true, per_page: 20 })
            .then(r => setPromoProducts(r.data || []))
            .catch(() => {});

        testimonialsApi.getAll()
            .then(data => setTestimonials(data))
            .catch(() => setTestimonials([]));
    }, []);


    return (
        <div className="flex flex-col w-full overflow-hidden">

            {/* ── 1. Hero ──────────────────────────────────────────── */}
            <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden">
                <video
                    key={settings?.heroVideoUrl || 'default-vid'}
                    autoPlay loop muted playsInline
                    preload="metadata"
                    poster={settings?.heroVideoPoster || '/logo.png'}
                    className="absolute inset-0 w-full h-full object-cover bg-stone-900"
                >
                    <source src={settings?.heroVideoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[6%] px-4 z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-serif text-white mb-5 leading-tight max-w-2xl drop-shadow">
                        {settings?.heroTitle || 'True Radiance'}
                    </h1>
                    <p className="text-white/70 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
                        {settings?.heroSubtitle || (lang === 'en'
                            ? 'Discover the new Gold Standard for your skin.'
                            : 'Temukan standar baru keemasan untuk kulitmu.')}
                    </p>
                    <Link to={settings?.heroCtaUrl || '/products'} className="border border-white/80 text-white px-10 py-3.5 text-xs tracking-[0.2em] hover:bg-white hover:text-gray-900 transition-colors duration-300 uppercase flex items-center gap-3">
                        {tx.heroBtn} <ArrowRight size={13} />
                    </Link>
                </div>
            </section>

            {/* ── 2. Promo Products ────────────────────────────────── */}
            {promoProducts.length > 0 && (
            <section className="py-8 md:py-12 bg-[#faf8f5]">
                <div className="mb-8 px-4 md:px-8 max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3">
                        {lang === 'id' ? 'Pilihan Terkurasi' : 'Curated for You'}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {lang === 'id'
                            ? 'Setiap produk Starinc hadir dari riset mendalam — diformulasikan untuk kulit Indonesia yang sesungguhnya.'
                            : 'Every Starinc product is born from deep research — formulated for skin that is truly, uniquely Indonesian.'}
                    </p>
                </div>
                <>
                    {/* Mobile: horizontal swipe */}
                    <div className="flex md:hidden gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {promoProducts.map(product => (
                            <div key={product.id} className="snap-start shrink-0 w-[46vw] max-w-[200px]">
                                <HomeProductCard {...product} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                            </div>
                        ))}
                    </div>
                    {/* Desktop: grid 3 kolom */}
                    <div className="hidden md:grid grid-cols-3 gap-6 px-8 max-w-6xl mx-auto">
                        {promoProducts.slice(0, 3).map(product => (
                            <HomeProductCard key={product.id} {...product} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                        ))}
                    </div>
                </>
            </section>
            )}

            {/* ── 3. Featured Split #1 ─────────────────────────────── */}
            <section className="py-10 md:py-16 bg-[#faf8f5]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-14">
                        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.goldSerumVideoUrl ? (
                                    <video autoPlay loop muted playsInline preload="none"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings.goldSerumVideoUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-stone-100">
                                        <div className="animate-pulse bg-stone-200 w-full h-full absolute inset-0" />
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-4 md:mb-5 font-medium">
                                {settings?.goldSerumSubtitle || 'Face cleansing balm'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 max-w-[400px] mx-auto">
                                {settings?.goldSerumDescription1 || 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.'}
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-[400px] mx-auto">
                                {settings?.goldSerumDescription2 || 'Fragrance-free, lightly scented with ginger and lemon essential oils.'}
                            </p>
                            <Link to={settings?.feat1CtaUrl || '/products'} className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm inline-block text-center">
                                {tx.feat1Btn} &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* ── 4. Featured Split #2 ─────────────────────────────── */}
            <section className="py-10 md:py-16 bg-[#f0ede8]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-8 lg:gap-14">
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                            <div className="w-full max-w-[400px] aspect-[3/4] bg-stone-50 rounded-sm overflow-hidden relative shadow-sm">
                                {settings?.secondFeaturedVideoUrl ? (
                                    <video autoPlay loop muted playsInline preload="none"
                                        className="w-full h-full object-cover pointer-events-none"
                                        src={settings.secondFeaturedVideoUrl} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-stone-100">
                                        <div className="animate-pulse bg-stone-200 w-full h-full absolute inset-0" />
                                        <span className="relative z-10 text-sm">Video belum diatur</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center">
                            <h2 className="text-2xl md:text-3xl text-[var(--color-accent)] font-serif mb-4 md:mb-5 font-medium">
                                {settings?.secondFeaturedSubtitle || 'Our Concept'}
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4 max-w-[400px] mx-auto">
                                {settings?.secondFeaturedDescription1 || 'A focus on healthy, radiant skin.'}
                            </p>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-[400px] mx-auto">
                                {settings?.secondFeaturedDescription2 || 'Crafted with passion.'}
                            </p>
                            <Link to={settings?.feat2CtaUrl || '/products'} className="border border-[var(--color-accent)] text-[var(--color-accent)] px-8 py-3.5 text-xs font-bold tracking-[0.2em] hover:bg-[var(--color-accent)] hover:text-white transition-colors uppercase w-[200px] rounded-sm inline-block text-center">
                                {tx.feat2Btn} &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. Skin Type Split Section ───────────────────────── */}
            <section className="flex flex-col md:flex-row min-h-[420px] md:min-h-[540px]">
                <div className="w-full md:w-1/2 h-[300px] md:h-auto overflow-hidden">
                    {settings?.skinTypeImageUrl ? (
                        <OptimizedImage src={settings.skinTypeImageUrl} alt={settings?.skinTypeTitle || ''}
                            width={800} height={600}
                            sizes="(min-width: 768px) 50vw, 100vw"
                            wrapperClassName="w-full h-full" />
                    ) : (
                        <div className="w-full h-full bg-stone-200 flex items-center justify-center min-h-[300px]">
                            <span className="text-stone-400 text-sm">Gambar belum diatur</span>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/2 bg-white flex items-center px-8 md:px-14 lg:px-20 py-12 md:py-16">
                    <div className="max-w-[480px]">
                        {settings?.skinTypeTag && (
                            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">
                                {settings.skinTypeTag}
                            </p>
                        )}
                        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-snug">
                            {settings?.skinTypeTitle || (lang === 'id' ? 'Cocok untuk Semua Jenis Kulit' : 'Crafted for Every Skin Type')}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            {settings?.skinTypeDescription || (lang === 'id'
                                ? 'Formula kami dirancang untuk semua jenis kulit — normal, kering, berminyak, maupun kombinasi. Setiap produk Starinc hadir dengan bahan aktif pilihan yang bekerja harmonis untuk kulit Anda.'
                                : 'Our formulas are designed for all skin types — normal, dry, oily, or combination. Each Starinc product contains carefully selected actives that work in harmony with your skin.')}
                        </p>
                        <Link to={settings?.skinTypeCtaUrl || '/products'}
                            className="border border-gray-900 text-gray-900 px-8 py-3.5 text-xs tracking-[0.15em] hover:bg-gray-900 hover:text-white transition-colors uppercase inline-flex items-center gap-2">
                            {settings?.skinTypeCtaText || (lang === 'id' ? 'Jelajahi Produk' : 'Explore Products')} <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 6. Products Scroll ───────────────────────────────── */}
            <section className="py-8 md:py-12 bg-[#faf8f5]">
                <div className="mb-5 px-4 md:px-8 max-w-6xl mx-auto">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">{tx.productsLabel}</p>
                    <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{tx.productsTitle}</h2>
                </div>
                {productsError ? (
                    <div className="text-center py-16 text-gray-400 text-sm px-4">
                        {lang === 'en' ? 'Unable to load products.' : 'Produk tidak dapat dimuat.'}
                    </div>
                ) : (
                    <>
                        <div className="flex md:hidden gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {allProducts.map(product => (
                                <div key={product.id} className="snap-start shrink-0 w-[46vw] max-w-[200px]">
                                    <HomeProductCard {...product} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:grid grid-cols-3 gap-6 px-8 max-w-6xl mx-auto">
                            {allProducts.slice(0, 3).map(product => (
                                <HomeProductCard key={product.id} {...product} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* ── 7. Editorial Image & Text */}
            <section className="flex flex-col md:flex-row min-h-[360px] md:min-h-[460px] bg-stone-50">
                <div className="w-full md:w-[45%] flex items-center px-8 md:px-16 lg:px-20 py-10 md:py-14">
                    <div className="max-w-[420px]">
                        {settings?.editorialTag && (
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                                {settings.editorialTag}
                            </p>
                        )}
                        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-snug">
                            {settings?.editorialTitle || 'Crafted for Your Skin'}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {settings?.editorialDescription || ''}
                        </p>
                        <Link to={settings?.editorialCtaUrl || '/products'} className="border border-gray-900 text-gray-900 px-8 py-3.5 text-xs tracking-[0.15em] hover:bg-gray-900 hover:text-white transition-colors uppercase inline-flex items-center gap-2">
                            {settings?.editorialCtaText || tx.editorialBtn} <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
                <div className="w-full md:w-[55%] h-[300px] md:h-auto overflow-hidden">
                    {settings?.editorialImageUrl ? (
                        <OptimizedImage src={settings.editorialImageUrl} alt={settings?.editorialTitle || ''}
                            width={900} height={600}
                            sizes="(min-width: 768px) 55vw, 100vw"
                            wrapperClassName="w-full h-full" />
                    ) : (
                        <div className="w-full h-full bg-stone-200 flex items-center justify-center min-h-[300px]">
                            <span className="text-stone-400 text-sm">
                                {lang === 'en' ? 'Image not set' : 'Gambar belum diatur'}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── 7. Testimonials ──────────────────────────────────── */}
            {(testimonials === null || testimonials?.length > 0 || tx.testimonials?.length > 0) && (
            <section className="py-10 md:py-14 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-8">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-3">{tx.testimLabel}</p>
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{tx.testimTitle}</h2>
                        <div className="h-px w-10 bg-[var(--color-accent)] mx-auto mt-5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(testimonials ?? tx.testimonials).map((item, i) => (
                            <div key={item.id ?? i} className="bg-[#faf8f5] rounded-sm p-7 border border-stone-100 flex flex-col gap-4 relative">
                                <Quote size={26} className="text-[var(--color-accent)]/15 absolute top-5 right-5" strokeWidth={1} />
                                <div className="flex gap-0.5">
                                    {Array.from({ length: item.rating }).map((_, s) => (
                                        <Star key={s} size={12} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{item.text}"</p>
                                <div className="border-t border-stone-200 pt-4">
                                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                    {item.product && <p className="text-xs text-[var(--color-accent)] mt-0.5">{item.product}</p>}
                                    {item.location && <p className="text-xs text-gray-400">{item.location}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* ── 8. Partnership CTA (moved to bottom, no MLM language) */}
            <section className="py-12 bg-[#111] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />
                <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-4">{tx.ctaLabel}</p>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-5 leading-snug whitespace-pre-line">
                        {tx.ctaTitle}
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto mb-7">
                        {tx.ctaDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/daftar-center" className="bg-[var(--color-accent)] text-white px-8 py-3.5 text-xs font-bold tracking-widest hover:bg-[var(--color-accent-dark)] transition-colors uppercase rounded-sm">
                            {tx.ctaBtn1}
                        </Link>
                        <Link to="/partnership" className="border border-white/25 text-white/70 px-8 py-3.5 text-xs font-bold tracking-widest hover:border-white/60 hover:text-white transition-colors uppercase rounded-sm">
                            {tx.ctaBtn2}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── 9. Quote (very bottom) ───────────────────────────── */}
            <section className="py-24 md:py-32 bg-[#f5f2ed]">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <p className="font-serif text-2xl md:text-3xl text-gray-800 italic leading-relaxed mb-7 whitespace-pre-line">
                        {tx.quoteText}
                    </p>
                    <div className="w-8 h-px bg-[var(--color-accent)] mx-auto mb-5" />
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
                        {tx.quoteAuthor}
                    </p>
                </div>
            </section>

        </div>
    );
}
