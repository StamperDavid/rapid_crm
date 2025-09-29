"""
Complete e-commerce API endpoints for Sports Funder.
Handles products, categories, cart, orders, and inventory management.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import json
import uuid

from app.core.database import get_db
from app.models.ecommerce import (
    Product as EcommerceProduct, ProductCategory, ProductVariant, ShoppingCart, CartItem,
    Order as EcommerceOrder, OrderItem as EcommerceOrderItem, ProductReview, Wishlist, WishlistItem, Coupon,
    InventoryTransaction, OrderStatus as EcommerceOrderStatus
)
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
import structlog

logger = structlog.get_logger()
router = APIRouter()


# Pydantic models for API requests/responses
class ProductCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float = Field(..., gt=0)
    cost: Optional[float] = None
    compare_at_price: Optional[float] = None
    sku: str = Field(..., max_length=100)
    barcode: Optional[str] = None
    weight: Optional[float] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    track_inventory: bool = True
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_url: Optional[str] = None
    product_type: str = Field(default="simple", pattern="^(simple|variable|digital)$")
    is_active: bool = True
    is_featured: bool = False
    is_digital: bool = False
    school_id: Optional[int] = None
    team_id: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    cost: Optional[float]
    compare_at_price: Optional[float]
    sku: str
    barcode: Optional[str]
    weight: Optional[float]
    category_id: Optional[int]
    tags: Optional[List[str]]
    stock_quantity: int
    low_stock_threshold: int
    track_inventory: bool
    featured_image_url: Optional[str]
    gallery_images: Optional[List[str]]
    video_url: Optional[str]
    product_type: str
    has_variants: bool
    is_active: bool
    is_featured: bool
    is_digital: bool
    school_id: Optional[int]
    team_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    slug: str = Field(..., max_length=100)
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    slug: str
    parent_id: Optional[int]
    image_url: Optional[str]
    display_order: int
    is_active: bool
    meta_title: Optional[str]
    meta_description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_first_name: str = Field(..., max_length=100)
    customer_last_name: str = Field(..., max_length=100)
    customer_email: str = Field(..., max_length=255)
    customer_phone: Optional[str] = Field(None, max_length=20)
    
    # Billing address
    billing_address_line1: Optional[str] = None
    billing_address_line2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_zip_code: Optional[str] = None
    billing_country: str = Field(default="US", max_length=50)
    
    # Shipping address
    shipping_address_line1: Optional[str] = None
    shipping_address_line2: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_zip_code: Optional[str] = None
    shipping_country: str = Field(default="US", max_length=50)
    
    # Order details
    subtotal: float = Field(..., gt=0)
    tax_amount: float = Field(default=0, ge=0)
    shipping_cost: float = Field(default=0, ge=0)
    discount_amount: float = Field(default=0, ge=0)
    total_amount: float = Field(..., gt=0)
    
    # Payment information
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    
    # School/Team association
    school_id: Optional[int] = None
    team_id: Optional[int] = None
    supporter_id: Optional[int] = None
    
    # Notes
    notes: Optional[str] = None


# Product endpoints
@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 50,
    category_id: Optional[int] = None,
    school_id: Optional[int] = None,
    team_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):
    """Get products with filtering and search."""
    query = db.query(EcommerceProduct)
    
    # Apply filters
    if category_id:
        query = query.filter(EcommerceProduct.category_id == category_id)
    if school_id:
        query = query.filter(EcommerceProduct.school_id == school_id)
    if team_id:
        query = query.filter(EcommerceProduct.team_id == team_id)
    if is_featured is not None:
        query = query.filter(EcommerceProduct.is_featured == is_featured)
    if is_active is not None:
        query = query.filter(EcommerceProduct.is_active == is_active)
    
    # Search functionality
    if search:
        search_filter = or_(
            EcommerceProduct.name.ilike(f"%{search}%"),
            EcommerceProduct.description.ilike(f"%{search}%"),
            EcommerceProduct.sku.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Sorting
    if sort_by == "name":
        order_column = EcommerceProduct.name
    elif sort_by == "price":
        order_column = EcommerceProduct.price
    elif sort_by == "created_at":
        order_column = EcommerceProduct.created_at
    else:
        order_column = EcommerceProduct.created_at
    
    if sort_order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific product by ID."""
    product = db.query(EcommerceProduct).filter(EcommerceProduct.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("/products", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product."""
    try:
        # Generate slug if not provided
        slug = product_data.name.lower().replace(" ", "-").replace("&", "and")
        
        # Check if SKU already exists
        existing_sku = db.query(EcommerceProduct).filter(EcommerceProduct.sku == product_data.sku).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists"
            )
        
        # Create product
        product = EcommerceProduct(
            name=product_data.name,
            description=product_data.description,
            short_description=product_data.short_description,
            slug=slug,
            price=product_data.price,
            cost=product_data.cost,
            compare_at_price=product_data.compare_at_price,
            sku=product_data.sku,
            barcode=product_data.barcode,
            weight=product_data.weight,
            category_id=product_data.category_id,
            tags=json.dumps(product_data.tags) if product_data.tags else None,
            stock_quantity=product_data.stock_quantity,
            low_stock_threshold=product_data.low_stock_threshold,
            track_inventory=product_data.track_inventory,
            featured_image_url=product_data.featured_image_url,
            gallery_images=json.dumps(product_data.gallery_images) if product_data.gallery_images else None,
            video_url=product_data.video_url,
            product_type=product_data.product_type,
            is_active=product_data.is_active,
            is_featured=product_data.is_featured,
            is_digital=product_data.is_digital,
            school_id=product_data.school_id,
            team_id=product_data.team_id
        )
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        logger.info(f"Product created: {product.name} (ID: {product.id})")
        return product
        
    except Exception as e:
        logger.error(f"Product creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Product creation failed: {str(e)}"
        )


# Category endpoints
@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    parent_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get product categories."""
    query = db.query(ProductCategory)
    
    if parent_id is not None:
        query = query.filter(ProductCategory.parent_id == parent_id)
    if is_active is not None:
        query = query.filter(ProductCategory.is_active == is_active)
    
    categories = query.order_by(ProductCategory.display_order, ProductCategory.name).all()
    return categories


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product category."""
    try:
        # Check if slug already exists
        existing_slug = db.query(ProductCategory).filter(ProductCategory.slug == category_data.slug).first()
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category slug already exists"
            )
        
        category = ProductCategory(
            name=category_data.name,
            description=category_data.description,
            slug=category_data.slug,
            parent_id=category_data.parent_id,
            image_url=category_data.image_url,
            display_order=category_data.display_order,
            is_active=category_data.is_active,
            meta_title=category_data.meta_title,
            meta_description=category_data.meta_description
        )
        
        db.add(category)
        db.commit()
        db.refresh(category)
        
        logger.info(f"Category created: {category.name} (ID: {category.id})")
        return category
        
    except Exception as e:
        logger.error(f"Category creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Category creation failed: {str(e)}"
        )


# Shopping cart endpoints
@router.get("/cart")
async def get_cart(
    session_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shopping cart."""
    if current_user:
        cart = db.query(ShoppingCart).filter(
            ShoppingCart.user_id == current_user.id,
            ShoppingCart.is_abandoned == False
        ).first()
    elif session_id:
        cart = db.query(ShoppingCart).filter(
            ShoppingCart.session_id == session_id,
            ShoppingCart.is_abandoned == False
        ).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User authentication or session ID required"
        )
    
    if not cart:
        return {"items": [], "total": 0, "item_count": 0}
    
    # Calculate totals
    total = 0
    item_count = 0
    
    for item in cart.items:
        total += float(item.price * item.quantity)
        item_count += item.quantity
    
    return {
        "cart_id": cart.id,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "product_name": item.product.name,
                "variant_name": item.variant.name if item.variant else None,
                "quantity": item.quantity,
                "price": float(item.price),
                "total": float(item.price * item.quantity)
            }
            for item in cart.items
        ],
        "total": total,
        "item_count": item_count
    }


