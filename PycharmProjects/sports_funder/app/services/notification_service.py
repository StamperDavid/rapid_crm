"""
Notification service for SMS, email, and push notifications.
"""
import os
from typing import Optional, Dict, Any, List
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config_simple import settings
from app.models.notification import Notification, NotificationType, NotificationStatus
from app.models.commerce import Order, OrderStatus
import structlog

logger = structlog.get_logger()


class NotificationService:
    """Service for sending notifications via various channels."""
    
    def __init__(self):
        """Initialize the notification service."""
        self.twilio_client = None
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
                logger.info("Twilio client initialized")
            except Exception as e:
                logger.error("Failed to initialize Twilio client", error=str(e))
    
    async def send_sms(
        self, 
        phone_number: str, 
        message: str,
        db: Session
    ) -> bool:
        """Send SMS notification via Twilio."""
        if not self.twilio_client:
            logger.warning("Twilio not configured, skipping SMS")
            return False
        
        try:
            # Format phone number (ensure it starts with +1 for US)
            if not phone_number.startswith('+'):
                phone_number = f"+1{phone_number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')}"
            
            # Send SMS
            message_obj = self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number
            )
            
            # Log notification
            notification = Notification(
                type=NotificationType.SMS,
                status=NotificationStatus.SENT,
                message=message,
                recipient_phone=phone_number,
                provider_message_id=message_obj.sid
            )
            db.add(notification)
            db.commit()
            
            logger.info("SMS sent successfully", phone=phone_number, message_id=message_obj.sid)
            return True
            
        except TwilioException as e:
            logger.error("Twilio SMS error", error=str(e), phone=phone_number)
            
            # Log failed notification
            notification = Notification(
                type=NotificationType.SMS,
                status=NotificationStatus.FAILED,
                message=message,
                recipient_phone=phone_number,
                failure_reason=str(e)
            )
            db.add(notification)
            db.commit()
            
            return False
    
    async def send_order_notification(
        self, 
        order: Order, 
        notification_type: str,
        db: Session
    ) -> bool:
        """Send order-related notifications."""
        try:
            # Get recipient phone number
            phone_number = None
            if order.supporter.phone:
                phone_number = order.supporter.phone
            elif order.player.phone:
                phone_number = order.player.phone
            
            if not phone_number:
                logger.warning("No phone number available for order notification", order_id=order.id)
                return False
            
            # Generate message based on notification type
            message = self._generate_order_message(order, notification_type)
            
            # Send SMS
            return await self.send_sms(phone_number, message, db)
            
        except Exception as e:
            logger.error("Order notification error", error=str(e), order_id=order.id)
            return False
    
    def _generate_order_message(self, order: Order, notification_type: str) -> str:
        """Generate order notification message."""
        if notification_type == "order_confirmed":
            return f"Order #{order.order_number} confirmed! Total: ${order.total_amount}. We'll notify you when it ships."
        
        elif notification_type == "order_shipped":
            tracking_info = f" Tracking: {order.tracking_number}" if order.tracking_number else ""
            return f"Order #{order.order_number} has shipped!{tracking_info} Expected delivery: {order.estimated_delivery.strftime('%m/%d/%Y') if order.estimated_delivery else 'TBD'}"
        
        elif notification_type == "order_delivered":
            return f"Order #{order.order_number} has been delivered! Thank you for supporting the team!"
        
        else:
            return f"Update on order #{order.order_number}: {notification_type}"
    
    async def send_game_update(
        self, 
        team_name: str, 
        game_info: Dict[str, Any],
        recipient_phone: str,
        db: Session
    ) -> bool:
        """Send game update notification."""
        message = f"{team_name} Game Update: {game_info.get('message', 'Check the app for details!')}"
        return await self.send_sms(recipient_phone, message, db)
    
    async def send_fundraising_update(
        self, 
        team_name: str, 
        progress_info: Dict[str, Any],
        recipient_phone: str,
        db: Session
    ) -> bool:
        """Send fundraising progress update."""
        current_amount = progress_info.get('current_amount', 0)
        goal_amount = progress_info.get('goal_amount', 0)
        percentage = (current_amount / goal_amount * 100) if goal_amount > 0 else 0
        
        message = f"{team_name} Fundraising: ${current_amount} raised (${goal_amount} goal) - {percentage:.1f}% complete!"
        return await self.send_sms(recipient_phone, message, db)
    
    async def send_bulk_notifications(
        self, 
        phone_numbers: List[str], 
        message: str,
        db: Session
    ) -> Dict[str, bool]:
        """Send bulk SMS notifications."""
        results = {}
        
        for phone_number in phone_numbers:
            try:
                success = await self.send_sms(phone_number, message, db)
                results[phone_number] = success
            except Exception as e:
                logger.error("Bulk notification error", error=str(e), phone=phone_number)
                results[phone_number] = False
        
        return results

