export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
}

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user_id: number;
}