"""
Comprehensive database population script
Creates realistic data for all perspectives and workflows
"""

import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
import random
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, create_tables
from app.models import (
    User, School, Team, Business, Product, Order, OrderItem, Payment,
    TeamStore, TeamProduct, TeamOrder, TeamOrderItem, Notification,
    ApiKey, Territory, Partner, PartnerApiIntegration, PartnerOrder,
    RegionalSettings, PartnerPerformanceMetrics, Lead, ServiceArea,
    OrderManagement, OrderItemManagement, OrderStatusUpdate, OrderCommunication,
    MassCommunication, CommunicationLog, ContactList, PromotionalCompanyOrder,
    TeamChatRoom, ChatParticipant, ChatMessage, ChatReaction, ChatSession,
    PromotionalCompany, ProductImage, ProductImportSource, ProductImport,
    ImportedProduct, ProductTemplate, SchoolProduct, ProductFieldMapping,
    Theme, ThemeComponent, ThemeSetting, SalesAgent, Coach, Player, SchoolAdmin
)


def create_sample_data():
    """Create comprehensive sample data for all perspectives"""
    
    db = SessionLocal()
    try:
        print("Creating comprehensive sample data...")
        
        # 1. Create Schools
        schools = create_schools(db)
        print(f"Created {len(schools)} schools")
        
        # 2. Create Teams for each school
        teams = create_teams(db, schools)
        print(f"Created {len(teams)} teams")
        
        # 3. Create Users (Sales Agents, Coaches, Players, Admins)
        users = create_users(db, schools, teams)
        print(f"Created {len(users)} users")
        
        # 4. Create Products and Team Stores
        products = create_products(db)
        team_stores = create_team_stores(db, teams, products)
        print(f"Created {len(products)} products and {len(team_stores)} team stores")
        
        # 5. Create Orders and Revenue
        orders = create_orders(db, teams, products)
        print(f"Created {len(orders)} orders")
        
        # 6. Create Promotional Companies
        promotional_companies = create_promotional_companies(db)
        print(f"Created {len(promotional_companies)} promotional companies")
        
        # 7. Create Local Businesses/Sponsors
        local_businesses = create_local_businesses(db, schools)
        print(f"Created {len(local_businesses)} local businesses")
        
        # 8. Create Territories and Sales Agents
        territories = create_territories(db)
        sales_agents = create_sales_agents(db, territories)
        print(f"Created {len(territories)} territories and {len(sales_agents)} sales agents")
        
        # 9. Create Chat Rooms
        chat_rooms = create_chat_rooms(db, teams)
        print(f"Created {len(chat_rooms)} chat rooms")
        
        # 10. Create Themes
        themes = create_themes(db, schools)
        print(f"Created {len(themes)} themes")
        
        # 11. Create Notifications
        notifications = create_notifications(db, users)
        print(f"Created {len(notifications)} notifications")
        
        # 12. Create API Keys
        api_keys = create_api_keys(db, users)
        print(f"Created {len(api_keys)} API keys")
        
        db.commit()
        print("✅ Database population complete!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error populating database: {str(e)}")
        raise
    finally:
        db.close()


def create_schools(db: Session):
    """Create sample schools"""
    schools_data = [
        {
            "name": "Lincoln High School",
            "address": "1234 Education Ave, Springfield, IL 62701",
            "phone": "(217) 555-0101",
            "email": "info@lincolnhigh.edu",
            "website": "https://lincolnhigh.edu",
            "mascot": "Eagles",
            "colors": "#1E3A8A,#EF4444,#FFFFFF",
            "logo_url": "https://via.placeholder.com/200x200/1E3A8A/FFFFFF?text=LHS",
            "is_active": True
        },
        {
            "name": "Roosevelt High School",
            "address": "5678 Learning Lane, Springfield, IL 62702",
            "phone": "(217) 555-0202",
            "email": "info@roosevelthigh.edu",
            "website": "https://roosevelthigh.edu",
            "mascot": "Rough Riders",
            "colors": "#059669,#F59E0B,#FFFFFF",
            "logo_url": "https://via.placeholder.com/200x200/059669/FFFFFF?text=RHS",
            "is_active": True
        },
        {
            "name": "Washington High School",
            "address": "9012 Knowledge Blvd, Springfield, IL 62703",
            "phone": "(217) 555-0303",
            "email": "info@washingtonhigh.edu",
            "website": "https://washingtonhigh.edu",
            "mascot": "Patriots",
            "colors": "#7C3AED,#10B981,#FFFFFF",
            "logo_url": "https://via.placeholder.com/200x200/7C3AED/FFFFFF?text=WHS",
            "is_active": True
        }
    ]
    
    schools = []
    for school_data in schools_data:
        school = School(**school_data)
        db.add(school)
        schools.append(school)
    
    return schools


if __name__ == "__main__":
    # Create tables first
    create_tables()
    
    # Populate with sample data
    create_sample_data()