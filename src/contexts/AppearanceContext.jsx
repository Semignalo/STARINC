/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { settingsApi } from '../api/settingsApi';

const AppearanceContext = createContext();

// Derive storage base from VITE_API_URL so storage URLs always match the current server
const STORAGE_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');

function normalizeStorageUrls(data) {
    return Object.fromEntries(
        Object.entries(data).map(([key, val]) => {
            if (typeof val === 'string' && /\/storage\//.test(val)) {
                if (/^https?:\/\//.test(val)) {
                    // Absolute URL: replace hostname with current STORAGE_BASE
                    val = val.replace(/^https?:\/\/[^/]+/, STORAGE_BASE);
                } else if (val.startsWith('/storage/')) {
                    // Relative URL: prepend STORAGE_BASE
                    val = STORAGE_BASE + val;
                }
            }
            return [key, val];
        })
    );
}

// Cache TTL: 5 menit (dalam milidetik)
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY = 'appearance_settings_cache';

const DEFAULT_SETTINGS = {
    heroVideoUrl: 'https://cdn.pixabay.com/video/2023/10/22/186175-877661556_large.mp4',
    heroTitle: 'True Radiance',
    heroSubtitle: 'Discover the new Gold Standard for your skin.',
    logoUrl: '/logo.png',
    accentColor: '#C5A059',
    editorialTag: 'Our Signature Collection',
    editorialTitle: 'Crafted for Your Skin',
    editorialDescription: 'Formulated with the finest ingredients, our products are designed to nourish and revitalize your skin with every use.',
    editorialCtaText: 'Browse Collection',
    editorialImageUrl: ''
};

/**
 * Membaca cache appearance dari localStorage.
 * Mengembalikan data jika belum expired, null jika expired atau tidak ada.
 */
function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, timestamp } = JSON.parse(raw);
        const isExpired = Date.now() - timestamp > CACHE_TTL;
        if (isExpired) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data;
    } catch {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
}

/**
 * Menyimpan data appearance ke localStorage dengan timestamp.
 */
function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
        // localStorage penuh atau disabled, abaikan
    }
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error('useAppearance must be used within an AppearanceProvider');
    }
    return context;
}

export function AppearanceProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Stale-while-revalidate: tampilkan cache instan (jika ada), lalu fetch ulang di background
        const cached = readCache();
        if (cached) {
            const normalizedCached = normalizeStorageUrls(cached);
            setSettings(prev => ({ ...prev, ...normalizedCached }));
            if (cached.accentColor) {
                document.documentElement.style.setProperty('--color-accent', cached.accentColor);
            }
            setLoading(false);
        }

        // Always re-fetch dari API agar perubahan admin (logo, warna, dll.) langsung visible
        (async () => {
            try {
                const data = normalizeStorageUrls(await settingsApi.getAppearance());
                setSettings(prev => ({ ...prev, ...data }));
                writeCache(data);
                if (data.accentColor) {
                    document.documentElement.style.setProperty('--color-accent', data.accentColor);
                }
            } catch (err) {
                console.error("Failed to fetch appearance settings:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /**
     * Memaksa refresh appearance (invalidate cache lalu fetch ulang).
     * Bisa dipanggil setelah admin mengubah appearance.
     */
    const refreshAppearance = useCallback(async (opts = {}) => {
        localStorage.removeItem(CACHE_KEY);
        setLoading(true);
        try {
            const data = normalizeStorageUrls(await settingsApi.getAppearance());
            setSettings(prev => ({ ...prev, ...data }));
            writeCache(data);
            if (data.accentColor) {
                document.documentElement.style.setProperty('--color-accent', data.accentColor);
            }
            // Broadcast ke tab lain bila opts.broadcast = true (default true)
            // Tab penerima akan dengar 'storage' event lalu re-fetch.
            if (opts.broadcast !== false) {
                localStorage.setItem('appearance_bust', String(Date.now()));
            }
        } catch (err) {
            console.error("Failed to refresh appearance settings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Listen storage event dari tab lain. Saat admin save di tab lain,
    // tab ini akan auto-refetch appearance tanpa user perlu reload.
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'appearance_bust') {
                refreshAppearance({ broadcast: false }); // jangan re-broadcast (infinite loop)
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [refreshAppearance]);

    const value = useMemo(
        () => ({ settings, loading, refreshAppearance }),
        [settings, loading, refreshAppearance]
    );

    return (
        <AppearanceContext.Provider value={value}>
            {children}
        </AppearanceContext.Provider>
    );
}
