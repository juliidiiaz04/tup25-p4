"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";

export type CartItem = {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
};

type CartTotals = {
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
};

type CartData = {
  items: CartItem[];
};

type CartContextType = {
  cart: CartData;
  totals: CartTotals;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (producto_id: number) => Promise<void>;
  removeFromCart: (producto_id: number) => Promise<void>;
  changeQuantity: (producto_id: number, cantidad: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    iva: 0,
    envio: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(false);

  async function authFetch(input: string, init?: RequestInit) {
    return fetch(input, {
      ...(init || {}),
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  async function refreshCart() {
    if (!token) {
      setItems([]);
      setTotals({ subtotal: 0, iva: 0, envio: 0, total: 0 });
      return;
    }
    setLoading(true);
    const res = await authFetch(`${API_BASE}/carrito`);
    setLoading(false);

    if (!res.ok) return;

    const data = await res.json();

    setItems(data.items || []);
    setTotals({
      subtotal: data.subtotal ?? 0,
      iva: data.iva ?? 0,
      envio: data.envio ?? 0,
      total: data.total ?? 0,
    });
  }

  async function addToCart(producto_id: number) {
    await authFetch(`${API_BASE}/carrito`, {
      method: "POST",
      body: JSON.stringify({ producto_id, cantidad: 1 }),
    });
    await refreshCart();
  }

  async function removeFromCart(producto_id: number) {
    await authFetch(`${API_BASE}/carrito/${producto_id}`, { method: "DELETE" });
    await refreshCart();
  }

  async function changeQuantity(producto_id: number, cantidad: number) {
    if (cantidad <= 0) {
      await removeFromCart(producto_id);
      return;
    }

    await authFetch(`${API_BASE}/carrito`, {
      method: "POST",
      body: JSON.stringify({ producto_id, cantidad }),
    });

    await refreshCart();
  }

  async function clearCart() {
    await authFetch(`${API_BASE}/carrito/cancelar`, { method: "POST" });
    await refreshCart();
  }

  useEffect(() => {
    refreshCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        cart: { items },
        totals,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        changeQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}