"""
Regional Partner Management System for nationwide scaling.
"""
from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Integer, DateTime, Numeric, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import BaseModel


class PartnerType(str, enum.Enum):
    """Partner type enumeration."""
    PROMOTIONAL_COMPANY = "promotional_company"
    LOCAL_BUSINESS = "local_business"
    PAYMENT_PROCESSOR = "payment_processor"
    FULFILLMENT_CENTER = "fulfillment_center"
    MARKETING_AGENCY = "marketing_agency"
    SALES_AGENT = "sales_agent"
    SCHOOL_DISTRICT = "school_district"


class PartnerStatus(str, enum.Enum):
    """Partner status enumeration."""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"
    UNDER_REVIEW = "under_review"


class Territory(BaseModel):
    """Territory model for regional management."""
    
    __tablename__ = "territories"
    
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Geographic boundaries
    states = Column(JSON, nullable=True)  # List of state codes
    counties = Column(JSON, nullable=True)  # List of county names
    zip_codes = Column(JSON, nullable=True)  # List of zip code ranges
    cities = Column(JSON, nullable=True)  # List of cities
    
    # Territory settings
    is_active = Column(Boolean, default=True, nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=True)  # Default commission rate for territory
    
    # Relationships
    partners = relationship("Partner", back_populates="territory")
    sales_agents = relationship("SalesAgent", back_populates="territory")
    
    def __repr__(self):
        return f"<Territory {self.name}>"


