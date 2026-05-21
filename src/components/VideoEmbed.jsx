import React, { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Ekstrak video ID dari URL YouTube/Vimeo.
 * Return: { provider: 'youtube'|'vimeo', id: string } atau null bila URL tidak dikenal.
 */
export function parseVideoUrl(url) {
    if (!url) return null;

    // YouTube — watch?v=, youtu.be/, /embed/, /shorts/
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { provider: 'youtube', id: yt[1] };

    // Vimeo — vimeo.com/12345 atau player.vimeo.com/video/12345
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { provider: 'vimeo', id: vm[1] };

    return null;
}

function buildEmbedUrl(provider, id) {
    if (provider === 'youtube') {
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (provider === 'vimeo') {
        return `https://player.vimeo.com/video/${id}?dnt=1`;
    }
    return null;
}

function buildThumbnailUrl(provider, id) {
    if (provider === 'youtube') {
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
    // Vimeo thumbnail butuh API call, skip — pakai placeholder
    return null;
}

/**
 * <VideoEmbed> — embed YouTube/Vimeo dengan lazy-load via IntersectionObserver +
 * click-to-play untuk save bandwidth (iframe baru dimount setelah user klik).
 *
 * Props:
 *  - url: string URL video YouTube atau Vimeo
 *  - title: string (untuk aria-label & a11y)
 *  - className: string
 *  - aspectRatio: '16/9' (default) | '9/16' | '4/3' | '1/1'
 */
export default function VideoEmbed({ url, title = 'Video produk', className, aspectRatio = '16/9' }) {
    const video = parseVideoUrl(url);
    const [playing, setPlaying] = useState(false);
    const [inView, setInView] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!video) {
        return null;
    }

    const embedUrl = buildEmbedUrl(video.provider, video.id);
    const thumbUrl = buildThumbnailUrl(video.provider, video.id);

    return (
        <div
            ref={containerRef}
            className={cn('relative bg-black overflow-hidden rounded-sm', className)}
            style={{ aspectRatio }}
        >
            {playing ? (
                <iframe
                    src={`${embedUrl}&autoplay=1`}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="group absolute inset-0 w-full h-full flex items-center justify-center"
                    aria-label={`Play ${title}`}
                >
                    {inView && thumbUrl && (
                        <img
                            src={thumbUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                    <span className="relative z-10 w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
                    </span>
                </button>
            )}
        </div>
    );
}
