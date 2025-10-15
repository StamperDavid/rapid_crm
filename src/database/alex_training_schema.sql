-- Alex Onboarding Agent Training System Database Schema

-- Training scenarios table - stores all generated USDOT application scenarios
CREATE TABLE IF NOT EXISTS alex_training_scenarios (
    id TEXT PRIMARY KEY,
    scenario_data TEXT NOT NULL, -- JSON of complete USDOTApplicationScenario
    state TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'for_hire' or 'private_property'
    operation_radius TEXT NOT NULL, -- 'interstate' or 'intrastate'
    business_type TEXT NOT NULL,
    has_hazmat INTEGER NOT NULL DEFAULT 0,
    fleet_size TEXT NOT NULL, -- 'small', 'medium', 'large'
    
    -- Expected correct answers
    expected_usdot_required INTEGER NOT NULL,
    expected_mc_authority_required INTEGER NOT NULL,
    expected_hazmat_required INTEGER NOT NULL,
    expected_ifta_required INTEGER NOT NULL,
    expected_state_registration_required INTEGER NOT NULL,
    expected_reasoning TEXT NOT NULL,
    
    -- Metadata
    created_at TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- Test results table - stores Alex's responses to each scenario
CREATE TABLE IF NOT EXISTS alex_test_results (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    test_session_id TEXT NOT NULL,
    
    -- Alex's determination
    alex_usdot_required INTEGER,
    alex_mc_authority_required INTEGER,
    alex_hazmat_required INTEGER,
    alex_ifta_required INTEGER,
    alex_state_registration_required INTEGER,
    alex_reasoning TEXT,
    alex_full_response TEXT, -- Complete response from Alex
    
    -- Correctness evaluation
    is_correct INTEGER, -- NULL = not reviewed, 0 = incorrect, 1 = correct
    mistakes TEXT, -- JSON array of what Alex got wrong
    
    -- Your review/correction
    reviewer_feedback TEXT,
    correct_answer TEXT, -- What Alex should have said
    reviewed_by TEXT,
    reviewed_at TEXT,
    
    -- Metadata
    tested_at TEXT NOT NULL,
    response_time_ms INTEGER
);

-- Training sessions table - groups test results into sessions
CREATE TABLE IF NOT EXISTS alex_training_sessions (
    id TEXT PRIMARY KEY,
    session_name TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    
    -- Session stats
    total_scenarios INTEGER NOT NULL DEFAULT 0,
    scenarios_completed INTEGER NOT NULL DEFAULT 0,
    scenarios_correct INTEGER NOT NULL DEFAULT 0,
    scenarios_incorrect INTEGER NOT NULL DEFAULT 0,
    scenarios_pending_review INTEGER NOT NULL DEFAULT 0,
    
    -- Performance metrics
    accuracy_percentage REAL,
    average_response_time_ms INTEGER,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused'
    notes TEXT
);

-- Shared regulatory knowledge base - both Alex and Jasper learn from this
CREATE TABLE IF NOT EXISTS shared_regulatory_knowledge (
    id TEXT PRIMARY KEY,
    
    -- Scenario identifiers
    state TEXT,
    operation_type TEXT,
    operation_radius TEXT,
    cargo_type TEXT,
    gvwr INTEGER,
    passenger_capacity INTEGER,
    fleet_size INTEGER,
    
    -- Correct determination
    usdot_required INTEGER NOT NULL,
    mc_authority_required INTEGER NOT NULL,
    hazmat_required INTEGER NOT NULL,
    ifta_required INTEGER NOT NULL,
    state_registration_required INTEGER NOT NULL,
    reasoning TEXT NOT NULL,
    
    -- Source of knowledge
    learned_from_scenario_id TEXT,
    learned_from_agent TEXT, -- 'alex', 'jasper', 'manual'
    correction_notes TEXT,
    
    -- Metadata
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    confidence_score REAL DEFAULT 1.0, -- How confident we are in this knowledge
    times_validated INTEGER DEFAULT 1 -- How many times this has been confirmed correct
);

-- Training corrections log - detailed history of all corrections
CREATE TABLE IF NOT EXISTS alex_training_corrections (
    id TEXT PRIMARY KEY,
    test_result_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    
    -- What was wrong
    field_corrected TEXT NOT NULL, -- 'usdot_required', 'mc_authority_required', etc.
    alex_answer TEXT,
    correct_answer TEXT,
    
    -- Your explanation
    correction_explanation TEXT NOT NULL,
    correction_category TEXT, -- 'regulatory_misunderstanding', 'threshold_error', 'logic_error', etc.
    
    -- Learning impact
    applied_to_knowledge_base INTEGER DEFAULT 0,
    similar_scenarios_updated INTEGER DEFAULT 0,
    
    -- Metadata
    corrected_by TEXT NOT NULL,
    corrected_at TEXT NOT NULL
);

-- Agent performance tracking over time
CREATE TABLE IF NOT EXISTS alex_performance_metrics (
    id TEXT PRIMARY KEY,
    metric_date TEXT NOT NULL,
    
    -- Overall performance
    total_tests INTEGER NOT NULL,
    correct_tests INTEGER NOT NULL,
    incorrect_tests INTEGER NOT NULL,
    accuracy_percentage REAL NOT NULL,
    
    -- Category-specific performance
    interstate_accuracy REAL,
    intrastate_accuracy REAL,
    hazmat_accuracy REAL,
    mc_authority_accuracy REAL,
    
    -- Common mistakes
    common_mistakes TEXT, -- JSON array
    
    -- Improvement tracking
    improvement_from_previous REAL,
    is_improving INTEGER,
    
    created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_state ON alex_training_scenarios(state);
CREATE INDEX IF NOT EXISTS idx_scenarios_operation ON alex_training_scenarios(operation_type, operation_radius);
CREATE INDEX IF NOT EXISTS idx_test_results_scenario ON alex_test_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_test_results_session ON alex_test_results(test_session_id);
CREATE INDEX IF NOT EXISTS idx_test_results_correctness ON alex_test_results(is_correct);
CREATE INDEX IF NOT EXISTS idx_knowledge_state ON shared_regulatory_knowledge(state, operation_type, operation_radius);
CREATE INDEX IF NOT EXISTS idx_corrections_scenario ON alex_training_corrections(scenario_id);

