"""
Partner Management API endpoints for regional partner system.
"""
from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.partner_system import (
    Partner, Territory, PartnerApiIntegration, PartnerOrder,
    RegionalSettings, PartnerPerformanceMetrics,
    PartnerType, PartnerStatus
)
from app.api.v1.endpoints.auth import get_current_user
import structlog

logger = structlog.get_logger()
router = APIRouter()


# Pydantic schemas for request/response
class PartnerCreate(BaseModel):
    company_name: str
    contact_name: str
    contact_title: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    partner_type: PartnerType
    business_license: Optional[str] = None
    tax_id: Optional[str] = None
    website: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str = "US"
    territory_id: Optional[int] = None
    commission_rate: Optional[float] = None
    payment_terms: Optional[str] = None
    minimum_order_amount: Optional[float] = None
    services_offered: Optional[List[str]] = None
    product_categories: Optional[List[str]] = None
    delivery_radius: Optional[int] = None
    processing_time_days: Optional[int] = None


class PartnerResponse(BaseModel):
    id: int
    company_name: str
    contact_name: str
    contact_title: Optional[str]
    email: str
    phone: Optional[str]
    partner_type: PartnerType
    status: PartnerStatus
    is_verified: bool
    commission_rate: Optional[float]
    rating: Optional[float]
    total_orders: int
    successful_orders: int
    on_time_delivery_rate: Optional[float]
    territory_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TerritoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    states: Optional[List[str]] = None
    counties: Optional[List[str]] = None
    zip_codes: Optional[List[str]] = None
    cities: Optional[List[str]] = None
    commission_rate: Optional[float] = None


class TerritoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    states: Optional[List[str]]
    counties: Optional[List[str]]
    zip_codes: Optional[List[str]]
    cities: Optional[List[str]]
    commission_rate: Optional[float]
    is_active: bool
    partners_count: int
    sales_agents_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Territory Management Endpoints
