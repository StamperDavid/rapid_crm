"""
Complete e-commerce system models for Sports Funder.
Includes products, categories, variants, inventory, cart, and order management.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, Enum, DateTime, Numeric, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class ProductCategory(BaseModel):
    """Product category model for organizing products."""
    
    __tablename__ = "product_categories"
    
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("product_categories.id"), nullable=True)
    
    # Display settings
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Relationships
    parent = relationship("ProductCategory", remote_side="ProductCategory.id", back_populates="children")
    children = relationship("ProductCategory", back_populates="parent", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ProductCategory {self.name}>"


class ProductVariant(BaseModel):
    """Product variant model for size, color, style variations."""
    
    __tablename__ = "product_variants"
    
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=False)
    
    # Variant attributes
    name = Column(String(100), nullable=False)  # e.g., "Red - Large"
    sku = Column(String(100), unique=True, nullable=False, index=True)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=True)
    compare_at_price = Column(Numeric(10, 2), nullable=True)  # For showing discounts
    
    # Inventory
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    track_inventory = Column(Boolean, default=True, nullable=False)
    
    # Variant options (JSON)
    options = Column(JSON, nullable=True)  # {"size": "Large", "color": "Red"}
    
    # Media
    image_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")
    
    def __repr__(self):
        return f"<ProductVariant {self.name} - ${self.price}>"


class Product(BaseModel):
    """Enhanced product model with full e-commerce features."""
    
    __tablename__ = "ecommerce_products"
    
    # Basic information
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    
    # Pricing (base price, variants can override)
    price = Column(Numeric(10, 2), nullable=False)
    cost = Column(Numeric(10, 2), nullable=True)
    compare_at_price = Column(Numeric(10, 2), nullable=True)
    
    # Product details
    sku = Column(String(100), unique=True, nullable=False, index=True)
    barcode = Column(String(100), nullable=True)
    weight = Column(Numeric(8, 2), nullable=True)  # in pounds
    dimensions = Column(JSON, nullable=True)  # {"length": 10, "width": 8, "height": 2}
    
    # Category and organization
    category_id = Column(Integer, ForeignKey("product_categories.id"), nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tags
    
    # Inventory (for simple products without variants)
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=10, nullable=False)
    track_inventory = Column(Boolean, default=True, nullable=False)
    
    # Media
    featured_image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True)  # Array of image URLs
    video_url = Column(String(500), nullable=True)
    
    # Product type and variants
    product_type = Column(String(50), default="simple", nullable=False)  # simple, variable, digital
    has_variants = Column(Boolean, default=False, nullable=False)
    
    # Status and visibility
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_digital = Column(Boolean, default=False, nullable=False)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # School/Team association
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Relationships
    category = relationship("ProductCategory", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    school = relationship("School")
    team = relationship("Team")
    
    def __repr__(self):
        return f"<Product {self.name} - ${self.price}>"


class ShoppingCart(BaseModel):
    """Shopping cart model for storing user cart items."""
    
    __tablename__ = "shopping_carts"
    
    # User identification
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For logged-in users
    session_id = Column(String(100), nullable=True, index=True)  # For guest users
    
    # Cart metadata
    expires_at = Column(DateTime, nullable=True)
    is_abandoned = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ShoppingCart {self.id}>"


class CartItem(BaseModel):
    """Individual items in a shopping cart."""
    
    __tablename__ = "cart_items"
    
    cart_id = Column(Integer, ForeignKey("shopping_carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Numeric(10, 2), nullable=False)  # Price at time of adding to cart
    
    # Relationships
    cart = relationship("ShoppingCart", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    
    def __repr__(self):
        return f"<CartItem {self.product.name} x{self.quantity}>"


class OrderStatus(str, enum.Enum):
    """Enhanced order status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    ON_HOLD = "on_hold"


