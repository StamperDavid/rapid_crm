"""
Agreement and contract management API endpoints.
Handles agreements between schools, promotional companies, and the platform.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import json
import uuid

from app.core.database import get_db
from app.models.agreements import (
    Agreement, OrderAgreement, RevenueShare, ComplianceRecord,
    TransparencyReport, AgreementTemplate, AgreementAmendment,
    AgreementStatus, AgreementType, PaymentTerms
)
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
import structlog

logger = structlog.get_logger()
router = APIRouter()


class AgreementCreate(BaseModel):
    agreement_type: AgreementType
    school_id: Optional[int] = None
    promotional_company_id: Optional[int] = None
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    effective_date: datetime
    expiration_date: Optional[datetime] = None
    auto_renewal: bool = False
    
    # Financial terms
    base_fee: Optional[float] = None
    commission_rate: Optional[float] = Field(None, ge=0, le=1)  # 0-1 for percentage
    revenue_share_rate: Optional[float] = Field(None, ge=0, le=1)  # 0-1 for percentage
    payment_terms: Optional[PaymentTerms] = None
    
    # Terms and conditions
    terms_conditions: Optional[str] = None
    special_conditions: Optional[str] = None
    termination_clause: Optional[str] = None
    
    # Metadata
    metadata: Optional[Dict[str, Any]] = None


class AgreementResponse(BaseModel):
    id: int
    agreement_id: str
    agreement_type: str
    status: str
    title: str
    description: Optional[str]
    effective_date: datetime
    expiration_date: Optional[datetime]
    auto_renewal: bool
    base_fee: Optional[float]
    commission_rate: Optional[float]
    revenue_share_rate: Optional[float]
    payment_terms: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransparencyReportResponse(BaseModel):
    id: int
    report_id: str
    report_type: str
    period_start: datetime
    period_end: datetime
    total_orders: int
    total_revenue: float
    total_profits: float
    average_order_value: float
    customer_satisfaction: Optional[float]
    fulfillment_rate: Optional[float]
    on_time_delivery: Optional[float]
    return_rate: Optional[float]
    generated_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/", response_model=AgreementResponse)
async def create_agreement(
    agreement_data: AgreementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new agreement."""
    try:
        # Generate unique agreement ID
        agreement_id = f"AGR_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create agreement
        agreement = Agreement(
            agreement_id=agreement_id,
            agreement_type=agreement_data.agreement_type,
            school_id=agreement_data.school_id,
            promotional_company_id=agreement_data.promotional_company_id,
            title=agreement_data.title,
            description=agreement_data.description,
            effective_date=agreement_data.effective_date,
            expiration_date=agreement_data.expiration_date,
            auto_renewal=agreement_data.auto_renewal,
            base_fee=agreement_data.base_fee,
            commission_rate=agreement_data.commission_rate,
            revenue_share_rate=agreement_data.revenue_share_rate,
            payment_terms=agreement_data.payment_terms,
            terms_conditions=agreement_data.terms_conditions,
            special_conditions=agreement_data.special_conditions,
            termination_clause=agreement_data.termination_clause,
            created_by=current_user.id,
            metadata=json.dumps(agreement_data.metadata) if agreement_data.metadata else None
        )
        
        db.add(agreement)
        db.commit()
        db.refresh(agreement)
        
        logger.info(
            "Agreement created",
            agreement_id=agreement.agreement_id,
            type=agreement.agreement_type,
            created_by=current_user.id
        )
        
        return agreement
        
    except Exception as e:
        logger.error(f"Agreement creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agreement creation failed: {str(e)}"
        )


@router.get("/", response_model=List[AgreementResponse])
async def get_agreements(
    skip: int = 0,
    limit: int = 50,
    status: Optional[AgreementStatus] = None,
    agreement_type: Optional[AgreementType] = None,
    school_id: Optional[int] = None,
    promotional_company_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get agreements with optional filtering."""
    query = db.query(Agreement)
    
    # Apply filters
    if status:
        query = query.filter(Agreement.status == status)
    if agreement_type:
        query = query.filter(Agreement.agreement_type == agreement_type)
    if school_id:
        query = query.filter(Agreement.school_id == school_id)
    if promotional_company_id:
        query = query.filter(Agreement.promotional_company_id == promotional_company_id)
    
    agreements = query.order_by(Agreement.created_at.desc()).offset(skip).limit(limit).all()
    return agreements


@router.get("/{agreement_id}", response_model=AgreementResponse)
async def get_agreement(
    agreement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific agreement by ID."""
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found"
        )
    return agreement


