import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")
    MONGO_URI = os.getenv("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME", "linewise_db")
    DB_TYPE = "mongodb"
    SECRET_KEY = os.getenv("SECRET_KEY", "linewise-super-secret-key-2026")
    DEFAULT_AVG_SERVICE_TIME = int(os.getenv("DEFAULT_AVG_SERVICE_TIME", 300))  # 5 minutes in seconds
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "abhitelkapalliwar45@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

config = Config()
