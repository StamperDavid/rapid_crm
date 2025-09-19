-- Rapid CRM Database Seed Data
-- Populate database with comprehensive mock data for all entities

-- Clear existing data (in development)
DELETE FROM companies;
DELETE FROM contacts;
DELETE FROM vehicles;
DELETE FROM drivers;
DELETE FROM deals;
DELETE FROM invoices;
DELETE FROM leads;
DELETE FROM campaigns;
DELETE FROM conversations;
DELETE FROM messages;
DELETE FROM agents;
DELETE FROM knowledge_bases;
DELETE FROM persistent_conversation_contexts;
DELETE FROM client_profiles;
DELETE FROM agent_memory_banks;

-- Insert Companies
INSERT INTO companies (
    id, physical_street_address, physical_suite_apt, physical_city, physical_state, 
    physical_country, physical_zip, is_mailing_address_same, mailing_street_address, 
    mailing_city, mailing_state, mailing_country, mailing_zip, legal_business_name, 
    has_dba, dba_name, business_type, ein, business_started, business_classification, 
    transportation_operation_type, interstate_intrastate, usdot_number, operation_class, 
    vehicle_fleet_type, number_of_vehicles, number_of_drivers, gvwr, vehicle_types_used, 
    cargo_types_transported, hazmat_placard_required, phmsa_work, additional_regulatory_details, 
    has_duns_bradstreet_number, duns_bradstreet_number, created_at, updated_at
) VALUES 
(
    '1',
    '123 Main St',
    'Suite 100',
    'Chicago',
    'Illinois',
    'United States',
    '60601',
    'No',
    '456 Business Ave',
    'Chicago',
    'Illinois',
    'United States',
    '60602',
    'Acme Transportation LLC',
    'Yes',
    'Acme Transport',
    'LLC',
    '12-3456789',
    '2018-03-15',
    'Carrier',
    'Long-Haul',
    'Interstate',
    '123456',
    'Class A',
    'Owned',
    12,
    15,
    '80,000 lbs',
    'Trucks,Trailers',
    'General Freight',
    'No',
    'No',
    '["Vehicle Safety Standards","Driver Qualification Files","Hours of Service Compliance"]',
    'Yes',
    '123456789',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    '789 Oak Ave',
    NULL,
    'Milwaukee',
    'Wisconsin',
    'United States',
    '53201',
    'Yes',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Midwest Freight Solutions Inc',
    'Yes',
    'Midwest Freight',
    'Corporation',
    '98-7654321',
    '2015-08-20',
    'Broker',
    'Regional',
    'Interstate',
    '789012',
    'Class B',
    'Contracted',
    8,
    12,
    '26,000 lbs',
    'Box Trucks,Flatbeds',
    'Manufacturing Parts,Electronics',
    'No',
    'No',
    '["Freight Brokerage Regulations","Carrier Qualification","Load Tracking"]',
    'No',
    NULL,
    '2024-01-10T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Insert Contacts
INSERT INTO contacts (
    id, company_id, first_name, last_name, phone, email, job_title, 
    department, is_primary_contact, preferred_contact_method, 
    position, created_at, updated_at
) VALUES 
(
    '1',
    '1',
    'John',
    'Smith',
    '(555) 123-4567',
    'john.smith@acmetransport.com',
    'Operations Manager',
    'Operations',
    1,
    'Phone',
    'Operations Manager',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    '2',
    'Sarah',
    'Johnson',
    '(414) 555-9876',
    'sarah.johnson@midwestfreight.com',
    'Fleet Manager',
    'Operations',
    1,
    'Email',
    'Fleet Manager',
    '2024-01-10T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Insert Vehicles
INSERT INTO vehicles (
    id, company_id, vin, license_plate, make, model, year, color, 
    vehicle_type, gvwr, fuel_type, registration_number, registration_expiry, 
    insurance_provider, insurance_policy_number, insurance_expiry, 
    last_inspection_date, next_inspection_due, last_maintenance_date, 
    next_maintenance_due, has_hazmat_endorsement, status, current_driver_id, 
    created_at, updated_at
) VALUES 
(
    '1',
    '1',
    '1HGBH41JXMN109186',
    'IL-ABC123',
    'Freightliner',
    'Cascadia',
    2020,
    'White',
    'Truck',
    '80,000 lbs',
    'Diesel',
    'REG123456',
    '2024-12-31',
    'Progressive',
    'POL789012',
    '2024-11-30',
    '2024-01-15',
    '2024-07-15',
    '2024-01-10',
    '2024-04-10',
    'No',
    'Active',
    '1',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    '1',
    '1HGBH41JXMN109187',
    'IL-DEF456',
    'Peterbilt',
    '579',
    2019,
    'Red',
    'Truck',
    '80,000 lbs',
    'Diesel',
    'REG789012',
    '2024-12-31',
    'State Farm',
    'POL345678',
    '2024-10-15',
    '2024-01-10',
    '2024-07-10',
    '2024-01-05',
    '2024-04-05',
    'Yes',
    'Active',
    '2',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '3',
    '2',
    '1HGBH41JXMN109188',
    'WI-GHI789',
    'Volvo',
    'VNL',
    2021,
    'Blue',
    'Truck',
    '26,000 lbs',
    'Diesel',
    'REG456789',
    '2024-12-31',
    'Allstate',
    'POL901234',
    '2024-09-20',
    '2024-01-08',
    '2024-07-08',
    '2024-01-03',
    '2024-04-03',
    'No',
    'Active',
    '3',
    '2024-01-10T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Insert Drivers
INSERT INTO drivers (
    id, company_id, full_name, address, phone, email, 
    license_number, license_expiry, dot_medical_certificate_expiry, 
    hire_date, employment_status, position, created_at, updated_at
) VALUES 
(
    '1',
    '1',
    'John Smith',
    '123 Driver St, City, State 12345',
    '(555) 123-4567',
    'john.smith@acmetransport.com',
    'CDL123456789',
    '2025-06-15',
    '2024-12-15',
    '2020-01-15',
    'Active',
    'Driver',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    '1',
    'Lisa Brown',
    'Lisa',
    'Brown',
    '(555) 234-5678',
    'lisa.brown@acmetransport.com',
    'CDL234567890',
    'Class A',
    '2025-08-20',
    '2024-10-20',
    '2021-06-01',
    'Active',
    'Driver',
    'Hourly',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '3',
    '2',
    'Robert Wilson',
    'Robert',
    'Wilson',
    '(414) 555-1234',
    'robert.wilson@midwestfreight.com',
    'CDL345678901',
    'Class B',
    '2025-03-10',
    '2024-09-10',
    '2019-03-10',
    'Active',
    'Driver',
    'Salary',
    '2024-01-10T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Insert Deals
INSERT INTO deals (
    id, title, description, value, stage, probability, expected_close_date, 
    actual_close_date, company_id, contact_id, created_at, updated_at
) VALUES 
(
    '1',
    'Acme Transportation - Fleet Management Contract',
    'Comprehensive fleet management services including vehicle tracking, maintenance scheduling, and driver management.',
    125000,
    'Negotiation',
    75,
    '2024-03-15',
    NULL,
    '1',
    '1',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    'Acme Transportation - USDOT Compliance Package',
    'USDOT compliance services including safety management, driver qualification files, and regulatory reporting.',
    45000,
    'Closed Won',
    100,
    '2024-01-30',
    '2024-01-28',
    '1',
    '1',
    '2024-01-10T00:00:00.000Z',
    '2024-01-28T00:00:00.000Z'
),
(
    '3',
    'Midwest Freight Solutions - Brokerage Services',
    'Freight brokerage services for regional transportation needs.',
    85000,
    'Proposal',
    60,
    '2024-04-01',
    NULL,
    '2',
    '2',
    '2024-01-12T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
),
(
    '4',
    'Midwest Freight Solutions - Insurance Package',
    'Comprehensive insurance coverage for fleet operations.',
    32000,
    'Qualification',
    40,
    '2024-05-15',
    NULL,
    '2',
    '2',
    '2024-01-08T00:00:00.000Z',
    '2024-01-15T00:00:00.000Z'
);

-- Insert Invoices
INSERT INTO invoices (
    id, invoice_number, client_name, amount, status, due_date, created_at, updated_at
) VALUES 
(
    '1',
    'INV-2024-001',
    'Acme Transportation LLC',
    12500,
    'paid',
    '2024-01-15',
    '2024-01-01T00:00:00.000Z',
    '2024-01-16T00:00:00.000Z'
),
(
    '2',
    'INV-2024-002',
    'Acme Transportation LLC',
    8500,
    'sent',
    '2024-02-15',
    '2024-01-15T00:00:00.000Z',
    '2024-01-15T00:00:00.000Z'
),
(
    '3',
    'INV-2024-003',
    'Midwest Freight Solutions Inc',
    15000,
    'overdue',
    '2024-01-10',
    '2023-12-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '4',
    'INV-2024-004',
    'Midwest Freight Solutions Inc',
    22000,
    'draft',
    '2024-03-15',
    '2024-01-20T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
);

-- Insert Campaigns
INSERT INTO campaigns (
    id, name, description, type, status, start_date, end_date, budget, 
    target_audience, goals, metrics, created_at, updated_at
) VALUES 
(
    '1',
    'Q1 2024 Transportation Outreach',
    'Targeted outreach to transportation companies in the Midwest region',
    'Email Campaign',
    'Active',
    '2024-01-01',
    '2024-03-31',
    15000,
    'Midwest Transportation Companies',
    '["Generate 50 qualified leads","Schedule 20 discovery calls","Close 5 new deals"]',
    '{"totalLeads": 35, "convertedLeads": 8, "conversionRate": 22.9, "costPerLead": 428.57, "roi": 180}',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    'Trade Show 2024 - Transportation Expo',
    'Booth presence and lead generation at the annual transportation expo',
    'Trade Show',
    'Completed',
    '2024-01-15',
    '2024-01-17',
    25000,
    'Transportation Industry Professionals',
    '["Generate 100 booth visits","Collect 75 business cards","Follow up with 50 prospects"]',
    '{"totalLeads": 75, "convertedLeads": 12, "conversionRate": 16.0, "costPerLead": 333.33, "roi": 240}',
    '2024-01-10T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Insert Leads
INSERT INTO leads (
    id, first_name, last_name, email, phone, company, job_title, campaign_id, 
    lead_source, lead_status, lead_score, business_type, fleet_size, 
    operating_states, cargo_types, has_usdot, usdot_number, budget, timeline, 
    decision_maker, pain_points, interests, preferred_contact_method, 
    last_contact_date, next_follow_up_date, notes, converted_to_contact, 
    converted_to_deal, conversion_date, conversion_value, converted_contact_id, 
    converted_deal_id, company_id, assigned_to, assigned_date, created_at, updated_at
) VALUES 
(
    '1',
    'Michael',
    'Rodriguez',
    'michael.rodriguez@fastfreight.com',
    '(312) 555-0123',
    'Fast Freight Logistics',
    'Operations Director',
    '1',
    'Website',
    'Qualified',
    85,
    'Carrier',
    25,
    '["Illinois","Indiana","Ohio"]',
    '["General Freight","Electronics"]',
    1,
    '456789',
    35000,
    'Need compliance help within 30 days (urgent)',
    1,
    '["USDOT compliance issues","Driver qualification files","Safety violations"]',
    '["Compliance services","Safety management","Driver training"]',
    'Phone',
    '2024-01-18',
    '2024-01-25',
    'High priority lead - has compliance violations and needs immediate help',
    0,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'user1',
    '2024-01-18',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    '2',
    'Jennifer',
    'Chen',
    'jennifer.chen@midwestlogistics.com',
    '(414) 555-0456',
    'Midwest Logistics Group',
    'Fleet Manager',
    '2',
    'Trade Show',
    'Contacted',
    72,
    'Freight Forwarder',
    18,
    '["Wisconsin","Minnesota","Iowa"]',
    '["Manufacturing","Automotive"]',
    1,
    '789012',
    28000,
    'Looking to expand operations in 3-6 months',
    1,
    '["Fleet expansion","Driver recruitment","Compliance management"]',
    '["Fleet management","Driver services","Compliance support"]',
    'Email',
    '2024-01-16',
    '2024-01-23',
    'Interested in comprehensive fleet management services',
    0,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'user1',
    '2024-01-16',
    '2024-01-12T00:00:00.000Z',
    '2024-01-18T00:00:00.000Z'
);

-- Update vehicle current_driver_id to match actual driver IDs
UPDATE vehicles SET current_driver_id = '1' WHERE id = '1';
UPDATE vehicles SET current_driver_id = '2' WHERE id = '2';
UPDATE vehicles SET current_driver_id = '3' WHERE id = '3';

-- Insert AI Agents
INSERT INTO agents (
    id, name, description, type, status, capabilities, personality, 
    knowledge_base_ids, created_at, updated_at
) VALUES 
(
    'agent-1',
    'Transportation Compliance Assistant',
    'Specialized AI agent for transportation compliance and USDOT regulations',
    'Compliance',
    'Active',
    '["USDOT Compliance","Safety Regulations","Driver Qualification","Vehicle Inspections"]',
    'Professional and knowledgeable about transportation regulations',
    '["kb-1","kb-2"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'agent-2',
    'Sales Support Agent',
    'AI agent specialized in lead qualification and sales support',
    'Sales',
    'Active',
    '["Lead Qualification","Proposal Generation","Follow-up Management","Objection Handling"]',
    'Friendly and persuasive, focused on understanding client needs',
    '["kb-3","kb-4"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'agent-3',
    'Customer Service Agent',
    'General customer service and support agent',
    'Support',
    'Active',
    '["General Support","Account Management","Issue Resolution","Information Lookup"]',
    'Helpful and patient, focused on customer satisfaction',
    '["kb-5"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
);

-- Insert Knowledge Bases
INSERT INTO knowledge_bases (
    id, name, description, type, content, tags, created_at, updated_at
) VALUES 
(
    'kb-1',
    'USDOT Compliance Regulations',
    'Comprehensive guide to USDOT compliance requirements and regulations',
    'Regulatory',
    'USDOT compliance requirements, safety regulations, driver qualification standards, vehicle inspection requirements, hours of service rules, drug and alcohol testing programs, and record keeping requirements.',
    '["USDOT","Compliance","Safety","Regulations"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'kb-2',
    'Transportation Safety Standards',
    'Industry safety standards and best practices for transportation companies',
    'Safety',
    'FMCSA safety standards, vehicle maintenance requirements, driver training programs, accident prevention strategies, and safety management systems.',
    '["Safety","FMCSA","Training","Maintenance"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'kb-3',
    'Sales Process and Scripts',
    'Sales methodologies, scripts, and best practices for transportation services',
    'Sales',
    'Lead qualification questions, proposal templates, objection handling techniques, pricing strategies, and closing methods for transportation compliance services.',
    '["Sales","Scripts","Proposals","Pricing"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'kb-4',
    'Transportation Industry Knowledge',
    'General knowledge about the transportation and logistics industry',
    'Industry',
    'Industry trends, market analysis, competitor information, service offerings, and industry terminology.',
    '["Industry","Trends","Competitors","Services"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'kb-5',
    'Customer Service Procedures',
    'Standard operating procedures for customer service and support',
    'Support',
    'Customer service protocols, escalation procedures, common issues and solutions, account management processes, and communication guidelines.',
    '["Support","Procedures","Escalation","Communication"]',
    '2024-01-01T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
);

-- Insert Conversations
INSERT INTO conversations (
    id, agent_id, client_id, title, status, created_at, updated_at
) VALUES 
(
    'conv-1',
    'agent-1',
    'client-1',
    'USDOT Compliance Consultation - Acme Transportation',
    'Active',
    '2024-01-15T10:30:00.000Z',
    '2024-01-20T14:45:00.000Z'
),
(
    'conv-2',
    'agent-2',
    'client-2',
    'Sales Discussion - Midwest Freight Solutions',
    'Active',
    '2024-01-16T09:15:00.000Z',
    '2024-01-19T16:20:00.000Z'
),
(
    'conv-3',
    'agent-1',
    'client-3',
    'Safety Violation Resolution - Fast Freight Logistics',
    'Completed',
    '2024-01-10T11:00:00.000Z',
    '2024-01-12T15:30:00.000Z'
),
(
    'conv-4',
    'agent-3',
    'client-1',
    'Account Support - Acme Transportation',
    'Active',
    '2024-01-18T13:20:00.000Z',
    '2024-01-20T10:15:00.000Z'
);

-- Insert Messages
INSERT INTO messages (
    id, conversation_id, sender, content, timestamp, metadata
) VALUES 
-- Conversation 1: USDOT Compliance Consultation
(
    'msg-1',
    'conv-1',
    'user',
    'Hi, I need help with USDOT compliance for my transportation company. We have some violations and need to get them resolved quickly.',
    '2024-01-15T10:30:00.000Z',
    '{"clientId": "client-1", "urgency": "high"}'
),
(
    'msg-2',
    'conv-1',
    'agent',
    'I understand you need urgent help with USDOT compliance violations. I can definitely assist you with this. Can you tell me more about the specific violations you are facing? Also, what is your USDOT number so I can look up your current status?',
    '2024-01-15T10:31:00.000Z',
    '{"confidence": 0.95, "intent": "information_gathering"}'
),
(
    'msg-3',
    'conv-1',
    'user',
    'Our USDOT number is 123456. We have violations related to driver qualification files and some safety issues. The main problem is that we are missing some required documentation for our drivers.',
    '2024-01-15T10:35:00.000Z',
    '{"clientId": "client-1", "usdotNumber": "123456"}'
),
(
    'msg-4',
    'conv-1',
    'agent',
    'Thank you for providing that information. Driver qualification file violations are common and can be resolved with proper documentation. Based on your USDOT number, I can see you are a Class A carrier. Let me help you create a comprehensive plan to address these violations. What specific documentation are you missing for your drivers?',
    '2024-01-15T10:36:00.000Z',
    '{"confidence": 0.92, "intent": "problem_solving", "usdotLookup": true}'
),
(
    'msg-5',
    'conv-1',
    'user',
    'We are missing medical certificates for 3 drivers and some of our employment applications are incomplete. Also, we need help with the safety management system requirements.',
    '2024-01-15T10:40:00.000Z',
    '{"clientId": "client-1", "issues": ["medical_certificates", "employment_applications", "safety_management"]}'
),
(
    'msg-6',
    'conv-1',
    'agent',
    'I can help you with all of these issues. Here is what we need to do: 1) Schedule medical examinations for the 3 drivers immediately, 2) Complete the employment applications with all required information, 3) Implement a proper safety management system. I recommend we start with the medical certificates as they are the most critical. Would you like me to help you find certified medical examiners in your area?',
    '2024-01-15T10:42:00.000Z',
    '{"confidence": 0.98, "intent": "solution_providing", "action_plan": true}'
),

-- Conversation 2: Sales Discussion
(
    'msg-7',
    'conv-2',
    'user',
    'Hello, I am interested in learning more about your compliance services. We are a freight broker looking to expand our operations and need help with regulatory compliance.',
    '2024-01-16T09:15:00.000Z',
    '{"clientId": "client-2", "businessType": "broker"}'
),
(
    'msg-8',
    'conv-2',
    'agent',
    'Hello! I would be happy to help you with compliance services for your freight brokerage. As a broker, you have specific regulatory requirements that are different from carriers. Can you tell me more about your current operations and what specific compliance challenges you are facing?',
    '2024-01-16T09:16:00.000Z',
    '{"confidence": 0.90, "intent": "qualification"}'
),
(
    'msg-9',
    'conv-2',
    'user',
    'We currently operate in Wisconsin, Minnesota, and Iowa. We have about 18 trucks in our fleet and are looking to expand to more states. Our main concern is understanding the different state requirements and ensuring we are compliant everywhere we operate.',
    '2024-01-16T09:20:00.000Z',
    '{"clientId": "client-2", "states": ["Wisconsin", "Minnesota", "Iowa"], "fleetSize": 18}'
),
(
    'msg-10',
    'conv-2',
    'agent',
    'That is excellent! Multi-state operations do require careful attention to compliance. With 18 trucks, you are in a great position for growth. Each state has its own requirements for brokers, and I can help you navigate these. What is your timeline for expansion, and which states are you considering?',
    '2024-01-16T09:22:00.000Z',
    '{"confidence": 0.88, "intent": "needs_assessment"}'
),

-- Conversation 3: Safety Violation Resolution
(
    'msg-11',
    'conv-3',
    'user',
    'We received a safety violation notice and need immediate help to resolve it before our next inspection.',
    '2024-01-10T11:00:00.000Z',
    '{"clientId": "client-3", "urgency": "critical"}'
),
(
    'msg-12',
    'conv-3',
    'agent',
    'I understand this is urgent. Safety violations can have serious consequences. Can you tell me the specific violation code and what the notice says? This will help me provide you with the most accurate guidance.',
    '2024-01-10T11:01:00.000Z',
    '{"confidence": 0.95, "intent": "urgent_support"}'
),
(
    'msg-13',
    'conv-3',
    'user',
    'The violation is 395.8 - Hours of Service violation. We had a driver who exceeded the 11-hour driving limit. We need to know how to respond and what corrective actions to take.',
    '2024-01-10T11:05:00.000Z',
    '{"clientId": "client-3", "violationCode": "395.8", "violationType": "hours_of_service"}'
),
(
    'msg-14',
    'conv-3',
    'agent',
    'Hours of Service violations are serious but can be resolved with proper corrective action. Here is what you need to do: 1) Immediately remove the driver from service until they have 10 consecutive hours off duty, 2) Review and update your hours of service policies, 3) Provide additional training to all drivers, 4) Implement better monitoring systems. I can help you create a comprehensive corrective action plan. Would you like me to walk you through each step?',
    '2024-01-10T11:07:00.000Z',
    '{"confidence": 0.98, "intent": "corrective_action", "solution_provided": true}'
),

-- Conversation 4: Account Support
(
    'msg-15',
    'conv-4',
    'user',
    'I need to update our account information and have some questions about our current service plan.',
    '2024-01-18T13:20:00.000Z',
    '{"clientId": "client-1", "requestType": "account_update"}'
),
(
    'msg-16',
    'conv-4',
    'agent',
    'I would be happy to help you update your account information and answer questions about your service plan. What specific information needs to be updated, and what questions do you have about your current plan?',
    '2024-01-18T13:21:00.000Z',
    '{"confidence": 0.85, "intent": "account_support"}'
);

-- Insert Persistent Conversation Contexts
INSERT INTO persistent_conversation_contexts (
    id, conversation_id, client_profile, agent_insights, conversation_history, 
    created_at, updated_at
) VALUES 
(
    'pcc-1',
    'conv-1',
    '{"clientId": "client-1", "companyName": "Acme Transportation LLC", "usdotNumber": "123456", "totalInteractions": 6, "satisfactionScore": 4.5, "lastInteraction": "2024-01-15T10:42:00.000Z", "preferredContactMethod": "phone", "businessType": "Carrier", "fleetSize": 12, "complianceIssues": ["driver_qualification", "safety_management"]}',
    '{"agentId": "agent-1", "specialization": "Compliance", "confidenceLevel": 0.95, "responseQuality": 4.8, "knowledgeAreas": ["USDOT", "Safety", "Driver_Qualification"], "interactionStyle": "Professional", "successRate": 0.92}',
    '["USDOT compliance consultation", "Driver qualification file violations", "Safety management system implementation", "Medical certificate requirements"]',
    '2024-01-15T10:30:00.000Z',
    '2024-01-15T10:42:00.000Z'
),
(
    'pcc-2',
    'conv-2',
    '{"clientId": "client-2", "companyName": "Midwest Freight Solutions Inc", "businessType": "Broker", "totalInteractions": 4, "satisfactionScore": 4.2, "lastInteraction": "2024-01-16T09:22:00.000Z", "preferredContactMethod": "email", "fleetSize": 18, "operatingStates": ["Wisconsin", "Minnesota", "Iowa"], "expansionPlans": true}',
    '{"agentId": "agent-2", "specialization": "Sales", "confidenceLevel": 0.88, "responseQuality": 4.5, "knowledgeAreas": ["Broker_Regulations", "Multi_State_Compliance", "Business_Development"], "interactionStyle": "Friendly", "successRate": 0.85}',
    '["Compliance services inquiry", "Multi-state broker operations", "Fleet expansion planning", "State regulatory requirements"]',
    '2024-01-16T09:15:00.000Z',
    '2024-01-16T09:22:00.000Z'
),
(
    'pcc-3',
    'conv-3',
    '{"clientId": "client-3", "companyName": "Fast Freight Logistics", "totalInteractions": 4, "satisfactionScore": 4.7, "lastInteraction": "2024-01-10T11:07:00.000Z", "preferredContactMethod": "phone", "businessType": "Carrier", "complianceIssues": ["hours_of_service"], "violationResolved": true}',
    '{"agentId": "agent-1", "specialization": "Compliance", "confidenceLevel": 0.98, "responseQuality": 4.9, "knowledgeAreas": ["Hours_of_Service", "Safety_Violations", "Corrective_Actions"], "interactionStyle": "Professional", "successRate": 0.95}',
    '["Safety violation notice", "Hours of service violation 395.8", "Corrective action plan", "Driver training requirements"]',
    '2024-01-10T11:00:00.000Z',
    '2024-01-10T11:07:00.000Z'
),
(
    'pcc-4',
    'conv-4',
    '{"clientId": "client-1", "companyName": "Acme Transportation LLC", "totalInteractions": 2, "satisfactionScore": 4.0, "lastInteraction": "2024-01-18T13:21:00.000Z", "preferredContactMethod": "phone", "accountStatus": "active", "servicePlan": "premium"}',
    '{"agentId": "agent-3", "specialization": "Support", "confidenceLevel": 0.85, "responseQuality": 4.2, "knowledgeAreas": ["Account_Management", "Service_Plans", "Billing"], "interactionStyle": "Helpful", "successRate": 0.88}',
    '["Account information update", "Service plan questions", "Billing inquiries"]',
    '2024-01-18T13:20:00.000Z',
    '2024-01-18T13:21:00.000Z'
);

-- Insert Client Profiles
INSERT INTO client_profiles (
    id, client_id, company_name, business_type, fleet_size, usdot_number, 
    total_interactions, satisfaction_score, preferred_contact_method, 
    last_contact_date, notes, created_at, updated_at
) VALUES 
(
    'cp-1',
    'client-1',
    'Acme Transportation LLC',
    'Carrier',
    12,
    '123456',
    8,
    4.3,
    'Phone',
    '2024-01-20T10:15:00.000Z',
    'High priority client with compliance issues. Very responsive to phone calls. Needs ongoing support with driver qualification files.',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T10:15:00.000Z'
),
(
    'cp-2',
    'client-2',
    'Midwest Freight Solutions Inc',
    'Broker',
    18,
    '789012',
    4,
    4.2,
    'Email',
    '2024-01-19T16:20:00.000Z',
    'Expansion-focused broker. Prefers email communication. Interested in multi-state compliance services.',
    '2024-01-16T00:00:00.000Z',
    '2024-01-19T16:20:00.000Z'
),
(
    'cp-3',
    'client-3',
    'Fast Freight Logistics',
    'Carrier',
    25,
    '456789',
    4,
    4.7,
    'Phone',
    '2024-01-12T15:30:00.000Z',
    'Had safety violations but resolved quickly. Very satisfied with service. Good candidate for ongoing compliance support.',
    '2024-01-10T00:00:00.000Z',
    '2024-01-12T15:30:00.000Z'
);

-- Insert Agent Memory Banks
INSERT INTO agent_memory_banks (
    id, agent_id, memory_type, content, importance, tags, created_at, updated_at
) VALUES 
(
    'amb-1',
    'agent-1',
    'Client_Preference',
    'Acme Transportation LLC prefers phone communication and needs immediate responses for compliance issues. They have ongoing driver qualification file problems.',
    'High',
    '["client-1", "communication_preference", "compliance_issues"]',
    '2024-01-15T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
),
(
    'amb-2',
    'agent-1',
    'Success_Pattern',
    'Fast Freight Logistics had safety violations but responded well to structured corrective action plans. They value detailed step-by-step guidance.',
    'Medium',
    '["client-3", "safety_violations", "corrective_actions", "success_pattern"]',
    '2024-01-10T00:00:00.000Z',
    '2024-01-12T00:00:00.000Z'
),
(
    'amb-3',
    'agent-2',
    'Sales_Insight',
    'Midwest Freight Solutions is expansion-focused and interested in multi-state compliance. They prefer email communication and need detailed information about state requirements.',
    'High',
    '["client-2", "sales_opportunity", "expansion", "multi_state"]',
    '2024-01-16T00:00:00.000Z',
    '2024-01-19T00:00:00.000Z'
),
(
    'amb-4',
    'agent-3',
    'Service_Note',
    'Acme Transportation has premium service plan and frequently needs account updates. They are responsive to proactive communication.',
    'Medium',
    '["client-1", "account_management", "premium_plan", "proactive_communication"]',
    '2024-01-18T00:00:00.000Z',
    '2024-01-20T00:00:00.000Z'
);
