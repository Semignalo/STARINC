import React, { useRef } from 'react';
import { Loader2, FileText, Trash2, Plus, X, Cloud, Server, Youtube } from 'lucide-react';
import ProductMediaUploader from './ProductMediaUploader';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input, { Textarea, Select } from './ui/Input';
import { parseVideoUrl } from '../VideoEmbed';
import { cn } from '../../lib/utils';

/**
 * ProductFormModal — Linear-style monochrome.
 * Tambahan fitur: field video_url + toggle storage driver (Local | Cloudinary).
 */
export default function ProductFormModal({
    isOpen,
    isEditing,
    formData,
    onFormChange,
    onVariantChange,
    onAddVariant,
    onRemoveVariant,
    onMediaChange,
    onFilesSelected,
    onPdfSelected,
    onPdfRemove,
    onSubmit,
    onClose,
    isUploading,
    uploadProgress,
}) {
    const pdfInputRef = useRef();

    if (!isOpen) return null;

    const setField = (name, value) => onFormChange({ target: { name, value } });
    const videoMeta = formData.videoUrl ? parseVideoUrl(formData.videoUrl) : null;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
            size="xl"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isUploading}>Batal</Button>
                    <Button variant="primary" onClick={onSubmit} loading={isUploading} icon={!isUploading ? Plus : null}>
                        {isEditing ? 'Update Produk' : 'Simpan Produk'}
                    </Button>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Identity */}
                <Section title="Identitas Produk">
                    <Input
                        label="Nama Produk"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={onFormChange}
                        required
                        placeholder="contoh: Starinc Glow Set"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Kategori"
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={onFormChange}
                            placeholder="The Act"
                        />
                        <Input
                            label="Label Diskon (opsional)"
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={onFormChange}
                            placeholder="20%"
                        />
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={formData.isPromo}
                            onChange={(e) => setField('isPromo', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-1 focus:ring-[var(--admin-accent)]"
                        />
                        <span className="text-xs text-gray-700">Tampilkan di kolom Promo (homepage)</span>
                    </label>
                </Section>

                {/* Pricing & Inventory */}
                <Section title="Harga & Inventory">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Harga (Rp)"
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={onFormChange}
                            required
                            placeholder="1250000"
                            prefix="Rp"
                        />
                        <Input
                            label="Harga Asli (opsional)"
                            type="text"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={onFormChange}
                            placeholder="1500000"
                            prefix="Rp"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Stok"
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={onFormChange}
                            min="0"
                            placeholder="kosong = unlimited"
                            hint="Kosongkan untuk stok tak terbatas"
                        />
                        <Input
                            label="Berat (gram)"
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={onFormChange}
                            min="1"
                            placeholder="500"
                            hint="Default 500g jika kosong"
                        />
                    </div>
                </Section>

                {/* Description */}
                <Section title="Deskripsi">
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={onFormChange}
                        rows={4}
                        placeholder="Tulis deskripsi produk..."
                    />
                </Section>

                {/* Ingredients */}
                <Section title="Ingredients (opsional)">
                    <Textarea
                        name="ingredients"
                        value={formData.ingredients}
                        onChange={onFormChange}
                        rows={4}
                        placeholder="Pisahkan dengan koma atau baris baru. Contoh: Vitamin C, Niacinamide, Vitamin E..."
                    />
                </Section>

                {/* Packaging */}
                <Section title="Packaging & Recycling (opsional)">
                    <Textarea
                        name="packaging"
                        value={formData.packaging}
                        onChange={onFormChange}
                        rows={3}
                        placeholder="Contoh: Kemasan kaca daur ulang. 100% recyclable. Cara membuang..."
                    />
                </Section>

                {/* Variants */}
                <Section
                    title="Varian Produk (opsional)"
                    action={
                        <Button type="button" variant="secondary" size="xs" icon={Plus} onClick={onAddVariant}>
                            Tambah Varian
                        </Button>
                    }
                >
                    <p className="text-xs text-gray-500 -mt-2">
                        Tambahkan varian agar user bisa pilih opsi (mis. 50ml / 100ml) dengan harga sendiri.
                    </p>
                    {formData.variants.length > 0 ? (
                        <div className="space-y-2">
                            {formData.variants.map((v, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Nama varian"
                                            value={v.name}
                                            onChange={(e) => onVariantChange(idx, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Input
                                            placeholder="Harga"
                                            prefix="Rp"
                                            value={v.price}
                                            onChange={(e) => onVariantChange(idx, 'price', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            placeholder="Stok"
                                            min="0"
                                            value={v.stock ?? ''}
                                            onChange={(e) => onVariantChange(idx, 'stock', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveVariant(idx)}
                                        className="w-9 h-9 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center mt-0"
                                        aria-label="Hapus varian"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <p className="text-[11px] text-gray-400">Stok varian kosong = ikut stok produk utama.</p>
                        </div>
                    ) : null}
                </Section>

                {/* Media + Storage driver */}
                <Section
                    title="Foto Produk"
                    action={
                        <StorageDriverToggle
                            value={formData.uploadDriver}
                            onChange={(v) => setField('uploadDriver', v)}
                        />
                    }
                >
                    <ProductMediaUploader
                        media={formData.media}
                        mainImage={formData.image}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        onMediaChange={onMediaChange}
                        onFilesSelected={onFilesSelected}
                    />
                </Section>

                {/* Video URL (YouTube/Vimeo) */}
                <Section title="Video Demo (opsional)">
                    <Input
                        icon={Youtube}
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={onFormChange}
                        placeholder="https://youtube.com/watch?v=... atau https://vimeo.com/..."
                        hint={
                            formData.videoUrl
                                ? videoMeta
                                    ? `✓ Terdeteksi: ${videoMeta.provider} (id: ${videoMeta.id})`
                                    : 'URL tidak dikenal — pakai link YouTube atau Vimeo'
                                : 'Tempel URL YouTube/Vimeo. Akan tampil sebagai video player lazy-load.'
                        }
                    />
                </Section>

                {/* PDF Brochure */}
                <Section title="PDF Brosur (opsional)">
                    {formData.pdfUrl ? (
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2">
                            <FileText size={14} className="text-gray-400 shrink-0" />
                            <a href={formData.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-700 underline flex-1 truncate">
                                Lihat PDF saat ini
                            </a>
                            <button type="button" onClick={onPdfRemove} className="text-gray-400 hover:text-red-600" aria-label="Hapus PDF">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ) : formData.pdfFile ? (
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2">
                            <FileText size={14} className="text-amber-500 shrink-0" />
                            <span className="text-xs text-gray-700 flex-1 truncate">{formData.pdfFile.name}</span>
                            <button type="button" onClick={() => onPdfSelected(null)} className="text-gray-400 hover:text-red-600" aria-label="Batal">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={FileText}
                            onClick={() => pdfInputRef.current?.click()}
                            fullWidth
                        >
                            Upload PDF
                        </Button>
                    )}
                    <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => onPdfSelected?.(e.target.files[0] || null)}
                    />
                </Section>
            </form>
        </Modal>
    );
}

function Section({ title, action, children }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{title}</h4>
                {action}
            </div>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function StorageDriverToggle({ value, onChange }) {
    const opts = [
        { key: '',          label: 'Default',    icon: null,   tip: 'Pakai driver default server' },
        { key: 'local',     label: 'Local',      icon: Server, tip: 'Simpan di server STARINC' },
        { key: 'cloudinary', label: 'Cloudinary', icon: Cloud, tip: 'Upload ke Cloudinary CDN' },
    ];
    return (
        <div className="flex border border-gray-200 rounded-[6px] p-0.5 bg-gray-50">
            {opts.map((o) => (
                <button
                    key={o.key}
                    type="button"
                    onClick={() => onChange(o.key)}
                    title={o.tip}
                    className={cn(
                        'inline-flex items-center gap-1 px-2 h-6 rounded text-[11px] font-medium transition-colors',
                        value === o.key
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-900',
                    )}
                >
                    {o.icon && <o.icon size={11} />}
                    {o.label}
                </button>
            ))}
        </div>
    );
}
