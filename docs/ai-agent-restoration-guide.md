# Jasper Agent Settings - AI Agent Restoration Guide

## 🚨 CRITICAL: Complete Restoration Procedures

This document contains everything needed to restore Jasper (the Rapid CRM AI Assistant) to its working state when issues occur.

---

## 📋 Quick Restoration Checklist

### 1. **AI Service Configuration**
- **File**: `server.js` (lines 45-55)
- **Service**: `TrulyIntelligentAgent` (NOT `RealAIServiceNode`)
- **Import**: `./src/services/ai/TrulyIntelligentAgentCommonJS.js`
- **Constructor**: `new TrulyIntelligentAgent('rapid-crm-assistant', currentUserId)`

### 2. **Voice Configuration**
- **Default Voice**: `jasper` (NOT `eleanor` or `mikael`)
- **API**: Unreal Speech API (NOT browser TTS)
- **Files**: `server.js` (lines 200-210), `src/components/IntegratedAIChat.tsx` (line 45)

### 3. **Persona Configuration**
- **File**: `src/config/ai-identity.js`
- **Identity**: Jasper, Rapid CRM AI Assistant
- **Role**: Manager of Rapid CRM environment
- **Capabilities**: Full system access, AI assistant creation, client management

### 4. **Memory & Persistence**
- **Service**: `PersistentMemoryService`
- **Conversation ID**: `conv_${userId}_persistent`
- **File**: `src/services/ai/PersistentMemoryService.js`

---

## 🔧 Detailed Restoration Steps

### Step 1: Verify AI Service in server.js

**Location**: `server.js` lines 45-55

**Correct Configuration**:
```javascript
// Use the TrulyIntelligentAgent for AI responses with persistent memory
try {
  console.log('🧠 Loading TrulyIntelligentAgent...');
  const { TrulyIntelligentAgent } = require('./src/services/ai/TrulyIntelligentAgentCommonJS.js');
  console.log('🧠 TrulyIntelligentAgent loaded successfully');
  const aiService = new TrulyIntelligentAgent('rapid-crm-assistant', currentUserId);
  console.log(`🧠 TrulyIntelligentAgent instance created for user: ${currentUserId}`);
} catch (agentError) {
  console.error('❌ TrulyIntelligentAgent error:', agentError);
}
```

**❌ WRONG Configuration** (DO NOT USE):
```javascript
// This is the basic service without memory or persona
const { RealAIServiceNode } = require('./src/services/ai/RealAIServiceNode.js');
const aiService = new RealAIServiceNode();
```

### Step 2: Verify Voice Settings

**Location**: `server.js` lines 200-210

**Correct Configuration**:
```javascript
// Default voice should be 'jasper'
const preferredVoice = voice || 'jasper';

// Fallback voice should also be 'jasper'
voice: voice || 'jasper', // was 'mikael'
```

**Location**: `src/components/IntegratedAIChat.tsx` line 45

**Correct Configuration**:
```javascript
const [selectedVoice, setSelectedVoice] = useState<string>('jasper');
```

### Step 3: Verify Persona Configuration

**Location**: `src/config/ai-identity.js`

**Key Elements**:
- **Name**: "Jasper"
- **Role**: "Rapid CRM AI Assistant"
- **Responsibilities**: Full system access, AI assistant management, client account management
- **Capabilities**: ELD, IFTA, USDOT, Marketing, Social Media, Competitor analysis
- **Communication Style**: Direct, honest, transparent

### Step 4: Verify TrulyIntelligentAgent Persona Integration

**Location**: `src/services/ai/TrulyIntelligentAgentCommonJS.js`

**Required Imports** (line 11):
```javascript
const { RAPID_CRM_AI_IDENTITY, SYSTEM_PROMPT_TEMPLATE } = require('../../config/ai-identity');
```

**Constructor Configuration** (lines 26-28):
```javascript
// Initialize with Jasper persona and Rapid CRM identity
this.persona = RAPID_CRM_AI_IDENTITY;
this.systemPrompt = SYSTEM_PROMPT_TEMPLATE;
```

**AI Context Configuration** (lines 680-688):
```javascript
// Add Jasper persona information
persona: this.persona,
systemPrompt: this.systemPrompt,
identity: {
  name: 'Jasper',
  role: 'Rapid CRM AI Assistant',
  capabilities: this.persona.capabilities,
  responsibilities: this.persona.responsibilities
}
```

