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
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
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
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    FOREIGN KEY (current_driver_id) REFERENCES drivers(id) ON DELETE SET NULL
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
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
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
    
    -- Renewal Management Fields
    has_renewal INTEGER DEFAULT 0, -- 1 if service requires renewal, 0 if one-time
    renewal_frequency TEXT, -- 'Annual', 'Biennial', 'Quarterly', 'Monthly', 'One-time', 'As-needed'
    renewal_price REAL DEFAULT 0, -- Cost for renewal (may be different from initial price)
    renewal_description TEXT, -- Description of what renewal includes
    renewal_requirements TEXT, -- JSON array of what's needed for renewal
    renewal_deadline TEXT, -- When renewal is due (e.g., "30 days before expiration")
    auto_renewal INTEGER DEFAULT 0, -- 1 if we can auto-renew this service, 0 if manual
    renewal_reminders TEXT, -- JSON array of when to send reminders (e.g., ["90 days", "30 days", "7 days"])
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
    -- No foreign key constraints for services table
);

-- Deal Services Table (for multiple services per deal with individual renewal tracking)
CREATE TABLE IF NOT EXISTS deal_services (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL, -- Foreign key to deals table
    service_id TEXT NOT NULL, -- Foreign key to services table
    service_name TEXT NOT NULL, -- Cached service name for performance
    custom_price REAL, -- Override base service price if needed
    start_date TEXT NOT NULL, -- When service starts
    end_date TEXT, -- When service expires
    next_renewal_date TEXT, -- When renewal is due
    renewal_status TEXT DEFAULT 'active', -- 'active', 'expired', 'renewed', 'cancelled'
    auto_renewal INTEGER DEFAULT 0, -- 1 if auto-renewal enabled, 0 if manual
    last_renewal_date TEXT, -- When service was last renewed
    renewal_count INTEGER DEFAULT 0, -- How many times this service has been renewed
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
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
    
    -- Multiple Services Support
    total_value REAL NOT NULL, -- Sum of all service values in this deal
    
    -- Legacy single service support (for backward compatibility)
    service_id TEXT, -- Foreign key to services table
    service_name TEXT, -- Cached service name for performance
    custom_price REAL, -- Override base service price if needed
    
    company_id TEXT NOT NULL, -- Foreign key to companies table
    contact_id TEXT, -- Foreign key to contacts table
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
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
    updated_at TEXT NOT NULL
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
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
    FOREIGN KEY (converted_deal_id) REFERENCES deals(id)
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
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

-- Advanced AI Agents Table (for the new agent system)
CREATE TABLE IF NOT EXISTS advanced_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- Functional/technical name
    display_name TEXT, -- Human name for client-facing interactions (optional)
    description TEXT,
    type TEXT NOT NULL, -- 'onboarding', 'customer_service', 'sales', 'support', 'custom'
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'training', 'error'
    capabilities TEXT, -- JSON array of capabilities
    knowledge_bases TEXT, -- JSON array of knowledge base IDs
    rules TEXT, -- JSON array of behavior rules
    configuration TEXT, -- JSON object with model settings, prompts, etc.
    metrics TEXT, -- JSON object with performance metrics
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
    is_read_only TEXT DEFAULT 'Yes' -- Always read-only after creation
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
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

-- Video Projects Table
CREATE TABLE IF NOT EXISTS video_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT,
    project_type TEXT DEFAULT 'AI Generated Video',
    style TEXT DEFAULT 'realistic',
    duration INTEGER DEFAULT 30,
    resolution TEXT DEFAULT '1080p',
    aspect_ratio TEXT DEFAULT '16:9',
    fps INTEGER DEFAULT 30,
    quality TEXT DEFAULT 'standard',
    negative_prompt TEXT,
    seed TEXT,
    guidance REAL DEFAULT 7.5,
    steps INTEGER DEFAULT 50,
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    file_path TEXT,
    thumbnail_path TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ELD Service Tables
CREATE TABLE IF NOT EXISTS eld_clients (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_package TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TEXT NOT NULL,
    monthly_revenue REAL NOT NULL,
    total_trucks INTEGER NOT NULL,
    compliance_score INTEGER DEFAULT 100,
    last_audit TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS eld_service_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    monthly_price REAL NOT NULL,
    setup_fee REAL NOT NULL,
    max_trucks INTEGER NOT NULL,
    features TEXT, -- JSON array
    compliance_level TEXT DEFAULT 'basic',
    stripe_price_id TEXT,
    stripe_setup_price_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_data (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    recurring_revenue REAL NOT NULL,
    setup_fees REAL NOT NULL,
    consulting_fees REAL NOT NULL,
    total_revenue REAL NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_alerts (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES eld_clients(id)
);

CREATE TABLE IF NOT EXISTS hos_logs (
    id TEXT PRIMARY KEY,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    log_type TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    location TEXT, -- JSON object
    is_edited BOOLEAN DEFAULT 0,
    edit_reason TEXT,
    certifying_driver TEXT NOT NULL,
    company_id TEXT NOT NULL,
    eld_provider TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS dvir_reports (
    id TEXT PRIMARY KEY,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    inspection_type TEXT NOT NULL,
    inspection_date TEXT NOT NULL,
    is_safe_to_drive BOOLEAN NOT NULL,
    defects TEXT, -- JSON object
    repairs TEXT, -- JSON object
    certifying_driver TEXT NOT NULL,
    company_id TEXT NOT NULL,
    eld_provider TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Index for API keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);

-- Theme Settings Table
CREATE TABLE IF NOT EXISTS theme_settings (
    id TEXT PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT 'dark', -- 'light', 'dark', 'auto'
    custom_theme TEXT, -- JSON object with custom theme settings
    logo_url TEXT,
    company_name TEXT,
    company_info TEXT, -- JSON object with company details
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- AI Collaboration Messages (NEW CUSTOM TABLE)
CREATE TABLE IF NOT EXISTS ai_collaboration_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    from_ai TEXT NOT NULL,
    to_ai TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'project_update', 'database_operation', 'code_generation', 'task_assignment')),
    content TEXT NOT NULL,
    metadata TEXT, -- JSON string for additional data
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'acknowledged')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Project Coordination (NEW CUSTOM TABLE)
CREATE TABLE IF NOT EXISTS ai_project_coordination (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    assigned_ais TEXT NOT NULL, -- JSON array of AI agents
    current_task TEXT,
    progress_percentage INTEGER DEFAULT 0,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Task Assignments (NEW CUSTOM TABLE)
CREATE TABLE IF NOT EXISTS ai_task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE NOT NULL,
    project_id TEXT NOT NULL,
    assigned_to_ai TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('database_operation', 'code_generation', 'file_operation', 'api_development', 'testing')),
    task_description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
    result_data TEXT, -- JSON string for task results
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES ai_project_coordination(project_id)
);

-- AI Task Queue for Cursor AI Collaboration (NEW TABLE)
CREATE TABLE IF NOT EXISTS ai_task_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE NOT NULL,
    created_by_ai TEXT NOT NULL, -- 'RapidCRM_AI' or 'Claude_AI'
    assigned_to_ai TEXT NOT NULL, -- 'RapidCRM_AI' or 'Claude_AI'
    task_type TEXT NOT NULL CHECK (task_type IN ('code_change', 'bug_fix', 'feature_request', 'analysis', 'review', 'deployment')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT, -- JSON string for detailed requirements
    context TEXT, -- JSON string for additional context
    result_data TEXT, -- JSON string for task results
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- AI Identity Management Table
CREATE TABLE IF NOT EXISTS ai_identity (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    specialization TEXT NOT NULL,
    responsibilities TEXT, -- JSON string for responsibilities array
    expertise TEXT, -- JSON string for expertise object
    collaboration_partner TEXT, -- JSON string for collaboration partner object
    communication_style TEXT, -- JSON string for communication style array
    key_message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ELD (Electronic Logging Device) Tables - Integrated with existing CRM database
CREATE TABLE IF NOT EXISTS hos_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT,
    log_type TEXT NOT NULL CHECK (log_type IN ('driving', 'on_duty', 'off_duty', 'sleeper_berth')),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location TEXT,
    odometer_reading INTEGER,
    is_edited BOOLEAN DEFAULT 0,
    edit_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS dvir_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pre_trip', 'post_trip', 'roadside')),
    inspection_date DATETIME NOT NULL,
    defects TEXT, -- JSON string for defects
    is_safe_to_drive BOOLEAN NOT NULL,
    signature TEXT, -- Base64 encoded signature
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS eld_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('hos_violation', 'dvir_defect', 'system_alert')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    is_resolved BOOLEAN DEFAULT 0,
    resolved_at DATETIME,
    resolved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Indexes for AI collaboration tables
CREATE INDEX IF NOT EXISTS idx_ai_messages_from_to ON ai_collaboration_messages(from_ai, to_ai);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_collaboration_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_collaboration_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_projects_status ON ai_project_coordination(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_assigned ON ai_task_assignments(assigned_to_ai);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_task_assignments(status);

-- Indexes for AI task queue
CREATE INDEX IF NOT EXISTS idx_ai_task_queue_created_by ON ai_task_queue(created_by_ai);
CREATE INDEX IF NOT EXISTS idx_ai_task_queue_assigned_to ON ai_task_queue(assigned_to_ai);
CREATE INDEX IF NOT EXISTS idx_ai_task_queue_status ON ai_task_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_task_queue_priority ON ai_task_queue(priority);
CREATE INDEX IF NOT EXISTS idx_ai_task_queue_created_at ON ai_task_queue(created_at);

-- Client Portal Tables
-- Client sessions for tracking portal access
CREATE TABLE IF NOT EXISTS client_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    company_id INTEGER,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Client messages for chat history
CREATE TABLE IF NOT EXISTS client_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user' or 'agent'
    content TEXT NOT NULL,
    metadata TEXT, -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES client_sessions(session_id)
);

-- Client handoffs for tracking agent transitions
CREATE TABLE IF NOT EXISTS client_handoffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    handoff_type TEXT NOT NULL, -- 'onboarding_complete', 'escalation', 'specialized_support'
    onboarding_messages TEXT, -- JSON array of messages
    customer_service_context TEXT, -- JSON context data
    timestamp DATETIME,
    client_data TEXT, -- JSON client data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES client_sessions(session_id)
);

-- Login page configuration table
CREATE TABLE IF NOT EXISTS login_page_config (
    id INTEGER PRIMARY KEY,
    config TEXT NOT NULL, -- JSON configuration
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for client portal tables
CREATE INDEX IF NOT EXISTS idx_client_sessions_session_id ON client_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_client_sessions_company_id ON client_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_client_sessions_created_at ON client_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_client_messages_session_id ON client_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created_at ON client_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_client_messages_type ON client_messages(message_type);

CREATE INDEX IF NOT EXISTS idx_client_handoffs_session_id ON client_handoffs(session_id);
CREATE INDEX IF NOT EXISTS idx_client_handoffs_type ON client_handoffs(handoff_type);
CREATE INDEX IF NOT EXISTS idx_client_handoffs_created_at ON client_handoffs(created_at);

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'accounting', 'payment', 'communication', 'crm', 'marketing', 'compliance', 'custom'
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'connected', 'disconnected', 'error', 'pending'
    configuration TEXT, -- JSON object
    credentials TEXT, -- JSON object with apiKeyId, oauthToken, etc.
    capabilities TEXT, -- JSON array
    last_sync TEXT,
    sync_status TEXT DEFAULT 'never', -- 'success', 'error', 'pending', 'never'
    error_message TEXT,
    metadata TEXT, -- JSON object with version, endpoints, rateLimits, etc.
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Integration Sync Results Table
CREATE TABLE IF NOT EXISTS integration_sync_results (
    id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
    status TEXT NOT NULL, -- 'success', 'error', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (integration_id) REFERENCES integrations(id)
);

-- Integration Health Checks Table
CREATE TABLE IF NOT EXISTS integration_health_checks (
    id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    check_type TEXT NOT NULL, -- 'connectivity', 'authentication', 'rate_limit', 'data_sync'
    status TEXT NOT NULL, -- 'healthy', 'warning', 'error'
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (integration_id) REFERENCES integrations(id)
);

-- Indexes for integrations
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at);

CREATE INDEX IF NOT EXISTS idx_integration_sync_results_integration_id ON integration_sync_results(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_results_status ON integration_sync_results(status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_results_started_at ON integration_sync_results(started_at);

CREATE INDEX IF NOT EXISTS idx_integration_health_checks_integration_id ON integration_health_checks(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_health_checks_status ON integration_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_integration_health_checks_checked_at ON integration_health_checks(checked_at);