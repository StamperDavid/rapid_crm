"""
Commerce-related models for orders, products, and payments.
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, Enum, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Supporter(BaseModel):
    """Supporter model for customers who make purchases."""
    
    __tablename__ = "supporters"
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Address information
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(50), default="US", nullable=False)
    
    # Marketing preferences
    email_opt_in = Column(String(10), default=True, nullable=False)
    sms_opt_in = Column(String(10), default=False, nullable=False)
    
    # Referral tracking - which player they came to support
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    
    # Relationships
    player = relationship("Player", back_populates="supporters")
    orders = relationship("Order", back_populates="supporter", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Supporter {self.first_name} {self.last_name}>"


class Product(BaseModel):
    """Product model for items that can be purchased."""
    
    __tablename__ = "products"
    
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=True)  # For profit calculation
    
    # Product details
    sku = Column(String(100), unique=True, nullable=False)
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
    is_active = Column(String(10), default=True, nullable=False)
    is_featured = Column(String(10), default=False, nullable=False)
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product {self.name} - ${self.price}>"


class Order(BaseModel):
    """Order model for tracking purchases and donations."""
    
    __tablename__ = "orders"
    
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
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
    supporter = relationship("Supporter", back_populates="orders")
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    player = relationship("Player", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order {self.order_number} - ${self.total_amount}>"


class OrderItem(BaseModel):
    """Order item model for individual products in an order."""
    
    __tablename__ = "order_items"
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    order = relationship("Order", back_populates="order_items")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem {self.product.name} x{self.quantity}>"


class Payment(BaseModel):
    """Payment model for tracking payment transactions."""
    
    __tablename__ = "payments"
    
    payment_method = Column(String(50), nullable=False)  # e.g., "credit_card", "paypal", "stripe"
    payment_provider = Column(String(50), nullable=False)  # e.g., "stripe", "paypal", "square"
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # Financial information
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Provider-specific data
    provider_transaction_id = Column(String(200), nullable=True)
    provider_response = Column(Text, nullable=True)  # JSON response from provider
    
    # Timestamps
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    order = relationship("Order", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment {self.payment_method} - ${self.amount}>"


class TeamStore(BaseModel):
    """Team store model for managing team-specific merchandise."""
    
    __tablename__ = "team_stores"
    
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(String(10), default=True, nullable=False)
    
    # Store settings
    allow_custom_orders = Column(String(10), default=False, nullable=False)
    require_approval = Column(String(10), default=False, nullable=False)
    
    # Relationships
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team = relationship("Team", back_populates="store")
    products = relationship("TeamProduct", back_populates="team_store", cascade="all, delete-orphan")
    orders = relationship("TeamOrder", back_populates="team_store", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamStore {self.name}>"


class TeamProduct(BaseModel):
    """Team product model for products available in team stores."""
    
    __tablename__ = "team_products"
    
    # Product details
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    sku = Column(String(100), nullable=True)
    
    # Product attributes
    category = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    
    # Inventory
    stock_quantity = Column(Integer, default=0, nullable=False)
    is_active = Column(String(10), default=True, nullable=False)
    
    # Media
    image_url = Column(String(500), nullable=True)
    
    # Relationships
    team_store_id = Column(Integer, ForeignKey("team_stores.id"), nullable=False)
    team_store = relationship("TeamStore", back_populates="products")
    order_items = relationship("TeamOrderItem", back_populates="team_product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamProduct {self.name} - ${self.price}>"


class TeamOrder(BaseModel):
    """Team order model for orders placed through team stores."""
    
    __tablename__ = "team_orders"
    
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    # Customer information
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=True)
    
    # Financial information
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    shipping_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Shipping information
    shipping_address = Column(Text, nullable=True)
    
    # Relationships
    team_store_id = Column(Integer, ForeignKey("team_stores.id"), nullable=False)
    team_store = relationship("TeamStore", back_populates="orders")
    items = relationship("TeamOrderItem", back_populates="team_order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<TeamOrder {self.order_number} - ${self.total_amount}>"


class TeamOrderItem(BaseModel):
    """Team order item model for individual products in team orders."""
    
    __tablename__ = "team_order_items"
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    team_order_id = Column(Integer, ForeignKey("team_orders.id"), nullable=False)
    team_order = relationship("TeamOrder", back_populates="items")
    team_product_id = Column(Integer, ForeignKey("team_products.id"), nullable=False)
    team_product = relationship("TeamProduct", back_populates="order_items")
    
    def __repr__(self):
        return f"<TeamOrderItem {self.team_product.name} x{self.quantity}>"


class PromotionalCompany(BaseModel):
    """Promotional company model for order fulfillment partners."""
    
    __tablename__ = "promotional_companies"
    
    name = Column(String(200), nullable=False, index=True)
    contact_name = Column(String(200), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    website = Column(String(500), nullable=True)
    
    # API integration
    api_endpoint = Column(String(500), nullable=True)
    api_key = Column(String(500), nullable=True)
    
    # Permissions
    can_update_images = Column(String(10), default=True, nullable=False)
    can_update_prices = Column(String(10), default=False, nullable=False)
    can_update_descriptions = Column(String(10), default=True, nullable=False)
    can_add_products = Column(String(10), default=True, nullable=False)
    
    # School access
    access_all_schools = Column(String(10), default=False, nullable=False)
    allowed_schools = Column(Text, nullable=True)  # JSON array of school IDs
    
    # Status
    is_active = Column(String(10), default=True, nullable=False)
    
    # New relationships for payment and agreement systems
    payment_transactions = relationship("PaymentTransaction", back_populates="promotional_company", cascade="all, delete-orphan")
    agreements = relationship("Agreement", back_populates="promotional_company", cascade="all, delete-orphan")
    transparency_reports = relationship("TransparencyReport", back_populates="promotional_company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PromotionalCompany {self.name}>"


class ProductImage(BaseModel):
    """Product image model for managing product photos."""
    
    __tablename__ = "product_images"
    
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(200), nullable=True)
    is_primary = Column(String(10), default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    
    # Relationships
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    team_product_id = Column(Integer, ForeignKey("team_products.id"), nullable=True)
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=True)
    
    def __repr__(self):
        return f"<ProductImage {self.image_url}>"

