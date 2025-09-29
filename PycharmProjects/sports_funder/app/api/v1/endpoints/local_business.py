"""
Local Business Directory and Lead Generation API endpoints.
"""
from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.core.database import get_db
from app.models.partner_system import Partner, Lead, ServiceArea, PartnerType, PartnerStatus
from app.models.organization import Team
import structlog

logger = structlog.get_logger()
router = APIRouter()


# Pydantic schemas
class LocalBusinessResponse(BaseModel):
    id: int
    company_name: str
    contact_name: str
    phone: Optional[str]
    email: str
    website: Optional[str]
    business_type: str
    description: Optional[str]
    address_line1: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    services_offered: Optional[List[str]]
    service_radius_miles: Optional[int]
    service_zip_codes: Optional[List[str]]
    service_cities: Optional[List[str]]
    business_hours: Optional[dict]
    emergency_service: bool
    appointment_required: bool
    rating: Optional[float]
    lead_fee: Optional[float]
    logo_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class LeadCreate(BaseModel):
    lead_type: str = "inquiry"
    supporter_name: Optional[str] = None
    supporter_email: Optional[EmailStr] = None
    supporter_phone: Optional[str] = None
    supporter_location: Optional[str] = None
    inquiry_message: Optional[str] = None
    service_requested: Optional[str] = None
    urgency_level: Optional[str] = None
    budget_range: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    lead_type: str
    status: str
    supporter_name: Optional[str]
    supporter_email: Optional[str]
    supporter_phone: Optional[str]
    supporter_location: Optional[str]
    inquiry_message: Optional[str]
    service_requested: Optional[str]
    urgency_level: Optional[str]
    budget_range: Optional[str]
    business_name: Optional[str]
    quality_score: int
    estimated_value: Optional[float]
    source_page: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/business/{business_id}", response_model=dict)
