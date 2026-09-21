import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import config
from backend.routes.queue_routes import router as queue_router

app = FastAPI(
    title="LineWise Queue Management API",
    description="Backend REST API, ML Wait-Time Prediction Engine & QVC OTP Verification System for LineWise.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(queue_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "LineWise Backend API",
        "database_type": config.DB_TYPE,
        "docs_url": "/docs"
    }

@app.get("/api/system/test-email")
def test_email_diagnostic(to_email: str = "abhitelkapalliwar45@gmail.com"):
    import smtplib, ssl
    if not config.SMTP_PASSWORD:
        return {"success": False, "error": "SMTP_PASSWORD is missing in server environment variables."}
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=8) as server:
            server.starttls(context=context)
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
        return {"success": True, "message": "SMTP Connection & Auth succeeded on this server!"}
    except Exception as e:
        return {"success": False, "error": str(e), "error_type": type(e).__name__}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=config.HOST, port=config.PORT, reload=True)
