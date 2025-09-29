"""
Agreement and contract management models.
Handles agreements between schools, promotional companies, and the platform.
"""

from sqlalchemy import Column, String, Integer, Numeric, Boolean, ForeignKey, Text, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from app.models.base import BaseModel


class AgreementStatus(str, enum.Enum):
    """Agreement status enumeration."""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"
    EXPIRED = "expired"


class AgreementType(str, enum.Enum):
    """Agreement type enumeration."""
    SCHOOL_PROMOTIONAL = "school_promotional"  # School <-> Promotional Company
    PLATFORM_SCHOOL = "platform_school"       # Platform <-> School
    PLATFORM_PROMOTIONAL = "platform_promotional"  # Platform <-> Promotional Company
    REVENUE_SHARING = "revenue_sharing"       # Revenue sharing agreement
    SERVICE_LEVEL = "service_level"           # Service level agreement


class PaymentTerms(str, enum.Enum):
    """Payment terms enumeration."""
    NET_30 = "net_30"          # Payment due in 30 days
    NET_15 = "net_15"          # Payment due in 15 days
    UPFRONT = "upfront"        # Payment required upfront
    INSTALLMENTS = "installments"  # Payment in installments
    COMMISSION_BASED = "commission_based"  # Commission-based payment


class Agreement(BaseModel):
    """Main agreement/contract model."""
    
    __tablename__ = "agreements"
    
    # Agreement identification
    agreement_id = Column(String(100), unique=True, nullable=False, index=True)
    agreement_type = Column(Enum(AgreementType), nullable=False)
    status = Column(Enum(AgreementStatus), default=AgreementStatus.DRAFT, nullable=False)
    
    # Parties involved
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=True)
    platform_entity_id = Column(Integer, nullable=True)  # For platform agreements
    
    # Agreement details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    effective_date = Column(DateTime, nullable=False)
    expiration_date = Column(DateTime, nullable=True)
    auto_renewal = Column(Boolean, default=False, nullable=False)
    
    # Financial terms
    base_fee = Column(Numeric(12, 2), nullable=True)
    commission_rate = Column(Numeric(5, 4), nullable=True)  # e.g., 0.15 for 15%
    revenue_share_rate = Column(Numeric(5, 4), nullable=True)  # e.g., 0.10 for 10%
    payment_terms = Column(Enum(PaymentTerms), nullable=True)
    
    # Terms and conditions
    terms_conditions = Column(Text, nullable=True)
    special_conditions = Column(Text, nullable=True)
    termination_clause = Column(Text, nullable=True)
    
    # Approval workflow
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by_school = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by_promotional = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by_platform = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    approved_at_school = Column(DateTime, nullable=True)
    approved_at_promotional = Column(DateTime, nullable=True)
    approved_at_platform = Column(DateTime, nullable=True)
    
    # Metadata
    agreement_metadata = Column(JSON, nullable=True)
    attachments = Column(JSON, nullable=True)  # File attachments
    
    # Relationships
    school = relationship("School", back_populates="agreements")
    promotional_company = relationship("PromotionalCompany", back_populates="agreements")
    creator = relationship("User", foreign_keys=[created_by])
    school_approver = relationship("User", foreign_keys=[approved_by_school])
    promotional_approver = relationship("User", foreign_keys=[approved_by_promotional])
    platform_approver = relationship("User", foreign_keys=[approved_by_platform])
    
    # Related entities
    order_agreements = relationship("OrderAgreement", back_populates="agreement", cascade="all, delete-orphan")
    revenue_shares = relationship("RevenueShare", back_populates="agreement", cascade="all, delete-orphan")
    compliance_records = relationship("ComplianceRecord", back_populates="agreement", cascade="all, delete-orphan")


