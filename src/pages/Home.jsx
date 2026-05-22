import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '../contexts/AppearanceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/home';
import { productApi } from '../api/productApi';
import { testimonialsApi } from '../api/settingsApi';
import { instagramApi } from '../api/instagramApi';
import { ArrowRight, Star, Quote, Instagram, X, ChevronLeft, ChevronRight, ExternalLink, Copy, Play } from 'lucide-react';
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
            <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4 rounded-lg">
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
   PostMedia — render isi modal: image / video / carousel slider
───────────────────────────────────────────────────────────── */
function PostMedia({ post, childIdx, onPrevChild, onNextChild }) {
    // Carousel: render child yang aktif (image atau video) + nav dots di bawah
    if (post.type === 'carousel_album' && post.children?.length > 0) {
        const child = post.children[Math.min(childIdx, post.children.length - 1)];
        const isVideo = child.type === 'video' && child.video;

        return (
            <>
                {isVideo ? (
                    <video
                        key={child.video}
                        src={child.video}
                        poster={child.image}
                        controls
                        playsInline
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <OptimizedImage
                        src={child.image}
                        alt=""
                        width={1000} height={1000}
                        priority blur={false}
                        wrapperClassName="w-full h-full flex items-center justify-center"
                        fit="contain"
                    />
                )}

                {/* Prev/Next dalam carousel */}
                {post.children.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onPrevChild(); }}
                            disabled={childIdx === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onNextChild(); }}
                            disabled={childIdx === post.children.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 flex items-center justify-center shadow disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={18} />
                        </button>

                        {/* Dot indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {post.children.map((_, i) => (
                                <span
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                        i === childIdx ? 'bg-white' : 'bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </>
        );
    }

    // Single video
    if (post.type === 'video' && post.video) {
        return (
            <video
                key={post.video}
                src={post.video}
                poster={post.image}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-full object-contain"
            />
        );
    }

    // Single image (default fallback)
    return (
        <OptimizedImage
            src={post.image}
            alt=""
            width={1000} height={1000}
            priority blur={false}
            wrapperClassName="w-full h-full flex items-center justify-center"
            fit="contain"
        />
    );
}

/* ─────────────────────────────────────────────────────────────
   MediaTypeIcon — overlay icon di pojok kanan-atas thumbnail
   menandakan tipe post (carousel / video). Image tidak ada icon.
───────────────────────────────────────────────────────────── */
function MediaTypeIcon({ type }) {
    const t = (type || '').toLowerCase();

    if (t === 'carousel_album' || t === 'carousel') {
        return (
            <span className="absolute top-2 right-2 z-10 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                <Copy size={18} strokeWidth={2} />
            </span>
        );
    }
    if (t === 'video' || t === 'reels' || t === 'reel') {
        return (
            <span className="absolute top-2 right-2 z-10 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                <Play size={18} strokeWidth={2} fill="currentColor" />
            </span>
        );
    }
    return null;
}

/* ─────────────────────────────────────────────────────────────
   Instagram Post Modal — lightbox dengan gambar lokal + link IG
   (Tidak pakai iframe Instagram embed — hindari error
    'restricted account' / 'private profile' / 'age limit')
───────────────────────────────────────────────────────────── */
function InstagramPostModal({ posts, activeIndex, handle, onClose, onPrev, onNext }) {
    const post = posts?.[activeIndex];
    const [childIdx, setChildIdx] = useState(0);

    // Reset carousel index saat post berganti
    useEffect(() => { setChildIdx(0); }, [activeIndex]);

    useEffect(() => {
        if (activeIndex === null) return;
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') onPrev();
            else if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [activeIndex, onClose, onPrev, onNext]);

    if (activeIndex === null || !post) return null;

    const canPrev = activeIndex > 0;
    const canNext = activeIndex < posts.length - 1;
    const postUrl = post.url || `https://instagram.com/${handle}`;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Tutup"
            >
                <X size={22} />
            </button>

            {/* Prev */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={!canPrev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-25 disabled:cursor-not-allowed transition-colors z-20"
                aria-label="Previous"
            >
                <ChevronLeft size={28} />
            </button>

            {/* Next */}
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={!canNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-25 disabled:cursor-not-allowed transition-colors z-20"
                aria-label="Next"
            >
                <ChevronRight size={28} />
            </button>

            {/* Content card — layout: image kiri, sidebar kanan (desktop) / stacked (mobile) */}
            <div
                className="bg-white shadow-2xl flex flex-col md:flex-row max-h-[92vh] overflow-hidden"
                style={{ width: 'min(960px, 100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Media — render image / video / carousel */}
                <div className="md:flex-1 bg-black flex items-center justify-center aspect-square md:aspect-auto md:min-h-[560px] max-h-[92vh] relative">
                    <PostMedia
                        post={post}
                        childIdx={childIdx}
                        onPrevChild={() => setChildIdx(i => Math.max(0, i - 1))}
                        onNextChild={() => setChildIdx(i => Math.min((post.children?.length || 1) - 1, i + 1))}
                    />
                </div>

                {/* Sidebar */}
                <aside className="md:w-[340px] flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                        <Instagram size={16} className="text-gray-900" strokeWidth={1.8} />
                        <p className="text-sm font-medium text-gray-900 tracking-tight">View on Instagram</p>
                    </div>

                    {/* Caption / body */}
                    <div className="flex-1 px-5 py-5 overflow-y-auto">
                        {post.caption ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {post.caption}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Klik tombol di bawah untuk melihat caption lengkap & berinteraksi di Instagram.
                            </p>
                        )}
                    </div>

                    {/* Footer with CTA + counter */}
                    <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                        <a
                            href={postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                        >
                            <ExternalLink size={14} />
                            Open in Instagram
                        </a>
                        <p className="text-[11px] text-gray-400 text-center tabular-nums">
                            {activeIndex + 1} / {posts.length}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Instagram Feed — manual content via Appearance Settings
───────────────────────────────────────────────────────────── */
function InstagramFeed({ settings }) {
    const handle = settings?.instagramHandle?.trim();
    const [activeIdx, setActiveIdx] = useState(null);
    const [apiPosts, setApiPosts] = useState(null); // null = loading, [] = no data, [{...}] = ada

    // Try fetch dari Instagram Graph API (auto). Bila gagal/empty, fallback manual.
    useEffect(() => {
        let cancelled = false;
        instagramApi.getPosts(5)
            .then(res => {
                if (cancelled) return;
                if (res?.configured && Array.isArray(res.posts) && res.posts.length > 0) {
                    // Normalize ke shape internal
                    setApiPosts(res.posts.map(p => ({
                        image:    p.image,
                        video:    p.video || null,
                        children: Array.isArray(p.children) ? p.children : [],
                        url:      p.permalink,
                        caption:  p.caption || '',
                        type:     p.type || 'image', // image | video | carousel_album
                    })));
                } else {
                    setApiPosts([]);
                }
            })
            .catch(() => { if (!cancelled) setApiPosts([]); });
        return () => { cancelled = true; };
    }, []);

    if (!handle) return null;

    // Posts dari API kalau ada, else fallback ke manual input via Appearance Settings
    const manualPosts = Array.from({ length: 5 }, (_, i) => ({
        image:   settings?.[`instagramPost${i + 1}Image`],
        url:     settings?.[`instagramPost${i + 1}Url`] || `https://instagram.com/${handle}`,
        caption: settings?.[`instagramPost${i + 1}Caption`] || '',
    })).filter(p => p.image);

    const posts = (apiPosts && apiPosts.length > 0) ? apiPosts : manualPosts;

    if (posts.length === 0) return null;

    const profileUrl = `https://instagram.com/${handle}`;

    return (
        <>
            <section className="border-t border-gray-100 py-16 md:py-20">
                <div className="text-center mb-10 px-4">
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-base md:text-lg text-gray-900 hover:text-gray-600 transition-colors"
                    >
                        <Instagram size={18} strokeWidth={1.5} />
                        Follow us on instagram <span className="font-medium">@{handle}</span>
                    </a>
                </div>

                {/* Mobile: horizontal scroll */}
                <div className="flex md:hidden gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2"
                     style={{ scrollbarWidth: 'none' }}>
                    {posts.map((p, i) => (
                        <button key={i} onClick={() => setActiveIdx(i)}
                                className="snap-start shrink-0 w-[60vw] max-w-[240px] aspect-[4/5] bg-gray-100 overflow-hidden group relative">
                            <OptimizedImage src={p.image} alt={`Instagram post ${i + 1}`}
                                width={400} height={500}
                                sizes="60vw"
                                className="group-hover:opacity-90 transition-opacity"
                                wrapperClassName="absolute inset-0" />
                            <MediaTypeIcon type={p.type} />
                        </button>
                    ))}
                </div>

                {/* Desktop: 5-column grid full-bleed */}
                <div className="hidden md:grid grid-cols-5 gap-0">
                    {posts.map((p, i) => (
                        <button key={i} onClick={() => setActiveIdx(i)}
                                className="relative aspect-[4/5] bg-gray-100 overflow-hidden group cursor-pointer">
                            <OptimizedImage src={p.image} alt={`Instagram post ${i + 1}`}
                                width={500} height={625}
                                sizes="20vw"
                                className="group-hover:opacity-90 transition-opacity"
                                wrapperClassName="absolute inset-0" />
                            <MediaTypeIcon type={p.type} />
                            <span className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/20 transition-colors flex items-center justify-center">
                                <Instagram size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <InstagramPostModal
                posts={posts}
                activeIndex={activeIdx}
                handle={handle}
                onClose={() => setActiveIdx(null)}
                onPrev={() => setActiveIdx(i => Math.max(0, i - 1))}
                onNext={() => setActiveIdx(i => Math.min(posts.length - 1, i + 1))}
            />
        </>
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
                <section className="py-16 md:py-24">
                    {/* Header tetap di container (biar tidak nempel pinggir) */}
                    <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-end justify-between mb-10 md:mb-12">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">{tx.productsLabel}</p>
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">{tx.productsTitle}</h2>
                        </div>
                        <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                            {lang === 'id' ? 'Lihat semua' : 'View all'} <ArrowRight size={11} />
                        </Link>
                    </div>

                    {/* Mobile: horizontal scroll */}
                    <div className="flex md:hidden gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-4"
                         style={{ scrollbarWidth: 'none' }}>
                        {allProducts.map(p => (
                            <div key={p.id} className="snap-start shrink-0 w-[60vw] max-w-[260px]">
                                <ProductCardSimple {...p} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                            </div>
                        ))}
                    </div>

                    {/* Desktop: full-width grid 4 kolom */}
                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 px-6 lg:px-10">
                        {allProducts.slice(0, 8).map(p => (
                            <ProductCardSimple key={p.id} {...p} viewLabel={tx.viewProduct} outOfStockLabel={tx.outOfStock} />
                        ))}
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

            {/* ── Instagram Feed ───────────────────────────────── */}
            <InstagramFeed settings={settings} />

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
