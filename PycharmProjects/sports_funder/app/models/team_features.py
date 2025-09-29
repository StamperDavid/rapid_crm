"""
Team-specific features: events, local businesses, team stores.
"""
from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Integer, DateTime, Numeric, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class EventType(str, enum.Enum):
    """Event type enumeration."""
    GAME = "game"
    PRACTICE = "practice"
    FUNDRAISER = "fundraiser"
    MEETING = "meeting"
    SPECIAL_EVENT = "special_event"


class TeamEvent(BaseModel):
    """Team event model for games, practices, and special events."""
    
    __tablename__ = "team_events"
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(Enum(EventType), nullable=False)
    
    # Date and time
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=True)
    
    # Location
    location_name = Column(String(200), nullable=True)
    location_address = Column(Text, nullable=True)
    
    # Event details
    is_home_game = Column(Boolean, default=True, nullable=False)
    opponent = Column(String(200), nullable=True)
    event_url = Column(String(500), nullable=True)
    
    # Relationships
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team = relationship("Team", back_populates="events")
    
    def __repr__(self):
        return f"<TeamEvent {self.title} - {self.start_datetime}>"


class TeamStore(BaseModel):
    """Team store model for e-commerce."""
    
    __tablename__ = "team_stores"
    
    store_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Store settings
    is_active = Column(Boolean, default=True, nullable=False)
    allow_custom_orders = Column(Boolean, default=False, nullable=False)
    
    # Store branding
    store_logo_url = Column(String(500), nullable=True)
    store_banner_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), nullable=True)  # Hex color code
    secondary_color = Column(String(7), nullable=True)  # Hex color code
    
    # Relationships
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team = relationship("Team", back_populates="store")
    products = relationship("TeamProduct", back_populates="store", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamStore {self.store_name}>"


class TeamProduct(BaseModel):
    """Team-specific product model."""
    
    __tablename__ = "team_products"
    
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=True)  # For profit calculation
    
    # Product details
    sku = Column(String(100), nullable=False)
    category = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    
    # Inventory
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    
    # Media
    image_url = Column(String(500), nullable=True)
    additional_images = Column(Text, nullable=True)  # JSON array of image URLs
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    store_id = Column(Integer, ForeignKey("team_stores.id"), nullable=False)
    store = relationship("TeamStore", back_populates="products")
    order_items = relationship("TeamOrderItem", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamProduct {self.name} - ${self.price}>"


class TeamOrder(BaseModel):
    """Team store order model."""
    
    __tablename__ = "team_orders"
    
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    
    # Financial information
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    shipping_amount = Column(Numeric(10, 2), default=0, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Shipping information
    shipping_address_line1 = Column(String(200), nullable=True)
    shipping_address_line2 = Column(String(200), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(50), nullable=True)
    shipping_zip_code = Column(String(20), nullable=True)
    shipping_country = Column(String(50), default="US", nullable=False)
    
    # Tracking
    tracking_number = Column(String(100), nullable=True)
    tracking_carrier = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=False)
    supporter = relationship("Supporter")
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team = relationship("Team")
    order_items = relationship("TeamOrderItem", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamOrder {self.order_number} - ${self.total_amount}>"


class TeamOrderItem(BaseModel):
    """Team order item model for individual products in a team order."""
    
    __tablename__ = "team_order_items"
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    order_id = Column(Integer, ForeignKey("team_orders.id"), nullable=False)
    order = relationship("TeamOrder", back_populates="order_items")
    product_id = Column(Integer, ForeignKey("team_products.id"), nullable=False)
    product = relationship("TeamProduct", back_populates="order_items")
    
    def __repr__(self):
        return f"<TeamOrderItem {self.product.name} x{self.quantity}>"