@router.post("/cart/add")
async def add_to_cart(
    cart_item: CartItemCreate,
    session_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to shopping cart."""
    try:
        # Get or create cart
        if current_user:
            cart = db.query(ShoppingCart).filter(
                ShoppingCart.user_id == current_user.id,
                ShoppingCart.is_abandoned == False
            ).first()
        elif session_id:
            cart = db.query(ShoppingCart).filter(
                ShoppingCart.session_id == session_id,
                ShoppingCart.is_abandoned == False
            ).first()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User authentication or session ID required"
            )
        
        if not cart:
            cart = ShoppingCart(
                user_id=current_user.id if current_user else None,
                session_id=session_id,
                expires_at=datetime.utcnow() + timedelta(days=30)
            )
            db.add(cart)
            db.commit()
            db.refresh(cart)
        
        # Get product and variant
        product = db.query(EcommerceProduct).filter(EcommerceProduct.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        variant = None
        if cart_item.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == cart_item.variant_id).first()
            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product variant not found"
                )
            price = variant.price
        else:
            price = product.price
        
        # Check if item already exists in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == cart_item.product_id,
            CartItem.variant_id == cart_item.variant_id
        ).first()
        
        if existing_item:
            existing_item.quantity += cart_item.quantity
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                quantity=cart_item.quantity,
                price=price
            )
            db.add(new_item)
        
        db.commit()
        
        return {"message": "Item added to cart successfully"}
        
    except Exception as e:
        logger.error(f"Add to cart error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add item to cart: {str(e)}"
        )


# Order endpoints
@router.post("/orders", response_model=dict)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new order."""
    try:
        # Generate order number
        order_number = f"ORD_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create order
        order = EcommerceOrder(
            order_number=order_number,
            customer_first_name=order_data.customer_first_name,
            customer_last_name=order_data.customer_last_name,
            customer_email=order_data.customer_email,
            customer_phone=order_data.customer_phone,
            billing_address_line1=order_data.billing_address_line1,
            billing_address_line2=order_data.billing_address_line2,
            billing_city=order_data.billing_city,
            billing_state=order_data.billing_state,
            billing_zip_code=order_data.billing_zip_code,
            billing_country=order_data.billing_country,
            shipping_address_line1=order_data.shipping_address_line1,
            shipping_address_line2=order_data.shipping_address_line2,
            shipping_city=order_data.shipping_city,
            shipping_state=order_data.shipping_state,
            shipping_zip_code=order_data.shipping_zip_code,
            shipping_country=order_data.shipping_country,
            subtotal=order_data.subtotal,
            tax_amount=order_data.tax_amount,
            shipping_cost=order_data.shipping_cost,
            discount_amount=order_data.discount_amount,
            total_amount=order_data.total_amount,
            payment_method=order_data.payment_method,
            payment_reference=order_data.payment_reference,
            school_id=order_data.school_id,
            team_id=order_data.team_id,
            supporter_id=order_data.supporter_id,
            notes=order_data.notes
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Process order in background
        background_tasks.add_task(process_order_fulfillment, order.id, db)
        
        logger.info(f"Order created: {order.order_number} (ID: {order.id})")
        
        return {
            "message": "Order created successfully",
            "order_id": order.id,
            "order_number": order.order_number,
            "total_amount": float(order.total_amount)
        }
        
    except Exception as e:
        logger.error(f"Order creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order creation failed: {str(e)}"
        )


@router.get("/orders", response_model=List[dict])
async def get_orders(
    skip: int = 0,
    limit: int = 50,
    status: Optional[EcommerceOrderStatus] = None,
    school_id: Optional[int] = None,
    team_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get orders with filtering."""
    query = db.query(EcommerceOrder)
    
    # Apply filters
    if status:
        query = query.filter(EcommerceOrder.status == status)
    if school_id:
        query = query.filter(EcommerceOrder.school_id == school_id)
    if team_id:
        query = query.filter(EcommerceOrder.team_id == team_id)
    
    orders = query.order_by(EcommerceOrder.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
            "customer_email": order.customer_email,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "created_at": order.created_at,
            "school_id": order.school_id,
            "team_id": order.team_id
        }
        for order in orders
    ]


async def process_order_fulfillment(order_id: int, db: Session):
    """Process order fulfillment in background."""
    try:
        order = db.query(EcommerceOrder).filter(EcommerceOrder.id == order_id).first()
        if not order:
            return
        
        # Update inventory
        for item in order.items:
            if item.product.track_inventory:
                # Update product stock
                item.product.stock_quantity -= item.quantity
                
                # Create inventory transaction
                transaction = InventoryTransaction(
                    product_id=item.product_id,
                    variant_id=item.variant_id,
                    transaction_type="sale",
                    quantity_change=-item.quantity,
                    quantity_before=item.product.stock_quantity + item.quantity,
                    quantity_after=item.product.stock_quantity,
                    order_id=order.id,
                    reference_number=order.order_number
                )
                db.add(transaction)
        
        # Update order status
        order.status = EcommerceOrderStatus.CONFIRMED
        db.commit()
        
        logger.info(f"Order fulfillment processed: {order.order_number}")
        
    except Exception as e:
        logger.error(f"Order fulfillment error: {e}")


# Analytics endpoints
@router.get("/analytics/sales")
async def get_sales_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    school_id: Optional[int] = None,
    team_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sales analytics."""
    query = db.query(EcommerceOrder).filter(EcommerceOrder.status.in_([
        EcommerceOrderStatus.CONFIRMED, EcommerceOrderStatus.PROCESSING, 
        EcommerceOrderStatus.SHIPPED, EcommerceOrderStatus.DELIVERED
    ]))
    
    if start_date:
        query = query.filter(EcommerceOrder.created_at >= start_date)
    if end_date:
        query = query.filter(EcommerceOrder.created_at <= end_date)
    if school_id:
        query = query.filter(EcommerceOrder.school_id == school_id)
    if team_id:
        query = query.filter(EcommerceOrder.team_id == team_id)
    
    orders = query.all()
    
    total_revenue = sum(float(order.total_amount) for order in orders)
    total_orders = len(orders)
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": average_order_value,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }
