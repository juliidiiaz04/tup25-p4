from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel


class ProductoBase(SQLModel):
    nombre: str = Field(default="", max_length=255, index=True) 
    descripcion: str = Field(default="")
    precio: float = Field(default=0.0, ge=0)
    categoria: str = Field(default="", max_length=100, index=True)
    existencia: int = Field(default=0, ge=0)
    imagen_url: Optional[str] = Field(default=None) 

class Producto(ProductoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_items: List["ItemCarrito"] = Relationship(back_populates="producto")
    compra_items: List["ItemCompra"] = Relationship(back_populates="producto")

# --- 2. Carrito y su Ítem ---
class ItemCarrito(SQLModel, table=True):
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", primary_key=True)
    cantidad: int = Field(default=1, ge=1)

    producto: Producto = Relationship(back_populates="carrito_items")
    carrito: "Carrito" = Relationship(back_populates="productos")

class CarritoBase(SQLModel):
    estado: str = Field(default="activo", max_length=20) 

class Carrito(CarritoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True) 
    productos: List[ItemCarrito] = Relationship(back_populates="carrito") 

# --- 3. Compra y su Ítem (Historial) ---
class ItemCompra(SQLModel, table=True):
    compra_id: int = Field(foreign_key="compra.id", primary_key=True)
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    cantidad: int
    nombre: str 
    precio_unitario: float 

    producto: Producto = Relationship(back_populates="compra_items")
    compra: "Compra" = Relationship(back_populates="items")

class CompraBase(SQLModel):
    fecha: str
    direccion: str
    tarjeta: str
    total: float 
    envio: float 

class Compra(CompraBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    items: List[ItemCompra] = Relationship(back_populates="compra")