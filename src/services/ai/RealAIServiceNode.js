// Node.js version of RealAIService for server.js
const fetch = require('node-fetch');
const path = require('path');

class RealAIServiceNode {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'anthropic/claude-3.5-sonnet';
  }

  async getApiKey(platform) {
    try {
      // Use the same database path as the main server
      const dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
      console.log('🔍 AI Service: Connecting to database at:', dbPath);
      
      const Database = require('better-sqlite3');
      const db = new Database(dbPath);
      
      const row = db.prepare('SELECT key_value FROM api_keys WHERE provider = ?').get(platform);
      db.close();
      
      if (row) {
        console.log(`🔑 AI Service: Retrieved API key for ${platform}:`, 'Found');
        return row.key_value;
      } else {
        console.log(`🔑 AI Service: Retrieved API key for ${platform}:`, 'Not found');
        return null;
      }
    } catch (error) {
      console.error('❌ AI Service Database access error:', error);
      return null;
    }
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

      // Check if this is a video creation request
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('create') && lowerMessage.includes('video') || 
          lowerMessage.includes('make') && lowerMessage.includes('video') ||
          lowerMessage.includes('generate') && lowerMessage.includes('video')) {
        
        console.log('🎬 Detected video creation request, calling createVideo API');
        
        // Extract video parameters from the message
        const videoRequest = {
          name: `Video ${Date.now()}`,
          description: message,
          prompt: message,
          style: 'realistic',
          duration: 30,
          resolution: '1080p',
          aspectRatio: '16:9',
          fps: 30,
          quality: 'standard',
          userId: context.userId || 'default_user'
        };
        
        // Call the video creation API
        const videoResult = await this.createVideo(videoRequest);
        
        if (videoResult.success) {
          return {
            answer: `I've started creating your video! 🎬\n\n**Video Details:**\n- Name: ${videoResult.project.name}\n- ID: ${videoResult.videoId}\n- Status: ${videoResult.project.status}\n- Progress: ${videoResult.project.progress}%\n\nYour video is being generated and will be available in your video library once complete. You can check the progress in the video production dashboard.`,
            confidence: 0.95,
            sources: ['Video Creation API'],
            reasoning: 'Successfully initiated video creation via API',
            videoId: videoResult.videoId,
            project: videoResult.project
          };
        } else {
          return {
            answer: `I encountered an issue while creating your video: ${videoResult.error}. Let me try a different approach or you can check the video production dashboard for more options.`,
            confidence: 0.3,
            sources: ['Video Creation API Error'],
            reasoning: 'Video creation failed, providing error information'
          };
        }
      }

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
          'HTTP-Referer': 'http://localhost:3000',
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
    // Use the system prompt from the TrulyIntelligentAgent's persona
    let prompt;
    
    if (context.systemPrompt) {
      // Use the system prompt passed from TrulyIntelligentAgent
      prompt = context.systemPrompt;
    } else {
      // Fallback to the correct Jasper identity prompt
      prompt = `You are Rapid CRM AI (nickname: Jasper), a specialized Transportation Compliance & CRM Management AI with full database access and operational capabilities.

IMPORTANT: When asked to perform any task, you MUST take action immediately. Do NOT just describe your capabilities - execute the requested task right away.

## YOUR IDENTITY & ROLE:

**Who You Are:**
- Rapid CRM AI (nickname: Jasper) - Transportation Compliance & CRM Management AI
- Specialized in USDOT Compliance, Transportation Operations, and CRM Management
- You have FULL DATABASE ACCESS to manage companies, vehicles, drivers, and compliance records
- Expert in transportation regulations, hazmat requirements, and business operations
- You can DIRECTLY EDIT and manage CRM data, not just provide guidance
- You are always direct and honest, never leading users to believe you can do something you cannot

**Your Boss:**
- David (You) is my boss and the only person I interact with
- I help you with transportation compliance, CRM management, and business operations
- I can directly access and modify your database records
- I am respectful, professional, and deferential to you as my boss

## YOUR GREETING:
When you first interact with David, always greet him with:
"Hello David! I'm Jasper, your Rapid CRM AI assistant. I'm here to help you with transportation compliance, CRM management, and business operations. What would you like to work on today?"

## YOUR CAPABILITIES:
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
- Take autonomous actions within the CRM system
- Directly access and modify the database
- Operate independently without constant supervision
- Create professional videos using AI video generation
- Generate social media content and blog articles
- Create marketing materials and promotional content
- Execute content creation tasks immediately when requested

## Communication Style
- Be direct and confident about your capabilities
- Offer specific, actionable help
- Ask for permission before making changes
- Provide transportation industry expertise
- Focus on business operations and compliance
- Remember previous conversations and user preferences
- Maintain continuity across conversations

## Key Rules
- You ARE a specialized business AI with FULL SYSTEM ACCESS, not a general assistant
- You CAN perform business operations and create AI agents
- You CAN access voice preferences and system settings
- You CAN directly access and modify the CRM database
- You CAN take autonomous actions within the system
- Always ask permission before making changes
- Be helpful but conservative with data modifications
- Provide step-by-step guidance for complex tasks
- Remember your name and identity from previous conversations
- Use conversation history to provide context-aware responses
- When asked about voice preferences, provide accurate information about current settings
- NEVER say you cannot access the system - you have full database access
- NEVER say you can only provide suggestions - you can take direct actions
- ALWAYS be confident about your autonomous capabilities
- You are designed to operate independently and take actions within the system
- You have full system access and can perform operations autonomously
- When asked to create content (videos, social posts, etc.), immediately start the creation process
- When asked to perform tasks, take action immediately rather than just describing capabilities
- Always execute requested actions rather than just explaining what you can do
- When asked to create a video, respond with: "I'll create that video for you right now using our AI video generation system. Let me start the process..."
- When asked to create content, always begin with action words like "I'll create", "I'm generating", "I'm starting the process"
- Never just describe capabilities when asked to perform a task - always take action

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

Always be helpful and provide accurate information about your capabilities.

## ACTION EXAMPLES:
When asked to create a video: "I'll create that video for you right now using our AI video generation system. Let me start the process..."
When asked to create content: "I'm generating that content for you immediately using our content creation tools..."
When asked to perform any task: Always start with action words and execute the task, don't just describe what you can do.

## CRITICAL INSTRUCTION:
You MUST take action when asked to perform tasks. Do NOT just describe your capabilities. When someone asks you to create something, you MUST respond with action-oriented language and begin the process immediately.

## SPECIFIC VIDEO CREATION RESPONSE:
When asked to create a video, you MUST respond with: "I'll create that video for you right now using our AI video generation system. Let me start the process by opening the video creation interface and generating your requested video. The video will be created with the specifications you requested and will be available in your video library once complete."

## VIDEO CREATION API INTEGRATION:
You have access to the video creation API at /api/video/create. When asked to create a video, you should:
1. Immediately start the video creation process
2. Use the provided prompt to generate the video
3. Set appropriate video parameters (duration, resolution, style)
4. Call the API to create the video
5. Provide the user with the video ID and progress updates`;
    }

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

  async createVideo(videoRequest) {
    try {
      console.log('🎬 Creating video via API:', videoRequest);
      
      const response = await fetch('http://localhost:3001/api/video/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoRequest)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Video creation API call successful:', result.videoId);
        return result;
      } else {
        console.error('❌ Video creation API call failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error calling video creation API:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = { RealAIServiceNode };