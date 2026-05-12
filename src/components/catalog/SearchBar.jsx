import React, { useEffect, useState } from 'react';

/**
 * SearchBar - Input pencarian produk dengan debounce 300ms.
 *
 * @param {string} value - Nilai search query (controlled)
 * @param {Function} onChange - Callback saat nilai berubah (setelah debounce)
 * @param {string} placeholder - Placeholder text input
 */
export default function SearchBar({ value, onChange, placeholder = "Search products..." }) {
    const [localValue, setLocalValue] = useState(value);

    // Sync dari luar jika nilai berubah dari parent (e.g. reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // H3 — Debounce 300ms agar tidak trigger filter setiap keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-sm px-3 py-2 outline-none focus:border-black transition-colors"
            aria-label="Cari produk"
        />
    );
}
