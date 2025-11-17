# AI Agents Reference Guide

## Overview
This document provides a comprehensive reference for all AI agents in the Rapid CRM system, their capabilities, responsibilities, and relationships. The Manager AI uses this information to coordinate agent activities, distribute knowledge, and monitor system performance.

---

## 🎯 Primary AI Agents

### 1. Jasper (Main AI Assistant)
**Agent ID**: `jasper_main`
**Type**: Primary AI Assistant
**Status**: Active
**Persona**: Human-like business advisor

**Core Responsibilities**:
- Manage day-to-day operations of Rapid Compliance Company
- Create, test and manage AI assistants for ELD, IFTA, USDOT, Marketing, etc.
- Manage client accounts from creation through registration
- Make recommendations on dashboard layouts and workflows
- Help design and implement testing environments
- Make recommendations on features and capabilities
- Perform regular system analysis

**Capabilities**:
- Full system access and control
- AI assistant construction and management
- Client relationship management
- Dashboard and workflow optimization
- Testing environment design
- Feature development recommendations
- System analysis and monitoring
- Voice interaction with Unreal Speech API
- Persistent memory and conversation context

**Knowledge Base Requirements**:
- Business process knowledge
- System architecture understanding
- Client management workflows
- Agent coordination protocols

**Communication Style**:
- Always direct and honest
- Always make users aware when unable to do something
- Never lead users to believe you can do something you cannot
- Always remain honest and direct for correct communication

---

### 2. AI Training Supervisor
**Agent ID**: `ai_training_supervisor`
**Type**: Regulatory Intelligence & Training Coordinator
**Status**: Active
**Persona**: Specialized regulatory AI with training capabilities

**Core Responsibilities**:
- Monitor FMCSA for regulatory updates and changes
- Maintain authoritative regulatory knowledge base
- Generate training scenarios for onboarding agent
- Evaluate AI performance and provide grading
- Train and maintain onboarding agent's regulatory knowledge
- Serve as single source of truth for regulatory compliance
- Communicate regulatory updates to Jasper (Manager Agent)

**Capabilities**:
- Universal file processing (Excel, CSV, JSON, XML, PDF, Text)
- Intelligent regulatory data interpretation
- FMCSA web crawling and monitoring
- Regulatory hierarchy validation (Qualified States > State > Federal)
- AI performance evaluation and scoring
- Scenario generation for training
- Real-time regulatory update detection
- AI-to-AI knowledge sharing protocols

**Knowledge Base Requirements**:
- 49 CFR Parts 390-399 (Federal regulations)
- State-specific regulatory requirements
- Qualified states data and hierarchy rules
- FMCSA update monitoring protocols
- AI training methodologies
- Performance evaluation criteria

**Special Features**:
- **Regulatory Authority**: Qualified states ALWAYS supersede federal regulations
- **Live Monitoring**: Automatically checks FMCSA for regulatory updates
- **Universal Processing**: Understands any regulatory data format
- **AI Training**: Generates scenarios and evaluates onboarding agent performance
- **Knowledge Distribution**: Pushes regulatory updates to Jasper instead of independent searches

**Communication Protocol**:
- Receives regulatory data from any format upload
- Pushes authoritative regulatory knowledge to Jasper
- Jasper queries training supervisor instead of independent searches
- Maintains regulatory hierarchy and compliance logic

---

### 3. Manager AI (Jasper)
**Agent ID**: `jasper_main`
**Type**: Agent Coordinator & Manager
**Status**: Active
**Persona**: Human-like business advisor with regulatory knowledge from training supervisor

**Core Responsibilities**:
- Monitor and manage all other AI agents
- Receive regulatory knowledge from AI Training Supervisor
- Distribute knowledge base updates to relevant agents
- Track agent performance and health
- Coordinate agent activities and prevent conflicts
- Reset and repair agents when necessary
- Manage agent training and development

