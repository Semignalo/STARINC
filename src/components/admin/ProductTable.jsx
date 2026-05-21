import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import DataTable from './ui/Table';
import Badge from './ui/Badge';
import OptimizedImage from '../OptimizedImage';

/**
 * ProductTable — Linear-style tabel/grid produk dengan komponen baru.
 */
export default function ProductTable({ products, isGridView, onEdit, onDelete, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                Memuat produk…
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                Belum ada produk. Tambah produk pertamamu.
            </div>
        );
    }

    if (isGridView) {
        return (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                    const productImage = product.main_image_url || product.main_image || '/logo.png';
                    const discountLabel = product.discount_label || product.discount;
                    const originalPrice = product.original_price || product.originalPrice;
                    const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                    return (
                        <div
                            key={product.id}
                            className="bg-white border border-gray-200 rounded-[8px] overflow-hidden hover:border-gray-300 transition-colors"
                        >
                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                <OptimizedImage
                                    src={productImage}
                                    alt={product.title}
                                    width={300}
                                    height={300}
                                    wrapperClassName="absolute inset-0"
                                    onError={(e) => { e.target.src = '/logo.png'; }}
                                />
                                {discountLabel && (
                                    <span className="absolute top-2 left-2 bg-white border border-gray-200 text-[10px] font-medium px-1.5 py-0.5 rounded">
                                        {discountLabel}
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Badge color="danger">Habis</Badge>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                                <h3 className="text-sm font-medium text-gray-900 truncate mb-1.5">
                                    {product.title}
                                </h3>
                                <div className="flex items-end justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 tabular-nums">
                                            Rp{parseFloat(product.price).toLocaleString('id-ID')}
                                        </p>
                                        {originalPrice && (
                                            <p className="text-[11px] text-gray-400 line-through tabular-nums">
                                                Rp{parseFloat(originalPrice).toLocaleString('id-ID')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-0.5 shrink-0">
                                        <IconBtn icon={Edit2} onClick={() => onEdit(product)} label="Edit" />
                                        <IconBtn icon={Trash2} onClick={() => onDelete(product.id)} label="Hapus" danger />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <table className="w-full text-sm">
            <thead className="bg-gray-50/60 border-b border-gray-200">
                <tr>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Produk</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Kategori</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Harga</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Diskon</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Stok</th>
                    <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                    const productImage = product.main_image_url || product.main_image || '/logo.png';
                    const discountLabel = product.discount_label || product.discount;
                    const originalPrice = product.original_price || product.originalPrice;
                    const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;

                    return (
                        <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-50 shrink-0 relative">
                                        <OptimizedImage
                                            src={productImage}
                                            alt={product.title}
                                            width={36}
                                            height={36}
                                            blur={false}
                                            wrapperClassName="absolute inset-0"
                                            onError={(e) => { e.target.src = '/logo.png'; }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-900 truncate">{product.title}</span>
                                            {product.is_promo && <Badge color="accent">Promo</Badge>}
                                        </div>
                                        {product.description && (
                                            <p className="text-xs text-gray-400 truncate max-w-[280px]">{product.description}</p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{product.category}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                                <div className="font-medium text-gray-900">Rp{parseFloat(product.price).toLocaleString('id-ID')}</div>
                                {originalPrice && (
                                    <div className="text-xs text-gray-400 line-through">
                                        Rp{parseFloat(originalPrice).toLocaleString('id-ID')}
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-2.5">
                                {discountLabel ? <Badge color="danger">{discountLabel}</Badge> : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-2.5">
                                {product.stock === null || product.stock === undefined ? (
                                    <span className="text-gray-300">—</span>
                                ) : isOutOfStock ? (
                                    <Badge color="danger" dot>Habis</Badge>
                                ) : (
                                    <span className="text-gray-700 tabular-nums">{product.stock}</span>
                                )}
                            </td>
                            <td className="px-4 py-2.5">
                                <div className="flex justify-end gap-0.5">
                                    <IconBtn icon={Edit2} onClick={() => onEdit(product)} label="Edit" />
                                    <IconBtn icon={Trash2} onClick={() => onDelete(product.id)} label="Hapus" danger />
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function IconBtn({ icon: Icon, onClick, label, danger }) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 transition-colors ${
                danger ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
            <Icon size={14} strokeWidth={2} />
        </button>
    );
}
