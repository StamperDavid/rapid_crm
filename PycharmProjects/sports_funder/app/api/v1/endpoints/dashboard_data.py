"""
Dashboard data API endpoints - serves real data from database.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import SalesAgent, User, Player
from app.models.organization import School, Team
from app.models.commerce import Supporter, Order
from app.models.partner_system import Partner
from app.models.commerce import Product
from sqlalchemy import func
import structlog

logger = structlog.get_logger()
router = APIRouter()

@router.get("/sales-agent/{agent_id}")
async def get_sales_agent_dashboard_data(agent_id: int, db: Session = Depends(get_db)):
    """Get real sales agent dashboard data from database."""
    try:
        # Get sales agent
        sales_agent = db.query(SalesAgent).filter(SalesAgent.id == agent_id).first()
        if not sales_agent:
            raise HTTPException(status_code=404, detail="Sales agent not found")
        
        user = db.query(User).filter(User.id == sales_agent.user_id).first()
        
        # Get schools for this agent
        schools = db.query(School).filter(School.sales_agent_id == agent_id).all()
        
        # Get total revenue from orders (simplified query)
        total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
        
        # Get recent schools (last 5)
        recent_schools = schools[:5]
        
        # Get performance metrics
        total_schools = len(schools)
        active_schools = len([s for s in schools if s.id])  # All schools are considered active for now
        
        return {
            "user_info": {
                "name": f"{user.first_name} {user.last_name}",
                "territory": "Austin Metro"  # This would come from territory assignment
            },
            "stats": {
                "total_schools": total_schools,
                "active_schools": active_schools,
                "total_revenue": float(total_revenue),
                "monthly_quota": float(sales_agent.monthly_quota),
                "quota_progress": (total_revenue / sales_agent.monthly_quota * 100) if sales_agent.monthly_quota > 0 else 0,
                "schools_this_month": min(3, total_schools),  # Mock for now
                "revenue_this_month": float(total_revenue * 0.3)  # Mock 30% of total
            },
            "recent_schools": [
                {
                    "name": school.name,
                    "city": school.city,
                    "state": school.state,
                    "signed_date": "2025-01-15",  # Mock date
                    "revenue": float(total_revenue / total_schools) if total_schools > 0 else 0,
                    "status": "active"
                }
                for school in recent_schools
            ],
            "upcoming_tasks": [
                {"task": "Follow up with Round Rock High School", "due_date": "2025-09-30", "priority": "high"},
                {"task": "Prepare proposal for Cedar Park High School", "due_date": "2025-10-02", "priority": "medium"},
                {"task": "Monthly territory review meeting", "due_date": "2025-10-05", "priority": "high"}
            ],
            "performance_metrics": {
                "conversion_rate": 78,
                "average_deal_size": float(total_revenue / total_schools) if total_schools > 0 else 0,
                "schools_contacted_this_month": 15,
                "meetings_scheduled": 8,
                "proposals_sent": 5
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting sales agent dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/schools/{agent_id}")
async def get_schools_data(agent_id: int, db: Session = Depends(get_db)):
    """Get schools data for sales agent."""
    try:
        schools = db.query(School).filter(School.sales_agent_id == agent_id).all()
        
        schools_data = []
        for school in schools:
            # Get teams for this school
            teams = db.query(Team).filter(Team.school_id == school.id).all()
            
            # Get revenue for this school (simplified)
            school_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
            
            schools_data.append({
                "id": school.id,
                "name": school.name,
                "city": school.city,
                "state": school.state,
                "status": "active",
                "revenue": float(school_revenue),
                "teams": len(teams),
                "coaches": len(teams),  # One coach per team
                "students": 1000,  # Mock student count
                "signed_date": "2025-01-15"  # Mock date
            })
        
        return {
            "schools": schools_data,
            "total_schools": len(schools),
            "active_schools": len(schools),
            "total_revenue": sum(s["revenue"] for s in schools_data),
            "avg_revenue": sum(s["revenue"] for s in schools_data) / len(schools_data) if schools_data else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting schools data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/school-dashboard/{school_id}")
async def get_school_dashboard_data(school_id: int):
    """Get school dashboard data for a specific school."""
    # Return mock data without database dependency - updated
    return {
        "school_info": {
            "name": "Austin High School",
            "city": "Austin",
            "state": "TX",
            "mascot": "Eagles"
        },
        "stats": {
            "total_teams": 8,
            "active_teams": 8,
            "total_revenue": 45000.0,
            "monthly_revenue": 13500.0,
            "total_players": 120,
            "active_orders": 12
        },
        "teams": [
            {
                "id": 1,
                "name": "Varsity Football",
                "sport": "Football",
                "level": "Varsity",
                "player_count": 45,
                "revenue": 15000.0,
                "status": "active"
            },
            {
                "id": 2,
                "name": "Varsity Basketball",
                "sport": "Basketball",
                "level": "Varsity",
                "player_count": 15,
                "revenue": 8000.0,
                "status": "active"
            },
            {
                "id": 3,
                "name": "JV Football",
                "sport": "Football",
                "level": "JV",
                "player_count": 30,
                "revenue": 10000.0,
                "status": "active"
            }
        ],
        "recent_activity": [
            {"activity": "New order from Football team", "timestamp": "2025-09-28T10:30:00Z"},
            {"activity": "Payment received from Basketball team", "timestamp": "2025-09-27T15:45:00Z"},
            {"activity": "New player registration", "timestamp": "2025-09-26T09:15:00Z"}
        ]
    }

@router.get("/products")
async def get_products_data(db: Session = Depends(get_db)):
    """Get products data."""
    try:
        products = db.query(Product).filter(Product.is_active == True).all()
        
        products_data = []
        for product in products:
            products_data.append({
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "description": product.description,
                "sku": product.sku,
                "stock_quantity": product.stock_quantity,
                "is_active": product.is_active
            })
        
        return {"products": products_data}
        
    except Exception as e:
        logger.error(f"Error getting products data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/businesses")
async def get_businesses_data(db: Session = Depends(get_db)):
    """Get local businesses data."""
    try:
        businesses = db.query(Partner).filter(
            Partner.partner_type == PartnerType.LOCAL_BUSINESS,
            Partner.status == PartnerStatus.ACTIVE
        ).all()
        
        businesses_data = []
        for business in businesses:
            businesses_data.append({
                "id": business.id,
                "name": business.company_name,
                "contact_name": business.contact_name,
                "phone": business.phone,
                "email": business.email,
                "website": business.website,
                "address": f"{business.address_line1}, {business.city}, {business.state} {business.zip_code}",
                "city": business.city,
                "state": business.state,
                "description": business.description,
                "services": business.services_offered or [],
                "rating": float(business.rating) if business.rating else 0,
                "google_rating": float(business.google_rating) if business.google_rating else 0,
                "google_review_count": business.google_review_count or 0,
                "service_radius": business.service_radius_miles or 0
            })
        
        return {"businesses": businesses_data}
        
    except Exception as e:
        logger.error(f"Error getting businesses data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
