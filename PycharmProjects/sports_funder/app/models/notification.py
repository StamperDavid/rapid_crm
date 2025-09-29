"""
Notification and communication models.
"""
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Enum, DateTime, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class NotificationType(str, enum.Enum):
    """Notification type enumeration."""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationStatus(str, enum.Enum):
    """Notification status enumeration."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class Notification(BaseModel):
    """Notification model for tracking communications."""
    
    __tablename__ = "notifications"
    
    type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False)
    
    # Content
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    template_id = Column(String(100), nullable=True)
    
    # Recipient
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Delivery tracking
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    # Provider data
    provider_message_id = Column(String(200), nullable=True)
    provider_response = Column(Text, nullable=True)
    
    # Relationships
    recipient_user = relationship("User")
    
    def __repr__(self):
        return f"<Notification {self.type} to {self.recipient_email}>"


class NotificationTemplate(BaseModel):
    """Notification template model for reusable message templates."""
    
    __tablename__ = "notification_templates"
    
    name = Column(String(100), nullable=False, unique=True)
    type = Column(Enum(NotificationType), nullable=False)
    subject = Column(String(200), nullable=True)
    body = Column(Text, nullable=False)
    
    # Template variables (JSON string)
    variables = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f"<NotificationTemplate {self.name}>"

