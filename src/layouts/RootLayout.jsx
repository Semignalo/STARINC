import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

export default function RootLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
            <Navbar />
            <main className="flex-grow pt-14">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
