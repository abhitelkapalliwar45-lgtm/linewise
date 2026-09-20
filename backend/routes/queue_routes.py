from fastapi import APIRouter, HTTPException
from backend.database import db
from backend.models import (
    CreateQueueRequest,
    JoinQueueRequest,
    VerifyOtpRequest,
    QueueResponse,
    TicketResponse,
    AdminDashboardResponse
)

router = APIRouter(prefix="/api/queues", tags=["Queues"])

@router.post("/create")
def create_queue(req: CreateQueueRequest):
    queue = db.create_queue(
        name=req.name,
        category=req.category,
        avg_service_time_seconds=req.avg_service_time_seconds
    )
    return {
        "success": True,
        "message": "Queue created successfully",
        "queue": queue,
        "qr_payload": f"linewise://queue/{queue['id']}"
    }

@router.get("/{queue_id}")
def get_queue(queue_id: str):
    queue = db.get_queue(queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    waiting = db.get_waiting_tickets(queue_id)
    srv_ticket = db.get_ticket(queue["serving_ticket_id"]) if queue.get("serving_ticket_id") else None
    cld_ticket = db.get_ticket(queue["called_ticket_id"]) if queue.get("called_ticket_id") else None

    return {
        "id": queue["id"],
        "name": queue["name"],
        "category": queue["category"],
        "status": queue["status"],
        "created_at": queue["created_at"],
        "current_ticket_number": queue["current_ticket_number"],
        "active_waiting_count": len(waiting),
        "currently_serving": srv_ticket,
        "currently_called": cld_ticket,
        "avg_service_time_seconds": queue["avg_service_time_seconds"],
        "total_served": queue["total_served"],
        "total_skipped": queue["total_skipped"],
        "qr_code_payload": f"linewise://queue/{queue['id']}"
    }

@router.post("/{queue_id}/join")
def join_queue(queue_id: str, req: JoinQueueRequest):
    ticket = db.join_queue(
        queue_id=queue_id,
        customer_name=req.customer_name,
        customer_phone=req.customer_phone
    )
    if not ticket:
        raise HTTPException(status_code=400, detail="Queue is closed or inactive.")

    live_ticket = db.get_ticket_live_status(queue_id, ticket["id"])
    return {
        "success": True,
        "message": "Successfully joined the queue!",
        "ticket": live_ticket
    }

@router.get("/{queue_id}/status/{ticket_id}")
def get_ticket_status(queue_id: str, ticket_id: str):
    live_ticket = db.get_ticket_live_status(queue_id, ticket_id)
    if not live_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return live_ticket

@router.post("/{queue_id}/next")
def call_next(queue_id: str):
    ticket = db.call_next_customer(queue_id)
    if not ticket:
        return {
            "success": False,
            "message": "No customers currently waiting in line."
        }
    return {
        "success": True,
        "message": f"Customer {ticket['display_number']} ({ticket['customer_name']}) has been called! OTP generated.",
        "ticket": ticket
    }

@router.post("/{queue_id}/verify-otp")
def verify_otp(queue_id: str, req: VerifyOtpRequest):
    res = db.verify_otp(queue_id, req.ticket_id, req.otp)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.post("/{queue_id}/complete/{ticket_id}")
def complete_service(queue_id: str, ticket_id: str):
    ticket = db.complete_service(queue_id, ticket_id)
    if not ticket:
        raise HTTPException(status_code=400, detail="Unable to complete ticket.")
    return {
        "success": True,
        "message": f"Service for ticket {ticket['display_number']} completed!",
        "ticket": ticket
    }

@router.post("/{queue_id}/skip/{ticket_id}")
def skip_customer(queue_id: str, ticket_id: str):
    ticket = db.skip_ticket(queue_id, ticket_id)
    if not ticket:
        raise HTTPException(status_code=400, detail="Unable to skip ticket.")
    return {
        "success": True,
        "message": f"Customer {ticket['display_number']} was marked SKIPPED.",
        "ticket": ticket
    }

@router.get("/{queue_id}/admin-dashboard")
def get_admin_dashboard(queue_id: str):
    queue = db.get_queue(queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    waiting = db.get_waiting_tickets(queue_id)
    srv_ticket = db.get_ticket(queue["serving_ticket_id"]) if queue.get("serving_ticket_id") else None
    cld_ticket = db.get_ticket(queue["called_ticket_id"]) if queue.get("called_ticket_id") else None

    # Get live metrics & historical served tickets
    predictor = db.get_predictor(queue_id, queue["avg_service_time_seconds"])

    served_history = db.get_completed_or_skipped_tickets(queue_id)

    return {
        "queue": {
            "id": queue["id"],
            "name": queue["name"],
            "category": queue["category"],
            "status": queue["status"],
            "created_at": queue["created_at"],
            "current_ticket_number": queue["current_ticket_number"],
            "active_waiting_count": len(waiting),
            "currently_serving": srv_ticket,
            "currently_called": cld_ticket,
            "avg_service_time_seconds": queue["avg_service_time_seconds"],
            "total_served": queue["total_served"],
            "total_skipped": queue["total_skipped"],
            "qr_code_payload": f"linewise://queue/{queue['id']}"
        },
        "waiting_tickets": waiting,
        "served_history": served_history,
        "ml_metrics": predictor.get_metrics()
    }
