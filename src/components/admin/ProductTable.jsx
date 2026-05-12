import React from 'react';
import { Edit2, Trash2, LayoutGrid, List } from 'lucide-react';

/**
 * ProductTable - Komponen untuk menampilkan daftar produk dalam mode tabel atau grid.
 *
 * @param {Object[]} products - Array data produk dari API
 * @param {boolean} isGridView - Mode tampilan (true = grid, false = tabel)
 * @param {Function} onEdit - Callback saat tombol edit diklik
 * @param {Function} onDelete - Callback saat tombol hapus diklik
 * @param {boolean} loading - Status loading
 */
export default function ProductTable({ products, isGridView, onEdit, onDelete, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Loading products...
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                No products found. Add your first one!
            </div>
        );
    }

    if (isGridView) {
        return (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                    const productImage = product.main_image_url || product.main_image || product.image || '/logo.png';
                    const discountLabel = product.discount_label || product.discount;
                    const originalPrice = product.original_price || product.originalPrice;

                    return (
                        <div key={product.id} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                <img
                                    src={productImage}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    onError={(e) => { e.target.src = '/logo.png'; }}
                                />
                                {discountLabel && (
                                    <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                                        {discountLabel}
                                    </div>
                                )}
                                {product.stock !== undefined && product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                            Habis
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                <h3 className="font-bold text-gray-900 mb-2 truncate">
                                    {product.title}
                                    {product.is_promo && (
                                        <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                                            Promo
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-[var(--color-primary)]">
                                            Rp. {parseFloat(product.price).toLocaleString('id-ID')}
                                        </div>
                                        {originalPrice && (
                                            <div className="text-xs text-gray-400 line-through">
                                                Rp. {parseFloat(originalPrice).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Edit produk"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(product.id)}
                                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Hapus produk"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // List/Table view
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Discount</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                        const productImage = product.main_image_url || product.main_image || product.image || '/logo.png';
                        const discountLabel = product.discount_label || product.discount;
                        const originalPrice = product.original_price || product.originalPrice;
                        const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img
                                                src={productImage}
                                                alt={product.title}
                                                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                loading="lazy"
                                                onError={(e) => { e.target.src = '/logo.png'; }}
                                            />
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-[8px] font-bold">HABIS</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {product.title}
                                            {product.is_promo && (
                                                <span className="ml-2 text-[10px] bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                                                    Promo
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{product.category}</td>
                                <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                                    {product.description || '-'}
                                </td>
                                <td className="p-4 font-medium">
                                    <div>Rp. {parseFloat(product.price).toLocaleString('id-ID')}</div>
                                    {originalPrice && (
                                        <div className="text-xs text-gray-400 line-through">
                                            Rp. {parseFloat(originalPrice).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {discountLabel ? (
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                            {discountLabel}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {product.stock !== undefined ? (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                            {isOutOfStock ? 'Habis' : product.stock}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit produk"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(product.id)}
                                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus produk"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
