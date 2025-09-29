"""
Organization-related models (Schools, Teams, etc.).
"""
from sqlalchemy import Column, String, Text, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class School(BaseModel):
    """School model for educational institutions."""
    
    __tablename__ = "schools"
    
    name = Column(String(200), nullable=False, index=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # School details
    school_type = Column(String(50), nullable=True)  # e.g., "High School", "Middle School"
    district = Column(String(200), nullable=True)
    mascot = Column(String(100), nullable=True)
    school_colors = Column(String(100), nullable=True)
    
    # QR Code for sharing
    qr_code_data = Column(String(500), unique=True, nullable=False)
    qr_code_image_url = Column(String(500), nullable=True)
    
    # Relationships
    sales_agent_id = Column(Integer, ForeignKey("sales_agents.id"), nullable=False)
    sales_agent = relationship("SalesAgent", back_populates="schools")
    coaches = relationship("Coach", back_populates="school", cascade="all, delete-orphan")
    local_businesses = relationship("LocalBusiness", back_populates="school", cascade="all, delete-orphan")
    products = relationship("SchoolProduct", back_populates="school", cascade="all, delete-orphan")
    
    # New relationships for payment and agreement systems
    payment_transactions = relationship("PaymentTransaction", back_populates="school", cascade="all, delete-orphan")
    agreements = relationship("Agreement", back_populates="school", cascade="all, delete-orphan")
    transparency_reports = relationship("TransparencyReport", back_populates="school", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<School {self.name}>"


class Team(BaseModel):
    """Team model for sports teams within schools."""
    
    __tablename__ = "teams"
    
    name = Column(String(200), nullable=False)
    sport = Column(String(50), nullable=False)
    season = Column(String(50), nullable=True)  # e.g., "Fall 2024", "Spring 2025"
    level = Column(String(50), nullable=True)  # e.g., "Varsity", "JV", "Freshman"
    
    # Team details
    team_logo_url = Column(String(500), nullable=True)
    team_colors = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    school = relationship("School")
    coach_id = Column(Integer, ForeignKey("coaches.id"), nullable=False)
    coach = relationship("Coach")
    events = relationship("TeamEvent", back_populates="team", cascade="all, delete-orphan")
    store = relationship("TeamStore", back_populates="team", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Team {self.name} - {self.sport}>"


class Business(BaseModel):
    """Business model for local sponsors and partners."""
    
    __tablename__ = "businesses"
    
    name = Column(String(200), nullable=False, index=True)
    contact_name = Column(String(200), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Business details
    category = Column(String(100), nullable=True)  # e.g., "Restaurant", "Retail", "Service"
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Sponsorship details
    monthly_budget = Column(String(50), nullable=True)
    sponsorship_level = Column(String(50), nullable=True)  # e.g., "Gold", "Silver", "Bronze"
    is_active = Column(Boolean, default=True)
    
    # Relationships
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    school = relationship("School")
    
    def __repr__(self):
        return f"<Business {self.name}>"

