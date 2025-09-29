"""
User-related models for authentication and user management.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Text, Integer, Numeric
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    """Base user model with authentication fields."""
    
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Profile information
    profile_image_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"


class SalesAgent(BaseModel):
    """Sales agent model."""
    
    __tablename__ = "sales_agents"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=True)  # Override territory default
    
    # Sales Performance
    total_schools_signed = Column(Integer, default=0, nullable=False)
    total_revenue_generated = Column(Numeric(12, 2), default=0, nullable=False)
    monthly_quota = Column(Numeric(12, 2), nullable=True)
    
    # Relationships
    user = relationship("User")
    territory_id = Column(Integer, ForeignKey("territories.id"), nullable=True)
    territory = relationship("Territory", back_populates="sales_agents")
    schools = relationship("School", back_populates="sales_agent", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SalesAgent {self.user.first_name if self.user else 'Unknown'} {self.user.last_name if self.user else 'User'}>"


class Coach(BaseModel):
    """Coach model."""
    
    __tablename__ = "coaches"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    sport = Column(String(50), nullable=False)
    position = Column(String(100), nullable=True)  # e.g., "Head Coach", "Assistant Coach"
    years_experience = Column(String(10), nullable=True)
    
    # QR Code for sharing (auto-generated)
    qr_code_data = Column(String(500), unique=True, nullable=False)
    qr_code_image_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User")
    school = relationship("School", back_populates="coaches")
    players = relationship("Player", back_populates="coach", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Coach {self.user.first_name if self.user else 'Unknown'} {self.user.last_name if self.user else 'User'} - {self.sport}>"


class Player(BaseModel):
    """Player model."""
    
    __tablename__ = "players"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("coaches.id"), nullable=False)
    jersey_number = Column(String(10), nullable=True)
    position = Column(String(50), nullable=True)
    grade_level = Column(String(20), nullable=True)
    parent_guardian_name = Column(String(200), nullable=True)
    parent_guardian_phone = Column(String(20), nullable=True)
    parent_guardian_email = Column(String(255), nullable=True)
    
    # QR Code for sharing with supporters
    qr_code_data = Column(String(500), unique=True, nullable=False)
    qr_code_image_url = Column(String(500), nullable=True)
    
    # Player profile image for supporter landing page
    profile_image_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User")
    coach = relationship("Coach", back_populates="players")
    orders = relationship("Order", back_populates="player", cascade="all, delete-orphan")
    supporters = relationship("Supporter", back_populates="player", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Player {self.user.first_name if self.user else 'Unknown'} {self.user.last_name if self.user else 'User'} - #{self.jersey_number}>"


class SchoolAdmin(BaseModel):
    """School administrator model."""
    
    __tablename__ = "school_admins"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    role = Column(String(50), nullable=False)  # athletic_director, principal, etc.
    
    # Admin permissions
    can_manage_teams = Column(Boolean, default=True)
    can_manage_coaches = Column(Boolean, default=True)
    can_view_financials = Column(Boolean, default=True)
    can_manage_sponsors = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User")
    school = relationship("School")
    
    def __repr__(self):
        return f"<SchoolAdmin {self.user.email} at {self.school.name}>"

