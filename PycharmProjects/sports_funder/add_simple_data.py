#!/usr/bin/env python3
"""
Add simple, realistic data to Sports Funder database.
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

def add_simple_data():
    """Add simple realistic data."""
    
    db = SessionLocal()

    try:
        print('Adding simple realistic data...')
        
        # Get existing sales agents
        existing_agents = db.query(SalesAgent).all()
        print(f'Found {len(existing_agents)} existing sales agents')
        
        # Add more schools for existing agents
        schools_data = [
            {'name': 'Round Rock High School', 'city': 'Round Rock', 'state': 'TX', 'agent_id': existing_agents[0].id if existing_agents else 1},
            {'name': 'Cedar Park High School', 'city': 'Cedar Park', 'state': 'TX', 'agent_id': existing_agents[0].id if existing_agents else 1},
            {'name': 'Pflugerville High School', 'city': 'Pflugerville', 'state': 'TX', 'agent_id': existing_agents[0].id if existing_agents else 1},
            {'name': 'Georgetown High School', 'city': 'Georgetown', 'state': 'TX', 'agent_id': existing_agents[0].id if existing_agents else 1},
            {'name': 'Leander High School', 'city': 'Leander', 'state': 'TX', 'agent_id': existing_agents[0].id if existing_agents else 1},
        ]
        
        for school_data in schools_data:
            # Check if school already exists
            existing_school = db.query(School).filter(School.name == school_data['name']).first()
            if not existing_school:
                school = School(
                    name=school_data['name'],
                    address=f'{random.randint(100, 9999)} Main St',
                    city=school_data['city'],
                    state=school_data['state'],
                    zip_code=f'{random.randint(10000, 99999)}',
                    phone=f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    email=f'info@{school_data["name"].lower().replace(" ", "")}.edu',
                    school_type='High School',
                    district=f'{school_data["city"]} ISD',
                    mascot=random.choice(['Eagles', 'Tigers', 'Lions', 'Bears', 'Wildcats']),
                    school_colors=random.choice(['Red & White', 'Blue & Gold', 'Green & White']),
                    qr_code_data=f'school_{school_data["name"].lower().replace(" ", "_")}_{random.randint(1000, 9999)}',
                    sales_agent_id=school_data['agent_id']
                )
                db.add(school)
                print(f'Added school: {school_data["name"]}')
        
        # Add more products
        products_data = [
            {'name': 'Team Polo Shirt', 'price': 30.00, 'description': 'Official team polo shirt', 'sku': 'POL-001'},
            {'name': 'Team Sweatshirt', 'price': 35.00, 'description': 'Team logo sweatshirt', 'sku': 'SWT-001'},
            {'name': 'Team Shorts', 'price': 22.00, 'description': 'Team logo athletic shorts', 'sku': 'SHT-001'},
            {'name': 'Team Socks', 'price': 12.00, 'description': 'Team logo athletic socks', 'sku': 'SOC-001'},
            {'name': 'Team Towel', 'price': 18.00, 'description': 'Team logo sports towel', 'sku': 'TWL-001'},
        ]
        
        for product_data in products_data:
            existing_product = db.query(Product).filter(Product.sku == product_data['sku']).first()
            if not existing_product:
                product = Product(
                    name=product_data['name'],
                    price=product_data['price'],
                    description=product_data['description'],
                    sku=product_data['sku'],
                    stock_quantity=random.randint(50, 200),
                    is_active=True
                )
                db.add(product)
                print(f'Added product: {product_data["name"]}')
        
        # Add local businesses
        businesses_data = [
            {'name': 'Round Rock Sports', 'city': 'Round Rock', 'services': ['Sports Equipment', 'Team Apparel']},
            {'name': 'Cedar Park Athletics', 'city': 'Cedar Park', 'services': ['Athletic Training', 'Equipment Sales']},
            {'name': 'Pflugerville Sports Center', 'city': 'Pflugerville', 'services': ['Sports Facility', 'Equipment Rental']},
        ]
        
        for business_data in businesses_data:
            existing_business = db.query(Partner).filter(Partner.company_name == business_data['name']).first()
            if not existing_business:
                business = Partner(
                    company_name=business_data['name'],
                    contact_name=f'Owner {business_data["name"].split()[0]}',
                    contact_title='Owner',
                    phone=f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    email=f'contact@{business_data["name"].lower().replace(" ", "")}.com',
                    address_line1=f'{random.randint(100, 9999)} Commerce St',
                    city=business_data['city'],
                    state='TX',
                    zip_code=f'{random.randint(10000, 99999)}',
                    country='US',
                    partner_type=PartnerType.LOCAL_BUSINESS,
                    status=PartnerStatus.ACTIVE,
                    description=f'Local sports business serving {business_data["city"]} area.',
                    services_offered=business_data['services'],
                    specialties=['Football', 'Basketball', 'Baseball'],
                    years_in_business=random.randint(5, 15),
                    rating=round(random.uniform(3.5, 5.0), 1),
                    google_rating=round(random.uniform(3.5, 5.0), 1),
                    google_review_count=random.randint(20, 100),
                    service_radius_miles=random.randint(10, 25),
                    service_cities=[business_data['city']]
                )
                db.add(business)
                print(f'Added business: {business_data["name"]}')
        
        db.commit()
        print('Simple data added successfully!')
        
    except Exception as e:
        print(f'Error: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_simple_data()
