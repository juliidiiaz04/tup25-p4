'use client';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function ShoppingCartSidebar() {
    const { isLoggedIn } = useAuth();
    const { cart, isCartLoading, removeFromCart } = useCart();

    if (!isLoggedIn) {
        return (
            <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 sticky top-20">
                <p className="text-gray-500 text-center text-sm">
                    Inicia sesión para ver y editar tu carrito.
                </p>
                <Link href="/login" className="mt-4 block text-center bg-black text-white p-2 rounded hover:bg-gray-800">
                    Iniciar Sesión
                </Link>
            </div>
        );
    }
    
    if (isCartLoading) {
        return <div className="p-6 bg-white shadow-xl rounded-lg sticky top-20">Cargando carrito...</div>;
    }

    const subtotal = cart?.productos.reduce((sum, item) => sum + item.precio * item.cantidad, 0) || 0;

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-200 sticky top-20">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">🛒 Tu Carrito</h2>
            
            {!cart || cart.productos.length === 0 ? (
                <p className="text-gray-500">El carrito está vacío.</p>
            ) : (
                <>
                    {/* Lista de Items del Carrito */}
                    <div className="max-h-60 overflow-y-auto mb-4">
                        {cart.productos.map(item => (
                            <div key={item.producto_id} className="flex justify-between items-center py-2">
                                <div>
                                    <span className="text-sm font-semibold">{item.nombre}</span>
                                    <span className="text-xs text-gray-500 block">Cant: {item.cantidad}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-800">${(item.precio * item.cantidad).toFixed(2)}</span>
                                    <button 
                                        onClick={() => removeFromCart(item.producto_id)}
                                        className="text-red-500 text-xs hover:text-red-700 ml-3"
                                        title="Quitar producto"
                                    >
                                        [X]
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Resumen de Totales */}
                    <div className="mt-4 border-t pt-4 space-y-2">
                        <div className="flex justify-between font-medium">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500">IVA y Envío se calculan en Checkout.</p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Link href="/checkout" className="block text-center bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
                            Continuar compra
                        </Link>
                        {/* El botón Cancelar (vaciar) se puede implementar con un post /carrito/cancelar si es necesario */}
                    </div>
                </>
            )}
        </div>
    );
}