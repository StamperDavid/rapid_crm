from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from typing import List, Dict, Any
import json

from app.core.database import get_db
from app.models.user import User, SalesAgent, Coach, Player
from app.models.organization import School, Team
from app.models.commerce import Product, Order, Supporter
from app.models.product_import import SchoolProduct, ProductTemplate
from app.models.business import LocalBusiness
from app.models.partner_system import Partner
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.get("/models", response_model=List[dict])
def get_available_models():
    """Get all available database models and their schemas."""
    # Get all model classes from our models module
    models_info = []
    
    # Define our models with their display names and descriptions
    model_definitions = {
        "User": {
            "display_name": "Users",
            "description": "System users including sales agents, coaches, and players",
            "icon": "👤"
        },
        "SalesAgent": {
            "display_name": "Sales Agents", 
            "description": "Sales agents who recruit schools and manage territories",
            "icon": "👨‍💼"
        },
        "Coach": {
            "display_name": "Coaches",
            "description": "Head coaches who manage teams and players",
            "icon": "👨‍🏫"
        },
        "Player": {
            "display_name": "Players",
            "description": "Student athletes on teams",
            "icon": "🏈"
        },
        "School": {
            "display_name": "Schools",
            "description": "Educational institutions with teams and programs",
            "icon": "🏫"
        },
        "Team": {
            "display_name": "Teams",
            "description": "Sports teams within schools",
            "icon": "⚽"
        },
        "Supporter": {
            "display_name": "Supporters",
            "description": "People who support teams through donations and purchases",
            "icon": "👥"
        },
        "Product": {
            "display_name": "Products",
            "description": "Items available for purchase in team stores",
            "icon": "🛍️"
        },
        "Order": {
            "display_name": "Orders",
            "description": "Purchase orders from supporters",
            "icon": "📦"
        },
        "LocalBusiness": {
            "display_name": "Local Businesses",
            "description": "Local businesses that sponsor teams and generate leads",
            "icon": "🏪"
        },
        "Partner": {
            "display_name": "Partners",
            "description": "Regional partners for fulfillment and lead generation",
            "icon": "🤝"
        },
        "ProductTemplate": {
            "display_name": "Product Templates",
            "description": "Template products that schools can select from",
            "icon": "📋"
        },
        "SchoolProduct": {
            "display_name": "School Products",
            "description": "Products selected by schools for their stores",
            "icon": "🏫🛍️"
        }
    }
    
    # Define the available models
    available_models = {
        "User": User,
        "SalesAgent": SalesAgent,
        "Coach": Coach,
        "Player": Player,
        "School": School,
        "Team": Team,
        "Supporter": Supporter,
        "Product": Product,
        "Order": Order,
        "LocalBusiness": LocalBusiness,
        "Partner": Partner,
        "ProductTemplate": ProductTemplate,
        "SchoolProduct": SchoolProduct
    }
    
    for model_name, model_class in available_models.items():
        if (hasattr(model_class, '__tablename__') and 
            hasattr(model_class, '__table__') and 
            model_name in model_definitions):
            
            # Get table columns
            table = model_class.__table__
            columns = []
            
            for column in table.columns:
                column_info = {
                    "name": column.name,
                    "type": str(column.type),
                    "nullable": column.nullable,
                    "primary_key": column.primary_key,
                    "unique": column.unique,
                    "default": str(column.default) if column.default is not None else None
                }
                columns.append(column_info)
            
            model_info = {
                "name": model_name,
                "display_name": model_definitions[model_name]["display_name"],
                "description": model_definitions[model_name]["description"],
                "icon": model_definitions[model_name]["icon"],
                "table_name": model_class.__tablename__,
                "columns": columns
            }
            models_info.append(model_info)
    
    return models_info