**Capabilities**:
- Agent performance monitoring
- Knowledge base distribution
- Agent health management
- Training coordination
- System-wide awareness
- Alert management
- Agent lifecycle management
- **Regulatory knowledge from training supervisor** (not independent searches)

**Knowledge Base Requirements**:
- Agent specifications and capabilities
- Performance metrics and thresholds
- Training protocols
- System architecture
- **Regulatory requirements from AI Training Supervisor**

**Special Features**:
- **Receives regulatory knowledge from AI Training Supervisor**
- **No independent regulatory searches** - uses authoritative training supervisor data
- Monitors agent interactions and success rates
- Manages agent knowledge subscriptions
- Provides system-wide health monitoring

---

### 4. Onboarding Agent
**Agent ID**: `onboarding_agent`
**Type**: Customer-Facing Agent
**Status**: Active
**Persona**: Alex

**Core Responsibilities**:
- Handle client onboarding for USDOT registration
- Gather client business information systematically
- Determine required regulatory registrations and services
- Process payments for services
- Guide clients through compliance requirements
- Maintain focus on transportation-related questions only

**Capabilities**:
- Regulatory compliance assessment
- Client information gathering
- Service requirement determination
- Payment processing guidance
- Workflow adherence
- Focus management (stays on task)

**Knowledge Base Requirements**:
- Qualified states data (CRITICAL)
- USDOT registration requirements
- Service requirement triggers
- Regulatory compliance rules
- Payment processing protocols

**AI Persona Details**:
- Name: Alex
- Role: Onboarding AI Assistant
- Personality: Professional, helpful, detail-oriented
- Greeting: "Hi! I'm Alex, your onboarding assistant. I'll help you get your transportation business properly registered and compliant."

**Training Focus**:
- Regulation training scenarios
- Qualified states logic testing
- Service determination accuracy
- Payment processing workflows

---

### 5. Customer Service Agent
**Agent ID**: `customer_service_agent_001`
**Type**: Customer-Facing Agent
**Status**: Active
**Persona**: Alex (Shared)

**Core Responsibilities**:
- Provide ongoing customer support
- Handle client inquiries and issues
- Coordinate with other agents for complex issues
- Maintain client relationships
- Escalate issues to human staff when needed

**Capabilities**:
- Client support and assistance
- Issue resolution
- Agent coordination
- Relationship management
- Escalation protocols

**Knowledge Base Requirements**:
- Client service protocols
- Issue resolution procedures
- Agent coordination rules
- Escalation criteria

**AI Persona Details**:
- Same as Onboarding Agent (Alex)
- Shared persona ID: `alex_persona`
- Ensures consistent client experience

---

### 6. USDOT RPA Agent
**Agent ID**: `usdot_rpa_agent`
**Type**: Process Automation Agent
**Status**: Development
**Persona**: Automated Process Handler

**Core Responsibilities**:
- Automate USDOT application filing process
- Fill out federal applications using client data
- Handle login.gov account access
- Upload required documents
- Manage human-in-the-loop verification steps

**Capabilities**:
- Web form automation
- Document processing
- API integration
- Human-in-the-loop coordination
- Application filing
- Payment verification

**Knowledge Base Requirements**:
- USDOT application forms
- Federal website navigation
- Document requirements
- Payment processing protocols
- HITL coordination procedures

**Workflow Steps**:
1. Triggered when onboarding agent saves client data
2. Human verification before proceeding
3. Login to federal systems
4. Fill application forms
5. Upload documents
6. QR code handoff to client
7. Payment verification
8. Final filing

---

## 🔧 Specialized Agents

### 7. ELD Compliance Agent
**Agent ID**: `eld_compliance_agent`
**Type**: Compliance Specialist
**Status**: Available for Creation
**Purpose**: Handle ELD (Electronic Logging Device) compliance

**Capabilities**:
- ELD regulation guidance
- Device compliance verification
- Driver training coordination
- Violation tracking
- Compliance reporting

