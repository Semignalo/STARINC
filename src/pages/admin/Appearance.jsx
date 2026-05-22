import React, { useState, useEffect, useRef } from 'react';
import { adminSettingsApi } from '../../api/settingsApi';
import { useAppearance } from '../../contexts/AppearanceContext';
import { Save, Image, Type, Palette, Video, Upload, Loader2, Instagram } from 'lucide-react';
import Swal from 'sweetalert2';

// Normalize upload URL to always use the current dev/prod host
const STORAGE_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
function toAbsoluteUrl(url) {
    if (!url) return url;
    if (/^https?:\/\//.test(url)) return STORAGE_BASE + url.replace(/^https?:\/\/[^/]+/, '');
    if (url.startsWith('/storage/')) return STORAGE_BASE + url;
    return url;
}

const DEFAULT_CONFIG = {
    heroVideoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
    heroTitle: 'True Radiance',
    heroSubtitle: 'Discover the new Gold Standard for your skin.',
    logoUrl: '/logo.png',
    announcementText: 'New Collection 2026',
    primaryColor: '#1A1A1A',
    accentColor: '#C5A059',
    goldSerumVideoUrl: '',
    heroCtaUrl: '/products',
    goldSerumSubtitle: 'Face cleansing balm',
    goldSerumDescription1: 'This gentle cleansing balm deeply cleanses and removes even waterproof makeup without irritating or drying out eyes.',
    goldSerumDescription2: 'Fragrance-free, lightly scented with ginger and lemon essential oils.',
    feat1CtaUrl: '/products',
    secondFeaturedVideoUrl: '',
    secondFeaturedSubtitle: 'Our Concept',
    secondFeaturedDescription1: 'A focus on healthy, radiant skin.',
    secondFeaturedDescription2: 'Crafted with passion.',
    feat2CtaUrl: '/products',
    skinTypeTag: '',
    skinTypeTitle: 'Crafted for Every Skin Type',
    skinTypeDescription: '',
    skinTypeCtaText: 'Explore Products',
    skinTypeCtaUrl: '/products',
    skinTypeImageUrl: '',
    editorialTag: 'Our Signature Collection',
    editorialTitle: 'Crafted for Your Skin',
    editorialDescription: 'Formulated with the finest ingredients, our products are designed to nourish and revitalize your skin with every use.',
    editorialCtaText: 'Browse Collection',
    editorialCtaUrl: '/products',
    editorialImageUrl: '',
    // Instagram Feed (manual, 5 slot)
    instagramHandle: '',
    instagramPost1Image: '', instagramPost1Url: '',
    instagramPost2Image: '', instagramPost2Url: '',
    instagramPost3Image: '', instagramPost3Url: '',
    instagramPost4Image: '', instagramPost4Url: '',
    instagramPost5Image: '', instagramPost5Url: '',
};

/**
 * Komponen untuk upload video dengan progress bar.
 * Menggunakan adminSettingsApi.uploadFile (Laravel storage).
 */
function VideoUploadField({ label, fieldName, value, onChange, hint, driver }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await adminSettingsApi.uploadFile(
                file,
                'appearance',
                (percent) => setUploadProgress(percent),
                driver || null
            );
            onChange(fieldName, result.url);
        } catch (error) {
            console.error('Upload gagal:', error);
            Swal.fire({
                title: 'Upload Gagal!',
                text: error?.response?.data?.message || error.message || 'Terjadi kesalahan saat upload.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">{label}</label>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                    name={fieldName}
                    value={value || ''}
                    onChange={(e) => onChange(fieldName, e.target.value)}
                    className="flex-1 min-w-0 h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                    placeholder="Paste video URL atau upload di bawah"
                />
                <label className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0">
                    <Upload size={16} /> Upload Video
                    <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            </div>
            {isUploading && (
                <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={14} />
                    <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{uploadProgress}%</span>
                </div>
            )}
            {value && (
                <div className="mt-4 max-w-[150px] aspect-[3/4] bg-black rounded-lg overflow-hidden relative">
                    <video src={value} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

function ImageUploadField({ label, fieldName, value, onChange, hint, driver }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await adminSettingsApi.uploadFile(
                file,
                'appearance',
                (percent) => setUploadProgress(percent),
                driver || null
            );
            onChange(fieldName, result.url);
        } catch (error) {
            console.error('Upload gagal:', error);
            Swal.fire({
                title: 'Upload Gagal!',
                text: error?.response?.data?.message || error.message || 'Terjadi kesalahan saat upload.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">{label}</label>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                    name={fieldName}
                    value={value || ''}
                    onChange={(e) => onChange(fieldName, e.target.value)}
                    className="flex-1 min-w-0 h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                    placeholder="Paste image URL atau upload di bawah"
                />
                <label className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0">
                    <Upload size={16} /> Upload Gambar
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            </div>
            {isUploading && (
                <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={14} />
                    <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{uploadProgress}%</span>
                </div>
            )}
            {value && (
                <div className="mt-4 max-w-[280px] aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

export default function AdminAppearance() {
    const { settings, loading: contextLoading, refreshAppearance } = useAppearance();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadDriver, setUploadDriver] = useState(''); // '' = pakai default server
    const [lastSaved, setLastSaved] = useState(null);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const adminFetched = useRef(false);

    // Primary: fetch fresh data from admin API (direct from DB)
    useEffect(() => {
        adminSettingsApi.getAppearance()
            .then(data => {
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    setConfig(prev => ({ ...prev, ...data }));
                    adminFetched.current = true;
                }
            })
            .catch(err => console.error('Error fetching appearance settings:', err))
            .finally(() => setLoading(false));
    }, []);

    // Fallback: jika admin API belum/gagal merespons, pakai data dari AppearanceContext
    // (AppearanceContext punya localStorage cache → data live tetap tampil)
    useEffect(() => {
        if (!contextLoading && !adminFetched.current) {
            setConfig(prev => ({ ...prev, ...settings }));
            setLoading(false);
        }
    }, [contextLoading, settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    // Handler khusus untuk field yang diupdate dari komponen anak (VideoUploadField / ImageUploadField)
    // Normalizes storage URLs so preview images load correctly regardless of APP_URL setting
    const handleFieldChange = (fieldName, value) => {
        setConfig(prev => ({ ...prev, [fieldName]: toAbsoluteUrl(value) }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminSettingsApi.updateAppearance(config);
            // Invalidate cache and push new settings into AppearanceContext immediately
            // so changes (logo, colors, etc.) are visible without a hard page reload
            await refreshAppearance();
            setLastSaved(new Date());
            Swal.fire({
                title: 'Berhasil!',
                text: 'Pengaturan tampilan berhasil disimpan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            Swal.fire({
                title: 'Gagal!',
                text: error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
                icon: 'error',
                confirmButtonColor: '#111827',
                confirmButtonText: 'Tutup'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-400">Memuat pengaturan…</div>;

    return (
        <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Tampilan Web</h1>
                    <p className="text-xs text-gray-500 mt-1">Sesuaikan branding, hero, dan section homepage</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-[6px] text-sm font-medium transition disabled:opacity-50"
                >
                    <Save size={14} />
                    {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
            </div>

            {/* Storage Driver Toggle */}
            <div className="mb-4 px-3 py-2.5 bg-white border border-gray-200 rounded-[8px] flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700">Storage upload</p>
                    <p className="text-[11px] text-gray-500">
                        Pilih lokasi penyimpanan untuk upload berikutnya di halaman ini.
                    </p>
                </div>
                <div className="flex border border-gray-200 rounded-[6px] p-0.5 bg-gray-50 shrink-0">
                    {[
                        { key: '', label: 'Default' },
                        { key: 'local', label: 'Local' },
                        { key: 'cloudinary', label: 'Cloudinary' },
                    ].map(opt => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => setUploadDriver(opt.key)}
                            className={`inline-flex items-center px-2 h-6 rounded text-[11px] font-medium transition-colors ${
                                uploadDriver === opt.key
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                            title={opt.key === '' ? 'Pakai MEDIA_DEFAULT_DRIVER dari .env' : `Upload ke ${opt.label}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Kolom Kiri: Form Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hero Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Hero Section
                        </h3>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Type size={14} /> Headline Text
                                    </label>
                                    <input
                                        name="heroTitle"
                                        value={config.heroTitle}
                                        onChange={handleChange}
                                        placeholder="Contoh: True Radiance"
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Subtitle Text</label>
                                    <input
                                        name="heroSubtitle"
                                        value={config.heroSubtitle}
                                        onChange={handleChange}
                                        placeholder="Contoh: Discover the new..."
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Link Tombol Hero (URL tujuan)</label>
                                <input
                                    name="heroCtaUrl"
                                    value={config.heroCtaUrl || '/products'}
                                    onChange={handleChange}
                                    placeholder="Contoh: /products atau /product/5"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                                <p className="text-xs text-gray-400">Gunakan path internal seperti /products atau /product/5</p>
                            </div>

                            {/* Hero Video Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Video URL (Background)
                                </label>
                                <div className="space-y-3">
                                    <input
                                        name="heroVideoUrl"
                                        value={config.heroVideoUrl}
                                        onChange={handleChange}
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors text-gray-600"
                                        placeholder="Paste video URL atau upload di bawah..."
                                    />
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <HeroVideoUploader
                                            onChange={(url) => handleFieldChange('heroVideoUrl', url)}
                                            driver={uploadDriver}
                                        />
                                    </div>
                                    {config.heroVideoUrl && (
                                        <div className="mt-2 relative rounded-lg overflow-hidden bg-black aspect-video group">
                                            <video
                                                src={config.heroVideoUrl}
                                                className="w-full h-full object-cover opacity-80"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <p className="text-white/80 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                                    Current Background Preview
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">Pastikan link berakhiran .mp4 untuk hasil terbaik.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branding Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-gray-400" />
                            Branding & Logo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Image size={14} /> Logo
                                </label>
                                <ImageUploadField
                                    label=""
                                    fieldName="logoUrl"
                                    value={config.logoUrl}
                                    onChange={handleFieldChange}
                                driver={uploadDriver}
                                    hint="Gunakan file PNG dengan background transparan untuk hasil terbaik."
                                />
                                {config.logoUrl && (
                                    <div className="p-4 bg-gray-100/50 border border-dashed border-gray-300 rounded-lg flex justify-center h-24 items-center">
                                        <img src={config.logoUrl} alt="Preview" className="h-12 w-auto object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Accent Color (Gold)</label>
                                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={config.accentColor}
                                        onChange={handleChange}
                                        className="h-10 w-10 p-0 border-0 rounded cursor-pointer bg-transparent"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-700">{config.accentColor}</span>
                                        <span className="text-xs text-gray-400">Click color box to change</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Video & Text Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Featured Video & Text Section
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sub Judul</label>
                                <input
                                    name="goldSerumSubtitle"
                                    value={config.goldSerumSubtitle || ''}
                                    onChange={handleChange}
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 1</label>
                                <textarea
                                    name="goldSerumDescription1"
                                    value={config.goldSerumDescription1 || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 2</label>
                                <textarea
                                    name="goldSerumDescription2"
                                    value={config.goldSerumDescription2 || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Link Tombol CTA (URL tujuan)</label>
                                <input
                                    name="feat1CtaUrl"
                                    value={config.feat1CtaUrl || '/products'}
                                    onChange={handleChange}
                                    placeholder="Contoh: /products atau /product/5"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <VideoUploadField
                                label="Video URL (Format MP4/WebM Terkompres)"
                                fieldName="goldSerumVideoUrl"
                                value={config.goldSerumVideoUrl}
                                onChange={handleFieldChange}
                                driver={uploadDriver}
                                hint="Gunakan format video terkompres dengan framerate 30fps dan resolusi maksimal 1080p (vertikal 4:3) agar performa website tetap cepat."
                            />
                        </div>
                    </div>

                    {/* Second Featured Video Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Video size={20} className="text-gray-400" />
                            Second Featured Video Section (Video di kanan)
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sub Judul</label>
                                <input
                                    name="secondFeaturedSubtitle"
                                    value={config.secondFeaturedSubtitle || ''}
                                    onChange={handleChange}
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 1</label>
                                <textarea
                                    name="secondFeaturedDescription1"
                                    value={config.secondFeaturedDescription1 || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi Paragraf 2</label>
                                <textarea
                                    name="secondFeaturedDescription2"
                                    value={config.secondFeaturedDescription2 || ''}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Link Tombol CTA (URL tujuan)</label>
                                <input
                                    name="feat2CtaUrl"
                                    value={config.feat2CtaUrl || '/products'}
                                    onChange={handleChange}
                                    placeholder="Contoh: /products atau /product/5"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <VideoUploadField
                                label="Video URL (Format MP4/WebM Terkompres)"
                                fieldName="secondFeaturedVideoUrl"
                                value={config.secondFeaturedVideoUrl}
                                onChange={handleFieldChange}
                                driver={uploadDriver}
                                hint="Gunakan format video terkompres dengan framerate 30fps dan resolusi maksimal 1080p (vertikal 4:3)."
                            />
                        </div>
                    </div>

                    {/* Skin Type Split Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Image size={20} className="text-gray-400" />
                            Skin Type Section
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">Section split gambar + teks tentang "Crafted for Every Skin Type". Tampil setelah grid produk.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Label Kecil (opsional)</label>
                                <input
                                    name="skinTypeTag"
                                    value={config.skinTypeTag || ''}
                                    onChange={handleChange}
                                    placeholder="Contoh: FOR ALL SKIN TYPES"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Judul</label>
                                <input
                                    name="skinTypeTitle"
                                    value={config.skinTypeTitle || ''}
                                    onChange={handleChange}
                                    placeholder="Crafted for Every Skin Type"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea
                                    name="skinTypeDescription"
                                    value={config.skinTypeDescription || ''}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Teks Tombol</label>
                                    <input
                                        name="skinTypeCtaText"
                                        value={config.skinTypeCtaText || ''}
                                        onChange={handleChange}
                                        placeholder="Explore Products"
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Link Tombol (URL)</label>
                                    <input
                                        name="skinTypeCtaUrl"
                                        value={config.skinTypeCtaUrl || ''}
                                        onChange={handleChange}
                                        placeholder="/products"
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <ImageUploadField
                                label="Foto (sisi kiri)"
                                fieldName="skinTypeImageUrl"
                                value={config.skinTypeImageUrl}
                                onChange={handleFieldChange}
                                driver={uploadDriver}
                                hint="Rasio bebas, tapi portrait atau square lebih baik. Gambar akan mengisi penuh sisi kiri."
                            />
                        </div>
                    </div>

                    {/* Editorial Image & Text Section */}
                    <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <Image size={20} className="text-gray-400" />
                            Editorial Image & Text Section
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">Section di bawah produk — teks kiri, gambar full-bleed di kanan.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Tag Kecil (atas judul)</label>
                                    <input
                                        name="editorialTag"
                                        value={config.editorialTag || ''}
                                        onChange={handleChange}
                                        placeholder="Contoh: Our Signature Collection"
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Teks Tombol CTA</label>
                                    <input
                                        name="editorialCtaText"
                                        value={config.editorialCtaText || ''}
                                        onChange={handleChange}
                                        placeholder="Contoh: Browse Collection"
                                        className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Link Tombol CTA (URL tujuan)</label>
                                <input
                                    name="editorialCtaUrl"
                                    value={config.editorialCtaUrl || '/products'}
                                    onChange={handleChange}
                                    placeholder="Contoh: /products atau /product/5"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Judul Utama</label>
                                <input
                                    name="editorialTitle"
                                    value={config.editorialTitle || ''}
                                    onChange={handleChange}
                                    placeholder="Contoh: Crafted for Your Skin"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea
                                    name="editorialDescription"
                                    value={config.editorialDescription || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors resize-none"
                                />
                            </div>
                            <ImageUploadField
                                label="Gambar (JPG/PNG/WebP)"
                                fieldName="editorialImageUrl"
                                value={config.editorialImageUrl}
                                onChange={handleFieldChange}
                                driver={uploadDriver}
                                hint="Gambar akan ditampilkan full-bleed di sisi kanan section. Gunakan gambar landscape berkualitas tinggi."
                            />
                        </div>

                        {/* Instagram Feed Section */}
                        <div className="bg-white p-5 rounded-[8px] border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                <Instagram size={14} className="text-gray-400" />
                                Instagram Feed
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Section di paling bawah homepage. Isi handle + max 5 post (gambar + link).</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Instagram Handle</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                                        <input
                                            name="instagramHandle"
                                            value={config.instagramHandle || ''}
                                            onChange={handleChange}
                                            placeholder="starinc.official"
                                            className="w-full h-9 pl-7 pr-3 bg-white border border-gray-200 rounded-[6px] text-xs focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Kosongkan untuk sembunyikan section Instagram di homepage.</p>
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-start">
                                            <div>
                                                <ImageUploadField
                                                    label={`Post ${i} — Gambar`}
                                                    fieldName={`instagramPost${i}Image`}
                                                    value={config[`instagramPost${i}Image`]}
                                                    onChange={handleFieldChange}
                                                    driver={uploadDriver}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Post {i} — Link Instagram</label>
                                                <input
                                                    name={`instagramPost${i}Url`}
                                                    value={config[`instagramPost${i}Url`] || ''}
                                                    onChange={handleChange}
                                                    placeholder="https://www.instagram.com/p/XXXXXXXXX/"
                                                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-[6px] text-xs font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none transition-colors"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Kosongkan = redirect ke profil utama saat diklik.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Live Preview */}
                <div className="space-y-4 lg:sticky lg:top-6">

                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Live Preview</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                                {lastSaved ? `Saved ${lastSaved.toLocaleTimeString('id-ID')}` : 'Belum disimpan'}
                            </span>
                        </div>

                        {/* Mini Hero */}
                        <div className="relative aspect-video bg-gray-900 overflow-hidden">
                            {config.heroVideoUrl ? (
                                <video
                                    key={config.heroVideoUrl}
                                    src={config.heroVideoUrl}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                                    autoPlay muted loop playsInline
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 px-4 text-center">
                                <h3 className="text-white font-serif text-base leading-tight drop-shadow">
                                    {config.heroTitle || <span className="opacity-40 italic">Hero Title</span>}
                                </h3>
                                <p className="text-white/60 text-[11px] mt-1.5 max-w-[220px] leading-relaxed">
                                    {config.heroSubtitle || ''}
                                </p>
                            </div>
                        </div>

                        {/* Branding bar */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white">
                            {config.logoUrl ? (
                                <img src={config.logoUrl} alt="Logo" className="h-7 w-auto object-contain max-w-[80px]" />
                            ) : (
                                <span className="text-xs text-gray-400 italic">Logo</span>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-200 shadow-inner"
                                    style={{ backgroundColor: config.accentColor || '#C5A059' }}
                                />
                                <span className="text-[11px] text-gray-400 font-mono">{config.accentColor || '#C5A059'}</span>
                            </div>
                        </div>

                        {/* Featured section preview */}
                        {(config.goldSerumSubtitle || config.goldSerumDescription1) && (
                            <div className="px-4 py-3 border-b border-gray-100 bg-[#faf8f5]">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Featured Section #1</p>
                                <p className="text-sm font-serif text-gray-800 mb-1" style={{ color: config.accentColor || '#C5A059' }}>
                                    {config.goldSerumSubtitle}
                                </p>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                    {config.goldSerumDescription1}
                                </p>
                            </div>
                        )}

                        {/* Editorial section preview */}
                        {(config.editorialTitle || config.editorialTag) && (
                            <div className="px-4 py-3 border-b border-gray-100 bg-stone-50">
                                {config.editorialTag && (
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{config.editorialTag}</p>
                                )}
                                <p className="text-sm font-serif text-gray-900 mb-1">{config.editorialTitle}</p>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{config.editorialDescription}</p>
                                {config.editorialImageUrl && (
                                    <img
                                        src={config.editorialImageUrl}
                                        alt=""
                                        className="mt-2 w-full h-20 object-cover rounded"
                                    />
                                )}
                            </div>
                        )}

                        <div className="px-4 py-2.5 bg-blue-50">
                            <p className="text-[11px] text-blue-600 leading-relaxed">
                                Preview memperbarui otomatis saat form diubah. Klik <strong>Simpan</strong> agar aktif di website.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

/**
 * Sub-komponen upload untuk hero video (inline, karena layoutnya berbeda).
 */
function HeroVideoUploader({ onChange, driver }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const result = await adminSettingsApi.uploadFile(
                file,
                'appearance',
                (percent) => setUploadProgress(percent),
                driver || null
            );
            onChange(result.url);
        } catch (error) {
            console.error('Upload gagal:', error);
            Swal.fire({
                title: 'Upload Gagal!',
                text: error?.response?.data?.message || error.message || 'Terjadi kesalahan saat upload.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <>
            <label className="cursor-pointer bg-white border border-gray-200 hover:border-gray-300 text-gray-700 h-8 px-3 rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1.5">
                <Upload size={16} />
                Upload Video (MP4)
                <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>
            {isUploading && (
                <div className="flex-1 flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={16} />
                    <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(uploadProgress)}%</span>
                </div>
            )}
        </>
    );
}
