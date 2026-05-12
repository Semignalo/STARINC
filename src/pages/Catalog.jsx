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
    homeDecor: false
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
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productApi.getProducts({ per_page: 50 });
                const productsData = response.data || [];
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Logika filter produk
    useEffect(() => {
        let result = [...products];

        // 1. Filter berdasarkan nama (search query)
        if (searchQuery) {
            result = result.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter berdasarkan harga
        result = result.filter(product => {
            const price = parseFloat(String(product.price || '0').replace(/[^0-9.]/g, '')) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // 3. Filter stok habis
        if (!showOutOfStock) {
            result = result.filter(product =>
                product.stock === undefined || product.stock === null || product.stock > 0
            );
        }

        // 4. Filter berdasarkan kategori/tipe produk
        const activeFilters = Object.keys(filters).filter(key => filters[key]);
        if (activeFilters.length > 0) {
            result = result.filter(product =>
                activeFilters.some(filterKey => {
                    const label = filterKey.replace(/([A-Z])/g, ' $1').toLowerCase();
                    const productCategory = (product.category || '').toLowerCase();
                    const productTitle = (product.title || '').toLowerCase();
                    return productCategory.includes(label) || productTitle.includes(label);
                })
            );
        }

        setFilteredProducts(result);
    }, [products, searchQuery, priceRange, filters, showOutOfStock]);

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <span className="bg-[#FFE066] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest mb-2 inline-block">
                        Best Sellers
                    </span>
                    <h1 className="text-3xl md:text-4xl font-serif text-[var(--color-primary)] font-medium mb-2">
                        All products
                    </h1>
                    <p className="text-gray-500 text-sm">{filteredProducts.length} products</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

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
                    <div className="flex-1">
                        {/* Sort Bar */}
                        <div className="flex justify-end mb-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 cursor-pointer">
                                <span>Featured</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        <ProductGrid products={filteredProducts} loading={loading} />
                    </div>

                </div>
            </div>
        </div>
    );
}
