from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional, Annotated
from ..db import get_session
from models.productos import Producto 
from sqlmodel.main import SQLModel # Usado para el modelo de respuesta

router = APIRouter(tags=["Productos"])
SessionDep = Annotated[Session, Depends(get_session)]

class ProductoRead(SQLModel):
    # Modelo de lectura que coincide con la salida del modelo Producto
    id: int
    nombre: str
    descripcion: str
    precio: float
    categoria: str
    existencia: int
    imagen_url: Optional[str] # Usado para mapear a 'imagen' en el frontend

# Endpoint Listar y filtrar (2.1 - 2.4)
@router.get("/productos", response_model=List[ProductoRead])
def get_products(
    db: SessionDep,
    buscar: Optional[str] = Query(None, description="Término de búsqueda"),
    categoria: Optional[str] = Query(None, description="Filtro por categoría")
):
    """Obtiene la lista de productos con filtros opcionales."""
    query = select(Producto)
    
    # Aplicar filtro por categoría
    if categoria:
        query = query.where(Producto.categoria == categoria)
        
    # Aplicar búsqueda por contenido (nombre o descripción)
    if buscar:
        search_term = f"%{buscar}%"
        query = query.where(
            (Producto.nombre.like(search_term)) | 
            (Producto.descripcion.like(search_term))
        )
        
    productos = db.exec(query).all()
    return productos


# Endpoint Detalle (2.5 - 2.6)
@router.get("/productos/{producto_id}", response_model=ProductoRead)
def get_product_detail(producto_id: int, db: SessionDep):
    """Obtiene los detalles de un producto específico."""
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    return producto