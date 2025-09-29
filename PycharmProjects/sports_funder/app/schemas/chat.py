"""
Chat Schemas
Pydantic models for chat API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ChatMessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"


class ChatUserRole(str, Enum):
    TEAM_MEMBER = "team_member"
    STAFF = "staff"
    SUPPORTER = "supporter"
    COACH = "coach"
    ASSISTANT_COACH = "assistant_coach"


class ChatMessageResponse(BaseModel):
    """Chat message response schema"""
    id: int
    participant_id: int
    display_name: str
    role: str
    content: str
    message_type: str
    created_at: datetime
    is_edited: bool = False
    reactions: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class ChatParticipantResponse(BaseModel):
    """Chat participant response schema"""
    id: int
    user_id: int
    display_name: str
    role: str
    is_online: bool
    last_seen: Optional[datetime] = None
    joined_at: datetime
    can_send_messages: bool
    is_moderator: bool = False

    class Config:
        from_attributes = True


class ChatRoomResponse(BaseModel):
    """Chat room response schema"""
    id: int
    team_id: int
    school_id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    allow_team_members: bool
    allow_staff: bool
    allow_supporters: bool
    allow_coaches: bool
    require_approval: bool
    max_message_length: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageRequest(BaseModel):
    """Chat message request schema"""
    content: str = Field(..., min_length=1, max_length=1000)
    message_type: ChatMessageType = ChatMessageType.TEXT


class ChatJoinRequest(BaseModel):
    """Chat join request schema"""
    user_id: int
    team_id: int


class ChatReactionRequest(BaseModel):
    """Chat reaction request schema"""
    message_id: int
    reaction_type: str = Field(..., regex="^(like|heart|laugh|thumbs_up|thumbs_down)$")
    emoji: Optional[str] = None


class ChatReactionResponse(BaseModel):
    """Chat reaction response schema"""
    id: int
    message_id: int
    participant_id: int
    reaction_type: str
    emoji: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WebSocketMessage(BaseModel):
    """WebSocket message schema"""
    type: str
    data: Dict[str, Any]


class ChatTypingIndicator(BaseModel):
    """Chat typing indicator schema"""
    participant_id: int
    display_name: str
    is_typing: bool


class ChatOnlineStatus(BaseModel):
    """Chat online status schema"""
    participant_id: int
    is_online: bool
    last_seen: Optional[datetime] = None


class ChatRoomSettings(BaseModel):
    """Chat room settings schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    allow_team_members: Optional[bool] = None
    allow_staff: Optional[bool] = None
    allow_supporters: Optional[bool] = None
    allow_coaches: Optional[bool] = None
    require_approval: Optional[bool] = None
    max_message_length: Optional[int] = Field(None, ge=100, le=5000)


class ChatModerationAction(BaseModel):
    """Chat moderation action schema"""
    action_type: str = Field(..., regex="^(ban|mute|delete_message|warn)$")
    target_participant_id: Optional[int] = None
    target_message_id: Optional[int] = None
    reason: Optional[str] = None
    duration: Optional[int] = Field(None, ge=1, le=10080)  # Max 1 week in minutes


class ChatStatistics(BaseModel):
    """Chat statistics schema"""
    room_id: int
    total_messages: int
    total_participants: int
    online_participants: int
    messages_today: int
    most_active_participant: Optional[str] = None
    last_activity: Optional[datetime] = None
