#!/usr/bin/env python3
"""
Create comprehensive fake data for Sports Funder application.
This creates realistic accounts, schools, teams, players, supporters, and business data.
"""

from app.core.database import SessionLocal
from app.models.partner_system import Partner, PartnerType, PartnerStatus
from app.models.organization import School, Team
from app.models.user import SalesAgent, User, Coach, Player
from app.models.commerce import Supporter, Product, Order, OrderItem
from app.models.team_features import TeamEvent, EventType
from app.models.business import LocalBusiness
import hashlib
from datetime import datetime, timedelta
import random

def create_comprehensive_data():
    """Create comprehensive realistic fake data."""
    
    db = SessionLocal()

    try:
        print('Creating comprehensive fake data...')
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.query(OrderItem).delete()
        # db.query(Order).delete()
        # db.query(Supporter).delete()
        # db.query(Player).delete()
        # db.query(Coach).delete()
        # db.query(Team).delete()
        # db.query(School).delete()
        # db.query(SalesAgent).delete()
        # db.query(User).delete()
        # db.query(Partner).delete()
        # db.query(Product).delete()
        
        # Create Sales Agents
        sales_agents_data = [
            {
                'email': 'sarah.johnson@sportsfunder.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'territory': 'Austin Metro',
                'commission_rate': 5.0,
                'total_schools_signed': 12,
                'total_revenue_generated': 45000,
                'monthly_quota': 50000
            },
            {
                'email': 'mike.davis@sportsfunder.com',
                'first_name': 'Mike',
                'last_name': 'Davis',
                'territory': 'Houston Metro',
                'commission_rate': 5.5,
                'total_schools_signed': 10,
                'total_revenue_generated': 38000,
                'monthly_quota': 45000
            },
            {
                'email': 'jennifer.lee@sportsfunder.com',
                'first_name': 'Jennifer',
                'last_name': 'Lee',
                'territory': 'Dallas Metro',
                'commission_rate': 4.8,
                'total_schools_signed': 9,
                'total_revenue_generated': 32000,
                'monthly_quota': 40000
            },
            {
                'email': 'robert.wilson@sportsfunder.com',
                'first_name': 'Robert',
                'last_name': 'Wilson',
                'territory': 'San Antonio Metro',
                'commission_rate': 5.2,
                'total_schools_signed': 8,
                'total_revenue_generated': 28000,
                'monthly_quota': 35000
            },
            {
                'email': 'lisa.martinez@sportsfunder.com',
                'first_name': 'Lisa',
                'last_name': 'Martinez',
                'territory': 'Fort Worth Metro',
                'commission_rate': 4.9,
                'total_schools_signed': 7,
                'total_revenue_generated': 25000,
                'monthly_quota': 30000
            }
        ]
        
        sales_agents = []
        for agent_data in sales_agents_data:
            user = User(
                email=agent_data['email'],
                hashed_password=hashlib.sha256('password123'.encode()).hexdigest(),
                first_name=agent_data['first_name'],
                last_name=agent_data['last_name'],
                is_active=True
            )
            db.add(user)
            db.flush()
            
            sales_agent = SalesAgent(
                user_id=user.id,
                employee_id=f'SA{user.id:03d}',
                commission_rate=agent_data['commission_rate'],
                total_schools_signed=agent_data['total_schools_signed'],
                total_revenue_generated=agent_data['total_revenue_generated'],
                monthly_quota=agent_data['monthly_quota']
            )
            db.add(sales_agent)
            sales_agents.append(sales_agent)
            db.flush()
        
        # Create Schools
        schools_data = [
            # Austin Metro Schools
            {'name': 'Austin High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 1200, 'teams': 8},
            {'name': 'Westlake High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 950, 'teams': 6},
            {'name': 'Lake Travis High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 1100, 'teams': 7},
            {'name': 'Anderson High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 800, 'teams': 5},
            {'name': 'McCallum High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 650, 'teams': 4},
            {'name': 'Bowie High School', 'city': 'Austin', 'state': 'TX', 'agent': 0, 'students': 900, 'teams': 6},
            
            # Houston Metro Schools
            {'name': 'Houston High School', 'city': 'Houston', 'state': 'TX', 'agent': 1, 'students': 1400, 'teams': 9},
            {'name': 'Katy High School', 'city': 'Houston', 'state': 'TX', 'agent': 1, 'students': 1200, 'teams': 8},
            {'name': 'Sugar Land High School', 'city': 'Houston', 'state': 'TX', 'agent': 1, 'students': 1000, 'teams': 7},
            {'name': 'Cypress High School', 'city': 'Houston', 'state': 'TX', 'agent': 1, 'students': 1100, 'teams': 7},
            
            # Dallas Metro Schools
            {'name': 'Dallas High School', 'city': 'Dallas', 'state': 'TX', 'agent': 2, 'students': 1300, 'teams': 8},
            {'name': 'Plano High School', 'city': 'Dallas', 'state': 'TX', 'agent': 2, 'students': 1150, 'teams': 7},
            {'name': 'Frisco High School', 'city': 'Dallas', 'state': 'TX', 'agent': 2, 'students': 1050, 'teams': 6},
            
            # San Antonio Metro Schools
            {'name': 'San Antonio High School', 'city': 'San Antonio', 'state': 'TX', 'agent': 3, 'students': 1250, 'teams': 8},
            {'name': 'Alamo Heights High School', 'city': 'San Antonio', 'state': 'TX', 'agent': 3, 'students': 900, 'teams': 6},
            {'name': 'Northside High School', 'city': 'San Antonio', 'state': 'TX', 'agent': 3, 'students': 1000, 'teams': 7},
            
            # Fort Worth Metro Schools
            {'name': 'Fort Worth High School', 'city': 'Fort Worth', 'state': 'TX', 'agent': 4, 'students': 1100, 'teams': 7},
            {'name': 'Arlington High School', 'city': 'Fort Worth', 'state': 'TX', 'agent': 4, 'students': 950, 'teams': 6},
        ]
        
        schools = []
        for school_data in schools_data:
            school = School(
                name=school_data['name'],
                address=f'{random.randint(100, 9999)} Main St',
                city=school_data['city'],
                state=school_data['state'],
                zip_code=f'{random.randint(10000, 99999)}',
                phone=f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                email=f'info@{school_data["name"].lower().replace(" ", "")}.edu',
                website=f'https://{school_data["name"].lower().replace(" ", "")}.edu',
                school_type='High School',
                district=f'{school_data["city"]} Independent School District',
                mascot=random.choice(['Eagles', 'Tigers', 'Lions', 'Bears', 'Wildcats', 'Panthers', 'Falcons', 'Hawks']),
                school_colors=random.choice(['Red & White', 'Blue & Gold', 'Green & White', 'Purple & Gold', 'Orange & Black']),
                qr_code_data=f'school_{school_data["name"].lower().replace(" ", "_")}_{random.randint(1000, 9999)}',
                sales_agent_id=sales_agents[school_data['agent']].id
            )
            db.add(school)
            schools.append(school)
            db.flush()
        
        # Create Coaches and Teams
        coaches = []
        teams = []
        sports = ['Football', 'Basketball', 'Baseball', 'Soccer', 'Volleyball', 'Track & Field', 'Swimming', 'Tennis']
        
        for school in schools:
            # Create 2-4 coaches per school
            num_coaches = random.randint(2, 4)
            for i in range(num_coaches):
                sport = sports[i % len(sports)]
                
                coach_user = User(
                    email=f'coach{i+1}@{school.name.lower().replace(" ", "")}.edu',
                    hashed_password=hashlib.sha256('password123'.encode()).hexdigest(),
                    first_name=f'Coach{random.choice(["John", "Mike", "David", "Chris", "Mark", "Steve", "Tom", "Jim"])}',
                    last_name=random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']),
                    is_active=True
                )
                db.add(coach_user)
                db.flush()
                
                coach = Coach(
                    user_id=coach_user.id,
                    school_id=school.id,
                    sport=sport,
                    years_experience=random.randint(5, 20)
                )
                db.add(coach)
                coaches.append(coach)
                db.flush()
                
                # Create team
                team = Team(
                    name=f'{school.name} {sport}',
                    sport=sport,
                    season='Fall 2025',
                    school_id=school.id,
                    coach_id=coach.id
                )
                db.add(team)
                teams.append(team)
                db.flush()
        
        # Create Players
        players = []
        positions = {
            'Football': ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'],
            'Basketball': ['PG', 'SG', 'SF', 'PF', 'C'],
            'Baseball': ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'],
            'Soccer': ['GK', 'DEF', 'MID', 'FWD'],
            'Volleyball': ['OH', 'MB', 'S', 'L', 'DS'],
            'Track & Field': ['Sprint', 'Distance', 'Field', 'Hurdles'],
            'Swimming': ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'],
            'Tennis': ['Singles', 'Doubles']
        }
        
        for team in teams:
            # Create 10-25 players per team
            num_players = random.randint(10, 25)
            team_positions = positions.get(team.sport, ['Player'])
            
            for i in range(num_players):
                player_user = User(
                    email=f'player{i+1}@{team.school.name.lower().replace(" ", "")}.edu',
                    hashed_password=hashlib.sha256('password123'.encode()).hexdigest(),
                    first_name=random.choice(['John', 'Mike', 'David', 'Chris', 'Mark', 'Steve', 'Tom', 'Jim', 'Alex', 'Ryan']),
                    last_name=random.choice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore']),
                    is_active=True
                )
                db.add(player_user)
                db.flush()
                
                player = Player(
                    user_id=player_user.id,
                    coach_id=team.coach_id,
                    team_id=team.id,
                    position=random.choice(team_positions),
                    jersey_number=random.randint(1, 99),
                    qr_code_data=f'player_{player_user.id}_{random.randint(1000, 9999)}',
                    qr_code_image_url=f'/static/qr_codes/player_{player_user.id}.png',
                    profile_image_url=f'/static/players/player_{player_user.id}.jpg'
                )
                db.add(player)
                players.append(player)
                db.flush()
        
        # Create Supporters
        supporters = []
        supporter_names = [
            ('John', 'Smith'), ('Jane', 'Doe'), ('Mike', 'Johnson'), ('Sarah', 'Williams'),
            ('David', 'Brown'), ('Lisa', 'Jones'), ('Chris', 'Garcia'), ('Amy', 'Miller'),
            ('Mark', 'Davis'), ('Jennifer', 'Wilson'), ('Steve', 'Moore'), ('Karen', 'Taylor'),
            ('Tom', 'Anderson'), ('Michelle', 'Thomas'), ('Jim', 'Jackson'), ('Susan', 'White')
        ]
        
        for player in players[:200]:  # Create supporters for first 200 players
            # Create 2-8 supporters per player
            num_supporters = random.randint(2, 8)
            for i in range(num_supporters):
                first_name, last_name = random.choice(supporter_names)
                
                supporter = Supporter(
                    first_name=first_name,
                    last_name=last_name,
                    email=f'{first_name.lower()}.{last_name.lower()}{i}@example.com',
                    phone=f'555-{random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    address_line1=f'{random.randint(100, 9999)} {random.choice(["Oak", "Maple", "Pine", "Cedar", "Elm"])} St',
                    city=player.team.school.city,
                    state=player.team.school.state,
                    zip_code=f'{random.randint(10000, 99999)}',
                    player_id=player.id
                )
                db.add(supporter)
                supporters.append(supporter)
                db.flush()
        
        # Create Products
        products_data = [
            {'name': 'Team Jersey', 'price': 45.00, 'description': 'Official team jersey with player number', 'sku': 'JER-001'},
            {'name': 'Team Hat', 'price': 25.00, 'description': 'Official team hat with logo', 'sku': 'HAT-001'},
            {'name': 'Team Mug', 'price': 15.00, 'description': 'Team logo ceramic mug', 'sku': 'MUG-001'},
            {'name': 'Team Sticker Pack', 'price': 5.00, 'description': 'Pack of 10 team logo stickers', 'sku': 'STK-001'},
            {'name': 'Team Banner', 'price': 35.00, 'description': 'Large team banner for games', 'sku': 'BNR-001'},
            {'name': 'Team T-Shirt', 'price': 20.00, 'description': 'Official team t-shirt', 'sku': 'TSH-001'},
            {'name': 'Team Hoodie', 'price': 40.00, 'description': 'Team logo hoodie', 'sku': 'HOD-001'},
            {'name': 'Team Keychain', 'price': 8.00, 'description': 'Team logo keychain', 'sku': 'KEY-001'},
            {'name': 'Team Water Bottle', 'price': 18.00, 'description': 'Insulated team water bottle', 'sku': 'BTL-001'},
            {'name': 'Team Lanyard', 'price': 12.00, 'description': 'Team logo lanyard', 'sku': 'LAN-001'},
        ]
        
        products = []
        for product_data in products_data:
            product = Product(
                name=product_data['name'],
                price=product_data['price'],
                description=product_data['description'],
                sku=product_data['sku'],
                stock_quantity=random.randint(50, 200),
                is_active=True
            )
            db.add(product)
            products.append(product)
            db.flush()
        
        # Create Orders
        orders = []
        for supporter in supporters[:500]:  # Create orders for first 500 supporters
            order = Order(
                order_number=f'ORD-{random.randint(100000, 999999)}',
                total_amount=0,  # Will be calculated
                status=random.choice(['completed', 'completed', 'completed', 'pending', 'shipped']),
                supporter_id=supporter.id
            )
            db.add(order)
            orders.append(order)
            db.flush()
            
            # Create order items
            total = 0
            num_items = random.randint(1, 4)  # 1-4 items per order
            for _ in range(num_items):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=product.price,
                    total_price=product.price * quantity
                )
                db.add(item)
                total += item.total_price
            
            order.total_amount = total
            db.flush()
        
        # Create Local Businesses
        businesses_data = [
            {'name': 'Austin Sports Equipment', 'city': 'Austin', 'services': ['Equipment Sales', 'Team Uniforms'], 'rating': 4.5},
            {'name': 'Houston Sports Gear', 'city': 'Houston', 'services': ['Sports Gear', 'Equipment Rental'], 'rating': 4.3},
            {'name': 'Dallas Team Store', 'city': 'Dallas', 'services': ['Team Merchandise', 'Custom Jerseys'], 'rating': 4.7},
            {'name': 'San Antonio Sports', 'city': 'San Antonio', 'services': ['Sports Equipment', 'Team Supplies'], 'rating': 4.2},
            {'name': 'Fort Worth Athletics', 'city': 'Fort Worth', 'services': ['Athletic Equipment', 'Team Apparel'], 'rating': 4.4},
            {'name': 'Austin Fitness Center', 'city': 'Austin', 'services': ['Fitness Training', 'Sports Conditioning'], 'rating': 4.6},
            {'name': 'Houston Nutrition Store', 'city': 'Houston', 'services': ['Sports Nutrition', 'Supplements'], 'rating': 4.1},
            {'name': 'Dallas Physical Therapy', 'city': 'Dallas', 'services': ['Sports Medicine', 'Injury Recovery'], 'rating': 4.8},
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
                rating=business_data['rating'],
                google_rating=business_data['rating'],
                google_review_count=random.randint(50, 200),
                service_radius_miles=random.randint(15, 30),
                service_cities=[business_data['city'], f'{business_data["city"]} Suburbs']
            )
            db.add(business)
        
        # Create Team Events
        for team in teams:
            # Create 3-6 events per team
            num_events = random.randint(3, 6)
            for i in range(num_events):
                event = TeamEvent(
                    title=f'{team.sport} Game {i+1}',
                    description=f'Regular season {team.sport.lower()} game',
                    event_type=EventType.GAME,
                    start_datetime=datetime.now() + timedelta(days=random.randint(1, 30)),
                    end_datetime=datetime.now() + timedelta(days=random.randint(1, 30), hours=2),
                    location=f'{team.school.name} Stadium',
                    team_id=team.id
                )
                db.add(event)
        
        db.commit()
        print('Comprehensive fake data created successfully!')
        print(f'Created:')
        print(f'  - {len(sales_agents)} Sales Agents')
        print(f'  - {len(schools)} Schools')
        print(f'  - {len(coaches)} Coaches')
        print(f'  - {len(teams)} Teams')
        print(f'  - {len(players)} Players')
        print(f'  - {len(supporters)} Supporters')
        print(f'  - {len(products)} Products')
        print(f'  - {len(orders)} Orders')
        print(f'  - {len(businesses_data)} Local Businesses')
        
    except Exception as e:
        print(f'Error: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_comprehensive_data()
