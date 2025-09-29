#!/usr/bin/env python3
"""
Database Population Script for Sports Funder
Creates realistic sample data for all entities in the system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.models import *
from app.models.base import Base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

# Create all tables
Base.metadata.create_all(bind=engine)

def populate_database():
    """Populate the database with realistic sample data."""
    db = SessionLocal()
    
    try:
        print("Starting Sports Funder Database Population...")
        
        # Clear existing data (in reverse dependency order)
        print("Clearing existing data...")
        db.query(TeamOrderItem).delete()
        db.query(TeamOrder).delete()
        db.query(TeamProduct).delete()
        db.query(TeamStore).delete()
        db.query(TeamEvent).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Payment).delete()
        db.query(Supporter).delete()
        db.query(Player).delete()
        db.query(Coach).delete()
        db.query(LocalBusiness).delete()
        db.query(Team).delete()
        db.query(School).delete()
        db.query(SalesAgent).delete()
        db.query(User).delete()
        db.query(Product).delete()
        db.query(PromotionalCompany).delete()
        db.query(ProductTemplate).delete()
        # db.query(Theme).delete()  # Skip theme for now
        db.commit()
        
        # 1. Create Users and Sales Agents
        print("Creating users and sales agents...")
        users_data = [
            {"email": "admin@sportsfunder.com", "first_name": "Admin", "last_name": "User", "role": "admin"},
            {"email": "sarah.johnson@sportsfunder.com", "first_name": "Sarah", "last_name": "Johnson", "role": "sales_agent"},
            {"email": "mike.rodriguez@sportsfunder.com", "first_name": "Mike", "last_name": "Rodriguez", "role": "sales_agent"},
            {"email": "lisa.chen@sportsfunder.com", "first_name": "Lisa", "last_name": "Chen", "role": "sales_agent"},
            {"email": "david.wilson@sportsfunder.com", "first_name": "David", "last_name": "Wilson", "role": "sales_agent"},
        ]
        
        users = []
        sales_agents = []
        
        for i, user_data in enumerate(users_data):
            user = User(
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                hashed_password="hashed_password_placeholder",
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.flush()  # Get the ID
            users.append(user)
            
            if user_data["role"] == "sales_agent":
                sales_agent = SalesAgent(
                    user_id=user.id,
                    commission_rate=0.15,
                    total_schools_signed=random.randint(5, 15),
                    total_revenue_generated=random.randint(25000, 75000),
                    monthly_quota=50000,
                    territory_id=1
                )
                db.add(sales_agent)
                sales_agents.append(sales_agent)
        
        db.commit()
        
        # 2. Create Schools
        print("Creating schools...")
        schools_data = [
            {"name": "Austin High School", "city": "Austin", "state": "TX", "sales_agent_id": sales_agents[0].id},
            {"name": "Westlake High School", "city": "Austin", "state": "TX", "sales_agent_id": sales_agents[0].id},
            {"name": "Lake Travis High School", "city": "Austin", "state": "TX", "sales_agent_id": sales_agents[1].id},
            {"name": "Round Rock High School", "city": "Round Rock", "state": "TX", "sales_agent_id": sales_agents[1].id},
            {"name": "Cedar Park High School", "city": "Cedar Park", "state": "TX", "sales_agent_id": sales_agents[2].id},
            {"name": "Leander High School", "city": "Leander", "state": "TX", "sales_agent_id": sales_agents[2].id},
            {"name": "Georgetown High School", "city": "Georgetown", "state": "TX", "sales_agent_id": sales_agents[3].id},
            {"name": "Pflugerville High School", "city": "Pflugerville", "state": "TX", "sales_agent_id": sales_agents[3].id},
            {"name": "Hutto High School", "city": "Hutto", "state": "TX", "sales_agent_id": sales_agents[0].id},
            {"name": "Manor High School", "city": "Manor", "state": "TX", "sales_agent_id": sales_agents[1].id},
        ]
        
        schools = []
        for school_data in schools_data:
            school = School(
                name=school_data["name"],
                address=f"123 Main St, {school_data['city']}, {school_data['state']} 78701",
                city=school_data["city"],
                state=school_data["state"],
                zip_code="78701",
                phone="(512) 555-0123",
                email=f"info@{school_data['name'].lower().replace(' ', '')}.edu",
                website=f"https://{school_data['name'].lower().replace(' ', '')}.edu",
                enrollment=random.randint(800, 2500),
                sales_agent_id=school_data["sales_agent_id"],
                created_at=datetime.now() - timedelta(days=random.randint(1, 90))
            )
            db.add(school)
            schools.append(school)
        
        db.commit()
        
        # 3. Create Local Businesses
        print("Creating local businesses...")
        business_data = [
            {"name": "Round Rock Auto Repair", "category": "Automotive", "city": "Round Rock", "school_id": schools[3].id},
            {"name": "Austin Pizza Palace", "category": "Restaurant", "city": "Austin", "school_id": schools[0].id},
            {"name": "Westlake Dental Care", "category": "Healthcare", "city": "Austin", "school_id": schools[1].id},
            {"name": "Lake Travis Insurance", "category": "Insurance", "city": "Austin", "school_id": schools[2].id},
            {"name": "Cedar Park Fitness", "category": "Fitness", "city": "Cedar Park", "school_id": schools[4].id},
            {"name": "Leander Coffee Co", "category": "Restaurant", "city": "Leander", "school_id": schools[5].id},
            {"name": "Georgetown Law Firm", "category": "Legal", "city": "Georgetown", "school_id": schools[6].id},
            {"name": "Pflugerville Realty", "category": "Real Estate", "city": "Pflugerville", "school_id": schools[7].id},
            {"name": "Hutto Hardware", "category": "Retail", "city": "Hutto", "school_id": schools[8].id},
            {"name": "Manor Medical Center", "category": "Healthcare", "city": "Manor", "school_id": schools[9].id},
        ]
        
        local_businesses = []
        for business_info in business_data:
            business = LocalBusiness(
                name=business_info["name"],
                category=business_info["category"],
                address=f"456 Business Ave, {business_info['city']}, TX 78701",
                city=business_info["city"],
                state="TX",
                zip_code="78701",
                phone="(512) 555-0456",
                email=f"info@{business_info['name'].lower().replace(' ', '')}.com",
                website=f"https://{business_info['name'].lower().replace(' ', '')}.com",
                description=f"Local {business_info['category'].lower()} business serving the {business_info['city']} community.",
                school_id=business_info["school_id"],
                is_active=True,
                created_at=datetime.now() - timedelta(days=random.randint(1, 60))
            )
            db.add(business)
            local_businesses.append(business)
        
        db.commit()
        
        # 4. Create Products
        print("Creating products...")
        product_data = [
            {"name": "Team T-Shirt", "description": "Official team t-shirt", "price": 25.00, "category": "Apparel"},
            {"name": "Hoodie", "description": "Team hoodie with school logo", "price": 45.00, "category": "Apparel"},
            {"name": "Baseball Cap", "description": "Team baseball cap", "price": 20.00, "category": "Accessories"},
            {"name": "Water Bottle", "description": "Insulated team water bottle", "price": 15.00, "category": "Accessories"},
            {"name": "Sticker Pack", "description": "Set of team stickers", "price": 8.00, "category": "Accessories"},
            {"name": "Keychain", "description": "Team keychain", "price": 5.00, "category": "Accessories"},
            {"name": "Mug", "description": "Team coffee mug", "price": 12.00, "category": "Accessories"},
            {"name": "Banner", "description": "Team banner for games", "price": 35.00, "category": "Decor"},
        ]
        
        products = []
        for product_info in product_data:
            product = Product(
                name=product_info["name"],
                description=product_info["description"],
                price=product_info["price"],
                category=product_info["category"],
                stock_quantity=random.randint(10, 100),
                is_active=True,
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.add(product)
            products.append(product)
        
        db.commit()
        
        # 5. Create Promotional Companies
        print("Creating promotional companies...")
        promo_companies_data = [
            {"name": "CustomInk", "contact_name": "John Smith", "contact_email": "john@customink.com"},
            {"name": "VistaPrint", "contact_name": "Sarah Davis", "contact_email": "sarah@vistaprint.com"},
            {"name": "Printful", "contact_name": "Mike Johnson", "contact_email": "mike@printful.com"},
        ]
        
        promo_companies = []
        for company_info in promo_companies_data:
            company = PromotionalCompany(
                name=company_info["name"],
                contact_name=company_info["contact_name"],
                contact_email=company_info["contact_email"],
                contact_phone="(555) 123-4567",
                website=f"https://{company_info['name'].lower()}.com",
                can_update_images=True,
                can_update_prices=False,
                can_update_descriptions=True,
                can_add_products=True,
                access_all_schools=True,
                is_active=True
            )
            db.add(company)
            promo_companies.append(company)
        
        db.commit()
        
        # 6. Create Theme (skip for now)
        print("Skipping theme creation...")
        
        print("Database population completed successfully!")
        print(f"Created:")
        print(f"   - {len(users)} users")
        print(f"   - {len(sales_agents)} sales agents")
        print(f"   - {len(schools)} schools")
        print(f"   - {len(local_businesses)} local businesses")
        print(f"   - {len(products)} products")
        print(f"   - {len(promo_companies)} promotional companies")
        print(f"   - 0 themes (skipped)")
        
    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()
