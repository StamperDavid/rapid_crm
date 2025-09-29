"""
API Keys management models for secure key storage and rotation.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.models.base import BaseModel


class ApiKeyStatus(str, enum.Enum):
    """API Key status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    REVOKED = "revoked"


class ApiKeyType(str, enum.Enum):
    """API Key type enumeration."""
    GOOGLE_GEMINI = "google_gemini"
    GOOGLE_PLACES = "google_places"
    TWILIO_SMS = "twilio_sms"
    STRIPE_PAYMENT = "stripe_payment"
    GOOGLE_CLOUD_STORAGE = "google_cloud_storage"
    SENDGRID_EMAIL = "sendgrid_email"


class ApiKey(BaseModel):
    """API Key model for secure key storage and management."""
    
    __tablename__ = "api_keys"
    
    # Key identification
    name = Column(String(200), nullable=False, index=True)  # e.g., "Google Gemini Production"
    key_type = Column(Enum(ApiKeyType), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Key data (encrypted)
    encrypted_key = Column(Text, nullable=False)  # Encrypted API key
    key_hash = Column(String(255), nullable=False, index=True)  # Hash for quick lookup
    
    # Status and lifecycle
    status = Column(Enum(ApiKeyStatus), default=ApiKeyStatus.ACTIVE, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)  # Primary key for this type
    
    # Expiration
    expires_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    
    # Usage tracking
    usage_count = Column(String(20), default=0, nullable=False)
    last_error = Column(Text, nullable=True)
    error_count = Column(String(10), default=0, nullable=False)
    
    # Environment
    environment = Column(String(50), default="production", nullable=False)  # production, staging, development
    
    # Metadata
    created_by = Column(String(100), nullable=True)  # User who created the key
    notes = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ApiKey {self.name} - {self.key_type.value}>"
    
    @property
    def is_expired(self) -> bool:
        """Check if the API key is expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_active(self) -> bool:
        """Check if the API key is active and not expired."""
        return (
            self.status == ApiKeyStatus.ACTIVE and 
            not self.is_expired
        )
    
    def mark_as_used(self):
        """Mark the key as used and update usage count."""
        self.last_used_at = datetime.utcnow()
        self.usage_count = str(int(self.usage_count) + 1)
    
    def record_error(self, error_message: str):
        """Record an error for this API key."""
        self.last_error = error_message
        self.error_count = str(int(self.error_count) + 1)


class ApiKeyUsage(BaseModel):
    """API Key usage tracking for monitoring and analytics."""
    
    __tablename__ = "api_key_usage"
    
    api_key_id = Column(String(20), nullable=False, index=True)
    endpoint = Column(String(200), nullable=False)
    method = Column(String(10), nullable=False)  # GET, POST, etc.
    status_code = Column(String(10), nullable=False)
    response_time_ms = Column(String(20), nullable=True)
    request_size_bytes = Column(String(20), nullable=True)
    response_size_bytes = Column(String(20), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    error_message = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ApiKeyUsage {self.api_key_id} - {self.endpoint}>"

