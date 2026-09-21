import secrets
import time
from datetime import datetime
from typing import List, Optional

from pymongo import MongoClient, ReturnDocument

from backend.config import config
from backend.ml_engine import MLWaitTimePredictor
from backend.models import QueueStatus, TicketStatus


def generate_qvc_otp() -> str:
    return f"{secrets.randbelow(9000) + 1000}"


def format_wait_time(seconds: int) -> str:
    if seconds <= 0:
        return "Now serving / Next"
    minutes, remaining_seconds = divmod(seconds, 60)
    if minutes == 0:
        return f"{remaining_seconds} sec"
    if remaining_seconds == 0:
        return f"{minutes} min"
    return f"{minutes} min {remaining_seconds} sec"


class DatabaseService:
    """MongoDB-backed storage for queues, tickets, and ML history."""

    def __init__(self):
        if not config.MONGO_URI:
            raise RuntimeError("MONGO_URI is required. Add it to your .env file before starting LineWise.")
        self.mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
        self.mongo_client.admin.command("ping")
        self.mongo_db = self.mongo_client[config.DB_NAME]
        self.mongo_db.queues.create_index("id", unique=True)
        self.mongo_db.tickets.create_index("id", unique=True)
        self.mongo_db.tickets.create_index([("queue_id", 1), ("status", 1), ("ticket_number", 1)])
        self.mongo_db.predictor_states.create_index("queue_id", unique=True)
        print("[DatabaseService] Connected to MongoDB successfully.")

    @staticmethod
    def _without_id(document: Optional[dict]) -> Optional[dict]:
        if document:
            document.pop("_id", None)
        return document

    def get_predictor(self, queue_id: str, default_avg: float = 300.0) -> MLWaitTimePredictor:
        state = self.mongo_db.predictor_states.find_one({"queue_id": queue_id}, {"_id": 0})
        predictor = MLWaitTimePredictor(default_avg_seconds=default_avg)
        for sample in (state or {}).get("completed_samples", []):
            predictor.record_service_completion(sample["duration"], sample["queue_length"])
        return predictor

    def _save_predictor_sample(self, queue_id: str, duration: float, queue_length: int) -> None:
        self.mongo_db.predictor_states.update_one(
            {"queue_id": queue_id},
            {"$push": {"completed_samples": {"duration": duration, "queue_length": queue_length}}},
            upsert=True,
        )

    def create_queue(self, name: str, category: str, avg_service_time_seconds: int) -> dict:
        queue = {"id": f"LW-{secrets.token_hex(4).upper()}", "name": name, "category": category,
                 "status": QueueStatus.ACTIVE.value, "created_at": datetime.now().isoformat(),
                 "current_ticket_number": 100, "serving_ticket_id": None, "called_ticket_id": None,
                 "avg_service_time_seconds": float(avg_service_time_seconds), "total_served": 0, "total_skipped": 0}
        self.mongo_db.queues.insert_one(queue.copy())
        return queue

    def get_queue(self, queue_id: str) -> Optional[dict]:
        return self._without_id(self.mongo_db.queues.find_one({"id": queue_id}))

    def join_queue(self, queue_id: str, customer_name: str, customer_phone: str, customer_email: str = "") -> Optional[dict]:
        queue = self.mongo_db.queues.find_one_and_update(
            {"id": queue_id, "status": QueueStatus.ACTIVE.value}, {"$inc": {"current_ticket_number": 1}},
            return_document=ReturnDocument.AFTER)
        if not queue:
            return None
        number = queue["current_ticket_number"]
        ticket = {"id": f"TKN-{secrets.token_hex(4).upper()}", "queue_id": queue_id,
                  "ticket_number": number, "display_number": f"A-{number}", "customer_name": customer_name,
                  "customer_phone": customer_phone, "customer_email": customer_email, "joined_at": datetime.now().isoformat(),
                  "joined_timestamp": time.time(), "called_at": None, "service_started_at": None,
                  "completed_at": None, "status": TicketStatus.WAITING.value, "qvc_otp": None, "qvc_attempts": 0}
        self.mongo_db.tickets.insert_one(ticket.copy())
        return ticket

    def get_ticket(self, ticket_id: str) -> Optional[dict]:
        return self._without_id(self.mongo_db.tickets.find_one({"id": ticket_id}))

    def get_waiting_tickets(self, queue_id: str) -> List[dict]:
        return list(self.mongo_db.tickets.find({"queue_id": queue_id, "status": TicketStatus.WAITING.value}, {"_id": 0}).sort("ticket_number", 1))

    def get_completed_or_skipped_tickets(self, queue_id: str) -> List[dict]:
        return list(self.mongo_db.tickets.find({"queue_id": queue_id, "status": {"$in": [TicketStatus.COMPLETED.value, TicketStatus.SKIPPED.value]}}, {"_id": 0}).sort("ticket_number", 1))

    def call_next_customer(self, queue_id: str) -> Optional[dict]:
        ticket = self.mongo_db.tickets.find_one_and_update(
            {"queue_id": queue_id, "status": TicketStatus.WAITING.value},
            {"$set": {"status": TicketStatus.CALLED.value, "qvc_otp": generate_qvc_otp(), "qvc_attempts": 0,
                      "called_at": datetime.now().isoformat(), "called_timestamp": time.time()}},
            sort=[("ticket_number", 1)], return_document=ReturnDocument.AFTER)
        if not ticket:
            return None
        self.mongo_db.queues.update_one({"id": queue_id}, {"$set": {"called_ticket_id": ticket["id"]}})
        return self._without_id(ticket)

    def verify_otp(self, queue_id: str, ticket_id: str, otp: str) -> dict:
        ticket = self.get_ticket(ticket_id)
        if not ticket or ticket["queue_id"] != queue_id:
            return {"success": False, "message": "Invalid ticket or queue."}
        if ticket["status"] != TicketStatus.CALLED.value:
            return {"success": False, "message": f"Ticket is in status {ticket['status']}, not CALLED."}
        if ticket["qvc_otp"] == otp:
            ticket = self.mongo_db.tickets.find_one_and_update(
                {"id": ticket_id, "status": TicketStatus.CALLED.value},
                {"$set": {"status": TicketStatus.IN_SERVICE.value, "service_started_at": datetime.now().isoformat(), "service_started_timestamp": time.time()}},
                return_document=ReturnDocument.AFTER)
            self.mongo_db.queues.update_one({"id": queue_id}, {"$set": {"serving_ticket_id": ticket_id, "called_ticket_id": None}})
            return {"success": True, "message": "OTP Verified Successfully! Service Started.", "ticket": self._without_id(ticket)}
        attempts = ticket["qvc_attempts"] + 1
        updates = {"qvc_attempts": attempts}
        if attempts >= 2:
            updates["status"] = TicketStatus.SKIPPED.value
            self.mongo_db.queues.update_one({"id": queue_id}, {"$set": {"called_ticket_id": None}, "$inc": {"total_skipped": 1}})
            message = "Wrong OTP (Attempt 2/2). Customer marked SKIPPED."
        else:
            message = "Incorrect OTP. 1 attempt remaining."
        ticket = self.mongo_db.tickets.find_one_and_update({"id": ticket_id}, {"$set": updates}, return_document=ReturnDocument.AFTER)
        return {"success": False, "message": message, "attempts": attempts, "ticket": self._without_id(ticket)}

    def complete_service(self, queue_id: str, ticket_id: str) -> Optional[dict]:
        ticket, queue = self.get_ticket(ticket_id), self.get_queue(queue_id)
        if not ticket or not queue or ticket["status"] != TicketStatus.IN_SERVICE.value:
            return None
        duration = max(15.0, time.time() - ticket.get("service_started_timestamp", time.time()))
        self._save_predictor_sample(queue_id, duration, len(self.get_waiting_tickets(queue_id)))
        predictor = self.get_predictor(queue_id, queue["avg_service_time_seconds"])
        ticket = self.mongo_db.tickets.find_one_and_update({"id": ticket_id}, {"$set": {"status": TicketStatus.COMPLETED.value, "completed_at": datetime.now().isoformat()}}, return_document=ReturnDocument.AFTER)
        self.mongo_db.queues.update_one({"id": queue_id}, {"$set": {"serving_ticket_id": None, "avg_service_time_seconds": predictor.ema_service_time}, "$inc": {"total_served": 1}})
        return self._without_id(ticket)

    def skip_ticket(self, queue_id: str, ticket_id: str) -> Optional[dict]:
        ticket = self.get_ticket(ticket_id)
        if not ticket or ticket["queue_id"] != queue_id:
            return None
        ticket = self.mongo_db.tickets.find_one_and_update({"id": ticket_id}, {"$set": {"status": TicketStatus.SKIPPED.value}}, return_document=ReturnDocument.AFTER)
        self.mongo_db.queues.update_one({"id": queue_id}, {"$set": {"called_ticket_id": None, "serving_ticket_id": None}, "$inc": {"total_skipped": 1}})
        return self._without_id(ticket)

    def get_ticket_live_status(self, queue_id: str, ticket_id: str) -> Optional[dict]:
        ticket, queue = self.get_ticket(ticket_id), self.get_queue(queue_id)
        if not ticket or not queue:
            return None
        waiting = self.get_waiting_tickets(queue_id)
        position = next((index + 1 for index, item in enumerate(waiting) if item["id"] == ticket_id), 0)
        if ticket["status"] == TicketStatus.CALLED.value:
            position = 1
        predictor = self.get_predictor(queue_id, queue["avg_service_time_seconds"])
        serving = self.get_ticket(queue["serving_ticket_id"]) if queue.get("serving_ticket_id") else None
        estimated = predictor.predict_wait_time(position, (serving or {}).get("service_started_timestamp"), len(waiting))
        return {**ticket, "position_in_queue": position, "estimated_wait_seconds": estimated, "estimated_wait_formatted": format_wait_time(estimated)}


db = DatabaseService()
