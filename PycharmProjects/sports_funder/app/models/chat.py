"""
Chat Models for Team Communication
Real-time chat system for team members, staff, and supporters
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum


class ChatMessageType(enum.Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"


class ChatUserRole(enum.Enum):
    TEAM_MEMBER = "team_member"
    STAFF = "staff"
    SUPPORTER = "supporter"
    COACH = "coach"
    ASSISTANT_COACH = "assistant_coach"


class TeamChatRoom(Base):
    """Chat rooms for teams"""
    __tablename__ = "team_chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    
    # Room settings
    name = Column(String(255), default="Team Chat")
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Privacy settings
    allow_team_members = Column(Boolean, default=True)
    allow_staff = Column(Boolean, default=True)
    allow_supporters = Column(Boolean, default=True)
    allow_coaches = Column(Boolean, default=True)
    
    # Moderation
    require_approval = Column(Boolean, default=False)
    max_message_length = Column(Integer, default=1000)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team = relationship("Team")
    school = relationship("School")
    messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")
    participants = relationship("ChatParticipant", back_populates="room", cascade="all, delete-orphan")


class ChatParticipant(Base):
    """Users participating in team chat"""
    __tablename__ = "chat_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("team_chat_rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Participant info
    display_name = Column(String(255), nullable=False)  # First name + Last initial
    role = Column(Enum(ChatUserRole), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True))
    
    # Permissions
    can_send_messages = Column(Boolean, default=True)
    can_send_images = Column(Boolean, default=True)
    can_send_files = Column(Boolean, default=False)
    is_moderator = Column(Boolean, default=False)
    
    # Timestamps
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    room = relationship("TeamChatRoom", back_populates="participants")
    user = relationship("User")
    messages = relationship("ChatMessage", back_populates="participant", cascade="all, delete-orphan")


class ChatMessage(Base):
    """Individual chat messages"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("team_chat_rooms.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("chat_participants.id"), nullable=False)
    
    # Message content
    message_type = Column(Enum(ChatMessageType), default=ChatMessageType.TEXT)
    content = Column(Text, nullable=False)
    
    # Media attachments
    image_url = Column(String(500))
    file_url = Column(String(500))
    file_name = Column(String(255))
    file_size = Column(Integer)
    
    # Message metadata
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime(timezone=True))
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True))
    
    # Moderation
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String(255))
    is_approved = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    room = relationship("TeamChatRoom", back_populates="messages")
    participant = relationship("ChatParticipant", back_populates="messages")
    reactions = relationship("ChatReaction", back_populates="message", cascade="all, delete-orphan")


class ChatReaction(Base):
    """Message reactions (like, heart, etc.)"""
    __tablename__ = "chat_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("chat_participants.id"), nullable=False)
    
    # Reaction details
    reaction_type = Column(String(50), nullable=False)  # like, heart, laugh, etc.
    emoji = Column(String(10))  # Unicode emoji
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    message = relationship("ChatMessage", back_populates="reactions")
    participant = relationship("ChatParticipant")


class ChatSession(Base):
    """Active chat sessions for WebSocket connections"""
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("chat_participants.id"), nullable=False)
    session_id = Column(String(255), unique=True, nullable=False)
    
    # Connection info
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    disconnected_at = Column(DateTime(timezone=True))
    last_ping = Column(DateTime(timezone=True))
    
    # Relationships
    participant = relationship("ChatParticipant")


class ChatModerationLog(Base):
    """Log of moderation actions"""
    __tablename__ = "chat_moderation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("team_chat_rooms.id"), nullable=False)
    moderator_id = Column(Integer, ForeignKey("chat_participants.id"), nullable=False)
    target_participant_id = Column(Integer, ForeignKey("chat_participants.id"))
    target_message_id = Column(Integer, ForeignKey("chat_messages.id"))
    
    # Action details
    action_type = Column(String(50), nullable=False)  # ban, mute, delete_message, etc.
    reason = Column(Text)
    duration = Column(Integer)  # Duration in minutes for temporary actions
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    room = relationship("TeamChatRoom")
    moderator = relationship("ChatParticipant", foreign_keys=[moderator_id])
    target_participant = relationship("ChatParticipant", foreign_keys=[target_participant_id])
    target_message = relationship("ChatMessage")
