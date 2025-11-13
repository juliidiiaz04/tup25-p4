from fastapi.testclient import TestClient
from main import app 

from app.db import get_session 
from models.users import Usuario
from models.productos import Producto
from sqlmodel import select, Session

client = TestClient(app)


USER_DATA = { "nombre": "Final Test", "email": "final@test.com", "contrasena": "pass1234" }
LOGIN_DATA = {"email": USER_DATA["email"], "contrasena": "pass1234"}


def get_user_token(client: TestClient):
    
    client.post("/api/registrar", json=USER_DATA)
   
    response = client.post("/api/iniciar-sesion", json=LOGIN_DATA)
    return response.json()["access_token"]


def test_checkout_logic_and_stock_update():
    token = get_user_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    
    client.post("/api/carrito", headers=headers, json={"producto_id": 1, "cantidad": 9})
    
   
    client.post("/api/carrito", headers=headers, json={"producto_id": 9, "cantidad": 2})

    
    checkout_response = client.post("/api/carrito/finalizar", headers=headers, json={
        "direccion": "Calle Falsa 123", "tarjeta": "1111"
    })
    
    assert checkout_response.status_code == 200
    final_data = checkout_response.json()
    
    
    assert abs(final_data["total_final"] - 1338.16) < 0.02
    
    
    db = next(get_session())
    ropa = db.exec(select(Producto).where(Producto.id == 1)).first()
    disco = db.exec(select(Producto).where(Producto.id == 9)).first()
    
   
    assert disco.existencia == 3
    
   