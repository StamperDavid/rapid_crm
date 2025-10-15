-- Qualified States Regulatory Thresholds Schema
-- This table stores state-specific GVWR and passenger thresholds
-- CRITICAL: This ONLY applies to INTRASTATE operations
-- Interstate operations ALWAYS use Federal 49 CFR (10,000 lbs / 8+ passengers)

CREATE TABLE IF NOT EXISTS qualified_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_code TEXT NOT NULL UNIQUE, -- Two-letter state code (e.g., 'TX', 'CA', 'FL')
    state_name TEXT NOT NULL,
    
    -- GVWR Thresholds (in pounds) - For Hire Operations
    gvwr_threshold_fh INTEGER NOT NULL, -- Minimum GVWR that triggers USDOT requirement for FOR HIRE operations
    gvwr_notes_fh TEXT, -- Additional notes about GVWR requirements for FOR HIRE
    
    -- GVWR Thresholds (in pounds) - Private Property Operations  
    gvwr_threshold_pp INTEGER NOT NULL, -- Minimum GVWR that triggers USDOT requirement for PRIVATE PROPERTY operations
    gvwr_notes_pp TEXT, -- Additional notes about GVWR requirements for PRIVATE PROPERTY
    
    -- Passenger Thresholds - For Hire Operations
    passenger_threshold_fh INTEGER NOT NULL, -- Minimum passengers that triggers USDOT requirement for FOR HIRE operations
    passenger_notes_fh TEXT, -- Additional notes about passenger requirements for FOR HIRE
    
    -- Passenger Thresholds - Private Property Operations
    passenger_threshold_pp INTEGER NOT NULL, -- Minimum passengers that triggers USDOT requirement for PRIVATE PROPERTY operations
    passenger_notes_pp TEXT, -- Additional notes about passenger requirements for PRIVATE PROPERTY
    
    -- Authority Requirements (for intrastate operations)
    requires_intrastate_authority BOOLEAN DEFAULT FALSE,
    intrastate_authority_name TEXT, -- e.g., "Texas Motor Carrier Authority"
    authority_threshold_gvwr INTEGER, -- GVWR threshold for authority requirement
    authority_notes TEXT,
    
    -- Additional State-Specific Requirements
    additional_requirements TEXT, -- JSON array of other state-specific requirements
    
    -- Regulatory Information
    state_regulation_reference TEXT, -- Reference to state regulations (e.g., "Texas Transportation Code §643.001")
    adopted_federal_49cfr BOOLEAN DEFAULT FALSE, -- Did state adopt federal 49 CFR in full?
    partial_adoption_notes TEXT, -- If partial adoption, what was adopted?
    
    -- Metadata
    last_updated DATE NOT NULL,
    updated_by TEXT,
    verified_date DATE, -- Last date this was verified as accurate
    verified_by TEXT,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Federal Regulations Table (for reference and comparison)
CREATE TABLE IF NOT EXISTS federal_regulations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regulation_name TEXT NOT NULL,
    regulation_code TEXT NOT NULL, -- e.g., "49 CFR 390.5"
    description TEXT,
    
    -- Federal Thresholds
    gvwr_threshold INTEGER DEFAULT 10001, -- Federal threshold: 10,001+ lbs
    passenger_threshold INTEGER DEFAULT 8, -- Federal threshold: 8+ passengers
    
    applies_to TEXT NOT NULL, -- 'interstate', 'all', 'specific'
    effective_date DATE,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Determination Log (for tracking and improving accuracy)
CREATE TABLE IF NOT EXISTS compliance_determination_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Client Information
    company_name TEXT,
    state_code TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK(operation_type IN ('for_hire', 'private', 'both')),
    operation_radius TEXT NOT NULL CHECK(operation_radius IN ('intrastate', 'interstate', 'both')),
    
    -- Vehicle/Operation Details
    gvwr INTEGER,
    passenger_capacity INTEGER,
    cargo_types TEXT, -- JSON array
    
    -- Determination Results
    determination_logic TEXT, -- Which logic was applied (interstate_federal vs intrastate_qualified_states)
    requires_usdot BOOLEAN,
    requires_authority BOOLEAN,
    authority_type TEXT,
    additional_requirements TEXT, -- JSON array
    
    -- Correctness Tracking
    determination_correct BOOLEAN, -- Was this determination correct?
    corrected_by TEXT, -- Who corrected it (admin user)
    correction_notes TEXT, -- What was wrong and what should it be
    corrected_at DATETIME,
    
    -- AI Training
    used_for_training BOOLEAN DEFAULT FALSE,
    training_scenario_id INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (state_code) REFERENCES qualified_states(state_code)
);

