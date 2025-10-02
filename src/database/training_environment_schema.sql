-- Training Environment Database Schema
-- Supports AI agent training with performance tracking and Golden Master system

-- Training Scenarios Table
CREATE TABLE IF NOT EXISTS training_scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    registration_type TEXT NOT NULL, -- 'USDOT', 'UCR', 'IFTA', 'ELD', 'IRP', etc.
    difficulty_level INTEGER NOT NULL, -- 1-10 scale
    expected_path TEXT NOT NULL, -- JSON array of expected steps
    test_data TEXT NOT NULL, -- JSON object with test scenario data
    expected_outcome TEXT NOT NULL,
    is_active INTEGER DEFAULT 1, -- 1 for active, 0 for inactive
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL, -- Reference to the AI agent being trained
    scenario_id TEXT NOT NULL, -- Foreign key to training_scenarios
    start_time TEXT NOT NULL,
    end_time TEXT,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    mistakes TEXT, -- JSON array of mistakes made
    completed INTEGER DEFAULT 0, -- 1 for completed, 0 for in progress
    performance_data TEXT, -- JSON object with detailed performance metrics
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id)
);

-- Agent Performance History Table
CREATE TABLE IF NOT EXISTS agent_performance_history (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    registration_type TEXT NOT NULL, -- 'USDOT', 'UCR', 'IFTA', etc.
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    average_accuracy REAL DEFAULT 0.0,
    average_speed REAL DEFAULT 0.0, -- seconds per session
    total_mistakes INTEGER DEFAULT 0,
    common_mistakes TEXT, -- JSON array of most frequent mistakes
    last_training_date TEXT,
    performance_trend TEXT, -- 'improving', 'stable', 'declining'
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Golden Master Agents Table
CREATE TABLE IF NOT EXISTS golden_master_agents (
    id TEXT PRIMARY KEY,
    registration_type TEXT NOT NULL, -- 'USDOT', 'UCR', 'IFTA', etc.
    agent_name TEXT NOT NULL,
    agent_config TEXT NOT NULL, -- JSON object with agent configuration
    training_data TEXT NOT NULL, -- JSON object with training scenarios used
    performance_metrics TEXT NOT NULL, -- JSON object with final performance metrics
    accuracy_percentage REAL NOT NULL, -- Must be 100% to be saved as Golden Master
    created_from_session_id TEXT, -- Reference to the training session that achieved 100%
    is_active INTEGER DEFAULT 1, -- 1 for active, 0 for inactive
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (created_from_session_id) REFERENCES training_sessions(id)
);

-- Training Environment Settings Table
CREATE TABLE IF NOT EXISTS training_environment_settings (
    id TEXT PRIMARY KEY,
    registration_type TEXT NOT NULL, -- 'USDOT', 'UCR', 'IFTA', etc.
    auto_generate_scenarios INTEGER DEFAULT 1, -- 1 for auto-generate, 0 for manual
    scenario_difficulty_range TEXT, -- JSON array [min, max] difficulty levels
    performance_threshold REAL DEFAULT 95.0, -- Minimum accuracy to pass training
    max_training_attempts INTEGER DEFAULT 10, -- Max attempts before agent replacement
    golden_master_threshold REAL DEFAULT 100.0, -- Accuracy required for Golden Master
    auto_replace_failing_agents INTEGER DEFAULT 1, -- 1 for auto-replace, 0 for manual
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Training Progress Tracking Table
CREATE TABLE IF NOT EXISTS training_progress (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    registration_type TEXT NOT NULL,
    current_scenario_id TEXT,
    progress_percentage REAL DEFAULT 0.0,
    last_activity TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    needs_intervention INTEGER DEFAULT 0, -- 1 if human intervention needed
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (current_scenario_id) REFERENCES training_scenarios(id)
);

-- Training Step Evaluations Table
CREATE TABLE IF NOT EXISTS training_step_evaluations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    expected_action TEXT NOT NULL,
    actual_action TEXT NOT NULL,
    is_correct INTEGER NOT NULL, -- 1 for correct, 0 for incorrect
    time_spent INTEGER NOT NULL, -- milliseconds
    confidence REAL, -- 0-1 scale
    score INTEGER DEFAULT 0, -- 0-100 score for this step
    mistake_severity TEXT, -- 'low', 'medium', 'high', 'critical'
    mistake_explanation TEXT,
    mistake_impact TEXT,
    timestamp TEXT NOT NULL,
    
    -- System Fields
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (session_id) REFERENCES training_sessions(id)
);

-- Insert default training scenarios for USDOT registration
INSERT INTO training_scenarios (id, name, description, registration_type, difficulty_level, expected_path, test_data, expected_outcome, created_at, updated_at) VALUES
('usdot_scenario_001', '3rd Party Service Provider - Yes', 'Client is a 3rd party service provider helping others with USDOT registration', 'USDOT', 3, '["3rd_party_yes", "business_type", "service_details"]', '{"isThirdParty": true, "businessType": "service_provider", "services": ["registration_assistance", "compliance_consulting"]}', 'Direct to business type selection and service provider registration path', datetime('now'), datetime('now')),

('usdot_scenario_002', '3rd Party Service Provider - No', 'Client is NOT a 3rd party service provider, registering for their own business', 'USDOT', 2, '["3rd_party_no", "business_entity", "operation_type"]', '{"isThirdParty": false, "businessEntity": "corporation", "operationType": "interstate_commerce"}', 'Proceed to business entity type and operation details', datetime('now'), datetime('now')),

('usdot_scenario_003', 'Complex Multi-State Operation', 'Large fleet operating across multiple states with various cargo types', 'USDOT', 8, '["3rd_party_no", "business_entity", "multi_state", "cargo_types", "fleet_size"]', '{"isThirdParty": false, "businessEntity": "llc", "states": ["CA", "TX", "NY", "FL"], "cargoTypes": ["general_freight", "hazmat", "passengers"], "fleetSize": 25}', 'Complete multi-state registration with all required permits and endorsements', datetime('now'), datetime('now')),

('usdot_scenario_004', 'Light Truck Owner-Operator', 'Single light truck (under 26,000 lbs), local delivery operation', 'USDOT', 2, '["3rd_party_no", "business_entity", "light_truck", "local_operation"]', '{"isThirdParty": false, "businessEntity": "sole_proprietorship", "vehicleWeight": 15000, "operationType": "local", "cargoType": "general_freight"}', 'Simple registration process for light truck local operation', datetime('now'), datetime('now')),

('usdot_scenario_005', 'Hazardous Materials Carrier', 'Specialized hazardous materials transportation with complex requirements', 'USDOT', 9, '["3rd_party_no", "business_entity", "hazmat_carrier", "safety_permits", "insurance_requirements"]', '{"isThirdParty": false, "businessEntity": "corporation", "cargoTypes": ["hazmat"], "hazmatClasses": ["3", "8"], "requiresSafetyPermit": true, "requiresInsurance": true}', 'Complete registration with all hazmat permits and safety requirements', datetime('now'), datetime('now')),

-- Critical Path Scenarios (Most Common Failure Points)
('critical_001', 'Sole Proprietor Transporting Hazmat', 'Sole proprietor attempting to transport hazardous materials - common failure point', 'USDOT', 8, '["business_entity", "operation_type", "hazmat_warning", "entity_recommendation"]', '{"businessType": "sole_proprietor", "operationType": "hazardous_materials", "interstateCommerce": true, "warning": "Sole proprietors may face limitations with hazmat operations"}', 'Identify sole proprietor limitations and recommend LLC/Corporation for hazmat operations', datetime('now'), datetime('now')),

('critical_002', 'Fleet Size vs Driver Capacity Mismatch', 'Company has more vehicles than drivers can operate - common compliance issue', 'USDOT', 6, '["vehicle_count", "driver_count", "capacity_validation", "recommendation"]', '{"totalVehicles": 10, "totalDrivers": 3, "validationError": "Vehicle count (10) exceeds driver capacity (3)", "recommendation": "Either reduce vehicles or hire more drivers"}', 'Identify vehicle/driver mismatch and provide recommendations', datetime('now'), datetime('now')),

('critical_003', 'Interstate Commerce Misclassification', 'Company incorrectly classifies interstate vs intrastate operations', 'USDOT', 7, '["commerce_type", "state_analysis", "classification", "requirements"]', '{"interstateCommerce": "Yes", "statesOfOperation": ["CA", "NV", "AZ"], "classification": "Interstate commerce - crossing state lines"}', 'Correctly identify interstate commerce and explain requirements', datetime('now'), datetime('now')),

('critical_004', 'Missing Critical Documentation', 'Company fails to provide required documents for registration', 'USDOT', 5, '["document_checklist", "missing_docs", "requirements", "guidance"]', '{"ein": "Required - must provide EIN or SSN", "insurance": "Required - must provide certificate", "processAgent": "Required - must designate process agent", "missingDocs": ["EIN", "Insurance Certificate", "Process Agent"]}', 'Identify missing documents and provide guidance on requirements', datetime('now'), datetime('now')),

('critical_005', 'CDL Requirements Mismatch', 'Company operating vehicles requiring CDL without CDL drivers', 'USDOT', 9, '["vehicle_weight", "cdl_requirement", "driver_qualification", "compliance"]', '{"vehicleWeight": "26,001+ lbs", "cdlRequired": "Yes - vehicles over 26,001 lbs require CDL", "driverLicenses": "CDL required for all drivers"}', 'Identify CDL requirements and ensure driver qualifications match', datetime('now'), datetime('now')),

('critical_006', 'Inadequate Insurance Coverage', 'Company has insufficient insurance for operation type', 'USDOT', 8, '["operation_type", "insurance_analysis", "coverage_gap", "recommendation"]', '{"operationType": "hazardous_materials", "requiredInsurance": "Hazmat liability insurance required", "currentInsurance": "Insufficient - need hazmat coverage"}', 'Identify insurance gaps and recommend appropriate coverage', datetime('now'), datetime('now'));

-- Insert default training environment settings
INSERT INTO training_environment_settings (id, registration_type, auto_generate_scenarios, scenario_difficulty_range, performance_threshold, max_training_attempts, golden_master_threshold, auto_replace_failing_agents, created_at, updated_at) VALUES
('usdot_settings', 'USDOT', 1, '[1, 10]', 95.0, 10, 100.0, 1, datetime('now'), datetime('now')),
('ucr_settings', 'UCR', 1, '[1, 8]', 95.0, 10, 100.0, 1, datetime('now'), datetime('now')),
('ifta_settings', 'IFTA', 1, '[1, 7]', 95.0, 10, 100.0, 1, datetime('now'), datetime('now')),
('eld_settings', 'ELD', 1, '[1, 6]', 95.0, 10, 100.0, 1, datetime('now'), datetime('now')),
('irp_settings', 'IRP', 1, '[1, 9]', 95.0, 10, 100.0, 1, datetime('now'), datetime('now'));