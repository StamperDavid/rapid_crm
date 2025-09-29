"""
AI Assistant endpoints.
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.services.ai_service import AIService
import structlog

logger = structlog.get_logger()
router = APIRouter()

# Initialize AI service
ai_service = AIService()


class QuestionRequest(BaseModel):
    """Request model for AI questions."""
    question: str
    context: Optional[Dict[str, Any]] = None


class QuestionResponse(BaseModel):
    """Response model for AI questions."""
    answer: str
    question: str


@router.post("/ask", response_model=QuestionResponse)
async def ask_ai_assistant(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Ask a question to the AI assistant."""
    try:
        answer = await ai_service.ask_question(request.question, request.context)
        
        logger.info(
            "AI question answered",
            user_id=current_user.id,
            question=request.question[:100]
        )
        
        return QuestionResponse(
            answer=answer,
            question=request.question
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("AI assistant error", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process AI request"
        )


@router.post("/recommendations")
async def get_product_recommendations(
    preferences: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get AI-powered product recommendations."""
    try:
        recommendations = await ai_service.get_product_recommendations(preferences)
        
        return {
            "recommendations": recommendations,
            "preferences": preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Product recommendations error", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


@router.post("/fundraising-tips")
async def get_fundraising_tips(
    team_context: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get AI-powered fundraising tips."""
    try:
        tips = await ai_service.generate_fundraising_tips(team_context)
        
        return {
            "tips": tips,
            "team_context": team_context
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Fundraising tips error", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate fundraising tips"
        )



