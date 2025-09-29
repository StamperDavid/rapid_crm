"""
API Keys management endpoints for secure key administration.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.api_keys import ApiKey, ApiKeyType, ApiKeyStatus
from app.services.api_key_service import api_key_service

router = APIRouter()


# Pydantic schemas
class ApiKeyCreate(BaseModel):
    """Schema for creating a new API key."""
    name: str = Field(..., min_length=1, max_length=200, description="Name for the API key")
    key_type: ApiKeyType = Field(..., description="Type of API key")
    api_key: str = Field(..., min_length=1, description="The actual API key value")
    description: Optional[str] = Field(None, description="Description of the API key")
    expires_at: Optional[datetime] = Field(None, description="Expiration date (optional)")
    environment: str = Field("production", description="Environment (production, staging, development)")
    notes: Optional[str] = Field(None, description="Additional notes")


class ApiKeyResponse(BaseModel):
    """Schema for API key response (without the actual key value)."""
    id: int
    name: str
    key_type: ApiKeyType
    description: Optional[str]
    status: ApiKeyStatus
    is_primary: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: str
    error_count: str
    environment: str
    created_by: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_expired: bool
    is_active: bool
    
    class Config:
        from_attributes = True


class ApiKeyRotate(BaseModel):
    """Schema for rotating an API key."""
    new_api_key: str = Field(..., min_length=1, description="New API key value")
    deactivate_old: bool = Field(True, description="Whether to deactivate the old key")


class ApiKeyTestResponse(BaseModel):
    """Schema for API key test response."""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None


@router.get("/", response_model=List[ApiKeyResponse])
async def get_api_keys(
    key_type: Optional[ApiKeyType] = Query(None, description="Filter by API key type"),
    environment: Optional[str] = Query(None, description="Filter by environment"),
    status: Optional[ApiKeyStatus] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ApiKeyResponse]:
    """Get all API keys with optional filtering."""
    # In a real app, you'd check if user has admin permissions
    query = db.query(ApiKey)
    
    if key_type:
        query = query.filter(ApiKey.key_type == key_type)
    if environment:
        query = query.filter(ApiKey.environment == environment)
    if status:
        query = query.filter(ApiKey.status == status)
    
    api_keys = query.order_by(ApiKey.created_at.desc()).all()
    return [ApiKeyResponse.from_orm(key) for key in api_keys]


@router.get("/{key_id}", response_model=ApiKeyResponse)
async def get_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ApiKeyResponse:
    """Get a specific API key by ID."""
    api_key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return ApiKeyResponse.from_orm(api_key)


@router.post("/", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ApiKeyResponse:
    """Create a new API key."""
    try:
        api_key = api_key_service.create_api_key(
            db=db,
            name=api_key_data.name,
            key_type=api_key_data.key_type,
            api_key=api_key_data.api_key,
            description=api_key_data.description,
            expires_at=api_key_data.expires_at,
            environment=api_key_data.environment,
            created_by=current_user.email,
            notes=api_key_data.notes
        )
        
        return ApiKeyResponse.from_orm(api_key)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create API key: {str(e)}"
        )


@router.put("/{key_id}/rotate", response_model=ApiKeyResponse)
async def rotate_api_key(
    key_id: int,
    rotate_data: ApiKeyRotate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ApiKeyResponse:
    """Rotate an API key to a new value."""
    try:
        new_api_key = api_key_service.rotate_api_key(
            db=db,
            key_id=key_id,
            new_api_key=rotate_data.new_api_key,
            deactivate_old=rotate_data.deactivate_old
        )
        
        return ApiKeyResponse.from_orm(new_api_key)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to rotate API key: {str(e)}"
        )


@router.put("/{key_id}/revoke", response_model=Dict[str, str])
async def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Revoke an API key."""
    success = api_key_service.revoke_api_key(db=db, key_id=key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return {"message": "API key revoked successfully"}


@router.post("/{key_id}/test", response_model=ApiKeyTestResponse)
async def test_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ApiKeyTestResponse:
    """Test an API key to verify it's working."""
    result = api_key_service.test_api_key(db=db, key_id=key_id)
    
    return ApiKeyTestResponse(
        success=result["success"],
        message=result.get("message"),
        error=result.get("error")
    )


@router.get("/active/{key_type}", response_model=Dict[str, Any])
async def get_active_key(
    key_type: ApiKeyType,
    environment: str = Query("production", description="Environment"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get the active API key for a specific type (for internal use)."""
    # This endpoint is for internal use by the application
    # In production, you might want to restrict access further
    
    api_key = api_key_service.get_active_key(
        db=db,
        key_type=key_type,
        environment=environment
    )
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active API key found for {key_type.value} in {environment}"
        )
    
    return {
        "key_type": key_type.value,
        "environment": environment,
        "has_key": True,
        "key_length": len(api_key)
    }


@router.get("/types/available", response_model=List[Dict[str, str]])
async def get_available_key_types() -> List[Dict[str, str]]:
    """Get all available API key types."""
    return [
        {"value": key_type.value, "label": key_type.value.replace("_", " ").title()}
        for key_type in ApiKeyType
    ]


@router.get("/stats/summary", response_model=Dict[str, Any])
async def get_api_keys_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get summary statistics for API keys."""
    total_keys = db.query(ApiKey).count()
    active_keys = db.query(ApiKey).filter(ApiKey.status == ApiKeyStatus.ACTIVE).count()
    expired_keys = db.query(ApiKey).filter(ApiKey.status == ApiKeyStatus.EXPIRED).count()
    revoked_keys = db.query(ApiKey).filter(ApiKey.status == ApiKeyStatus.REVOKED).count()
    
    # Count by type
    type_counts = {}
    for key_type in ApiKeyType:
        count = db.query(ApiKey).filter(ApiKey.key_type == key_type).count()
        type_counts[key_type.value] = count
    
    return {
        "total_keys": total_keys,
        "active_keys": active_keys,
        "expired_keys": expired_keys,
        "revoked_keys": revoked_keys,
        "by_type": type_counts
    }
