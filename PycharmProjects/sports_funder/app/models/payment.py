"""
Payment-related models for processing transactions, subscriptions, and donations.
"""
from sqlalchemy import Column, String, Integer, Numeric, Boolean, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration."""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    SQUARE = "square"
    VENMO = "venmo"
    CASH = "cash"
    CHECK = "check"


class TransactionType(str, enum.Enum):
    """Transaction type enumeration."""
    DONATION = "donation"
    PURCHASE = "purchase"
    SUBSCRIPTION = "subscription"
    REFUND = "refund"
    FEE = "fee"
    COMMISSION = "commission"


class PaymentTransaction(BaseModel):
    """Payment transaction model."""
    
    __tablename__ = "payment_transactions"
    
    # Payment identification
    payment_id = Column(String(100), unique=True, nullable=False, index=True)
    external_payment_id = Column(String(100), nullable=True, index=True)  # From payment gateway
    
    # Customer information
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_phone = Column(String(20), nullable=True)
    
    # Payment details
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    
    # Gateway information
    gateway_name = Column(String(50), nullable=False)  # stripe, paypal, square, etc.
    gateway_transaction_id = Column(String(100), nullable=True)
    gateway_response = Column(Text, nullable=True)  # JSON response from gateway
    
    # Related entities
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=True)
    
    # Payment processing
    processed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    # Refund information
    refund_amount = Column(Numeric(12, 2), default=0, nullable=False)
    refund_reason = Column(Text, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    
    # Metadata
    payment_metadata = Column(Text, nullable=True)  # JSON metadata
    notes = Column(Text, nullable=True)
    
    # Relationships
    school = relationship("School", back_populates="payment_transactions")
    team = relationship("Team", back_populates="payment_transactions")
    player = relationship("Player", back_populates="payment_transactions")
    supporter = relationship("Supporter", back_populates="payment_transactions")
    order = relationship("Order", back_populates="payment_transactions")
    promotional_company = relationship("PromotionalCompany", back_populates="payment_transactions")
    refunds = relationship("PaymentRefund", back_populates="payment_transaction", cascade="all, delete-orphan")


class PaymentRefund(BaseModel):
    """Payment refund model."""
    
    __tablename__ = "payment_refunds"
    
    payment_id = Column(Integer, ForeignKey("payment_transactions.id"), nullable=False)
    refund_id = Column(String(100), unique=True, nullable=False, index=True)
    external_refund_id = Column(String(100), nullable=True)  # From payment gateway
    
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    gateway_response = Column(Text, nullable=True)  # JSON response from gateway
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    payment_transaction = relationship("PaymentTransaction", back_populates="refunds")


class PaymentMethod(BaseModel):
    """Stored payment methods for recurring payments."""
    
    __tablename__ = "payment_methods"
    
    # Customer information
    customer_id = Column(String(100), nullable=False, index=True)
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    
    # Payment method details
    method_type = Column(Enum(PaymentMethod), nullable=False)
    gateway_name = Column(String(50), nullable=False)
    gateway_payment_method_id = Column(String(100), nullable=False)
    
    # Card information (encrypted)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)  # visa, mastercard, etc.
    card_exp_month = Column(Integer, nullable=True)
    card_exp_year = Column(Integer, nullable=True)
    
    # Bank information (encrypted)
    bank_last_four = Column(String(4), nullable=True)
    bank_name = Column(String(100), nullable=True)
    account_type = Column(String(20), nullable=True)  # checking, savings
    
    # Status
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Related entities
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    
    # Relationships
    school = relationship("School")
    team = relationship("Team")
    player = relationship("Player")
    supporter = relationship("Supporter")


class Subscription(BaseModel):
    """Recurring subscription model."""
    
    __tablename__ = "subscriptions"
    
    # Subscription identification
    subscription_id = Column(String(100), unique=True, nullable=False, index=True)
    external_subscription_id = Column(String(100), nullable=True)  # From payment gateway
    
    # Customer information
    customer_id = Column(String(100), nullable=False, index=True)
    customer_name = Column(String(200), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    
    # Subscription details
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    interval = Column(String(20), nullable=False)  # monthly, weekly, yearly
    interval_count = Column(Integer, default=1, nullable=False)
    
    # Status
    status = Column(String(20), default="active", nullable=False)  # active, cancelled, paused, expired
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Payment method
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    
    # Related entities
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    
    # Metadata
    payment_metadata = Column(Text, nullable=True)  # JSON metadata
    
    # Relationships
    payment_method = relationship("PaymentMethod")
    school = relationship("School")
    team = relationship("Team")
    player = relationship("Player")
    supporter = relationship("Supporter")


class PaymentGateway(BaseModel):
    """Payment gateway configuration model."""
    
    __tablename__ = "payment_gateways"
    
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    gateway_type = Column(String(50), nullable=False)  # stripe, paypal, square, etc.
    
    # Configuration
    is_active = Column(Boolean, default=True, nullable=False)
    is_test_mode = Column(Boolean, default=True, nullable=False)
    
    # API credentials (encrypted)
    api_key = Column(Text, nullable=True)
    api_secret = Column(Text, nullable=True)
    webhook_secret = Column(Text, nullable=True)
    
    # Configuration
    supported_currencies = Column(Text, nullable=True)  # JSON array
    supported_methods = Column(Text, nullable=True)  # JSON array
    processing_fee_percentage = Column(Numeric(5, 4), default=0.029, nullable=False)  # 2.9%
    processing_fee_fixed = Column(Numeric(8, 2), default=0.30, nullable=False)  # $0.30
    
    # Webhook configuration
    webhook_url = Column(String(500), nullable=True)
    webhook_events = Column(Text, nullable=True)  # JSON array of events to listen for
    
    # Metadata
    configuration = Column(Text, nullable=True)  # JSON configuration
    notes = Column(Text, nullable=True)


class PaymentWebhook(BaseModel):
    """Payment webhook log model."""
    
    __tablename__ = "payment_webhooks"
    
    gateway_name = Column(String(50), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    external_event_id = Column(String(100), nullable=True, index=True)
    
    # Webhook data
    raw_payload = Column(Text, nullable=False)  # Raw webhook payload
    processed = Column(Boolean, default=False, nullable=False)
    processing_error = Column(Text, nullable=True)
    
    # Related payment
    payment_id = Column(Integer, ForeignKey("payment_transactions.id"), nullable=True)
    
    # Relationships
    payment_transaction = relationship("PaymentTransaction")
