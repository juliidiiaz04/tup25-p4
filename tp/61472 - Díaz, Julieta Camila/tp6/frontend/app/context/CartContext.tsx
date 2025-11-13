'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CarritoRead } from '../types';
import { useAuth } from './AuthContext'; 
import { fetchCart, addItemToCart, removeItemFromCart } from '../services/cart';

interface CartContextType {
    cart: CarritoRead | null;
    loadCart: () => Promise<void>;
    addToCart: (producto_id: number, cantidad?: number) => Promise<void>;
    removeFromCart: (producto_id: number) => Promise<void>;
    isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { token, isLoggedIn } = useAuth();
    const [cart, setCart] = useState<CarritoRead | null>(null);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const loadCart = useCallback(async () => {
        if (!token) return;
        setIsCartLoading(true);
        try {
            const data = await fetchCart(token);
            setCart(data);
        } catch (error) {
            console.error("Error cargando carrito:", error);
            setCart(null);
        } finally {
            setIsCartLoading(false);
        }
    }, [token]);

    // Recargar carrito cuando el usuario inicia sesión
    useEffect(() => {
        if (isLoggedIn) {
            loadCart();
        } else {
            setCart(null);
        }
    }, [isLoggedIn, loadCart]);

    const addToCart = async (producto_id: number, cantidad: number = 1) => {
        if (!token) throw new Error("Debe iniciar sesión para agregar productos.");
        try {
            await addItemToCart(token, producto_id, cantidad);
            await loadCart(); // Recargar carrito después de la modificación
        } catch (error) {
            alert((error as Error).message); // Muestra el error de stock al usuario
            console.error(error);
        }
    };

    const removeFromCart = async (producto_id: number) => {
        if (!token) return;
        try {
            await removeItemFromCart(token, producto_id);
            await loadCart(); // Recargar carrito
        } catch (error) {
            alert((error as Error).message);
        }
    };

    return (
        <CartContext.Provider value={{ cart, loadCart, addToCart, removeFromCart, isCartLoading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};