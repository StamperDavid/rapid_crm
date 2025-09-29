"""
Communication models for intelligent auto text/email system.
Integrated with e-commerce and game schedules.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel
import enum


class CommunicationType(enum.Enum):
    """Types of automated communications."""
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    GAME_REMINDER = "game_reminder"
    GAME_SCHEDULE_CHANGE = "game_schedule_change"
    GAME_RESULT = "game_result"
    FUNDRAISING_LAUNCH = "fundraising_launch"
    FUNDRAISING_UPDATE = "fundraising_update"
    PRODUCT_AVAILABLE = "product_available"
    LOW_INVENTORY = "low_inventory"
    SPECIAL_OFFER = "special_offer"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"


class CommunicationChannel(enum.Enum):
    """Communication channels."""
    EMAIL = "email"
    SMS = "sms"
    PUSH_NOTIFICATION = "push_notification"


class CommunicationStatus(enum.Enum):
    """Communication status."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"


class CommunicationTemplate(BaseModel):
    """Templates for automated communications."""
    
    __tablename__ = "communication_templates"
    
    name = Column(String(255), nullable=False)
    communication_type = Column(Enum(CommunicationType), nullable=False)
    channel = Column(Enum(CommunicationChannel), nullable=False)
    
    # Template content
    subject = Column(String(500), nullable=True)  # For email
    body_text = Column(Text, nullable=False)  # Plain text version
    body_html = Column(Text, nullable=True)  # HTML version for email
    
    # Template variables (JSON)
    variables = Column(JSON, nullable=True)  # Available template variables
    
    # Scheduling
    is_active = Column(Boolean, default=True, nullable=False)
    send_delay_minutes = Column(Integer, default=0, nullable=False)  # Delay before sending
    
    # Targeting
    target_audience = Column(String(100), nullable=True)  # e.g., "customers", "players", "parents"
    
    # Relationships
    communications = relationship("Communication", back_populates="template")


class Communication(BaseModel):
    """Individual communication records."""
    
    __tablename__ = "communications"
    
    # Template reference
    template_id = Column(Integer, ForeignKey("communication_templates.id"), nullable=False)
    
    # Communication details
    communication_type = Column(Enum(CommunicationType), nullable=False)
    channel = Column(Enum(CommunicationChannel), nullable=False)
    status = Column(Enum(CommunicationStatus), default=CommunicationStatus.PENDING, nullable=False)
    
    # Recipient information
    recipient_name = Column(String(255), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    
    # Content (final rendered content)
    subject = Column(String(500), nullable=True)
    body_text = Column(Text, nullable=False)
    body_html = Column(Text, nullable=True)
    
    # Related entities
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("ecommerce_orders.id"), nullable=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=True)
    
    # Timing
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Delivery details
    external_message_id = Column(String(255), nullable=True)  # From email/SMS provider
    delivery_response = Column(JSON, nullable=True)  # Provider response
    error_message = Column(Text, nullable=True)
    
    # Metadata
    communication_metadata = Column(JSON, nullable=True)
    
    # Relationships
    template = relationship("CommunicationTemplate", back_populates="communications")
    school = relationship("School")
    team = relationship("Team")
    player = relationship("Player")
    order = relationship("EcommerceOrder")
    game = relationship("Game")


class Game(BaseModel):
    """Game/schedule information for sports teams."""
    
    __tablename__ = "games"
    
    # Game details
    game_name = Column(String(255), nullable=False)
    game_type = Column(String(100), nullable=False)  # e.g., "regular", "playoff", "championship"
    sport = Column(String(100), nullable=False)
    
    # Teams
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Schedule
    game_date = Column(DateTime, nullable=False)
    game_time = Column(String(20), nullable=True)  # e.g., "7:00 PM"
    venue = Column(String(255), nullable=True)
    venue_address = Column(Text, nullable=True)
    
    # Game status
    status = Column(String(50), default="scheduled", nullable=False)  # scheduled, in_progress, completed, cancelled, postponed
    
    # Results (if completed)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    winner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Special events
    is_fundraising_game = Column(Boolean, default=False, nullable=False)
    fundraising_goal = Column(Numeric(10, 2), nullable=True)
    fundraising_current = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    # Communication settings
    send_reminders = Column(Boolean, default=True, nullable=False)
    reminder_days_before = Column(Integer, default=1, nullable=False)  # Days before game to send reminder
    
    # Metadata
    game_metadata = Column(JSON, nullable=True)
    
    # Relationships
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    communications = relationship("Communication", back_populates="game")


class CommunicationPreference(BaseModel):
    """User communication preferences."""
    
    __tablename__ = "communication_preferences"
    
    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Channel preferences
    email_enabled = Column(Boolean, default=True, nullable=False)
    sms_enabled = Column(Boolean, default=True, nullable=False)
    push_notifications_enabled = Column(Boolean, default=True, nullable=False)
    
    # Communication type preferences
    order_notifications = Column(Boolean, default=True, nullable=False)
    game_reminders = Column(Boolean, default=True, nullable=False)
    fundraising_updates = Column(Boolean, default=True, nullable=False)
    special_offers = Column(Boolean, default=True, nullable=False)
    payment_notifications = Column(Boolean, default=True, nullable=False)
    
    # Frequency preferences
    email_frequency = Column(String(50), default="immediate", nullable=False)  # immediate, daily, weekly
    sms_frequency = Column(String(50), default="immediate", nullable=False)
    
    # Quiet hours
    quiet_hours_start = Column(String(10), nullable=True)  # e.g., "22:00"
    quiet_hours_end = Column(String(10), nullable=True)    # e.g., "08:00"
    
    # Relationships
    user = relationship("User")
    school = relationship("School")
    team = relationship("Team")


class CommunicationLog(BaseModel):
    """Log of all communication activities for analytics."""
    
    __tablename__ = "communication_logs"
    
    communication_id = Column(Integer, ForeignKey("communications.id"), nullable=False)
    
    # Event details
    event_type = Column(String(100), nullable=False)  # sent, delivered, opened, clicked, bounced, failed
    event_timestamp = Column(DateTime, default=func.now(), nullable=False)
    
    # Event data
    event_data = Column(JSON, nullable=True)
    
    # Relationships
    communication = relationship("Communication")
