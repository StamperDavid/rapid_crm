"""
School management endpoints.
"""
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.organization import School
from app.api.v1.endpoints.auth import get_current_user
# from app.services.qr_service import QRCodeService  # Temporarily disabled
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_school(
    name: str,
    address: str = None,
    city: str = None,
    state: str = None,
    zip_code: str = None,
    phone: str = None,
    email: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new school."""
    # Check if school already exists
    existing_school = db.query(School).filter(School.name == name).first()
    if existing_school:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School with this name already exists"
        )
    
    # Create new school
    school = School(
        name=name,
        address=address,
        city=city,
        state=state,
        zip_code=zip_code,
        phone=phone,
        email=email,
        sales_agent_id=str(current_user.id),
        qr_code_data="pending"
    )
    
    db.add(school)
    db.commit()
    db.refresh(school)
    
    # Generate QR code
    qr_data = QRCodeService.create_school_qr_code(school)
    school.qr_code_data = qr_data
    db.commit()
    
    logger.info("School created", school_id=school.id, school_name=name)
    
    return {
        "id": school.id,
        "name": school.name,
        "qr_code_url": qr_data,
        "message": "School created successfully"
    }


@router.get("/", response_model=List[dict])
async def list_schools(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """List all schools."""
    schools = db.query(School).offset(skip).limit(limit).all()
    
    return [
        {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "coaches_count": len(school.coaches)
        }
        for school in schools
    ]


@router.get("/{school_id}")
async def get_school(
    school_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get school details."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    
    return {
        "id": school.id,
        "name": school.name,
        "address": school.address,
        "city": school.city,
        "state": school.state,
        "zip_code": school.zip_code,
        "phone": school.phone,
        "email": school.email,
        "qr_code_url": school.qr_code_data,
        "coaches": [
            {
                "id": coach.id,
                "name": f"{coach.first_name} {coach.last_name}",
                "sport": coach.sport,
                "position": coach.position
            }
            for coach in school.coaches
        ],
        "created_at": school.created_at
    }


@router.get("/{school_id}/qr-code")
async def get_school_qr_code(
    school_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """Get school QR code image."""
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    
    qr_image = QRCodeService.get_qr_code_image(school.qr_code_data)
    
    from fastapi.responses import Response
    return Response(content=qr_image.read(), media_type="image/png")



