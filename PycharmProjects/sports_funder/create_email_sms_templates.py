"""
Create default email and SMS templates
"""

from app.core.database import SessionLocal
from app.models.notification import NotificationTemplate
from datetime import datetime


def create_default_templates():
    """Create default email and SMS templates"""
    
    db = SessionLocal()
    try:
        # SMS Templates
        sms_templates = [
            {
                "name": "order_confirmation_sms",
                "type": "sms",
                "subject": "",
                "html_content": "",
                "text_content": "Hi {{ customer_name }}! Your order {{ order_number }} for {{ team_name }} has been confirmed. Total: ${{ total_amount }}. We'll send updates as it's processed. Thank you for supporting {{ school_name }}!",
                "description": "Order confirmation SMS template",
                "is_active": True
            },
            {
                "name": "order_status_update_sms",
                "type": "sms",
                "subject": "",
                "html_content": "",
                "text_content": "{{ customer_name }}, your {{ team_name }} order {{ order_number }} status: {{ new_status }}. Track at: [tracking_url]",
                "description": "Order status update SMS template",
                "is_active": True
            },
            {
                "name": "emergency_alert_sms",
                "type": "sms",
                "subject": "",
                "html_content": "",
                "text_content": "🚨 EMERGENCY ALERT - {{ school_name }}: {{ message }} Please take immediate action. Sent: {{ timestamp }}",
                "description": "Emergency alert SMS template",
                "is_active": True
            },
            {
                "name": "game_reminder_sms",
                "type": "sms",
                "subject": "",
                "html_content": "",
                "text_content": "🏀 Game Reminder! {{ team_name }} vs {{ opponent }} on {{ date }} at {{ time }}. Location: {{ location }}. Go {{ school_name }}!",
                "description": "Game reminder SMS template",
                "is_active": True
            },
            {
                "name": "team_newsletter_sms",
                "type": "sms",
                "subject": "",
                "html_content": "",
                "text_content": "📰 {{ team_name }} Update: {{ content }} Support your team at [store_url]",
                "description": "Team newsletter SMS template",
                "is_active": True
            }
        ]
        
        # Email Templates
        email_templates = [
            {
                "name": "order_confirmation",
                "type": "email",
                "subject": "Order Confirmation - {{ order_number }}",
                "html_content": "",  # Will use file template
                "text_content": "Order Confirmation\n\nDear {{ customer_name }},\n\nThank you for your order! We've received your order and it's being processed.\n\nOrder Details:\nOrder Number: {{ order_number }}\nOrder Date: {{ order.created_at.strftime('%B %d, %Y') }}\nTotal Amount: ${{ order.total_amount }}\n\nOrder Items:\n{% for item in items %}{{ item.product_name }} (Qty: {{ item.quantity }}) - ${{ item.total_price }}\n{% endfor %}\n\nShipping Address:\n{{ order.shipping_address }}\n\nWe'll send you updates as your order is processed and shipped.\n\nThank you for supporting {{ school_name }} and {{ team_name }}!\n\nQuestions? Contact us at support@sportsfunder.com",
                "description": "Order confirmation email template",
                "is_active": True
            },
            {
                "name": "order_status_update",
                "type": "email",
                "subject": "Order Update - {{ order_number }}",
                "html_content": "",
                "text_content": "Order Status Update\n\nDear {{ customer_name }},\n\nYour order {{ order_number }} for {{ team_name }} has been updated.\n\nNew Status: {{ new_status }}\n\nWe'll continue to keep you updated on your order's progress.\n\nThank you for supporting {{ school_name }}!",
                "description": "Order status update email template",
                "is_active": True
            },
            {
                "name": "emergency_alert",
                "type": "email",
                "subject": "🚨 EMERGENCY ALERT - {{ school_name }}",
                "html_content": "",  # Will use file template
                "text_content": "EMERGENCY ALERT\n\n{{ school_name }}\n\nImportant Message:\n{{ message }}\n\nPlease take immediate action as necessary and stay safe.\n\nAlert sent: {{ timestamp }}\n\nThis is an automated emergency alert from {{ school_name }}",
                "description": "Emergency alert email template",
                "is_active": True
            },
            {
                "name": "team_newsletter",
                "type": "email",
                "subject": "{{ team_name }} Newsletter",
                "html_content": "",
                "text_content": "{{ team_name }} Newsletter\n\nDear {{ name }},\n\n{{ content }}\n\nThank you for supporting {{ team_name }} and {{ school_name }}!\n\nVisit our team store: [store_url]",
                "description": "Team newsletter email template",
                "is_active": True
            }
        ]
        
        # Create templates
        all_templates = sms_templates + email_templates
        
        for template_data in all_templates:
            # Check if template already exists
            existing = db.query(NotificationTemplate).filter(
                NotificationTemplate.name == template_data["name"],
                NotificationTemplate.type == template_data["type"]
            ).first()
            
            if not existing:
                template = NotificationTemplate(
                    name=template_data["name"],
                    type=template_data["type"],
                    subject=template_data["subject"],
                    html_content=template_data["html_content"],
                    text_content=template_data["text_content"],
                    description=template_data["description"],
                    is_active=template_data["is_active"],
                    created_at=datetime.utcnow()
                )
                db.add(template)
                print(f"Created {template_data['type']} template: {template_data['name']}")
            else:
                print(f"Template already exists: {template_data['name']}")
        
        db.commit()
        print("✅ All templates created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating templates: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_default_templates()