@router.put("/{agreement_id}/approve")
async def approve_agreement(
    agreement_id: int,
    approval_notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve an agreement (role-based approval)."""
    try:
        agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
        if not agreement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agreement not found"
            )
        
        # Determine approval type based on user role and agreement type
        if agreement.agreement_type == AgreementType.SCHOOL_PROMOTIONAL:
            if agreement.school_id and not agreement.approved_by_school:
                agreement.approved_by_school = current_user.id
                agreement.approved_at_school = datetime.utcnow()
            elif agreement.promotional_company_id and not agreement.approved_by_promotional:
                agreement.approved_by_promotional = current_user.id
                agreement.approved_at_promotional = datetime.utcnow()
        
        # Check if all required approvals are complete
        if (agreement.approved_by_school and agreement.approved_by_promotional) or \
           (agreement.agreement_type in [AgreementType.PLATFORM_SCHOOL, AgreementType.PLATFORM_PROMOTIONAL] and agreement.approved_by_platform):
            agreement.status = AgreementStatus.ACTIVE
        
        db.commit()
        
        logger.info(
            "Agreement approved",
            agreement_id=agreement.agreement_id,
            approved_by=current_user.id
        )
        
        return {"message": "Agreement approved successfully", "status": agreement.status}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Agreement approval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agreement approval failed: {str(e)}"
        )


@router.post("/{agreement_id}/revenue-share")
async def create_revenue_share(
    agreement_id: int,
    total_revenue: float,
    period_start: datetime,
    period_end: datetime,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a revenue share record for an agreement."""
    try:
        agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
        if not agreement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agreement not found"
            )
        
        if not agreement.revenue_share_rate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agreement does not have revenue sharing enabled"
            )
        
        # Calculate revenue shares
        platform_share = total_revenue * 0.10  # 10% platform fee
        promotional_share = total_revenue * agreement.revenue_share_rate
        school_share = total_revenue - platform_share - promotional_share
        
        # Create revenue share record
        revenue_share = RevenueShare(
            agreement_id=agreement.id,
            total_revenue=total_revenue,
            platform_share=platform_share,
            school_share=school_share,
            promotional_share=promotional_share,
            period_start=period_start,
            period_end=period_end
        )
        
        db.add(revenue_share)
        db.commit()
        db.refresh(revenue_share)
        
        logger.info(
            "Revenue share created",
            agreement_id=agreement.agreement_id,
            total_revenue=total_revenue,
            platform_share=platform_share,
            school_share=school_share,
            promotional_share=promotional_share
        )
        
        return {
            "message": "Revenue share created successfully",
            "revenue_share_id": revenue_share.id,
            "platform_share": float(platform_share),
            "school_share": float(school_share),
            "promotional_share": float(promotional_share)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Revenue share creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Revenue share creation failed: {str(e)}"
        )


