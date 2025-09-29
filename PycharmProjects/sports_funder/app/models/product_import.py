from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class ProductImportSource(Base):
    """Represents external product import sources (APIs, CSV files, etc.)"""
    __tablename__ = "product_import_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # e.g., "CustomInk API", "Local CSV"
    source_type = Column(String(50), nullable=False)  # "api", "csv", "manual"
    api_endpoint = Column(String(500), nullable=True)
    api_key = Column(String(500), nullable=True)
    api_secret = Column(String(500), nullable=True)
    field_mapping = Column(JSON, nullable=True)  # Maps external fields to our fields
    import_settings = Column(JSON, nullable=True)  # Import frequency, filters, etc.
    is_active = Column(Boolean, default=True)
    last_import_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    imports = relationship("ProductImport", back_populates="source")


class ProductImport(Base):
    """Tracks individual product import sessions"""
    __tablename__ = "product_imports"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("product_import_sources.id"), nullable=False)
    import_type = Column(String(50), nullable=False)  # "full", "incremental", "manual"
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed
    total_products = Column(Integer, default=0)
    imported_products = Column(Integer, default=0)
    failed_products = Column(Integer, default=0)
    import_log = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    source = relationship("ProductImportSource", back_populates="imports")
    imported_products_rel = relationship("ImportedProduct", back_populates="import_session")


class ImportedProduct(Base):
    """Individual products imported from external sources"""
    __tablename__ = "imported_products"
    
    id = Column(Integer, primary_key=True, index=True)
    import_id = Column(Integer, ForeignKey("product_imports.id"), nullable=False)
    external_id = Column(String(255), nullable=False)  # ID from external source
    external_data = Column(JSON, nullable=True)  # Raw data from external source
    mapped_data = Column(JSON, nullable=True)  # Data mapped to our schema
    status = Column(String(50), nullable=False, default="pending")  # pending, mapped, imported, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    import_session = relationship("ProductImport", back_populates="imported_products_rel")


class ProductTemplate(Base):
    """Template for products that schools can select from"""
    __tablename__ = "product_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    base_price = Column(Numeric(10, 2), nullable=True)
    cost_price = Column(Numeric(10, 2), nullable=True)
    sku_template = Column(String(100), nullable=True)  # Template for generating SKUs
    image_url = Column(String(500), nullable=True)
    customization_options = Column(JSON, nullable=True)  # Available customizations
    size_options = Column(JSON, nullable=True)  # Available sizes
    color_options = Column(JSON, nullable=True)  # Available colors
    print_locations = Column(JSON, nullable=True)  # Where logos/text can be printed
    
    # Promotional company management
    promotional_company_id = Column(Integer, ForeignKey("promotional_companies.id"), nullable=True)
    auto_update_enabled = Column(Boolean, default=True)  # Allow promotional company to auto-update
    last_updated_by_company = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    school_products = relationship("SchoolProduct", back_populates="template")
    # promotional_company = relationship("PromotionalCompany", back_populates="products")  # Commented out to avoid import issues
    # product_images = relationship("ProductImage", back_populates="template", cascade="all, delete-orphan")  # Commented out to avoid import issues


# PromotionalCompany model moved to commerce.py to avoid duplication


# ProductImage model moved to commerce.py to avoid duplication


class SchoolProduct(Base):
    """Products selected by schools from templates"""
    __tablename__ = "school_products"
    
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("product_templates.id"), nullable=False)
    custom_name = Column(String(255), nullable=True)  # School's custom name for the product
    custom_description = Column(Text, nullable=True)  # School's custom description
    selling_price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    school = relationship("School", back_populates="products")
    template = relationship("ProductTemplate", back_populates="school_products")
    # Note: orders relationship removed to fix foreign key constraint


class ProductFieldMapping(Base):
    """Maps external product fields to our internal schema"""
    __tablename__ = "product_field_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("product_import_sources.id"), nullable=False)
    external_field = Column(String(255), nullable=False)  # Field name from external source
    internal_field = Column(String(255), nullable=False)  # Our field name
    field_type = Column(String(50), nullable=False)  # text, number, boolean, json, etc.
    transformation_rule = Column(Text, nullable=True)  # How to transform the data
    is_required = Column(Boolean, default=False)
    default_value = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    source = relationship("ProductImportSource")