class Partner(BaseModel):
    """Partner model for all types of business partners."""
    
    __tablename__ = "partners"
    
    # Basic Information
    company_name = Column(String(200), nullable=False, index=True)
    contact_name = Column(String(200), nullable=False)
    contact_title = Column(String(100), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    
    # Business Details
    partner_type = Column(Enum(PartnerType), nullable=False)
    business_license = Column(String(100), nullable=True)
    tax_id = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Address
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(50), default="US", nullable=False)
    
    # Status and Settings
    status = Column(Enum(PartnerStatus), default=PartnerStatus.PENDING, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_date = Column(DateTime, nullable=True)
    
    # Financial Settings
    commission_rate = Column(Numeric(5, 2), nullable=True)  # Override territory default
    payment_terms = Column(String(100), nullable=True)  # e.g., "Net 30", "COD"
    minimum_order_amount = Column(Numeric(10, 2), nullable=True)
    
    # Capabilities and Services
    services_offered = Column(JSON, nullable=True)  # List of services they provide
    product_categories = Column(JSON, nullable=True)  # Product categories they handle
    delivery_radius = Column(Integer, nullable=True)  # Miles from their location
    processing_time_days = Column(Integer, nullable=True)  # Typical order processing time
    
    # Service Area Management (for local businesses)
    service_areas = Column(JSON, nullable=True)  # List of service area objects
    service_radius_miles = Column(Integer, nullable=True)  # Service radius in miles
    service_zip_codes = Column(JSON, nullable=True)  # Specific zip codes they serve
    service_cities = Column(JSON, nullable=True)  # Specific cities they serve
    service_counties = Column(JSON, nullable=True)  # Specific counties they serve
    
    # Business Hours and Availability
    business_hours = Column(JSON, nullable=True)  # Weekly schedule
    emergency_service = Column(Boolean, default=False, nullable=False)
    appointment_required = Column(Boolean, default=False, nullable=False)
    
    # Lead Generation Settings
    lead_fee = Column(Numeric(10, 2), nullable=True)  # Fee per qualified lead
    lead_commission_rate = Column(Numeric(5, 2), nullable=True)  # Commission on closed deals
    minimum_lead_quality_score = Column(Integer, default=1, nullable=False)  # 1-5 scale
    
    # Quality Metrics
    rating = Column(Numeric(3, 2), nullable=True)  # 1.00 to 5.00
    total_orders = Column(Integer, default=0, nullable=False)
    successful_orders = Column(Integer, default=0, nullable=False)
    on_time_delivery_rate = Column(Numeric(5, 2), nullable=True)
    
    # Google Business Integration
    google_place_id = Column(String(200), nullable=True)
    google_rating = Column(Numeric(3, 2), nullable=True)  # Google's rating
    google_review_count = Column(Integer, nullable=True)  # Number of Google reviews
    google_business_url = Column(String(500), nullable=True)  # Google Business profile URL
    
    # Business Media
    logo_url = Column(String(500), nullable=True)
    banner_image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True)  # Array of image URLs
    
    # Business Description and Details
    description = Column(Text, nullable=True)
    specialties = Column(JSON, nullable=True)  # List of specialties
    certifications = Column(JSON, nullable=True)  # List of certifications
    years_in_business = Column(Integer, nullable=True)
    
    # Social Media
    facebook_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    yelp_url = Column(String(500), nullable=True)
    
    # API Integration
    api_endpoint = Column(String(500), nullable=True)
    api_key = Column(String(500), nullable=True)
    api_secret = Column(String(500), nullable=True)
    webhook_url = Column(String(500), nullable=True)
    integration_status = Column(String(50), default="not_configured", nullable=False)
    
    # Relationships
    territory_id = Column(Integer, ForeignKey("territories.id"), nullable=True)
    territory = relationship("Territory", back_populates="partners")
    api_integrations = relationship("PartnerApiIntegration", back_populates="partner", cascade="all, delete-orphan")
    orders = relationship("PartnerOrder", back_populates="partner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Partner {self.company_name} - {self.partner_type}>"


class PartnerApiIntegration(BaseModel):
    """API integration details for partners."""
    
    __tablename__ = "partner_api_integrations"
    
    integration_name = Column(String(100), nullable=False)  # e.g., "Order Processing", "Inventory Sync"
    api_type = Column(String(50), nullable=False)  # e.g., "REST", "GraphQL", "Webhook"
    
    # API Configuration
    base_url = Column(String(500), nullable=False)
    api_key = Column(String(500), nullable=True)
    api_secret = Column(String(500), nullable=True)
    auth_type = Column(String(50), nullable=False)  # e.g., "Bearer", "Basic", "API Key"
    
    # Endpoints
    order_endpoint = Column(String(500), nullable=True)
    inventory_endpoint = Column(String(500), nullable=True)
    tracking_endpoint = Column(String(500), nullable=True)
    webhook_endpoint = Column(String(500), nullable=True)
    
    # Status and Settings
    is_active = Column(Boolean, default=True, nullable=False)
    last_sync = Column(DateTime, nullable=True)
    sync_frequency_minutes = Column(Integer, default=60, nullable=False)
    
    # Error Handling
    max_retry_attempts = Column(Integer, default=3, nullable=False)
    timeout_seconds = Column(Integer, default=30, nullable=False)
    
    # Relationships
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    partner = relationship("Partner", back_populates="api_integrations")
    
    def __repr__(self):
        return f"<PartnerApiIntegration {self.integration_name} - {self.partner.company_name}>"


class PartnerOrder(BaseModel):
    """Orders placed with partners."""
    
    __tablename__ = "partner_orders"
    
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    partner_order_id = Column(String(100), nullable=True)  # Partner's internal order ID
    
    # Order Details
    status = Column(String(50), default="pending", nullable=False)
    order_type = Column(String(50), nullable=False)  # e.g., "team_merchandise", "local_business_lead"
    
    # Financial Information
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    shipping_amount = Column(Numeric(10, 2), default=0, nullable=False)
    commission_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Order Items (JSON for flexibility)
    order_items = Column(JSON, nullable=False)  # List of items with details
    
    # Shipping Information
    shipping_address = Column(JSON, nullable=True)  # Full address object
    
    # Tracking
    tracking_number = Column(String(100), nullable=True)
    tracking_carrier = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    
    # API Communication
    api_request_sent = Column(DateTime, nullable=True)
    api_response_received = Column(DateTime, nullable=True)
    api_response_data = Column(JSON, nullable=True)
    api_error_message = Column(Text, nullable=True)
    
    # Relationships
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    partner = relationship("Partner", back_populates="orders")
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team = relationship("Team")
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    supporter = relationship("Supporter")
    
    def __repr__(self):
        return f"<PartnerOrder {self.order_number} - {self.partner.company_name}>"


class RegionalSettings(BaseModel):
    """Regional settings and customization."""
    
    __tablename__ = "regional_settings"
    
    region_name = Column(String(200), nullable=False, index=True)
    region_type = Column(String(50), nullable=False)  # e.g., "state", "county", "city", "school_district"
    
    # Geographic Information
    state_code = Column(String(2), nullable=True)
    county_name = Column(String(100), nullable=True)
    city_name = Column(String(100), nullable=True)
    school_district = Column(String(200), nullable=True)
    
    # Regional Customization
    default_commission_rate = Column(Numeric(5, 2), nullable=True)
    tax_rate = Column(Numeric(5, 4), nullable=True)  # Sales tax rate
    shipping_zones = Column(JSON, nullable=True)  # Shipping zone definitions
    
    # Business Rules
    minimum_order_amount = Column(Numeric(10, 2), nullable=True)
    maximum_order_amount = Column(Numeric(10, 2), nullable=True)
    allowed_payment_methods = Column(JSON, nullable=True)  # List of allowed payment methods
    
    # Local Compliance
    business_license_required = Column(Boolean, default=False, nullable=False)
    tax_id_required = Column(Boolean, default=False, nullable=False)
    insurance_required = Column(Boolean, default=False, nullable=False)
    
    # Branding and Localization
    primary_color = Column(String(7), nullable=True)  # Hex color
    secondary_color = Column(String(7), nullable=True)  # Hex color
    logo_url = Column(String(500), nullable=True)
    timezone = Column(String(50), default="America/New_York", nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Relationships
    territory_id = Column(Integer, ForeignKey("territories.id"), nullable=True)
    territory = relationship("Territory")
    
    def __repr__(self):
        return f"<RegionalSettings {self.region_name}>"


class PartnerPerformanceMetrics(BaseModel):
    """Performance tracking for partners."""
    
    __tablename__ = "partner_performance_metrics"
    
    # Time Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)  # e.g., "daily", "weekly", "monthly"
    
    # Order Metrics
    total_orders = Column(Integer, default=0, nullable=False)
    successful_orders = Column(Integer, default=0, nullable=False)
    failed_orders = Column(Integer, default=0, nullable=False)
    cancelled_orders = Column(Integer, default=0, nullable=False)
    
    # Financial Metrics
    total_revenue = Column(Numeric(12, 2), default=0, nullable=False)
    total_commission = Column(Numeric(12, 2), default=0, nullable=False)
    average_order_value = Column(Numeric(10, 2), nullable=True)
    
    # Performance Metrics
    on_time_delivery_rate = Column(Numeric(5, 2), nullable=True)
    customer_satisfaction_score = Column(Numeric(3, 2), nullable=True)
    response_time_hours = Column(Numeric(8, 2), nullable=True)
    
    # Quality Metrics
    defect_rate = Column(Numeric(5, 2), nullable=True)
    return_rate = Column(Numeric(5, 2), nullable=True)
    complaint_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    partner = relationship("Partner")
    
    def __repr__(self):
        return f"<PartnerPerformanceMetrics {self.partner.company_name} - {self.period_start}>"


class Lead(BaseModel):
    """Lead model for tracking supporter interactions with local businesses."""
    
    __tablename__ = "leads"
    
    # Lead Information
    lead_type = Column(String(50), nullable=False)  # e.g., "click", "inquiry", "appointment_request"
    status = Column(String(50), default="new", nullable=False)  # e.g., "new", "contacted", "qualified", "converted", "closed"
    
    # Supporter Information
    supporter_name = Column(String(200), nullable=True)
    supporter_email = Column(String(255), nullable=True)
    supporter_phone = Column(String(20), nullable=True)
    supporter_location = Column(String(200), nullable=True)  # City, State or Zip
    
    # Lead Details
    inquiry_message = Column(Text, nullable=True)
    service_requested = Column(String(200), nullable=True)
    urgency_level = Column(String(20), nullable=True)  # e.g., "low", "medium", "high", "urgent"
    budget_range = Column(String(50), nullable=True)  # e.g., "$100-500", "$500-1000"
    
    # Business Information
    business_name = Column(String(200), nullable=True)
    business_phone = Column(String(20), nullable=True)
    business_email = Column(String(255), nullable=True)
    
    # Lead Quality and Scoring
    quality_score = Column(Integer, default=1, nullable=False)  # 1-5 scale
    conversion_probability = Column(Numeric(3, 2), nullable=True)  # 0.00 to 1.00
    estimated_value = Column(Numeric(10, 2), nullable=True)
    
    # Tracking Information
    source_page = Column(String(500), nullable=True)  # Which team landing page they came from
    referrer_url = Column(String(500), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Follow-up Information
    first_contact_date = Column(DateTime, nullable=True)
    last_contact_date = Column(DateTime, nullable=True)
    next_follow_up_date = Column(DateTime, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    
    # Conversion Information
    converted_date = Column(DateTime, nullable=True)
    conversion_value = Column(Numeric(10, 2), nullable=True)
    conversion_notes = Column(Text, nullable=True)
    
    # Relationships
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    partner = relationship("Partner")
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team = relationship("Team")
    supporter_id = Column(Integer, ForeignKey("supporters.id"), nullable=True)
    supporter = relationship("Supporter")
    
    def __repr__(self):
        return f"<Lead {self.lead_type} - {self.business_name}>"


class ServiceArea(BaseModel):
    """Service area model for defining business coverage zones."""
    
    __tablename__ = "service_areas"
    
    # Area Definition
    area_name = Column(String(200), nullable=False)  # e.g., "Downtown Austin", "North Austin"
    area_type = Column(String(50), nullable=False)  # e.g., "radius", "zip_codes", "cities", "counties"
    
    # Geographic Definition
    center_latitude = Column(Numeric(10, 8), nullable=True)  # For radius-based areas
    center_longitude = Column(Numeric(11, 8), nullable=True)  # For radius-based areas
    radius_miles = Column(Integer, nullable=True)  # For radius-based areas
    
    # Specific Areas
    zip_codes = Column(JSON, nullable=True)  # List of zip codes
    cities = Column(JSON, nullable=True)  # List of cities
    counties = Column(JSON, nullable=True)  # List of counties
    states = Column(JSON, nullable=True)  # List of states
    
    # Service Settings
    is_active = Column(Boolean, default=True, nullable=False)
    service_fee = Column(Numeric(10, 2), nullable=True)  # Additional fee for this area
    delivery_time_days = Column(Integer, nullable=True)  # Service time for this area
    
    # Relationships
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    partner = relationship("Partner")
    
    def __repr__(self):
        return f"<ServiceArea {self.area_name} - {self.partner.company_name}>"
