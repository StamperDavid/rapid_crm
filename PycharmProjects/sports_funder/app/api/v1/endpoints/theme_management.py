from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json

from app.core.database import get_db
from app.models.theme import Theme, PageLayout, ComponentConfig, UserThemePreference
from app.models.user import User
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.get("/themes", response_model=List[dict])
def get_themes(db: Session = Depends(get_db)):
    """Get all available themes."""
    themes = db.query(Theme).filter(Theme.is_active == True).all()
    
    return [
        {
            "id": theme.id,
            "name": theme.name,
            "description": theme.description,
            "is_default": theme.is_default,
            "primary_color": theme.primary_color,
            "secondary_color": theme.secondary_color,
            "accent_color": theme.accent_color,
            "background_color": theme.background_color,
            "text_color": theme.text_color,
            "font_family": theme.font_family,
            "created_at": theme.created_at
        }
        for theme in themes
    ]


@router.post("/themes", response_model=dict)
def create_theme(
    name: str,
    description: str = None,
    primary_color: str = "#1e3a8a",
    secondary_color: str = "#dc2626",
    accent_color: str = "#ffffff",
    background_color: str = "#f8f9fa",
    text_color: str = "#333333",
    text_light_color: str = "#7f8c8d",
    font_family: str = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    font_size_base: str = "1rem",
    font_size_large: str = "1.25rem",
    font_size_small: str = "0.875rem",
    spacing_small: str = "0.5rem",
    spacing_medium: str = "1rem",
    spacing_large: str = "2rem",
    border_radius_small: str = "4px",
    border_radius_medium: str = "8px",
    border_radius_large: str = "15px",
    shadow_light: str = "0 2px 4px rgba(0,0,0,0.1)",
    shadow_medium: str = "0 4px 8px rgba(0,0,0,0.15)",
    shadow_heavy: str = "0 8px 32px rgba(0,0,0,0.1)",
    mobile_breakpoint: str = "768px",
    mobile_font_scale: str = "0.9",
    mobile_spacing_scale: str = "0.8",
    is_default: bool = False,
    db: Session = Depends(get_db)
):
    """Create a new theme."""
    # If this is set as default, unset other defaults
    if is_default:
        db.query(Theme).update({"is_default": False})
    
    theme = Theme(
        name=name,
        description=description,
        primary_color=primary_color,
        secondary_color=secondary_color,
        accent_color=accent_color,
        background_color=background_color,
        text_color=text_color,
        text_light_color=text_light_color,
        font_family=font_family,
        font_size_base=font_size_base,
        font_size_large=font_size_large,
        font_size_small=font_size_small,
        spacing_small=spacing_small,
        spacing_medium=spacing_medium,
        spacing_large=spacing_large,
        border_radius_small=border_radius_small,
        border_radius_medium=border_radius_medium,
        border_radius_large=border_radius_large,
        shadow_light=shadow_light,
        shadow_medium=shadow_medium,
        shadow_heavy=shadow_heavy,
        mobile_breakpoint=mobile_breakpoint,
        mobile_font_scale=mobile_font_scale,
        mobile_spacing_scale=mobile_spacing_scale,
        is_default=is_default
    )
    
    db.add(theme)
    db.commit()
    db.refresh(theme)
    
    return {
        "id": theme.id,
        "name": theme.name,
        "description": theme.description,
        "is_default": theme.is_default,
        "created_at": theme.created_at
    }


@router.get("/themes/{theme_id}", response_model=dict)
def get_theme(theme_id: int, db: Session = Depends(get_db)):
    """Get a specific theme with all its details."""
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    return {
        "id": theme.id,
        "name": theme.name,
        "description": theme.description,
        "is_default": theme.is_default,
        "primary_color": theme.primary_color,
        "secondary_color": theme.secondary_color,
        "accent_color": theme.accent_color,
        "background_color": theme.background_color,
        "text_color": theme.text_color,
        "text_light_color": theme.text_light_color,
        "font_family": theme.font_family,
        "font_size_base": theme.font_size_base,
        "font_size_large": theme.font_size_large,
        "font_size_small": theme.font_size_small,
        "spacing_small": theme.spacing_small,
        "spacing_medium": theme.spacing_medium,
        "spacing_large": theme.spacing_large,
        "border_radius_small": theme.border_radius_small,
        "border_radius_medium": theme.border_radius_medium,
        "border_radius_large": theme.border_radius_large,
        "shadow_light": theme.shadow_light,
        "shadow_medium": theme.shadow_medium,
        "shadow_heavy": theme.shadow_heavy,
        "mobile_breakpoint": theme.mobile_breakpoint,
        "mobile_font_scale": theme.mobile_font_scale,
        "mobile_spacing_scale": theme.mobile_spacing_scale,
        "created_at": theme.created_at,
        "updated_at": theme.updated_at
    }


