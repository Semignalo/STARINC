import React, { useState } from 'react';
import { Upload, X, GripHorizontal } from 'lucide-react';

/**
 * ProductMediaUploader - Komponen untuk upload dan manajemen media produk.
 *
 * @param {string[]} media - Array URL media yang sudah ada
 * @param {string} mainImage - URL gambar utama yang sedang dipilih
 * @param {boolean} isUploading - Status uploading
 * @param {number} uploadProgress - Progress upload (0-100)
 * @param {Function} onMediaChange - Callback saat media berubah (newMedia, newMainImage)
 * @param {Function} onFilesSelected - Callback saat file dipilih untuk upload
 */
export default function ProductMediaUploader({
    media = [],
    mainImage,
    isUploading,
    uploadProgress,
    onMediaChange,
    onFilesSelected
}) {
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        onFilesSelected(files);

        const previewUrls = files.map(file => URL.createObjectURL(file));
        const newMedia = [...media, ...previewUrls];
        const newMain = (!mainImage || mainImage.includes('unsplash')) && newMedia.length > 0
            ? newMedia[0]
            : mainImage;

        onMediaChange(newMedia, newMain);
    };

    const removeMedia = (index) => {
        const newMedia = media.filter((_, i) => i !== index);
        let newMain = mainImage;
        if (media[index] === mainImage) {
            newMain = newMedia.length > 0 ? newMedia[0] : '';
        }
        onMediaChange(newMedia, newMain);
    };

    const setAsMain = (url) => {
        onMediaChange(media, url);
    };

    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

        const newMedia = [...media];
        const draggedItem = newMedia[draggedItemIndex];
        newMedia.splice(draggedItemIndex, 1);
        newMedia.splice(targetIndex, 0, draggedItem);

        setDraggedItemIndex(null);
        onMediaChange(newMedia, mainImage);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Media (Images &amp; Videos)
            </label>

            {/* Progress Bar */}
            {isUploading && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading media...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* File Upload Area */}
            <div className="flex items-center gap-2 mb-4">
                <label className="flex-1 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={24} />
                        <span className="text-sm font-medium">Click to upload images or videos</span>
                        <span className="text-xs text-gray-400">Multiple files supported</span>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            </div>

            {/* Media Grid */}
            {media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media.map((url, idx) => (
                        <div
                            key={url + idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${
                                mainImage === url
                                    ? 'border-[var(--color-accent)]'
                                    : 'border-gray-200'
                            } ${
                                draggedItemIndex === idx
                                    ? 'opacity-40 scale-95 border-dashed border-gray-400'
                                    : 'opacity-100 hover:scale-[1.02]'
                            }`}
                        >
                            {/* Grip Icon */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                                    <GripHorizontal size={24} />
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeMedia(idx); }}
                                className="absolute top-1 right-1 z-20 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                title="Hapus"
                            >
                                <X size={14} />
                            </button>

                            {/* Set as Main Button */}
                            {mainImage !== url && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsMain(url); }}
                                    className="absolute bottom-1 left-1 right-1 z-20 bg-white/95 text-xs py-1.5 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity font-medium shadow-sm hover:bg-gray-50 text-gray-800"
                                >
                                    Set as Main
                                </button>
                            )}

                            {/* Main Image Label */}
                            {mainImage === url && (
                                <div className="absolute top-1 left-1 z-20 bg-[var(--color-accent)] text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-sm">
                                    MAIN
                                </div>
                            )}

                            {/* Media Content */}
                            {url.includes('.mp4') || url.includes('.webm') || url.includes('video') ? (
                                <video
                                    src={url}
                                    className="w-full h-full object-cover pointer-events-none"
                                    controls={false}
                                    muted
                                />
                            ) : (
                                <img
                                    src={url}
                                    alt="Product media"
                                    className="w-full h-full object-cover pointer-events-none bg-gray-50"
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
