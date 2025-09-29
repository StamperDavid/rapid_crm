"""
Chat API Endpoints
WebSocket and REST endpoints for team chat functionality
"""

import asyncio
import json
import logging
import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.chat_service import ChatService
from app.models.chat import ChatMessageType, ChatUserRole
from app.schemas.chat import ChatMessageResponse, ChatParticipantResponse, ChatRoomResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# Store active chat services by database session
active_chat_services: Dict[str, ChatService] = {}


@router.websocket("/ws/{team_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    team_id: int,
    user_id: int = Query(...),
    token: str = Query(...)
):
    """WebSocket endpoint for real-time team chat"""
    # TODO: Validate token and get user_id from JWT token
    # For now, we'll use the user_id from query parameter
    
    session_id = str(uuid.uuid4())
    db = None
    chat_service = None
    
    try:
        # Get database session
        from app.core.database import SessionLocal
        db = SessionLocal()
        chat_service = ChatService(db)
        
        # Join chat room
        join_result = await chat_service.join_team_chat(user_id, team_id, websocket, session_id)
        
        if not join_result.get("success"):
            await websocket.close(code=4000, reason=join_result.get("error", "Failed to join chat"))
            return
        
        # Send initial data
        await websocket.send_text(json.dumps({
            "type": "joined",
            "data": join_result
        }))
        
        # Send recent messages
        recent_messages = await chat_service.get_chat_history(join_result["room_id"], limit=50)
        await websocket.send_text(json.dumps({
            "type": "chat_history",
            "data": recent_messages
        }))
        
        # Listen for messages
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                if message_data.get("type") == "message":
                    # Send message to chat
                    content = message_data.get("content", "").strip()
                    if content:
                        result = await chat_service.send_message(
                            participant_id=join_result["participant_id"],
                            room_id=join_result["room_id"],
                            content=content,
                            message_type=ChatMessageType.TEXT
                        )
                        
                        if not result.get("success"):
                            await websocket.send_text(json.dumps({
                                "type": "error",
                                "data": {"message": result.get("error")}
                            }))
                
                elif message_data.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "data": {"timestamp": message_data.get("timestamp")}
                    }))
                
                elif message_data.get("type") == "typing":
                    # Broadcast typing indicator
                    await chat_service.connection_manager.broadcast_to_room(
                        json.dumps({
                            "type": "user_typing",
                            "data": {
                                "participant_id": join_result["participant_id"],
                                "display_name": join_result["display_name"],
                                "is_typing": message_data.get("is_typing", False)
                            }
                        }),
                        join_result["room_id"],
                        exclude_session=session_id
                    )
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                }))
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Internal server error"}
                }))
    
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
        try:
            await websocket.close(code=4000, reason="Internal server error")
        except:
            pass
    
    finally:
        # Clean up
        if chat_service:
            await chat_service.leave_chat(session_id)
        if db:
            db.close()


@router.get("/rooms/{team_id}", response_model=ChatRoomResponse)
async def get_team_chat_room(team_id: int, db: Session = Depends(get_db)):
    """Get team chat room information"""
    try:
        chat_service = ChatService(db)
        room = await chat_service._get_or_create_team_room(team_id)
        
        return {
            "id": room.id,
            "team_id": room.team_id,
            "school_id": room.school_id,
            "name": room.name,
            "description": room.description,
            "is_active": room.is_active,
            "allow_team_members": room.allow_team_members,
            "allow_staff": room.allow_staff,
            "allow_supporters": room.allow_supporters,
            "allow_coaches": room.allow_coaches,
            "require_approval": room.require_approval,
            "max_message_length": room.max_message_length,
            "created_at": room.created_at
        }
        
    except Exception as e:
        logger.error(f"Error getting chat room: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{team_id}/participants", response_model=List[ChatParticipantResponse])
async def get_chat_participants(team_id: int, db: Session = Depends(get_db)):
    """Get list of chat participants"""
    try:
        from app.models.chat import TeamChatRoom, ChatParticipant
        
        room = db.query(TeamChatRoom).filter(
            TeamChatRoom.team_id == team_id
        ).first()
        
        if not room:
            raise HTTPException(status_code=404, detail="Chat room not found")
        
        participants = db.query(ChatParticipant).filter(
            and_(
                ChatParticipant.room_id == room.id,
                ChatParticipant.is_active == True
            )
        ).all()
        
        return [
            {
                "id": p.id,
                "user_id": p.user_id,
                "display_name": p.display_name,
                "role": p.role.value,
                "is_online": p.is_online,
                "last_seen": p.last_seen,
                "joined_at": p.joined_at,
                "can_send_messages": p.can_send_messages,
                "is_moderator": p.is_moderator
            }
            for p in participants
        ]
        
    except Exception as e:
        logger.error(f"Error getting participants: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{team_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    team_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get chat message history"""
    try:
        chat_service = ChatService(db)
        room = await chat_service._get_or_create_team_room(team_id)
        messages = await chat_service.get_chat_history(room.id, limit, offset)
        
        return messages
        
    except Exception as e:
        logger.error(f"Error getting chat messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rooms/{team_id}/join")
async def join_chat_room(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """Join chat room (for REST API)"""
    try:
        chat_service = ChatService(db)
        room = await chat_service._get_or_create_team_room(team_id)
        
        # Get user
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user can join
        can_join, role = await chat_service._can_user_join_room(user, room)
        if not can_join:
            raise HTTPException(status_code=403, detail="User not authorized to join this chat")
        
        # Get or create participant
        participant = await chat_service._get_or_create_participant(user, room, role)
        
        return {
            "success": True,
            "room_id": room.id,
            "participant_id": participant.id,
            "display_name": participant.display_name,
            "role": participant.role.value
        }
        
    except Exception as e:
        logger.error(f"Error joining chat room: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rooms/{team_id}/leave")
async def leave_chat_room(team_id: int, user_id: int, db: Session = Depends(get_db)):
    """Leave chat room"""
    try:
        from app.models.chat import TeamChatRoom, ChatParticipant
        
        room = db.query(TeamChatRoom).filter(TeamChatRoom.team_id == team_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Chat room not found")
        
        participant = db.query(ChatParticipant).filter(
            and_(
                ChatParticipant.room_id == room.id,
                ChatParticipant.user_id == user_id
            )
        ).first()
        
        if participant:
            participant.is_online = False
            participant.last_seen = datetime.utcnow()
            db.commit()
        
        return {"success": True, "message": "Left chat room"}
        
    except Exception as e:
        logger.error(f"Error leaving chat room: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms/{team_id}/online")
async def get_online_participants(team_id: int, db: Session = Depends(get_db)):
    """Get currently online participants"""
    try:
        chat_service = ChatService(db)
        room = await chat_service._get_or_create_team_room(team_id)
        online_participants = chat_service.connection_manager.get_room_participants(room.id)
        
        return {
            "room_id": room.id,
            "online_count": len(online_participants),
            "participants": online_participants
        }
        
    except Exception as e:
        logger.error(f"Error getting online participants: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Import required modules
from sqlalchemy import and_
from datetime import datetime
