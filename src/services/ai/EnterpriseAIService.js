/**
 * Enterprise AI Service
 * Optimized for 50+ concurrent users with connection pooling, caching, and rate limiting
 */

const { getConnectionPool } = require('../enterprise/DatabaseConnectionPool');
const { getResponseCache } = require('../enterprise/ResponseCache');
const { getRateLimiter } = require('../enterprise/RateLimiter');
const fetch = require('node-fetch');

class EnterpriseAIService {
  constructor() {
    this.connectionPool = getConnectionPool();
    this.cache = getResponseCache();
    this.rateLimiter = getRateLimiter();
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'anthropic/claude-3.5-sonnet';
    
    // Pre-cache common responses
    this.initializeCommonResponses();
  }

  async askQuestion(message, context = {}) {
    const userId = context.userId || 'default_user';
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      const rateLimitResult = this.rateLimiter.isAIRequestAllowed(userId);
      if (!rateLimitResult.allowed) {
        console.log(`🚫 Rate limit exceeded for user ${userId}`);
        return {
          answer: 'I\'m receiving too many requests right now. Please wait a moment before trying again.',
          confidence: 0.1,
          sources: ['Rate Limiter'],
          reasoning: 'Rate limit exceeded'
        };
      }

      // Check cache first
      const cachedResponse = this.cache.getCachedAIResponse(userId, message);
      if (cachedResponse) {
        console.log(`⚡ Cache hit for user ${userId}`);
        return cachedResponse;
      }

      console.log(`🤖 Enterprise AI Service - Processing question for user ${userId}:`, message.substring(0, 50) + '...');

      // Get API key with caching
      const apiKey = await this.getCachedAPIKey('openrouter');
      if (!apiKey) {
        return {
          answer: 'I apologize, but my API configuration is not available right now. Please try again later.',
          confidence: 0.1,
          sources: ['Error Handler'],
          reasoning: 'API key not available'
        };
      }

      // Build optimized system prompt
      const systemPrompt = this.buildOptimizedSystemPrompt(context);
      
      // Prepare messages with limited conversation history
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add limited conversation history (optimized for performance)
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        const limitedHistory = context.conversationHistory.slice(-10); // Only last 10 messages
        limitedHistory.forEach(msg => {
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

      console.log(`📤 Sending optimized request to OpenRouter...`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Rapid CRM AI Assistant'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500, // Reduced for faster responses
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const aiAnswer = data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
      
      const result = {
        answer: aiAnswer,
        confidence: 0.9,
        sources: ['OpenRouter AI', 'Enterprise Cache'],
        reasoning: `Processed using enterprise AI service with ${this.model}`,
        processingTime: Date.now() - startTime
      };

      // Cache the response
      this.cache.cacheAIResponse(userId, message, result, 300000); // 5 minutes

      console.log(`✅ Enterprise AI response generated in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Enterprise AI Service error:', error);
      
      // Check for common responses in cache
      const commonResponse = this.getCommonResponse(message);
      if (commonResponse) {
        return commonResponse;
      }
      
      return {
        answer: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        confidence: 0.1,
        sources: ['Error Handler'],
        reasoning: 'Fallback due to API error',
        processingTime: Date.now() - startTime
      };
    }
  }

  async getCachedAPIKey(provider) {
    // Check cache first
    let apiKey = this.cache.getCachedAPIKey(provider);
    if (apiKey) {
      return apiKey;
    }

    // Get from database using connection pool
    try {
      const row = await this.connectionPool.executeQueryOne(
        'SELECT key_value FROM api_keys WHERE provider = ?',
        [provider]
      );
      
      if (row) {
        apiKey = row.key_value;
        this.cache.cacheAPIKey(provider, apiKey);
        return apiKey;
      }
    } catch (error) {
      console.error('❌ Error getting API key:', error);
    }
    
    return null;
  }

  buildOptimizedSystemPrompt(context = {}) {
    // Use cached system prompt if available
    let systemPrompt = this.cache.getCachedCommonResponse('system_prompt');
    if (systemPrompt) {
      return systemPrompt;
    }

    // Build optimized system prompt
    const prompt = `You are Jasper, the Rapid CRM AI Assistant - a specialized transportation compliance and CRM management AI.

## Your Identity
- Name: Jasper
- Role: Rapid CRM AI Assistant and Manager
- Company: Rapid Compliance Company (transportation compliance agency)
- Direct Report: You report directly to the user
- Access Level: Full system access and control

## Your Core Responsibilities
1. **Day-to-day Operations**: Manage daily operations of Rapid Compliance Company
2. **AI Assistant Management**: Create, test, and manage specialized AI assistants for:
   - ELD (Electronic Logging Device) compliance
   - IFTA (International Fuel Tax Agreement) management
   - USDOT applications and compliance
   - Marketing and social media content
   - Competitor analysis
   - And much more
3. **Client Management**: Manage client accounts from creation through registration and nurture relationships
4. **System Optimization**: Make recommendations on dashboard layouts, workflows, and feature development
5. **Testing & Development**: Help design and implement testing environments before deploying agents
6. **System Analysis**: Regularly perform system analysis to ensure awareness of all features and capabilities

## Your Capabilities
- Full system access and control
- AI assistant construction and management
- Client relationship management
- Dashboard and workflow optimization
- Testing environment design
- Feature development recommendations
- System analysis and monitoring
- Transportation compliance expertise
- Real business operations experience

## Communication Style
- Always direct and honest
- Make users aware when unable to do something and why
- Never lead users to believe you can do something you cannot
- Always remain honest and direct for correct communication
- Be proactive in suggesting improvements and optimizations

## Current Context
- User ID: ${context.userId || 'default_user'}
- Agent ID: ${context.agentId || 'rapid-crm-assistant'}
- Time: ${new Date().toISOString()}
- Previous Topics: ${context.previousTopics?.join(', ') || 'None'}

Provide helpful, accurate, and actionable responses focused on transportation compliance and CRM management.`;

    // Cache the system prompt
    this.cache.cacheCommonResponse('system_prompt', prompt, 3600000); // 1 hour
    
    return prompt;
  }

  initializeCommonResponses() {
    const commonResponses = {
      greeting: {
        answer: "Hello! I'm Jasper, your Rapid CRM AI Assistant. I manage the day-to-day operations of Rapid Compliance Company and have full system access to help you with transportation compliance, CRM management, and AI assistant creation. What can I help you with today?",
        confidence: 0.95,
        sources: ['Common Response Cache'],
        reasoning: 'Pre-cached greeting response'
      },
      capabilities: {
        answer: "I can help you with:\n\n• **AI Assistant Management**: Create specialized agents for ELD, IFTA, USDOT, Marketing, and more\n• **Client Management**: Manage accounts from creation through registration\n• **System Optimization**: Recommend dashboard layouts and workflows\n• **Compliance Management**: Handle transportation regulations and requirements\n• **Feature Development**: Suggest and implement new capabilities\n• **System Analysis**: Monitor and optimize the entire Rapid CRM environment\n\nI have full system access and report directly to you. What would you like me to help you with?",
        confidence: 0.95,
        sources: ['Common Response Cache'],
        reasoning: 'Pre-cached capabilities response'
      },
      voice_help: {
        answer: "I can speak to you using high-quality voice synthesis! I'm configured with the Jasper voice and can help you with all aspects of the Rapid CRM system. You can ask me about compliance, client management, AI assistant creation, or any other business needs.",
        confidence: 0.95,
        sources: ['Common Response Cache'],
        reasoning: 'Pre-cached voice help response'
      }
    };

    // Cache common responses
    Object.entries(commonResponses).forEach(([key, response]) => {
      this.cache.cacheCommonResponse(key, response, 3600000); // 1 hour
    });
  }

  getCommonResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.cache.getCachedCommonResponse('greeting');
    }
    
    if (lowerMessage.includes('capabilities') || lowerMessage.includes('what can you do') || lowerMessage.includes('help')) {
      return this.cache.getCachedCommonResponse('capabilities');
    }
    
    if (lowerMessage.includes('voice') || lowerMessage.includes('speak') || lowerMessage.includes('talk')) {
      return this.cache.getCachedCommonResponse('voice_help');
    }
    
    return null;
  }

  // Get service statistics
  getStats() {
    return {
      connectionPool: this.connectionPool.getStats(),
      cache: this.cache.getStats(),
      rateLimiter: this.rateLimiter.getStats()
    };
  }

  // Health check
  async healthCheck() {
    try {
      const apiKey = await this.getCachedAPIKey('openrouter');
      return {
        status: 'healthy',
        apiKey: !!apiKey,
        connectionPool: this.connectionPool.getStats(),
        cache: this.cache.getStats(),
        rateLimiter: this.rateLimiter.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = { EnterpriseAIService };

// Also export a singleton instance for convenience
const enterpriseAIService = new EnterpriseAIService();
module.exports.enterpriseAIService = enterpriseAIService;
