import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { ChevronDown } from 'lucide-react';
import ProductGrid from '../components/catalog/ProductGrid';

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productApi.getProducts({ per_page: 50 })
            .then(r => setProducts(r.data || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

                {/* Header */}
                <header className="mb-10 md:mb-14 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Catalog</p>
                    <h1 className="text-3xl md:text-4xl font-medium text-gray-900 tracking-tight">All Products</h1>
                </header>

                {/* Sort + count bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                    <span className="text-xs text-gray-500 tabular-nums">{products.length} products</span>
                    <button className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 transition-colors">
                        <span>Featured</span>
                        <ChevronDown size={12} />
                    </button>
                </div>

                {/* Product Grid — full width, no sidebar */}
                <ProductGrid products={products} loading={loading} />
            </div>
        </div>
    );
}
