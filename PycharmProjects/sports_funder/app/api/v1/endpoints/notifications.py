"""
Notification management endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
import structlog

logger = structlog.get_logger()
router = APIRouter()


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"  # info, warning, error, success
    target_user_id: Optional[int] = None
    target_school_id: Optional[int] = None
    target_team_id: Optional[int] = None
    priority: str = "normal"  # low, normal, high, urgent
    expires_at: Optional[datetime] = None


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    priority: str
    is_read: bool
    created_at: datetime
    expires_at: Optional[datetime]
    target_user_id: Optional[int]
    target_school_id: Optional[int]
    target_team_id: Optional[int]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user."""
    query = db.query(Notification).filter(
        (Notification.target_user_id == current_user.id) |
        (Notification.target_user_id.is_(None))
    )
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications


@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification."""
    db_notification = Notification(
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        priority=notification.priority,
        target_user_id=notification.target_user_id,
        target_school_id=notification.target_school_id,
        target_team_id=notification.target_team_id,
        expires_at=notification.expires_at,
        created_by=current_user.id
    )
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    logger.info("Notification created", notification_id=db_notification.id, title=notification.title)
    
    return db_notification


@router.put("/{notification_id}/read", response_model=dict)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        (Notification.target_user_id == current_user.id) |
        (Notification.target_user_id.is_(None))
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.put("/read-all", response_model=dict)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user."""
    db.query(Notification).filter(
        (Notification.target_user_id == current_user.id) |
        (Notification.target_user_id.is_(None)),
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        (Notification.target_user_id == current_user.id) |
        (Notification.target_user_id.is_(None))
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the count of unread notifications for the current user."""
    count = db.query(Notification).filter(
        (Notification.target_user_id == current_user.id) |
        (Notification.target_user_id.is_(None)),
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}


@router.post("/broadcast", response_model=dict)
async def broadcast_notification(
    title: str,
    message: str,
    notification_type: str = "info",
    priority: str = "normal",
    target_school_id: Optional[int] = None,
    target_team_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Broadcast a notification to all users or specific groups."""
    # Create notification without target_user_id to broadcast to all
    notification = Notification(
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        target_school_id=target_school_id,
        target_team_id=target_team_id,
        created_by=current_user.id
    )
    
    db.add(notification)
    db.commit()
    
    logger.info("Broadcast notification created", notification_id=notification.id, title=title)
    
    return {"message": "Broadcast notification sent", "notification_id": notification.id}