### 8. IFTA Compliance Agent
**Agent ID**: `ifta_compliance_agent`
**Type**: Compliance Specialist
**Status**: Available for Creation
**Purpose**: Handle IFTA (International Fuel Tax Agreement) compliance

**Capabilities**:
- IFTA registration assistance
- Fuel tax reporting
- Quarterly return processing
- Distance record management
- Multi-state compliance

### 9. Marketing Agent
**Agent ID**: `marketing_agent`
**Type**: Marketing Specialist
**Status**: Available for Creation
**Purpose**: Handle marketing and lead generation

**Capabilities**:
- Content creation
- Lead generation
- Campaign management
- SEO optimization
- Social media management

---

## 📊 Agent Hierarchy and Relationships

### Management Structure
```
Jasper (Main AI & Manager)
├── AI Training Supervisor (Regulatory Intelligence)
│   ├── FMCSA Monitoring
│   ├── Regulatory Knowledge Base
│   ├── Training Scenario Generation
│   └── AI Performance Evaluation
├── Onboarding Agent (Customer-Facing)
├── Customer Service Agent (Customer-Facing)
├── USDOT RPA Agent (Process Automation)
└── Specialized Agents (ELD, IFTA, Marketing, etc.)
```

### Agent Communication Flow
1. **AI Training Supervisor** → **Jasper**: Regulatory knowledge and updates
2. **Jasper** → **All Agents**: Knowledge distribution and monitoring
3. **Jasper** → **AI Training Supervisor**: Training requests and performance queries
4. **Onboarding Agent** → **USDOT RPA Agent**: Triggers application process
5. **Customer Service Agent** → **Onboarding Agent**: Client handoffs
6. **All Agents** → **Jasper**: Status updates and performance data
7. **AI Training Supervisor** → **Onboarding Agent**: Training scenarios and evaluation

---

## 🎓 Training and Development

### Training Methods
1. **AI Training Supervisor**: Specialized regulatory AI that trains other agents
2. **Regulation Training**: Comprehensive scenario-based training for regulatory compliance
3. **Knowledge Base Training**: Upload and distribution of regulatory data
4. **Performance Monitoring**: Continuous tracking of agent effectiveness
5. **Base Agent System**: Save well-trained agents for reset/repair purposes
6. **AI-to-AI Training**: Training supervisor evaluates and improves other agents

### Training Scenarios
- Qualified States Logic Testing (AI Training Supervisor generates)
- Service Requirement Determination
- Client Interaction Workflows
- Payment Processing Procedures
- Regulatory Compliance Assessment
- FMCSA Update Integration
- Regulatory Hierarchy Validation

### Performance Metrics
- Success Rate: Percentage of successful interactions
- Response Accuracy: Correct regulatory determinations
- Client Satisfaction: Quality of client interactions
- Knowledge Utilization: Effective use of knowledge base
- Training Progress: Improvement over time

---

## 🔄 Knowledge Base Management

### Knowledge Types
1. **Qualified States Data**: State-specific GVWR and passenger thresholds
2. **Regulatory Documents**: USDOT, MC, IFTA requirements
3. **Service Requirements**: What services are needed for different scenarios
4. **Reference Materials**: Training documents and procedures
5. **FMCSA Updates**: Real-time regulatory changes and updates
6. **Regulatory Hierarchy**: Qualified States > State > Federal compliance logic

### Distribution Protocol
1. **Upload**: AI Training Supervisor receives new regulatory knowledge
2. **Analysis**: Training supervisor processes and validates data
3. **Distribution**: Training supervisor pushes to Jasper, Jasper distributes to agents
4. **Verification**: Confirm successful integration across all agents
5. **Monitoring**: Track usage and effectiveness

