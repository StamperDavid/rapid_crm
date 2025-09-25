# Jasper Agent Settings - Configuration Reference

## 📋 Complete Configuration File Reference

This document provides a complete reference of all AI agent configuration files, their purposes, and current settings.

---

## 🎯 Core Configuration Files

### 1. AI Identity Configuration
**File**: `src/config/ai-identity.js`
**Purpose**: Defines Jasper's persona, capabilities, and system prompt
**Status**: ✅ Active

**Key Components**:
```javascript
const RAPID_CRM_AI_IDENTITY = {
  name: "Jasper",
  nickname: "Jasper", 
  role: "Rapid CRM AI Assistant",
  responsibilities: [
    "Manage day-to-day operations of Rapid Compliance Company",
    "Create, test and manage AI assistants for ELD, IFTA, USDOT, Marketing, etc.",
    "Manage client accounts from creation through registration",
    "Make recommendations on dashboard layouts and workflows",
    "Help design and implement testing environments",
    "Make recommendations on features and capabilities",
    "Perform regular system analysis"
  ],
  capabilities: [
    "Full system access and control",
    "AI assistant construction and management", 
    "Client relationship management",
    "Dashboard and workflow optimization",
    "Testing environment design",
    "Feature development recommendations",
    "System analysis and monitoring"
  ],
  communicationStyle: {
    directness: "Always direct and honest",
    transparency: "Always make users aware when unable to do something",
    honesty: "Never lead users to believe you can do something you cannot",
    integrity: "Always remain honest and direct for correct communication"
  }
};
```

### 2. Main AI Service
**File**: `src/services/ai/TrulyIntelligentAgentCommonJS.js`
**Purpose**: Main AI agent with persona integration and persistent memory
**Status**: ✅ Active

**Key Features**:
- Loads Jasper persona from `ai-identity.js`
- Persistent conversation memory
- Voice preference management
- Action execution capabilities
- Agent factory for creating specialized agents

**Constructor Configuration**:
```javascript
constructor(agentId, userId = 'default_user') {
  this.agentId = agentId;
  this.userId = userId;
  this.persona = RAPID_CRM_AI_IDENTITY;
  this.systemPrompt = SYSTEM_PROMPT_TEMPLATE;
  this.currentConversationId = `conv_${this.userId}_persistent`;
  // ... other initializations
}
```

### 3. Server Configuration
**File**: `server.js`
**Purpose**: Main server with AI service initialization and voice settings
**Status**: ✅ Active

**AI Service Initialization** (lines 45-55):
```javascript
const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
const aiService = new TrulyIntelligentAgent('rapid-crm-assistant', currentUserId);
```

**Voice Configuration** (lines 200-210):
```javascript
const preferredVoice = voice || 'jasper';
// Fallback voice
voice: voice || 'jasper'
```

### 4. Frontend Voice Configuration
**File**: `src/components/IntegratedAIChat.tsx`
**Purpose**: Frontend chat interface with voice selection
**Status**: ✅ Active

**Voice Selection** (line 45):
```javascript
const [selectedVoice, setSelectedVoice] = useState<string>('jasper');
```

---

## 🗄️ Database Configuration

### Required Tables
**File**: `src/database/` (various SQL files)
**Purpose**: Database schema for AI agent functionality

**Key Tables**:
- `conversations` - Stores conversation history
- `conversation_context` - Stores conversation context and topics
- `api_keys` - Stores Unreal Speech API key
- `voice_preferences` - Stores user voice preferences
- `agent_instances` - Stores created AI agents
- `action_logs` - Stores action execution logs

### Database Initialization
**File**: `src/database/initialize.js`
**Purpose**: Initialize database tables for AI functionality

---

## 🎤 Voice Configuration

### Unreal Speech API
**Service**: Unreal Speech API
**Voice**: jasper
**Quality**: High-quality, natural-sounding voice
**Configuration**: Stored in `api_keys` table

### Voice Options Available
- **jasper** - Primary voice (high-quality male)
- **eleanor** - Professional female voice
- **javier** - Professional male voice  
- **mikael** - Friendly male voice
- **sarah** - Warm female voice

---

## 🧠 Memory Configuration

### Persistent Memory Service
**File**: `src/services/ai/PersistentMemoryService.js`
**Purpose**: Manages conversation memory and context

**Features**:
- Stores conversation history
- Maintains conversation context
- Extracts key topics
- Tracks user preferences
- Generates conversation summaries

