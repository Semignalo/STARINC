import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { ChevronDown } from 'lucide-react';
import ProductFilters from '../components/catalog/ProductFilters';
import ProductGrid from '../components/catalog/ProductGrid';

const INITIAL_FILTERS = {
    bodyScrub: false,
    faceCare: false,
    kids: false,
    bodyCare: false,
    hairCare: false,
    homeDecor: false,
};

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 1000000]);
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    useEffect(() => {
        productApi.getProducts({ per_page: 50 })
            .then(r => {
                const data = r.data || [];
                setProducts(data);
                setFilteredProducts(data);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...products];

        if (searchQuery) {
            result = result.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        result = result.filter(p => {
            const price = parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });
        if (!showOutOfStock) {
            result = result.filter(p => p.stock === undefined || p.stock === null || p.stock > 0);
        }
        const activeFilters = Object.keys(filters).filter(key => filters[key]);
        if (activeFilters.length > 0) {
            result = result.filter(p =>
                activeFilters.some(filterKey => {
                    const label = filterKey.replace(/([A-Z])/g, ' $1').toLowerCase();
                    return (p.category || '').toLowerCase().includes(label) ||
                           (p.title || '').toLowerCase().includes(label);
                })
            );
        }
        setFilteredProducts(result);
    }, [products, searchQuery, priceRange, filters, showOutOfStock]);

    const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

                {/* Header */}
                <header className="mb-10 md:mb-14">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Catalog</p>
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-medium text-gray-900 tracking-tight">All Products</h1>
                        <p className="text-sm text-gray-500 tabular-nums">{filteredProducts.length} products</p>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

                    {/* Sidebar Filters */}
                    <ProductFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        showOutOfStock={showOutOfStock}
                        onStockToggle={setShowOutOfStock}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        filters={filters}
                        onFilterToggle={toggleFilter}
                    />

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {/* Sort Bar */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                            <span className="text-xs text-gray-500">Showing {filteredProducts.length} of {products.length}</span>
                            <button className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 transition-colors">
                                <span>Featured</span>
                                <ChevronDown size={12} />
                            </button>
                        </div>

                        <ProductGrid products={filteredProducts} loading={loading} />
                    </div>

                </div>
            </div>
        </div>
    );
}
