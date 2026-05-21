import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { testimonialsApi } from '../api/settingsApi';
import { Star, Truck, ShieldCheck, Leaf, FileText, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
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
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
                <Link to="/" className="text-[var(--color-accent)] underline">Return into Home</Link>
            </div>
        );
    }

    return (
        <>
        <SdpRedirectModal
            open={sdpModalOpen}
            onClose={() => setSdpModalOpen(false)}
            isLoggedIn={!!currentUser}
        />
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Left Column - Images */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-sm">
                        {product.discount && (
                            <div className="absolute top-0 right-0 bg-[#E53E3E] text-white text-sm font-bold px-4 py-1.5 z-10">
                                {product.discount} OFF
                            </div>
                        )}

                        {mainImage && (mainImage.includes('.mp4') || mainImage.includes('video')) ? (
                            <video
                                src={mainImage}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <OptimizedImage
                                src={mainImage}
                                alt={product.title}
                                width={900}
                                height={900}
                                priority
                                sizes="(min-width: 768px) 50vw, 100vw"
                                wrapperClassName="absolute inset-0"
                            />
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.media && product.media.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.media.map((item, idx) => {
                                const itemUrl = item.url || item;
                                const isVideo = item.type === 'video' || itemUrl?.includes('.mp4') || itemUrl?.includes('.webm');
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(itemUrl)}
                                        className={`relative aspect-square bg-gray-50 overflow-hidden border transition-all ${mainImage === itemUrl ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        {isVideo ? (
                                            <video src={itemUrl} className="w-full h-full object-cover pointer-events-none" muted />
                                        ) : (
                                            <OptimizedImage src={itemUrl} alt={`View ${idx}`} width={200} height={200} wrapperClassName="absolute inset-0" blur={false} />
                                        )}
                                        {isVideo && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center p-1">
                                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column - Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-900 border-b border-black pb-0.5">By {product.category || 'The Act'}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)] mb-4 font-normal">
                        {product.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-baseline gap-3">
                            {isOutOfStock ? (
                                <span className="text-2xl font-medium text-gray-400">Stok Habis</span>
                            ) : (
                                <span className="text-2xl font-medium text-[var(--color-sale)]">
                                    Rp. {Number(selectedVariant ? selectedVariant.price : product.price).toLocaleString('id-ID')}
                                </span>
                            )}
                            {product.originalPrice && !selectedVariant && !isOutOfStock && (
                                <span className="text-lg text-gray-400 line-through">Rp. {Number(product.originalPrice).toLocaleString('id-ID')}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} className="fill-[#fbbf24] text-[#fbbf24]" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(12 reviews)</span>
                        </div>
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Varian Produk</h4>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((v, idx) => {
                                    const variantOos = v.stock !== null && v.stock <= 0;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !variantOos && setSelectedVariant(v)}
                                            disabled={variantOos}
                                            className={`px-4 py-2 border rounded-sm text-sm font-medium transition-all relative ${
                                                variantOos
                                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : selectedVariant?.name === v.name
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-300 text-gray-700 hover:border-black'
                                            }`}
                                        >
                                            {v.name}
                                            {variantOos && (
                                                <span className="ml-1.5 text-xs text-gray-400">(Habis)</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {product.description && (
                        <div className="prose prose-sm text-gray-600 mb-6 max-w-none whitespace-pre-line">
                            {product.description}
                        </div>
                    )}

                    {product.weight && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">Berat: <span className="text-gray-900 font-medium">{product.weight} g</span></p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mb-10">
                        <button
                            onClick={() => {
                                if (isOutOfStock) return;
                                if (!canCheckout) {
                                    setSdpModalOpen(true);
                                    return;
                                }
                                const productToAdd = {
                                    ...product,
                                    cartItemId: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
                                    price: selectedVariant ? selectedVariant.price : product.price,
                                    variantName: selectedVariant ? selectedVariant.name : undefined,
                                    variantId: selectedVariant ? selectedVariant.id : undefined
                                };
                                addToCart(productToAdd);
                            }}
                            disabled={isOutOfStock}
                            className={`w-full border py-4 font-bold text-sm tracking-widest transition-colors uppercase ${
                                isOutOfStock
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'border-black text-black hover:bg-black hover:text-white'
                            }`}
                        >
                            {isOutOfStock
                                ? 'Stok Habis'
                                : canCheckout
                                    ? 'Add to Cart'
                                    : 'Beli Sekarang'}
                        </button>
                        {!canCheckout && !isOutOfStock && (
                            <p className="text-xs text-gray-500 text-center -mt-1">
                                Pembelian dilayani via marketplace SDP
                            </p>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 text-center bg-gray-50/50 p-4 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Leaf size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">100% Vegan</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <ShieldCheck size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Truck size={24} className="text-gray-400 stroke-[1.5]" />
                            <span className="text-xs text-gray-600 font-medium">Fast Shipping</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Video Demo (YouTube/Vimeo) ────────────────────── */}
            {product.video_url && (
                <div className="mt-12 border-t border-gray-100 pt-10">
                    <h2 className="text-lg font-serif text-gray-900 mb-6">Video Produk</h2>
                    <VideoEmbed url={product.video_url} title={product.title} className="max-w-3xl mx-auto" />
                </div>
            )}

            {/* ── PDF Brochure ─────────────────────────────────── */}
            {product.pdf_url && (
                <div className="mt-12 border-t border-gray-100 pt-10">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText size={18} className="text-gray-500" />
                        <h2 className="text-lg font-serif text-gray-900">Informasi Produk</h2>
                    </div>
                    <Suspense fallback={
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-accent)] rounded-full animate-spin" />
                        </div>
                    }>
                        <PdfViewer url={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/${product.id}/pdf`} />
                    </Suspense>
                </div>
            )}

            {/* ── Testimonials Slider ───────────────────────────── */}
            {testimonials.length > 0 && (
                <div className="mt-16 border-t border-gray-100 pt-12">
                    <div className="text-center mb-10">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-2">What They Say</p>
                        <h2 className="text-2xl font-serif text-gray-900">Stories from Our Customers</h2>
                        <div className="h-px w-10 bg-[var(--color-accent)] mx-auto mt-4" />
                    </div>

                    <div className="relative">
                        {/* Cards — show 3 on desktop, 1 on mobile */}
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
                                        <div className="bg-[#faf8f5] rounded-sm p-7 border border-stone-100 flex flex-col gap-4 relative h-full">
                                            <Quote size={24} className="text-[var(--color-accent)]/15 absolute top-5 right-5" strokeWidth={1} />
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: t.rating }).map((_, s) => (
                                                    <Star key={s} size={12} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                                            <div className="border-t border-stone-200 pt-4">
                                                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                                {t.product && <p className="text-xs text-[var(--color-accent)] mt-0.5">{t.product}</p>}
                                                {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Prev / Next arrows */}
                        {testimonials.length > 3 && (
                            <>
                                <button
                                    onClick={() => setTestimIdx(i => Math.max(0, i - 1))}
                                    disabled={testimIdx === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setTestimIdx(i => Math.min(testimonials.length - 3, i + 1))}
                                    disabled={testimIdx >= testimonials.length - 3}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
