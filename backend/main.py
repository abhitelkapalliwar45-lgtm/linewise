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

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=config.HOST, port=config.PORT, reload=True)
