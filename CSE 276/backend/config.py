import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent

# Load .env file from project root or backend directory
env_path = BASE_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'gctp_college_major_project_secret_key_default')
    
    # SQLite Database URI
    db_name = 'gctp.db'
    db_path = BASE_DIR / db_name
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    
    # AI Engine Configuration
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'demo').lower()
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    
    # CORS Configuration
    CORS_ORIGINS = [
        origin.strip() for origin in os.getenv(
            'CORS_ORIGINS',
            'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5000'
        ).split(',') if origin.strip()
    ]
