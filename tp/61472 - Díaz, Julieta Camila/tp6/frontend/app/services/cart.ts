import { CarritoRead, CompraReadDetail, CompraReadSummary } from '../types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthHeaders(token: string) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}



export async function fetchCart(token: string): Promise<CarritoRead> {
    const response = await fetch(`${API_BASE_URL}/carrito`, {
        headers: getAuthHeaders(token),
        cache: 'no-store'
    });

    if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicie sesión.");
    }
    if (!response.ok) {
        throw new Error('Error al obtener el carrito.');
    }
    return response.json();
}



export async function addItemToCart(token: string, producto_id: number, cantidad: number = 1) {
    const response = await fetch(`${API_BASE_URL}/carrito`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ producto_id, cantidad }),
    });

    if (!response.ok) {
        const error = await response.json();
        
        throw new Error(error.detail || 'Fallo al agregar producto. Stock insuficiente.');
    }
    return response.json();
}



export async function removeItemFromCart(token: string, producto_id: number) {
    const response = await fetch(`${API_BASE_URL}/carrito/${producto_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });

    if (response.status === 404) {
        throw new Error("El producto no está en el carrito.");
    }
    
    if (!response.ok && response.status !== 204) {
        throw new Error('Error al quitar producto.');
    }
}



interface CheckoutPayload {
    direccion: string;
    tarjeta: string; 
}
export async function finalizeCheckout(token: string, payload: CheckoutPayload) {
    const response = await fetch(`${API_BASE_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        
        throw new Error(error.detail || 'Error al finalizar la compra.');
    }
    return response.json(); 
}


export async function fetchPurchaseHistory(token: string): Promise<CompraReadSummary[]> {
    const response = await fetch(`${API_BASE_URL}/compras`, {
        headers: getAuthHeaders(token),
        cache: 'no-store'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al cargar el historial de compras.');
    }
    return response.json();
}


export async function fetchPurchaseDetail(token: string, compraId: number): Promise<CompraReadDetail> {
    const response = await fetch(`${API_BASE_URL}/compras/${compraId}`, {
        headers: getAuthHeaders(token),
        cache: 'no-store'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al cargar el detalle de la compra.');
    }
    return response.json();
}