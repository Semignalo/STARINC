import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    CreditCard,
    LogOut,
    ArrowLeft,
    Banknote,
    Menu,
    X,
    ClipboardList,
    MessageSquareQuote,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdminLayout — Linear/Notion-style monochrome.
 *
 * Layout:
 *  - Sidebar 240px, white background, border tipis kanan, NAV items dengan
 *    icon kecil + label, active state = soft gray pill dengan gold accent left indicator
 *  - Topbar minimal: page title (derived dari route) + mobile menu trigger
 *  - Content area: padding generous, max-width terkontrol
 *  - Font: Inter (sudah di-preload di index.html)
 *  - Scope styling lewat .admin-shell (CSS vars override di index.css)
 */
export default function AdminLayout() {
    const { currentUser, userRole, logout, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-9 h-9 border-[2.5px] border-gray-200 border-t-[var(--admin-accent,#C5A059)] rounded-full animate-spin" />
            </div>
        );
    }
    if (!currentUser || userRole !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const sections = [
        {
            label: 'Menu',
            items: [
                { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
                { name: 'Pesanan', path: '/admin/orders', icon: ShoppingCart },
                { name: 'Produk', path: '/admin/products', icon: Package },
                { name: 'Testimoni', path: '/admin/testimonials', icon: MessageSquareQuote },
            ],
        },
        {
            label: 'Center',
            items: [
                { name: 'Users', path: '/admin/users', icon: Users },
                { name: 'Pengajuan', path: '/admin/applications', icon: ClipboardList },
                { name: 'Komisi', path: '/admin/commissions', icon: Banknote },
            ],
        },
        {
            label: 'Konfigurasi',
            items: [
                { name: 'Pembayaran', path: '/admin/payment-settings', icon: CreditCard },
                { name: 'Tampilan Web', path: '/admin/settings', icon: Settings },
            ],
        },
    ];

    // Derive page title from current path
    const allItems = sections.flatMap(s => s.items);
    const currentItem = allItems
        .filter(it => it.end ? location.pathname === it.path : location.pathname.startsWith(it.path))
        .sort((a, b) => b.path.length - a.path.length)[0];

    const NavItem = ({ link, onClick }) => (
        <NavLink
            to={link.path}
            end={link.end}
            onClick={onClick}
            className={({ isActive }) => cn(
                'group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors',
                isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-[var(--admin-accent)]" />
                    )}
                    <link.icon size={15} strokeWidth={2} className={cn(isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600')} />
                    <span>{link.name}</span>
                </>
            )}
        </NavLink>
    );

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">S</span>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900 truncate">STARINC Admin</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 text-gray-400 hover:text-gray-700"
                    aria-label="Tutup menu"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Sections */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {sections.map((sec) => (
                    <div key={sec.label}>
                        <p className="px-2.5 mb-1 text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                            {sec.label}
                        </p>
                        <div className="space-y-0.5">
                            {sec.items.map((link) => (
                                <NavItem key={link.path} link={link} onClick={() => setSidebarOpen(false)} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 space-y-0.5">
                <NavLink
                    to="/"
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={15} strokeWidth={2} className="text-gray-400" />
                    Back to App
                </NavLink>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={15} strokeWidth={2} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="admin-shell flex min-h-screen">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'w-[232px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200',
                'md:translate-x-0',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            )}>
                <SidebarContent />
            </aside>

            {/* Main */}
            <main className="flex-1 md:ml-[232px] min-h-screen flex flex-col">
                {/* Topbar */}
                <header className="h-12 px-4 md:px-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-1.5 text-gray-500 hover:text-gray-900"
                            aria-label="Buka menu"
                        >
                            <Menu size={18} />
                        </button>
                        <h1 className="text-sm font-semibold text-gray-900 truncate">
                            {currentItem?.name || 'Admin'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-xs text-gray-500">
                            {currentUser.name || currentUser.email}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-[11px] font-semibold">
                            {(currentUser.name || currentUser.email)?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
