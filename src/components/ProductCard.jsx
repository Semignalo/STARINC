import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

/**
 * ProductCard - Menampilkan kartu produk di halaman katalog dan home.
 *
 * @param {number} id - ID produk
 * @param {string} title - Nama produk
 * @param {number|string} price - Harga produk
 * @param {number|string} originalPrice - Harga asli sebelum diskon
 * @param {string} discount - Label diskon (e.g. "20%")
 * @param {string} image - URL gambar (legacy)
 * @param {string} main_image - URL gambar utama (dari API)
 * @param {string} main_image_url - URL lengkap gambar utama (dari API)
 * @param {string} category - Kategori produk
 * @param {Object[]} variants - Array varian produk
 * @param {number} stock - Jumlah stok (0 = habis)
 */
export default function ProductCard({
    id,
    title,
    price,
    originalPrice,
    discount,
    image,
    main_image,
    main_image_url,
    category = "The Act",
    variants = [],
    stock
}) {
    // Parse harga numerik (backend mengembalikan decimal string, e.g. "150000.00")
    const parsePrice = (p) => parseFloat(String(p || '0').replace(/[^0-9.]/g, '')) || 0;
    const displayPrice = variants && variants.length > 0
        ? `Mulai dari Rp. ${Math.min(...variants.map(v => parsePrice(v.price))).toLocaleString('id-ID')}`
        : `Rp. ${parsePrice(price).toLocaleString('id-ID')}`;

    // Resolusi URL gambar: prefer accessor url, fallback ke raw path, lalu legacy image prop
    const imageUrl = main_image_url || main_image || image;

    // Deteksi stok habis (jika field stock tersedia dari API)
    const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;

    return (
        <Link
            to={`/product/${id}`}
            className={cn('group cursor-pointer block', isOutOfStock && 'pointer-events-none')}
            aria-label={`${title}${isOutOfStock ? ' - Stok Habis' : ''}`}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                {discount && !isOutOfStock && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wide z-10">
                        {discount} off
                    </div>
                )}

                {/* Overlay Stok Habis */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 uppercase tracking-widest">
                            Habis
                        </span>
                    </div>
                )}

                <img
                    src={imageUrl || '/logo.png'}
                    alt={title}
                    className={cn(
                        'w-full h-full object-cover object-center transition-transform duration-700',
                        !isOutOfStock && 'group-hover:scale-105',
                        isOutOfStock && 'grayscale opacity-70'
                    )}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                />

                {/* Slider indicator dots */}
                {!isOutOfStock && (
                    <div className="absolute bottom-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-black" />
                        <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm" />
                        <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm" />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex flex-col items-start text-left">
                <p className="text-xs text-gray-400 mb-1">{category}</p>
                <h3 className={cn(
                    'text-base font-normal text-gray-900 mb-2',
                    !isOutOfStock && 'group-hover:underline decoration-1 underline-offset-4',
                    isOutOfStock && 'text-gray-400'
                )}>
                    {title}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    {isOutOfStock ? (
                        <span className="text-sm text-gray-400 font-medium">Stok Habis</span>
                    ) : (
                        <>
                            <span className="text-lg font-medium text-gray-900">{displayPrice}</span>
                            {originalPrice && variants.length === 0 && (
                                <span className="text-sm text-gray-400 line-through decoration-gray-400">
                                    Rp. {originalPrice}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {discount && !isOutOfStock && (
                    <p className="text-red-600 text-sm mt-1">Sale</p>
                )}
            </div>
        </Link>
    );
}
