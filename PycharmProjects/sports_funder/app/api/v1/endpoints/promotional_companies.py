from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.core.database import get_db
from app.models.product_import import PromotionalCompany, ProductTemplate, ProductImage, SchoolProduct
from app.models.organization import School
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.get("/companies", response_model=List[dict])
def get_promotional_companies(db: Session = Depends(get_db)):
    """Get all promotional companies."""
    companies = db.query(PromotionalCompany).filter(PromotionalCompany.is_active == True).all()
    
    return [
        {
            "id": company.id,
            "name": company.name,
            "contact_name": company.contact_name,
            "contact_email": company.contact_email,
            "contact_phone": company.contact_phone,
            "website": company.website,
            "can_update_images": company.can_update_images,
            "can_update_prices": company.can_update_prices,
            "can_update_descriptions": company.can_update_descriptions,
            "can_add_products": company.can_add_products,
            "access_all_schools": company.access_all_schools,
            "allowed_schools": company.allowed_schools,
            "created_at": company.created_at
        }
        for company in companies
    ]


@router.post("/companies", response_model=dict)
def create_promotional_company(
    name: str = Form(...),
    contact_name: str = Form(None),
    contact_email: str = Form(None),
    contact_phone: str = Form(None),
    website: str = Form(None),
    api_endpoint: str = Form(None),
    api_key: str = Form(None),
    can_update_images: bool = Form(True),
    can_update_prices: bool = Form(False),
    can_update_descriptions: bool = Form(True),
    can_add_products: bool = Form(True),
    access_all_schools: bool = Form(False),
    allowed_schools: str = Form(None),  # JSON string of school IDs
    db: Session = Depends(get_db)
):
    """Create a new promotional company."""
    try:
        # Parse allowed schools if provided
        allowed_schools_list = None
        if allowed_schools:
            allowed_schools_list = json.loads(allowed_schools)
        
        company = PromotionalCompany(
            name=name,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            website=website,
            api_endpoint=api_endpoint,
            api_key=api_key,
            can_update_images=can_update_images,
            can_update_prices=can_update_prices,
            can_update_descriptions=can_update_descriptions,
            can_add_products=can_add_products,
            access_all_schools=access_all_schools,
            allowed_schools=allowed_schools_list
        )
        
        db.add(company)
        db.commit()
        db.refresh(company)
        
        return {
            "id": company.id,
            "name": company.name,
            "contact_name": company.contact_name,
            "contact_email": company.contact_email,
            "created_at": company.created_at
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating promotional company: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/companies/{company_id}", response_model=dict)
def get_promotional_company(company_id: int, db: Session = Depends(get_db)):
    """Get a specific promotional company."""
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    return {
        "id": company.id,
        "name": company.name,
        "contact_name": company.contact_name,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "website": company.website,
        "api_endpoint": company.api_endpoint,
        "can_update_images": company.can_update_images,
        "can_update_prices": company.can_update_prices,
        "can_update_descriptions": company.can_update_descriptions,
        "can_add_products": company.can_add_products,
        "access_all_schools": company.access_all_schools,
        "allowed_schools": company.allowed_schools,
        "is_active": company.is_active,
        "created_at": company.created_at,
        "updated_at": company.updated_at
    }


@router.get("/companies/{company_id}/products", response_model=List[dict])
def get_company_products(company_id: int, db: Session = Depends(get_db)):
    """Get all products managed by a promotional company."""
    products = db.query(ProductTemplate).filter(
        ProductTemplate.promotional_company_id == company_id,
        ProductTemplate.is_active == True
    ).all()
    
    return [
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "category": product.category,
            "base_price": float(product.base_price) if product.base_price else None,
            "image_url": product.image_url,
            "auto_update_enabled": product.auto_update_enabled,
            "last_updated_by_company": product.last_updated_by_company,
            "created_at": product.created_at
        }
        for product in products
    ]


@router.get("/companies/{company_id}/schools", response_model=List[dict])
def get_company_accessible_schools(company_id: int, db: Session = Depends(get_db)):
    """Get schools that a promotional company can access."""
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    if company.access_all_schools:
        # Get all schools
        schools = db.query(School).all()
    else:
        # Get only allowed schools
        if not company.allowed_schools:
            schools = []
        else:
            schools = db.query(School).filter(School.id.in_(company.allowed_schools)).all()
    
    return [
        {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "school_colors": school.school_colors,
            "mascot": school.mascot
        }
        for school in schools
    ]


