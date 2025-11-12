from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Annotated, List
from app.db import get_session
from models.users import Usuario
from models.productos import Producto, Carrito, ItemCarrito
from app.auth import get_current_user
from sqlmodel.main import SQLModel

router = APIRouter(tags=["Carrito"])
SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[Usuario, Depends(get_current_user)]

class ItemAdd(SQLModel):
    producto_id: int
    cantidad: int = 1

# Modelo de respuesta detallado del carrito
class CarritoItemRead(SQLModel):
    producto_id: int
    cantidad: int
    nombre: str
    precio: float
    existencia: int

class CarritoRead(SQLModel):
    id: int
    estado: str
    productos: List[CarritoItemRead]


def get_active_cart(db: Session, user_id: int) -> Carrito:
    """Obtiene el carrito activo del usuario, o crea uno si no existe."""
    carrito = db.exec(
        select(Carrito)
        .where(Carrito.usuario_id == user_id, Carrito.estado == "activo")
    ).first()
    
    if not carrito:
        carrito = Carrito(usuario_id=user_id, estado="activo")
        db.add(carrito)
        db.commit()
        db.refresh(carrito)
    return carrito


# Endpoint POST /api/carrito (Agregar producto)
@router.post("/carrito", status_code=status.HTTP_201_CREATED)
def add_to_cart(item_add: ItemAdd, current_user: CurrentUserDep, db: SessionDep):
    producto = db.get(Producto, item_add.producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    # Regla: Verificar existencia inicial y total
    if producto.existencia == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Producto agotado.")
    if producto.existencia < item_add.cantidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cantidad solicitada excede la existencia.")

    carrito = get_active_cart(db, current_user.id)
    
    item_carrito = db.exec(
        select(ItemCarrito)
        .where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == item_add.producto_id)
    ).first()

    if item_carrito:
        # Si ya existe, verificar que la nueva cantidad total no exceda el stock
        nueva_cantidad_total = item_carrito.cantidad + item_add.cantidad
        if producto.existencia < nueva_cantidad_total:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El stock actual es {producto.existencia}. No se puede agregar más.")
        
        item_carrito.cantidad = nueva_cantidad_total
        db.add(item_carrito)
    else:
        new_item = ItemCarrito(
            carrito_id=carrito.id, producto_id=item_add.producto_id, cantidad=item_add.cantidad
        )
        db.add(new_item)
        
    db.commit()
    return {"message": "Producto agregado al carrito"}


# Endpoint GET /api/carrito (Ver contenido del carrito)
@router.get("/carrito", response_model=CarritoRead)
def view_cart(current_user: CurrentUserDep, db: SessionDep):
    carrito = db.exec(
        select(Carrito)
        .where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")
    ).first()
    
    if not carrito:
        return CarritoRead(id=0, estado="inactivo", productos=[])

    # Cargar los detalles de los productos para el frontend
    productos_en_carrito = []
    for item in carrito.productos:
        producto = db.get(Producto, item.producto_id)
        if producto:
            productos_en_carrito.append(CarritoItemRead(
                producto_id=producto.id, cantidad=item.cantidad, 
                nombre=producto.nombre, precio=producto.precio, 
                existencia=producto.existencia
            ))
            
    return CarritoRead(id=carrito.id, estado=carrito.estado, productos=productos_en_carrito)


# Endpoint DELETE /api/carrito/{product_id} (Quitar producto)
@router.delete("/carrito/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(product_id: int, current_user: CurrentUserDep, db: SessionDep):
    carrito = get_active_cart(db, current_user.id)
    
    item_carrito = db.exec(
        select(ItemCarrito)
        .where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == product_id)
    ).first()

    if not item_carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito.")

    db.delete(item_carrito)
    db.commit()
    return


# Endpoint POST /api/carrito/cancelar (Vaciar carrito)
@router.post("/carrito/cancelar", status_code=status.HTTP_200_OK)
def cancel_cart(current_user: CurrentUserDep, db: SessionDep):
    carrito = get_active_cart(db, current_user.id)
    
    for item in carrito.productos:
        db.delete(item)
        
    db.commit()
    return {"message": "Carrito vaciado exitosamente."}