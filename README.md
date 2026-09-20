# LineWise - Smart Digital Queue Management & AI Wait-Time Prediction System

LineWise is a modern digital queue management system featuring real-time queue tracking, AI wait-time prediction (Linear Regression + Moving Average), and 4-digit Queue Verification Code (QVC) OTP authentication.

---

## 🚀 Running the Project

Both the **Backend Server** and **Frontend Web Application** are currently active and running.

### Quick Server Links
- **Frontend App**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend API Root**: [http://localhost:8000/](http://localhost:8000/)

---

## 🛠️ Manual Execution Commands

### 1. Start Backend Server (Python FastAPI)
```bash
cd backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend App (React + Vite)
```bash
cd frontend
npm run dev
```

---

## 📁 System Architecture

```text
├── backend/
│   ├── main.py              # FastAPI entry point & CORS configuration
│   ├── config.py            # Environment & database settings
│   ├── database.py          # MongoDB / Resilient SQLite storage manager
│   ├── models.py            # Pydantic schemas (Queue, Ticket, QVC OTP, Stats)
│   ├── ml_engine.py         # AI Wait-Time Predictor (Linear Regression + EMA)
│   └── routes/
│       └── queue_routes.py  # REST API endpoints for queue management
├── frontend/
│   ├── src/
│   │   ├── services/api.js  # API Client service connecting to backend
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero & features landing page
│   │   │   ├── GetStarted.jsx       # Options menu
│   │   │   ├── GenerateCode.jsx     # Admin queue creation & QR generator
│   │   │   ├── ScanCode.jsx         # Code scanner / manual input
│   │   │   ├── JoinQueue.jsx        # Customer join queue page
│   │   │   ├── CustomerTicket.jsx   # Live customer ticket & 4-digit OTP view
│   │   │   └── AdminDashboard.jsx   # Counter admin desk & OTP verification panel
│   │   └── App.jsx          # React Router setup
```

---

## 🔑 Key Workflow & Verification
1. **Admin Activates Queue**: Navigates to `/generate-code`, starts counter, and displays live QR code.
2. **Customer Joins**: Customer scans QR code on phone $\rightarrow$ opens `/join/:queueId` $\rightarrow$ enters name to receive ticket.
3. **Live Countdown & OTP**: Customer views live position, ML predicted wait time on `/ticket/:queueId/:ticketId`. When called, a **4-digit QVC OTP** is generated on screen.
4. **Admin Verification & Service**: Admin enters OTP on `/admin/:queueId`. Upon verification, service begins. Completing service logs actual duration into the ML model to refine future predictions!
