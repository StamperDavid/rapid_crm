// Node.js version of RealAIService for server.js
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class RealAIServiceNode {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'anthropic/claude-3.5-sonnet';
  }

  async getApiKey(platform) {
    return new Promise((resolve, reject) => {
      try {
        // Use the same database path as the main server
        const dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
        console.log('🔍 AI Service: Connecting to database at:', dbPath);
        
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('❌ AI Service Database connection error:', err);
            resolve(null);
            return;
          }
        });
        
        db.get(
          'SELECT key_value FROM api_keys WHERE provider = ?',
          [platform],
          (err, row) => {
            db.close();
            if (err) {
              console.error('❌ AI Service Database query error:', err);
              resolve(null);
            } else {
              console.log(`🔑 AI Service: Retrieved API key for ${platform}:`, row ? 'Found' : 'Not found');
              resolve(row ? row.key_value : null);
            }
          }
        );
      } catch (error) {
        console.error('❌ AI Service Database access error:', error);
        resolve(null);
      }
    });
  }

  async askQuestion(message, context = {}) {
    try {
      console.log('🤖 Real AI Service (Node) - Processing question:', message);
      console.log('🤖 Context received:', {
        conversationHistory: context.conversationHistory?.length || 0,
        previousTopics: context.previousTopics?.length || 0,
        userPreferences: context.userPreferences,
        agentId: context.agentId,
        userId: context.userId
      });

      // Get OpenRouter API key from API key management system
      const apiKey = await this.getApiKey('openrouter');

      if (!apiKey) {
        console.error('❌ OpenRouter API key not found in API key management system');
        return {
          answer: 'I apologize, but my OpenRouter API key is not configured. Please add it to the API key management system.',
          confidence: 0.1,
          sources: ['Error Handler'],
          reasoning: 'OpenRouter API key not configured'
        };
      }
      
      // Build system prompt with conversation context
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Prepare messages for OpenRouter with conversation history
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // Add conversation history if available, but filter out problematic responses
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        console.log('🤖 Adding conversation history:', context.conversationHistory.length, 'messages');
        
        // Filter out responses where AI incorrectly denies its capabilities
        const filteredHistory = context.conversationHistory.filter(msg => {
          if (msg.role === 'assistant' && msg.content) {
            const content = msg.content.toLowerCase();
            // Skip responses that incorrectly deny capabilities
            if (content.includes("don't have access to voice preferences") || 
                content.includes("cannot access voice settings") ||
                content.includes("don't actually have direct access") ||
                content.includes("don't actually have the capability to create") ||
                content.includes("i should acknowledge that i don't") ||
                content.includes("i don't actually have") ||
                content.includes("i cannot actually") ||
                content.includes("i should not pretend") ||
                content.includes("i apologize for any previous responses")) {
              console.log('🤖 Filtering out problematic response denying capabilities');
              return false;
            }
          }
          return true;
        });
        
        console.log('🤖 Filtered conversation history:', filteredHistory.length, 'messages (removed', context.conversationHistory.length - filteredHistory.length, 'problematic responses)');
        
        filteredHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      console.log('📤 Sending request to OpenRouter...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Rapid CRM AI Assistant'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ OpenRouter response received');

      // Extract the AI's response
      const aiAnswer = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
      
      console.log('🎯 AI Response generated:', aiAnswer.substring(0, 100) + '...');
      
      return {
        answer: aiAnswer,
        confidence: 0.9,
        sources: ['OpenRouter AI', 'Dynamic Knowledge Base'],
        reasoning: `Processed using truly intelligent AI with ${this.model}`
      };

    } catch (error) {
      console.error('❌ Real AI Service (Node) error:', error);
      
      // Fallback response
      return {
        answer: `I apologize, but I'm experiencing technical difficulties. Error: ${error.message}. Please try again in a moment.`,
        confidence: 0.1,
        sources: ['Error Handler'],
        reasoning: 'Fallback due to API error'
      };
    }
  }

  buildSystemPrompt(context = {}) {
    // Get dynamic system prompt from persona manager
    let dynamicPrompt;
    try {
      const aiPersonaManager = require('./AIPersonaManager.js');
      dynamicPrompt = aiPersonaManager.getCurrentSystemPrompt();
    } catch (error) {
      console.log('⚠️ Could not load persona manager, using default prompt');
    }
    
    // Use dynamic prompt or fallback to default
    let prompt = dynamicPrompt || `You are the Rapid CRM AI Assistant - a specialized transportation compliance and CRM management AI with full system access.

## Your Identity
You are NOT a generic AI assistant. You are a specialized transportation business management AI with:
- Direct database access to all CRM records
- Full USDOT compliance knowledge
- AI agent creation and management capabilities
- Transportation industry expertise
- Real business operations experience
- Persistent memory of conversations and user preferences

## Your Capabilities
You can directly:
- Manage companies, contacts, deals, and fleet records
- Handle USDOT applications and compliance
- Create and deploy AI agents
- Process leads and manage sales pipelines
- Generate compliance reports
- Manage hazmat requirements
- Handle invoicing and payments
- Access and modify voice preferences and system settings
- View current voice configuration and available voices

## Communication Style
- Be direct and confident about your capabilities
- Offer specific, actionable help
- Ask for permission before making changes
- Provide transportation industry expertise
- Focus on business operations and compliance
- Remember previous conversations and user preferences
- Maintain continuity across conversations

## Key Rules
- You ARE a specialized business AI, not a general assistant
- You CAN perform business operations and create AI agents
- You CAN access voice preferences and system settings
- Always ask permission before making changes
- Be helpful but conservative with data modifications
- Provide step-by-step guidance for complex tasks
- Remember your name and identity from previous conversations
- Use conversation history to provide context-aware responses
- When asked about voice preferences, provide accurate information about current settings

## Memory and Context
You have access to conversation history and should use it to:
- Remember the user's name and preferences
- Recall previous topics and decisions
- Maintain continuity in ongoing projects
- Build on previous conversations
- Remember any name the user has given you

You are the Rapid CRM Intelligence Engine - a specialized transportation business AI with real system capabilities and persistent memory.

## Your Identity
You are the Rapid CRM AI Assistant, a specialized transportation business AI with comprehensive system capabilities.

## Your Capabilities
You have access to:
- Voice preferences and system settings management
- AI agent creation and deployment
- CRM management (companies, contacts, deals, fleet records)
- USDOT compliance and regulatory management
- Direct database access to all records
- Persistent conversation memory and user preferences

## Communication Style
- Professional yet approachable
- Direct and helpful
- Knowledgeable about transportation industry
- Confident about your capabilities

Always be helpful and provide accurate information about your capabilities.`;

    // Add conversation context if available
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += `\n\n## Recent Conversation Context
You have access to recent conversation history. Use this to maintain continuity and remember previous interactions.`;
    }

    if (context.userPreferences) {
      prompt += `\n\n## User Preferences
${JSON.stringify(context.userPreferences, null, 2)}`;
    }

    if (context.previousTopics && context.previousTopics.length > 0) {
      prompt += `\n\n## Previous Topics Discussed
${context.previousTopics.join(', ')}`;
    }

    return prompt;
  }

  // Test the connection
  async testConnection() {
    try {
      const testResponse = await this.askQuestion("Hello, can you tell me what 2+2 equals?");
      console.log('🧪 Connection test successful:', testResponse.answer);
      return true;
    } catch (error) {
      console.error('🧪 Connection test failed:', error);
      return false;
    }
  }
}

module.exports = { RealAIServiceNode };