### Agent Knowledge Subscriptions
- **AI Training Supervisor**: All regulatory knowledge, FMCSA updates, training methodologies
- **Jasper (Manager AI)**: Receives regulatory knowledge from training supervisor (no independent searches)
- **Onboarding Agent**: Qualified States, Service Requirements, Regulatory Documents (from Jasper)
- **Customer Service Agent**: Client Protocols, Issue Resolution Procedures
- **USDOT RPA Agent**: Application Forms, Federal Procedures, Document Requirements

---

## 🤖 AI-to-AI Communication Protocol

### Regulatory Knowledge Flow
```
FMCSA Updates → AI Training Supervisor → Jasper → All Agents
```

### Key Principles
1. **Single Source of Truth**: AI Training Supervisor is the authoritative source for all regulatory knowledge
2. **No Independent Searches**: Jasper receives regulatory knowledge from training supervisor, not independent searches
3. **Hierarchical Authority**: Qualified States > State Regulations > Federal 49 CFR
4. **Real-time Updates**: FMCSA changes are automatically monitored and distributed
5. **Training Integration**: Regulatory updates are incorporated into training scenarios

### Communication Endpoints
- **Training Supervisor → Jasper**: Regulatory knowledge updates, training scenarios, performance evaluations
- **Jasper → Training Supervisor**: Training requests, performance queries, knowledge validation
- **Training Supervisor → Onboarding Agent**: Direct training scenarios and evaluation
- **Jasper → All Agents**: Knowledge distribution and coordination

### Data Flow Process
1. **Regulatory Update Detection**: AI Training Supervisor monitors FMCSA
2. **Knowledge Processing**: Training supervisor processes and validates new data
3. **Authority Validation**: Ensures qualified states maintain superseding authority
4. **Knowledge Distribution**: Pushes updates to Jasper
5. **Agent Updates**: Jasper distributes to relevant agents
6. **Training Integration**: Updates incorporated into training scenarios
7. **Performance Monitoring**: Training supervisor evaluates agent performance

### Benefits
- **Consistency**: All agents use the same authoritative regulatory data
- **Accuracy**: Single source eliminates conflicting information
- **Efficiency**: No duplicate regulatory searches across agents
- **Compliance**: Ensures qualified states always supersede federal regulations
- **Training**: Real-time updates improve agent training effectiveness

---

## 🚨 Monitoring and Alerts

### Performance Monitoring
- Agent response times
- Success/failure rates
- Knowledge base usage
- Client interaction quality
- System health status

### Alert Types
- **Performance**: Agent struggling with tasks
- **Error**: System or agent errors
- **Knowledge**: Missing or outdated information
- **Training**: Agents needing retraining

### Health Status Levels
- **Excellent**: All agents performing optimally
- **Good**: Minor issues, no immediate action needed
- **Warning**: Some agents struggling, monitoring required
- **Critical**: Major issues, immediate intervention needed

---

## 🔧 Configuration and Maintenance

### Agent Configuration
- Personality and communication style
- Capabilities and limitations
- Knowledge base subscriptions
- Training parameters
- Performance thresholds

### Maintenance Procedures
- Regular performance reviews
- Knowledge base updates
- Agent retraining when needed
- System health monitoring
- Backup and recovery procedures

### Reset and Repair
- Base agent restoration
- Knowledge base refresh
- Performance reset
- Training restart
- Configuration restoration

---

## 📈 Success Metrics

### System-Wide Metrics
- Total agent interactions
- Overall success rate
- Client satisfaction scores
- System uptime
- Knowledge base effectiveness

### Individual Agent Metrics
- Task completion rate
- Response accuracy
- Client satisfaction
- Knowledge utilization
- Training progress

### Business Impact Metrics
- Client onboarding efficiency
- Service determination accuracy
- Compliance success rate
- Revenue impact
- Operational efficiency

---

**Last Updated**: Current Session - AI Training Supervisor Architecture Added
**Maintained By**: AI Training Supervisor & Jasper (Manager AI)
**Review Schedule**: Monthly or when significant changes occur
**Distribution**: All active agents receive updates automatically through AI-to-AI communication protocol
