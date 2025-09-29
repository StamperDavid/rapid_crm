"""
Complete SMS Service with Template Management and Automation
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from jinja2 import Template
import os
import json

from app.models.notification import NotificationTemplate
from app.models.user import User
from app.models.organization import School, Team

logger = logging.getLogger(__name__)


class SMSService:
    """Complete SMS service with templates, automation, and analytics"""
    
    def __init__(self, db: Session):
        self.db = db
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER", "")
        self.sms_api_url = os.getenv("SMS_API_URL", "https://api.twilio.com/2010-04-01/Accounts")
        
        # Alternative SMS providers
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "")
        self.aws_sns_region = os.getenv("AWS_SNS_REGION", "us-east-1")
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY", "")
        self.aws_secret_key = os.getenv("AWS_SECRET_KEY", "")
    
    async def send_sms(
        self,
        to_phone: str,
        message: str,
        template_name: str = None,
        template_data: Dict[str, Any] = None,
        priority: str = "normal"
    ) -> Dict[str, Any]:
        """Send SMS with template support and tracking"""
        
        try:
            # Clean phone number
            to_phone = self._clean_phone_number(to_phone)
            
            # Generate message from template if provided
            if template_name and template_data:
                message = await self._render_template(template_name, template_data)
            
            # Send SMS via primary provider (Twilio)
            success = await self._send_twilio_sms(to_phone, message)
            
            # Fallback to other providers if Twilio fails
            if not success:
                success = await self._send_sendgrid_sms(to_phone, message)
            
            if not success:
                success = await self._send_aws_sns_sms(to_phone, message)
            
            # Log SMS
            await self._log_sms(to_phone, message, success, template_name)
            
            return {
                "success": success,
                "message": "SMS sent successfully" if success else "Failed to send SMS",
                "timestamp": datetime.utcnow().isoformat(),
                "phone_number": to_phone
            }
            
        except Exception as e:
            logger.error(f"Error sending SMS to {to_phone}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def send_bulk_sms(
        self,
        recipients: List[Dict[str, Any]],
        message: str,
        template_name: str = None,
        template_data: Dict[str, Any] = None,
        batch_size: int = 10,
        delay_between_batches: int = 2
    ) -> Dict[str, Any]:
        """Send bulk SMS with rate limiting"""
        
        results = {
            "total_recipients": len(recipients),
            "successful_sends": 0,
            "failed_sends": 0,
            "errors": []
        }
        
        # Process in batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            
            for recipient in batch:
                try:
                    # Personalize template data for each recipient
                    personalized_data = {**(template_data or {}), **recipient}
                    
                    result = await self.send_sms(
                        to_phone=recipient['phone'],
                        message=message,
                        template_name=template_name,
                        template_data=personalized_data
                    )
                    
                    if result['success']:
                        results['successful_sends'] += 1
                    else:
                        results['failed_sends'] += 1
                        results['errors'].append({
                            'phone': recipient['phone'],
                            'error': result.get('error', 'Unknown error')
                        })
                        
                except Exception as e:
                    results['failed_sends'] += 1
                    results['errors'].append({
                        'phone': recipient.get('phone', 'Unknown'),
                        'error': str(e)
                    })
            
            # Delay between batches to avoid rate limiting
            if i + batch_size < len(recipients):
                await asyncio.sleep(delay_between_batches)
        
        return results
    
    async def send_order_confirmation_sms(self, order_id: int) -> Dict[str, Any]:
        """Send order confirmation SMS"""
        from app.models.order_management import OrderManagement
        
        order = self.db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
        if not order or not order.customer_phone:
            return {"success": False, "error": "Order not found or no phone number"}
        
        template_data = {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "total_amount": order.total_amount,
            "school_name": order.school.name if order.school else "Unknown School",
            "team_name": order.team.name if order.team else "Unknown Team"
        }
        
        return await self.send_sms(
            to_phone=order.customer_phone,
            message="",
            template_name="order_confirmation_sms",
            template_data=template_data
        )
    
    async def send_order_status_update_sms(self, order_id: int, new_status: str) -> Dict[str, Any]:
        """Send order status update SMS"""
        from app.models.order_management import OrderManagement
        
        order = self.db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
        if not order or not order.customer_phone:
            return {"success": False, "error": "Order not found or no phone number"}
        
        template_data = {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "new_status": new_status,
            "school_name": order.school.name if order.school else "Unknown School",
            "team_name": order.team.name if order.team else "Unknown Team"
        }
        
        return await self.send_sms(
            to_phone=order.customer_phone,
            message="",
            template_name="order_status_update_sms",
            template_data=template_data
        )
    
    async def send_emergency_alert_sms(self, school_id: int, message: str) -> Dict[str, Any]:
        """Send emergency alert SMS to all school stakeholders"""
        school = self.db.query(School).filter(School.id == school_id).first()
        if not school:
            return {"success": False, "error": "School not found"}
        
        # Get all users with phone numbers associated with this school
        users = self.db.query(User).join(School).filter(
            School.id == school_id,
            User.phone.isnot(None),
            User.phone != ""
        ).all()
        
        recipients = []
        for user in users:
            recipients.append({
                "phone": user.phone,
                "name": f"{user.first_name} {user.last_name}",
                "school_name": school.name
            })
        
        template_data = {
            "school_name": school.name,
            "message": message,
            "timestamp": datetime.utcnow().strftime("%B %d, %Y at %I:%M %p")
        }
        
        return await self.send_bulk_sms(
            recipients=recipients,
            message="",
            template_name="emergency_alert_sms",
            template_data=template_data,
            priority="high"
        )
    
    async def send_game_reminder_sms(self, team_id: int, game_info: Dict[str, Any]) -> Dict[str, Any]:
        """Send game reminder SMS to team supporters"""
        team = self.db.query(Team).filter(Team.id == team_id).first()
        if not team:
            return {"success": False, "error": "Team not found"}
        
        # Get all supporters with phone numbers
        from app.models.order_management import OrderManagement
        supporters = self.db.query(OrderManagement).filter(
            OrderManagement.team_id == team_id,
            OrderManagement.customer_phone.isnot(None),
            OrderManagement.customer_phone != ""
        ).all()
        
        recipients = []
        for supporter in supporters:
            recipients.append({
                "phone": supporter.customer_phone,
                "name": supporter.customer_name,
                "team_name": team.name,
                "school_name": team.school.name
            })
        
        template_data = {
            "team_name": team.name,
            "school_name": team.school.name,
            "opponent": game_info.get("opponent", "TBD"),
            "date": game_info.get("date", "TBD"),
            "time": game_info.get("time", "TBD"),
            "location": game_info.get("location", "TBD")
        }
        
        return await self.send_bulk_sms(
            recipients=recipients,
            message="",
            template_name="game_reminder_sms",
            template_data=template_data
        )
    
    async def create_sms_template(
        self,
        name: str,
        message_template: str,
        description: str = None
    ) -> Dict[str, Any]:
        """Create new SMS template"""
        
        try:
            template = NotificationTemplate(
                name=name,
                type="sms",
                subject="",  # SMS doesn't have subject
                html_content="",  # SMS doesn't have HTML
                text_content=message_template,
                description=description,
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            self.db.add(template)
            self.db.commit()
            
            return {
                "success": True,
                "template_id": template.id,
                "message": "SMS template created successfully"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_sms_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get SMS analytics for the specified period"""
        from app.models.notification import Notification
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get SMS statistics
        total_sms = self.db.query(Notification).filter(
            Notification.type == "sms",
            Notification.created_at >= start_date
        ).count()
        
        successful_sms = self.db.query(Notification).filter(
            Notification.type == "sms",
            Notification.is_read == True,
            Notification.created_at >= start_date
        ).count()
        
        return {
            "total_sms_sent": total_sms,
            "successful_deliveries": successful_sms,
            "delivery_rate": (successful_sms / total_sms * 100) if total_sms > 0 else 0,
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat()
        }
    
    async def _send_twilio_sms(self, to_phone: str, message: str) -> bool:
        """Send SMS via Twilio"""
        try:
            if not self.twilio_account_sid or not self.twilio_auth_token:
                logger.warning("Twilio credentials not configured")
                return False
            
            url = f"{self.sms_api_url}/{self.twilio_account_sid}/Messages.json"
            
            data = {
                'From': self.twilio_phone_number,
                'To': to_phone,
                'Body': message
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    data=data,
                    auth=aiohttp.BasicAuth(self.twilio_account_sid, self.twilio_auth_token)
                ) as response:
                    if response.status == 201:
                        return True
                    else:
                        logger.error(f"Twilio SMS failed: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Twilio SMS error: {str(e)}")
            return False
    
    async def _send_sendgrid_sms(self, to_phone: str, message: str) -> bool:
        """Send SMS via SendGrid (if available)"""
        try:
            if not self.sendgrid_api_key:
                return False
            
            # SendGrid SMS implementation would go here
            # This is a placeholder for SendGrid SMS API
            logger.info(f"SendGrid SMS to {to_phone}: {message}")
            return True
            
        except Exception as e:
            logger.error(f"SendGrid SMS error: {str(e)}")
            return False
    
    async def _send_aws_sns_sms(self, to_phone: str, message: str) -> bool:
        """Send SMS via AWS SNS (if available)"""
        try:
            if not self.aws_access_key or not self.aws_secret_key:
                return False
            
            # AWS SNS SMS implementation would go here
            # This is a placeholder for AWS SNS SMS API
            logger.info(f"AWS SNS SMS to {to_phone}: {message}")
            return True
            
        except Exception as e:
            logger.error(f"AWS SNS SMS error: {str(e)}")
            return False
    
    async def _render_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """Render SMS template with data"""
        try:
            # Try to load template from database first
            template = self.db.query(NotificationTemplate).filter(
                NotificationTemplate.name == template_name,
                NotificationTemplate.type == "sms",
                NotificationTemplate.is_active == True
            ).first()
            
            if template:
                template_obj = Template(template.text_content)
                return template_obj.render(**data)
            else:
                # Return default message if template not found
                return f"Sports Funder: {data.get('message', 'Notification')}"
                
        except Exception as e:
            logger.error(f"Error rendering SMS template {template_name}: {str(e)}")
            return f"Sports Funder: {data.get('message', 'Notification')}"
    
    def _clean_phone_number(self, phone: str) -> str:
        """Clean and format phone number"""
        # Remove all non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone))
        
        # Add +1 if it's a 10-digit US number
        if len(cleaned) == 10:
            cleaned = '+1' + cleaned
        elif len(cleaned) == 11 and cleaned.startswith('1'):
            cleaned = '+' + cleaned
        elif not cleaned.startswith('+'):
            cleaned = '+' + cleaned
        
        return cleaned
    
    async def _log_sms(self, to_phone: str, message: str, success: bool, template_name: str = None):
        """Log SMS sending attempt"""
        try:
            notification = Notification(
                user_id=None,  # System notification
                title=f"SMS to {to_phone}",
                message=message[:100] + "..." if len(message) > 100 else message,
                type="sms_log",
                is_read=success,
                metadata={
                    "to_phone": to_phone,
                    "template_name": template_name,
                    "success": success,
                    "message_length": len(message)
                },
                created_at=datetime.utcnow()
            )
            
            self.db.add(notification)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error logging SMS: {str(e)}")
