import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
    MessageSquareQuote
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLayout() {
    const { currentUser, userRole, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!currentUser || userRole !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const sidebarLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
        { name: 'Pesanan', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Produk', path: '/admin/products', icon: Package },
        { name: 'Users / Center', path: '/admin/users', icon: Users },
        { name: 'Pengajuan Center', path: '/admin/applications', icon: ClipboardList },
        { name: 'Komisi', path: '/admin/commissions', icon: Banknote },
        { name: 'Rekening Pembayaran', path: '/admin/payment-settings', icon: CreditCard },
        { name: 'Testimoni', path: '/admin/testimonials', icon: MessageSquareQuote },
        { name: 'Tampilan Web', path: '/admin/settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">STARINC Admin<span className="text-[var(--color-accent)]">.</span></h1>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Tutup menu"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                            isActive
                                ? "bg-[#1F2937] text-white border-l-4 border-[var(--color-accent)]"
                                : "text-gray-400 hover:bg-[#1F2937] hover:text-white"
                        )}
                    >
                        <link.icon size={20} />
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-2">
                <NavLink
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors min-h-[44px]"
                >
                    <ArrowLeft size={20} />
                    Back to App
                </NavLink>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-900/10 rounded-lg transition-colors min-h-[44px]"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — hidden on mobile unless open */}
            <aside className={cn(
                "w-64 bg-[#111827] text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200",
                "md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center gap-3 bg-[#111827] text-white px-4 py-3 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-white"
                        aria-label="Buka menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="font-bold text-white">STARINC Admin<span className="text-[var(--color-accent)]">.</span></span>
                </div>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
