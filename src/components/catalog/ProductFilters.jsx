import React from 'react';
import { Check, Search } from 'lucide-react';
import SearchBar from './SearchBar';

/**
 * ProductFilters — sidebar filter monochrome minimal.
 */
export default function ProductFilters({
    searchQuery,
    onSearchChange,
    showOutOfStock,
    onStockToggle,
    priceRange,
    onPriceChange,
    filters,
    onFilterToggle,
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

    const fmtRp = (v) => new Intl.NumberFormat('id-ID').format(v);

    return (
        <aside className="w-full lg:w-60 flex-shrink-0 space-y-8">

            {/* Search */}
            <Section title="Search">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Cari produk..."
                />
            </Section>

            {/* Stock */}
            <Section title="Stock">
                <div className="flex border border-gray-200 rounded-[4px] overflow-hidden text-[11px]">
                    <button
                        className={`flex-1 h-8 transition-colors ${showOutOfStock ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        onClick={() => onStockToggle(true)}
                    >
                        Show out of stock
                    </button>
                    <button
                        className={`flex-1 h-8 transition-colors ${!showOutOfStock ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:text-gray-900'}`}
                        onClick={() => onStockToggle(false)}
                    >
                        Hide
                    </button>
                </div>
            </Section>

            {/* Price */}
            <Section title="Price">
                <div className="flex items-center gap-2 mb-5">
                    <div className="border border-gray-200 rounded-[4px] px-2.5 h-9 w-1/2 flex items-center text-xs text-gray-700">
                        <span className="text-gray-400 mr-1">Rp</span>
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={handleMinPrice}
                            className="w-full outline-none bg-transparent tabular-nums"
                            aria-label="Harga minimum"
                        />
                    </div>
                    <div className="border border-gray-200 rounded-[4px] px-2.5 h-9 w-1/2 flex items-center text-xs text-gray-700">
                        <span className="text-gray-400 mr-1">Rp</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={handleMaxPrice}
                            className="w-full outline-none bg-transparent tabular-nums"
                            aria-label="Harga maksimum"
                        />
                    </div>
                </div>

                {/* Dual Slider */}
                <div className="relative h-6">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2" />
                    <div
                        className="absolute top-1/2 h-px bg-gray-900 -translate-y-1/2"
                        style={{
                            left: `${(priceRange[0] / 1000000) * 100}%`,
                            right: `${100 - (priceRange[1] / 1000000) * 100}%`,
                        }}
                    />
                    <input
                        type="range" min="0" max="1000000"
                        value={priceRange[0]}
                        onChange={handleMinSlider}
                        aria-label="Slider minimum"
                        className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer z-10"
                    />
                    <input
                        type="range" min="0" max="1000000"
                        value={priceRange[1]}
                        onChange={handleMaxSlider}
                        aria-label="Slider maksimum"
                        className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer z-20"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 tabular-nums">
                    <span>Rp{fmtRp(priceRange[0])}</span>
                    <span>Rp{fmtRp(priceRange[1])}</span>
                </div>
            </Section>

            {/* Product Type */}
            <Section title="Category">
                <div className="space-y-2.5">
                    {Object.entries(filters).map(([key, checked]) => (
                        <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                            <span className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors flex-shrink-0 ${
                                checked ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300 group-hover:border-gray-500'
                            }`}>
                                {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                            </span>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onFilterToggle(key)}
                                className="hidden"
                            />
                            <span className="text-xs text-gray-600 capitalize group-hover:text-gray-900 transition-colors">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                        </label>
                    ))}
                </div>
            </Section>

        </aside>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3 pb-2 border-b border-gray-100">
                {title}
            </h3>
            {children}
        </div>
    );
}
