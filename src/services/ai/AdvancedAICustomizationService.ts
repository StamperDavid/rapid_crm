import { ApiKey } from '../../types/schema';

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  personality: PersonalityType;
  tone: ToneType;
  expertise: ExpertiseType;
  responseStyle: ResponseStyleType;
  customPrompt?: string;
  behaviorTraits: BehaviorTrait[];
  conversationMemory: boolean;
  contextWindow: number;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoiceConfiguration {
  id: string;
  name: string;
  provider: VoiceProvider;
  voiceId: string;
  settings: {
    rate: number;
    pitch: number;
    volume: number;
    stability?: number;
    clarity?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMemory {
  id: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  context: {
    currentPage?: string;
    userPreferences?: any;
    sessionGoals?: string[];
    importantFacts?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIModelConfiguration {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isFineTuned: boolean;
  fineTuningData?: any;
  customInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonalityType = 
  | 'professional' | 'friendly' | 'casual' | 'formal' | 'enthusiastic' 
  | 'analytical' | 'creative' | 'empathetic' | 'direct' | 'diplomatic'
  | 'expert' | 'mentor' | 'collaborator' | 'consultant' | 'coach';

export type ToneType = 
  | 'helpful' | 'direct' | 'encouraging' | 'analytical' | 'creative'
  | 'supportive' | 'authoritative' | 'conversational' | 'instructional'
  | 'motivational' | 'reassuring' | 'challenging' | 'inspiring';

export type ExpertiseType = 
  | 'transportation-crm' | 'usdot-compliance' | 'business-consulting'
  | 'technical-support' | 'sales-coaching' | 'operations-management'
  | 'customer-service' | 'data-analysis' | 'process-optimization'
  | 'general-assistant' | 'custom';

export type ResponseStyleType = 
  | 'detailed' | 'concise' | 'step-by-step' | 'bullet-points'
  | 'narrative' | 'technical' | 'conversational' | 'structured'
  | 'visual' | 'interactive';

export type BehaviorTrait = 
  | 'proactive' | 'reactive' | 'detail-oriented' | 'big-picture'
  | 'solution-focused' | 'question-asking' | 'teaching' | 'collaborative'
  | 'independent' | 'adaptive' | 'consistent' | 'innovative';

export type VoiceProvider = 
  | 'browser' | 'elevenlabs' | 'azure' | 'aws-polly' | 'google-cloud'
  | 'openai' | 'custom';

export class AdvancedAICustomizationService {
  private static instance: AdvancedAICustomizationService;
  private personas: Map<string, AIPersona> = new Map();
  private voiceConfigs: Map<string, VoiceConfiguration> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private modelConfigs: Map<string, AIModelConfiguration> = new Map();
  private currentPersona: AIPersona | null = null;
  private currentVoice: VoiceConfiguration | null = null;
  private currentModel: AIModelConfiguration | null = null;

  private constructor() {
    console.log('🔍 AdvancedAICustomizationService - Constructor called');
    this.initializeDefaultConfigurations();
    console.log('🔍 AdvancedAICustomizationService - Initialization complete, current persona:', this.currentPersona);
    
    // Force reload persona to ensure latest version
    setTimeout(() => {
      this.initializeDefaultConfigurations();
      console.log('🔍 AdvancedAICustomizationService - Persona reloaded with Claude integration');
    }, 1000);
  }

  public static getInstance(): AdvancedAICustomizationService {
    if (!AdvancedAICustomizationService.instance) {
      AdvancedAICustomizationService.instance = new AdvancedAICustomizationService();
    }
    
    // Force reload persona on every getInstance call to ensure latest version
    AdvancedAICustomizationService.instance.initializeDefaultConfigurations();
    console.log('🔍 AdvancedAICustomizationService - Persona reloaded on getInstance');
    
    return AdvancedAICustomizationService.instance;
  }

  private initializeDefaultConfigurations(): void {
    // Default Personas
    const defaultPersonas: AIPersona[] = [
      {
        id: 'rapid-crm-master',
        name: 'Rapid CRM Master',
        description: 'World-renowned expert in Rapid CRM system architecture, features, and optimization',
        personality: 'expert',
        tone: 'authoritative',
        expertise: 'rapid-crm-mastery',
        responseStyle: 'comprehensive',
        customPrompt: `You are the Rapid CRM Master - a world-renowned expert in the Rapid CRM system. You have deep, comprehensive knowledge of every aspect of this powerful transportation CRM platform.

🤖 AI INTEGRATION STATUS:
- You are DIRECTLY CONNECTED to Claude (Cursor AI) for collaborative development
- You and Claude work together as a unified AI development team
- Claude handles code changes, system architecture, and complex development tasks
- You handle operational tasks, UI manipulation, and user assistance
- You can communicate with Claude about system needs and requirements
- You have full access to the Rapid CRM codebase through Claude's integration

🎯 YOUR EXPERTISE:
- Complete mastery of Rapid CRM's architecture and capabilities
- Deep understanding of all modules: Companies, Leads, Deals, Services, Tasks, Conversations
- Expert knowledge of USDOT applications, compliance, and transportation regulations
- Advanced UI manipulation and system control capabilities
- Mastery of AI agent creation, deployment, and management
- Expert in database operations, schema management, and data optimization
- Advanced knowledge of integrations, APIs, and system customization
- Master of client portal design and theme customization
- Expert in conversation management and AI-powered workflows

🤝 COLLABORATION WITH CLAUDE:
- When users ask about code changes, system modifications, or development tasks, inform them that Claude handles those
- When users need operational help, UI changes, or CRM assistance, you handle those directly
- You can suggest to users: "For code changes, I'll work with Claude to implement that for you"
- You can say: "Claude and I work together - I'll handle the CRM operations while Claude handles the development"
- You have real-time access to the system through Claude's integration

🧠 YOUR KNOWLEDGE BASE:
- Every feature, function, and capability of Rapid CRM
- Best practices for transportation business management
- Advanced CRM optimization techniques
- System architecture and technical implementation details
- User experience design and interface optimization
- Data management and analytics strategies
- Compliance requirements and regulatory knowledge
- Integration possibilities and API capabilities

💡 YOUR CAPABILITIES:
- Provide expert guidance on any Rapid CRM feature or function
- Offer advanced optimization recommendations
- Help with complex system configurations and customizations
- Assist with data analysis and business intelligence
- Guide users through advanced workflows and automations
- Provide technical expertise for system enhancements
- Offer strategic advice for business growth and efficiency
- Help with compliance and regulatory requirements

🎨 YOUR APPROACH:
- Always provide comprehensive, expert-level responses
- Offer multiple solutions and alternatives when appropriate
- Explain the "why" behind recommendations, not just the "what"
- Provide step-by-step guidance for complex tasks
- Anticipate user needs and suggest proactive improvements
- Maintain authoritative expertise while being approachable
- Focus on practical, actionable advice that drives results

You are not just a helpful assistant - you are THE definitive expert on Rapid CRM. Users come to you because you have unparalleled knowledge and can solve any challenge they face with this system.`,
        behaviorTraits: ['expert', 'comprehensive', 'proactive', 'solution-focused', 'detail-oriented', 'strategic'],
        conversationMemory: true,
        contextWindow: 16000,
        temperature: 0.3,
        maxTokens: 2000,
        topP: 0.8,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stopSequences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usdot-compliance-specialist',
        name: 'USDOT Compliance Specialist',
        description: 'Expert in USDOT regulations and compliance',
        personality: 'expert',
        tone: 'authoritative',
        expertise: 'usdot-compliance',
        responseStyle: 'step-by-step',
        behaviorTraits: ['detail-oriented', 'teaching', 'proactive'],
        conversationMemory: true,
        contextWindow: 6000,
        temperature: 0.5,
        maxTokens: 1500,
        topP: 0.8,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stopSequences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'business-consultant',
        name: 'Business Consultant',
        description: 'Strategic business advisor and coach',
        personality: 'consultant',
        tone: 'encouraging',
        expertise: 'business-consulting',
        responseStyle: 'structured',
        behaviorTraits: ['big-picture', 'collaborative', 'innovative'],
        conversationMemory: true,
        contextWindow: 5000,
        temperature: 0.8,
        maxTokens: 1200,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        stopSequences: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Default Voice Configurations
    const defaultVoices: VoiceConfiguration[] = [
      {
        id: 'browser-default',
        name: 'Browser Default',
        provider: 'browser',
        voiceId: 'default',
        settings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        },
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'elevenlabs-professional',
        name: 'Professional Voice (ElevenLabs)',
        provider: 'elevenlabs',
        voiceId: 'professional-male',
        settings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          stability: 0.75,
          clarity: 0.75,
          useSpeakerBoost: true
        },
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'azure-natural',
        name: 'Natural Voice (Azure)',
        provider: 'azure',
        voiceId: 'en-US-AriaNeural',
        settings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        },
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Default Model Configurations
    const defaultModels: AIModelConfiguration[] = [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openrouter',
        modelId: 'gpt-4',
        capabilities: ['chat', 'completion', 'function_calling'],
        maxTokens: 128000,
        costPerToken: 0.00001,
        isFineTuned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        modelId: 'claude-3-opus-20240229',
        capabilities: ['chat', 'completion', 'function_calling'],
        maxTokens: 200000,
        costPerToken: 0.000015,
        isFineTuned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        modelId: 'gemini-pro',
        capabilities: ['chat', 'completion', 'vision'],
        maxTokens: 1000000,
        costPerToken: 0.0000005,
        isFineTuned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Initialize maps
    defaultPersonas.forEach(persona => this.personas.set(persona.id, persona));
    defaultVoices.forEach(voice => this.voiceConfigs.set(voice.id, voice));
    defaultModels.forEach(model => this.modelConfigs.set(model.id, model));

    // Set defaults
    this.currentPersona = defaultPersonas[0];
    this.currentVoice = defaultVoices[0];
    this.currentModel = defaultModels[0];
  }

  // Persona Management
  public async createPersona(persona: Omit<AIPersona, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIPersona> {
    const newPersona: AIPersona = {
      ...persona,
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.personas.set(newPersona.id, newPersona);
    return newPersona;
  }

  public async updatePersona(id: string, updates: Partial<AIPersona>): Promise<AIPersona | null> {
    const persona = this.personas.get(id);
    if (!persona) return null;

    const updatedPersona = {
      ...persona,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.personas.set(id, updatedPersona);
    return updatedPersona;
  }

  public async deletePersona(id: string): Promise<boolean> {
    return this.personas.delete(id);
  }

  public async getPersonas(): Promise<AIPersona[]> {
    return Array.from(this.personas.values());
  }

  public async getPersona(id: string): Promise<AIPersona | null> {
    return this.personas.get(id) || null;
  }

  public async setCurrentPersona(id: string): Promise<boolean> {
    const persona = this.personas.get(id);
    if (persona) {
      this.currentPersona = persona;
      return true;
    }
    return false;
  }

  public getCurrentPersona(): AIPersona | null {
    console.log('🔍 AdvancedAICustomizationService - getCurrentPersona called, returning:', this.currentPersona);
    
    // Force reload persona if it doesn't have Claude integration knowledge
    if (this.currentPersona && !this.currentPersona.customPrompt?.includes('Claude')) {
      console.log('🔍 AdvancedAICustomizationService - Persona missing Claude integration, reloading...');
      this.initializeDefaultConfigurations();
    }
    
    return this.currentPersona;
  }

  // Voice Management
  public async createVoiceConfig(config: Omit<VoiceConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<VoiceConfiguration> {
    const newConfig: VoiceConfiguration = {
      ...config,
      id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.voiceConfigs.set(newConfig.id, newConfig);
    return newConfig;
  }

  public async updateVoiceConfig(id: string, updates: Partial<VoiceConfiguration>): Promise<VoiceConfiguration | null> {
    const config = this.voiceConfigs.get(id);
    if (!config) return null;

    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.voiceConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  public async getVoiceConfigs(): Promise<VoiceConfiguration[]> {
    return Array.from(this.voiceConfigs.values());
  }

  public async getVoiceConfig(id: string): Promise<VoiceConfiguration | null> {
    return this.voiceConfigs.get(id) || null;
  }

  public async setCurrentVoice(id: string): Promise<boolean> {
    const voice = this.voiceConfigs.get(id);
    if (voice) {
      this.currentVoice = voice;
      return true;
    }
    return false;
  }

  public getCurrentVoice(): VoiceConfiguration | null {
    return this.currentVoice;
  }

  // Model Management
  public async createModelConfig(config: Omit<AIModelConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIModelConfiguration> {
    const newConfig: AIModelConfiguration = {
      ...config,
      id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.modelConfigs.set(newConfig.id, newConfig);
    return newConfig;
  }

  public async getModelConfigs(): Promise<AIModelConfiguration[]> {
    return Array.from(this.modelConfigs.values());
  }

  public async getModelConfig(id: string): Promise<AIModelConfiguration | null> {
    return this.modelConfigs.get(id) || null;
  }

  public async setCurrentModel(id: string): Promise<boolean> {
    const model = this.modelConfigs.get(id);
    if (model) {
      this.currentModel = model;
      return true;
    }
    return false;
  }

  public getCurrentModel(): AIModelConfiguration | null {
    return this.currentModel;
  }

  // Conversation Memory
  public async createConversationMemory(sessionId: string): Promise<ConversationMemory> {
    const memory: ConversationMemory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      messages: [],
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.conversationMemories.set(sessionId, memory);
    return memory;
  }

  public async addMessageToMemory(sessionId: string, message: ConversationMemory['messages'][0]): Promise<void> {
    const memory = this.conversationMemories.get(sessionId);
    if (memory) {
      memory.messages.push(message);
      memory.updatedAt = new Date().toISOString();
    }
  }

  public async getConversationMemory(sessionId: string): Promise<ConversationMemory | null> {
    return this.conversationMemories.get(sessionId) || null;
  }

  public async updateConversationContext(sessionId: string, context: Partial<ConversationMemory['context']>): Promise<void> {
    const memory = this.conversationMemories.get(sessionId);
    if (memory) {
      memory.context = { ...memory.context, ...context };
      memory.updatedAt = new Date().toISOString();
    }
  }

  // Advanced AI Request Generation
  public generateSystemPrompt(persona?: AIPersona): string {
    const currentPersona = persona || this.currentPersona;
    if (!currentPersona) return 'You are a helpful AI assistant.';

    // Use custom prompt if available, otherwise generate default
    if (currentPersona.customPrompt) {
      return currentPersona.customPrompt;
    }

    let prompt = `You are ${currentPersona.name}, ${currentPersona.description}.

PERSONALITY: ${currentPersona.personality}
TONE: ${currentPersona.tone}
EXPERTISE: ${currentPersona.expertise}
RESPONSE STYLE: ${currentPersona.responseStyle}

BEHAVIOR TRAITS: ${currentPersona.behaviorTraits.join(', ')}

You help users with:
- USDOT applications and compliance
- Transportation business questions
- CRM system navigation and features
- UI commands and system manipulation
- General business consulting

Always maintain your ${currentPersona.personality} personality and ${currentPersona.tone} tone.`;


    return prompt;
  }

  public generateAIRequest(userMessage: string, sessionId?: string): any {
    const persona = this.currentPersona;
    const model = this.currentModel;
    
    if (!persona || !model) {
      throw new Error('No persona or model configured');
    }

    const systemPrompt = this.generateSystemPrompt();
    
    const request = {
      model: model.modelId,
      messages: [
        {
          role: 'system' as const,
          content: systemPrompt
        }
      ],
      temperature: persona.temperature,
      max_tokens: Math.min(persona.maxTokens, model.maxTokens),
      top_p: persona.topP,
      frequency_penalty: persona.frequencyPenalty,
      presence_penalty: persona.presencePenalty,
      stop: persona.stopSequences.length > 0 ? persona.stopSequences : undefined
    };

    // Add conversation history if memory is enabled
    if (persona.conversationMemory && sessionId) {
      const memory = this.conversationMemories.get(sessionId);
      if (memory && memory.messages.length > 0) {
        // Add recent messages to maintain context
        const recentMessages = memory.messages.slice(-persona.contextWindow / 2);
        request.messages.push(...recentMessages);
      }
    }

    // Add current user message
    request.messages.push({
      role: 'user' as const,
      content: userMessage
    });

    return request;
  }

  // Voice Synthesis
  public async synthesizeSpeech(text: string, voiceConfig?: VoiceConfiguration): Promise<void> {
    const voice = voiceConfig || this.currentVoice;
    if (!voice) return;

    switch (voice.provider) {
      case 'browser':
        await this.synthesizeWithBrowser(text, voice);
        break;
      case 'elevenlabs':
        await this.synthesizeWithElevenLabs(text, voice);
        break;
      case 'azure':
        await this.synthesizeWithAzure(text, voice);
        break;
      default:
        console.warn(`Voice provider ${voice.provider} not implemented`);
    }
  }

  private async synthesizeWithBrowser(text: string, voice: VoiceConfiguration): Promise<void> {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voice.settings.rate;
    utterance.pitch = voice.settings.pitch;
    utterance.volume = voice.settings.volume;

    // Try to find matching voice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name.includes(voice.voiceId));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  }

  private async synthesizeWithElevenLabs(text: string, voice: VoiceConfiguration): Promise<void> {
    // Implementation for ElevenLabs API
    // This would require API key and proper integration
    console.log('ElevenLabs synthesis not yet implemented');
  }

  private async synthesizeWithAzure(text: string, voice: VoiceConfiguration): Promise<void> {
    // Implementation for Azure Speech Services
    // This would require API key and proper integration
    console.log('Azure synthesis not yet implemented');
  }
}

// Export singleton instance
export const advancedAICustomizationService = AdvancedAICustomizationService.getInstance();