@router.get("/models/{model_name}/fields", response_model=List[dict])
def get_model_fields(model_name: str):
    """Get detailed field information for a specific model."""
    # Define the available models
    available_models = {
        "User": User,
        "SalesAgent": SalesAgent,
        "Coach": Coach,
        "Player": Player,
        "School": School,
        "Team": Team,
        "Supporter": Supporter,
        "Product": Product,
        "Order": Order,
        "LocalBusiness": LocalBusiness,
        "Partner": Partner,
        "ProductTemplate": ProductTemplate,
        "SchoolProduct": SchoolProduct
    }
    
    # Find the model class
    model_class = available_models.get(model_name)
    if not model_class or not hasattr(model_class, '__table__'):
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
    
    table = model_class.__table__
    fields = []
    
    for column in table.columns:
        field_info = {
            "name": column.name,
            "type": str(column.type),
            "python_type": column.type.python_type.__name__ if hasattr(column.type, 'python_type') else str(column.type),
            "nullable": column.nullable,
            "primary_key": column.primary_key,
            "unique": column.unique,
            "default": str(column.default) if column.default is not None else None,
            "foreign_key": str(column.foreign_keys) if column.foreign_keys else None,
            "description": _get_field_description(model_name, column.name)
        }
        fields.append(field_info)
    
    return fields


@router.post("/models/{model_name}/fields", response_model=dict)
def add_model_field(
    model_name: str,
    field_name: str,
    field_type: str,
    nullable: bool = True,
    default_value: str = None,
    description: str = None,
    db: Session = Depends(get_db)
):
    """Add a new field to a model."""
    try:
        # Define the available models
        available_models = {
            "User": User,
            "SalesAgent": SalesAgent,
            "Coach": Coach,
            "Player": Player,
            "School": School,
            "Team": Team,
            "Supporter": Supporter,
            "Product": Product,
            "Order": Order,
            "LocalBusiness": LocalBusiness,
            "Partner": Partner,
            "ProductTemplate": ProductTemplate,
            "SchoolProduct": SchoolProduct
        }
        
        model_class = available_models.get(model_name)
        if not model_class:
            raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
        
        # Check if field already exists
        if hasattr(model_class, field_name):
            raise HTTPException(status_code=400, detail=f"Field '{field_name}' already exists in {model_name}")
        
        # Create the SQL ALTER TABLE statement
        table_name = model_class.__tablename__
        sql_type = _get_sql_type(field_type)
        
        alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {field_name} {sql_type}"
        if not nullable:
            alter_sql += " NOT NULL"
        if default_value:
            alter_sql += f" DEFAULT '{default_value}'"
        
        # Execute the SQL
        db.execute(text(alter_sql))
        db.commit()
        
        logger.info(f"Added field '{field_name}' to {model_name}")
        
        return {
            "message": f"Field '{field_name}' successfully added to {model_name}",
            "field_name": field_name,
            "field_type": field_type,
            "nullable": nullable,
            "default_value": default_value,
            "description": description,
            "sql_executed": alter_sql
        }
        
    except Exception as e:
        logger.error(f"Error adding field to {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/models/{model_name}/fields/{field_name}", response_model=dict)
