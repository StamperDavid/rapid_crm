"""
Application configuration settings using Pydantic Settings.
"""
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    APP_NAME: str = "Sports Funder"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    DATABASE_URL_ASYNC: Optional[str] = None
    
    # Google Cloud
    GOOGLE_CLOUD_PROJECT: Optional[str] = ""
    GOOGLE_API_KEY: Optional[str] = ""
    GOOGLE_PLACES_API_KEY: Optional[str] = ""
    
    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = ""
    TWILIO_AUTH_TOKEN: Optional[str] = ""
    TWILIO_PHONE_NUMBER: Optional[str] = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # QR Code Settings
    QR_CODE_BASE_URL: str = "https://sportsfunder.app"
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    @validator("GOOGLE_CLOUD_PROJECT", "GOOGLE_API_KEY", "GOOGLE_PLACES_API_KEY", 
               "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v
    
    class Config:
        env_file = "local.env"
        case_sensitive = True


# Global settings instance
settings = Settings()

