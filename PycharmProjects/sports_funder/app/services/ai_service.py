"""
AI Assistant service using Google Gemini API.
"""
import os
from typing import Optional, Dict, Any
import google.generativeai as genai
from fastapi import HTTPException, status
from app.core.config_simple import settings
import structlog

logger = structlog.get_logger()


class AIService:
    """Service for AI assistant functionality using Google Gemini."""
    
    def __init__(self):
        """Initialize the AI service."""
        if not settings.GOOGLE_API_KEY:
            logger.warning("Google API key not configured")
            return
        
        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
            self.is_configured = True
        except Exception as e:
            logger.error("Failed to configure Gemini AI", error=str(e))
            self.is_configured = False
    
    async def ask_question(
        self, 
        question: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Ask a question to the AI assistant."""
        if not self.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service not configured"
            )
        
        try:
            # Build context-aware prompt
            prompt = self._build_prompt(question, context)
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="AI service returned empty response"
                )
            
            logger.info("AI question answered", question=question[:100])
            return response.text
            
        except Exception as e:
            logger.error("AI service error", error=str(e), question=question[:100])
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get AI response"
            )
    
    def _build_prompt(self, question: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Build a context-aware prompt for the AI."""
        base_prompt = """You are an AI assistant for a sports team funding application called Sports Funder. 
        You help users with questions about:
        - Team information and player details
        - Product catalog and ordering
        - Local business partnerships
        - Fundraising campaigns
        - Order tracking and status
        - General sports and fundraising questions
        
        Be helpful, friendly, and informative. If you don't know something specific about the user's data, 
        suggest they contact support or check their account dashboard.
        
        User Question: {question}"""
        
        if context:
            context_info = "\n\nAdditional Context:\n"
            for key, value in context.items():
                context_info += f"- {key}: {value}\n"
            base_prompt += context_info
        
        return base_prompt.format(question=question)
    
    async def get_product_recommendations(
        self, 
        user_preferences: Dict[str, Any]
    ) -> str:
        """Get AI-powered product recommendations."""
        prompt = f"""Based on the following user preferences, recommend sports team products:
        
        User Preferences: {user_preferences}
        
        Consider factors like:
        - Team sport and level
        - Budget range
        - Popular items
        - Seasonal relevance
        - Team colors and branding
        
        Provide 3-5 specific product recommendations with brief explanations."""
        
        return await self.ask_question(prompt)
    
    async def generate_fundraising_tips(
        self, 
        team_context: Dict[str, Any]
    ) -> str:
        """Generate fundraising tips based on team context."""
        prompt = f"""Provide fundraising tips for this sports team:
        
        Team Context: {team_context}
        
        Include:
        - Social media strategies
        - Community engagement ideas
        - Product promotion techniques
        - Local business partnership suggestions
        - Timeline and goal setting advice"""
        
        return await self.ask_question(prompt)

