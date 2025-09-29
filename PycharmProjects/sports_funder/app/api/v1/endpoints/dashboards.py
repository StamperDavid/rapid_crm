"""
Dashboard API endpoints for different user roles.
"""
from typing import List, Any, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User, SalesAgent, Coach, Player
from app.models.organization import School, Team
from app.models.partner_system import Partner, Lead, PartnerOrder
from app.models.commerce import Supporter, Order
from app.api.v1.endpoints.auth import get_current_user
import structlog

logger = structlog.get_logger()
router = APIRouter()


# Pydantic schemas for dashboard data
class DashboardStats(BaseModel):
    total_schools: int = 0
    total_coaches: int = 0
    total_players: int = 0
    total_supporters: int = 0
    total_revenue: float = 0.0
    monthly_revenue: float = 0.0
    total_leads: int = 0
    conversion_rate: float = 0.0


class SchoolSummary(BaseModel):
    id: int
    name: str
    city: str
    state: str
    coaches_count: int
    players_count: int
    total_revenue: float
    last_activity: datetime
    status: str


class CoachSummary(BaseModel):
    id: int
    name: str
    sport: str
    players_count: int
    total_revenue: float
    last_activity: datetime


class PlayerSummary(BaseModel):
    id: int
    name: str
    jersey_number: Optional[str]
    position: Optional[str]
    supporters_count: int
    total_revenue: float
    last_activity: datetime


# Sales Agent Dashboard
@router.get("/sales-agent", response_model=Dict[str, Any])
async def get_sales_agent_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get sales agent dashboard data."""
    
    # Get sales agent record
    sales_agent = db.query(SalesAgent).filter(SalesAgent.user_id == current_user.id).first()
    if not sales_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sales agent not found"
        )
    
    # Get schools in territory
    schools = db.query(School).filter(School.sales_agent_id == sales_agent.id).all()
    
    # Calculate stats
    total_coaches = sum(len(school.coaches) for school in schools)
    total_players = sum(len(coach.players) for school in schools for coach in school.coaches)
    
    # Get revenue data (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_revenue = db.query(Order).join(Player).join(Coach).join(School).filter(
        School.sales_agent_id == sales_agent.id,
        Order.created_at >= thirty_days_ago
    ).with_entities(Order.total_amount).all()
    
    monthly_revenue_sum = sum(float(order.total_amount) for order in monthly_revenue)
    
    # Get recent activity
    recent_schools = [
        SchoolSummary(
            id=school.id,
            name=school.name,
            city=school.city or "Unknown",
            state=school.state or "Unknown",
            coaches_count=len(school.coaches),
            players_count=sum(len(coach.players) for coach in school.coaches),
            total_revenue=0.0,  # Would need to calculate from orders
            last_activity=school.updated_at,
            status="Active"
        )
        for school in schools[-10:]  # Last 10 schools
    ]
    
    return {
        "user_info": {
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
            "territory": sales_agent.territory.name if sales_agent.territory else "Unassigned",
            "employee_id": sales_agent.employee_id
        },
        "stats": {
            "total_schools": len(schools),
            "total_coaches": total_coaches,
            "total_players": total_players,
            "monthly_revenue": monthly_revenue_sum,
            "quota": float(sales_agent.monthly_quota) if sales_agent.monthly_quota else 0.0,
            "quota_percentage": (monthly_revenue_sum / float(sales_agent.monthly_quota) * 100) if sales_agent.monthly_quota else 0.0
        },
        "recent_schools": recent_schools,
        "quick_actions": [
            {"title": "Add New School", "url": "/dashboard/schools/new", "icon": "🏫"},
            {"title": "View Territory Map", "url": "/dashboard/territory", "icon": "🗺️"},
            {"title": "Generate QR Codes", "url": "/dashboard/qr-codes", "icon": "📱"},
            {"title": "Performance Report", "url": "/dashboard/reports", "icon": "📊"}
        ]
    }


# Sales Manager Dashboard
@router.get("/sales-manager", response_model=Dict[str, Any])
async def get_sales_manager_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get sales manager dashboard data."""
    
    # Get all sales agents
    sales_agents = db.query(SalesAgent).all()
    
    # Calculate overall stats
    total_schools = db.query(School).count()
    total_coaches = db.query(Coach).count()
    total_players = db.query(Player).count()
    
    # Get revenue data
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_revenue = db.query(Order).filter(
        Order.created_at >= thirty_days_ago
    ).with_entities(Order.total_amount).all()
    
    monthly_revenue_sum = sum(float(order.total_amount) for order in monthly_revenue)
    
    # Get top performing agents
    agent_performance = []
    for agent in sales_agents:
        agent_schools = db.query(School).filter(School.sales_agent_id == agent.id).count()
        agent_revenue = db.query(Order).join(Player).join(Coach).join(School).filter(
            School.sales_agent_id == agent.id,
            Order.created_at >= thirty_days_ago
        ).with_entities(Order.total_amount).all()
        
        agent_revenue_sum = sum(float(order.total_amount) for order in agent_revenue)
        
        agent_performance.append({
            "id": agent.id,
            "name": f"{agent.user.first_name} {agent.user.last_name}",
            "territory": agent.territory.name if agent.territory else "Unassigned",
            "schools_count": agent_schools,
            "monthly_revenue": agent_revenue_sum,
            "quota": float(agent.monthly_quota) if agent.monthly_quota else 0.0,
            "performance": (agent_revenue_sum / float(agent.monthly_quota) * 100) if agent.monthly_quota else 0.0
        })
    
    # Sort by performance
    agent_performance.sort(key=lambda x: x["performance"], reverse=True)
    
    return {
        "user_info": {
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
            "role": "Sales Manager"
        },
        "stats": {
            "total_sales_agents": len(sales_agents),
            "total_schools": total_schools,
            "total_coaches": total_coaches,
            "total_players": total_players,
            "monthly_revenue": monthly_revenue_sum,
            "average_agent_performance": sum(ap["performance"] for ap in agent_performance) / len(agent_performance) if agent_performance else 0.0
        },
        "top_performers": agent_performance[:5],
        "recent_activity": [
            {"type": "New School", "message": "Lincoln High School signed up", "time": "2 hours ago"},
            {"type": "Revenue", "message": "$1,250 in team store sales", "time": "4 hours ago"},
            {"type": "Lead", "message": "5 new local business leads", "time": "6 hours ago"}
        ],
        "quick_actions": [
            {"title": "Manage Territories", "url": "/dashboard/territories", "icon": "🗺️"},
            {"title": "Agent Performance", "url": "/dashboard/agents", "icon": "👥"},
            {"title": "Revenue Reports", "url": "/dashboard/revenue", "icon": "💰"},
            {"title": "Partner Management", "url": "/dashboard/partners", "icon": "🤝"}
        ]
    }


