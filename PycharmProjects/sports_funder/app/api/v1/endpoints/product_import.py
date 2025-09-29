from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import requests
from datetime import datetime

from app.core.database import get_db
from app.models.product_import import (
    ProductImportSource, ProductImport, ImportedProduct, 
    ProductTemplate, SchoolProduct, ProductFieldMapping
)
from app.models.organization import School
from app.models.commerce import Product
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.get("/sources", response_model=List[dict])
def get_import_sources(db: Session = Depends(get_db)):
    """Get all product import sources."""
    sources = db.query(ProductImportSource).all()
    return [
        {
            "id": source.id,
            "name": source.name,
            "source_type": source.source_type,
            "api_endpoint": source.api_endpoint,
            "is_active": source.is_active,
            "last_import_at": source.last_import_at,
            "created_at": source.created_at
        }
        for source in sources
    ]


@router.post("/sources", response_model=dict)
def create_import_source(
    name: str = Form(...),
    source_type: str = Form(...),
    api_endpoint: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    api_secret: Optional[str] = Form(None),
    field_mapping: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Create a new product import source."""
    try:
        # Parse field mapping if provided
        mapping_data = None
        if field_mapping:
            mapping_data = json.loads(field_mapping)
        
        source = ProductImportSource(
            name=name,
            source_type=source_type,
            api_endpoint=api_endpoint,
            api_key=api_key,
            api_secret=api_secret,
            field_mapping=mapping_data,
            is_active=True
        )
        
        db.add(source)
        db.commit()
        db.refresh(source)
        
        return {
            "id": source.id,
            "name": source.name,
            "source_type": source.source_type,
            "api_endpoint": source.api_endpoint,
            "is_active": source.is_active,
            "created_at": source.created_at
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating import source: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sources/{source_id}/field-mappings", response_model=List[dict])
def get_field_mappings(source_id: int, db: Session = Depends(get_db)):
    """Get field mappings for a specific import source."""
    mappings = db.query(ProductFieldMapping).filter(
        ProductFieldMapping.source_id == source_id
    ).all()
    
    return [
        {
            "id": mapping.id,
            "external_field": mapping.external_field,
            "internal_field": mapping.internal_field,
            "field_type": mapping.field_type,
            "transformation_rule": mapping.transformation_rule,
            "is_required": mapping.is_required,
            "default_value": mapping.default_value
        }
        for mapping in mappings
    ]


@router.post("/sources/{source_id}/field-mappings", response_model=dict)
def create_field_mapping(
    source_id: int,
    external_field: str = Form(...),
    internal_field: str = Form(...),
    field_type: str = Form(...),
    transformation_rule: Optional[str] = Form(None),
    is_required: bool = Form(False),
    default_value: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Create a new field mapping for an import source."""
    # Verify source exists
    source = db.query(ProductImportSource).filter(ProductImportSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Import source not found")
    
    mapping = ProductFieldMapping(
        source_id=source_id,
        external_field=external_field,
        internal_field=internal_field,
        field_type=field_type,
        transformation_rule=transformation_rule,
        is_required=is_required,
        default_value=default_value
    )
    
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    
    return {
        "id": mapping.id,
        "external_field": mapping.external_field,
        "internal_field": mapping.internal_field,
        "field_type": mapping.field_type,
        "transformation_rule": mapping.transformation_rule,
        "is_required": mapping.is_required,
        "default_value": mapping.default_value
    }


@router.post("/sources/{source_id}/import", response_model=dict)
def start_product_import(source_id: int, db: Session = Depends(get_db)):
    """Start importing products from a source."""
    source = db.query(ProductImportSource).filter(ProductImportSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Import source not found")
    
    if not source.is_active:
        raise HTTPException(status_code=400, detail="Import source is not active")
    
    # Create import session
    import_session = ProductImport(
        source_id=source_id,
        import_type="manual",
        status="running",
        started_at=datetime.utcnow()
    )
    
    db.add(import_session)
    db.commit()
    db.refresh(import_session)
    
    # Start the import process (this would be async in production)
    try:
        if source.source_type == "api":
            _import_from_api(source, import_session, db)
        elif source.source_type == "csv":
            # CSV import would be handled separately
            pass
        
        import_session.status = "completed"
        import_session.completed_at = datetime.utcnow()
        db.commit()
        
        return {
            "import_id": import_session.id,
            "status": import_session.status,
            "total_products": import_session.total_products,
            "imported_products": import_session.imported_products,
            "failed_products": import_session.failed_products
        }
        
    except Exception as e:
        import_session.status = "failed"
        import_session.import_log = str(e)
        db.commit()
        logger.error(f"Import failed: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


def _import_from_api(source: ProductImportSource, import_session: ProductImport, db: Session):
    """Import products from an API source."""
    try:
        # Make API request
        headers = {}
        if source.api_key:
            headers["Authorization"] = f"Bearer {source.api_key}"
        
        response = requests.get(source.api_endpoint, headers=headers, timeout=30)
        response.raise_for_status()
        
        api_data = response.json()
        products_data = api_data.get("products", []) if isinstance(api_data, dict) else api_data
        
        import_session.total_products = len(products_data)
        
        # Get field mappings
        mappings = db.query(ProductFieldMapping).filter(
            ProductFieldMapping.source_id == source.id
        ).all()
        
        mapping_dict = {m.external_field: m for m in mappings}
        
        for product_data in products_data:
            try:
                # Create imported product record
                imported_product = ImportedProduct(
                    import_id=import_session.id,
                    external_id=str(product_data.get("id", "")),
                    external_data=product_data,
                    status="pending"
                )
                db.add(imported_product)
                db.flush()
                
                # Map fields
                mapped_data = {}
                for external_field, value in product_data.items():
                    if external_field in mapping_dict:
                        mapping = mapping_dict[external_field]
                        # Apply transformation if needed
                        if mapping.transformation_rule:
                            # Simple transformation logic (can be expanded)
                            if mapping.transformation_rule == "uppercase":
                                value = str(value).upper()
                            elif mapping.transformation_rule == "lowercase":
                                value = str(value).lower()
                        
                        mapped_data[mapping.internal_field] = value
                
                imported_product.mapped_data = mapped_data
                imported_product.status = "mapped"
                
                # Create product template if it doesn't exist
                product_name = mapped_data.get("name", f"Imported Product {imported_product.external_id}")
                existing_template = db.query(ProductTemplate).filter(
                    ProductTemplate.name == product_name
                ).first()
                
                if not existing_template:
                    template = ProductTemplate(
                        name=product_name,
                        description=mapped_data.get("description", ""),
                        category=mapped_data.get("category", "Imported"),
                        base_price=float(mapped_data.get("price", 0)) if mapped_data.get("price") else None,
                        image_url=mapped_data.get("image_url"),
                        customization_options=mapped_data.get("customization_options"),
                        size_options=mapped_data.get("size_options"),
                        color_options=mapped_data.get("color_options")
                    )
                    db.add(template)
                    db.flush()
                
                import_session.imported_products += 1
                
            except Exception as e:
                logger.error(f"Error processing product {product_data.get('id', 'unknown')}: {e}")
                import_session.failed_products += 1
                if 'imported_product' in locals():
                    imported_product.status = "failed"
                    imported_product.error_message = str(e)
        
        db.commit()
        
    except Exception as e:
        logger.error(f"API import error: {e}")
        raise


@router.get("/templates", response_model=List[dict])
def get_product_templates(db: Session = Depends(get_db)):
    """Get all product templates."""
    templates = db.query(ProductTemplate).filter(ProductTemplate.is_active == True).all()
    
    return [
        {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "category": template.category,
            "base_price": float(template.base_price) if template.base_price else None,
            "image_url": template.image_url,
            "customization_options": template.customization_options,
            "size_options": template.size_options,
            "color_options": template.color_options,
            "created_at": template.created_at
        }
        for template in templates
    ]


@router.get("/schools/{school_id}/products", response_model=List[dict])
def get_school_products(school_id: int, db: Session = Depends(get_db)):
    """Get products selected by a specific school."""
    school_products = db.query(SchoolProduct).filter(
        SchoolProduct.school_id == school_id,
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
                "name": sp.template.name,
                "description": sp.template.description,
                "category": sp.template.category,
                "base_price": float(sp.template.base_price) if sp.template.base_price else None,
                "image_url": sp.template.image_url,
                "customization_options": sp.template.customization_options,
                "size_options": sp.template.size_options,
                "color_options": sp.template.color_options
            }
        }
        for sp in school_products
    ]


@router.post("/schools/{school_id}/products", response_model=dict)
def add_school_product(
    school_id: int,
    template_id: int = Form(...),
    custom_name: Optional[str] = Form(None),
    custom_description: Optional[str] = Form(None),
    selling_price: float = Form(...),
    db: Session = Depends(get_db)
):
    """Add a product template to a school's store."""
    # Verify school exists
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Verify template exists
    template = db.query(ProductTemplate).filter(ProductTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Product template not found")
    
    # Check if school already has this product
    existing = db.query(SchoolProduct).filter(
        SchoolProduct.school_id == school_id,
        SchoolProduct.template_id == template_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="School already has this product")
    
    school_product = SchoolProduct(
        school_id=school_id,
        template_id=template_id,
        custom_name=custom_name,
        custom_description=custom_description,
        selling_price=selling_price,
        is_active=True
    )
    
    db.add(school_product)
    db.commit()
    db.refresh(school_product)
    
    return {
        "id": school_product.id,
        "school_id": school_product.school_id,
        "template_id": school_product.template_id,
        "custom_name": school_product.custom_name,
        "custom_description": school_product.custom_description,
        "selling_price": float(school_product.selling_price),
        "is_active": school_product.is_active
    }


@router.get("/imports", response_model=List[dict])
def get_import_history(db: Session = Depends(get_db)):
    """Get import history."""
    imports = db.query(ProductImport).order_by(ProductImport.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": imp.id,
            "source_name": imp.source.name,
            "import_type": imp.import_type,
            "status": imp.status,
            "total_products": imp.total_products,
            "imported_products": imp.imported_products,
            "failed_products": imp.failed_products,
            "started_at": imp.started_at,
            "completed_at": imp.completed_at,
            "created_at": imp.created_at
        }
        for imp in imports
    ]
