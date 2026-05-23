import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessageCircle, ShoppingBag } from 'lucide-react';
import { useAppearance } from '../contexts/AppearanceContext';
import { useLanguage } from '../contexts/LanguageContext';

const TikTokIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
);

const ShopeeIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.8 2 8 3.8 8 6H4.5A1.5 1.5 0 0 0 3 7.5V9a1.5 1.5 0 0 0 1.5 1.5h.07l.93 10.5A1.5 1.5 0 0 0 7 22.5h10a1.5 1.5 0 0 0 1.5-1.5l.93-10.5H20A1.5 1.5 0 0 0 21.5 9V7.5A1.5 1.5 0 0 0 20 6h-3.5C16.5 3.8 14.2 2 12 2zm0 2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm-6 4h12v.5H6V8zm1.8 3h8.4l-.75 8.5H8.55L7.8 11zM11 14v4h2v-4h-2z" />
    </svg>
);

const TokopediaIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm-2.5 3.5v1.75H8v1.5h1.5V15h1.5v-4.25H13v-1.5h-2V7.5h-1.5zm5 0v7.5h1.5v-7.5H14.5z" />
    </svg>
);

const SOCIAL = [
    { label: 'Instagram', icon: Instagram,  href: 'https://instagram.com/STARINC.OFFICIAL' },
    { label: 'TikTok',    icon: TikTokIcon, href: 'https://www.tiktok.com/@starinc.official' },
    { label: 'YouTube',   icon: Youtube,    href: '#' },
];

const MARKETPLACE = [
    { label: 'SDP',       icon: ShoppingBag,   href: '#' },
    { label: 'Shopee',    icon: ShopeeIcon,    href: 'https://shopee.co.id/STARINCOFFICIAL' },
    { label: 'Tokopedia', icon: TokopediaIcon, href: 'https://tokopedia.com/search?q=starinc+official+store' },
];

export default function Footer() {
    const { settings } = useAppearance();
    const { lang } = useLanguage();
    const isId = lang === 'id';

    return (
        <footer
            className="text-white relative"
            style={{ backgroundImage: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)' }}
        >

            {/* ── Main ─────────────────────────────── */}
            <div className="container mx-auto px-6 py-14 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="md:col-span-1 flex flex-col items-center md:items-start gap-4">
                        <img src="/logo.svg" alt="Starinc" className="h-12 w-auto brightness-0 invert" />
                        <p className="text-white/40 text-xs leading-relaxed text-center md:text-left max-w-[210px]">
                            {isId
                                ? 'Kecantikan holistik dari luar & dalam.    Dibuat untuk Indonesia.'
                                : 'Holistic beauty, inside & out.    Made for Indonesia.'}
                        </p>
                        <p className="text-white/30 text-[10px] leading-relaxed text-center md:text-left max-w-[210px]">
                            {isId
                                ? 'Pembelian retail melalui marketplace SDP. Akses pembelian langsung khusus untuk member Starcenter.'
                                : 'Retail purchases via SDP marketplace. Direct purchasing reserved for Starcenter members.'}
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-5 font-semibold">
                            {isId ? 'Belanja' : 'Shop'}
                        </h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/products" className="hover:text-[var(--color-accent)] transition-colors">{isId ? 'Semua Produk' : 'All Products'}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-5 font-semibold">
                            {isId ? 'Bantuan' : 'Support'}
                        </h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/faq" className="hover:text-[var(--color-accent)] transition-colors">FAQ</Link></li>
                            <li><Link to="/partnership" className="hover:text-[var(--color-accent)] transition-colors">{isId ? 'Jadi Mitra' : 'Become Center'}</Link></li>
                            <li><Link to="/about" className="hover:text-[var(--color-accent)] transition-colors">{isId ? 'Tentang Kami' : 'Our Concept'}</Link></li>
                        </ul>
                    </div>

                    {/* Social + Marketplace */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-5 font-semibold">
                            {isId ? 'Temukan Kami' : 'Find Us'}
                        </h4>

                        {/* Social media */}
                        <div className="flex gap-3 mb-6">
                            {SOCIAL.map(({ label, icon: Icon, href }) => (
                                <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"
                                    className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center text-white/70 hover:border-white hover:text-white transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>

                        {/* Marketplace */}
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Marketplace</p>
                        <div className="flex gap-3">
                            {MARKETPLACE.map(({ label, icon: Icon, href }) => (
                                <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 border border-white/20 rounded px-3 py-2 text-xs text-white/70 hover:border-white/50 hover:text-white transition-colors">
                                    <Icon size={16} />
                                    <span>{label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Bottom bar ───────────────────────── */}
            <div className="border-t border-white/8 py-5 text-center text-[11px] text-gray-600">
                &copy; {new Date().getFullYear()} Starinc. All rights reserved.
            </div>

            {/* Floating Chat Button */}
            <a
                href="https://wa.me/62811253599"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-4 z-50 flex items-center bg-gray-900 rounded-full shadow-lg shadow-black/20 pl-4 py-3 pr-3 active:scale-95 transition-all text-white"
            >
                <span className="mr-2 text-sm font-bold">Chat</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle size={20} fill="currentColor" />
                </div>
            </a>
        </footer>
    );
}
