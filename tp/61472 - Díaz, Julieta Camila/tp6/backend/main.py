from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager


from app.db import create_db_and_tables 
from app.routers import users
from app.routers import products 

# Importamos los modelos (para que SQLModel los vea al crear la DB)
from models.users import Usuario
from models.productos import Producto, Carrito, ItemCarrito, Compra, ItemCompra

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Función que se ejecuta al iniciar la aplicación."""
    # Esto llama a la creación de tablas, la corrección de relaciones y la carga de productos.json
    create_db_and_tables() 
    print("Base de datos lista con datos iniciales")
    yield

app = FastAPI(title="TP6 E-Commerce API", lifespan=lifespan)

# --- Montar directorio de imágenes ---
# Esto hace que 'http://localhost:8000/imagenes/nombre.jpg' funcione
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# --- Configurar CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Incluir Routers ---
app.include_router(users.router, prefix="/api") 
app.include_router(products.router, prefix="/api") # <-- Router de productos activo


@app.get("/")
def root():
    """Ruta base para verificar que la API está corriendo."""
    return {"mensaje": "TP6 E-Commerce API está corriendo. Use /api/productos."}