@router.put("/themes/{theme_id}", response_model=dict)
def update_theme(
    theme_id: int,
    name: str = None,
    description: str = None,
    primary_color: str = None,
    secondary_color: str = None,
    accent_color: str = None,
    background_color: str = None,
    text_color: str = None,
    text_light_color: str = None,
    font_family: str = None,
    font_size_base: str = None,
    font_size_large: str = None,
    font_size_small: str = None,
    spacing_small: str = None,
    spacing_medium: str = None,
    spacing_large: str = None,
    border_radius_small: str = None,
    border_radius_medium: str = None,
    border_radius_large: str = None,
    shadow_light: str = None,
    shadow_medium: str = None,
    shadow_heavy: str = None,
    mobile_breakpoint: str = None,
    mobile_font_scale: str = None,
    mobile_spacing_scale: str = None,
    is_default: bool = None,
    db: Session = Depends(get_db)
):
    """Update a theme."""
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    # If this is set as default, unset other defaults
    if is_default:
        db.query(Theme).update({"is_default": False})
    
    # Update fields if provided
    update_fields = {
        "name": name, "description": description, "primary_color": primary_color,
        "secondary_color": secondary_color, "accent_color": accent_color,
        "background_color": background_color, "text_color": text_color,
        "text_light_color": text_light_color, "font_family": font_family,
        "font_size_base": font_size_base, "font_size_large": font_size_large,
        "font_size_small": font_size_small, "spacing_small": spacing_small,
        "spacing_medium": spacing_medium, "spacing_large": spacing_large,
        "border_radius_small": border_radius_small, "border_radius_medium": border_radius_medium,
        "border_radius_large": border_radius_large, "shadow_light": shadow_light,
        "shadow_medium": shadow_medium, "shadow_heavy": shadow_heavy,
        "mobile_breakpoint": mobile_breakpoint, "mobile_font_scale": mobile_font_scale,
        "mobile_spacing_scale": mobile_spacing_scale, "is_default": is_default
    }
    
    for field, value in update_fields.items():
        if value is not None:
            setattr(theme, field, value)
    
    db.commit()
    db.refresh(theme)
    
    return {
        "id": theme.id,
        "name": theme.name,
        "description": theme.description,
        "is_default": theme.is_default,
        "updated_at": theme.updated_at
    }


@router.get("/themes/{theme_id}/pages", response_model=List[dict])
def get_theme_pages(theme_id: int, db: Session = Depends(get_db)):
    """Get page layouts for a specific theme."""
    pages = db.query(PageLayout).filter(
        PageLayout.theme_id == theme_id,
        PageLayout.is_active == True
    ).all()
    
    return [
        {
            "id": page.id,
            "page_name": page.page_name,
            "page_type": page.page_type,
            "layout_config": page.layout_config,
            "component_visibility": page.component_visibility,
            "component_order": page.component_order,
            "component_styling": page.component_styling,
            "mobile_layout_config": page.mobile_layout_config,
            "mobile_component_visibility": page.mobile_component_visibility,
            "mobile_component_order": page.mobile_component_order
        }
        for page in pages
    ]


@router.post("/themes/{theme_id}/pages", response_model=dict)
def create_page_layout(
    theme_id: int,
    page_name: str,
    page_type: str = "both",
    layout_config: dict = None,
    component_visibility: dict = None,
    component_order: dict = None,
    component_styling: dict = None,
    mobile_layout_config: dict = None,
    mobile_component_visibility: dict = None,
    mobile_component_order: dict = None,
    db: Session = Depends(get_db)
):
    """Create a new page layout for a theme."""
    # Verify theme exists
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    page_layout = PageLayout(
        theme_id=theme_id,
        page_name=page_name,
        page_type=page_type,
        layout_config=layout_config,
        component_visibility=component_visibility,
        component_order=component_order,
        component_styling=component_styling,
        mobile_layout_config=mobile_layout_config,
        mobile_component_visibility=mobile_component_visibility,
        mobile_component_order=mobile_component_order
    )
    
    db.add(page_layout)
    db.commit()
    db.refresh(page_layout)
    
    return {
        "id": page_layout.id,
        "page_name": page_layout.page_name,
        "page_type": page_layout.page_type,
        "created_at": page_layout.created_at
    }


