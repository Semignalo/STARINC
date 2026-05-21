import React, { useState } from 'react';
import { isCloudinaryUrl, withTransforms, buildSrcSet, buildLqip, optimizedUrl } from '../lib/cloudinary';
import { cn } from '../lib/utils';

/**
 * <OptimizedImage> — wrapper image yang otomatis:
 *  - Apply Cloudinary transformations (f_auto, q_auto, dpr_auto) bila URL Cloudinary
 *  - Responsive srcset bila ukuran berbeda di breakpoint berbeda (prop `sizes`)
 *  - LQIP blur placeholder sambil gambar utama load (prop `blur`, default true)
 *  - native lazy loading + async decoding
 *  - Untuk above-the-fold image: gunakan prop `priority` (eager + preload)
 *
 * Props:
 *  - src: string URL (Cloudinary atau local)
 *  - alt: string
 *  - width, height: number (untuk aspect ratio + reservasi space, anti-CLS)
 *  - sizes: string CSS sizes (untuk srcset Cloudinary)
 *  - priority: boolean — true = eager load, no lazy
 *  - blur: boolean — tampilkan LQIP placeholder (default true untuk Cloudinary)
 *  - className: string — tambahan kelas untuk <img>
 *  - wrapperClassName: string — tambahan kelas untuk container <span> (untuk blur effect)
 *  - fit: 'cover' | 'contain' (default 'cover')
 */
export default function OptimizedImage({
    src,
    alt = '',
    width,
    height,
    sizes,
    priority = false,
    blur = true,
    className,
    wrapperClassName,
    fit = 'cover',
    onError,
    ...rest
}) {
    const [loaded, setLoaded] = useState(false);

    if (!src) {
        return (
            <span className={cn('block bg-gray-100', wrapperClassName)} style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }} />
        );
    }

    const cloudinary = isCloudinaryUrl(src);

    // URL utama: untuk Cloudinary, apply baseline optimizations
    const finalSrc = cloudinary
        ? optimizedUrl(src, width, 'f_auto,q_auto,c_limit,dpr_auto')
        : src;

    // SrcSet hanya untuk Cloudinary (local belum punya pipeline thumbnail)
    const srcSet = cloudinary ? buildSrcSet(src) : undefined;

    // LQIP placeholder
    const lqip = blur && cloudinary ? buildLqip(src) : null;

    const imgClass = cn(
        'w-full h-full transition-opacity duration-500',
        fit === 'cover' ? 'object-cover' : 'object-contain',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
    );

    return (
        <span
            className={cn('relative block overflow-hidden bg-gray-100', wrapperClassName)}
            style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
        >
            {lqip && !loaded && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
                    style={{ backgroundImage: `url(${lqip})` }}
                />
            )}
            <img
                src={finalSrc}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={onError}
                className={imgClass}
                {...rest}
            />
        </span>
    );
}

/**
 * Helper: dapatkan URL gambar yang dioptimasi untuk dipakai di tempat selain <img>
 * (e.g. background-image, og:image, share preview).
 */
export function getOptimizedUrl(src, width = 1200) {
    if (!src) return null;
    return isCloudinaryUrl(src) ? withTransforms(src, `f_auto,q_auto,c_limit,w_${width}`) : src;
}
