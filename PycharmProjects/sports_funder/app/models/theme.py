"""
Comprehensive Theme Management Models
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, JSON, DateTime, Float
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime


class Theme(BaseModel):
    """Main theme model for schools"""
    
    __tablename__ = "themes"
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    
    # Theme status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    # Theme metadata
    version = Column(String(20), default="1.0")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_modified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    school = relationship("School", back_populates="themes")
    components = relationship("ThemeComponent", back_populates="theme", cascade="all, delete-orphan")
    settings = relationship("ThemeSetting", back_populates="theme", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Theme {self.name} for {self.school.name if self.school else 'Unknown School'}>"


class ThemeComponent(BaseModel):
    """Individual theme components (header, footer, product cards, etc.)"""
    
    __tablename__ = "theme_components"
    
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    component_type = Column(String(50), nullable=False)  # header, footer, product_card, hero_section, etc.
    component_name = Column(String(100), nullable=False)
    
    # Component configuration
    config = Column(JSON, nullable=False, default=dict)  # All component settings
    css_custom = Column(Text, nullable=True)  # Custom CSS for this component
    html_template = Column(Text, nullable=True)  # Custom HTML template
    
    # Component status
    is_active = Column(Boolean, default=True)
    is_custom = Column(Boolean, default=False)  # True if custom HTML/CSS is used
    
    # Component positioning and layout
    display_order = Column(Integer, default=0)
    responsive_settings = Column(JSON, nullable=True)  # Mobile/tablet specific settings
    
    # Relationships
    theme = relationship("Theme", back_populates="components")
    
    def __repr__(self):
        return f"<ThemeComponent {self.component_name} ({self.component_type})>"


class ThemeSetting(BaseModel):
    """Global theme settings and variables"""
    
    __tablename__ = "theme_settings"
    
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    setting_key = Column(String(100), nullable=False)
    setting_value = Column(Text, nullable=False)
    setting_type = Column(String(20), nullable=False)  # color, font, size, boolean, text, image, etc.
    
    # Setting metadata
    category = Column(String(50), nullable=True)  # colors, typography, layout, etc.
    description = Column(Text, nullable=True)
    is_advanced = Column(Boolean, default=False)  # True for advanced settings
    
    # Relationships
    theme = relationship("Theme", back_populates="settings")
    
    def __repr__(self):
        return f"<ThemeSetting {self.setting_key}: {self.setting_value}>"


class ThemeTemplate(BaseModel):
    """Pre-built theme templates that schools can use as starting points"""
    
    __tablename__ = "theme_templates"
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # sports, modern, classic, etc.
    
    # Template preview
    preview_image_url = Column(String(500), nullable=True)
    preview_colors = Column(JSON, nullable=True)  # Array of hex colors used in template
    
    # Template configuration
    template_config = Column(JSON, nullable=False, default=dict)  # Complete theme configuration
    components_config = Column(JSON, nullable=False, default=dict)  # Components configuration
    settings_config = Column(JSON, nullable=False, default=dict)  # Settings configuration
    
    # Template metadata
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def __repr__(self):
        return f"<ThemeTemplate {self.name} ({self.category})>"


class ThemePreset(BaseModel):
    """Quick theme presets for common configurations"""
    
    __tablename__ = "theme_presets"
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # color_scheme, layout, typography, etc.
    
    # Preset configuration
    preset_config = Column(JSON, nullable=False, default=dict)
    
    # Preset metadata
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)  # True for system presets, False for user created
    
    def __repr__(self):
        return f"<ThemePreset {self.name} ({self.category})>"


class ThemeCustomization(BaseModel):
    """Track theme customizations and changes"""
    
    __tablename__ = "theme_customizations"
    
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Customization details
    change_type = Column(String(50), nullable=False)  # component_update, setting_change, template_apply, etc.
    change_description = Column(Text, nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=False)
    
    # Customization metadata
    component_type = Column(String(50), nullable=True)  # If change was to specific component
    setting_key = Column(String(100), nullable=True)  # If change was to specific setting
    
    # Relationships
    theme = relationship("Theme")
    user = relationship("User")
    
    def __repr__(self):
        return f"<ThemeCustomization {self.change_type} by {self.user.email if self.user else 'Unknown'}>"


class ThemeAnalytics(BaseModel):
    """Analytics for theme usage and performance"""
    
    __tablename__ = "theme_analytics"
    
    theme_id = Column(Integer, ForeignKey("themes.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    
    # Analytics data
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    conversion_rate = Column(Float, default=0.0)  # Store conversion rate
    bounce_rate = Column(Float, default=0.0)
    avg_session_duration = Column(Float, default=0.0)  # In seconds
    
    # Performance metrics
    page_load_time = Column(Float, default=0.0)  # In seconds
    mobile_performance_score = Column(Float, default=0.0)  # 0-100
    desktop_performance_score = Column(Float, default=0.0)  # 0-100
    
    # Analytics period
    analytics_date = Column(DateTime, default=datetime.utcnow)
    period_type = Column(String(20), default="daily")  # daily, weekly, monthly
    
    # Relationships
    theme = relationship("Theme")
    school = relationship("School")
    
    def __repr__(self):
        return f"<ThemeAnalytics {self.theme.name if self.theme else 'Unknown'} - {self.analytics_date}>"