@router.get("/transparency/reports", response_model=List[TransparencyReportResponse])
async def get_transparency_reports(
    report_type: Optional[str] = None,
    school_id: Optional[int] = None,
    promotional_company_id: Optional[int] = None,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transparency reports."""
    query = db.query(TransparencyReport)
    
    # Apply filters
    if report_type:
        query = query.filter(TransparencyReport.report_type == report_type)
    if school_id:
        query = query.filter(TransparencyReport.school_id == school_id)
    if promotional_company_id:
        query = query.filter(TransparencyReport.promotional_company_id == promotional_company_id)
    
    # Filter by date range
    start_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(TransparencyReport.period_start >= start_date)
    
    reports = query.order_by(TransparencyReport.generated_at.desc()).all()
    return reports


@router.post("/transparency/reports/generate")
async def generate_transparency_report(
    report_type: str,
    school_id: Optional[int] = None,
    promotional_company_id: Optional[int] = None,
    period_days: int = 30,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new transparency report."""
    try:
        # Generate unique report ID
        report_id = f"TR_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Calculate period
        period_end = datetime.utcnow()
        period_start = period_end - timedelta(days=period_days)
        
        # Create report record
        report = TransparencyReport(
            report_id=report_id,
            report_type=report_type,
            school_id=school_id,
            promotional_company_id=promotional_company_id,
            period_start=period_start,
            period_end=period_end,
            generated_by=current_user.id
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Generate report data in background
        if background_tasks:
            background_tasks.add_task(
                generate_report_data,
                report.id,
                db
            )
        
        logger.info(
            "Transparency report generation started",
            report_id=report.report_id,
            report_type=report_type,
            generated_by=current_user.id
        )
        
        return {
            "message": "Transparency report generation started",
            "report_id": report.report_id,
            "status": "generating"
        }
        
    except Exception as e:
        logger.error(f"Transparency report generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
        )


async def generate_report_data(report_id: int, db: Session):
    """Generate transparency report data in background."""
    try:
        report = db.query(TransparencyReport).filter(TransparencyReport.id == report_id).first()
        if not report:
            return
        
        # In a real implementation, this would calculate actual data from orders, payments, etc.
        # For now, we'll simulate the data
        
        report.total_orders = 150
        report.total_revenue = 45000.00
        report.total_profits = 9000.00
        report.average_order_value = 300.00
        report.customer_satisfaction = 4.7
        report.fulfillment_rate = 94.2
        report.on_time_delivery = 96.8
        report.return_rate = 2.1
        
        # Add breakdown data
        report.revenue_breakdown = json.dumps({
            "football": 18000,
            "basketball": 12000,
            "soccer": 8000,
            "baseball": 7000
        })
        
        report.profit_breakdown = json.dumps({
            "football": 3600,
            "basketball": 2400,
            "soccer": 1600,
            "baseball": 1400
        })
        
        db.commit()
        
        logger.info(f"Transparency report data generated for report {report.report_id}")
        
    except Exception as e:
        logger.error(f"Error generating report data: {e}")


@router.get("/templates", response_model=List[dict])
async def get_agreement_templates(
    agreement_type: Optional[AgreementType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available agreement templates."""
    query = db.query(AgreementTemplate).filter(AgreementTemplate.is_active == True)
    
    if agreement_type:
        query = query.filter(AgreementTemplate.agreement_type == agreement_type)
    
    templates = query.all()
    
    return [
        {
            "id": template.id,
            "name": template.name,
            "agreement_type": template.agreement_type,
            "description": template.description,
            "title_template": template.title_template,
            "terms_template": template.terms_template,
            "default_commission_rate": float(template.default_commission_rate) if template.default_commission_rate else None,
            "default_revenue_share_rate": float(template.default_revenue_share_rate) if template.default_revenue_share_rate else None,
            "default_payment_terms": template.default_payment_terms,
            "default_duration_days": template.default_duration_days,
            "version": template.version,
            "usage_count": template.usage_count
        }
        for template in templates
    ]


@router.get("/stats/summary", response_model=dict)
async def get_agreement_stats(
    days: int = 30,
    school_id: Optional[int] = None,
    promotional_company_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get agreement statistics summary."""
    from sqlalchemy import func
    
    # Base query
    query = db.query(Agreement).filter(Agreement.created_at >= datetime.utcnow() - timedelta(days=days))
    
    # Apply filters
    if school_id:
        query = query.filter(Agreement.school_id == school_id)
    if promotional_company_id:
        query = query.filter(Agreement.promotional_company_id == promotional_company_id)
    
    # Calculate statistics
    total_agreements = query.count()
    active_agreements = query.filter(Agreement.status == AgreementStatus.ACTIVE).count()
    pending_agreements = query.filter(Agreement.status == AgreementStatus.PENDING_APPROVAL).count()
    
    # Agreement type breakdown
    type_breakdown = db.query(
        Agreement.agreement_type,
        func.count(Agreement.id)
    ).filter(
        Agreement.created_at >= datetime.utcnow() - timedelta(days=days)
    ).group_by(Agreement.agreement_type).all()
    
    return {
        "period_days": days,
        "total_agreements": total_agreements,
        "active_agreements": active_agreements,
        "pending_agreements": pending_agreements,
        "agreement_types": [
            {
                "type": item[0],
                "count": item[1]
            }
            for item in type_breakdown
        ]
    }
