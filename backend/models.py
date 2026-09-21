from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class TicketStatus(str, Enum):
    WAITING = "WAITING"
    CALLED = "CALLED"             # Front of queue, OTP generated
    IN_SERVICE = "IN_SERVICE"     # OTP verified, service underway
    COMPLETED = "COMPLETED"       # Service completed successfully
    SKIPPED = "SKIPPED"           # 2 failed OTP attempts or absent
    CANCELLED = "CANCELLED"       # Customer left line

class QueueStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"

# --- Request & Response Models ---

class CreateQueueRequest(BaseModel):
    name: str = Field(default="Main Service Desk", description="Name of the service queue counter")
    category: str = Field(default="General", description="Category: Bank, Hospital, College, Govt Office")
    avg_service_time_seconds: int = Field(default=300, description="Initial estimated service duration per user in seconds")

class JoinQueueRequest(BaseModel):
    customer_name: str = Field(..., description="Name of customer joining queue")
    customer_phone: str = Field(default="", description="Optional customer phone number")
    customer_email: str = Field(default="", description="Optional customer email address for notifications")

class VerifyOtpRequest(BaseModel):
    ticket_id: str
    otp: str = Field(..., min_length=4, max_length=4, description="4-digit Queue Verification Code (QVC)")

class TicketResponse(BaseModel):
    id: str
    queue_id: str
    ticket_number: int
    display_number: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    joined_at: str
    status: TicketStatus
    qvc_otp: Optional[str] = None  # Visible to customer when CALLED or IN_SERVICE
    qvc_attempts: int = 0
    position_in_queue: int = 0
    estimated_wait_seconds: int = 0
    estimated_wait_formatted: str = "0 mins"

class QueueResponse(BaseModel):
    id: str
    name: str
    category: str
    status: QueueStatus
    created_at: str
    current_ticket_number: int
    active_waiting_count: int
    currently_serving: Optional[TicketResponse] = None
    currently_called: Optional[TicketResponse] = None
    avg_service_time_seconds: float
    total_served: int
    total_skipped: int
    qr_code_payload: str

class AdminDashboardResponse(BaseModel):
    queue: QueueResponse
    waiting_tickets: List[TicketResponse]
    served_history: List[TicketResponse]
    ml_metrics: dict