class OrderAgreement(BaseModel):
    """Links orders to specific agreements."""
    
    __tablename__ = "order_agreements"
    
    agreement_id = Column(Integer, ForeignKey("agreements.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Agreement-specific terms for this order
    agreed_price = Column(Numeric(12, 2), nullable=False)
    commission_amount = Column(Numeric(12, 2), nullable=True)
    revenue_share_amount = Column(Numeric(12, 2), nullable=True)
    
    # Fulfillment tracking
    fulfillment_status = Column(String(50), default="pending", nullable=False)
    fulfillment_date = Column(DateTime, nullable=True)
    quality_rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Relationships
    agreement = relationship("Agreement", back_populates="order_agreements")
    order = relationship("Order")


class RevenueShare(BaseModel):
    """Revenue sharing tracking and payments."""
    
    __tablename__ = "revenue_shares"
    
    agreement_id = Column(Integer, ForeignKey("agreements.id"), nullable=False)
    
    # Revenue details
    total_revenue = Column(Numeric(12, 2), nullable=False)
    platform_share = Column(Numeric(12, 2), nullable=False)
    school_share = Column(Numeric(12, 2), nullable=False)
    promotional_share = Column(Numeric(12, 2), nullable=False)
    
    # Payment tracking
    platform_paid = Column(Boolean, default=False, nullable=False)
    school_paid = Column(Boolean, default=False, nullable=False)
    promotional_paid = Column(Boolean, default=False, nullable=False)
    
    platform_paid_at = Column(DateTime, nullable=True)
    school_paid_at = Column(DateTime, nullable=True)
    promotional_paid_at = Column(DateTime, nullable=True)
    
    # Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Relationships
    agreement = relationship("Agreement", back_populates="revenue_shares")


class ComplianceRecord(BaseModel):
    """Compliance and audit trail records."""
    
    __tablename__ = "compliance_records"
    
    agreement_id = Column(Integer, ForeignKey("agreements.id"), nullable=False)
    
    # Compliance details
    compliance_type = Column(String(100), nullable=False)  # quality_check, financial_audit, etc.
    status = Column(String(50), default="pending", nullable=False)
    score = Column(Integer, nullable=True)  # 1-100 compliance score
    
    # Audit information
    audited_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    audit_date = Column(DateTime, nullable=True)
    audit_notes = Column(Text, nullable=True)
    
    # Evidence
    evidence_files = Column(JSON, nullable=True)
    corrective_actions = Column(Text, nullable=True)
    
    # Relationships
    agreement = relationship("Agreement", back_populates="compliance_records")
    auditor = relationship("User")


class TransparencyReport(BaseModel):
    """Transparency reports for different user types."""
    
    __tablename__ = "transparency_reports"
    
    # Report identification
    report_id = Column(String(100), unique=True, nullable=False, index=True)
    report_type = Column(String(50), nullable=False)  # school, promotional, platform, public
    
    # Target entity
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=True)
    
    # Report period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Report data
    total_orders = Column(Integer, default=0, nullable=False)
    total_revenue = Column(Numeric(12, 2), default=0, nullable=False)
    total_profits = Column(Numeric(12, 2), default=0, nullable=False)
    average_order_value = Column(Numeric(12, 2), default=0, nullable=False)
    customer_satisfaction = Column(Numeric(3, 2), nullable=True)  # 0.00-5.00
    
    # Breakdown by category
    revenue_breakdown = Column(JSON, nullable=True)  # By product type, team, etc.
    profit_breakdown = Column(JSON, nullable=True)
    
    # Quality metrics
    fulfillment_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    on_time_delivery = Column(Numeric(5, 2), nullable=True)  # Percentage
    return_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    
    # Generated metadata
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    school = relationship("School")
    promotional_company = relationship("PromotionalCompany")
    generator = relationship("User")


class AgreementTemplate(BaseModel):
    """Templates for common agreement types."""
    
    __tablename__ = "agreement_templates"
    
    name = Column(String(200), nullable=False)
    agreement_type = Column(Enum(AgreementType), nullable=False)
    description = Column(Text, nullable=True)
    
    # Template content
    title_template = Column(String(200), nullable=False)
    terms_template = Column(Text, nullable=False)
    conditions_template = Column(Text, nullable=True)
    
    # Default values
    default_commission_rate = Column(Numeric(5, 4), nullable=True)
    default_revenue_share_rate = Column(Numeric(5, 4), nullable=True)
    default_payment_terms = Column(Enum(PaymentTerms), nullable=True)
    default_duration_days = Column(Integer, nullable=True)
    
    # Template metadata
    is_active = Column(Boolean, default=True, nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    
    # Usage tracking
    usage_count = Column(Integer, default=0, nullable=False)
    last_used = Column(DateTime, nullable=True)


class AgreementAmendment(BaseModel):
    """Amendments to existing agreements."""
    
    __tablename__ = "agreement_amendments"
    
    agreement_id = Column(Integer, ForeignKey("agreements.id"), nullable=False)
    amendment_number = Column(Integer, nullable=False)
    
    # Amendment details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    effective_date = Column(DateTime, nullable=False)
    
    # Changes made
    changes_summary = Column(Text, nullable=False)
    old_terms = Column(JSON, nullable=True)  # Snapshot of old terms
    new_terms = Column(JSON, nullable=True)  # New terms
    
    # Approval
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    agreement = relationship("Agreement")
    approver = relationship("User")
