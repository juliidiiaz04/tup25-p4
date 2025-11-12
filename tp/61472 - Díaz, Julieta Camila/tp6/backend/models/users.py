from typing import Optional, List
from sqlmodel import Field, Relationship, SQLModel
from passlib.context import CryptContext
from pydantic import EmailStr


pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
)

class UsuarioBase(SQLModel):
    nombre: str
    email: EmailStr = Field(unique=True, index=True)

class UsuarioCreate(UsuarioBase):
    contrasena: str 

class UsuarioRead(UsuarioBase):
    id: int

class Login(SQLModel):
    email: EmailStr
    contrasena: str

class Usuario(UsuarioBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contrasena_hashed: str 

    # Definiciones de relaciones inversas
    carritos: List["Carrito"] = Relationship(back_populates="usuario")
    compras: List["Compra"] = Relationship(back_populates="usuario")

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashea la contraseña usando bcrypt."""
        return pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verifica la contraseña contra el hash almacenado."""
        return pwd_context.verify(password, self.contrasena_hashed)