"""
Intelligent communication service for e-commerce and game schedule integration.
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.communication import (
    Communication, CommunicationTemplate, CommunicationType, 
    CommunicationChannel, CommunicationStatus, Game, CommunicationPreference
)
from app.models.ecommerce import Order as EcommerceOrder, OrderStatus
from app.models.organization import Team, School
from app.models.user import User

logger = logging.getLogger(__name__)


class CommunicationService:
    """Service for managing intelligent communications."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def handle_order_created(self, order: EcommerceOrder) -> List[Communication]:
        """Handle order creation - send confirmation emails/SMS."""
        communications = []
        
        try:
            # Get customer preferences
            preferences = self._get_user_preferences(order.customer_id)
            
            # Create order confirmation communication
            if preferences.get('order_notifications', True):
                comm = await self._create_communication(
                    communication_type=CommunicationType.ORDER_CONFIRMATION,
                    order_id=order.id,
                    customer_id=order.customer_id,
                    template_variables={
                        'order_number': order.order_number,
                        'total_amount': float(order.total_amount),
                        'items': [{'name': item.product.name, 'quantity': item.quantity} for item in order.items],
                        'estimated_delivery': self._calculate_estimated_delivery(order),
                        'tracking_url': f"/orders/{order.id}/track"
                    }
                )
                if comm:
                    communications.append(comm)
            
            logger.info(f"Created {len(communications)} communications for order {order.id}")
            return communications
            
        except Exception as e:
            logger.error(f"Error handling order creation: {e}")
            return []
    
    async def handle_order_status_change(self, order: EcommerceOrder, old_status: OrderStatus, new_status: OrderStatus) -> List[Communication]:
        """Handle order status changes - send appropriate notifications."""
        communications = []
        
        try:
            preferences = self._get_user_preferences(order.customer_id)
            
            if not preferences.get('order_notifications', True):
                return []
            
            # Map status changes to communication types
            status_mapping = {
                OrderStatus.PROCESSING: CommunicationType.ORDER_CONFIRMATION,
                OrderStatus.SHIPPED: CommunicationType.ORDER_SHIPPED,
                OrderStatus.DELIVERED: CommunicationType.ORDER_DELIVERED,
                OrderStatus.CANCELLED: CommunicationType.ORDER_CANCELLED
            }
            
            comm_type = status_mapping.get(new_status)
            if not comm_type:
                return []
            
            # Create communication
            comm = await self._create_communication(
                communication_type=comm_type,
                order_id=order.id,
                customer_id=order.customer_id,
                template_variables={
                    'order_number': order.order_number,
                    'status': new_status.value,
                    'tracking_number': order.tracking_number,
                    'tracking_url': f"/orders/{order.id}/track"
                }
            )
            
            if comm:
                communications.append(comm)
            
            logger.info(f"Created communication for order status change: {old_status} -> {new_status}")
            return communications
            
        except Exception as e:
            logger.error(f"Error handling order status change: {e}")
            return []
    
    async def send_game_reminders(self) -> List[Communication]:
        """Send game reminders for upcoming games."""
        communications = []
        
        try:
            # Find games happening in the next 24 hours
            tomorrow = datetime.utcnow() + timedelta(days=1)
            upcoming_games = self.db.query(Game).filter(
                and_(
                    Game.game_date <= tomorrow,
                    Game.game_date >= datetime.utcnow(),
                    Game.send_reminders == True,
                    Game.status == "scheduled"
                )
            ).all()
            
            for game in upcoming_games:
                # Get all users associated with the teams
                team_users = self._get_team_users(game.home_team_id, game.away_team_id)
                
                for user in team_users:
                    preferences = self._get_user_preferences(user.id)
                    
                    if not preferences.get('game_reminders', True):
                        continue
                    
                    comm = await self._create_communication(
                        communication_type=CommunicationType.GAME_REMINDER,
                        game_id=game.id,
                        customer_id=user.id,
                        template_variables={
                            'game_name': game.game_name,
                            'home_team': game.home_team.name,
                            'away_team': game.away_team.name,
                            'game_date': game.game_date.strftime('%A, %B %d, %Y'),
                            'game_time': game.game_time,
                            'venue': game.venue,
                            'venue_address': game.venue_address,
                            'is_fundraising_game': game.is_fundraising_game,
                            'fundraising_goal': float(game.fundraising_goal) if game.fundraising_goal else None
                        }
                    )
                    
                    if comm:
                        communications.append(comm)
            
            logger.info(f"Created {len(communications)} game reminder communications")
            return communications
            
        except Exception as e:
            logger.error(f"Error sending game reminders: {e}")
            return []
    
    async def _create_communication(
        self, 
        communication_type: CommunicationType,
        customer_id: int,
        template_variables: Dict[str, Any],
        order_id: Optional[int] = None,
        game_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> Optional[Communication]:
        """Create a communication record."""
        try:
            # Get template
            template = self.db.query(CommunicationTemplate).filter(
                and_(
                    CommunicationTemplate.communication_type == communication_type,
                    CommunicationTemplate.is_active == True
                )
            ).first()
            
            if not template:
                logger.warning(f"No template found for communication type: {communication_type}")
                return None
            
            # Get user preferences
            preferences = self._get_user_preferences(customer_id)
            
            # Determine channel based on preferences
            channel = self._determine_channel(preferences, template.channel)
            
            # Render template
            rendered_content = self._render_template(template, template_variables)
            
            # Create communication
            communication = Communication(
                template_id=template.id,
                communication_type=communication_type,
                channel=channel,
                recipient_name=template_variables.get('customer_name', ''),
                recipient_email=template_variables.get('customer_email', ''),
                recipient_phone=template_variables.get('customer_phone', ''),
                subject=rendered_content.get('subject'),
                body_text=rendered_content.get('body_text'),
                body_html=rendered_content.get('body_html'),
                order_id=order_id,
                game_id=game_id,
                team_id=team_id,
                scheduled_at=datetime.utcnow() + timedelta(minutes=template.send_delay_minutes),
                metadata=template_variables
            )
            
            self.db.add(communication)
            self.db.commit()
            self.db.refresh(communication)
            
            return communication
            
        except Exception as e:
            logger.error(f"Error creating communication: {e}")
            return None
    
    def _get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get user communication preferences."""
        preferences = self.db.query(CommunicationPreference).filter(
            CommunicationPreference.user_id == user_id
        ).first()
        
        if not preferences:
            # Return default preferences
            return {
                'email_enabled': True,
                'sms_enabled': True,
                'order_notifications': True,
                'game_reminders': True,
                'fundraising_updates': True,
                'special_offers': True,
                'payment_notifications': True
            }
        
        return {
            'email_enabled': preferences.email_enabled,
            'sms_enabled': preferences.sms_enabled,
            'order_notifications': preferences.order_notifications,
            'game_reminders': preferences.game_reminders,
            'fundraising_updates': preferences.fundraising_updates,
            'special_offers': preferences.special_offers,
            'payment_notifications': preferences.payment_notifications
        }
    
    def _get_team_users(self, *team_ids: int) -> List[User]:
        """Get all users associated with teams."""
        # This would need to be implemented based on your user-team relationships
        # For now, returning empty list
        return []
    
    def _determine_channel(self, preferences: Dict[str, Any], template_channel: CommunicationChannel) -> CommunicationChannel:
        """Determine the best communication channel based on preferences."""
        if template_channel == CommunicationChannel.EMAIL and preferences.get('email_enabled', True):
            return CommunicationChannel.EMAIL
        elif template_channel == CommunicationChannel.SMS and preferences.get('sms_enabled', True):
            return CommunicationChannel.SMS
        else:
            # Fallback to email
            return CommunicationChannel.EMAIL
    
    def _render_template(self, template: CommunicationTemplate, variables: Dict[str, Any]) -> Dict[str, str]:
        """Render template with variables."""
        # Simple template rendering - in production, use a proper templating engine
        subject = template.subject or ""
        body_text = template.body_text or ""
        body_html = template.body_html or ""
        
        for key, value in variables.items():
            placeholder = f"{{{{{key}}}}}"
            subject = subject.replace(placeholder, str(value))
            body_text = body_text.replace(placeholder, str(value))
            body_html = body_html.replace(placeholder, str(value))
        
        return {
            'subject': subject,
            'body_text': body_text,
            'body_html': body_html
        }
    
    def _calculate_estimated_delivery(self, order: EcommerceOrder) -> str:
        """Calculate estimated delivery date."""
        # Simple calculation - in production, use shipping provider APIs
        delivery_date = datetime.utcnow() + timedelta(days=3)
        return delivery_date.strftime('%A, %B %d, %Y')