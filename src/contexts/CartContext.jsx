/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'shopping-cart';

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Simpan ke localStorage setiap kali cart berubah
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cart]);

    /**
     * B2 — Multi-tab sync via storage event.
     * Saat tab lain mengubah shopping-cart di localStorage,
     * tab ini akan menyinkronkan state cart-nya.
     */
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key !== CART_STORAGE_KEY) return;
            try {
                const updatedCart = event.newValue ? JSON.parse(event.newValue) : [];
                setCart(updatedCart);
            } catch (error) {
                console.error("Failed to sync cart from storage event", error);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prevCart => {
            const compositeId = product.cartItemId || product.id;
            const existingItem = prevCart.find(item => (item.cartItemId || item.id) === compositeId);
            if (existingItem) {
                return prevCart.map(item =>
                    (item.cartItemId || item.id) === compositeId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = useCallback((identifier) => {
        setCart(prevCart => prevCart.filter(item => (item.cartItemId || item.id) !== identifier));
    }, []);

    const updateQuantity = useCallback((identifier, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(identifier);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                (item.cartItemId || item.id) === identifier
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => {
            if (!item || !item.price) return total;
            const priceStr = String(item.price).replace(/,/g, '');
            const price = parseFloat(priceStr) || 0;
            return total + (price * item.quantity);
        }, 0);
    }, [cart]);

    const getCartCount = useCallback(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    const openCart  = useCallback(() => setIsCartOpen(true),  []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const value = useMemo(() => ({
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        openCart,
        closeCart
    }), [cart, isCartOpen, addToCart, removeFromCart, updateQuantity,
        clearCart, getCartTotal, getCartCount, openCart, closeCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
