import React, { useRef } from 'react';
import { X, Loader2, FileText, Trash2 } from 'lucide-react';
import ProductMediaUploader from './ProductMediaUploader';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800';

/**
 * ProductFormModal - Modal form untuk tambah / edit produk.
 *
 * @param {boolean} isOpen - Apakah modal terbuka
 * @param {boolean} isEditing - Mode edit (true) atau tambah baru (false)
 * @param {Object} formData - Data form produk
 * @param {Function} onFormChange - Callback perubahan input biasa (event)
 * @param {Function} onVariantChange - Callback perubahan varian (index, field, value)
 * @param {Function} onAddVariant - Callback tambah varian
 * @param {Function} onRemoveVariant - Callback hapus varian (index)
 * @param {Function} onMediaChange - Callback perubahan media (newMedia, newMainImage)
 * @param {Function} onFilesSelected - Callback saat file dipilih
 * @param {Function} onSubmit - Callback submit form
 * @param {Function} onClose - Callback tutup modal
 * @param {boolean} isUploading - Status uploading
 * @param {number} uploadProgress - Progress upload (0-100)
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
    uploadProgress
}) {
    if (!isOpen) return null;
    const pdfInputRef = useRef();

    const inputClass = "w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    title="Tutup"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-6 text-gray-800">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Product Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={onFormChange}
                            required
                            className={inputClass}
                            placeholder="e.g. Starinc Glow Set"
                        />
                    </div>

                    {/* Promo Toggle */}
                    <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <input
                            type="checkbox"
                            id="isPromo"
                            name="isPromo"
                            checked={formData.isPromo}
                            onChange={(e) => onFormChange({ target: { name: 'isPromo', value: e.target.checked } })}
                            className="w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]"
                        />
                        <label htmlFor="isPromo" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Tampilkan di Kolom Promo
                        </label>
                    </div>

                    {/* Price & Original Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={onFormChange}
                                required
                                className={inputClass}
                                placeholder="e.g. 1,250,000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Original Price <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={onFormChange}
                                className={inputClass}
                                placeholder="e.g. 1,500,000"
                            />
                        </div>
                    </div>

                    {/* Category & Discount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={onFormChange}
                                className={inputClass}
                                placeholder="e.g. The Act"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Label</label>
                            <input
                                type="text"
                                name="discount"
                                value={formData.discount}
                                onChange={onFormChange}
                                className={inputClass}
                                placeholder="e.g. 20%"
                            />
                        </div>
                    </div>

                    {/* Stock & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock <span className="text-gray-400 font-normal">(Kosongkan = unlimited)</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={onFormChange}
                                min="0"
                                className={inputClass}
                                placeholder="e.g. 100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Berat <span className="text-gray-400 font-normal">(gram, default 500g)</span>
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={onFormChange}
                                min="1"
                                className={inputClass}
                                placeholder="e.g. 500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Details</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onFormChange}
                            rows="4"
                            className={`${inputClass} resize-none`}
                            placeholder="Enter product description and details..."
                        />
                    </div>

                    {/* Variants */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Variants <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <button
                                type="button"
                                onClick={onAddVariant}
                                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                            >
                                + Add Variant
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Adding variants will allow users to choose options (e.g. Size 50ml, Size 100ml) with independent pricing.
                        </p>

                        {formData.variants.length > 0 && (
                            <div className="space-y-3">
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            placeholder="Variant Name (e.g. Besar 100ml)"
                                            value={variant.name}
                                            onChange={(e) => onVariantChange(index, 'name', e.target.value)}
                                            required
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Price (Rp)"
                                            value={variant.price}
                                            onChange={(e) => onVariantChange(index, 'price', e.target.value)}
                                            required
                                            className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onRemoveVariant(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus varian"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Media Uploader */}
                    <ProductMediaUploader
                        media={formData.media}
                        mainImage={formData.image}
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        onMediaChange={onMediaChange}
                        onFilesSelected={onFilesSelected}
                    />

                    {/* PDF Brochure */}
                    <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            PDF Penjelasan Produk <span className="text-gray-400 font-normal">(Opsional)</span>
                        </p>
                        {formData.pdfUrl ? (
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                <FileText size={18} className="text-blue-500 shrink-0" />
                                <a href={formData.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline flex-1 truncate">
                                    Lihat PDF saat ini
                                </a>
                                {onPdfRemove && (
                                    <button type="button" onClick={onPdfRemove} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        ) : formData.pdfFile ? (
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                <FileText size={18} className="text-amber-500 shrink-0" />
                                <span className="text-sm text-gray-700 flex-1 truncate">{formData.pdfFile.name}</span>
                                <button type="button" onClick={() => onPdfSelected(null)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => pdfInputRef.current?.click()}
                                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                                + Upload PDF
                            </button>
                        )}
                        <input
                            ref={pdfInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e => onPdfSelected && onPdfSelected(e.target.files[0] || null)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-[var(--color-accent)] text-white font-bold py-3 rounded-lg hover:bg-[var(--color-accent-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            disabled={isUploading}
                        >
                            {isUploading && <Loader2 size={18} className="animate-spin" />}
                            {isEditing ? 'Update Product' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
