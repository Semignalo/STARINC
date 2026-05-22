import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../contexts/AppearanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/home';
import { productApi } from '../api/productApi';
import { testimonialsApi } from '../api/settingsApi';
import { ArrowRight, Star, Quote } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';

/* ─────────────────────────────────────────────────────────────
   ProductCard — clean monochrome
───────────────────────────────────────────────────────────── */
function ProductCardSimple({ id, title, price, main_image_url, main_image, image, category, variants, stock, viewLabel, outOfStockLabel }) {
    const parsePrice = (p) => parseFloat(String(p || '0').replace(/[^0-9.]/g, '')) || 0;
    const displayPrice = variants?.length > 0
        ? `Mulai Rp${Math.min(...variants.map(v => parsePrice(v.price))).toLocaleString('id-ID')}`
        : `Rp${parsePrice(price).toLocaleString('id-ID')}`;
    const imageUrl = main_image_url || main_image || image;
    const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;

    return (
        <Link to={`/product/${id}`} className="group block">
            <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4">
                <OptimizedImage
                    src={imageUrl || '/logo.png'}
                    alt={title}
                    width={500}
                    height={500}
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                    wrapperClassName="absolute inset-0"
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-700">{outOfStockLabel}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">{category}</p>
                <h3 className="text-sm font-medium text-gray-900 mb-1 leading-snug">{title}</h3>
                <p className="text-sm text-gray-500 tabular-nums">{displayPrice}</p>
            </div>
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────
   Featured Split — image/video + text
───────────────────────────────────────────────────────────── */
function FeaturedSplit({ mediaUrl, mediaIsVideo, label, title, description, ctaText, ctaUrl, reverse = false }) {
    return (
        <section className="border-t border-gray-100">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${reverse ? 'md:[direction:rtl]' : ''}`}>
                <div className="aspect-square md:aspect-auto md:min-h-[520px] bg-gray-50 overflow-hidden md:[direction:ltr]">
                    {mediaUrl ? (
                        mediaIsVideo ? (
                            <video src={mediaUrl} autoPlay loop muted playsInline preload="none"
                                className="w-full h-full object-cover" />
                        ) : (
                            <OptimizedImage src={mediaUrl} alt={title || ''} width={900} height={900}
                                sizes="(min-width: 768px) 50vw, 100vw"
                                wrapperClassName="w-full h-full" />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Media belum diatur</div>
                    )}
                </div>
                <div className="flex items-center justify-center px-8 md:px-14 lg:px-20 py-14 md:py-20 md:[direction:ltr]">
                    <div className="max-w-md w-full">
                        {label && (
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4">{label}</p>
                        )}
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-5 leading-tight tracking-tight">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-7">
                                {description}
                            </p>
                        )}
                        {ctaText && (
                            <Link
                                to={ctaUrl || '/products'}
                                className="inline-flex items-center gap-2 px-5 h-10 border border-gray-900 text-xs uppercase tracking-[0.2em] text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                            >
                                {ctaText} <ArrowRight size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function Home() {
    const { settings } = useAppearance();
    const { lang }     = useLanguage();
    const tx           = t[lang];

    const [allProducts, setAllProducts]   = useState([]);
    const [testimonials, setTestimonials] = useState(null);

    useEffect(() => {
        productApi.getProducts({ per_page: 9 })
            .then(r => setAllProducts(r.data || []))
            .catch(() => setAllProducts([]));

        testimonialsApi.getAll()
            .then(setTestimonials)
            .catch(() => setTestimonials([]));
    }, []);

    return (
        <div className="flex flex-col w-full overflow-hidden bg-white">

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-gray-900">
                {settings?.heroVideoUrl && (
                    <video
                        key={settings.heroVideoUrl}
                        autoPlay loop muted playsInline
                        preload="metadata"
                        poster={settings?.heroVideoPoster}
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={settings.heroVideoUrl} type="video/mp4" />
                    </video>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[10%] px-6 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-white mb-6 leading-tight tracking-tight max-w-2xl">
                        {settings?.heroTitle || 'True Radiance'}
                    </h1>
                    <p className="text-white/80 mb-10 max-w-md mx-auto text-sm leading-relaxed">
                        {settings?.heroSubtitle || (lang === 'en'
                            ? 'Discover the new Gold Standard for your skin.'
                            : 'Temukan standar baru keemasan untuk kulitmu.')}
                    </p>
                    <Link
                        to={settings?.heroCtaUrl || '/products'}
                        className="inline-flex items-center gap-2 px-6 h-11 bg-white text-gray-900 text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors"
                    >
                        {tx.heroBtn} <ArrowRight size={13} />
                    </Link>
                </div>
            </section>

            {/* ── Products ─────────────────────────────────────── */}
            {allProducts.length > 0 && (
                <section className="py-16 md:py-24 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-end justify-between mb-10 md:mb-12">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">{tx.productsLabel}</p>
                                <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">{tx.productsTitle}</h2>
                            </div>
                            <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                                {lang === 'id' ? 'Lihat semua' : 'View all'} <ArrowRight size={11} />
                            </Link>
                        </div>

                        {/* Mobile: horizontal scroll */}
                        <div className="flex md:hidden gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4"
                             style={{ scrollbarWidth: 'none' }}>
                            {allProducts.map(p => (
                                <div key={p.id} className="snap-start shrink-0 w-[60vw] max-w-[260px]">
                                    <ProductCardSimple {...p} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                                </div>
                            ))}
                        </div>
                        {/* Desktop: grid */}
                        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
                            {allProducts.slice(0, 8).map(p => (
                                <ProductCardSimple key={p.id} {...p} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Featured Split #1 ────────────────────────────── */}
            {settings?.goldSerumVideoUrl && (
                <FeaturedSplit
                    mediaUrl={settings.goldSerumVideoUrl}
                    mediaIsVideo
                    label={settings?.goldSerumSubtitle || 'Face cleansing balm'}
                    title={settings?.goldSerumDescription1 || 'A gentle, effective cleanse.'}
                    description={settings?.goldSerumDescription2 || ''}
                    ctaText={tx.feat1Btn}
                    ctaUrl={settings?.feat1CtaUrl}
                />
            )}

            {/* ── Featured Split #2 ────────────────────────────── */}
            {settings?.secondFeaturedVideoUrl && (
                <FeaturedSplit
                    mediaUrl={settings.secondFeaturedVideoUrl}
                    mediaIsVideo
                    label={settings?.secondFeaturedSubtitle || 'Signature collection'}
                    title={settings?.secondFeaturedDescription1 || 'Crafted with passion.'}
                    description={settings?.secondFeaturedDescription2 || ''}
                    ctaText={tx.feat2Btn}
                    ctaUrl={settings?.feat2CtaUrl}
                    reverse
                />
            )}

            {/* ── Testimonials ─────────────────────────────────── */}
            {(() => {
                const list = Array.isArray(testimonials) && testimonials.length > 0
                    ? testimonials
                    : (Array.isArray(tx.testimonials) ? tx.testimonials : []);
                if (list.length === 0) return null;
                return (
                <section className="border-t border-gray-100 py-16 md:py-24 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">{tx.testimLabel}</p>
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">{tx.testimTitle}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {list.slice(0, 6).map((item, i) => (
                                <figure key={item.id ?? i} className="border border-gray-100 p-7 flex flex-col gap-5 relative bg-white">
                                    <Quote size={20} className="text-gray-200 absolute top-5 right-5" strokeWidth={1.5} />
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                                            <Star key={s} size={11} className="text-gray-900 fill-gray-900" />
                                        ))}
                                    </div>
                                    <blockquote className="text-sm text-gray-600 leading-relaxed flex-1">"{item.text}"</blockquote>
                                    <figcaption className="border-t border-gray-100 pt-4">
                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                        {item.product && <p className="text-[11px] text-gray-400 mt-0.5">{item.product}</p>}
                                        {item.location && <p className="text-[11px] text-gray-400">{item.location}</p>}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
                );
            })()}

            {/* ── Partnership CTA ──────────────────────────────── */}
            <section className="bg-gray-900 py-20 md:py-28 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--admin-accent,#C5A059)] mb-5">{tx.ctaLabel}</p>
                    <h2 className="text-3xl md:text-4xl font-medium text-white mb-5 leading-tight tracking-tight whitespace-pre-line">
                        {tx.ctaTitle}
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto mb-8">
                        {tx.ctaDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/daftar-center" className="inline-flex items-center justify-center px-6 h-11 bg-white text-gray-900 text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors">
                            {tx.ctaBtn1}
                        </Link>
                        <Link to="/partnership" className="inline-flex items-center justify-center px-6 h-11 border border-white/40 text-white text-xs uppercase tracking-[0.2em] hover:border-white hover:bg-white/5 transition-colors">
                            {tx.ctaBtn2}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Quote ────────────────────────────────────────── */}
            <section className="py-24 md:py-32 px-6 border-t border-gray-100">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-xl md:text-2xl text-gray-800 italic leading-relaxed mb-8 whitespace-pre-line">
                        {tx.quoteText}
                    </p>
                    <div className="w-8 h-px bg-gray-300 mx-auto mb-5" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">
                        {tx.quoteAuthor}
                    </p>
                </div>
            </section>

        </div>
    );
}
