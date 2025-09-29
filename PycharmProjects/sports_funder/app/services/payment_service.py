"""
Payment processing service.
Handles integration with payment gateways like Stripe, PayPal, Square, etc.
"""

import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import stripe
import requests
from sqlalchemy.orm import Session

from app.models.payment import PaymentTransaction, PaymentRefund, Subscription, PaymentMethod
from app.services.email_service import EmailService
import structlog

logger = structlog.get_logger()


class PaymentService:
    """Service for processing payments through various gateways."""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
        
        # Initialize Stripe (should be from environment variables)
        stripe.api_key = "sk_test_your_stripe_secret_key"  # Should be from config
        
        # Gateway configurations
        self.gateways = {
            "stripe": {
                "name": "Stripe",
                "supported_methods": ["credit_card", "debit_card"],
                "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
                "processing_fee_percentage": 0.029,  # 2.9%
                "processing_fee_fixed": 0.30  # $0.30
            },
            "paypal": {
                "name": "PayPal",
                "supported_methods": ["paypal"],
                "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
                "processing_fee_percentage": 0.034,  # 3.4%
                "processing_fee_fixed": 0.00
            },
            "square": {
                "name": "Square",
                "supported_methods": ["credit_card", "debit_card"],
                "supported_currencies": ["USD", "CAD", "GBP", "AUD"],
                "processing_fee_percentage": 0.029,  # 2.9%
                "processing_fee_fixed": 0.30  # $0.30
            }
        }
    
    async def process_payment(
        self, 
        payment: PaymentTransaction, 
        card_token: Optional[str] = None,
        payment_method_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process a payment through the appropriate gateway."""
        try:
            gateway_name = payment.gateway_name.lower()
            
            if gateway_name == "stripe":
                return await self._process_stripe_payment(payment, card_token, payment_method_id)
            elif gateway_name == "paypal":
                return await self._process_paypal_payment(payment, card_token, payment_method_id)
            elif gateway_name == "square":
                return await self._process_square_payment(payment, card_token, payment_method_id)
            else:
                return {
                    "success": False,
                    "error_message": f"Unsupported payment gateway: {gateway_name}"
                }
                
        except Exception as e:
            logger.error(f"Payment processing error: {e}")
            return {
                "success": False,
                "error_message": str(e)
            }
    
    async def _process_stripe_payment(
        self, 
        payment: PaymentTransaction, 
        card_token: Optional[str] = None,
        payment_method_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process payment through Stripe."""
        try:
            # Create payment intent
            intent_data = {
                "amount": int(payment.amount * 100),  # Convert to cents
                "currency": payment.currency.lower(),
                "metadata": {
                    "payment_id": payment.payment_id,
                    "customer_name": payment.customer_name,
                    "customer_email": payment.customer_email
                }
            }
            
            # Add payment method
            if card_token:
                intent_data["payment_method"] = card_token
                intent_data["confirmation_method"] = "manual"
                intent_data["confirm"] = True
            elif payment_method_id:
                stored_method = self.db.query(PaymentMethod).filter(
                    PaymentMethod.id == payment_method_id
                ).first()
                if stored_method:
                    intent_data["payment_method"] = stored_method.gateway_payment_method_id
                    intent_data["confirmation_method"] = "manual"
                    intent_data["confirm"] = True
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(**intent_data)
            
            if intent.status == "succeeded":
                return {
                    "success": True,
                    "gateway_transaction_id": intent.id,
                    "gateway_response": intent.to_dict()
                }
            elif intent.status == "requires_action":
                return {
                    "success": False,
                    "error_message": "Payment requires additional authentication",
                    "gateway_response": intent.to_dict(),
                    "requires_action": True,
                    "client_secret": intent.client_secret
                }
            else:
                return {
                    "success": False,
                    "error_message": f"Payment failed: {intent.status}",
                    "gateway_response": intent.to_dict()
                }
                
        except stripe.error.CardError as e:
            return {
                "success": False,
                "error_message": f"Card error: {e.user_message}",
                "gateway_response": e.json_body
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error_message": f"Stripe error: {str(e)}",
                "gateway_response": e.json_body if hasattr(e, 'json_body') else {}
            }
    
    async def _process_paypal_payment(
        self, 
        payment: PaymentTransaction, 
        card_token: Optional[str] = None,
        payment_method_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process payment through PayPal."""
        try:
            # PayPal API integration would go here
            # This is a simplified example
            
            paypal_data = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "total": str(payment.amount),
                        "currency": payment.currency
                    },
                    "description": f"Payment for {payment.customer_name}",
                    "custom": payment.payment_id
                }],
                "redirect_urls": {
                    "return_url": "https://yoursite.com/payment/success",
                    "cancel_url": "https://yoursite.com/payment/cancel"
                }
            }
            
            # In a real implementation, you would make API calls to PayPal
            # For now, we'll simulate a successful payment
            return {
                "success": True,
                "gateway_transaction_id": f"paypal_{payment.payment_id}",
                "gateway_response": paypal_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_message": f"PayPal error: {str(e)}"
            }
    
    async def _process_square_payment(
        self, 
        payment: PaymentTransaction, 
        card_token: Optional[str] = None,
        payment_method_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Process payment through Square."""
        try:
            # Square API integration would go here
            # This is a simplified example
            
            square_data = {
                "source_id": card_token or "cnon:card-nonce-ok",
                "amount_money": {
                    "amount": int(payment.amount * 100),  # Convert to cents
                    "currency": payment.currency
                },
                "idempotency_key": payment.payment_id,
                "reference_id": payment.payment_id
            }
            
            # In a real implementation, you would make API calls to Square
            # For now, we'll simulate a successful payment
            return {
                "success": True,
                "gateway_transaction_id": f"square_{payment.payment_id}",
                "gateway_response": square_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_message": f"Square error: {str(e)}"
            }
    
    async def process_refund(
        self, 
        payment: PaymentTransaction, 
        amount: float, 
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a refund through the appropriate gateway."""
        try:
            gateway_name = payment.gateway_name.lower()
            
            if gateway_name == "stripe":
                return await self._process_stripe_refund(payment, amount, reason)
            elif gateway_name == "paypal":
                return await self._process_paypal_refund(payment, amount, reason)
            elif gateway_name == "square":
                return await self._process_square_refund(payment, amount, reason)
            else:
                return {
                    "success": False,
                    "error_message": f"Unsupported payment gateway: {gateway_name}"
                }
                
        except Exception as e:
            logger.error(f"Refund processing error: {e}")
            return {
                "success": False,
                "error_message": str(e)
            }
    
    async def _process_stripe_refund(
        self, 
        payment: PaymentTransaction, 
        amount: float, 
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process refund through Stripe."""
        try:
            refund_data = {
                "payment_intent": payment.external_payment_id,
                "amount": int(amount * 100),  # Convert to cents
            }
            
            if reason:
                refund_data["reason"] = "requested_by_customer"
                refund_data["metadata"] = {"reason": reason}
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                "success": True,
                "gateway_refund_id": refund.id,
                "gateway_response": refund.to_dict()
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error_message": f"Stripe refund error: {str(e)}",
                "gateway_response": e.json_body if hasattr(e, 'json_body') else {}
            }
    
    async def _process_paypal_refund(
        self, 
        payment: PaymentTransaction, 
        amount: float, 
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process refund through PayPal."""
        try:
            # PayPal refund API integration would go here
            # This is a simplified example
            
            refund_id = f"paypal_refund_{payment.payment_id}_{int(datetime.utcnow().timestamp())}"
            
            return {
                "success": True,
                "gateway_refund_id": refund_id,
                "gateway_response": {
                    "refund_id": refund_id,
                    "amount": amount,
                    "reason": reason
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_message": f"PayPal refund error: {str(e)}"
            }
    
    async def _process_square_refund(
        self, 
        payment: PaymentTransaction, 
        amount: float, 
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process refund through Square."""
        try:
            # Square refund API integration would go here
            # This is a simplified example
            
            refund_id = f"square_refund_{payment.payment_id}_{int(datetime.utcnow().timestamp())}"
            
            return {
                "success": True,
                "gateway_refund_id": refund_id,
                "gateway_response": {
                    "refund_id": refund_id,
                    "amount": amount,
                    "reason": reason
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error_message": f"Square refund error: {str(e)}"
            }
    
    async def create_subscription(
        self, 
        subscription: Subscription, 
        card_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a recurring subscription."""
        try:
            gateway_name = "stripe"  # Default to Stripe for subscriptions
            
            if gateway_name == "stripe":
                return await self._create_stripe_subscription(subscription, card_token)
            else:
                return {
                    "success": False,
                    "error_message": f"Unsupported subscription gateway: {gateway_name}"
                }
                
        except Exception as e:
            logger.error(f"Subscription creation error: {e}")
            return {
                "success": False,
                "error_message": str(e)
            }
    
    async def _create_stripe_subscription(
        self, 
        subscription: Subscription, 
        card_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create subscription through Stripe."""
        try:
            # Create customer
            customer = stripe.Customer.create(
                email=subscription.customer_email,
                name=subscription.customer_name,
                metadata={
                    "subscription_id": subscription.subscription_id,
                    "customer_id": subscription.customer_id
                }
            )
            
            # Create payment method if card token provided
            if card_token:
                payment_method = stripe.PaymentMethod.attach(
                    card_token,
                    customer=customer.id
                )
                stripe.Customer.modify(
                    customer.id,
                    invoice_settings={
                        "default_payment_method": payment_method.id
                    }
                )
            
            # Create price
            price = stripe.Price.create(
                unit_amount=int(subscription.amount * 100),
                currency=subscription.currency.lower(),
                recurring={
                    "interval": subscription.interval,
                    "interval_count": subscription.interval_count
                },
                product_data={
                    "name": f"Subscription for {subscription.customer_name}"
                }
            )
            
            # Create subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": price.id}],
                metadata={
                    "subscription_id": subscription.subscription_id
                }
            )
            
            return {
                "success": True,
                "gateway_subscription_id": stripe_subscription.id,
                "gateway_response": stripe_subscription.to_dict(),
                "current_period_start": datetime.fromtimestamp(stripe_subscription.current_period_start),
                "current_period_end": datetime.fromtimestamp(stripe_subscription.current_period_end)
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error_message": f"Stripe subscription error: {str(e)}",
                "gateway_response": e.json_body if hasattr(e, 'json_body') else {}
            }
    
    async def send_payment_confirmation(self, payment: PaymentTransaction):
        """Send payment confirmation email."""
        try:
            # Prepare email data
            email_data = {
                "to": payment.customer_email,
                "subject": f"Payment Confirmation - {payment.payment_id}",
                "template": "payment_confirmation",
                "data": {
                    "payment_id": payment.payment_id,
                    "amount": float(payment.amount),
                    "currency": payment.currency,
                    "customer_name": payment.customer_name,
                    "payment_method": payment.payment_method.value,
                    "transaction_type": payment.transaction_type.value,
                    "processed_at": payment.processed_at.isoformat() if payment.processed_at else None
                }
            }
            
            # Send email
            await self.email_service.send_email(email_data)
            
            logger.info(f"Payment confirmation email sent to {payment.customer_email}")
            
        except Exception as e:
            logger.error(f"Failed to send payment confirmation email: {e}")
    
    def calculate_processing_fee(self, amount: float, gateway_name: str) -> Dict[str, float]:
        """Calculate processing fees for a payment."""
        gateway = self.gateways.get(gateway_name.lower())
        if not gateway:
            return {"fee_amount": 0, "net_amount": amount}
        
        fee_percentage = gateway["processing_fee_percentage"]
        fee_fixed = gateway["processing_fee_fixed"]
        
        fee_amount = (amount * fee_percentage) + fee_fixed
        net_amount = amount - fee_amount
        
        return {
            "fee_amount": round(fee_amount, 2),
            "net_amount": round(net_amount, 2),
            "fee_percentage": fee_percentage,
            "fee_fixed": fee_fixed
        }
    
    def get_supported_gateways(self) -> Dict[str, Any]:
        """Get list of supported payment gateways."""
        return self.gateways
