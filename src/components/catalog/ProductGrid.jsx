import React from 'react';
import ProductCard from '../ProductCard';
import { ProductCardSkeletonGrid } from '../Skeleton';

/**
 * ProductGrid — full-width grid produk.
 * Layout: 2 kolom (mobile) → 2 kolom (tablet) → 3 kolom (desktop).
 * Tujuan: tiap gambar tampil lebih besar.
 */
export default function ProductGrid({ products, loading }) {
    if (loading) {
        return <ProductCardSkeletonGrid count={6} />;
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-24 text-sm text-gray-400">
                Belum ada produk.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-6 gap-y-10 md:gap-y-12">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
}
