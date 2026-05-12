import React from 'react';
import ProductCard from '../ProductCard';
import { ProductCardSkeletonGrid } from '../Skeleton';

/**
 * ProductGrid - Grid produk untuk halaman Catalog.
 *
 * @param {Object[]} products - Array produk yang sudah difilter
 * @param {boolean} loading - Status loading
 */
export default function ProductGrid({ products, loading }) {
    if (loading) {
        return <ProductCardSkeletonGrid count={8} />;
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
}