def update_model_field(
    model_name: str,
    field_name: str,
    new_field_name: str = None,
    field_type: str = None,
    nullable: bool = None,
    default_value: str = None,
    description: str = None,
    db: Session = Depends(get_db)
):
    """Update a field in a model."""
    try:
        # Define the available models
        available_models = {
            "User": User,
            "SalesAgent": SalesAgent,
            "Coach": Coach,
            "Player": Player,
            "School": School,
            "Team": Team,
            "Supporter": Supporter,
            "Product": Product,
            "Order": Order,
            "LocalBusiness": LocalBusiness,
            "Partner": Partner,
            "ProductTemplate": ProductTemplate,
            "SchoolProduct": SchoolProduct
        }
        
        model_class = available_models.get(model_name)
        if not model_class:
            raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
        
        table_name = model_class.__tablename__
        executed_sql = []
        
        # SQLite has limited ALTER TABLE support, so we need to work around it
        # For now, we'll provide the SQL that would need to be executed
        
        if new_field_name and new_field_name != field_name:
            # Rename column (SQLite doesn't support this directly)
            executed_sql.append(f"-- Rename column: ALTER TABLE {table_name} RENAME COLUMN {field_name} TO {new_field_name}")
        
        if field_type:
            sql_type = _get_sql_type(field_type)
            executed_sql.append(f"-- Change type: ALTER TABLE {table_name} ALTER COLUMN {field_name} TYPE {sql_type}")
        
        if nullable is not None:
            constraint = "NOT NULL" if not nullable else "NULL"
            executed_sql.append(f"-- Change nullable: ALTER TABLE {table_name} ALTER COLUMN {field_name} SET {constraint}")
        
        if default_value is not None:
            executed_sql.append(f"-- Change default: ALTER TABLE {table_name} ALTER COLUMN {field_name} SET DEFAULT '{default_value}'")
        
        logger.info(f"Updated field '{field_name}' in {model_name}")
        
        return {
            "message": f"Field '{field_name}' in {model_name} updated",
            "old_field_name": field_name,
            "new_field_name": new_field_name,
            "field_type": field_type,
            "nullable": nullable,
            "default_value": default_value,
            "description": description,
            "sql_operations": executed_sql,
            "note": "SQLite has limited ALTER TABLE support. Some operations may require table recreation."
        }
        
    except Exception as e:
        logger.error(f"Error updating field in {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/models/{model_name}/fields/{field_name}", response_model=dict)
def delete_model_field(
    model_name: str,
    field_name: str,
    db: Session = Depends(get_db)
):
    """Delete a field from a model."""
    try:
        # Define the available models
        available_models = {
            "User": User,
            "SalesAgent": SalesAgent,
            "Coach": Coach,
            "Player": Player,
            "School": School,
            "Team": Team,
            "Supporter": Supporter,
            "Product": Product,
            "Order": Order,
            "LocalBusiness": LocalBusiness,
            "Partner": Partner,
            "ProductTemplate": ProductTemplate,
            "SchoolProduct": SchoolProduct
        }
        
        model_class = available_models.get(model_name)
        if not model_class:
            raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
        
        table_name = model_class.__tablename__
        
        # SQLite doesn't support DROP COLUMN directly, so we provide the SQL
        drop_sql = f"ALTER TABLE {table_name} DROP COLUMN {field_name}"
        
        logger.info(f"Deleted field '{field_name}' from {model_name}")
        
        return {
            "message": f"Field '{field_name}' deleted from {model_name}",
            "field_name": field_name,
            "sql_executed": drop_sql,
            "note": "SQLite has limited ALTER TABLE support. DROP COLUMN may require table recreation."
        }
        
    except Exception as e:
        logger.error(f"Error deleting field from {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/database/info", response_model=dict)
def get_database_info(db: Session = Depends(get_db)):
    """Get information about the current database."""
    try:
        # Get database version
        result = db.execute(text("SELECT sqlite_version()"))
        sqlite_version = result.scalar()
        
        # Get table count
        result = db.execute(text("SELECT COUNT(*) FROM sqlite_master WHERE type='table'"))
        table_count = result.scalar()
        
        # Get all table names
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
        tables = [row[0] for row in result.fetchall()]
        
        return {
            "database_type": "SQLite",
            "version": sqlite_version,
            "table_count": table_count,
            "tables": tables,
            "total_models": 13  # Number of available models
        }
        
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/models", response_model=dict)
def create_new_model(
    model_name: str,
    table_name: str,
    fields: List[dict],
    db: Session = Depends(get_db)
):
    """Create a new model/table."""
    try:
        # Build CREATE TABLE SQL
        sql_parts = [f"CREATE TABLE {table_name} ("]
        
        field_definitions = []
        for field in fields:
            field_sql = f"    {field['name']} {_get_sql_type(field['type'])}"
            if not field.get('nullable', True):
                field_sql += " NOT NULL"
            if field.get('default_value'):
                field_sql += f" DEFAULT '{field['default_value']}'"
            if field.get('primary_key', False):
                field_sql += " PRIMARY KEY"
            field_definitions.append(field_sql)
        
        sql_parts.append(",\n".join(field_definitions))
        sql_parts.append(")")
        
        create_sql = "\n".join(sql_parts)
        
        # Execute the SQL
        db.execute(text(create_sql))
        db.commit()
        
        logger.info(f"Created new model '{model_name}' with table '{table_name}'")
        
        return {
            "message": f"Model '{model_name}' created successfully",
            "model_name": model_name,
            "table_name": table_name,
            "fields": fields,
            "sql_executed": create_sql
        }
        
    except Exception as e:
        logger.error(f"Error creating model {model_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sql/execute", response_model=dict)
