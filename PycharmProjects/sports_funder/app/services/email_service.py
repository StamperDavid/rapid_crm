"""
Complete Email Service with Template Management and Automation
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from jinja2 import Template, Environment, FileSystemLoader
import os

from app.models.notification import NotificationTemplate
from app.models.user import User
from app.models.organization import School, Team

logger = logging.getLogger(__name__)


class EmailService:
    """Complete email service with templates, automation, and analytics"""
    
    def __init__(self, db: Session):
        self.db = db
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@sportsfunder.com")
        self.from_name = os.getenv("FROM_NAME", "Sports Funder")
        
        # Initialize Jinja2 for email templates
        self.jinja_env = Environment(
            loader=FileSystemLoader('app/templates/email'),
            autoescape=True
        )
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str = None,
        template_data: Dict[str, Any] = None,
        html_content: str = None,
        text_content: str = None,
        attachments: List[Dict[str, Any]] = None,
        priority: str = "normal"
    ) -> Dict[str, Any]:
        """Send email with template support and tracking"""
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['X-Priority'] = priority
            
            # Generate content from template or direct content
            if template_name and template_data:
                html_content, text_content = await self._render_template(template_name, template_data)
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(text_part)
            
            # Add HTML content
            if html_content:
                html_part = MIMEText(html_content, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    await self._add_attachment(msg, attachment)
            
            # Send email
            success = await self._send_smtp_email(msg, to_email)
            
            # Log email
            await self._log_email(to_email, subject, success, template_name)
            
            return {
                "success": success,
                "message": "Email sent successfully" if success else "Failed to send email",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def send_bulk_email(
        self,
        recipients: List[Dict[str, Any]],
        subject: str,
        template_name: str = None,
        template_data: Dict[str, Any] = None,
        html_content: str = None,
        text_content: str = None,
        batch_size: int = 50,
        delay_between_batches: int = 1
    ) -> Dict[str, Any]:
        """Send bulk emails with rate limiting"""
        
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
                    
                    result = await self.send_email(
                        to_email=recipient['email'],
                        subject=subject,
                        template_name=template_name,
                        template_data=personalized_data,
                        html_content=html_content,
                        text_content=text_content
                    )
                    
                    if result['success']:
                        results['successful_sends'] += 1
                    else:
                        results['failed_sends'] += 1
                        results['errors'].append({
                            'email': recipient['email'],
                            'error': result.get('error', 'Unknown error')
                        })
                        
                except Exception as e:
                    results['failed_sends'] += 1
                    results['errors'].append({
                        'email': recipient.get('email', 'Unknown'),
                        'error': str(e)
                    })
            
            # Delay between batches to avoid rate limiting
            if i + batch_size < len(recipients):
                await asyncio.sleep(delay_between_batches)
        
        return results
    
    async def send_order_confirmation(self, order_id: int) -> Dict[str, Any]:
        """Send order confirmation email"""
        from app.models.order_management import OrderManagement
        
        order = self.db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
        if not order:
            return {"success": False, "error": "Order not found"}
        
        template_data = {
            "order": order,
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "total_amount": order.total_amount,
            "items": order.order_items,
            "school_name": order.school.name if order.school else "Unknown School",
            "team_name": order.team.name if order.team else "Unknown Team"
        }
        
        return await self.send_email(
            to_email=order.customer_email,
            subject=f"Order Confirmation - {order.order_number}",
            template_name="order_confirmation.html",
            template_data=template_data
        )
    
    async def send_order_status_update(self, order_id: int, new_status: str) -> Dict[str, Any]:
        """Send order status update email"""
        from app.models.order_management import OrderManagement
        
        order = self.db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
        if not order:
            return {"success": False, "error": "Order not found"}
        
        template_data = {
            "order": order,
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "new_status": new_status,
            "school_name": order.school.name if order.school else "Unknown School",
            "team_name": order.team.name if order.team else "Unknown Team"
        }
        
        return await self.send_email(
            to_email=order.customer_email,
            subject=f"Order Update - {order.order_number}",
            template_name="order_status_update.html",
            template_data=template_data
        )
    
    async def send_team_newsletter(self, team_id: int, subject: str, content: str) -> Dict[str, Any]:
        """Send newsletter to all team supporters"""
        team = self.db.query(Team).filter(Team.id == team_id).first()
        if not team:
            return {"success": False, "error": "Team not found"}
        
        # Get all supporters (people who have made orders for this team)
        from app.models.order_management import OrderManagement
        supporters = self.db.query(OrderManagement).filter(
            OrderManagement.team_id == team_id
        ).all()
        
        recipients = []
        for supporter in supporters:
            recipients.append({
                "email": supporter.customer_email,
                "name": supporter.customer_name,
                "team_name": team.name,
                "school_name": team.school.name
            })
        
        template_data = {
            "team_name": team.name,
            "school_name": team.school.name,
            "content": content
        }
        
        return await self.send_bulk_email(
            recipients=recipients,
            subject=subject,
            template_name="team_newsletter.html",
            template_data=template_data
        )
    
    async def send_emergency_alert(self, school_id: int, message: str) -> Dict[str, Any]:
        """Send emergency alert to all school stakeholders"""
        school = self.db.query(School).filter(School.id == school_id).first()
        if not school:
            return {"success": False, "error": "School not found"}
        
        # Get all users associated with this school
        users = self.db.query(User).join(School).filter(School.id == school_id).all()
        
        recipients = []
        for user in users:
            recipients.append({
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}",
                "school_name": school.name
            })
        
        template_data = {
            "school_name": school.name,
            "message": message,
            "timestamp": datetime.utcnow().strftime("%B %d, %Y at %I:%M %p")
        }
        
        return await self.send_bulk_email(
            recipients=recipients,
            subject=f"🚨 EMERGENCY ALERT - {school.name}",
            template_name="emergency_alert.html",
            template_data=template_data,
            priority="high"
        )
    
    async def create_email_template(
        self,
        name: str,
        subject: str,
        html_template: str,
        text_template: str = None,
        description: str = None
    ) -> Dict[str, Any]:
        """Create new email template"""
        
        try:
            template = NotificationTemplate(
                name=name,
                type="email",
                subject=subject,
                html_content=html_template,
                text_content=text_template,
                description=description,
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            self.db.add(template)
            self.db.commit()
            
            return {
                "success": True,
                "template_id": template.id,
                "message": "Email template created successfully"
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_email_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get email analytics for the specified period"""
        from app.models.notification import Notification
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get email statistics
        total_emails = self.db.query(Notification).filter(
            Notification.type == "email",
            Notification.created_at >= start_date
        ).count()
        
        successful_emails = self.db.query(Notification).filter(
            Notification.type == "email",
            Notification.is_read == True,
            Notification.created_at >= start_date
        ).count()
        
        return {
            "total_emails_sent": total_emails,
            "successful_deliveries": successful_emails,
            "delivery_rate": (successful_emails / total_emails * 100) if total_emails > 0 else 0,
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat()
        }
    
    async def _render_template(self, template_name: str, data: Dict[str, Any]) -> tuple[str, str]:
        """Render email template with data"""
        try:
            # Try to load template from database first
            template = self.db.query(NotificationTemplate).filter(
                NotificationTemplate.name == template_name,
                NotificationTemplate.type == "email",
                NotificationTemplate.is_active == True
            ).first()
            
            if template:
                html_template = Template(template.html_content)
                text_template = Template(template.text_content or "")
            else:
                # Fall back to file system
                html_template = self.jinja_env.get_template(f"{template_name}.html")
                text_template = self.jinja_env.get_template(f"{template_name}.txt")
            
            html_content = html_template.render(**data)
            text_content = text_template.render(**data) if text_template else ""
            
            return html_content, text_content
            
        except Exception as e:
            logger.error(f"Error rendering template {template_name}: {str(e)}")
            # Return fallback content
            return f"<p>Error rendering template: {str(e)}</p>", f"Error rendering template: {str(e)}"
    
    async def _send_smtp_email(self, msg: MIMEMultipart, to_email: str) -> bool:
        """Send email via SMTP"""
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.warning("SMTP credentials not configured, email not sent")
                return False
            
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            return False
    
    async def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]):
        """Add attachment to email"""
        try:
            if attachment.get('type') == 'image':
                with open(attachment['path'], 'rb') as f:
                    img_data = f.read()
                    image = MIMEImage(img_data)
                    image.add_header('Content-Disposition', f'attachment; filename={attachment["filename"]}')
                    msg.attach(image)
            else:
                # Handle other attachment types
                pass
        except Exception as e:
            logger.error(f"Error adding attachment: {str(e)}")
    
    async def _log_email(self, to_email: str, subject: str, success: bool, template_name: str = None):
        """Log email sending attempt"""
        try:
            notification = Notification(
                user_id=None,  # System notification
                title=f"Email: {subject}",
                message=f"Email sent to {to_email}",
                type="email_log",
                is_read=success,
                metadata={
                    "to_email": to_email,
                    "subject": subject,
                    "template_name": template_name,
                    "success": success
                },
                created_at=datetime.utcnow()
            )
            
            self.db.add(notification)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error logging email: {str(e)}")


# Import asyncio for sleep function
import asyncio