class Order(BaseModel):
    """Enhanced order model with complete e-commerce features."""
    
    __tablename__ = "ecommerce_orders"
    
    # Order identification
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Customer information
    customer_first_name = Column(String(100), nullable=False)
    customer_last_name = Column(String(100), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=True)
    
    # Billing address
    billing_address_line1 = Column(String(200), nullable=True)
    billing_address_line2 = Column(String(200), nullable=True)
    billing_city = Column(String(100), nullable=True)
    billing_state = Column(String(50), nullable=True)
    billing_zip_code = Column(String(20), nullable=True)
    billing_country = Column(String(50), default="US", nullable=False)
    
    # Shipping address
    shipping_address_line1 = Column(String(200), nullable=True)
    shipping_address_line2 = Column(String(200), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(50), nullable=True)
    shipping_zip_code = Column(String(20), nullable=True)
    shipping_country = Column(String(50), default="US", nullable=False)
    
    # Order details
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    shipping_cost = Column(Numeric(10, 2), default=0, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Payment information
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(String(50), default="pending", nullable=False)
    payment_reference = Column(String(100), nullable=True)
    
    # Shipping information
    shipping_method = Column(String(100), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # School/Team association
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    
    # Notes and metadata
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    order_metadata = Column(JSON, nullable=True)
    
    # Relationships
    school = relationship("School")
    team = relationship("Team")
    supporter = relationship("Supporter", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment_transactions = relationship("PaymentTransaction", back_populates="order")
    
    def __repr__(self):
        return f"<Order {self.order_number} - ${self.total_amount}>"


class OrderItem(BaseModel):
    """Individual items in an order."""
    
    __tablename__ = "ecommerce_order_items"
    
    order_id = Column(Integer, ForeignKey("ecommerce_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    # Product details at time of order
    product_name = Column(String(200), nullable=False)
    product_sku = Column(String(100), nullable=False)
    variant_name = Column(String(100), nullable=True)
    
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")
    
    def __repr__(self):
        return f"<OrderItem {self.product_name} x{self.quantity}>"


class ProductReview(BaseModel):
    """Product review model for customer feedback."""
    
    __tablename__ = "product_reviews"
    
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("ecommerce_orders.id"), nullable=True)
    
    # Reviewer information
    reviewer_name = Column(String(100), nullable=False)
    reviewer_email = Column(String(255), nullable=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200), nullable=True)
    review_text = Column(Text, nullable=True)
    
    # Review status
    is_approved = Column(Boolean, default=False, nullable=False)
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    product = relationship("Product")
    order = relationship("Order")
    
    def __repr__(self):
        return f"<ProductReview {self.product.name} - {self.rating} stars>"


class Wishlist(BaseModel):
    """Wishlist model for users to save favorite products."""
    
    __tablename__ = "wishlists"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)
    
    name = Column(String(100), default="My Wishlist", nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User")
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Wishlist {self.name}>"


class WishlistItem(BaseModel):
    """Individual items in a wishlist."""
    
    __tablename__ = "wishlist_items"
    
    wishlist_id = Column(Integer, ForeignKey("wishlists.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    # Relationships
    wishlist = relationship("Wishlist", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    
    def __repr__(self):
        return f"<WishlistItem {self.product.name}>"


class Coupon(BaseModel):
    """Coupon model for discounts and promotions."""
    
    __tablename__ = "coupons"
    
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Discount details
    discount_type = Column(String(20), nullable=False)  # percentage, fixed_amount, free_shipping
    discount_value = Column(Numeric(10, 2), nullable=False)
    minimum_order_amount = Column(Numeric(10, 2), nullable=True)
    maximum_discount_amount = Column(Numeric(10, 2), nullable=True)
    
    # Usage limits
    usage_limit = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    usage_limit_per_customer = Column(Integer, default=1, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=True)
    
    # Applicability
    applicable_products = Column(JSON, nullable=True)  # Array of product IDs
    applicable_categories = Column(JSON, nullable=True)  # Array of category IDs
    applicable_schools = Column(JSON, nullable=True)  # Array of school IDs
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f"<Coupon {self.code} - {self.discount_type}>"


class InventoryTransaction(BaseModel):
    """Inventory transaction model for tracking stock changes."""
    
    __tablename__ = "inventory_transactions"
    
    product_id = Column(Integer, ForeignKey("ecommerce_products.id"), nullable=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    
    # Transaction details
    transaction_type = Column(String(50), nullable=False)  # sale, return, adjustment, restock
    quantity_change = Column(Integer, nullable=False)  # Positive for additions, negative for subtractions
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    
    # Reference information
    order_id = Column(Integer, ForeignKey("ecommerce_orders.id"), nullable=True)
    reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    product = relationship("Product")
    variant = relationship("ProductVariant")
    order = relationship("Order")
    
    def __repr__(self):
        return f"<InventoryTransaction {self.transaction_type} - {self.quantity_change}>"
