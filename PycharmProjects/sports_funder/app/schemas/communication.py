"""
Pydantic schemas for communication system.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal

from app.models.communication import (
    CommunicationType, CommunicationChannel, CommunicationStatus
)


class CommunicationTemplateCreate(BaseModel):
    """Schema for creating communication templates."""
    name: str
    communication_type: CommunicationType
    channel: CommunicationChannel
    subject: Optional[str] = None
    body_text: str
    body_html: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    is_active: bool = True
    send_delay_minutes: int = 0
    target_audience: Optional[str] = None


class CommunicationTemplateResponse(BaseModel):
    """Schema for communication template responses."""
    id: int
    name: str
    communication_type: CommunicationType
    channel: CommunicationChannel
    subject: Optional[str]
    body_text: str
    body_html: Optional[str]
    variables: Optional[Dict[str, Any]]
    is_active: bool
    send_delay_minutes: int
    target_audience: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunicationCreate(BaseModel):
    """Schema for creating communications."""
    communication_type: CommunicationType
    channel: CommunicationChannel
    recipient_name: Optional[str] = None
    recipient_email: Optional[EmailStr] = None
    recipient_phone: Optional[str] = None
    subject: Optional[str] = None
    body_text: str
    body_html: Optional[str] = None
    order_id: Optional[int] = None
    game_id: Optional[int] = None
    team_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class CommunicationResponse(BaseModel):
    """Schema for communication responses."""
    id: int
    template_id: int
    communication_type: CommunicationType
    channel: CommunicationChannel
    status: CommunicationStatus
    recipient_name: Optional[str]
    recipient_email: Optional[str]
    recipient_phone: Optional[str]
    subject: Optional[str]
    body_text: str
    body_html: Optional[str]
    order_id: Optional[int]
    game_id: Optional[int]
    team_id: Optional[int]
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    external_message_id: Optional[str]
    delivery_response: Optional[Dict[str, Any]]
    error_message: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GameCreate(BaseModel):
    """Schema for creating games."""
    game_name: str
    game_type: str
    sport: str
    home_team_id: int
    away_team_id: int
    game_date: datetime
    game_time: Optional[str] = None
    venue: Optional[str] = None
    venue_address: Optional[str] = None
    status: str = "scheduled"
    is_fundraising_game: bool = False
    fundraising_goal: Optional[Decimal] = None
    send_reminders: bool = True
    reminder_days_before: int = 1
    game_metadata: Optional[Dict[str, Any]] = None


class GameResponse(BaseModel):
    """Schema for game responses."""
    id: int
    game_name: str
    game_type: str
    sport: str
    home_team_id: int
    away_team_id: int
    game_date: datetime
    game_time: Optional[str]
    venue: Optional[str]
    venue_address: Optional[str]
    status: str
    home_score: Optional[int]
    away_score: Optional[int]
    winner_team_id: Optional[int]
    is_fundraising_game: bool
    fundraising_goal: Optional[Decimal]
    fundraising_current: Decimal
    send_reminders: bool
    reminder_days_before: int
    game_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunicationPreferenceCreate(BaseModel):
    """Schema for creating communication preferences."""
    user_id: int
    school_id: Optional[int] = None
    team_id: Optional[int] = None
    email_enabled: bool = True
    sms_enabled: bool = True
    push_notifications_enabled: bool = True
    order_notifications: bool = True
    game_reminders: bool = True
    fundraising_updates: bool = True
    special_offers: bool = True
    payment_notifications: bool = True
    email_frequency: str = "immediate"
    sms_frequency: str = "immediate"
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None


class CommunicationPreferenceResponse(BaseModel):
    """Schema for communication preference responses."""
    id: int
    user_id: int
    school_id: Optional[int]
    team_id: Optional[int]
    email_enabled: bool
    sms_enabled: bool
    push_notifications_enabled: bool
    order_notifications: bool
    game_reminders: bool
    fundraising_updates: bool
    special_offers: bool
    payment_notifications: bool
    email_frequency: str
    sms_frequency: str
    quiet_hours_start: Optional[str]
    quiet_hours_end: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunicationStats(BaseModel):
    """Schema for communication statistics."""
    total_communications: int
    sent_communications: int
    delivered_communications: int
    failed_communications: int
    communications_by_type: Dict[str, int]
    communications_by_channel: Dict[str, int]
    delivery_rate: float
    open_rate: float
    click_rate: float


class BulkCommunicationCreate(BaseModel):
    """Schema for creating bulk communications."""
    communication_type: CommunicationType
    channel: CommunicationChannel
    template_id: int
    recipient_ids: List[int]
    template_variables: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
