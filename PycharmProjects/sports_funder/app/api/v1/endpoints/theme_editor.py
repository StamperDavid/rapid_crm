"""
Comprehensive Theme Editor API
Handles all theme customization, templates, and management
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import os
from PIL import Image
import io

from app.core.database import get_db
from app.models.theme import (
    Theme, ThemeComponent, ThemeSetting, ThemeTemplate, 
    ThemePreset, ThemeCustomization, ThemeAnalytics
)
from app.models.organization import School
from app.models.user import User

router = APIRouter()


# Pydantic models for requests
class ThemeCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    school_id: int
    template_id: Optional[int] = None


class ThemeUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ComponentCreateRequest(BaseModel):
    component_type: str
    component_name: str
    config: Dict[str, Any]
    css_custom: Optional[str] = None
    html_template: Optional[str] = None
    display_order: int = 0
    responsive_settings: Optional[Dict[str, Any]] = None


class ComponentUpdateRequest(BaseModel):
    component_name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    css_custom: Optional[str] = None
    html_template: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None
    responsive_settings: Optional[Dict[str, Any]] = None


class SettingCreateRequest(BaseModel):
    setting_key: str
    setting_value: str
    setting_type: str
    category: Optional[str] = None
    description: Optional[str] = None
    is_advanced: bool = False


class SettingUpdateRequest(BaseModel):
    setting_value: Optional[str] = None
    setting_type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_advanced: Optional[bool] = None


class BulkSettingsUpdateRequest(BaseModel):
    settings: List[Dict[str, Any]]  # [{"setting_key": "primary_color", "setting_value": "#ff0000"}, ...]


class TemplateApplyRequest(BaseModel):
    template_id: int
    preserve_customizations: bool = False


class PresetApplyRequest(BaseModel):
    preset_id: int
    target_components: Optional[List[str]] = None  # Which components to apply preset to


# Theme management endpoints
@router.post("/themes")
async def create_theme(
    request: ThemeCreateRequest,
    db: Session = Depends(get_db)
):
    """Create new theme for school"""
    try:
        # Check if school exists
        school = db.query(School).filter(School.id == request.school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="School not found")
        
        # Create theme
        theme = Theme(
            name=request.name,
            description=request.description,
            school_id=request.school_id,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(theme)
        db.flush()  # Get the theme ID
        
        # Apply template if specified
        if request.template_id:
            await apply_template_to_theme(theme.id, request.template_id, db)
        
        # Create default components and settings
        await create_default_theme_structure(theme.id, db)
        
        db.commit()
        
        return {
            "success": True,
            "theme_id": theme.id,
            "message": "Theme created successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/themes/school/{school_id}")
async def get_school_themes(
    school_id: int,
    db: Session = Depends(get_db)
):
    """Get all themes for a school"""
    try:
        themes = db.query(Theme).filter(
            Theme.school_id == school_id,
            Theme.is_active == True
        ).all()
        
        return [
            {
                "id": theme.id,
                "name": theme.name,
                "description": theme.description,
                "is_active": theme.is_active,
                "is_default": theme.is_default,
                "version": theme.version,
                "created_at": theme.created_at,
                "components_count": len(theme.components),
                "settings_count": len(theme.settings)
            }
            for theme in themes
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/themes/{theme_id}")
async def get_theme_details(
    theme_id: int,
    db: Session = Depends(get_db)
):
    """Get complete theme details with components and settings"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # Get components
        components = []
        for component in theme.components:
            components.append({
                "id": component.id,
                "component_type": component.component_type,
                "component_name": component.component_name,
                "config": component.config,
                "css_custom": component.css_custom,
                "html_template": component.html_template,
                "is_active": component.is_active,
                "is_custom": component.is_custom,
                "display_order": component.display_order,
                "responsive_settings": component.responsive_settings
            })
        
        # Get settings
        settings = []
        for setting in theme.settings:
            settings.append({
                "id": setting.id,
                "setting_key": setting.setting_key,
                "setting_value": setting.setting_value,
                "setting_type": setting.setting_type,
                "category": setting.category,
                "description": setting.description,
                "is_advanced": setting.is_advanced
            })
        
        return {
            "id": theme.id,
            "name": theme.name,
            "description": theme.description,
            "school_id": theme.school_id,
            "school_name": theme.school.name if theme.school else None,
            "is_active": theme.is_active,
            "is_default": theme.is_default,
            "version": theme.version,
            "created_at": theme.created_at,
            "components": components,
            "settings": settings
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/themes/{theme_id}")
async def update_theme(
    theme_id: int,
    request: ThemeUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update theme basic information"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # Update fields
        if request.name is not None:
            theme.name = request.name
        if request.description is not None:
            theme.description = request.description
        if request.is_active is not None:
            theme.is_active = request.is_active
        
        theme.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Theme updated successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Component management endpoints
@router.post("/themes/{theme_id}/components")
async def create_component(
    theme_id: int,
    request: ComponentCreateRequest,
    db: Session = Depends(get_db)
):
    """Create new theme component"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        component = ThemeComponent(
            theme_id=theme_id,
            component_type=request.component_type,
            component_name=request.component_name,
            config=request.config,
            css_custom=request.css_custom,
            html_template=request.html_template,
            display_order=request.display_order,
            responsive_settings=request.responsive_settings,
            is_custom=bool(request.css_custom or request.html_template)
        )
        
        db.add(component)
        db.commit()
        
        return {
            "success": True,
            "component_id": component.id,
            "message": "Component created successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/themes/{theme_id}/components/{component_id}")
async def update_component(
    theme_id: int,
    component_id: int,
    request: ComponentUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update theme component"""
    try:
        component = db.query(ThemeComponent).filter(
            ThemeComponent.id == component_id,
            ThemeComponent.theme_id == theme_id
        ).first()
        
        if not component:
            raise HTTPException(status_code=404, detail="Component not found")
        
        # Update fields
        if request.component_name is not None:
            component.component_name = request.component_name
        if request.config is not None:
            component.config = request.config
        if request.css_custom is not None:
            component.css_custom = request.css_custom
        if request.html_template is not None:
            component.html_template = request.html_template
        if request.is_active is not None:
            component.is_active = request.is_active
        if request.display_order is not None:
            component.display_order = request.display_order
        if request.responsive_settings is not None:
            component.responsive_settings = request.responsive_settings
        
        # Update is_custom flag
        component.is_custom = bool(component.css_custom or component.html_template)
        
        component.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Component updated successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/themes/{theme_id}/components/{component_id}")
async def delete_component(
    theme_id: int,
    component_id: int,
    db: Session = Depends(get_db)
):
    """Delete theme component"""
    try:
        component = db.query(ThemeComponent).filter(
            ThemeComponent.id == component_id,
            ThemeComponent.theme_id == theme_id
        ).first()
        
        if not component:
            raise HTTPException(status_code=404, detail="Component not found")
        
        db.delete(component)
        db.commit()
        
        return {
            "success": True,
            "message": "Component deleted successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Settings management endpoints
@router.post("/themes/{theme_id}/settings")
async def create_setting(
    theme_id: int,
    request: SettingCreateRequest,
    db: Session = Depends(get_db)
):
    """Create new theme setting"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        setting = ThemeSetting(
            theme_id=theme_id,
            setting_key=request.setting_key,
            setting_value=request.setting_value,
            setting_type=request.setting_type,
            category=request.category,
            description=request.description,
            is_advanced=request.is_advanced
        )
        
        db.add(setting)
        db.commit()
        
        return {
            "success": True,
            "setting_id": setting.id,
            "message": "Setting created successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/themes/{theme_id}/settings/bulk")
async def update_settings_bulk(
    theme_id: int,
    request: BulkSettingsUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update multiple theme settings at once"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        updated_count = 0
        
        for setting_data in request.settings:
            setting = db.query(ThemeSetting).filter(
                ThemeSetting.theme_id == theme_id,
                ThemeSetting.setting_key == setting_data["setting_key"]
            ).first()
            
            if setting:
                setting.setting_value = setting_data["setting_value"]
                setting.updated_at = datetime.utcnow()
                updated_count += 1
            else:
                # Create new setting if it doesn't exist
                new_setting = ThemeSetting(
                    theme_id=theme_id,
                    setting_key=setting_data["setting_key"],
                    setting_value=setting_data["setting_value"],
                    setting_type=setting_data.get("setting_type", "text"),
                    category=setting_data.get("category"),
                    description=setting_data.get("description")
                )
                db.add(new_setting)
                updated_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "updated_count": updated_count,
            "message": f"Updated {updated_count} settings successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Template management endpoints
@router.get("/templates")
async def get_theme_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get available theme templates"""
    try:
        query = db.query(ThemeTemplate).filter(ThemeTemplate.is_active == True)
        
        if category:
            query = query.filter(ThemeTemplate.category == category)
        
        templates = query.all()
        
        return [
            {
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "category": template.category,
                "preview_image_url": template.preview_image_url,
                "preview_colors": template.preview_colors,
                "is_premium": template.is_premium
            }
            for template in templates
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/themes/{theme_id}/apply-template")
async def apply_template_to_theme(
    theme_id: int,
    request: TemplateApplyRequest,
    db: Session = Depends(get_db)
):
    """Apply template to existing theme"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        template = db.query(ThemeTemplate).filter(ThemeTemplate.id == request.template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Clear existing components and settings if not preserving customizations
        if not request.preserve_customizations:
            db.query(ThemeComponent).filter(ThemeComponent.theme_id == theme_id).delete()
            db.query(ThemeSetting).filter(ThemeSetting.theme_id == theme_id).delete()
        
        # Apply template components
        for component_config in template.components_config.get("components", []):
            component = ThemeComponent(
                theme_id=theme_id,
                component_type=component_config["component_type"],
                component_name=component_config["component_name"],
                config=component_config["config"],
                css_custom=component_config.get("css_custom"),
                html_template=component_config.get("html_template"),
                display_order=component_config.get("display_order", 0),
                responsive_settings=component_config.get("responsive_settings")
            )
            db.add(component)
        
        # Apply template settings
        for setting_config in template.settings_config.get("settings", []):
            setting = ThemeSetting(
                theme_id=theme_id,
                setting_key=setting_config["setting_key"],
                setting_value=setting_config["setting_value"],
                setting_type=setting_config["setting_type"],
                category=setting_config.get("category"),
                description=setting_config.get("description"),
                is_advanced=setting_config.get("is_advanced", False)
            )
            db.add(setting)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Template applied successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Preset management endpoints
@router.get("/presets")
async def get_theme_presets(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get available theme presets"""
    try:
        query = db.query(ThemePreset).filter(ThemePreset.is_active == True)
        
        if category:
            query = query.filter(ThemePreset.category == category)
        
        presets = query.all()
        
        return [
            {
                "id": preset.id,
                "name": preset.name,
                "description": preset.description,
                "category": preset.category,
                "preset_config": preset.preset_config,
                "is_system": preset.is_system
            }
            for preset in presets
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/themes/{theme_id}/apply-preset")
async def apply_preset_to_theme(
    theme_id: int,
    request: PresetApplyRequest,
    db: Session = Depends(get_db)
):
    """Apply preset to theme"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        preset = db.query(ThemePreset).filter(ThemePreset.id == request.preset_id).first()
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")
        
        # Apply preset configuration
        for setting_key, setting_value in preset.preset_config.items():
            setting = db.query(ThemeSetting).filter(
                ThemeSetting.theme_id == theme_id,
                ThemeSetting.setting_key == setting_key
            ).first()
            
            if setting:
                setting.setting_value = setting_value
                setting.updated_at = datetime.utcnow()
            else:
                # Create new setting
                new_setting = ThemeSetting(
                    theme_id=theme_id,
                    setting_key=setting_key,
                    setting_value=setting_value,
                    setting_type="text",  # Default type
                    category=preset.category
                )
                db.add(new_setting)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Preset applied successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Image upload endpoint
@router.post("/themes/{theme_id}/upload-image")
async def upload_theme_image(
    theme_id: int,
    image_type: str = Form(...),  # logo, banner, background, etc.
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload image for theme (logo, banner, etc.)"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Process and save image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Create uploads directory if it doesn't exist
        upload_dir = f"app/static/uploads/themes/{theme_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{image_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save image
        image.save(file_path)
        
        # Update theme setting with image URL
        image_url = f"/static/uploads/themes/{theme_id}/{filename}"
        
        setting = db.query(ThemeSetting).filter(
            ThemeSetting.theme_id == theme_id,
            ThemeSetting.setting_key == f"{image_type}_image_url"
        ).first()
        
        if setting:
            setting.setting_value = image_url
        else:
            setting = ThemeSetting(
                theme_id=theme_id,
                setting_key=f"{image_type}_image_url",
                setting_value=image_url,
                setting_type="image",
                category="images"
            )
            db.add(setting)
        
        db.commit()
        
        return {
            "success": True,
            "image_url": image_url,
            "message": f"{image_type} image uploaded successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Preview and export endpoints
@router.get("/themes/{theme_id}/preview")
async def get_theme_preview(
    theme_id: int,
    device_type: str = "desktop",  # desktop, tablet, mobile
    db: Session = Depends(get_db)
):
    """Get theme preview data for specific device type"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # Get theme configuration
        theme_config = {
            "theme_id": theme.id,
            "theme_name": theme.name,
            "school_name": theme.school.name if theme.school else "School",
            "device_type": device_type,
            "components": [],
            "settings": {},
            "css_variables": {},
            "custom_css": ""
        }
        
        # Get components for device type
        for component in theme.components:
            if component.is_active:
                component_config = component.config.copy()
                
                # Apply responsive settings if available
                if component.responsive_settings and device_type in component.responsive_settings:
                    component_config.update(component.responsive_settings[device_type])
                
                theme_config["components"].append({
                    "id": component.id,
                    "type": component.component_type,
                    "name": component.component_name,
                    "config": component_config,
                    "css_custom": component.css_custom,
                    "html_template": component.html_template,
                    "display_order": component.display_order
                })
        
        # Get settings
        for setting in theme.settings:
            theme_config["settings"][setting.setting_key] = setting.setting_value
            
            # Build CSS variables
            if setting.setting_type == "color" and setting.setting_key.startswith("color_"):
                css_var_name = f"--{setting.setting_key.replace('_', '-')}"
                theme_config["css_variables"][css_var_name] = setting.setting_value
        
        # Sort components by display order
        theme_config["components"].sort(key=lambda x: x["display_order"])
        
        return theme_config
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/themes/{theme_id}/export")
async def export_theme(
    theme_id: int,
    db: Session = Depends(get_db)
):
    """Export theme configuration as JSON"""
    try:
        theme = db.query(Theme).filter(Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # Build export data
        export_data = {
            "theme_info": {
                "name": theme.name,
                "description": theme.description,
                "version": theme.version,
                "exported_at": datetime.utcnow().isoformat()
            },
            "components": [
                {
                    "component_type": comp.component_type,
                    "component_name": comp.component_name,
                    "config": comp.config,
                    "css_custom": comp.css_custom,
                    "html_template": comp.html_template,
                    "display_order": comp.display_order,
                    "responsive_settings": comp.responsive_settings
                }
                for comp in theme.components
            ],
            "settings": [
                {
                    "setting_key": setting.setting_key,
                    "setting_value": setting.setting_value,
                    "setting_type": setting.setting_type,
                    "category": setting.category,
                    "description": setting.description,
                    "is_advanced": setting.is_advanced
                }
                for setting in theme.settings
            ]
        }
        
        return export_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
async def apply_template_to_theme(theme_id: int, template_id: int, db: Session):
    """Helper function to apply template to theme"""
    # This is called from create_theme endpoint
    pass


async def create_default_theme_structure(theme_id: int, db: Session):
    """Create default theme components and settings"""
    # Default components
    default_components = [
        {
            "component_type": "header",
            "component_name": "Main Header",
            "config": {
                "height": "80px",
                "background_color": "#ffffff",
                "text_color": "#333333",
                "logo_position": "left",
                "navigation_style": "horizontal"
            },
            "display_order": 1
        },
        {
            "component_type": "hero_section",
            "component_name": "Hero Banner",
            "config": {
                "height": "400px",
                "background_type": "image",
                "overlay_opacity": "0.5",
                "text_alignment": "center",
                "button_style": "primary"
            },
            "display_order": 2
        },
        {
            "component_type": "product_grid",
            "component_name": "Product Grid",
            "config": {
                "columns": 3,
                "gap": "20px",
                "card_style": "modern",
                "show_prices": True,
                "show_descriptions": True
            },
            "display_order": 3
        },
        {
            "component_type": "footer",
            "component_name": "Main Footer",
            "config": {
                "background_color": "#333333",
                "text_color": "#ffffff",
                "columns": 3,
                "show_social_links": True
            },
            "display_order": 4
        }
    ]
    
    # Default settings
    default_settings = [
        {"setting_key": "primary_color", "setting_value": "#3b82f6", "setting_type": "color", "category": "colors"},
        {"setting_key": "secondary_color", "setting_value": "#6b7280", "setting_type": "color", "category": "colors"},
        {"setting_key": "accent_color", "setting_value": "#f59e0b", "setting_type": "color", "category": "colors"},
        {"setting_key": "background_color", "setting_value": "#ffffff", "setting_type": "color", "category": "colors"},
        {"setting_key": "text_color", "setting_value": "#333333", "setting_type": "color", "category": "colors"},
        {"setting_key": "font_family", "setting_value": "Inter, sans-serif", "setting_type": "font", "category": "typography"},
        {"setting_key": "font_size_base", "setting_value": "16px", "setting_type": "size", "category": "typography"},
        {"setting_key": "border_radius", "setting_value": "8px", "setting_type": "size", "category": "layout"},
        {"setting_key": "container_max_width", "setting_value": "1200px", "setting_type": "size", "category": "layout"},
        {"setting_key": "logo_image_url", "setting_value": "", "setting_type": "image", "category": "images"},
        {"setting_key": "banner_image_url", "setting_value": "", "setting_type": "image", "category": "images"}
    ]
    
    # Create components
    for comp_data in default_components:
        component = ThemeComponent(
            theme_id=theme_id,
            component_type=comp_data["component_type"],
            component_name=comp_data["component_name"],
            config=comp_data["config"],
            display_order=comp_data["display_order"]
        )
        db.add(component)
    
    # Create settings
    for setting_data in default_settings:
        setting = ThemeSetting(
            theme_id=theme_id,
            setting_key=setting_data["setting_key"],
            setting_value=setting_data["setting_value"],
            setting_type=setting_data["setting_type"],
            category=setting_data["category"]
        )
        db.add(setting)
