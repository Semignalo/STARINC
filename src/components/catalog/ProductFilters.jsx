import React from 'react';
import { SlidersHorizontal, ChevronDown, ChevronRight, Check } from 'lucide-react';
import SearchBar from './SearchBar';

/**
 * ProductFilters - Sidebar filter untuk halaman Catalog.
 *
 * @param {string} searchQuery - Nilai pencarian saat ini
 * @param {Function} onSearchChange - Callback perubahan search (setelah debounce)
 * @param {boolean} showOutOfStock - Toggle tampilkan stok habis
 * @param {Function} onStockToggle - Callback toggle stok habis (boolean)
 * @param {number[]} priceRange - [min, max] rentang harga
 * @param {Function} onPriceChange - Callback perubahan harga ([min, max])
 * @param {Object} filters - Map filter kategori { key: boolean }
 * @param {Function} onFilterToggle - Callback toggle filter kategori (key)
 */
export default function ProductFilters({
    searchQuery,
    onSearchChange,
    showOutOfStock,
    onStockToggle,
    priceRange,
    onPriceChange,
    filters,
    onFilterToggle
}) {
    const handleMinPrice = (e) => {
        const val = Math.min(Number(e.target.value), priceRange[1] - 1);
        onPriceChange([val, priceRange[1]]);
    };

    const handleMaxPrice = (e) => {
        const val = Math.max(Number(e.target.value), priceRange[0] + 1);
        onPriceChange([priceRange[0], val]);
    };

    const handleMinSlider = (e) => {
        const val = Math.min(Number(e.target.value), priceRange[1] - 10000);
        onPriceChange([val, priceRange[1]]);
    };

    const handleMaxSlider = (e) => {
        const val = Math.max(Number(e.target.value), priceRange[0] + 10000);
        onPriceChange([priceRange[0], val]);
    };

    return (
        <div className="w-full lg:w-64 flex-shrink-0 space-y-8">

            {/* Filter Header & Search */}
            <div className="space-y-4 border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <SlidersHorizontal size={18} />
                        <span>Filter</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                </div>
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search products..."
                />
            </div>

            {/* Out of Stock Toggle */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Out of stock</span>
                <div className="flex items-center text-xs font-medium border border-gray-200 rounded-sm">
                    <button
                        className={`px-3 py-1 transition-colors ${showOutOfStock ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`}
                        onClick={() => onStockToggle(true)}
                        aria-pressed={showOutOfStock}
                    >
                        Show
                    </button>
                    <button
                        className={`px-3 py-1 transition-colors ${!showOutOfStock ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`}
                        onClick={() => onStockToggle(false)}
                        aria-pressed={!showOutOfStock}
                    >
                        Hide
                    </button>
                </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-900">Price</span>
                    <ChevronDown size={16} className="text-gray-400 rotate-180" />
                </div>

                {/* Price Inputs */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="border border-gray-200 px-3 py-2 text-sm text-gray-600 w-1/2 rounded-sm flex items-center">
                        <span className="text-gray-400 mr-1">Rp.</span>
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={handleMinPrice}
                            className="w-full outline-none bg-transparent"
                            aria-label="Harga minimum"
                        />
                    </div>
                    <div className="border border-gray-200 px-3 py-2 text-sm text-gray-600 w-1/2 rounded-sm flex items-center">
                        <span className="text-gray-400 mr-1">Rp.</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={handleMaxPrice}
                            className="w-full outline-none bg-transparent"
                            aria-label="Harga maksimum"
                        />
                    </div>
                </div>

                {/* Dual Slider */}
                <div className="relative h-6 mt-6">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                    <div
                        className="absolute top-1/2 h-1 bg-black rounded-full -translate-y-1/2"
                        style={{
                            left: `${(priceRange[0] / 1000000) * 100}%`,
                            right: `${100 - (priceRange[1] / 1000000) * 100}%`
                        }}
                    />
                    <input
                        type="range" min="0" max="1000000"
                        value={priceRange[0]}
                        onChange={handleMinSlider}
                        aria-label="Slider harga minimum"
                        className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer z-10"
                    />
                    <input
                        type="range" min="0" max="1000000"
                        value={priceRange[1]}
                        onChange={handleMaxSlider}
                        aria-label="Slider harga maksimum"
                        className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:cursor-pointer z-20"
                    />
                </div>
            </div>

            {/* Product Type Filter */}
            <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-900">Product type</span>
                    <ChevronDown size={16} className="text-gray-400 rotate-180" />
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                    {Object.entries(filters).map(([key, checked]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center transition-colors ${checked ? 'bg-black border-black' : 'bg-white group-hover:border-gray-400'}`}>
                                {checked && <Check size={12} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onFilterToggle(key)}
                                className="hidden"
                            />
                            <span className="text-sm text-gray-600 capitalize group-hover:text-gray-900 transition-colors">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    );
}
