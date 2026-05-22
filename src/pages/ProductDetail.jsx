import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { testimonialsApi } from '../api/settingsApi';
import { Star, Truck, ShieldCheck, Leaf, FileText, ChevronLeft, ChevronRight, ChevronRight as ChevR, Quote } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SdpRedirectModal from '../components/SdpRedirectModal';
import OptimizedImage from '../components/OptimizedImage';
import VideoEmbed from '../components/VideoEmbed';

const PdfViewer = lazy(() => import('../components/PdfViewer'));

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { currentUser, userRole } = useAuth();
    const canCheckout = userRole === 'starcenter' || userRole === 'admin';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [testimIdx, setTestimIdx] = useState(0);
    const [sdpModalOpen, setSdpModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [relatedProducts, setRelatedProducts] = useState([]);

    const isOutOfStock = product
        ? selectedVariant
            ? selectedVariant.stock !== null && selectedVariant.stock <= 0
            : product.is_out_of_stock || (product.stock !== null && product.stock <= 0)
        : false;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!id) return;
                const data = await productApi.getProduct(id);
                setProduct(data);
                setMainImage(data.main_image_url || data.main_image);
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }

                // Fetch related products (same category, exclude current)
                const allProducts = await productApi.getProducts({ per_page: 20 });
                const related = (allProducts.data || [])
                    .filter(p => p.id !== data.id && p.category === data.category)
                    .slice(0, 3);
                // Fallback: kalau related kosong, ambil produk lain saja
                if (related.length === 0) {
                    const others = (allProducts.data || []).filter(p => p.id !== data.id).slice(0, 3);
                    setRelatedProducts(others);
                } else {
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        testimonialsApi.getAll().then(setTestimonials).catch(() => {});
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <h2 className="text-2xl font-medium mb-4 tracking-tight">Product Not Found</h2>
                <Link to="/" className="text-sm text-gray-700 underline underline-offset-4 hover:text-gray-900">Return to Home</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        if (!canCheckout) { setSdpModalOpen(true); return; }
        addToCart({
            ...product,
            cartItemId: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            price: selectedVariant ? selectedVariant.price : product.price,
            variantName: selectedVariant ? selectedVariant.name : undefined,
            variantId: selectedVariant ? selectedVariant.id : undefined,
        });
    };

    // Tab visibility — show only tabs yang ada data
    const hasIngredients = !!product.ingredients;
    const hasPackaging = !!product.packaging || !!product.weight;
    const tabs = [
        { key: 'description', label: 'Description', visible: !!product.description },
        { key: 'ingredients', label: 'Ingredients',  visible: hasIngredients },
        { key: 'packaging',   label: 'Packaging',    visible: hasPackaging },
    ].filter(t => t.visible);

    // Ensure activeTab valid
    const validActiveTab = tabs.find(t => t.key === activeTab) ? activeTab : tabs[0]?.key;

    return (
        <>
        <SdpRedirectModal
            open={sdpModalOpen}
            onClose={() => setSdpModalOpen(false)}
            isLoggedIn={!!currentUser}
        />

        <div className="bg-white">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
                <nav className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-6" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                    <ChevR size={11} className="text-gray-300" />
                    <Link to="/products" className="hover:text-gray-900 transition-colors">Catalog</Link>
                    {product.category && (
                        <>
                            <ChevR size={11} className="text-gray-300" />
                            <span className="text-gray-500">{product.category}</span>
                        </>
                    )}
                    <ChevR size={11} className="text-gray-300" />
                    <span className="text-gray-900">{product.title}</span>
                </nav>
            </div>

            {/* ── Top Section ─────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 lg:gap-16">

                    {/* Left — Images */}
                    <div className="space-y-3">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-lg">
                            {product.discount && (
                                <div className="absolute top-3 left-3 bg-white border border-gray-200 text-[10px] font-medium uppercase tracking-[0.2em] px-2 py-1 z-10 rounded">
                                    {product.discount} OFF
                                </div>
                            )}

                            {mainImage && (mainImage.includes('.mp4') || mainImage.includes('video')) ? (
                                <video
                                    src={mainImage}
                                    className="w-full h-full object-cover"
                                    autoPlay loop muted playsInline
                                />
                            ) : (
                                <OptimizedImage
                                    src={mainImage}
                                    alt={product.title}
                                    width={1000}
                                    height={1000}
                                    priority
                                    sizes="(min-width: 768px) 55vw, 100vw"
                                    wrapperClassName="absolute inset-0"
                                />
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.media && product.media.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {product.media.map((item, idx) => {
                                    const itemUrl = item.url || item;
                                    const isVideo = item.type === 'video' || itemUrl?.includes('.mp4') || itemUrl?.includes('.webm');
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setMainImage(itemUrl)}
                                            className={`relative aspect-square bg-gray-50 overflow-hidden rounded-md transition-all ${
                                                mainImage === itemUrl ? 'ring-2 ring-gray-900' : 'hover:opacity-80'
                                            }`}
                                        >
                                            {isVideo ? (
                                                <video src={itemUrl} className="w-full h-full object-cover pointer-events-none" muted />
                                            ) : (
                                                <OptimizedImage src={itemUrl} alt={`View ${idx}`} width={200} height={200} wrapperClassName="absolute inset-0" blur={false} />
                                            )}
                                            {isVideo && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                                                        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-black border-b-[3px] border-b-transparent ml-0.5"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right — Info */}
                    <div className="flex flex-col md:pt-2">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">
                            {product.category || 'The Act'}
                        </p>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 tracking-tight leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-baseline gap-3 mb-3">
                            {isOutOfStock ? (
                                <span className="text-xl text-gray-400">Stok Habis</span>
                            ) : (
                                <span className="text-xl font-medium text-gray-900 tabular-nums">
                                    Rp{Number(selectedVariant ? selectedVariant.price : product.price).toLocaleString('id-ID')}
                                </span>
                            )}
                            {product.originalPrice && !selectedVariant && !isOutOfStock && (
                                <span className="text-sm text-gray-400 line-through tabular-nums">Rp{Number(product.originalPrice).toLocaleString('id-ID')}</span>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-6">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={12} className="fill-gray-900 text-gray-900" />
                                ))}
                            </div>
                            <span className="text-[11px] text-gray-500 ml-1">4.8 ({testimonials.length || 12})</span>
                        </div>

                        {/* Short description */}
                        {product.description && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-7 line-clamp-3">
                                {product.description}
                            </p>
                        )}

                        {/* Variant selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Size / Varian</p>
                                <div className="relative">
                                    <select
                                        value={selectedVariant?.name || ''}
                                        onChange={(e) => {
                                            const v = product.variants.find(x => x.name === e.target.value);
                                            if (v) setSelectedVariant(v);
                                        }}
                                        className="w-full h-11 pl-3 pr-9 bg-white border border-gray-300 text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors rounded-md appearance-none"
                                    >
                                        {product.variants.map((v, idx) => {
                                            const oos = v.stock !== null && v.stock <= 0;
                                            return (
                                                <option key={idx} value={v.name} disabled={oos}>
                                                    {v.name} — Rp{Number(v.price).toLocaleString('id-ID')}
                                                    {oos && ' (habis)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <ChevR size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`w-full h-12 text-xs uppercase tracking-[0.25em] rounded-md mb-2 ${
                                isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'btn-primary'
                            }`}
                        >
                            {isOutOfStock ? 'Stok Habis' : canCheckout ? 'Add to Cart' : 'Beli Sekarang'}
                        </button>
                        {!canCheckout && !isOutOfStock && (
                            <p className="text-[11px] text-gray-500 text-center mb-6">
                                Pembelian dilayani via marketplace SDP
                            </p>
                        )}

                        {/* Suggested partners (related products) — Aesop-style mini list */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Suggested partners</p>
                                <div className="space-y-2">
                                    {relatedProducts.map(rp => (
                                        <Link key={rp.id} to={`/product/${rp.id}`}
                                            className="flex items-center gap-3 p-2 rounded-md border border-gray-100 hover:border-gray-300 transition-colors">
                                            <div className="w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0 relative">
                                                <OptimizedImage src={rp.main_image_url || rp.main_image || '/logo.png'} alt={rp.title}
                                                    width={64} height={64} blur={false}
                                                    wrapperClassName="absolute inset-0" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">{rp.title}</p>
                                                <p className="text-[11px] text-gray-500 tabular-nums">Rp{Number(rp.price).toLocaleString('id-ID')}</p>
                                            </div>
                                            <ChevR size={12} className="text-gray-300 flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tab Section ─────────────────────────────────── */}
            {tabs.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-16">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-8 md:gap-12">
                            {tabs.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`pb-3 -mb-px text-xs uppercase tracking-[0.2em] transition-colors border-b-2 ${
                                        validActiveTab === t.key
                                            ? 'text-gray-900 border-[var(--color-accent)] font-medium'
                                            : 'text-gray-400 border-transparent hover:text-gray-700'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="py-8 md:py-10 max-w-3xl">
                        {validActiveTab === 'description' && (
                            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </div>
                        )}
                        {validActiveTab === 'ingredients' && (
                            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.ingredients}
                            </div>
                        )}
                        {validActiveTab === 'packaging' && (
                            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                                {product.packaging && <p className="whitespace-pre-line">{product.packaging}</p>}
                                {product.weight && (
                                    <p>Berat: <span className="text-gray-900 font-medium">{product.weight} g</span></p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Video Demo ─────────────────────────────────── */}
            {product.video_url && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">Video Produk</p>
                    <VideoEmbed url={product.video_url} title={product.title} className="max-w-3xl mx-auto rounded-lg overflow-hidden" />
                </div>
            )}

            {/* ── PDF Brochure ─────────────────────────────────── */}
            {product.pdf_url && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5 flex items-center gap-2">
                        <FileText size={12} className="text-gray-400" /> Informasi Produk
                    </p>
                    <Suspense fallback={
                        <div className="flex justify-center py-12">
                            <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                    }>
                        <PdfViewer url={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/${product.id}/pdf`} />
                    </Suspense>
                </div>
            )}

            {/* ── Related Products (full section) ─────────────── */}
            {relatedProducts.length > 0 && (
                <section className="bg-gray-50/50 mt-16 md:mt-24 py-14 md:py-20 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="mb-10">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Suggested Partners</p>
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">
                                Pair it with these
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {relatedProducts.map(rp => (
                                <Link key={rp.id} to={`/product/${rp.id}`}
                                      className="group block bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors">
                                    <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                        <OptimizedImage src={rp.main_image_url || rp.main_image || '/logo.png'} alt={rp.title}
                                            width={500} height={500}
                                            sizes="(min-width: 768px) 33vw, 100vw"
                                            wrapperClassName="absolute inset-0"
                                            className="group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">{rp.category}</p>
                                        <h3 className="text-sm font-medium text-gray-900 mb-1 leading-snug">{rp.title}</h3>
                                        <p className="text-sm text-gray-500 tabular-nums">Rp{Number(rp.price).toLocaleString('id-ID')}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Customer Reflections ─────────────────────────── */}
            {testimonials.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
                    <div className="text-center mb-12">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Customer Reflections</p>
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">
                            Stories from our customers
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${testimIdx * (100 / Math.min(3, testimonials.length))}%)` }}
                            >
                                {testimonials.map((t, i) => (
                                    <div
                                        key={t.id ?? i}
                                        className="shrink-0 px-3"
                                        style={{ width: testimonials.length === 1 ? '100%' : testimonials.length === 2 ? '50%' : '33.333%' }}
                                    >
                                        <div className="bg-white border border-gray-100 p-7 flex flex-col gap-5 relative h-full rounded-lg">
                                            <Quote size={20} className="text-gray-200 absolute top-5 right-5" strokeWidth={1.5} />
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: t.rating }).map((_, s) => (
                                                    <Star key={s} size={11} className="text-gray-900 fill-gray-900" />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                                            <div className="border-t border-gray-100 pt-4">
                                                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                                                {t.product && <p className="text-[11px] text-gray-500 mt-0.5">{t.product}</p>}
                                                {t.location && <p className="text-[11px] text-gray-400">{t.location}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {testimonials.length > 3 && (
                            <>
                                <button
                                    onClick={() => setTestimIdx(i => Math.max(0, i - 1))}
                                    disabled={testimIdx === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 border border-gray-200 bg-white flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-200 transition-colors rounded-full"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setTestimIdx(i => Math.min(testimonials.length - 3, i + 1))}
                                    disabled={testimIdx >= testimonials.length - 3}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 border border-gray-200 bg-white flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-200 transition-colors rounded-full"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* ── Bottom Trust Strip — navy dark dengan gold accent ──── */}
            <div
                className="text-white py-10 md:py-12 px-4"
                style={{ backgroundImage: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)' }}
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <ShieldCheck size={20} className="text-[var(--color-accent)]" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-[0.2em]">Secure Checkout</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <Leaf size={20} className="text-[var(--color-accent)]" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-[0.2em]">100% Vegan Formula</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        <Truck size={20} className="text-[var(--color-accent)]" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-[0.2em]">Fast Shipping</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
