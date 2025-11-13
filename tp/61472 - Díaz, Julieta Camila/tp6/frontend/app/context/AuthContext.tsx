'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Usuario, LoginResponse } from '../types';
import { login as apiLogin, register as apiRegister } from '../services/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: Usuario | null;
    token: string | null;
    isLoggedIn: boolean;
    login: (email: string, contrasena: string) => Promise<void>;
    register: (nombre: string, email: string, contrasena: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const isLoggedIn = !!token;
    const router = useRouter();

    useEffect(() => {
        // Cargar sesión desde localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = async (email: string, contrasena: string) => {
        const response: LoginResponse = await apiLogin(email, contrasena);
        
        // Simulación de usuario para el frontend
        const loggedUser: Usuario = { id: response.user_id, email: email, nombre: email.split('@')[0] }; 
        
        setToken(response.access_token);
        setUser(loggedUser);
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('authUser', JSON.stringify(loggedUser));
        router.push('/'); // Redirigir al inicio
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        router.push('/login');
    };

    const handleRegister = async (nombre: string, email: string, contrasena: string) => {
        await apiRegister(nombre, email, contrasena);
        router.push('/login'); // Redirigir a login después de registro exitoso
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, login: handleLogin, register: handleRegister, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};