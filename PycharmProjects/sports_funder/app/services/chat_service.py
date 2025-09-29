"""
Chat Service for Real-time Team Communication
Handles WebSocket connections, message broadcasting, and chat management
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from fastapi import WebSocket, WebSocketDisconnect

from app.models.chat import (
    TeamChatRoom, ChatParticipant, ChatMessage, ChatReaction, 
    ChatSession, ChatMessageType, ChatUserRole
)
from app.models.user import User
from app.models.organization import Team, School

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for chat rooms"""
    
    def __init__(self):
        # Dictionary to store active connections by room_id
        self.active_connections: Dict[int, Dict[str, WebSocket]] = {}
        # Dictionary to store participant info by connection
        self.connection_participants: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int, participant_id: int, session_id: str):
        """Accept WebSocket connection and add to room"""
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        
        self.active_connections[room_id][session_id] = websocket
        self.connection_participants[session_id] = {
            "participant_id": participant_id,
            "room_id": room_id,
            "connected_at": datetime.utcnow()
        }
        
        logger.info(f"Participant {participant_id} connected to room {room_id}")
    
    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.connection_participants:
            participant_info = self.connection_participants[session_id]
            room_id = participant_info["room_id"]
            
            if room_id in self.active_connections and session_id in self.active_connections[room_id]:
                del self.active_connections[room_id][session_id]
                
                # Clean up empty rooms
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
            
            del self.connection_participants[session_id]
            logger.info(f"Participant {participant_info['participant_id']} disconnected from room {room_id}")
    
    async def send_personal_message(self, message: str, session_id: str):
        """Send message to specific connection"""
        if session_id in self.connection_participants:
            participant_info = self.connection_participants[session_id]
            room_id = participant_info["room_id"]
            
            if room_id in self.active_connections and session_id in self.active_connections[room_id]:
                websocket = self.active_connections[room_id][session_id]
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending personal message: {str(e)}")
                    self.disconnect(session_id)
    
    async def broadcast_to_room(self, message: str, room_id: int, exclude_session: str = None):
        """Broadcast message to all connections in a room"""
        if room_id in self.active_connections:
            disconnected_sessions = []
            
            for session_id, websocket in self.active_connections[room_id].items():
                if session_id != exclude_session:
                    try:
                        await websocket.send_text(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to session {session_id}: {str(e)}")
                        disconnected_sessions.append(session_id)
            
            # Clean up disconnected sessions
            for session_id in disconnected_sessions:
                self.disconnect(session_id)
    
    def get_room_participants(self, room_id: int) -> List[Dict[str, Any]]:
        """Get list of active participants in a room"""
        participants = []
        if room_id in self.active_connections:
            for session_id in self.active_connections[room_id].keys():
                if session_id in self.connection_participants:
                    participant_info = self.connection_participants[session_id]
                    participants.append({
                        "participant_id": participant_info["participant_id"],
                        "connected_at": participant_info["connected_at"]
                    })
        return participants


class ChatService:
    """Service for managing chat functionality"""
    
    def __init__(self, db: Session):
        self.db = db
        self.connection_manager = ConnectionManager()
    
    async def join_team_chat(self, user_id: int, team_id: int, websocket: WebSocket, session_id: str) -> Dict[str, Any]:
        """Join user to team chat room"""
        try:
            # Get or create chat room
            room = await self._get_or_create_team_room(team_id)
            
            # Get user info
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Check if user can join this room
            can_join, role = await self._can_user_join_room(user, room)
            if not can_join:
                return {"success": False, "error": "User not authorized to join this chat"}
            
            # Get or create participant
            participant = await self._get_or_create_participant(user, room, role)
            
            # Update participant status
            participant.is_online = True
            participant.last_seen = datetime.utcnow()
            
            # Create chat session
            chat_session = ChatSession(
                participant_id=participant.id,
                session_id=session_id,
                is_active=True
            )
            self.db.add(chat_session)
            self.db.commit()
            
            # Connect to WebSocket
            await self.connection_manager.connect(websocket, room.id, participant.id, session_id)
            
            # Send recent messages
            recent_messages = await self._get_recent_messages(room.id, limit=50)
            
            return {
                "success": True,
                "room_id": room.id,
                "participant_id": participant.id,
                "display_name": participant.display_name,
                "role": participant.role.value,
                "recent_messages": recent_messages,
                "online_participants": self.connection_manager.get_room_participants(room.id)
            }
            
        except Exception as e:
            logger.error(f"Error joining team chat: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_message(self, participant_id: int, room_id: int, content: str, 
                          message_type: ChatMessageType = ChatMessageType.TEXT) -> Dict[str, Any]:
        """Send message to chat room"""
        try:
            # Get participant
            participant = self.db.query(ChatParticipant).filter(
                and_(
                    ChatParticipant.id == participant_id,
                    ChatParticipant.room_id == room_id,
                    ChatParticipant.is_active == True
                )
            ).first()
            
            if not participant:
                return {"success": False, "error": "Participant not found or inactive"}
            
            # Check permissions
            if not participant.can_send_messages:
                return {"success": False, "error": "User is not allowed to send messages"}
            
            # Validate message
            if len(content.strip()) == 0:
                return {"success": False, "error": "Message cannot be empty"}
            
            if len(content) > participant.room.max_message_length:
                return {"success": False, "error": f"Message too long (max {participant.room.max_message_length} characters)"}
            
            # Create message
            message = ChatMessage(
                room_id=room_id,
                participant_id=participant_id,
                message_type=message_type,
                content=content.strip(),
                is_approved=not participant.room.require_approval
            )
            
            self.db.add(message)
            self.db.commit()
            self.db.refresh(message)
            
            # Prepare message for broadcast
            message_data = {
                "id": message.id,
                "participant_id": participant_id,
                "display_name": participant.display_name,
                "role": participant.role.value,
                "content": content.strip(),
                "message_type": message_type.value,
                "created_at": message.created_at.isoformat(),
                "is_approved": message.is_approved
            }
            
            # Broadcast to room
            await self.connection_manager.broadcast_to_room(
                json.dumps({
                    "type": "new_message",
                    "data": message_data
                }),
                room_id
            )
            
            return {
                "success": True,
                "message": message_data
            }
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def leave_chat(self, session_id: str):
        """Leave chat room"""
        try:
            # Update participant status
            if session_id in self.connection_manager.connection_participants:
                participant_info = self.connection_manager.connection_participants[session_id]
                participant_id = participant_info["participant_id"]
                
                participant = self.db.query(ChatParticipant).filter(
                    ChatParticipant.id == participant_id
                ).first()
                
                if participant:
                    participant.is_online = False
                    participant.last_seen = datetime.utcnow()
                
                # Update chat session
                chat_session = self.db.query(ChatSession).filter(
                    ChatSession.session_id == session_id
                ).first()
                
                if chat_session:
                    chat_session.is_active = False
                    chat_session.disconnected_at = datetime.utcnow()
                
                self.db.commit()
            
            # Disconnect from WebSocket
            self.connection_manager.disconnect(session_id)
            
        except Exception as e:
            logger.error(f"Error leaving chat: {str(e)}")
    
    async def get_chat_history(self, room_id: int, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get chat message history"""
        try:
            messages = self.db.query(ChatMessage).filter(
                and_(
                    ChatMessage.room_id == room_id,
                    ChatMessage.is_deleted == False,
                    ChatMessage.is_approved == True
                )
            ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()
            
            return [
                {
                    "id": msg.id,
                    "participant_id": msg.participant_id,
                    "display_name": msg.participant.display_name,
                    "role": msg.participant.role.value,
                    "content": msg.content,
                    "message_type": msg.message_type.value,
                    "created_at": msg.created_at.isoformat(),
                    "is_edited": msg.is_edited,
                    "reactions": [
                        {
                            "reaction_type": reaction.reaction_type,
                            "emoji": reaction.emoji,
                            "count": 1  # Could be aggregated
                        }
                        for reaction in msg.reactions
                    ]
                }
                for msg in reversed(messages)  # Reverse to get chronological order
            ]
            
        except Exception as e:
            logger.error(f"Error getting chat history: {str(e)}")
            return []
    
    async def _get_or_create_team_room(self, team_id: int) -> TeamChatRoom:
        """Get or create chat room for team"""
        room = self.db.query(TeamChatRoom).filter(
            and_(
                TeamChatRoom.team_id == team_id,
                TeamChatRoom.is_active == True
            )
        ).first()
        
        if not room:
            # Get team info
            team = self.db.query(Team).filter(Team.id == team_id).first()
            if not team:
                raise ValueError("Team not found")
            
            # Create new room
            room = TeamChatRoom(
                team_id=team_id,
                school_id=team.school_id,
                name=f"{team.name} Chat",
                description=f"Chat room for {team.name} team members, staff, and supporters"
            )
            
            self.db.add(room)
            self.db.commit()
            self.db.refresh(room)
        
        return room
    
    async def _can_user_join_room(self, user: User, room: TeamChatRoom) -> tuple[bool, ChatUserRole]:
        """Check if user can join room and determine their role"""
        # Determine user role
        if user.role in ["coach", "assistant_coach"]:
            role = ChatUserRole.COACH if user.role == "coach" else ChatUserRole.ASSISTANT_COACH
            can_join = room.allow_coaches
        elif user.role in ["player", "team_member"]:
            role = ChatUserRole.TEAM_MEMBER
            can_join = room.allow_team_members
        elif user.role in ["admin", "staff", "principal"]:
            role = ChatUserRole.STAFF
            can_join = room.allow_staff
        else:
            # Check if user is a supporter (has made orders)
            from app.models.order_management import Order
            supporter_orders = self.db.query(Order).filter(
                and_(
                    Order.school_id == room.school_id,
                    or_(Order.customer_email == user.email, Order.customer_phone == user.phone)
                )
            ).count()
            
            if supporter_orders > 0:
                role = ChatUserRole.SUPPORTER
                can_join = room.allow_supporters
            else:
                return False, None
        
        return can_join, role
    
    async def _get_or_create_participant(self, user: User, room: TeamChatRoom, role: ChatUserRole) -> ChatParticipant:
        """Get or create chat participant"""
        # Create display name (first name + last initial)
        display_name = f"{user.first_name} {user.last_name[0].upper()}." if user.last_name else user.first_name
        
        participant = self.db.query(ChatParticipant).filter(
            and_(
                ChatParticipant.room_id == room.id,
                ChatParticipant.user_id == user.id
            )
        ).first()
        
        if not participant:
            participant = ChatParticipant(
                room_id=room.id,
                user_id=user.id,
                display_name=display_name,
                role=role,
                can_send_messages=True,
                can_send_images=True,
                can_send_files=role in [ChatUserRole.COACH, ChatUserRole.ASSISTANT_COACH, ChatUserRole.STAFF]
            )
            
            self.db.add(participant)
            self.db.commit()
            self.db.refresh(participant)
        else:
            # Update display name in case it changed
            participant.display_name = display_name
            participant.role = role
            self.db.commit()
        
        return participant
    
    async def _get_recent_messages(self, room_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent messages for room"""
        return await self.get_chat_history(room_id, limit=limit)