@router.get("/themes/{theme_id}/css", response_model=dict)
def get_theme_css(theme_id: int, db: Session = Depends(get_db)):
    """Generate CSS for a theme."""
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    css = f"""
    :root {{
        --primary-color: {theme.primary_color};
        --secondary-color: {theme.secondary_color};
        --accent-color: {theme.accent_color};
        --background-color: {theme.background_color};
        --text-color: {theme.text_color};
        --text-light-color: {theme.text_light_color};
        --font-family: {theme.font_family};
        --font-size-base: {theme.font_size_base};
        --font-size-large: {theme.font_size_large};
        --font-size-small: {theme.font_size_small};
        --spacing-small: {theme.spacing_small};
        --spacing-medium: {theme.spacing_medium};
        --spacing-large: {theme.spacing_large};
        --border-radius-small: {theme.border_radius_small};
        --border-radius-medium: {theme.border_radius_medium};
        --border-radius-large: {theme.border_radius_large};
        --shadow-light: {theme.shadow_light};
        --shadow-medium: {theme.shadow_medium};
        --shadow-heavy: {theme.shadow_heavy};
        --mobile-breakpoint: {theme.mobile_breakpoint};
        --mobile-font-scale: {theme.mobile_font_scale};
        --mobile-spacing-scale: {theme.mobile_spacing_scale};
    }}
    
    body {{
        font-family: var(--font-family);
        background-color: var(--background-color);
        color: var(--text-color);
        font-size: var(--font-size-base);
    }}
    
    .btn {{
        background-color: var(--primary-color);
        color: var(--accent-color);
        border-radius: var(--border-radius-medium);
        padding: var(--spacing-small) var(--spacing-medium);
        box-shadow: var(--shadow-light);
    }}
    
    .btn:hover {{
        box-shadow: var(--shadow-medium);
    }}
    
    .btn-secondary {{
        background-color: var(--secondary-color);
    }}
    
    .card {{
        background-color: var(--accent-color);
        border-radius: var(--border-radius-large);
        box-shadow: var(--shadow-heavy);
        padding: var(--spacing-large);
    }}
    
    @media (max-width: var(--mobile-breakpoint)) {{
        body {{
            font-size: calc(var(--font-size-base) * var(--mobile-font-scale));
        }}
        
        .card {{
            padding: calc(var(--spacing-large) * var(--mobile-spacing-scale));
        }}
    }}
    """
    
    return {
        "theme_id": theme_id,
        "theme_name": theme.name,
        "css": css
    }


@router.get("/default-theme", response_model=dict)
def get_default_theme(db: Session = Depends(get_db)):
    """Get the default theme."""
    theme = db.query(Theme).filter(Theme.is_default == True).first()
    if not theme:
        # Create a default theme if none exists
        theme = Theme(
            name="Default Theme",
            description="Default Sports Funder theme",
            is_default=True,
            primary_color="#1e3a8a",
            secondary_color="#dc2626",
            accent_color="#ffffff",
            background_color="#f8f9fa",
            text_color="#333333",
            text_light_color="#7f8c8d"
        )
        db.add(theme)
        db.commit()
        db.refresh(theme)
    
    return {
        "id": theme.id,
        "name": theme.name,
        "description": theme.description,
        "primary_color": theme.primary_color,
        "secondary_color": theme.secondary_color,
        "accent_color": theme.accent_color,
        "background_color": theme.background_color,
        "text_color": theme.text_color,
        "text_light_color": theme.text_light_color,
        "font_family": theme.font_family,
        "font_size_base": theme.font_size_base,
        "font_size_large": theme.font_size_large,
        "font_size_small": theme.font_size_small,
        "spacing_small": theme.spacing_small,
        "spacing_medium": theme.spacing_medium,
        "spacing_large": theme.spacing_large,
        "border_radius_small": theme.border_radius_small,
        "border_radius_medium": theme.border_radius_medium,
        "border_radius_large": theme.border_radius_large,
        "shadow_light": theme.shadow_light,
        "shadow_medium": theme.shadow_medium,
        "shadow_heavy": theme.shadow_heavy,
        "mobile_breakpoint": theme.mobile_breakpoint,
        "mobile_font_scale": theme.mobile_font_scale,
        "mobile_spacing_scale": theme.mobile_spacing_scale
    }
