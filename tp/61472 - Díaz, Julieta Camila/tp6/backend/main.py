from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.db import create_db_and_tables 
from app.routers import users
from models.users import Usuario
from models.productos import Producto, Carrito, ItemCarrito, Compra, ItemCompra

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Función que se ejecuta al iniciar la aplicación."""
    create_db_and_tables() 
    print("Base de datos lista con datos iniciales")
    yield

app = FastAPI(title="TP6 E-Commerce API", lifespan=lifespan)

# --- Montar directorio de imágenes ---
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# --- Configurar CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")

# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)
    
    @app.get("/")
    def root():
        return {"mensaje": "TP6 E-Commerce API está corriendo. Use /api/productos."}