---

## 🎯 Testing Procedures

### Test 1: AI Identity
**Command**: "Who are you and what do you do?"
**Expected Response**: Should identify as Jasper, Rapid CRM AI Assistant with full system access

### Test 2: Capabilities
**Command**: "What can you help me with?"
**Expected Response**: Should list ELD, IFTA, USDOT, Marketing, AI assistant creation, client management

### Test 3: Voice Quality
**Command**: "Change your voice to jasper"
**Expected Response**: Should use high-quality Unreal Speech API, not robotic browser TTS

### Test 4: Memory
**Command**: "Do you remember our previous conversation?"
**Expected Response**: Should reference previous conversations and maintain context

---

## 🚨 Common Issues & Solutions

### Issue 1: "AI doesn't know its identity"
**Cause**: Using `RealAIServiceNode` instead of `TrulyIntelligentAgent`
**Solution**: Check `server.js` lines 45-55, ensure using `TrulyIntelligentAgent`

### Issue 2: "Voice sounds robotic"
**Cause**: Missing Unreal Speech API key or using browser TTS
**Solution**: 
1. Check API key in database: `SELECT * FROM api_keys WHERE service = 'unreal_speech';`
2. Verify voice is set to 'jasper' in both frontend and backend

### Issue 3: "AI lost its abilities"
**Cause**: `TrulyIntelligentAgent` not loading persona configuration
**Solution**: Check `TrulyIntelligentAgentCommonJS.js` has proper imports and persona initialization

### Issue 4: "No persistent memory"
**Cause**: `PersistentMemoryService` not working
**Solution**: Check database tables exist and `PersistentMemoryService.js` is properly initialized

---

## 📁 Critical Files & Their Purposes

### Core AI Files
- `src/services/ai/TrulyIntelligentAgentCommonJS.js` - Main AI agent with persona and memory
- `src/services/ai/RealAIServiceNode.js` - Basic AI service (DO NOT USE as primary)
- `src/services/ai/PersistentMemoryService.js` - Conversation memory persistence
- `src/config/ai-identity.js` - Jasper persona and system prompt configuration

### Server Configuration
- `server.js` - Main server file with AI service initialization and voice settings
- `src/components/IntegratedAIChat.tsx` - Frontend chat interface with voice selection
- `src/components/AdvancedUIAssistantFixed.tsx` - Advanced AI assistant component

### Database Files
- `src/database/` - Database initialization and schema files
- `instance/rapid_crm.db` - SQLite database with conversation history and settings

---

## 🔄 Restoration Commands

### Quick Server Restart
```powershell
cd "C:\Users\David\PycharmProjects\Rapid_CRM"
npm run dev:full
```

### Test AI Agent
```powershell
# Test endpoint to verify TrulyIntelligentAgent is working
curl http://localhost:3001/api/test-agent
```

### Check Database Status
```powershell
node check_database_status.js
```

---

## 📝 Configuration Backup

### Current Working Configuration (as of restoration):
- **AI Service**: TrulyIntelligentAgent
- **Voice**: jasper (Unreal Speech API)
- **Persona**: Jasper, Rapid CRM AI Assistant
- **Memory**: Persistent conversation memory
- **Capabilities**: Full system access, AI assistant creation, client management
- **Communication**: Direct, honest, transparent

### Database Tables Required:
- `conversations` - Conversation history
- `conversation_context` - Conversation context and topics
- `api_keys` - Unreal Speech API key
- `voice_preferences` - User voice preferences

---

## 🎯 Success Indicators

When Jasper is properly restored, you should see:
1. **Console Logs**: "🧠 TrulyIntelligentAgent (Jasper) initialized with Rapid CRM persona"
2. **Identity Test**: AI identifies as Jasper with full capabilities
3. **Voice Quality**: High-quality voice using Unreal Speech API
4. **Memory**: References to previous conversations
5. **Capabilities**: Lists all Rapid CRM management capabilities

---

## 📞 Emergency Contacts

If restoration fails:
1. Check this document first
2. Verify all file paths and configurations
3. Test individual components (database, API keys, voice service)
4. Check console logs for specific error messages

**Last Updated**: Current session
**Status**: ✅ Working - Jasper fully restored with persona and capabilities
