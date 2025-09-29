from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.partner_system import Partner, PartnerType, PartnerStatus
from app.models.organization import School
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.get("/sponsors", response_model=List[dict])
def get_local_sponsors(db: Session = Depends(get_db)):
    """Get all local business sponsors."""
    sponsors = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.is_active == True
    ).all()
    
    return [
        {
            "id": sponsor.id,
            "name": sponsor.name,
            "contact_name": sponsor.contact_name,
            "contact_email": sponsor.contact_email,
            "contact_phone": sponsor.phone_number,
            "website": sponsor.website_url,
            "address": sponsor.address,
            "city": sponsor.city,
            "state": sponsor.state,
            "zip_code": sponsor.zip_code,
            "description": sponsor.description,
            "services": sponsor.capabilities,
            "service_areas": sponsor.service_areas,
            "business_hours": sponsor.business_hours,
            "google_rating": sponsor.google_business_profile_url,
            "status": sponsor.status.value if sponsor.status else "active",
            "lead_generation_settings": sponsor.lead_generation_settings,
            "monthly_budget": sponsor.lead_generation_settings.get("budget", 0) if sponsor.lead_generation_settings else 0,
            "max_leads_per_month": sponsor.lead_generation_settings.get("max_leads_per_month", 0) if sponsor.lead_generation_settings else 0,
            "created_at": sponsor.created_at
        }
        for sponsor in sponsors
    ]


