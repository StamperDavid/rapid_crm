"""
Payment processing API endpoints.
Handles payment processing, refunds, subscriptions, and webhook management.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import json
import uuid
import hmac
import hashlib

from app.core.database import get_db
from app.models.payment import (
    PaymentTransaction, PaymentRefund, PaymentMethod, Subscription, 
    PaymentGateway, PaymentWebhook, PaymentStatus,
    TransactionType
)
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from app.services.payment_service import PaymentService
import structlog

logger = structlog.get_logger()
router = APIRouter()


class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount")
    currency: str = Field(default="USD", max_length=3)
    payment_method: PaymentMethod
    transaction_type: TransactionType
    customer_name: str = Field(..., max_length=200)
    customer_email: str = Field(..., max_length=255)
    customer_phone: Optional[str] = Field(None, max_length=20)
    
    # Related entities
    school_id: Optional[int] = None
    team_id: Optional[int] = None
    player_id: Optional[int] = None
    supporter_id: Optional[int] = None
    order_id: Optional[int] = None
    
    # Payment method details
    card_token: Optional[str] = None  # For tokenized payments
    payment_method_id: Optional[int] = None  # For stored payment methods
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    payment_id: str
    external_payment_id: Optional[str]
    amount: float
    currency: str
    payment_method: str
    payment_status: str
    transaction_type: str
    customer_name: str
    customer_email: str
    gateway_name: str
    gateway_transaction_id: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RefundCreate(BaseModel):
    payment_id: int
    amount: Optional[float] = None  # If None, refund full amount
    reason: Optional[str] = None


class SubscriptionCreate(BaseModel):
    customer_id: str = Field(..., max_length=100)
    customer_name: str = Field(..., max_length=200)
    customer_email: str = Field(..., max_length=255)
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD", max_length=3)
    interval: str = Field(..., description="monthly, weekly, yearly")
    interval_count: int = Field(default=1, ge=1)
    
    # Payment method
    payment_method_id: Optional[int] = None
    card_token: Optional[str] = None
    
    # Related entities
    school_id: Optional[int] = None
    team_id: Optional[int] = None
    player_id: Optional[int] = None
    supporter_id: Optional[int] = None
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = None


@router.post("/process", response_model=PaymentResponse)
async def process_payment(
    payment_data: PaymentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process a payment transaction."""
    try:
        payment_service = PaymentService(db)
        
        # Generate unique payment ID
        payment_id = f"pay_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create payment record
        payment = PaymentTransaction(
            payment_id=payment_id,
            customer_name=payment_data.customer_name,
            customer_email=payment_data.customer_email,
            customer_phone=payment_data.customer_phone,
            amount=payment_data.amount,
            currency=payment_data.currency,
            payment_method=payment_data.payment_method,
            transaction_type=payment_data.transaction_type,
            gateway_name="stripe",  # Default gateway
            school_id=payment_data.school_id,
            team_id=payment_data.team_id,
            player_id=payment_data.player_id,
            supporter_id=payment_data.supporter_id,
            order_id=payment_data.order_id,
            payment_metadata=json.dumps(payment_data.metadata) if payment_data.metadata else None,
            notes=payment_data.notes
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        # Process payment with gateway
        result = await payment_service.process_payment(
            payment=payment,
            card_token=payment_data.card_token,
            payment_method_id=payment_data.payment_method_id
        )
        
        if result["success"]:
            payment.payment_status = PaymentStatus.COMPLETED
            payment.external_payment_id = result["gateway_transaction_id"]
            payment.gateway_transaction_id = result["gateway_transaction_id"]
            payment.gateway_response = json.dumps(result["gateway_response"])
            payment.processed_at = datetime.utcnow()
        else:
            payment.payment_status = PaymentStatus.FAILED
            payment.failed_at = datetime.utcnow()
            payment.failure_reason = result["error_message"]
            payment.gateway_response = json.dumps(result.get("gateway_response", {}))
        
        db.commit()
        
        # Send confirmation email in background
        if result["success"]:
            background_tasks.add_task(
                payment_service.send_payment_confirmation,
                payment
            )
        
        logger.info(
            "Payment processed",
            payment_id=payment.payment_id,
            amount=payment.amount,
            status=payment.payment_status,
            success=result["success"]
        )
        
        return payment
        
    except Exception as e:
        logger.error(f"Payment processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing failed: {str(e)}"
        )


@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    skip: int = 0,
    limit: int = 50,
    status: Optional[PaymentStatus] = None,
    transaction_type: Optional[TransactionType] = None,
    school_id: Optional[int] = None,
    team_id: Optional[int] = None,
    player_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payments with optional filtering."""
    query = db.query(PaymentTransaction)
    
    # Apply filters
    if status:
        query = query.filter(Payment.payment_status == status)
    if transaction_type:
        query = query.filter(Payment.transaction_type == transaction_type)
    if school_id:
        query = query.filter(Payment.school_id == school_id)
    if team_id:
        query = query.filter(Payment.team_id == team_id)
    if player_id:
        query = query.filter(Payment.player_id == player_id)
    
    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific payment by ID."""
    payment = db.query(PaymentTransaction).filter(PaymentTransaction.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment


@router.post("/refund", response_model=dict)
async def create_refund(
    refund_data: RefundCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a refund for a payment."""
    try:
        payment = db.query(PaymentTransaction).filter(PaymentTransaction.id == refund_data.payment_id).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment.payment_status != PaymentStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only refund completed payments"
            )
        
        # Calculate refund amount
        refund_amount = refund_data.amount or float(payment.amount)
        if refund_amount > float(payment.amount - payment.refund_amount):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refund amount exceeds available amount"
            )
        
        payment_service = PaymentService(db)
        
        # Process refund with gateway
        result = await payment_service.process_refund(
            payment=payment,
            amount=refund_amount,
            reason=refund_data.reason
        )
        
        if result["success"]:
            # Update payment record
            payment.refund_amount += refund_amount
            if payment.refund_amount >= payment.amount:
                payment.payment_status = PaymentStatus.REFUNDED
            else:
                payment.payment_status = PaymentStatus.PARTIALLY_REFUNDED
            payment.refunded_at = datetime.utcnow()
            
            # Create refund record
            refund = PaymentRefund(
                payment_id=payment.id,
                refund_id=f"ref_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}",
                external_refund_id=result["gateway_refund_id"],
                amount=refund_amount,
                reason=refund_data.reason,
                status=PaymentStatus.COMPLETED,
                gateway_response=json.dumps(result["gateway_response"]),
                processed_at=datetime.utcnow()
            )
            
            db.add(refund)
            db.commit()
            
            logger.info(
                "Refund processed",
                payment_id=payment.payment_id,
                refund_amount=refund_amount,
                success=True
            )
            
            return {
                "message": "Refund processed successfully",
                "refund_id": refund.refund_id,
                "amount": refund_amount
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Refund failed: {result['error_message']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refund processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refund processing failed: {str(e)}"
        )


@router.post("/subscriptions", response_model=dict)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a recurring subscription."""
    try:
        payment_service = PaymentService(db)
        
        # Generate unique subscription ID
        subscription_id = f"sub_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create subscription record
        subscription = Subscription(
            subscription_id=subscription_id,
            customer_id=subscription_data.customer_id,
            customer_name=subscription_data.customer_name,
            customer_email=subscription_data.customer_email,
            amount=subscription_data.amount,
            currency=subscription_data.currency,
            interval=subscription_data.interval,
            interval_count=subscription_data.interval_count,
            payment_method_id=subscription_data.payment_method_id,
            school_id=subscription_data.school_id,
            team_id=subscription_data.team_id,
            player_id=subscription_data.player_id,
            supporter_id=subscription_data.supporter_id,
            metadata=json.dumps(subscription_data.metadata) if subscription_data.metadata else None
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        # Create subscription with gateway
        result = await payment_service.create_subscription(
            subscription=subscription,
            card_token=subscription_data.card_token
        )
        
        if result["success"]:
            subscription.external_subscription_id = result["gateway_subscription_id"]
            subscription.status = "active"
            subscription.current_period_start = result.get("current_period_start")
            subscription.current_period_end = result.get("current_period_end")
            db.commit()
            
            logger.info(
                "Subscription created",
                subscription_id=subscription.subscription_id,
                amount=subscription.amount,
                interval=subscription.interval
            )
            
            return {
                "message": "Subscription created successfully",
                "subscription_id": subscription.subscription_id,
                "status": subscription.status
            }
        else:
            db.delete(subscription)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Subscription creation failed: {result['error_message']}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Subscription creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Subscription creation failed: {str(e)}"
        )


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Verify webhook signature
        webhook_secret = "whsec_your_webhook_secret"  # Should be from environment
        expected_sig = hmac.new(
            webhook_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(sig_header, expected_sig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        event_data = json.loads(payload)
        
        # Log webhook
        webhook = PaymentWebhook(
            gateway_name="stripe",
            event_type=event_data.get("type"),
            external_event_id=event_data.get("id"),
            raw_payload=payload.decode(),
            payment_id=None  # Will be updated if payment is found
        )
        
        db.add(webhook)
        db.commit()
        
        # Process webhook in background
        background_tasks.add_task(
            process_stripe_webhook,
            event_data,
            webhook.id,
            db
        )
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )


async def process_stripe_webhook(event_data: dict, webhook_id: int, db: Session):
    """Process Stripe webhook event in background."""
    try:
        event_type = event_data.get("type")
        data = event_data.get("data", {}).get("object", {})
        
        if event_type == "payment_intent.succeeded":
            # Update payment status
            external_payment_id = data.get("id")
            payment = db.query(PaymentTransaction).filter(
                PaymentTransaction.external_payment_id == external_payment_id
            ).first()
            
            if payment:
                payment.payment_status = PaymentStatus.COMPLETED
                payment.processed_at = datetime.utcnow()
                payment.gateway_response = json.dumps(data)
                
                # Update webhook record
                webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
                if webhook:
                    webhook.payment_id = payment.id
                    webhook.processed = True
                
                db.commit()
                
        elif event_type == "payment_intent.payment_failed":
            # Update payment status
            external_payment_id = data.get("id")
            payment = db.query(PaymentTransaction).filter(
                PaymentTransaction.external_payment_id == external_payment_id
            ).first()
            
            if payment:
                payment.payment_status = PaymentStatus.FAILED
                payment.failed_at = datetime.utcnow()
                payment.failure_reason = data.get("last_payment_error", {}).get("message")
                payment.gateway_response = json.dumps(data)
                
                # Update webhook record
                webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
                if webhook:
                    webhook.payment_id = payment.id
                    webhook.processed = True
                
                db.commit()
        
        logger.info(f"Webhook processed: {event_type}")
        
    except Exception as e:
        logger.error(f"Webhook background processing error: {e}")
        # Update webhook record with error
        webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
        if webhook:
            webhook.processing_error = str(e)
            db.commit()


@router.get("/gateways", response_model=List[dict])
async def get_payment_gateways(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available payment gateways."""
    gateways = db.query(PaymentGateway).filter(PaymentGateway.is_active == True).all()
    
    return [
        {
            "id": gateway.id,
            "name": gateway.name,
            "display_name": gateway.display_name,
            "gateway_type": gateway.gateway_type,
            "is_test_mode": gateway.is_test_mode,
            "supported_currencies": json.loads(gateway.supported_currencies) if gateway.supported_currencies else [],
            "supported_methods": json.loads(gateway.supported_methods) if gateway.supported_methods else [],
            "processing_fee_percentage": float(gateway.processing_fee_percentage),
            "processing_fee_fixed": float(gateway.processing_fee_fixed)
        }
        for gateway in gateways
    ]


@router.get("/stats/summary", response_model=dict)
async def get_payment_stats(
    days: int = 30,
    school_id: Optional[int] = None,
    team_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment statistics summary."""
    from sqlalchemy import func
    
    # Base query
    query = db.query(PaymentTransaction).filter(Payment.created_at >= datetime.utcnow() - timedelta(days=days))
    
    # Apply filters
    if school_id:
        query = query.filter(Payment.school_id == school_id)
    if team_id:
        query = query.filter(Payment.team_id == team_id)
    
    # Calculate statistics
    total_amount = query.filter(Payment.payment_status == PaymentStatus.COMPLETED).with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0
    
    total_count = query.filter(Payment.payment_status == PaymentStatus.COMPLETED).count()
    
    failed_count = query.filter(Payment.payment_status == PaymentStatus.FAILED).count()
    
    refunded_amount = query.filter(Payment.payment_status.in_([
        PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED
    ])).with_entities(func.sum(Payment.refund_amount)).scalar() or 0
    
    # Transaction type breakdown
    type_breakdown = db.query(
        Payment.transaction_type,
        func.sum(Payment.amount),
        func.count(Payment.id)
    ).filter(
        Payment.created_at >= datetime.utcnow() - timedelta(days=days),
        Payment.payment_status == PaymentStatus.COMPLETED
    ).group_by(Payment.transaction_type).all()
    
    return {
        "period_days": days,
        "total_amount": float(total_amount),
        "total_count": total_count,
        "failed_count": failed_count,
        "refunded_amount": float(refunded_amount),
        "net_amount": float(total_amount - refunded_amount),
        "transaction_types": [
            {
                "type": item[0],
                "amount": float(item[1]),
                "count": item[2]
            }
            for item in type_breakdown
        ]
    }
