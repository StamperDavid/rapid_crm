"""
API endpoints for intelligent communication system.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.communication import (
    Communication, CommunicationTemplate, CommunicationType, 
    CommunicationChannel, CommunicationStatus, Game, CommunicationPreference
)
from app.models.ecommerce import Order as EcommerceOrder, OrderStatus
from app.services.communication_service import CommunicationService
from app.schemas.communication import (
    CommunicationCreate, CommunicationResponse, CommunicationTemplateCreate,
    CommunicationTemplateResponse, GameCreate, GameResponse, CommunicationPreferenceCreate,
    CommunicationPreferenceResponse
)

router = APIRouter()


@router.post("/templates/", response_model=CommunicationTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_communication_template(
    template_data: CommunicationTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create a new communication template."""
    try:
        template = CommunicationTemplate(
            name=template_data.name,
            communication_type=template_data.communication_type,
            channel=template_data.channel,
            subject=template_data.subject,
            body_text=template_data.body_text,
            body_html=template_data.body_html,
            variables=template_data.variables,
            is_active=template_data.is_active,
            send_delay_minutes=template_data.send_delay_minutes,
            target_audience=template_data.target_audience
        )
        
        db.add(template)
        db.commit()
        db.refresh(template)
        
        return template
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {e}"
        )


@router.get("/templates/", response_model=List[CommunicationTemplateResponse])
async def get_communication_templates(
    communication_type: Optional[CommunicationType] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get communication templates."""
    try:
        query = db.query(CommunicationTemplate)
        
        if communication_type:
            query = query.filter(CommunicationTemplate.communication_type == communication_type)
        
        if is_active is not None:
            query = query.filter(CommunicationTemplate.is_active == is_active)
        
        templates = query.all()
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get templates: {e}"
        )


@router.post("/games/", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    game_data: GameCreate,
    db: Session = Depends(get_db)
):
    """Create a new game/schedule entry."""
    try:
        game = Game(
            game_name=game_data.game_name,
            game_type=game_data.game_type,
            sport=game_data.sport,
            home_team_id=game_data.home_team_id,
            away_team_id=game_data.away_team_id,
            game_date=game_data.game_date,
            game_time=game_data.game_time,
            venue=game_data.venue,
            venue_address=game_data.venue_address,
            status=game_data.status,
            is_fundraising_game=game_data.is_fundraising_game,
            fundraising_goal=game_data.fundraising_goal,
            send_reminders=game_data.send_reminders,
            reminder_days_before=game_data.reminder_days_before,
            game_metadata=game_data.game_metadata
        )
        
        db.add(game)
        db.commit()
        db.refresh(game)
        
        return game
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create game: {e}"
        )


@router.get("/games/", response_model=List[GameResponse])
async def get_games(
    team_id: Optional[int] = None,
    status: Optional[str] = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get games/schedules."""
    try:
        query = db.query(Game)
        
        if team_id:
            query = query.filter(
                (Game.home_team_id == team_id) | (Game.away_team_id == team_id)
            )
        
        if status:
            query = query.filter(Game.status == status)
        
        if upcoming_only:
            query = query.filter(Game.game_date >= datetime.utcnow())
        
        games = query.order_by(Game.game_date).all()
        return games
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get games: {e}"
        )


@router.post("/preferences/", response_model=CommunicationPreferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_communication_preference(
    preference_data: CommunicationPreferenceCreate,
    db: Session = Depends(get_db)
):
    """Create communication preferences for a user."""
    try:
        # Check if preferences already exist
        existing = db.query(CommunicationPreference).filter(
            CommunicationPreference.user_id == preference_data.user_id
        ).first()
        
        if existing:
            # Update existing preferences
            for field, value in preference_data.dict(exclude_unset=True).items():
                setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        
        # Create new preferences
        preference = CommunicationPreference(**preference_data.dict())
        db.add(preference)
        db.commit()
        db.refresh(preference)
        
        return preference
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create preferences: {e}"
        )


@router.get("/preferences/{user_id}", response_model=CommunicationPreferenceResponse)
async def get_communication_preferences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get communication preferences for a user."""
    try:
        preferences = db.query(CommunicationPreference).filter(
            CommunicationPreference.user_id == user_id
        ).first()
        
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preferences not found"
            )
        
        return preferences
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {e}"
        )


@router.post("/send-game-reminders/")
async def send_game_reminders(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send game reminders for upcoming games."""
    try:
        communication_service = CommunicationService(db)
        communications = await communication_service.send_game_reminders()
        
        # Process communications in background
        background_tasks.add_task(process_communications, communications)
        
        return {
            "message": f"Created {len(communications)} game reminder communications",
            "communications_count": len(communications)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send game reminders: {e}"
        )


@router.get("/communications/", response_model=List[CommunicationResponse])
async def get_communications(
    communication_type: Optional[CommunicationType] = None,
    status: Optional[CommunicationStatus] = None,
    user_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get communications."""
    try:
        query = db.query(Communication)
        
        if communication_type:
            query = query.filter(Communication.communication_type == communication_type)
        
        if status:
            query = query.filter(Communication.status == status)
        
        if user_id:
            # This would need to be implemented based on how you link communications to users
            pass
        
        communications = query.order_by(Communication.created_at.desc()).limit(limit).all()
        return communications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get communications: {e}"
        )


async def process_communications(communications: List[Communication]):
    """Background task to process communications."""
    # This would integrate with email/SMS providers
    # For now, just log the communications
    for comm in communications:
        print(f"Processing communication: {comm.communication_type} to {comm.recipient_email}")
        # In production, this would:
        # 1. Send email via SendGrid/AWS SES
        # 2. Send SMS via Twilio
        # 3. Update communication status
        # 4. Log delivery status