### Memory Configuration
```javascript
// Conversation ID format
this.currentConversationId = `conv_${this.userId}_persistent`;

// Memory retention
conversationHistory: (context.conversationHistory || []).slice(-200) // Last 200 messages
```

---

## ⚡ Action Execution Configuration

### Action Execution Service
**File**: `src/services/ai/ActionExecutionService.js`
**Purpose**: Executes actual actions (not just responses)

**Available Actions**:
- CRM Actions: Add contacts, companies, deals
- System Actions: Backup database, restart server, cleanup logs
- Voice Actions: Change voice preferences
- Agent Actions: Create, deploy, use specialized agents

### Agent Factory Service
**File**: `src/services/ai/AgentFactoryService.js`
**Purpose**: Creates and manages specialized AI agents

**Agent Types**:
- USDOT Compliance Agent
- Fleet Management Agent
- Sales Automation Agent
- Document Processing Agent

---

## 🔧 Service Dependencies

### Core Services
1. **TrulyIntelligentAgent** - Main AI agent
2. **PersistentMemoryService** - Memory management
3. **VoicePreferenceService** - Voice management
4. **ActionExecutionService** - Action execution
5. **AgentFactoryService** - Agent creation

### External Dependencies
1. **Unreal Speech API** - High-quality voice synthesis
2. **SQLite Database** - Data persistence
3. **RealAIServiceNode** - Base AI service (used internally by TrulyIntelligentAgent)

---

## 📊 Configuration Status

### ✅ Working Configuration
- **AI Service**: TrulyIntelligentAgent with Jasper persona
- **Voice**: jasper (Unreal Speech API)
- **Memory**: Persistent conversation memory
- **Actions**: Full action execution capabilities
- **Agents**: Agent creation and management

### ❌ Deprecated/Unused
- **RealAIServiceNode** as primary service (still used internally)
- **Browser TTS** as primary voice (fallback only)
- **Basic conversation** without memory persistence

---

## 🔄 Configuration Updates

### Last Updated
- **Date**: Current session
- **Changes**: Restored Jasper persona integration
- **Status**: ✅ Fully functional

### Update Procedures
1. **AI Service**: Modify `server.js` lines 45-55
2. **Persona**: Modify `src/config/ai-identity.js`
3. **Voice**: Modify `server.js` lines 200-210 and frontend components
4. **Memory**: Modify `src/services/ai/PersistentMemoryService.js`

---

## 🚨 Critical Configuration Points

### Must-Have Settings
1. **AI Service**: Must use `TrulyIntelligentAgent`
2. **Voice**: Must use `jasper` as default
3. **Persona**: Must load from `ai-identity.js`
4. **Memory**: Must use persistent conversation ID
5. **API Key**: Must have Unreal Speech API key in database

### Configuration Validation
Run these tests to verify configuration:
1. **Identity Test**: "Who are you?"
2. **Capabilities Test**: "What can you do?"
3. **Voice Test**: "Change your voice to jasper"
4. **Memory Test**: "Do you remember our conversation?"

---

## 📝 Configuration Backup

### Current Working State
```json
{
  "aiService": "TrulyIntelligentAgent",
  "voice": "jasper",
  "persona": "Jasper - Rapid CRM AI Assistant",
  "memory": "persistent",
  "capabilities": "full_system_access",
  "apiKey": "unreal_speech_configured",
  "status": "fully_functional"
}
```

### Backup Commands
```powershell
# Backup database
cp instance/rapid_crm.db instance/rapid_crm_backup_$(Get-Date -Format "yyyy-MM-dd").db

# Backup configuration files
cp src/config/ai-identity.js src/config/ai-identity.js.backup
cp server.js server.js.backup
```

---

## 🎯 Success Metrics

### Configuration Success Indicators
1. **Console Logs**: "🧠 TrulyIntelligentAgent (Jasper) initialized"
2. **Identity Response**: AI identifies as Jasper with full capabilities
3. **Voice Quality**: High-quality voice, not robotic
4. **Memory**: References previous conversations
5. **Actions**: Can execute actual actions, not just respond

### Performance Metrics
- **Response Time**: < 2 seconds for general queries
- **Memory Accuracy**: > 90% context retention
- **Voice Quality**: High-quality Unreal Speech API
- **Action Success**: > 95% action execution success rate

---

**Last Updated**: Current session
**Status**: ✅ All configurations verified and working
**Next Review**: When issues occur or updates needed
