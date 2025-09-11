-- Persistent Conversation Storage Schema
-- This schema supports agent stateful storage and conversation memory

-- Conversation Contexts Table
CREATE TABLE IF NOT EXISTS conversation_contexts (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_agent_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    average_response_time REAL DEFAULT 0,
    client_satisfaction REAL DEFAULT 0,
    conversation_quality TEXT DEFAULT 'good' CHECK (conversation_quality IN ('excellent', 'good', 'average', 'poor')),
    
    -- Conversation Flow
    current_topic TEXT DEFAULT 'greeting',
    conversation_stage TEXT DEFAULT 'greeting' CHECK (conversation_stage IN ('greeting', 'information_gathering', 'problem_solving', 'solution_providing', 'follow_up', 'closing')),
    
    -- Indexes
    UNIQUE(conversation_id),
    INDEX idx_client_id (client_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_updated_at (updated_at)
);

-- Client Profiles Table
CREATE TABLE IF NOT EXISTS client_profiles (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    communication_style TEXT DEFAULT 'friendly' CHECK (communication_style IN ('formal', 'casual', 'technical', 'friendly')),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_interactions INTEGER DEFAULT 1,
    satisfaction_score REAL DEFAULT 0,
    
    -- Preferences stored as JSON
    preferences TEXT DEFAULT '{}',
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_company_name (company_name)
);

-- Agent Memory Table
CREATE TABLE IF NOT EXISTS agent_memory (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    
    -- Key facts stored as JSON
    key_facts TEXT DEFAULT '{}',
    
    -- Previous issues and solutions
    previous_issues TEXT DEFAULT '[]', -- JSON array
    resolved_solutions TEXT DEFAULT '[]', -- JSON array
    
    -- Client preferences stored as JSON
    client_preferences TEXT DEFAULT '{}',
    
    -- Relationship notes
    relationship_notes TEXT DEFAULT '[]', -- JSON array
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE
);

-- Follow-up Items Table
CREATE TABLE IF NOT EXISTS follow_up_items (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATETIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
);

-- Conversation History Table
CREATE TABLE IF NOT EXISTS conversation_history (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'ai')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'handoff_request', 'file', 'image')),
    timestamp DATETIME NOT NULL,
    
    -- Message metadata stored as JSON
    metadata TEXT DEFAULT '{}',
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    INDEX idx_timestamp (timestamp),
    INDEX idx_sender (sender)
);

-- Client Topics Table (for tracking common topics)
CREATE TABLE IF NOT EXISTS client_topics (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    first_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    UNIQUE(conversation_context_id, topic),
    INDEX idx_topic (topic),
    INDEX idx_frequency (frequency)
);

-- Client Pain Points Table
CREATE TABLE IF NOT EXISTS client_pain_points (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    pain_point TEXT NOT NULL,
    first_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_date DATETIME,
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    INDEX idx_resolved (resolved),
    INDEX idx_pain_point (pain_point)
);

-- Client Goals Table
CREATE TABLE IF NOT EXISTS client_goals (
    id TEXT PRIMARY KEY,
    conversation_context_id TEXT NOT NULL,
    goal TEXT NOT NULL,
    first_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_mentioned DATETIME DEFAULT CURRENT_TIMESTAMP,
    achieved BOOLEAN DEFAULT FALSE,
    achievement_date DATETIME,
    
    FOREIGN KEY (conversation_context_id) REFERENCES conversation_contexts(id) ON DELETE CASCADE,
    INDEX idx_achieved (achieved),
    INDEX idx_goal (goal)
);

-- Agent Memory Banks Table (for global agent insights)
CREATE TABLE IF NOT EXISTS agent_memory_banks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Global insights stored as JSON
    common_client_issues TEXT DEFAULT '[]',
    successful_solutions TEXT DEFAULT '[]',
    client_satisfaction_trends TEXT DEFAULT '{}',
    conversation_patterns TEXT DEFAULT '{}',
    
    UNIQUE(agent_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_last_updated (last_updated)
);

-- Conversation Indexes Table (for fast lookups)
CREATE TABLE IF NOT EXISTS conversation_indexes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, conversation_id),
    INDEX idx_client_id (client_id),
    INDEX idx_agent_id (agent_id),
    INDEX idx_updated_at (updated_at)
);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_conversation_contexts_timestamp 
    AFTER UPDATE ON conversation_contexts
    FOR EACH ROW
    BEGIN
        UPDATE conversation_contexts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_client_profiles_timestamp 
    AFTER UPDATE ON client_profiles
    FOR EACH ROW
    BEGIN
        UPDATE client_profiles SET last_interaction = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_conversation_indexes_timestamp 
    AFTER UPDATE ON conversation_indexes
    FOR EACH ROW
    BEGIN
        UPDATE conversation_indexes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Views for common queries
CREATE VIEW IF NOT EXISTS conversation_summary AS
SELECT 
    cc.id,
    cc.conversation_id,
    cc.client_id,
    cc.agent_id,
    cp.name as client_name,
    cp.email as client_email,
    cp.company_name,
    cc.conversation_stage,
    cc.current_topic,
    cc.total_messages,
    cc.client_satisfaction,
    cc.conversation_quality,
    cc.created_at,
    cc.updated_at,
    cc.last_agent_interaction
FROM conversation_contexts cc
LEFT JOIN client_profiles cp ON cc.id = cp.conversation_context_id;

CREATE VIEW IF NOT EXISTS agent_performance_summary AS
SELECT 
    cc.agent_id,
    COUNT(DISTINCT cc.client_id) as total_clients,
    COUNT(cc.id) as total_conversations,
    AVG(cc.client_satisfaction) as average_satisfaction,
    AVG(cc.average_response_time) as average_response_time,
    COUNT(CASE WHEN cc.conversation_quality = 'excellent' THEN 1 END) as excellent_conversations,
    COUNT(CASE WHEN cc.conversation_quality = 'good' THEN 1 END) as good_conversations,
    COUNT(CASE WHEN cc.conversation_quality = 'average' THEN 1 END) as average_conversations,
    COUNT(CASE WHEN cc.conversation_quality = 'poor' THEN 1 END) as poor_conversations
FROM conversation_contexts cc
GROUP BY cc.agent_id;

CREATE VIEW IF NOT EXISTS client_interaction_history AS
SELECT 
    cc.client_id,
    cp.name as client_name,
    cp.email as client_email,
    cp.company_name,
    COUNT(cc.id) as total_conversations,
    COUNT(DISTINCT cc.agent_id) as agents_worked_with,
    AVG(cc.client_satisfaction) as average_satisfaction,
    MIN(cc.created_at) as first_interaction,
    MAX(cc.updated_at) as last_interaction,
    SUM(cc.total_messages) as total_messages
FROM conversation_contexts cc
LEFT JOIN client_profiles cp ON cc.id = cp.conversation_context_id
GROUP BY cc.client_id, cp.name, cp.email, cp.company_name;
