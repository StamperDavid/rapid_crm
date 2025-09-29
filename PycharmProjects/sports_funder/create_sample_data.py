#!/usr/bin/env python3
"""
Create comprehensive sample data for Sports Funder application.
"""

from app.core.database import SessionLocal
from app.models.partner_system import Partner, PartnerType, PartnerStatus
from app.models.organization import School, Team
from app.models.user import SalesAgent, User, Coach, Player
from app.models.commerce import Supporter, Product, Order, OrderItem
from app.models.team_features import TeamEvent, EventType
import hashlib
from datetime import datetime, timedelta
import random

def create_sample_data():
    """Create comprehensive sample data for the application."""
    
    # Create a database session
    db = SessionLocal()

    try:
        print('Creating comprehensive sample data...')
        
        # Create sample users and sales agents
        users_data = [
            {'email': 'sarah.johnson@sportsfunder.com', 'first_name': 'Sarah', 'last_name': 'Johnson', 'territory': 'Austin Metro'},
            {'email': 'mike.davis@sportsfunder.com', 'first_name': 'Mike', 'last_name': 'Davis', 'territory': 'Houston Metro'},
            {'email': 'jennifer.lee@sportsfunder.com', 'first_name': 'Jennifer', 'last_name': 'Lee', 'territory': 'Dallas Metro'},
            {'email': 'robert.wilson@sportsfunder.com', 'first_name': 'Robert', 'last_name': 'Wilson', 'territory': 'San Antonio Metro'},
        ]
        
        sales_agents = []
        for user_data in users_data:
            user = User(
                email=user_data['email'],
                hashed_password=hashlib.sha256('pass123'.encode()).hexdigest(),
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                is_active=True
            )
            db.add(user)
            db.flush()
            
            sales_agent = SalesAgent(
                user_id=user.id,
                employee_id=f'SA{user.id:03d}',
                commission_rate=5.0,
                total_schools_signed=random.randint(8, 15),
                total_revenue_generated=random.randint(30000, 80000),
                monthly_quota=50000
            )
            db.add(sales_agent)
            sales_agents.append(sales_agent)
            db.flush()
        
        # Create sample schools
        schools_data = [
            {'name': 'Austin High School', 'city': 'Austin', 'state': 'TX', 'agent': 0},
            {'name': 'Westlake High School', 'city': 'Austin', 'state': 'TX', 'agent': 0},
            {'name': 'Lake Travis High School', 'city': 'Austin', 'state': 'TX', 'agent': 0},
            {'name': 'Anderson High School', 'city': 'Austin', 'state': 'TX', 'agent': 0},
            {'name': 'McCallum High School', 'city': 'Austin', 'state': 'TX', 'agent': 0},
            {'name': 'Houston High School', 'city': 'Houston', 'state': 'TX', 'agent': 1},
            {'name': 'Katy High School', 'city': 'Houston', 'state': 'TX', 'agent': 1},
            {'name': 'Sugar Land High School', 'city': 'Houston', 'state': 'TX', 'agent': 1},
            {'name': 'Dallas High School', 'city': 'Dallas', 'state': 'TX', 'agent': 2},
            {'name': 'Plano High School', 'city': 'Dallas', 'state': 'TX', 'agent': 2},
            {'name': 'San Antonio High School', 'city': 'San Antonio', 'state': 'TX', 'agent': 3},
            {'name': 'Alamo Heights High School', 'city': 'San Antonio', 'state': 'TX', 'agent': 3},
        ]
        
        schools = []
        for school_data in schools_data:
            school = School(
                name=school_data['name'],
                address=f'{random.randint(100, 9999)} Main St',
                city=school_data['city'],
                state=school_data['state'],
                zip_code=f'{random.randint(10000, 99999)}',
                qr_code_data=f'school_{school_data["name"].lower().replace(" ", "_")}_{random.randint(1000, 9999)}',
                sales_agent_id=sales_agents[school_data['agent']].id
            )
            db.add(school)
            schools.append(school)
            db.flush()
        
        # Create sample products
        products = [
            {'name': 'Team Jersey', 'price': 45.00, 'description': 'Official team jersey'},
            {'name': 'Team Hat', 'price': 25.00, 'description': 'Official team hat'},
            {'name': 'Team Mug', 'price': 15.00, 'description': 'Team logo mug'},
            {'name': 'Team Sticker', 'price': 5.00, 'description': 'Team logo sticker pack'},
            {'name': 'Team Banner', 'price': 35.00, 'description': 'Team banner for games'},
        ]
        
        product_objects = []
        for i, product_data in enumerate(products):
            product = Product(
                name=product_data['name'],
                price=product_data['price'],
                description=product_data['description'],
                sku=f'PROD-{i+1:03d}',
                stock_quantity=random.randint(50, 200),
                is_active=True
            )
            db.add(product)
            product_objects.append(product)
            db.flush()
        
        # Create sample local businesses
        businesses_data = [
            {'name': 'Austin Sports Equipment', 'city': 'Austin', 'services': ['Equipment Sales', 'Team Uniforms']},
            {'name': 'Houston Sports Gear', 'city': 'Houston', 'services': ['Sports Gear', 'Equipment Rental']},
            {'name': 'Dallas Team Store', 'city': 'Dallas', 'services': ['Team Merchandise', 'Custom Jerseys']},
            {'name': 'San Antonio Sports', 'city': 'San Antonio', 'services': ['Sports Equipment', 'Team Supplies']},
        ]
        
        for business_data in businesses_data:
            business = Partner(
                company_name=business_data['name'],
                contact_name=f'Owner {business_data["name"].split()[0]}',
                contact_title='Owner',
                phone=f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                email=f'contact@{business_data["name"].lower().replace(" ", "")}.com',
                website=f'https://{business_data["name"].lower().replace(" ", "")}.com',
                address_line1=f'{random.randint(100, 9999)} Commerce St',
                city=business_data['city'],
                state='TX',
                zip_code=f'{random.randint(10000, 99999)}',
                country='US',
                partner_type=PartnerType.LOCAL_BUSINESS,
                status=PartnerStatus.ACTIVE,
                description=f'Local sports equipment supplier serving {business_data["city"]} area schools and teams.',
                services_offered=business_data['services'],
                specialties=['Football', 'Basketball', 'Baseball'],
                years_in_business=random.randint(5, 25),
                rating=round(random.uniform(3.5, 5.0), 1),
                google_rating=round(random.uniform(3.5, 5.0), 1),
                google_review_count=random.randint(50, 200),
                service_radius_miles=random.randint(15, 30),
                service_cities=[business_data['city'], f'{business_data["city"]} Suburbs']
            )
            db.add(business)
        
        db.commit()
        print('Sample data created successfully!')
        print(f'Created: {len(sales_agents)} sales agents, {len(schools)} schools, {len(product_objects)} products, {len(businesses_data)} businesses')
        
    except Exception as e:
        print(f'Error: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