# School Dashboard
@router.get("/school/{school_id}", response_model=Dict[str, Any])
async def get_school_dashboard(
    school_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get school dashboard data."""
    
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    
    # Get teams and coaches
    coaches = school.coaches
    total_players = sum(len(coach.players) for coach in coaches)
    
    # Get revenue data
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_revenue = db.query(Order).join(Player).join(Coach).filter(
        Coach.school_id == school_id,
        Order.created_at >= thirty_days_ago
    ).with_entities(Order.total_amount).all()
    
    monthly_revenue_sum = sum(float(order.total_amount) for order in monthly_revenue)
    
    # Get recent activity
    recent_orders = db.query(Order).join(Player).join(Coach).filter(
        Coach.school_id == school_id
    ).order_by(Order.created_at.desc()).limit(10).all()
    
    return {
        "school_info": {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "mascot": school.mascot,
            "school_colors": school.school_colors
        },
        "stats": {
            "total_coaches": len(coaches),
            "total_players": total_players,
            "total_supporters": 0,  # Would need to calculate
            "monthly_revenue": monthly_revenue_sum,
            "qr_code_url": school.qr_code_data
        },
        "coaches": [
            CoachSummary(
                id=coach.id,
                name=f"{coach.user.first_name} {coach.user.last_name}",
                sport=coach.sport,
                players_count=len(coach.players),
                total_revenue=0.0,  # Would need to calculate
                last_activity=coach.updated_at
            )
            for coach in coaches
        ],
        "recent_orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "player_name": f"{order.player.user.first_name} {order.player.user.last_name}",
                "amount": float(order.total_amount),
                "date": order.created_at,
                "status": order.status
            }
            for order in recent_orders
        ],
        "quick_actions": [
            {"title": "Add Coach", "url": f"/dashboard/schools/{school_id}/coaches/new", "icon": "👨‍🏫"},
            {"title": "View QR Code", "url": f"/dashboard/schools/{school_id}/qr-code", "icon": "📱"},
            {"title": "Revenue Report", "url": f"/dashboard/schools/{school_id}/revenue", "icon": "💰"},
            {"title": "Team Management", "url": f"/dashboard/schools/{school_id}/teams", "icon": "🏈"}
        ]
    }


# Coach Dashboard
@router.get("/coach/{coach_id}", response_model=Dict[str, Any])
async def get_coach_dashboard(
    coach_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get coach dashboard data."""
    
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach not found"
        )
    
    # Get players
    players = coach.players
    
    # Get revenue data
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_revenue = db.query(Order).join(Player).filter(
        Player.coach_id == coach_id,
        Order.created_at >= thirty_days_ago
    ).with_entities(Order.total_amount).all()
    
    monthly_revenue_sum = sum(float(order.total_amount) for order in monthly_revenue)
    
    return {
        "coach_info": {
            "id": coach.id,
            "name": f"{coach.user.first_name} {coach.user.last_name}",
            "sport": coach.sport,
            "position": coach.position,
            "school": coach.school.name,
            "qr_code_url": coach.qr_code_data
        },
        "stats": {
            "total_players": len(players),
            "total_supporters": 0,  # Would need to calculate
            "monthly_revenue": monthly_revenue_sum,
            "team_store_active": True  # Would check if team store exists
        },
        "players": [
            PlayerSummary(
                id=player.id,
                name=f"{player.user.first_name} {player.user.last_name}",
                jersey_number=player.jersey_number,
                position=player.position,
                supporters_count=0,  # Would need to calculate
                total_revenue=0.0,  # Would need to calculate
                last_activity=player.updated_at
            )
            for player in players
        ],
        "quick_actions": [
            {"title": "Add Player", "url": f"/dashboard/coaches/{coach_id}/players/new", "icon": "👨‍💼"},
            {"title": "View QR Code", "url": f"/dashboard/coaches/{coach_id}/qr-code", "icon": "📱"},
            {"title": "Team Store", "url": f"/dashboard/coaches/{coach_id}/store", "icon": "🛍️"},
            {"title": "Player Reports", "url": f"/dashboard/coaches/{coach_id}/reports", "icon": "📊"}
        ]
    }