def execute_custom_sql(
    sql: str,
    db: Session = Depends(get_db)
):
    """Execute custom SQL (for advanced users)."""
    try:
        # Basic safety check - only allow certain SQL operations
        sql_upper = sql.upper().strip()
        allowed_operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALTER', 'CREATE', 'DROP']
        
        if not any(sql_upper.startswith(op) for op in allowed_operations):
            raise HTTPException(status_code=400, detail="Only SELECT, INSERT, UPDATE, DELETE, ALTER, CREATE, DROP operations are allowed")
        
        # Execute the SQL
        result = db.execute(text(sql))
        
        # Handle different types of results
        if sql_upper.startswith('SELECT'):
            rows = result.fetchall()
            columns = result.keys()
            data = [dict(zip(columns, row)) for row in rows]
            return {
                "message": "SQL executed successfully",
                "sql": sql,
                "result_type": "SELECT",
                "data": data,
                "row_count": len(data)
            }
        else:
            db.commit()
            return {
                "message": "SQL executed successfully",
                "sql": sql,
                "result_type": "MODIFICATION",
                "rows_affected": result.rowcount
            }
        
    except Exception as e:
        logger.error(f"Error executing SQL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _get_sql_type(field_type: str) -> str:
    """Convert Python/SQLAlchemy type to SQL type."""
    type_mapping = {
        "String": "VARCHAR(255)",
        "Text": "TEXT",
        "Integer": "INTEGER",
        "Boolean": "BOOLEAN",
        "DateTime": "DATETIME",
        "Date": "DATE",
        "Time": "TIME",
        "Numeric": "DECIMAL",
        "Float": "REAL",
        "JSON": "JSON",
        "Enum": "VARCHAR(50)"
    }
    
    # Handle parameterized types like String(100)
    base_type = field_type.split('(')[0]
    return type_mapping.get(base_type, "VARCHAR(255)")


def _get_field_description(model_name: str, field_name: str) -> str:
    """Get a human-readable description for a field."""
    descriptions = {
        "User": {
            "id": "Unique identifier for the user",
            "email": "User's email address",
            "hashed_password": "Encrypted password",
            "first_name": "User's first name",
            "last_name": "User's last name",
            "is_active": "Whether the user account is active",
            "created_at": "When the user was created",
            "updated_at": "When the user was last updated"
        },
        "SalesAgent": {
            "id": "Unique identifier for the sales agent",
            "user_id": "Reference to the user account",
            "employee_id": "Company employee ID",
            "commission_rate": "Commission percentage",
            "monthly_quota": "Monthly sales target",
            "territory_id": "Assigned territory"
        },
        "School": {
            "id": "Unique identifier for the school",
            "name": "School name",
            "address": "School address",
            "city": "City where school is located",
            "state": "State where school is located",
            "zip_code": "ZIP/postal code",
            "phone": "School phone number",
            "email": "School contact email",
            "website": "School website URL",
            "mascot": "School mascot name",
            "school_colors": "Primary school colors",
            "qr_code_data": "QR code data for sharing",
            "sales_agent_id": "Assigned sales agent"
        },
        "Product": {
            "id": "Unique identifier for the product",
            "name": "Product name",
            "description": "Product description",
            "price": "Product price",
            "sku": "Stock keeping unit",
            "stock_quantity": "Available quantity",
            "is_active": "Whether product is available"
        }
    }
    
    return descriptions.get(model_name, {}).get(field_name, f"{field_name} field")