@router.post("/sponsors", response_model=dict)
def create_local_sponsor(
    name: str = Form(...),
    contact_name: str = Form(None),
    contact_email: str = Form(None),
    contact_phone: str = Form(None),
    website: str = Form(None),
    address: str = Form(None),
    city: str = Form(None),
    state: str = Form(None),
    zip_code: str = Form(None),
    description: str = Form(None),
    services: str = Form(None),  # JSON string
    service_areas: str = Form(None),  # JSON string
    business_hours: str = Form(None),  # JSON string
    monthly_budget: float = Form(0),
    max_leads_per_month: int = Form(0),
    google_business_url: str = Form(None),
    db: Session = Depends(get_db)
):
    """Create a new local business sponsor."""
    try:
        # Parse JSON fields
        services_list = []
        if services:
            services_list = json.loads(services)
        
        service_areas_list = []
        if service_areas:
            service_areas_list = json.loads(service_areas)
        
        business_hours_dict = {}
        if business_hours:
            business_hours_dict = json.loads(business_hours)
        
        # Create lead generation settings
        lead_settings = {
            "budget": monthly_budget,
            "max_leads_per_month": max_leads_per_month,
            "auto_approve_leads": True,
            "lead_notification_email": contact_email
        }
        
        sponsor = Partner(
            name=name,
            partner_type=PartnerType.LOCAL_BUSINESS,
            status=PartnerStatus.ACTIVE,
            contact_name=contact_name,
            contact_email=contact_email,
            phone_number=contact_phone,
            website_url=website,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            description=description,
            capabilities=services_list,
            service_areas=service_areas_list,
            business_hours=business_hours_dict,
            lead_generation_settings=lead_settings,
            google_business_profile_url=google_business_url
        )
        
        db.add(sponsor)
        db.commit()
        db.refresh(sponsor)
        
        return {
            "id": sponsor.id,
            "name": sponsor.name,
            "contact_name": sponsor.contact_name,
            "contact_email": sponsor.contact_email,
            "status": sponsor.status.value,
            "created_at": sponsor.created_at
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating local sponsor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sponsors/{sponsor_id}", response_model=dict)
def get_local_sponsor(sponsor_id: int, db: Session = Depends(get_db)):
    """Get a specific local business sponsor."""
    sponsor = db.query(Partner).filter(
        Partner.id == sponsor_id,
        Partner.partner_type == PartnerType.LOCAL_BUSINESS
    ).first()
    
    if not sponsor:
        raise HTTPException(status_code=404, detail="Local sponsor not found")
    
    return {
        "id": sponsor.id,
        "name": sponsor.name,
        "contact_name": sponsor.contact_name,
        "contact_email": sponsor.contact_email,
        "contact_phone": sponsor.phone_number,
        "website": sponsor.website_url,
        "address": sponsor.address,
        "city": sponsor.city,
        "state": sponsor.state,
        "zip_code": sponsor.zip_code,
        "description": sponsor.description,
        "services": sponsor.capabilities,
        "service_areas": sponsor.service_areas,
        "business_hours": sponsor.business_hours,
        "google_business_url": sponsor.google_business_profile_url,
        "status": sponsor.status.value if sponsor.status else "active",
        "lead_generation_settings": sponsor.lead_generation_settings,
        "created_at": sponsor.created_at,
        "updated_at": sponsor.updated_at
    }


@router.get("/sponsors/{sponsor_id}/schools", response_model=List[dict])
def get_sponsor_schools(sponsor_id: int, db: Session = Depends(get_db)):
    """Get schools that a local sponsor can advertise with."""
    sponsor = db.query(Partner).filter(Partner.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    # Get schools in the sponsor's service areas
    schools = []
    if sponsor.service_areas:
        for area in sponsor.service_areas:
            # Simple area matching - in production, you'd use more sophisticated geocoding
            area_schools = db.query(School).filter(
                School.city.ilike(f"%{area}%")
            ).all()
            schools.extend(area_schools)
    
    # Remove duplicates
    unique_schools = list({school.id: school for school in schools}.values())
    
    return [
        {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "school_colors": school.school_colors,
            "mascot": school.mascot
        }
        for school in unique_schools
    ]


@router.get("/sponsors/{sponsor_id}/leads", response_model=List[dict])
def get_sponsor_leads(sponsor_id: int, db: Session = Depends(get_db)):
    """Get leads generated for a local sponsor."""
    from app.models.partner_system import Lead
    
    leads = db.query(Lead).filter(
        Lead.partner_id == sponsor_id
    ).order_by(Lead.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": lead.id,
            "supporter_name": lead.supporter_name,
            "supporter_email": lead.supporter_email,
            "supporter_phone": lead.supporter_phone,
            "message": lead.message,
            "status": lead.status,
            "created_at": lead.created_at
        }
        for lead in leads
    ]


@router.get("/sponsors/{sponsor_id}/dashboard", response_model=dict)
def get_sponsor_dashboard(sponsor_id: int, db: Session = Depends(get_db)):
    """Get dashboard data for a local sponsor."""
    sponsor = db.query(Partner).filter(Partner.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    from app.models.partner_system import Lead
    
    # Get lead stats
    total_leads = db.query(Lead).filter(Lead.partner_id == sponsor_id).count()
    recent_leads = db.query(Lead).filter(
        Lead.partner_id == sponsor_id,
        Lead.created_at >= datetime.utcnow().replace(day=1)  # This month
    ).count()
    
    # Get accessible schools count
    accessible_schools = len(get_sponsor_schools(sponsor_id, db))
    
    return {
        "sponsor": {
            "id": sponsor.id,
            "name": sponsor.name,
            "contact_name": sponsor.contact_name,
            "contact_email": sponsor.contact_email
        },
        "stats": {
            "total_leads": total_leads,
            "leads_this_month": recent_leads,
            "accessible_schools": accessible_schools,
            "monthly_budget": sponsor.lead_generation_settings.get("budget", 0) if sponsor.lead_generation_settings else 0,
            "max_leads_per_month": sponsor.lead_generation_settings.get("max_leads_per_month", 0) if sponsor.lead_generation_settings else 0
        },
        "service_areas": sponsor.service_areas or [],
        "services": sponsor.capabilities or []
    }


@router.put("/sponsors/{sponsor_id}/status", response_model=dict)
def update_sponsor_status(
    sponsor_id: int,
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    """Update sponsor status (active, inactive, suspended)."""
    sponsor = db.query(Partner).filter(Partner.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    
    # Update status
    if status == "active":
        sponsor.status = PartnerStatus.ACTIVE
    elif status == "inactive":
        sponsor.status = PartnerStatus.INACTIVE
    elif status == "suspended":
        sponsor.status = PartnerStatus.SUSPENDED
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    db.commit()
    db.refresh(sponsor)
    
    return {
        "id": sponsor.id,
        "name": sponsor.name,
        "status": sponsor.status.value
    }


@router.get("/sponsors/stats/overview", response_model=dict)
def get_sponsors_overview(db: Session = Depends(get_db)):
    """Get overview statistics for all local sponsors."""
    total_sponsors = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS
    ).count()
    
    active_sponsors = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    ).count()
    
    # Calculate total monthly budget
    sponsors = db.query(Partner).filter(
        Partner.partner_type == PartnerType.LOCAL_BUSINESS,
        Partner.status == PartnerStatus.ACTIVE
    ).all()
    
    total_monthly_budget = sum(
        sponsor.lead_generation_settings.get("budget", 0) 
        for sponsor in sponsors 
        if sponsor.lead_generation_settings
    )
    
    # Get leads this month
    from app.models.partner_system import Lead
    leads_this_month = db.query(Lead).filter(
        Lead.created_at >= datetime.utcnow().replace(day=1)
    ).count()
    
    return {
        "total_sponsors": total_sponsors,
        "active_sponsors": active_sponsors,
        "inactive_sponsors": total_sponsors - active_sponsors,
        "total_monthly_budget": total_monthly_budget,
        "leads_this_month": leads_this_month,
        "average_budget_per_sponsor": total_monthly_budget / active_sponsors if active_sponsors > 0 else 0
    }
