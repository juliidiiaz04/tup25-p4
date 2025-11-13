'use client';
import { useEffect, useState } from 'react';
import { CompraReadSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchPurchaseHistory } from '../services/cart';
import Link from 'next/link';

export default function HistoryPage() {
    const { token, isLoggedIn } = useAuth();
    const [history, setHistory] = useState<CompraReadSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            const loadHistory = async () => {
                try {
                    setError('');
                    setIsLoading(true);
                    const data = await fetchPurchaseHistory(token);
                    setHistory(data);
                } catch (err: any) {
                    setError(err.message || "Fallo al cargar el historial.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadHistory();
        } else {
            setIsLoading(false); 
        }
    }, [token]);

    if (!isLoggedIn) return <p className="p-8 text-center text-red-500">Inicie sesión para ver su historial.</p>;
    if (isLoading) return <p className="p-8 text-center">Cargando historial...</p>;
    if (error) return <p className="p-8 text-center text-red-600">Error: {error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8">
            <h1 className="text-3xl font-bold mb-6 border-b pb-2">Mis Compras Anteriores ({history.length})</h1>
            
            {history.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500">Aún no tienes compras en tu historial.</p>
                    <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                        Ir a la tienda
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((compra) => (
                        <Link href={`/history/${compra.id}`} key={compra.id}>
                            <div className="p-4 bg-white shadow rounded-lg hover:shadow-md transition cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-lg">
                                        Compra #{compra.id}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Fecha: {new Date(compra.fecha).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <p className="text-sm text-gray-700">
                                        Total: <span className="font-bold text-black">${compra.total.toFixed(2)}</span>
                                    </p>
                                    <p className="text-sm text-blue-600 hover:underline">
                                        Ver detalles →
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}