"""
Business-related models for local businesses and partnerships.
"""
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class LocalBusiness(BaseModel):
    """Local business model for sponsored businesses."""
    
    __tablename__ = "local_businesses"
    
    company_name = Column(String(200), nullable=False, index=True)
    business_type = Column(String(100), nullable=True)  # e.g., "Restaurant", "Retail", "Service"
    
    # Contact information
    contact_name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Address
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    
    # Online presence
    website_url = Column(String(500), nullable=True)
    google_place_id = Column(String(255), nullable=True)
    facebook_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    
    # Business details
    description = Column(Text, nullable=True)
    hours_of_operation = Column(Text, nullable=True)
    special_offers = Column(Text, nullable=True)
    
    # Media
    logo_url = Column(String(500), nullable=True)
    banner_image_url = Column(String(500), nullable=True)
    gallery_images = Column(Text, nullable=True)  # JSON array of image URLs
    
    # Partnership details
    is_sponsored = Column(Boolean, default=False, nullable=False)
    has_custom_page = Column(Boolean, default=False, nullable=False)
    sponsorship_level = Column(String(50), nullable=True)  # e.g., "Gold", "Silver", "Bronze"
    sponsorship_amount = Column(Numeric(10, 2), nullable=True)
    sponsorship_start_date = Column(String(20), nullable=True)
    sponsorship_end_date = Column(String(20), nullable=True)
    
    # Google Reviews integration
    google_rating = Column(String(5), nullable=True)
    google_review_count = Column(Integer, nullable=True)
    last_review_sync = Column(String(20), nullable=True)
    
    # Relationships
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    school = relationship("School")
    
    def __repr__(self):
        return f"<LocalBusiness {self.company_name}>"


class BusinessCategory(BaseModel):
    """Business category model for organizing businesses."""
    
    __tablename__ = "business_categories"
    
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    
    def __repr__(self):
        return f"<BusinessCategory {self.name}>"


class BusinessReview(BaseModel):
    """Business review model for storing user reviews."""
    
    __tablename__ = "business_reviews"
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    reviewer_name = Column(String(200), nullable=True)
    reviewer_email = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    business_id = Column(Integer, ForeignKey("local_businesses.id"), nullable=False)
    business = relationship("LocalBusiness")
    
    def __repr__(self):
        return f"<BusinessReview {self.rating} stars for {self.business.company_name}>"