-- Training Scenarios Table
CREATE TABLE IF NOT EXISTS regulatory_training_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Scenario Details
    scenario_name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    
    -- Test Case Data
    state_code TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK(operation_type IN ('for_hire', 'private', 'both')),
    operation_radius TEXT NOT NULL CHECK(operation_radius IN ('intrastate', 'interstate', 'both')),
    gvwr INTEGER,
    passenger_capacity INTEGER,
    cargo_types TEXT, -- JSON array
    
    -- Expected Correct Answer
    expected_requires_usdot BOOLEAN NOT NULL,
    expected_requires_authority BOOLEAN NOT NULL,
    expected_authority_type TEXT,
    expected_additional_requirements TEXT, -- JSON array
    expected_determination_logic TEXT, -- Which logic should be applied
    
    -- Explanation
    explanation TEXT NOT NULL, -- Why this is the correct answer
    regulatory_references TEXT, -- Citations to regulations
    
    -- Testing
    times_tested INTEGER DEFAULT 0,
    times_passed INTEGER DEFAULT 0,
    last_tested_at DATETIME,
    pass_rate REAL GENERATED ALWAYS AS (
        CASE WHEN times_tested > 0 
        THEN CAST(times_passed AS REAL) / CAST(times_tested AS REAL) * 100 
        ELSE 0 END
    ) STORED,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (state_code) REFERENCES qualified_states(state_code)
);

-- Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS regulatory_knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Document Information
    document_type TEXT NOT NULL CHECK(document_type IN ('qualified_states_list', 'federal_regulation', 'state_regulation', 'policy_memo', 'faq', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Content
    content TEXT, -- For text documents
    file_path TEXT, -- For uploaded files
    file_type TEXT, -- xlsx, csv, pdf, etc.
    
    -- Applicable States (JSON array for multi-state documents)
    applicable_states TEXT,
    
    -- Versioning
    version TEXT,
    supersedes_document_id INTEGER, -- Reference to previous version
    is_current_version BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    uploaded_by TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_by TEXT,
    verified_at DATETIME,
    last_reviewed_date DATE,
    next_review_date DATE,
    
    notes TEXT,
    
    FOREIGN KEY (supersedes_document_id) REFERENCES regulatory_knowledge_base(id)
);

-- Agent Training Performance Table
CREATE TABLE IF NOT EXISTS agent_training_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Training Session
    training_session_id TEXT NOT NULL,
    agent_id TEXT NOT NULL, -- 'onboarding_agent', etc.
    training_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance Metrics
    total_scenarios_tested INTEGER NOT NULL,
    scenarios_passed INTEGER NOT NULL,
    scenarios_failed INTEGER NOT NULL,
    accuracy_rate REAL GENERATED ALWAYS AS (
        CAST(scenarios_passed AS REAL) / CAST(total_scenarios_tested AS REAL) * 100
    ) STORED,
    
    -- Error Analysis
    interstate_federal_accuracy REAL, -- Accuracy on interstate scenarios
    intrastate_qualified_states_accuracy REAL, -- Accuracy on intrastate scenarios
    common_errors TEXT, -- JSON array of common error patterns
    
    -- Knowledge Base Version
    knowledge_base_version TEXT,
    qualified_states_version TEXT,
    
    -- Training Status
    training_status TEXT CHECK(training_status IN ('in_progress', 'completed', 'failed', 'needs_review')),
    deployed_to_production BOOLEAN DEFAULT FALSE,
    deployment_date DATETIME,
    
    -- Notes
    trainer_notes TEXT,
    improvement_recommendations TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Federal Baseline (49 CFR)
INSERT OR IGNORE INTO federal_regulations (
    regulation_name, 
    regulation_code, 
    description, 
    gvwr_threshold, 
    passenger_threshold, 
    applies_to,
    effective_date,
    notes
) VALUES (
    'Federal Motor Carrier Safety Regulations',
    '49 CFR 390.5',
    'Federal threshold for commercial motor vehicle operations requiring USDOT number',
    10001,
    8,
    'interstate',
    '1999-01-01',
    'Applies to ALL interstate operations. GVWR 10001+ lbs or 8+ passengers.'
);

-- Example data removed - will be imported from Excel file

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qualified_states_state_code ON qualified_states(state_code);
CREATE INDEX IF NOT EXISTS idx_compliance_log_state ON compliance_determination_log(state_code);
CREATE INDEX IF NOT EXISTS idx_training_scenarios_state ON regulatory_training_scenarios(state_code);
CREATE INDEX IF NOT EXISTS idx_training_scenarios_active ON regulatory_training_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON regulatory_knowledge_base(document_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_current ON regulatory_knowledge_base(is_current_version);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_qualified_states_timestamp 
    AFTER UPDATE ON qualified_states
    BEGIN
        UPDATE qualified_states SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_training_scenarios_timestamp 
    AFTER UPDATE ON regulatory_training_scenarios
    BEGIN
        UPDATE regulatory_training_scenarios SET modified_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Create view for easy compliance determination
CREATE VIEW IF NOT EXISTS compliance_rules_view AS
SELECT 
    qs.state_code,
    qs.state_name,
    'intrastate' as operation_radius,
    qs.gvwr_threshold as applicable_gvwr_threshold,
    qs.passenger_threshold as applicable_passenger_threshold,
    'qualified_states_list' as rule_source,
    qs.requires_intrastate_authority,
    qs.intrastate_authority_name,
    qs.notes
FROM qualified_states qs

UNION ALL

SELECT 
    'ALL' as state_code,
    'All States (Interstate)' as state_name,
    'interstate' as operation_radius,
    fr.gvwr_threshold as applicable_gvwr_threshold,
    fr.passenger_threshold as applicable_passenger_threshold,
    'federal_49_cfr' as rule_source,
    TRUE as requires_intrastate_authority,
    'MC Authority' as intrastate_authority_name,
    fr.notes
FROM federal_regulations fr
WHERE fr.applies_to = 'interstate';

