from sqlmodel import create_engine, SQLModel, Session, select
from typing import Generator
import json
import os
from models.users import Usuario # Importamos desde models/
from models.productos import Producto, Carrito, ItemCarrito, Compra, ItemCompra # Importamos desde models/

# Configuración de la Base de Datos SQLite
sqlite_file_name = "database.db"
# Usamos check_same_thread=False para FastAPI (multithreading)
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})

def load_initial_data(session: Session):
    """Carga los productos desde el JSON si la DB está vacía."""
    if session.exec(select(Producto)).first():
        return # Ya hay productos, no hacer nada.
    
    # Ruta al archivo productos.json
    try:
        # La ruta asume que main.py y productos.json están en la raíz del backend
        path = os.path.join(os.path.dirname(__file__), "..", "..", "productos.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("ADVERTENCIA: El archivo productos.json no fue encontrado.")
        return
        
    for item in data:
        # Mapeo CRUCIAL: 'titulo' a 'nombre' y 'imagen' a 'imagen_url'
        producto = Producto(
            nombre=item["titulo"],
            descripcion=item["descripcion"],
            precio=item["precio"],
            categoria=item["categoria"],
            existencia=item["existencia"],
            imagen_url=item["imagen"]
        ) 
        session.add(producto)
        
    session.commit()
    print(f"Carga inicial completada. {len(data)} productos agregados.")

def create_db_and_tables():
    """Crea las tablas y carga los datos iniciales."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        load_initial_data(session)

def get_session() -> Generator[Session, None, None]:
    """Dependencia para obtener una sesión de DB para los endpoints."""
    with Session(engine) as session:
        yield session