@router.post("/territories", response_model=TerritoryResponse, status_code=status.HTTP_201_CREATED)
async def create_territory(
    territory_data: TerritoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new territory."""
    # Check if territory already exists
    existing_territory = db.query(Territory).filter(Territory.name == territory_data.name).first()
    if existing_territory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Territory with this name already exists"
        )
    
    # Create new territory
    territory = Territory(
        name=territory_data.name,
        description=territory_data.description,
        states=territory_data.states,
        counties=territory_data.counties,
        zip_codes=territory_data.zip_codes,
        cities=territory_data.cities,
        commission_rate=territory_data.commission_rate
    )
    
    db.add(territory)
    db.commit()
    db.refresh(territory)
    
    logger.info("Territory created", territory_id=territory.id, territory_name=territory_data.name)
    
    return TerritoryResponse(
        id=territory.id,
        name=territory.name,
        description=territory.description,
        states=territory.states,
        counties=territory.counties,
        zip_codes=territory.zip_codes,
        cities=territory.cities,
        commission_rate=territory.commission_rate,
        is_active=territory.is_active,
        partners_count=len(territory.partners),
        sales_agents_count=len(territory.sales_agents),
        created_at=territory.created_at
    )


@router.get("/territories", response_model=List[TerritoryResponse])
async def list_territories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List all territories."""
    territories = db.query(Territory).offset(skip).limit(limit).all()
    
    return [
        TerritoryResponse(
            id=territory.id,
            name=territory.name,
            description=territory.description,
            states=territory.states,
            counties=territory.counties,
            zip_codes=territory.zip_codes,
            cities=territory.cities,
            commission_rate=territory.commission_rate,
            is_active=territory.is_active,
            partners_count=len(territory.partners),
            sales_agents_count=len(territory.sales_agents),
            created_at=territory.created_at
        )
        for territory in territories
    ]


# Partner Management Endpoints
@router.post("/", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(
    partner_data: PartnerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new partner."""
    # Check if partner already exists
    existing_partner = db.query(Partner).filter(Partner.email == partner_data.email).first()
    if existing_partner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner with this email already exists"
        )
    
    # Create new partner
    partner = Partner(
        company_name=partner_data.company_name,
        contact_name=partner_data.contact_name,
        contact_title=partner_data.contact_title,
        email=partner_data.email,
        phone=partner_data.phone,
        partner_type=partner_data.partner_type,
        business_license=partner_data.business_license,
        tax_id=partner_data.tax_id,
        website=partner_data.website,
        address_line1=partner_data.address_line1,
        address_line2=partner_data.address_line2,
        city=partner_data.city,
        state=partner_data.state,
        zip_code=partner_data.zip_code,
        country=partner_data.country,
        territory_id=partner_data.territory_id,
        commission_rate=partner_data.commission_rate,
        payment_terms=partner_data.payment_terms,
        minimum_order_amount=partner_data.minimum_order_amount,
        services_offered=partner_data.services_offered,
        product_categories=partner_data.product_categories,
        delivery_radius=partner_data.delivery_radius,
        processing_time_days=partner_data.processing_time_days
    )
    
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    logger.info("Partner created", partner_id=partner.id, company_name=partner_data.company_name)
    
    return PartnerResponse(
        id=partner.id,
        company_name=partner.company_name,
        contact_name=partner.contact_name,
        contact_title=partner.contact_title,
        email=partner.email,
        phone=partner.phone,
        partner_type=partner.partner_type,
        status=partner.status,
        is_verified=partner.is_verified,
        commission_rate=partner.commission_rate,
        rating=partner.rating,
        total_orders=partner.total_orders,
        successful_orders=partner.successful_orders,
        on_time_delivery_rate=partner.on_time_delivery_rate,
        territory_name=partner.territory.name if partner.territory else None,
        created_at=partner.created_at
    )


@router.get("/", response_model=List[PartnerResponse])
async def list_partners(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    partner_type: Optional[PartnerType] = Query(None),
    territory_id: Optional[int] = Query(None),
    status: Optional[PartnerStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List all partners with optional filtering."""
    query = db.query(Partner)
    
    if partner_type:
        query = query.filter(Partner.partner_type == partner_type)
    if territory_id:
        query = query.filter(Partner.territory_id == territory_id)
    if status:
        query = query.filter(Partner.status == status)
    
    partners = query.offset(skip).limit(limit).all()
    
    return [
        PartnerResponse(
            id=partner.id,
            company_name=partner.company_name,
            contact_name=partner.contact_name,
            contact_title=partner.contact_title,
            email=partner.email,
            phone=partner.phone,
            partner_type=partner.partner_type,
            status=partner.status,
            is_verified=partner.is_verified,
            commission_rate=partner.commission_rate,
            rating=partner.rating,
            total_orders=partner.total_orders,
            successful_orders=partner.successful_orders,
            on_time_delivery_rate=partner.on_time_delivery_rate,
            territory_name=partner.territory.name if partner.territory else None,
            created_at=partner.created_at
        )
        for partner in partners
    ]


@router.get("/{partner_id}", response_model=PartnerResponse)
async def get_partner(
    partner_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get partner details."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    return PartnerResponse(
        id=partner.id,
        company_name=partner.company_name,
        contact_name=partner.contact_name,
        contact_title=partner.contact_title,
        email=partner.email,
        phone=partner.phone,
        partner_type=partner.partner_type,
        status=partner.status,
        is_verified=partner.is_verified,
        commission_rate=partner.commission_rate,
        rating=partner.rating,
        total_orders=partner.total_orders,
        successful_orders=partner.successful_orders,
        on_time_delivery_rate=partner.on_time_delivery_rate,
        territory_name=partner.territory.name if partner.territory else None,
        created_at=partner.created_at
    )


@router.put("/{partner_id}/status")
async def update_partner_status(
    partner_id: int,
    new_status: PartnerStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update partner status."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    partner.status = new_status
    if new_status == PartnerStatus.ACTIVE:
        partner.verification_date = datetime.utcnow()
        partner.is_verified = True
    
    db.commit()
    
    logger.info("Partner status updated", partner_id=partner_id, new_status=new_status)
    
    return {"message": f"Partner status updated to {new_status}"}


@router.get("/{partner_id}/performance")
async def get_partner_performance(
    partner_id: int,
    period_days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get partner performance metrics."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    # Calculate performance metrics for the specified period
    from datetime import timedelta
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    recent_orders = db.query(PartnerOrder).filter(
        PartnerOrder.partner_id == partner_id,
        PartnerOrder.created_at >= start_date
    ).all()
    
    total_orders = len(recent_orders)
    successful_orders = len([o for o in recent_orders if o.status == "completed"])
    total_revenue = sum(order.total_amount for order in recent_orders)
    
    performance_data = {
        "partner_id": partner_id,
        "company_name": partner.company_name,
        "period_days": period_days,
        "total_orders": total_orders,
        "successful_orders": successful_orders,
        "success_rate": (successful_orders / total_orders * 100) if total_orders > 0 else 0,
        "total_revenue": float(total_revenue),
        "average_order_value": float(total_revenue / total_orders) if total_orders > 0 else 0,
        "commission_earned": float(sum(order.commission_amount for order in recent_orders)),
        "rating": float(partner.rating) if partner.rating else None,
        "on_time_delivery_rate": float(partner.on_time_delivery_rate) if partner.on_time_delivery_rate else None
    }
    
    return performance_data
