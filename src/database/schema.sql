-- Rapid CRM Database Schema
-- SQLite Database Schema for Transportation CRM

-- Companies/Organizations Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    
    -- Contact Details (Person entity)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    preferred_contact_method TEXT DEFAULT 'Phone',
    
    -- Physical Address
    physical_street_address TEXT NOT NULL,
    physical_suite_apt TEXT,
    physical_city TEXT NOT NULL,
    physical_state TEXT NOT NULL,
    physical_country TEXT DEFAULT 'United States',
    physical_zip TEXT NOT NULL,
    
    -- Mailing Address
    is_mailing_address_same TEXT DEFAULT 'Yes',
    mailing_street_address TEXT,
    mailing_suite_apt TEXT,
    mailing_city TEXT,
    mailing_state TEXT,
    mailing_country TEXT DEFAULT 'United States',
    mailing_zip TEXT,
    
    -- Business Information
    business_type TEXT NOT NULL,
    business_started DATE,
    desired_business_name TEXT,
    legal_business_name TEXT NOT NULL,
    has_dba TEXT DEFAULT 'No',
    dba_name TEXT,
    ein TEXT NOT NULL,
    entity_types TEXT, -- JSON array for multiple select
    
    -- Transportation & Operations
    business_classification TEXT NOT NULL,
    transportation_operation_type TEXT NOT NULL,
    carries_passengers TEXT NOT NULL,
    transports_goods_for_hire TEXT NOT NULL,
    engaged_in_interstate_commerce TEXT NOT NULL,
    interstate_intrastate TEXT NOT NULL,
    states_of_operation TEXT, -- JSON array for multiple select
    operation_class TEXT NOT NULL,
    has_usdot_number TEXT NOT NULL,
    usdot_number TEXT,
    
    -- Fleet Information
    vehicle_fleet_type TEXT NOT NULL,
    vehicle_types_used TEXT, -- JSON array for multiple select
    number_of_drivers INTEGER NOT NULL DEFAULT 0,
    driver_list TEXT,
    number_of_vehicles INTEGER NOT NULL DEFAULT 0,
    vehicle_list TEXT,
    gvwr TEXT NOT NULL,
    year_make_model TEXT,
    
    -- Cargo & Safety
    cargo_types_transported TEXT NOT NULL,
    hazmat_placard_required TEXT NOT NULL DEFAULT 'No',
    phmsa_work TEXT DEFAULT 'No',
    
    -- Regulatory Compliance
    additional_regulatory_details TEXT, -- JSON array for multiple select
    
    -- Company Ownership
    has_company_owner TEXT DEFAULT 'No',
    company_owner_first_name TEXT,
    company_owner_last_name TEXT,
    company_owner_phone TEXT,
    company_owner_email TEXT,
    
    -- Financial Information
    has_duns_bradstreet_number TEXT DEFAULT 'No',
    duns_bradstreet_number TEXT,
    
    -- System Fields
    software TEXT, -- Source tracking
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Contacts/People Table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL, -- Foreign key to companies table
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    job_title TEXT,
    department TEXT,
    
    -- Contact Preferences
    is_primary_contact INTEGER DEFAULT 0, -- 0 = false, 1 = true
    preferred_contact_method TEXT DEFAULT 'Phone',
    position TEXT,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL, -- Foreign key to companies table
    
    -- Vehicle Identification
    vin TEXT NOT NULL, -- Vehicle Identification Number
    license_plate TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    
    -- Vehicle Specifications
    vehicle_type TEXT NOT NULL, -- 'Truck', 'Trailer', 'Bus', 'Van', 'Other'
    gvwr TEXT NOT NULL, -- Gross Vehicle Weight Rating
    empty_weight TEXT,
    fuel_type TEXT NOT NULL, -- 'Diesel', 'Gasoline', 'Electric', 'Hybrid', 'Other'
    
    -- Registration & Insurance
    registration_number TEXT,
    registration_expiry TEXT,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_expiry TEXT,
    
    -- Maintenance & Compliance
    last_inspection_date TEXT,
    next_inspection_due TEXT,
    last_maintenance_date TEXT,
    next_maintenance_due TEXT,
    has_hazmat_endorsement TEXT DEFAULT 'No', -- 'Yes' or 'No'
    
    -- Status
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Maintenance', 'Retired'
    current_driver_id TEXT, -- Foreign key to drivers table
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (current_driver_id) REFERENCES drivers(id)
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL, -- Foreign key to companies table
    
    -- Basic Information
    full_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    social_security_number TEXT NOT NULL, -- Encrypted
    
    -- Employment History
    employment_history TEXT NOT NULL, -- Structured text (past 3-10 years with gaps explanation)
    
    -- Driving Experience
    driving_experience TEXT, -- JSON array: CDL Class A, B, C, D, E, Other
    
    -- Accident/Violations History
    accident_violations_history TEXT, -- Structured text
    accident_violations_files TEXT, -- JSON array of file paths
    
    -- Motor Vehicle Record (MVR)
    mvr_files TEXT, -- JSON array of file paths (PDF, TXT, Image)
    mvr_initial_date DATE,
    mvr_annual_date DATE,
    
    -- License/CDL Copy
    license_cdl_files TEXT, -- JSON array of file paths (PDF, Image)
    license_number TEXT,
    license_expiry DATE,
    endorsements TEXT, -- JSON array
    restrictions TEXT, -- JSON array
    
    -- DOT Medical Certificate
    dot_medical_certificate_expiry DATE,
    medical_examiner_name TEXT,
    medical_certificate_number TEXT,
    medical_examination_report_files TEXT, -- JSON array of file paths (PDF, TXT)
    
    -- Road Test Certificate/CDL
    road_test_certificate_files TEXT, -- JSON array of file paths (PDF, Image)
    road_test_date DATE,
    
    -- Drug/Alcohol Test Results
    drug_alcohol_test_results TEXT, -- JSON array with test type, date, results, file paths
    last_drug_test_date DATE,
    last_alcohol_test_date DATE,
    
    -- Annual Violation Certification
    annual_violation_certification_files TEXT, -- JSON array of file paths (PDF)
    last_annual_certification_date DATE,
    
    -- Safety Performance History
    safety_performance_history_files TEXT, -- JSON array of file paths (PDF, TXT)
    
    -- Variances/Waivers
    variances_waivers_files TEXT, -- JSON array of file paths (PDF)
    has_variances_waivers TEXT DEFAULT 'No',
    
    -- Proof of Work Authorization
    work_authorization_files TEXT, -- JSON array of file paths (PDF, Image)
    has_work_authorization TEXT DEFAULT 'No',
    
    -- Employment Information
    hire_date DATE,
    employment_status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Terminated'
    position TEXT DEFAULT 'Driver',
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Registration', 'Compliance', 'Training', 'Support'
    base_price REAL NOT NULL,
    estimated_duration TEXT NOT NULL,
    requirements TEXT NOT NULL, -- JSON array
    deliverables TEXT NOT NULL, -- JSON array
    is_active INTEGER DEFAULT 1, -- 1 for active, 0 for inactive
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
    -- No foreign key constraints for services table
);

CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value REAL NOT NULL,
    stage TEXT NOT NULL, -- 'lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'
    probability INTEGER DEFAULT 0, -- 0-100
    expected_close_date TEXT,
    actual_close_date TEXT,
    
    -- Service Information
    service_id TEXT, -- Foreign key to services table
    service_name TEXT, -- Cached service name for performance
    custom_price REAL, -- Override base service price if needed
    
    company_id TEXT NOT NULL, -- Foreign key to companies table
    contact_id TEXT, -- Foreign key to contacts table
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
    due_date TEXT NOT NULL,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    due_date TEXT,
    company_id TEXT, -- Foreign key to companies table
    contact_id TEXT, -- Foreign key to contacts table
    assigned_to TEXT, -- User ID
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'Email', 'Social Media', 'Google Ads', 'Facebook Ads', 'LinkedIn', 'Trade Show', 'Referral Program', 'Cold Outreach', 'Website', 'Other'
    status TEXT NOT NULL, -- 'Active', 'Paused', 'Completed', 'Draft'
    start_date TEXT NOT NULL,
    end_date TEXT,
    budget REAL,
    target_audience TEXT,
    goals TEXT, -- JSON array
    metrics TEXT, -- JSON object
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    
    -- Basic Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    
    -- Campaign & Source Tracking
    campaign_id TEXT, -- Foreign key to campaigns table
    lead_source TEXT NOT NULL, -- 'Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Email Campaign', 'Google Ads', 'Facebook Ads', 'LinkedIn', 'Other'
    lead_status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'
    lead_score INTEGER DEFAULT 0, -- 0-100
    
    -- Transportation-Specific Fields
    business_type TEXT, -- 'Carrier', 'Broker', 'Freight Forwarder', 'Shipper', 'Owner Operator', 'Other'
    fleet_size INTEGER,
    operating_states TEXT, -- JSON array
    cargo_types TEXT, -- JSON array
    has_usdot INTEGER DEFAULT 0, -- 0 = false, 1 = true
    usdot_number TEXT,
    
    -- Lead Qualification
    budget REAL, -- Annual budget in dollars
    timeline TEXT, -- Free text for timeline
    decision_maker INTEGER DEFAULT 0, -- 0 = false, 1 = true
    pain_points TEXT, -- JSON array
    interests TEXT, -- JSON array
    
    -- Communication
    preferred_contact_method TEXT DEFAULT 'Phone', -- 'Phone', 'Email', 'Text', 'LinkedIn'
    last_contact_date TEXT,
    next_follow_up_date TEXT,
    notes TEXT,
    
    -- Conversion Tracking
    converted_to_contact INTEGER DEFAULT 0, -- 0 = false, 1 = true
    converted_to_deal INTEGER DEFAULT 0, -- 0 = false, 1 = true
    conversion_date TEXT,
    conversion_value REAL,
    converted_contact_id TEXT, -- Foreign key to contacts table
    converted_deal_id TEXT, -- Foreign key to deals table
    
    -- Company Relationship
    company_id TEXT, -- Foreign key to companies table
    
    -- Assignment
    assigned_to TEXT, -- User ID
    assigned_date TEXT,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (converted_contact_id) REFERENCES contacts(id),
    FOREIGN KEY (converted_deal_id) REFERENCES deals(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- AI Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'Compliance', 'Sales', 'Support', 'General'
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'Training'
    capabilities TEXT, -- JSON array
    personality TEXT,
    knowledge_base_ids TEXT, -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Knowledge Bases Table
CREATE TABLE IF NOT EXISTS knowledge_bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'Regulatory', 'Sales', 'Support', 'Industry', 'General'
    content TEXT NOT NULL,
    tags TEXT, -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL, -- Foreign key to agents table
    client_id TEXT NOT NULL,
    title TEXT,
    status TEXT DEFAULT 'Active', -- 'Active', 'Completed', 'Paused'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL, -- Foreign key to conversations table
    sender TEXT NOT NULL, -- 'user' or 'agent'
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    metadata TEXT, -- JSON object
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Persistent Conversation Contexts Table
CREATE TABLE IF NOT EXISTS persistent_conversation_contexts (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL, -- Foreign key to conversations table
    client_profile TEXT, -- JSON object
    agent_insights TEXT, -- JSON object
    conversation_history TEXT, -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Client Profiles Table
CREATE TABLE IF NOT EXISTS client_profiles (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL UNIQUE,
    company_name TEXT,
    business_type TEXT,
    fleet_size INTEGER,
    usdot_number TEXT,
    total_interactions INTEGER DEFAULT 0,
    satisfaction_score REAL DEFAULT 0.0,
    preferred_contact_method TEXT,
    last_contact_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- USDOT Applications Table (Read-only after creation)
CREATE TABLE IF NOT EXISTS usdot_applications (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL, -- Foreign key to companies table
    
    -- Part 1: Company and Business Information
    legal_business_name TEXT NOT NULL,
    dba_name TEXT,
    principal_address_street TEXT NOT NULL,
    principal_address_city TEXT NOT NULL,
    principal_address_state TEXT NOT NULL,
    principal_address_zip TEXT NOT NULL,
    mailing_address_is_different TEXT DEFAULT 'No',
    mailing_address_street TEXT,
    mailing_address_city TEXT,
    mailing_address_state TEXT,
    mailing_address_zip TEXT,
    primary_contact_full_name TEXT,
    primary_contact_title TEXT,
    primary_contact_phone TEXT,
    primary_contact_fax TEXT,
    primary_contact_email TEXT,
    company_official_full_name TEXT,
    company_official_title TEXT,
    company_official_phone TEXT,
    company_official_email TEXT,
    business_type TEXT NOT NULL,
    ein TEXT NOT NULL,
    duns_number TEXT,
    
    -- Part 2: Operations and Authority
    operation_types TEXT, -- JSON array
    carrier_operation_types TEXT, -- JSON array
    
    -- Part 3: Fleet and Cargo Information
    power_units_owned INTEGER DEFAULT 0,
    power_units_term_leased INTEGER DEFAULT 0,
    power_units_trip_leased INTEGER DEFAULT 0,
    drivers_employees INTEGER DEFAULT 0,
    drivers_owner_operators INTEGER DEFAULT 0,
    operation_classifications TEXT, -- JSON array
    cargo_classifications TEXT, -- JSON array
    hazardous_materials_classifications TEXT, -- JSON array
    hazardous_materials_hm_classes TEXT, -- JSON array
    
    -- Part 4: Financial and Safety Information
    marketer_of_transportation_services TEXT DEFAULT 'No',
    application_date TEXT NOT NULL,
    signature TEXT NOT NULL,
    official_title TEXT NOT NULL,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_read_only TEXT DEFAULT 'Yes', -- Always read-only after creation
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Agent Memory Banks Table
CREATE TABLE IF NOT EXISTS agent_memory_banks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL, -- Foreign key to agents table
    memory_type TEXT NOT NULL, -- 'Client_Preference', 'Success_Pattern', 'Sales_Insight', 'Service_Note', etc.
    content TEXT NOT NULL,
    importance TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    tags TEXT, -- JSON array
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_legal_name ON companies(legal_business_name);
CREATE INDEX IF NOT EXISTS idx_companies_usdot ON companies(usdot_number);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON contacts(is_primary_contact);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_converted_contact ON leads(converted_contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_converted_deal ON leads(converted_deal_id);

-- Indexes for USDOT applications table
CREATE INDEX IF NOT EXISTS idx_usdot_applications_company ON usdot_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_legal_name ON usdot_applications(legal_business_name);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_ein ON usdot_applications(ein);
CREATE INDEX IF NOT EXISTS idx_usdot_applications_created_at ON usdot_applications(created_at);

-- Indexes for AI system tables
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_type ON knowledge_bases(type);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_persistent_contexts_conversation ON persistent_conversation_contexts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_client ON client_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory_banks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory_banks(memory_type);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_value TEXT NOT NULL,
    provider TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Index for API keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
