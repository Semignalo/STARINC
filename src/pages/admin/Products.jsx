import React, { useState, useEffect, useMemo } from 'react';
import { adminProductApi, productApi } from '../../api/productApi';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductTable from '../../components/admin/ProductTable';
import ProductFormModal from '../../components/admin/ProductFormModal';
import Button from '../../components/admin/ui/Button';
import Input from '../../components/admin/ui/Input';
import { cn } from '../../lib/utils';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800';

const EMPTY_FORM = {
    title: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: 'The Act',
    description: '',
    videoUrl: '',
    uploadDriver: '', // '' = pakai default server, 'local' atau 'cloudinary' = override
    image: DEFAULT_IMAGE,
    media: [],
    variants: [],
    isPromo: false,
    stock: '',
    weight: '',
    pdfUrl: null,
    pdfFile: null,
    removePdf: false,
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isGridView, setIsGridView] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [mediaObjects, setMediaObjects] = useState([]); // full media objects with IDs
    const [deletedMediaIds, setDeletedMediaIds] = useState([]);
    const [mainImageFilePath, setMainImageFilePath] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Derived: unique categories from products
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return cats;
    }, [products]);

    // Filtered products based on search and category
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = !searchQuery ||
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
            return matchSearch && matchCategory;
        });
    }, [products, searchQuery, categoryFilter]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productApi.getProducts();
            setProducts(data.data || data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData(EMPTY_FORM);
        setFilesToUpload([]);
        setMediaObjects([]);
        setDeletedMediaIds([]);
        setMainImageFilePath(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setEditId(product.id);

        const initialMedia = product.media && product.media.length > 0
            ? product.media.map(m => m.url || (m.file_path ? `/storage/${m.file_path}` : null)).filter(Boolean)
            : (product.main_image_url || product.main_image || (product.image && product.image !== DEFAULT_IMAGE)
                ? [product.main_image_url || product.main_image || product.image]
                : []);

        setFormData({
            title: product.title || '',
            price: product.price ? parseFloat(product.price).toString() : '',
            originalPrice: product.original_price || product.originalPrice
                ? parseFloat(product.original_price || product.originalPrice).toString()
                : '',
            discount: product.discount_label || product.discount || '',
            category: product.category || 'The Act',
            description: product.description || '',
            videoUrl: product.video_url || '',
            uploadDriver: '',
            image: product.main_image_url || product.main_image || product.image || '',
            media: initialMedia,
            variants: product.variants
                ? product.variants.map(v => ({ name: v.name, price: v.price }))
                : [],
            isPromo: product.is_promo || product.isPromo || false,
            stock: product.stock !== null && product.stock !== undefined ? String(product.stock) : '',
            weight: product.weight !== null && product.weight !== undefined ? String(product.weight) : '',
            pdfUrl: product.pdf_url || null,
            pdfFile: null,
            removePdf: false,
        });
        setMediaObjects(product.media || []);
        setDeletedMediaIds([]);
        setMainImageFilePath(null);
        setFilesToUpload([]);
        setIsModalOpen(true);
    };

    const handleMediaChange = (newMedia, newMainImage) => {
        // Detect removed existing media
        const removedIds = mediaObjects
            .filter(obj => obj.url && !newMedia.includes(obj.url))
            .map(obj => obj.id)
            .filter(id => id && !deletedMediaIds.includes(id));
        if (removedIds.length > 0) {
            setDeletedMediaIds(prev => [...prev, ...removedIds]);
        }

        // Resolve main image file_path immediately (avoids URL mismatch at submit time)
        const mainObj = mediaObjects.find(obj => obj.url === newMainImage);
        if (mainObj?.file_path) {
            setMainImageFilePath(mainObj.file_path);
        }

        setFormData(prev => ({ ...prev, media: newMedia, image: newMainImage }));
    };

    const handleFilesSelected = (files) => {
        setFilesToUpload(prev => [...prev, ...files]);
    };

    const handlePdfSelected = (file) => {
        setFormData(prev => ({ ...prev, pdfFile: file, removePdf: false }));
    };

    const handlePdfRemove = () => {
        setFormData(prev => ({ ...prev, pdfFile: null, pdfUrl: null, removePdf: true }));
    };

    const handleAddVariant = () => {
        setFormData(prev => ({ ...prev, variants: [...prev.variants, { name: '', price: '' }] }));
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[index][field] = value;
            return { ...prev, variants: newVariants };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsUploading(true);
            const apiData = {
                title: formData.title,
                price: parseFloat(String(formData.price).replace(/,/g, '')),
                original_price: formData.originalPrice
                    ? parseFloat(String(formData.originalPrice).replace(/,/g, ''))
                    : null,
                discount_label: formData.discount,
                category: formData.category,
                description: formData.description,
                video_url: formData.videoUrl || null,
                is_promo: formData.isPromo,
                stock: formData.stock !== '' ? parseInt(formData.stock, 10) : null,
                weight: formData.weight !== '' ? parseInt(formData.weight, 10) : null,
                variants: formData.variants.map(v => ({
                    name: v.name,
                    price: parseFloat(String(v.price).replace(/,/g, ''))
                }))
            };

            if (mainImageFilePath) {
                apiData.main_image = mainImageFilePath;
            }

            let savedProduct;
            if (isEditing && editId) {
                savedProduct = await adminProductApi.updateProduct(editId, apiData);
            } else {
                savedProduct = await adminProductApi.createProduct(apiData);
            }

            const productId = savedProduct.product?.id || editId;

            // Delete removed media
            for (const mediaId of deletedMediaIds) {
                await adminProductApi.deleteMedia(productId, mediaId);
            }
            setDeletedMediaIds([]);

            // Sync media sort order (reorder)
            const existingUrls = formData.media.filter(url => !url.startsWith('blob:'));
            const reorderPayload = existingUrls
                .map((url, idx) => {
                    const obj = mediaObjects.find(o => o.url === url);
                    return obj ? { id: obj.id, sort_order: idx } : null;
                })
                .filter(Boolean);
            if (reorderPayload.length > 1 && productId) {
                await adminProductApi.reorderMedia(productId, reorderPayload);
            }

            if (filesToUpload.length > 0 && productId) {
                setUploadProgress(50);
                await adminProductApi.uploadMedia(productId, filesToUpload, formData.uploadDriver || null);
                setFilesToUpload([]);
            }

            if (productId && formData.removePdf) {
                await adminProductApi.removePdf(productId);
            } else if (productId && formData.pdfFile) {
                await adminProductApi.uploadPdf(productId, formData.pdfFile);
            }

            Swal.fire({
                title: 'Berhasil!',
                text: isEditing ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.',
                icon: 'success',
                confirmButtonColor: '#111827',
                timer: 2000,
                showConfirmButton: false
            });

            setIsModalOpen(false);
            setUploadProgress(0);
            setIsUploading(false);
            fetchProducts();
        } catch (error) {
            setIsUploading(false);
            console.error("Error saving product: ", error);
            Swal.fire({
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan produk.',
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Produk?',
            text: "Anda tidak dapat mengembalikan produk yang sudah dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#111827',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await adminProductApi.deleteProduct(id);
                fetchProducts();
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'Produk berhasil dihapus.',
                    icon: 'success',
                    confirmButtonColor: '#111827',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menghapus produk.',
                    icon: 'error',
                    confirmButtonColor: '#111827'
                });
            }
        }
    };

    const dummyData = [
        { title: "Starinc Glow Set", price: "1,250,000", originalPrice: "1,500,000", discount: "20%", category: "The Act", description: "A complete set for glowing skin." },
        { title: "Ultimate Hydration", price: "980,000", originalPrice: "1,200,000", discount: "18%", category: "The Act", description: "Deep hydration for dry skin." },
        { title: "Gold Serum Series", price: "450,000", originalPrice: "550,000", discount: "10%", category: "The Act", description: "Luxury gold serum for radiance." },
    ];

    const handleAddDummyData = async () => {
        const result = await Swal.fire({
            title: 'Tambahkan Data Dummy?',
            text: "Ini akan menambahkan beberapa produk contoh ke database via API.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111827',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, tambahkan!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const batchPromises = dummyData.map(product =>
                    adminProductApi.createProduct({
                        title: product.title,
                        price: parseFloat(String(product.price).replace(/,/g, '')),
                        original_price: parseFloat(String(product.originalPrice).replace(/,/g, '')),
                        discount_label: product.discount,
                        category: product.category,
                        description: product.description,
                        is_promo: false
                    })
                );
                await Promise.all(batchPromises);
                fetchProducts();
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data produk dummy berhasil ditambahkan.',
                    icon: 'success',
                    confirmButtonColor: '#111827'
                });
            } catch (error) {
                console.error("Error adding dummy products: ", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat menambah data dummy.',
                    icon: 'error',
                    confirmButtonColor: '#111827'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Produk</h1>
                    <p className="text-xs text-gray-500 mt-1">Kelola katalog produk STARINC</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-gray-200 rounded-[6px] p-0.5 bg-white">
                        <button
                            onClick={() => setIsGridView(false)}
                            className={cn('w-7 h-7 rounded flex items-center justify-center transition-colors',
                                !isGridView ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700')}
                            title="List"
                        >
                            <List size={14} />
                        </button>
                        <button
                            onClick={() => setIsGridView(true)}
                            className={cn('w-7 h-7 rounded flex items-center justify-center transition-colors',
                                isGridView ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700')}
                            title="Grid"
                        >
                            <LayoutGrid size={14} />
                        </button>
                    </div>
                    <Button variant="primary" size="md" icon={Plus} onClick={openAddModal}>
                        Tambah Produk
                    </Button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 max-w-md">
                    <Input
                        icon={Search}
                        type="text"
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {categories.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                        <button
                            onClick={() => setCategoryFilter('all')}
                            className={cn('px-2.5 h-9 inline-flex items-center rounded-[6px] text-xs font-medium transition-colors border',
                                categoryFilter === 'all'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
                        >
                            Semua ({products.length})
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn('px-2.5 h-9 inline-flex items-center rounded-[6px] text-xs font-medium transition-colors border',
                                    categoryFilter === cat
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}
                            >
                                {cat} ({products.filter(p => p.category === cat).length})
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product List */}
            <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
                <ProductTable
                    products={filteredProducts}
                    isGridView={isGridView}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Form Modal */}
            <ProductFormModal
                isOpen={isModalOpen}
                isEditing={isEditing}
                formData={formData}
                onFormChange={handleInputChange}
                onVariantChange={handleVariantChange}
                onAddVariant={handleAddVariant}
                onRemoveVariant={handleRemoveVariant}
                onMediaChange={handleMediaChange}
                onFilesSelected={handleFilesSelected}
                onPdfSelected={handlePdfSelected}
                onPdfRemove={handlePdfRemove}
                onSubmit={handleSubmit}
                onClose={() => setIsModalOpen(false)}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
            />
        </div>
    );
}
