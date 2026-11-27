from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_devices_list_ok():
    response = client.get("/api/devices")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "items" in data["data"]
    assert "total" in data["data"]

def test_devices_list_invalid_status():
    response = client.get("/api/devices?status=invalid")
    assert response.status_code == 400
    assert response.json()["code"] == 400

def test_stats_ok():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "device_total" in data["data"]
    assert data["data"]["device_normal"] + data["data"]["device_faulty"] == data["data"]["device_total"]