async def get_business_details(
    business_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """Get detailed information about a specific local business."""
    
    business = db.query(Partner).filter(
        Partner.id == business_id,
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    ).first()
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    return {
        "id": business.id,
        "company_name": business.company_name,
        "contact_name": business.contact_name,
        "contact_title": business.contact_title,
        "phone": business.phone,
        "email": business.email,
        "website": business.website,
        "description": business.description,
        "address": {
            "line1": business.address_line1,
            "line2": business.address_line2,
            "city": business.city,
            "state": business.state,
            "zip_code": business.zip_code,
            "country": business.country
        },
        "services_offered": business.services_offered,
        "specialties": business.specialties,
        "certifications": business.certifications,
        "years_in_business": business.years_in_business,
        "business_hours": business.business_hours,
        "emergency_service": business.emergency_service,
        "appointment_required": business.appointment_required,
        "rating": float(business.rating) if business.rating else None,
        "google_rating": float(business.google_rating) if business.google_rating else None,
        "google_review_count": business.google_review_count,
        "google_business_url": business.google_business_url,
        "logo_url": business.logo_url,
        "banner_image_url": business.banner_image_url,
        "gallery_images": business.gallery_images,
        "social_media": {
            "facebook": business.facebook_url,
            "instagram": business.instagram_url,
            "linkedin": business.linkedin_url,
            "yelp": business.yelp_url
        },
        "service_areas": {
            "radius_miles": business.service_radius_miles,
            "zip_codes": business.service_zip_codes,
            "cities": business.service_cities,
            "counties": business.service_counties
        },
        "created_at": business.created_at
    }


@router.get("/directory", response_model=List[LocalBusinessResponse])
async def get_local_businesses(
    team_id: int = Query(..., description="Team ID to get local businesses for"),
    latitude: Optional[float] = Query(None, description="Supporter's latitude for location-based filtering"),
    longitude: Optional[float] = Query(None, description="Supporter's longitude for location-based filtering"),
    zip_code: Optional[str] = Query(None, description="Supporter's zip code for location-based filtering"),
    city: Optional[str] = Query(None, description="Supporter's city for location-based filtering"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    radius_miles: int = Query(25, ge=1, le=100, description="Search radius in miles"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> Any:
    """Get local businesses for a team's supporters with location-based filtering."""
    
    # Get the team to understand the area
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Query for local business partners
    query = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    )
    
    # Apply service type filter
    if service_type:
        # This would need to be implemented based on how services_offered is stored
        # For now, we'll do a simple text search
        query = query.filter(Partner.services_offered.contains([service_type]))
    
    # Get all local businesses (location filtering will be done in Python for now)
    # In production, you'd want to use PostGIS or similar for efficient geographic queries
    businesses = query.offset(skip).limit(limit * 3).all()  # Get more to account for filtering
    
    # Filter by location if provided
    filtered_businesses = []
    for business in businesses:
        if _is_business_in_area(business, latitude, longitude, zip_code, city, radius_miles):
            filtered_businesses.append(business)
            if len(filtered_businesses) >= limit:
                break
    
    return [
        LocalBusinessResponse(
            id=business.id,
            company_name=business.company_name,
            contact_name=business.contact_name,
            phone=business.phone,
            email=business.email,
            website=business.website,
            business_type=business.partner_type.value,
            description=business.description if hasattr(business, 'description') else None,
            address_line1=business.address_line1,
            city=business.city,
            state=business.state,
            zip_code=business.zip_code,
            services_offered=business.services_offered,
            service_radius_miles=business.service_radius_miles,
            service_zip_codes=business.service_zip_codes,
            service_cities=business.service_cities,
            business_hours=business.business_hours,
            emergency_service=business.emergency_service,
            appointment_required=business.appointment_required,
            rating=float(business.rating) if business.rating else None,
            lead_fee=float(business.lead_fee) if business.lead_fee else None,
            logo_url=getattr(business, 'logo_url', None),
            created_at=business.created_at
        )
        for business in filtered_businesses
    ]


@router.get("/carousel", response_model=List[dict])
async def get_business_carousel(
    team_id: int = Query(..., description="Team ID to get carousel businesses for"),
    limit: int = Query(10, ge=1, le=20, description="Number of businesses to show in carousel"),
    db: Session = Depends(get_db)
) -> Any:
    """Get businesses for the team landing page carousel."""
    
    # Get the team
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Get featured local businesses for the carousel
    businesses = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    ).order_by(Partner.rating.desc().nullslast()).limit(limit).all()
    
    return [
        {
            "id": business.id,
            "company_name": business.company_name,
            "logo_url": getattr(business, 'logo_url', None),
            "business_type": business.partner_type.value,
            "rating": float(business.rating) if business.rating else None,
            "city": business.city,
            "state": business.state
        }
        for business in businesses
    ]


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead_data: LeadCreate,
    partner_id: int = Query(..., description="Partner ID for the lead"),
    team_id: Optional[int] = Query(None, description="Team ID if from team landing page"),
    request: Request = None,
    db: Session = Depends(get_db)
) -> Any:
    """Create a new lead for a local business."""
    
    # Verify partner exists and is a local business
    partner = db.query(Partner).filter(
        Partner.id == partner_id,
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Local business not found or inactive"
        )
    
    # Get client information
    client_ip = request.client.host if request else None
    user_agent = request.headers.get("user-agent") if request else None
    referrer = request.headers.get("referer") if request else None
    
    # Create the lead
    lead = Lead(
        lead_type=lead_data.lead_type,
        status="new",
        supporter_name=lead_data.supporter_name,
        supporter_email=lead_data.supporter_email,
        supporter_phone=lead_data.supporter_phone,
        supporter_location=lead_data.supporter_location,
        inquiry_message=lead_data.inquiry_message,
        service_requested=lead_data.service_requested,
        urgency_level=lead_data.urgency_level,
        budget_range=lead_data.budget_range,
        business_name=partner.company_name,
        business_phone=partner.phone,
        business_email=partner.email,
        quality_score=_calculate_lead_quality_score(lead_data),
        estimated_value=_estimate_lead_value(lead_data, partner),
        source_page=referrer,
        referrer_url=referrer,
        user_agent=user_agent,
        ip_address=client_ip,
        partner_id=partner_id,
        team_id=team_id
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    logger.info("Lead created", lead_id=lead.id, partner_id=partner_id, team_id=team_id)
    
    return LeadResponse(
        id=lead.id,
        lead_type=lead.lead_type,
        status=lead.status,
        supporter_name=lead.supporter_name,
        supporter_email=lead.supporter_email,
        supporter_phone=lead.supporter_phone,
        supporter_location=lead.supporter_location,
        inquiry_message=lead.inquiry_message,
        service_requested=lead.service_requested,
        urgency_level=lead.urgency_level,
        budget_range=lead.budget_range,
        business_name=lead.business_name,
        quality_score=lead.quality_score,
        estimated_value=float(lead.estimated_value) if lead.estimated_value else None,
        source_page=lead.source_page,
        created_at=lead.created_at
    )


@router.get("/leads", response_model=List[LeadResponse])
async def get_leads(
    partner_id: Optional[int] = Query(None, description="Filter by partner ID"),
    team_id: Optional[int] = Query(None, description="Filter by team ID"),
    status: Optional[str] = Query(None, description="Filter by lead status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> Any:
    """Get leads with optional filtering."""
    
    query = db.query(Lead)
    
    if partner_id:
        query = query.filter(Lead.partner_id == partner_id)
    if team_id:
        query = query.filter(Lead.team_id == team_id)
    if status:
        query = query.filter(Lead.status == status)
    
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        LeadResponse(
            id=lead.id,
            lead_type=lead.lead_type,
            status=lead.status,
            supporter_name=lead.supporter_name,
            supporter_email=lead.supporter_email,
            supporter_phone=lead.supporter_phone,
            supporter_location=lead.supporter_location,
            inquiry_message=lead.inquiry_message,
            service_requested=lead.service_requested,
            urgency_level=lead.urgency_level,
            budget_range=lead.budget_range,
            business_name=lead.business_name,
            quality_score=lead.quality_score,
            estimated_value=float(lead.estimated_value) if lead.estimated_value else None,
            source_page=lead.source_page,
            created_at=lead.created_at
        )
        for lead in leads
    ]


# Helper functions
def _is_business_in_area(business, latitude, longitude, zip_code, city, radius_miles):
    """Check if a business serves the specified area."""
    
    # If no location provided, return all businesses
    if not any([latitude, longitude, zip_code, city]):
        return True
    
    # Check zip code match
    if zip_code and business.service_zip_codes:
        if zip_code in business.service_zip_codes:
            return True
    
    # Check city match
    if city and business.service_cities:
        if city.lower() in [c.lower() for c in business.service_cities]:
            return True
    
    # Check radius (simplified - in production you'd use proper geographic calculations)
    if latitude and longitude and business.service_radius_miles:
        # This is a simplified check - you'd want to use proper distance calculations
        # For now, we'll assume if they have a radius, they serve the area
        return True
    
    # If business has no specific service area restrictions, include them
    if not any([business.service_zip_codes, business.service_cities, business.service_radius_miles]):
        return True
    
    return False


def _calculate_lead_quality_score(lead_data):
    """Calculate lead quality score based on provided information."""
    score = 1  # Base score
    
    if lead_data.supporter_email:
        score += 1
    if lead_data.supporter_phone:
        score += 1
    if lead_data.inquiry_message and len(lead_data.inquiry_message) > 20:
        score += 1
    if lead_data.budget_range:
        score += 1
    if lead_data.urgency_level in ["high", "urgent"]:
        score += 1
    
    return min(score, 5)  # Cap at 5


def _estimate_lead_value(lead_data, partner):
    """Estimate the value of a lead based on information provided."""
    base_value = 100.0  # Base lead value
    
    # Adjust based on budget range
    if lead_data.budget_range:
        if "$1000+" in lead_data.budget_range:
            base_value *= 2
        elif "$500-1000" in lead_data.budget_range:
            base_value *= 1.5
        elif "$100-500" in lead_data.budget_range:
            base_value *= 1.2
    
    # Adjust based on urgency
    if lead_data.urgency_level == "urgent":
        base_value *= 1.5
    elif lead_data.urgency_level == "high":
        base_value *= 1.3
    
    # Adjust based on partner's lead fee
    if partner.lead_fee:
        base_value = max(base_value, float(partner.lead_fee))
    
    return base_value