# Player Page (No login required)
@router.get("/player/{player_id}", response_model=Dict[str, Any])
async def get_player_page(
    player_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """Get player page data (public access)."""
    
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Get supporter count
    supporters_count = db.query(Supporter).filter(Supporter.player_id == player_id).count()
    
    # Get recent orders
    recent_orders = db.query(Order).filter(Order.player_id == player_id).order_by(Order.created_at.desc()).limit(5).all()
    
    return {
        "player_info": {
            "id": player.id,
            "name": f"{player.user.first_name} {player.user.last_name}",
            "jersey_number": player.jersey_number,
            "position": player.position,
            "grade_level": player.grade_level,
            "team": f"{player.coach.school.name} {player.coach.sport}",
            "coach": f"{player.coach.user.first_name} {player.coach.user.last_name}",
            "profile_image_url": player.profile_image_url,
            "qr_code_url": player.qr_code_data
        },
        "stats": {
            "supporters_count": supporters_count,
            "total_orders": len(recent_orders),
            "total_revenue": sum(float(order.total_amount) for order in recent_orders)
        },
        "recent_support": [
            {
                "supporter_name": order.supporter.first_name + " " + order.supporter.last_name,
                "amount": float(order.total_amount),
                "date": order.created_at,
                "message": "Thank you for your support!"
            }
            for order in recent_orders
        ],
        "share_options": [
            {"platform": "Facebook", "url": f"https://facebook.com/sharer/sharer.php?u={player.qr_code_data}"},
            {"platform": "Twitter", "url": f"https://twitter.com/intent/tweet?url={player.qr_code_data}"},
            {"platform": "WhatsApp", "url": f"https://wa.me/?text=Support%20me%20at%20{player.qr_code_data}"},
            {"platform": "Email", "url": f"mailto:?subject=Support%20{player.user.first_name}&body=Check%20out%20my%20team%20page:%20{player.qr_code_data}"}
        ]
    }


# Supporter Page (No login required)
@router.get("/supporter/{supporter_id}", response_model=Dict[str, Any])
async def get_supporter_page(
    supporter_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """Get supporter page data (public access)."""
    
    supporter = db.query(Supporter).filter(Supporter.id == supporter_id).first()
    if not supporter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supporter not found"
        )
    
    # Get player they're supporting
    player = supporter.player
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No player associated with this supporter"
        )
    
    # Get their orders
    orders = db.query(Order).filter(Order.supporter_id == supporter_id).order_by(Order.created_at.desc()).all()
    
    return {
        "supporter_info": {
            "id": supporter.id,
            "name": f"{supporter.first_name} {supporter.last_name}",
            "email": supporter.email,
            "phone": supporter.phone
        },
        "player_info": {
            "id": player.id,
            "name": f"{player.user.first_name} {player.user.last_name}",
            "jersey_number": player.jersey_number,
            "position": player.position,
            "team": f"{player.coach.school.name} {player.coach.sport}",
            "profile_image_url": player.profile_image_url
        },
        "support_history": [
            {
                "order_number": order.order_number,
                "amount": float(order.total_amount),
                "date": order.created_at,
                "status": order.status,
                "items": [item.product.name for item in order.order_items]
            }
            for order in orders
        ],
        "quick_actions": [
            {"title": "Make Donation", "url": f"/donate/player/{player.id}", "icon": "💰"},
            {"title": "Team Store", "url": f"/store/team/{player.coach.id}", "icon": "🛍️"},
            {"title": "Local Businesses", "url": f"/local/team/{player.coach.id}", "icon": "🏪"},
            {"title": "Share Player Page", "url": f"/player/{player.id}", "icon": "📱"}
        ]
    }
