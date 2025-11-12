from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import timedelta
from typing import Annotated

from ..db import get_session # Usamos '..' para subir de 'routers' a 'app'
from models.users import Usuario, UsuarioCreate, Login, UsuarioRead 
from ..auth import create_access_token, get_current_user # Usamos '..' para subir de 'routers' a 'app'

router = APIRouter(tags=["Autenticación"])
SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[Usuario, Depends(get_current_user)]


@router.post("/registrar", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UsuarioCreate, db: SessionDep):
    """Crea un nuevo usuario, verifica si el email ya existe."""
    existing_user = db.exec(select(Usuario).where(Usuario.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")
    
    hashed_password = Usuario.hash_password(user_in.contrasena)
    db_user = Usuario(nombre=user_in.nombre, email=user_in.email, contrasena_hashed=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/iniciar-sesion")
def login_for_access_token(form_data: Login, db: SessionDep):
    """Valida credenciales y devuelve el token JWT."""
    user = db.exec(select(Usuario).where(Usuario.email == form_data.email)).first()
    
    if not user or not user.verify_password(form_data.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Retornamos el user_id, esencial para el frontend
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}


@router.post("/cerrar-sesion", status_code=status.HTTP_200_OK)
def logout_user(current_user: CurrentUserDep):
    """Ruta protegida simple para verificar el token y cerrar sesión (lógica en el frontend)."""
    return {"message": f"Sesión cerrada para el usuario {current_user.email}"}