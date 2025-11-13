'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext'; 

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(nombre, email, contrasena);
            alert('¡Registro exitoso! Por favor, inicia sesión.');
            // La redirección a '/login' ocurre dentro de useAuth
        } catch (err: any) {
            setError(err.message || 'Error al intentar registrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border">
                <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400">
                        {loading ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>
                <div className="text-center text-sm">
                    ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:text-blue-800">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}