-- Training Scenarios Database Schema
-- Stores generated scenarios for reuse across all training environments

-- Client Profiles Table
CREATE TABLE IF NOT EXISTS client_profiles (
    id TEXT PRIMARY KEY,
    business_type TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    states TEXT NOT NULL, -- JSON array of state codes
    cargo_types TEXT NOT NULL, -- JSON array of cargo types
    fleet_size INTEGER NOT NULL,
    has_cdl BOOLEAN NOT NULL,
    is_third_party BOOLEAN NOT NULL,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    business_description TEXT NOT NULL,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
    budget TEXT NOT NULL CHECK (budget IN ('low', 'medium', 'high')),
    experience TEXT NOT NULL CHECK (experience IN ('new', 'experienced', 'expert')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Training Scenarios Table
CREATE TABLE IF NOT EXISTS training_scenarios (
    id TEXT PRIMARY KEY,
    client_profile_id TEXT NOT NULL,
    expected_registrations TEXT NOT NULL, -- JSON array
    expected_services TEXT NOT NULL, -- JSON array
    should_create_deal BOOLEAN NOT NULL,
    estimated_cost REAL NOT NULL,
    complexity INTEGER NOT NULL CHECK (complexity >= 1 AND complexity <= 10),
    conversation_starters TEXT NOT NULL, -- JSON array
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
    category TEXT NOT NULL CHECK (category IN ('common', 'edge_case', 'critical_path')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_profile_id) REFERENCES client_profiles(id)
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    session_type TEXT NOT NULL, -- 'alex_onboarding', 'usdot_rpa', 'critical_path'
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    score REAL DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    correct_responses INTEGER DEFAULT 0,
    mistakes TEXT, -- JSON array of mistakes
    performance_data TEXT, -- JSON object with detailed metrics
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id)
);

-- Training Messages Table
CREATE TABLE IF NOT EXISTS training_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('client', 'agent', 'system')),
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_correct BOOLEAN,
    feedback TEXT,
    evaluation_data TEXT, -- JSON object with detailed evaluation
    FOREIGN KEY (session_id) REFERENCES training_sessions(id)
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'regulatory_analysis', 'service_recommendation', 'conversation_flow', etc.
    metric_value REAL NOT NULL,
    expected_value REAL,
    is_correct BOOLEAN,
    feedback TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id)
);

-- Scenario Usage Statistics
CREATE TABLE IF NOT EXISTS scenario_usage (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    usage_type TEXT NOT NULL, -- 'alex_training', 'usdot_training', 'critical_path'
    success_rate REAL,
    average_score REAL,
    total_attempts INTEGER DEFAULT 1,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id),
    FOREIGN KEY (session_id) REFERENCES training_sessions(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_scenarios_category ON training_scenarios(category);
CREATE INDEX IF NOT EXISTS idx_training_scenarios_difficulty ON training_scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_training_sessions_agent_id ON training_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_messages_session_id ON training_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_scenario_usage_scenario_id ON scenario_usage(scenario_id);

-- Views for common queries
CREATE VIEW IF NOT EXISTS scenario_summary AS
SELECT 
    ts.id,
    ts.category,
    ts.difficulty,
    ts.complexity,
    cp.business_type,
    cp.operation_type,
    cp.fleet_size,
    cp.states,
    cp.cargo_types,
    ts.expected_services,
    ts.estimated_cost,
    ts.created_at,
    COUNT(tse.id) as usage_count,
    AVG(tse.score) as average_score
FROM training_scenarios ts
JOIN client_profiles cp ON ts.client_profile_id = cp.id
LEFT JOIN training_sessions tse ON ts.id = tse.scenario_id
GROUP BY ts.id;

CREATE VIEW IF NOT EXISTS agent_performance AS
SELECT 
    agent_id,
    session_type,
    COUNT(*) as total_sessions,
    AVG(score) as average_score,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_sessions,
    AVG(total_messages) as average_messages,
    AVG(correct_responses) as average_correct_responses
FROM training_sessions
GROUP BY agent_id, session_type;
