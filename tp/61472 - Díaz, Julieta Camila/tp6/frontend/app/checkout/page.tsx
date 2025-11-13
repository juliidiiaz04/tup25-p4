'use client';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { finalizeCheckout } from '../services/cart';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, loadCart } = useCart();
    const { token } = useAuth();
    
    const [direccion, setDireccion] = useState('');
    const [tarjeta, setTarjeta] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Calcula el subtotal bruto (necesario para el resumen visual)
    const subtotalBruto = useMemo(() => {
        return cart?.productos.reduce((sum, item) => sum + item.precio * item.cantidad, 0) || 0;
    }, [cart]);

    // Usaremos valores PLACEHOLDER, ya que el cálculo real (IVA/Envío) es responsabilidad del BACKEND
    const ivaPlaceholder = subtotalBruto > 0 ? subtotalBruto * 0.21 : 0;
    const envioPlaceholder = subtotalBruto > 1000 ? 0 : (subtotalBruto > 0 ? 50 : 0);
    const totalPlaceholder = subtotalBruto + ivaPlaceholder + envioPlaceholder;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!token || !cart || cart.productos.length === 0) {
             setError('El carrito está vacío o la sesión expiró.');
             return;
        }

        setIsLoading(true);
        try {
            const result = await finalizeCheckout(token, {
                direccion: direccion,
                tarjeta: tarjeta, 
            });
            
            // Éxito: vaciar el carrito y redirigir
            await loadCart(); 
            alert(`Compra #${result.compra_id} finalizada con éxito por $${result.total_final.toFixed(2)}.`);
            router.push('/history'); 
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return <div className="max-w-4xl mx-auto p-6 mt-8">Debes iniciar sesión para finalizar la compra.</div>;
    
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-8">
            <h1 className="text-3xl font-bold mb-6 border-b pb-2">Finalizar Compra</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Resumen del Pedido */}
                <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 h-fit order-2 md:order-1">
                    <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
                    <div className="space-y-2 text-sm">
                        {cart?.productos.map(item => (
                            <div key={item.producto_id} className="flex justify-between border-b pb-1">
                                <span>{item.nombre} (x{item.cantidad})</span>
                                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotalBruto.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>*IVA Estimado:</span>
                            <span>${ivaPlaceholder.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>*Envío Estimado:</span>
                            <span>${envioPlaceholder.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                            <span>Total Estimado:</span>
                            <span>${totalPlaceholder.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">*Calculado por el backend al confirmar</p>
                    </div>
                </div>

                {/* Formulario */}
                <div className="order-1 md:order-2">
                    <h2 className="text-2xl font-semibold mb-4">Información de Pago y Envío</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección de Envío Completa</label>
                            <input id="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" placeholder="Calle, número, ciudad, código postal" />
                        </div>
                        <div>
                            <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700">Tarjeta (Últimos 4 dígitos)</label>
                            <input id="tarjeta" type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} maxLength={4} pattern="\d{4}" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" placeholder="XXXX" />
                        </div>
                        
                        <button type="submit" disabled={isLoading || subtotalBruto === 0} className={`w-full py-3 text-white font-bold rounded-lg transition ${isLoading || subtotalBruto === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isLoading ? 'Procesando...' : `Confirmar y Pagar`}
                        </button>
                    </form>
                    <Link href="/" className="mt-4 block text-center text-gray-600 hover:text-black">
                        ← Volver al Catálogo
                    </Link>
                </div>
            </div>
        </div>
    );
}