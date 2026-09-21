import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db

client = TestClient(app)

def test_health_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "LineWise Backend API"

def test_full_queue_workflow():
    # 1. Create a Queue
    create_res = client.post("/api/queues/create", json={
        "name": "Automated Test Counter",
        "category": "Testing Desk",
        "avg_service_time_seconds": 180
    })
    assert create_res.status_code == 200
    queue = create_res.json()["queue"]
    queue_id = queue["id"]
    assert queue_id.startswith("LW-")
    assert queue["name"] == "Automated Test Counter"

    # 2. Get Queue Details
    get_res = client.get(f"/api/queues/{queue_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == queue_id
    assert get_res.json()["active_waiting_count"] == 0

    # 3. Join Customers
    # Customer 1
    join_res1 = client.post(f"/api/queues/{queue_id}/join", json={
        "customer_name": "Test Customer 1",
        "customer_phone": "1234567890",
        "customer_email": "test1@example.com"
    })
    assert join_res1.status_code == 200
    t1 = join_res1.json()["ticket"]
    assert t1["display_number"] == "A-101"
    assert t1["position_in_queue"] == 1

    # Customer 2
    join_res2 = client.post(f"/api/queues/{queue_id}/join", json={
        "customer_name": "Test Customer 2",
        "customer_phone": "9876543210",
        "customer_email": "test2@example.com"
    })
    assert join_res2.status_code == 200
    t2 = join_res2.json()["ticket"]
    assert t2["display_number"] == "A-102"
    assert t2["position_in_queue"] == 2

    # 4. Check Status
    status_res = client.get(f"/api/queues/{queue_id}/status/{t1['id']}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "WAITING"
    assert status_res.json()["position_in_queue"] == 1

    # 5. Check Admin Dashboard
    dash_res = client.get(f"/api/queues/{queue_id}/admin-dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert len(dash_data["waiting_tickets"]) == 2
    assert dash_data["queue"]["active_waiting_count"] == 2

    # 6. Call Next Customer (Customer 1)
    call_res = client.post(f"/api/queues/{queue_id}/next")
    assert call_res.status_code == 200
    called_ticket = call_res.json()["ticket"]
    assert called_ticket["display_number"] == "A-101"
    assert called_ticket["status"] == "CALLED"
    otp = called_ticket["qvc_otp"]
    assert len(otp) == 4

    # 7. Test OTP Verification
    # Wrong OTP
    wrong_otp_res = client.post(f"/api/queues/{queue_id}/verify-otp", json={
        "ticket_id": called_ticket["id"],
        "otp": "0000" if otp != "0000" else "1111"
    })
    assert wrong_otp_res.status_code == 400
    assert "Incorrect OTP" in wrong_otp_res.json()["detail"]

    # Correct OTP
    correct_otp_res = client.post(f"/api/queues/{queue_id}/verify-otp", json={
        "ticket_id": called_ticket["id"],
        "otp": otp
    })
    assert correct_otp_res.status_code == 200
    assert correct_otp_res.json()["success"] is True
    assert correct_otp_res.json()["ticket"]["status"] == "IN_SERVICE"

    # 8. Complete Service
    complete_res = client.post(f"/api/queues/{queue_id}/complete/{called_ticket['id']}")
    assert complete_res.status_code == 200
    assert complete_res.json()["ticket"]["status"] == "COMPLETED"

    # 9. Call Customer 2 and Skip
    call_res2 = client.post(f"/api/queues/{queue_id}/next")
    assert call_res2.status_code == 200
    c2 = call_res2.json()["ticket"]
    assert c2["display_number"] == "A-102"

    skip_res = client.post(f"/api/queues/{queue_id}/skip/{c2['id']}")
    assert skip_res.status_code == 200
    assert skip_res.json()["ticket"]["status"] == "SKIPPED"

    # 10. Dashboard should now have 0 waiting, 1 served, 1 skipped
    dash_final = client.get(f"/api/queues/{queue_id}/admin-dashboard").json()
    assert dash_final["queue"]["active_waiting_count"] == 0
    assert dash_final["queue"]["total_served"] == 1
    assert dash_final["queue"]["total_skipped"] == 1
    assert len(dash_final["served_history"]) == 2