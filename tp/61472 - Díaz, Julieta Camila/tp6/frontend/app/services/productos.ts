import { Producto } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProductFetchParams {
    q?: string; // Mapea al parámetro 'buscar' del backend
    category?: string; // Mapea al parámetro 'categoria' del backend
    token?: string;
}

export async function getProductos(params: ProductFetchParams = {}): Promise<Producto[]> {
    
    const url = new URL(`${API_BASE_URL}/api/productos`);

    
    if (params.q) {
        url.searchParams.append('buscar', params.q); 
    }
    if (params.category && params.category !== 'Todas las categorías') {
        url.searchParams.append('categoria', params.category);
    }
    
    
    const response = await fetch(url.toString(), {
        cache: 'no-store'
    });
    
    if (!response.ok) {
        throw new Error('Error al obtener productos');
    }
    
    const data: any[] = await response.json();
    
    
    return data.map(item => ({
        ...item,
        titulo: item.nombre,      
        imagen: `${API_BASE_URL}/${item.imagen_url}`, // Usamos la URL completa para el componente <Image>
    })) as Producto[];
}


export { getProductos as obtenerProductos };