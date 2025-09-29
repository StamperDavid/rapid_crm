"""
Order Management and Communication Models
Handles order processing, promotional company integration, and mass communications
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum


class OrderStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class CommunicationType(enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


class MessagePriority(enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Order(Base):
    """Enhanced order model with promotional company integration"""
    __tablename__ = "order_management_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # Customer Information
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20))
    shipping_address = Column(Text, nullable=False)
    billing_address = Column(Text)
    
    # School/Team Information
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    
    # Order Details
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_cost = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Status and Tracking
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_status = Column(String(50), default="pending")
    payment_method = Column(String(50))
    payment_reference = Column(String(255))
    
    # Promotional Company Integration
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"))
    company_order_reference = Column(String(255))  # Reference from promotional company
    company_tracking_number = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    shipped_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    
    # Additional Data
    notes = Column(Text)
    order_metadata = Column(JSON)  # For storing additional order data
    
    # Relationships
    school = relationship("School", back_populates="orders")
    team = relationship("Team", back_populates="orders")
    promotional_company = relationship("PromotionalCompany", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    order_status_updates = relationship("OrderStatusUpdate", back_populates="order", cascade="all, delete-orphan")
    communications = relationship("OrderCommunication", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Individual items within an order"""
    __tablename__ = "order_management_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order_management_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Product Details (snapshot at time of order)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    product_description = Column(Text)
    product_image_url = Column(String(500))
    
    # Pricing
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Customization
    size = Column(String(50))
    color = Column(String(50))
    customization_options = Column(JSON)  # For custom text, logos, etc.
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product")


class OrderStatusUpdate(Base):
    """Track order status changes and updates"""
    __tablename__ = "order_status_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order_management_orders.id"), nullable=False)
    
    # Status Information
    previous_status = Column(Enum(OrderStatus))
    new_status = Column(Enum(OrderStatus), nullable=False)
    status_message = Column(Text)
    
    # Tracking Information
    tracking_number = Column(String(255))
    carrier = Column(String(100))
    tracking_url = Column(String(500))
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_status_updates")


class OrderCommunication(Base):
    """Track communications sent regarding orders"""
    __tablename__ = "order_communications"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order_management_orders.id"), nullable=False)
    
    # Communication Details
    communication_type = Column(Enum(CommunicationType), nullable=False)
    subject = Column(String(255))
    message = Column(Text, nullable=False)
    
    # Delivery Information
    sent_to = Column(String(255), nullable=False)  # Email or phone number
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivery_status = Column(String(50), default="sent")  # sent, delivered, failed, bounced
    
    # Relationships
    order = relationship("Order", back_populates="communications")


class MassCommunication(Base):
    """Mass communication campaigns for schools/teams"""
    __tablename__ = "mass_communications"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String(255), nullable=False)
    
    # School/Team Information
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    
    # Communication Details
    communication_type = Column(Enum(CommunicationType), nullable=False)
    priority = Column(Enum(MessagePriority), default=MessagePriority.NORMAL)
    subject = Column(String(255))
    message = Column(Text, nullable=False)
    
    # Targeting
    target_audience = Column(JSON)  # supporters, team_members, staff, parents, etc.
    custom_recipients = Column(JSON)  # Additional email/phone numbers
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, sending, sent, failed
    total_recipients = Column(Integer, default=0)
    successful_sends = Column(Integer, default=0)
    failed_sends = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School")
    team = relationship("Team")
    communication_logs = relationship("CommunicationLog", back_populates="mass_communication", cascade="all, delete-orphan")


class CommunicationLog(Base):
    """Individual communication delivery logs"""
    __tablename__ = "communication_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    mass_communication_id = Column(Integer, ForeignKey("mass_communications.id"), nullable=False)
    
    # Recipient Information
    recipient_type = Column(String(50))  # supporter, team_member, staff, parent, custom
    recipient_id = Column(Integer)  # ID of the specific recipient
    recipient_name = Column(String(255))
    recipient_contact = Column(String(255), nullable=False)  # Email or phone
    
    # Delivery Information
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    delivery_status = Column(String(50), default="sent")
    delivery_message = Column(Text)  # Error message or delivery confirmation
    
    # Relationships
    mass_communication = relationship("MassCommunication", back_populates="communication_logs")


class ContactList(Base):
    """Contact lists for mass communications"""
    __tablename__ = "contact_lists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # School/Team Association
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    
    # Contact Information
    contacts = Column(JSON)  # Array of contact objects with name, email, phone, type
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School")
    team = relationship("Team")


class PromotionalCompanyOrder(Base):
    """Orders forwarded to promotional companies"""
    __tablename__ = "promotional_company_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order_management_orders.id"), nullable=False)
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=False)
    
    # Company Order Details
    company_order_id = Column(String(255))  # Order ID from promotional company
    company_reference = Column(String(255))
    
    # Status
    status = Column(String(50), default="pending")  # pending, confirmed, processing, shipped, delivered, cancelled
    company_status = Column(String(255))  # Status message from company
    
    # API Integration
    api_request_data = Column(JSON)  # Data sent to company API
    api_response_data = Column(JSON)  # Response from company API
    api_last_sync = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    order = relationship("Order")
    promotional_company = relationship("PromotionalCompany")


# Update existing models to include relationships
# This would be added to existing model files

# In app/models/organization.py - add to School model:
# orders = relationship("Order", back_populates="school")
# mass_communications = relationship("MassCommunication", back_populates="school")
# contact_lists = relationship("ContactList", back_populates="school")

# In app/models/organization.py - add to Team model:
# orders = relationship("Order", back_populates="team")
# mass_communications = relationship("MassCommunication", back_populates="team")
# contact_lists = relationship("ContactList", back_populates="team")

# In app/models/commerce.py - add to PromotionalCompany model:
# orders = relationship("Order", back_populates="promotional_company")
# company_orders = relationship("PromotionalCompanyOrder", back_populates="promotional_company")
