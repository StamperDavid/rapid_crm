"""
Order Management API Endpoints
Handles order processing, status updates, and promotional company integration
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.order_management import Order, OrderStatus, OrderStatusUpdate, PromotionalCompanyOrder
from app.models.commerce import PromotionalCompany
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderStatusUpdate as OrderStatusUpdateSchema,
    PromotionalCompanyOrderResponse
)
from app.services.promotional_company_service import PromotionalCompanyService
from app.services.communication_service import CommunicationService

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new order and forward to promotional company"""
    try:
        # Create order
        order = Order(
            order_number=f"ORD_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{order_data.school_id}",
            customer_name=order_data.customer_name,
            customer_email=order_data.customer_email,
            customer_phone=order_data.customer_phone,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            school_id=order_data.school_id,
            team_id=order_data.team_id,
            subtotal=order_data.subtotal,
            tax_amount=order_data.tax_amount,
            shipping_cost=order_data.shipping_cost,
            total_amount=order_data.total_amount,
            payment_method=order_data.payment_method,
            payment_reference=order_data.payment_reference,
            notes=order_data.notes
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Add order items
        for item_data in order_data.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data.product_id,
                product_name=item_data.product_name,
                product_sku=item_data.product_sku,
                product_description=item_data.product_description,
                product_image_url=item_data.product_image_url,
                unit_price=item_data.unit_price,
                quantity=item_data.quantity,
                total_price=item_data.total_price,
                size=item_data.size,
                color=item_data.color,
                customization_options=item_data.customization_options
            )
            db.add(order_item)
        
        db.commit()
        
        # Forward to promotional company in background
        background_tasks.add_task(forward_order_to_company, order.id)
        
        return order
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/school/{school_id}", response_model=List[OrderResponse])
async def get_school_orders(
    school_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get orders for a specific school"""
    query = db.query(Order).filter(Order.school_id == school_id)
    
    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    orders = query.offset(skip).limit(limit).all()
    return orders


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdateSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Update order status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        previous_status = order.status
        new_status = OrderStatus(status_update.status)
        
        # Update order
        order.status = new_status
        if status_update.tracking_number:
            order.company_tracking_number = status_update.tracking_number
        
        # Create status update record
        status_update_record = OrderStatusUpdate(
            order_id=order_id,
            previous_status=previous_status,
            new_status=new_status,
            status_message=status_update.status_message,
            tracking_number=status_update.tracking_number,
            carrier=status_update.carrier
        )
        
        db.add(status_update_record)
        db.commit()
        
        # Send notification to customer in background
        background_tasks.add_task(
            send_order_status_notification,
            order_id,
            new_status,
            status_update.tracking_number,
            status_update.carrier
        )
        
        return order
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")


@router.post("/{order_id}/forward-to-company")
async def forward_order_to_company_endpoint(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Manually forward order to promotional company"""
    background_tasks.add_task(forward_order_to_company, order_id)
    return {"message": "Order forwarding initiated"}


@router.post("/{order_id}/sync-status")
async def sync_order_status_endpoint(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Sync order status from promotional company"""
    service = PromotionalCompanyService(db)
    result = await service.sync_order_status(order_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


@router.get("/{order_id}/company-order", response_model=PromotionalCompanyOrderResponse)
async def get_company_order(order_id: int, db: Session = Depends(get_db)):
    """Get promotional company order details"""
    company_order = db.query(PromotionalCompanyOrder).filter(
        PromotionalCompanyOrder.order_id == order_id
    ).first()
    
    if not company_order:
        raise HTTPException(status_code=404, detail="Company order not found")
    
    return company_order


@router.get("/{order_id}/status-history")
async def get_order_status_history(order_id: int, db: Session = Depends(get_db)):
    """Get order status update history"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    status_updates = db.query(OrderStatusUpdate).filter(
        OrderStatusUpdate.order_id == order_id
    ).order_by(OrderStatusUpdate.created_at.desc()).all()
    
    return {
        "order_id": order_id,
        "current_status": order.status.value,
        "status_history": [
            {
                "status": update.new_status.value,
                "previous_status": update.previous_status.value if update.previous_status else None,
                "message": update.status_message,
                "tracking_number": update.tracking_number,
                "carrier": update.carrier,
                "created_at": update.created_at
            }
            for update in status_updates
        ]
    }


@router.post("/bulk-sync")
async def bulk_sync_orders(
    school_id: Optional[int] = None,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Bulk sync order statuses from promotional companies"""
    service = PromotionalCompanyService(db)
    result = await service.bulk_sync_orders(school_id, company_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


# Background task functions
async def forward_order_to_company(order_id: int):
    """Background task to forward order to promotional company"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        service = PromotionalCompanyService(db)
        result = await service.forward_order_to_company(order_id)
        
        if not result.get("success"):
            logger.error(f"Failed to forward order {order_id}: {result.get('error')}")
        
    except Exception as e:
        logger.error(f"Error in background task for order {order_id}: {str(e)}")
    finally:
        db.close()


async def send_order_status_notification(
    order_id: int,
    new_status: OrderStatus,
    tracking_number: str = None,
    carrier: str = None
):
    """Background task to send order status notification"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        service = CommunicationService(db)
        await service.send_order_status_update(order_id, new_status, tracking_number, carrier)
    except Exception as e:
        logger.error(f"Error sending status notification for order {order_id}: {str(e)}")
    finally:
        db.close()


# Import required models and schemas
from app.models.order_management import OrderItem
import logging

logger = logging.getLogger(__name__)