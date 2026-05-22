import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppearance } from '../contexts/AppearanceContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Swal from 'sweetalert2';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY < 10) {
                setVisible(true);
            } else if (currentY > lastScrollY.current) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            lastScrollY.current = currentY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const { settings } = useAppearance();
    const { openCart, getCartCount } = useCart();
    const { currentUser, userRole, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Logout',
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navLinks = [
        { name: 'Catalog', path: '/products' },
        { name: lang === 'id' ? 'Konsep Kami' : 'Our concept', path: '/about' },
        { name: 'FAQ', path: '/faq' },
        { name: lang === 'id' ? 'Become Center' : 'Become Center', path: '/partnership' },
        ...(userRole === 'starcenter' ? [{ name: 'Center Shop', path: '/center' }] : []),
    ];

    const firstName = currentUser?.name
        ? currentUser.name.split(' ')[0]
        : currentUser?.email?.split('@')[0];

    return (
        <>
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 transition-transform duration-300",
                visible ? "translate-y-0" : "-translate-y-full"
            )}>
                <div className="container mx-auto px-4 h-full">
                    <div className="flex items-center justify-between h-full gap-4 relative">

                        {/* Left: Desktop Nav / Mobile Hamburger */}
                        <div className="flex items-center gap-1">
                            {/* Desktop Nav Links */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="md:hidden min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors active:scale-95"
                                aria-label="Menu"
                            >
                                <Menu size={22} strokeWidth={1.5} className="text-gray-900" />
                            </button>
                        </div>

                        {/* Center: Logo (absolute) */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Link to="/" className="block">
                                <img src={settings?.logoUrl || '/logo.png'} alt="Starinc Logo" className="h-7 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* Right: Lang toggle + User + Cart */}
                        <div className="flex items-center gap-1">
                            {/* Language Toggle – desktop only */}
                            <div className="hidden md:flex items-center border border-gray-200 rounded-full overflow-hidden text-[11px] font-semibold tracking-wider">
                                <button
                                    onClick={() => setLang('en')}
                                    className={cn('px-2.5 py-1 transition-colors', lang === 'en' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700')}
                                >EN</button>
                                <button
                                    onClick={() => setLang('id')}
                                    className={cn('px-2.5 py-1 transition-colors', lang === 'id' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700')}
                                >ID</button>
                            </div>

                                {currentUser ? (
                                <div className="group relative">
                                    {/* Pill: avatar + first name */}
                                    <button className="flex items-center gap-0 rounded-full border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors bg-white">
                                        {/* Name side */}
                                        <span className="pl-3 pr-2 text-xs font-semibold text-gray-700 hidden sm:block whitespace-nowrap">
                                            {firstName}
                                        </span>
                                        {/* Avatar side */}
                                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            {(currentUser.name || currentUser.email)?.charAt(0).toUpperCase()}
                                        </div>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {(currentUser.name || currentUser.email)?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate text-gray-900">{currentUser.name || firstName}</p>
                                                <p className="text-xs text-gray-400 capitalize">{userRole} Member</p>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                                Profil Saya
                                            </Link>
                                            {userRole === 'starcenter' && (
                                                <Link to="/center" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                                    Center Shop
                                                </Link>
                                            )}
                                            {userRole === 'admin' && (
                                                <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={15} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-0 rounded-full border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors bg-white">
                                    <span className="pl-3 pr-2 text-xs font-semibold text-gray-700 hidden sm:block">Login</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                                        <User size={16} strokeWidth={1.5} className="text-white" />
                                    </div>
                                </Link>
                            )}

                            {(userRole === 'starcenter' || userRole === 'admin') && (
                                <button
                                    onClick={openCart}
                                    className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors relative active:scale-95"
                                >
                                    <ShoppingBag size={20} strokeWidth={1.5} className="text-gray-900" />
                                    <span className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                        {getCartCount()}
                                    </span>
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            </nav>

            {/* Slide-out Sidebar Menu (Drawer) - Optimized for Mobile Thumb Reach */}
            <div className={cn(
                "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 backdrop-blur-sm",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsOpen(false)} />

            <div className={cn(
                "fixed inset-y-0 left-0 z-[60] w-[80%] max-w-[300px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Sidebar Header */}
                <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
                    <img src={settings?.logoUrl || '/logo.png'} alt="Starinc" className="h-7 w-auto" />
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <Menu size={20} />
                    </button>
                </div>

                {/* User Info – mobile */}
                {currentUser && (
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(currentUser.name || currentUser.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name || firstName}</p>
                            <p className="text-xs text-gray-400 capitalize">{userRole} Member</p>
                        </div>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto py-2">
                    <ul className="space-y-1">
                        {navLinks.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className="block px-6 py-4 text-gray-900 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-dark)] font-medium text-lg border-l-4 border-transparent hover:border-gray-900 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        {currentUser && (
                            <>
                                <li>
                                    <Link
                                        to="/profile"
                                        className="block px-6 py-4 text-gray-900 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-dark)] font-medium text-lg border-l-4 border-transparent hover:border-gray-900 transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {lang === 'id' ? 'Profil Saya' : 'My Profile'}
                                    </Link>
                                </li>
                                {userRole === 'admin' && (
                                    <li>
                                        <Link
                                            to="/admin"
                                            className="block px-6 py-4 text-gray-900 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-dark)] font-medium text-lg border-l-4 border-transparent hover:border-gray-900 transition-all"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
                {/* Language toggle – mobile sidebar */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Language</span>
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-[11px] font-semibold">
                        <button onClick={() => setLang('en')} className={cn('px-3 py-1 transition-colors', lang === 'en' ? 'bg-gray-900 text-white' : 'text-gray-400')}>EN</button>
                        <button onClick={() => setLang('id')} className={cn('px-3 py-1 transition-colors', lang === 'id' ? 'bg-gray-900 text-white' : 'text-gray-400')}>ID</button>
                    </div>
                </div>

                <div className="px-6 pb-6 bg-gray-50">
                    {currentUser ? (
                        <button
                            onClick={() => { setIsOpen(false); handleLogout(); }}
                            className="w-full py-3 bg-red-500 text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 block text-center bg-gray-900 text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform"
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
