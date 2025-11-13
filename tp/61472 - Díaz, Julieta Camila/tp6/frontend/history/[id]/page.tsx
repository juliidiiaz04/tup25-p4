'use client';
import { useEffect, useState, useMemo } from 'react';
import { CompraReadDetail } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { fetchPurchaseDetail } from '../../../services/cart';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function PurchaseDetailPage() {
    const params = useParams();
    const compraId = Number(params.id);

    const { token, isLoggedIn } = useAuth();
    const [compra, setCompra] = useState<CompraReadDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token && compraId) {
            const loadDetail = async () => {
                try {
                    setError('');
                    setIsLoading(true);
                    const data = await fetchPurchaseDetail(token, compraId);
                    setCompra(data);
                } catch (err) {
                    setError((err as Error).message);
                } finally {
                    setIsLoading(false);
                }
            };
            loadDetail();
        } else if (!compraId) {
            setError('ID de compra no especificado.');
            setIsLoading(false);
        }
    }, [token, compraId]);

    // Cálculo simple del subtotal (sin IVA) para el detalle
    const subtotal = useMemo(() => {
        return compra?.items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0) || 0;
    }, [compra]);

    if (!isLoggedIn) return <p className="p-8 text-center text-red-500">Inicie sesión para ver este detalle.</p>;
    if (isLoading) return <div className="max-w-4xl mx-auto p-6 mt-8">Cargando detalle de compra...</div>;
    if (error || !compra) return (
        <div className="max-w-4xl mx-auto p-6 mt-8">
            <p className="text-red-500">Error: {error || "Detalle no encontrado."}</p>
            <Link href="/history" className="text-blue-600 hover:underline mt-4 block">Volver al historial</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold mb-4">Detalle de Compra #{compra.id}</h1>
            
            <div className="text-sm text-gray-600 mb-6 border-b pb-4">
                <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleString()}</p>
                <p><strong>Dirección:</strong> {compra.direccion}</p>
                <p><strong>Pagado con Tarjeta:</strong> **** **** **** {compra.tarjeta}</p>
            </div>

            <h2 className="text-xl font-semibold mb-3">Productos Adquiridos</h2>
            <div className="space-y-3">
                {compra.items.map((item) => (
                    <div key={item.producto_id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                        <div>
                            <p className="font-semibold text-base">{item.nombre}</p>
                            <p className="text-sm">Precio Unitario: ${item.precio_unitario.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">Cantidad: {item.cantidad}</p>
                            <p className="font-bold mt-1">Subtotal: ${(item.precio_unitario * item.cantidad).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between"><span>Envío:</span><span>${compra.envio.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t mt-2">
                    <span>Total Final Pagado:</span>
                    <span>${compra.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-6">
                <Link href="/history" className="text-blue-600 hover:underline">
                    ← Volver al Historial
                </Link>
            </div>
        </div>
    );
}

export default PurchaseDetailPage;