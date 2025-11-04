-- Onboarding Agent Database Schema
-- Stores onboarding session data and conversation flow

-- Onboarding Sessions Table
CREATE TABLE IF NOT EXISTS onboarding_sessions (
    session_id TEXT PRIMARY KEY,
    
    -- Flow State
    current_step TEXT NOT NULL,
    step_index INTEGER DEFAULT 0,
    
    -- Collected Data
    collected_data TEXT NOT NULL, -- JSON: all data collected from client
    recommendations TEXT, -- JSON: service recommendations from StateQualificationEngine
    
    -- Deal & Payment
    deal_id TEXT, -- Created deal ID
    checkout_url TEXT, -- Payment checkout URL
    payment_session_id TEXT, -- Payment provider session ID
    payment_completed INTEGER DEFAULT 0, -- 0 = no, 1 = yes
    
    -- Conversation
    conversation_history TEXT, -- JSON array: full conversation log
    
    -- Session Management
    started_at TEXT NOT NULL,
    last_activity TEXT,
    completed_at TEXT,
    expires_at TEXT, -- Session expiration (24 hours)
    
    -- Handoff
    handed_off INTEGER DEFAULT 0, -- 0 = no, 1 = handed off to customer service
    handoff_id TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    referral_source TEXT,
    
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (handoff_id) REFERENCES client_handoffs(id)
);

-- Onboarding Analytics Table
CREATE TABLE IF NOT EXISTS onboarding_analytics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    
    -- Metrics
    total_duration_seconds INTEGER, -- Time from start to completion
    steps_completed INTEGER,
    steps_total INTEGER,
    
    -- Conversion
    converted_to_deal INTEGER DEFAULT 0, -- 0 = no, 1 = yes
    deal_value REAL DEFAULT 0,
    services_purchased TEXT, -- JSON array
    
    -- Drop-off Analysis
    dropped_at_step TEXT, -- Which step did they leave?
    drop_reason TEXT, -- Why did they leave? (if known)
    
    -- Quality Metrics
    questions_asked INTEGER DEFAULT 0,
    corrections_made INTEGER DEFAULT 0, -- How many times did they correct info?
    recommendation_accuracy INTEGER, -- 1-10 rating (if provided)
    
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (session_id) REFERENCES onboarding_sessions(session_id)
);

-- Service Recommendation Log (for improving recommendations)
CREATE TABLE IF NOT EXISTS service_recommendation_log (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    
    -- Business Profile
    business_type TEXT,
    operation_type TEXT,
    interstate_commerce INTEGER,
    number_of_vehicles INTEGER,
    vehicle_weight TEXT,
    states_of_operation TEXT, -- JSON array
    hazmat INTEGER,
    for_hire INTEGER,
    
    -- Recommendations Made
    recommended_services TEXT NOT NULL, -- JSON array
    total_required_cost REAL,
    total_recommended_cost REAL,
    
    -- Outcome
    services_accepted TEXT, -- JSON array: which services did they buy?
    services_rejected TEXT, -- JSON array: which did they decline?
    acceptance_rate REAL, -- Percentage of recommended services accepted
    
    -- Feedback
    was_accurate INTEGER, -- 0 = no, 1 = yes, NULL = unknown
    feedback_notes TEXT,
    corrected_by_admin INTEGER DEFAULT 0,
    
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (session_id) REFERENCES onboarding_sessions(session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_started ON onboarding_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_deal ON onboarding_sessions(deal_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_completed ON onboarding_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_payment ON onboarding_sessions(payment_completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_session ON onboarding_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_service_recommendation_session ON service_recommendation_log(session_id);



