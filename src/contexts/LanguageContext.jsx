/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(
        () => localStorage.getItem('site_lang') || 'en'
    );

    const setLang = useCallback((l) => {
        localStorage.setItem('site_lang', l);
        setLangState(l);
    }, []);

    const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
