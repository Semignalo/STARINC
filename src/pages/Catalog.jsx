import React, { useState, useEffect, useMemo } from 'react';
import { productApi } from '../api/productApi';
import { ChevronDown, Search } from 'lucide-react';
import ProductGrid from '../components/catalog/ProductGrid';

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        productApi.getProducts({ per_page: 50 })
            .then(r => setProducts(r.data || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

                {/* Header */}
                <header className="mb-10 md:mb-14 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Catalog</p>
                    <h1 className="text-3xl md:text-4xl font-medium text-gray-900 tracking-tight">All Products</h1>
                </header>

                {/* Search + sort + count bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-8">
                    <div className="relative w-full sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk..."
                            aria-label="Cari produk"
                            className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors rounded-md"
                        />
                    </div>
                    <div className="flex items-center justify-between sm:gap-6">
                        <span className="text-xs text-gray-500 tabular-nums">{filteredProducts.length} products</span>
                        <button className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 transition-colors">
                            <span>Featured</span>
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                {/* Product Grid — full width, no sidebar */}
                <ProductGrid products={filteredProducts} loading={loading} />
            </div>
        </div>
    );
}
