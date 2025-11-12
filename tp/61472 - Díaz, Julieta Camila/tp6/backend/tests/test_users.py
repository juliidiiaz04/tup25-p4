from fastapi.testclient import TestClient
# CORRECCIÓN DEFINITIVA: Importación absoluta desde el directorio raíz
from main import app 


client = TestClient(app)

USER_DATA = {
    "nombre": "Prueba User",
    "email": "prueba@parcial.com",
    "contrasena": "pass1234"
}
LOGIN_DATA = {"email": USER_DATA["email"], "contrasena": "pass1234"}


def test_root_status():
    """Verifica que la API base esté corriendo."""
    response = client.get("/")
    assert response.status_code == 200
    assert "TP6 E-Commerce API está corriendo" in response.json()["mensaje"]


def test_register_and_login_flow():
    """Prueba el flujo completo: registro, login y acceso a ruta protegida."""
    
    # 1. Registro Exitoso (201 Created)
    response = client.post("/api/registrar", json=USER_DATA)
    if response.status_code == 400:
        # Si el usuario ya existe por una prueba previa, ignorar y proceder
        print("\nAdvertencia: Usuario de prueba ya registrado. Continuando con Login.")
    else:
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["email"] == USER_DATA["email"]
    
    # 2. Login Exitoso (200 OK)
    response = client.post("/api/iniciar-sesion", json=LOGIN_DATA)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None

    # 3. Acceso a ruta protegida con token (200 OK)
    protected_response = client.post("/api/cerrar-sesion", headers={"Authorization": f"Bearer {token}"})
    assert protected_response.status_code == 200
    
    # 4. Login con credenciales inválidas (401 Unauthorized)
    invalid_data = {"email": USER_DATA["email"], "contrasena": "WrongPass"}
    invalid_response = client.post("/api/iniciar-sesion", json=invalid_data)
    assert invalid_response.status_code == 401
    assert "Credenciales inválidas" in invalid_response.json()["detail"]