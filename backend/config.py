import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")
    MONGO_URI = os.getenv("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME", "linewise_db")
    DB_TYPE = "mongodb"
    SECRET_KEY = os.getenv("SECRET_KEY", "linewise-super-secret-key-2026")
    DEFAULT_AVG_SERVICE_TIME = int(os.getenv("DEFAULT_AVG_SERVICE_TIME", 300))  # 5 minutes in seconds

config = Config()
