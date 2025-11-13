import { Usuario, LoginResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function login(email: string, contrasena: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Credenciales inválidas');
    }
    return response.json();
}

export async function register(nombre: string, email: string, contrasena: string): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, contrasena }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al registrar usuario');
    }
    return response.json();
}