@router.get("/companies/{company_id}/schools/{school_id}/products", response_model=List[dict])
def get_company_products_for_school(
    company_id: int, 
    school_id: int, 
    db: Session = Depends(get_db)
):
    """Get products that a promotional company manages for a specific school."""
    # Verify company has access to this school
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    if not company.access_all_schools and (not company.allowed_schools or school_id not in company.allowed_schools):
        raise HTTPException(status_code=403, detail="Company does not have access to this school")
    
    # Get school products that use this company's templates
    school_products = db.query(SchoolProduct).join(ProductTemplate).filter(
        SchoolProduct.school_id == school_id,
        ProductTemplate.promotional_company_id == company_id,
        SchoolProduct.is_active == True
    ).all()
    
    return [
        {
            "id": sp.id,
            "template_id": sp.template_id,
            "template_name": sp.template.name,
            "custom_name": sp.custom_name,
            "custom_description": sp.custom_description,
            "selling_price": float(sp.selling_price),
            "template": {
                "id": sp.template.id,
                "name": sp.template.name,
                "description": sp.template.description,
                "category": sp.template.category,
                "base_price": float(sp.template.base_price) if sp.template.base_price else None,
                "image_url": sp.template.image_url,
                "auto_update_enabled": sp.template.auto_update_enabled
            }
        }
        for sp in school_products
    ]


@router.post("/companies/{company_id}/products/{product_id}/images", response_model=dict)
def upload_product_image(
    company_id: int,
    product_id: int,
    image_url: str = Form(...),
    alt_text: str = Form(None),
    is_primary: bool = Form(False),
    school_id: int = Form(None),  # If updating for specific school
    db: Session = Depends(get_db)
):
    """Upload/update product image for a promotional company."""
    # Verify company exists and has permission
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    if not company.can_update_images:
        raise HTTPException(status_code=403, detail="Company does not have permission to update images")
    
    # Verify product exists and belongs to company
    product = db.query(ProductTemplate).filter(
        ProductTemplate.id == product_id,
        ProductTemplate.promotional_company_id == company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not managed by this company")
    
    # If updating for specific school, verify access
    if school_id:
        if not company.access_all_schools and (not company.allowed_schools or school_id not in company.allowed_schools):
            raise HTTPException(status_code=403, detail="Company does not have access to this school")
    
    # Create new image record
    product_image = ProductImage(
        template_id=product_id,
        school_id=school_id,
        image_url=image_url,
        image_type="company_update",
        alt_text=alt_text,
        uploaded_by_company_id=company_id,
        is_primary=is_primary
    )
    
    # If this is set as primary, unset other primary images
    if is_primary:
        db.query(ProductImage).filter(
            ProductImage.template_id == product_id,
            ProductImage.school_id == school_id,
            ProductImage.is_primary == True
        ).update({"is_primary": False})
    
    db.add(product_image)
    
    # Update product's last updated timestamp
    product.last_updated_by_company = datetime.utcnow()
    
    db.commit()
    db.refresh(product_image)
    
    return {
        "id": product_image.id,
        "image_url": product_image.image_url,
        "alt_text": product_image.alt_text,
        "is_primary": product_image.is_primary,
        "image_type": product_image.image_type,
        "created_at": product_image.created_at
    }


@router.put("/companies/{company_id}/products/{product_id}", response_model=dict)
def update_product_details(
    company_id: int,
    product_id: int,
    name: str = Form(None),
    description: str = Form(None),
    base_price: float = Form(None),
    db: Session = Depends(get_db)
):
    """Update product details for a promotional company."""
    # Verify company exists and has permission
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    # Verify product exists and belongs to company
    product = db.query(ProductTemplate).filter(
        ProductTemplate.id == product_id,
        ProductTemplate.promotional_company_id == company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not managed by this company")
    
    # Update fields based on permissions
    if name and company.can_update_descriptions:
        product.name = name
    
    if description and company.can_update_descriptions:
        product.description = description
    
    if base_price is not None and company.can_update_prices:
        product.base_price = base_price
    
    # Update timestamp
    product.last_updated_by_company = datetime.utcnow()
    
    db.commit()
    db.refresh(product)
    
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "base_price": float(product.base_price) if product.base_price else None,
        "last_updated_by_company": product.last_updated_by_company
    }


@router.get("/companies/{company_id}/dashboard", response_model=dict)
def get_company_dashboard(company_id: int, db: Session = Depends(get_db)):
    """Get dashboard data for a promotional company."""
    company = db.query(PromotionalCompany).filter(PromotionalCompany.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Promotional company not found")
    
    # Get stats
    total_products = db.query(ProductTemplate).filter(
        ProductTemplate.promotional_company_id == company_id,
        ProductTemplate.is_active == True
    ).count()
    
    total_schools = 0
    if company.access_all_schools:
        total_schools = db.query(School).count()
    elif company.allowed_schools:
        total_schools = len(company.allowed_schools)
    
    # Get recent activity
    recent_updates = db.query(ProductTemplate).filter(
        ProductTemplate.promotional_company_id == company_id,
        ProductTemplate.last_updated_by_company.isnot(None)
    ).order_by(ProductTemplate.last_updated_by_company.desc()).limit(5).all()
    
    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "contact_name": company.contact_name,
            "contact_email": company.contact_email
        },
        "stats": {
            "total_products": total_products,
            "total_schools": total_schools,
            "can_update_images": company.can_update_images,
            "can_update_prices": company.can_update_prices,
            "can_update_descriptions": company.can_update_descriptions,
            "can_add_products": company.can_add_products
        },
        "recent_updates": [
            {
                "product_id": product.id,
                "product_name": product.name,
                "updated_at": product.last_updated_by_company
            }
            for product in recent_updates
        ]
    }
