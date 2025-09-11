// Google Cloud AI Service Integration
// This service handles all Google Cloud AI operations including Vertex AI, Document AI, and Discovery Engine

export interface GoogleCloudConfig {
  projectId: string;
  region: string;
  credentials?: string; // Base64 encoded service account key
}

export interface VertexAIConfig {
  model: 'gemini-pro' | 'gemini-pro-vision' | 'text-bison' | 'chat-bison';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface DocumentAIConfig {
  processorId: string;
  location: string;
  mimeType: string;
}

export interface DiscoveryEngineConfig {
  searchEngineId: string;
  servingConfigId: string;
  query: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'regulatory' | 'proprietary' | 'general' | 'custom';
  description: string;
  source: 'upload' | 'url' | 'database' | 'api';
  status: 'active' | 'processing' | 'error';
  size: string;
  lastUpdated: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  processedAt: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: string[];
  actions: string[];
  supersedes: string[];
  supersededBy: string[];
  category: 'federal' | 'state' | 'proprietary' | 'operational';
}

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0 (negative to positive)
  magnitude: number; // 0.0 to infinity (strength of emotion)
  emotions: {
    joy: number;
    sorrow: number;
    anger: number;
    surprise: number;
    fear: number;
    disgust: number;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tone: 'professional' | 'friendly' | 'empathetic' | 'urgent' | 'formal' | 'casual';
  escalationRequired: boolean;
  recommendedResponse: {
    tone: string;
    urgency: string;
    escalation: boolean;
    keywords: string[];
  };
}

export interface AgentResponse {
  content: string;
  confidence: number;
  sources: string[];
  rulesApplied: string[];
  knowledgeBaseUsed: string[];
  sentiment: SentimentAnalysis;
  metadata: Record<string, any>;
}

class GoogleCloudService {
  private config: GoogleCloudConfig;
  private vertexAI: any;
  private documentAI: any;
  private discoveryEngine: any;
  private naturalLanguage: any;

  constructor(config: GoogleCloudConfig) {
    this.config = config;
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // Initialize Google Cloud services
      // In a real implementation, you would import and initialize the actual Google Cloud SDKs
      console.log('Initializing Google Cloud services...', this.config);
      
      // Mock initialization - replace with actual Google Cloud SDK calls
      this.vertexAI = {
        generateContent: this.mockVertexAIGenerateContent.bind(this),
        chat: this.mockVertexAIChat.bind(this)
      };
      
      this.documentAI = {
        processDocument: this.mockDocumentAIProcess.bind(this),
        extractEntities: this.mockDocumentAIExtract.bind(this)
      };
      
      this.discoveryEngine = {
        search: this.mockDiscoveryEngineSearch.bind(this),
        getDocument: this.mockDiscoveryEngineGetDocument.bind(this)
      };
      
      this.naturalLanguage = {
        analyzeSentiment: this.mockAnalyzeSentiment.bind(this),
        analyzeEntities: this.mockAnalyzeEntities.bind(this),
        analyzeSyntax: this.mockAnalyzeSyntax.bind(this),
        classifyText: this.mockClassifyText.bind(this)
      };
    } catch (error) {
      console.error('Failed to initialize Google Cloud services:', error);
      throw error;
    }
  }

  // Natural Language Processing Methods
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Mock implementation - replace with actual Google Cloud Natural Language API call
      const sentiment = await this.naturalLanguage.analyzeSentiment(text);
      return sentiment;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      throw error;
    }
  }

  async analyzeEntities(text: string): Promise<any> {
    try {
      // Mock implementation - replace with actual Google Cloud Natural Language API call
      const entities = await this.naturalLanguage.analyzeEntities(text);
      return entities;
    } catch (error) {
      console.error('Entity analysis failed:', error);
      throw error;
    }
  }

  async analyzeSyntax(text: string): Promise<any> {
    try {
      // Mock implementation - replace with actual Google Cloud Natural Language API call
      const syntax = await this.naturalLanguage.analyzeSyntax(text);
      return syntax;
    } catch (error) {
      console.error('Syntax analysis failed:', error);
      throw error;
    }
  }

  async classifyText(text: string): Promise<any> {
    try {
      // Mock implementation - replace with actual Google Cloud Natural Language API call
      const classification = await this.naturalLanguage.classifyText(text);
      return classification;
    } catch (error) {
      console.error('Text classification failed:', error);
      throw error;
    }
  }

  // Enhanced Agent Response with Sentiment Analysis
  async generateContentWithSentiment(prompt: string, config: VertexAIConfig, userMessage?: string): Promise<AgentResponse> {
    try {
      // First analyze sentiment if user message is provided
      let sentiment: SentimentAnalysis | null = null;
      if (userMessage) {
        sentiment = await this.analyzeSentiment(userMessage);
      }

      // Generate content with sentiment-aware prompting
      const enhancedPrompt = this.buildSentimentAwarePrompt(prompt, sentiment);
      const response = await this.generateContent(enhancedPrompt, config);
      
      // Add sentiment analysis to response
      return {
        ...response,
        sentiment: sentiment || this.getDefaultSentiment()
      };
    } catch (error) {
      console.error('Sentiment-aware content generation failed:', error);
      throw error;
    }
  }

  // Vertex AI Methods
  async generateContent(prompt: string, config: VertexAIConfig): Promise<AgentResponse> {
    try {
      // Mock implementation - replace with actual Vertex AI call
      const response = await this.vertexAI.generateContent(prompt, config);
      return response;
    } catch (error) {
      console.error('Vertex AI generation failed:', error);
      throw error;
    }
  }

  async chat(messages: any[], config: VertexAIConfig): Promise<AgentResponse> {
    try {
      // Mock implementation - replace with actual Vertex AI chat call
      const response = await this.vertexAI.chat(messages, config);
      return response;
    } catch (error) {
      console.error('Vertex AI chat failed:', error);
      throw error;
    }
  }

  // Document AI Methods
  async processDocument(document: File, config: DocumentAIConfig): Promise<any> {
    try {
      // Mock implementation - replace with actual Document AI call
      const response = await this.documentAI.processDocument(document, config);
      return response;
    } catch (error) {
      console.error('Document AI processing failed:', error);
      throw error;
    }
  }

  async extractEntities(document: File, config: DocumentAIConfig): Promise<any> {
    try {
      // Mock implementation - replace with actual Document AI call
      const response = await this.documentAI.extractEntities(document, config);
      return response;
    } catch (error) {
      console.error('Document AI entity extraction failed:', error);
      throw error;
    }
  }

  // Discovery Engine Methods
  async search(query: string, config: DiscoveryEngineConfig): Promise<any> {
    try {
      // Mock implementation - replace with actual Discovery Engine call
      const response = await this.discoveryEngine.search(query, config);
      return response;
    } catch (error) {
      console.error('Discovery Engine search failed:', error);
      throw error;
    }
  }

  async getDocument(documentId: string, config: DiscoveryEngineConfig): Promise<any> {
    try {
      // Mock implementation - replace with actual Discovery Engine call
      const response = await this.discoveryEngine.getDocument(documentId, config);
      return response;
    } catch (error) {
      console.error('Discovery Engine document retrieval failed:', error);
      throw error;
    }
  }

  // Knowledge Base Management
  async createKnowledgeBase(knowledgeBase: Omit<KnowledgeBase, 'id'>): Promise<KnowledgeBase> {
    try {
      // Mock implementation - replace with actual knowledge base creation
      const newKnowledgeBase: KnowledgeBase = {
        id: Date.now().toString(),
        ...knowledgeBase,
        lastUpdated: new Date().toISOString()
      };
      
      // Store in local storage for demo purposes
      const existing = JSON.parse(localStorage.getItem('knowledgeBases') || '[]');
      existing.push(newKnowledgeBase);
      localStorage.setItem('knowledgeBases', JSON.stringify(existing));
      
      return newKnowledgeBase;
    } catch (error) {
      console.error('Knowledge base creation failed:', error);
      throw error;
    }
  }

  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    try {
      // Mock implementation - replace with actual knowledge base retrieval
      const knowledgeBases = JSON.parse(localStorage.getItem('knowledgeBases') || '[]');
      return knowledgeBases;
    } catch (error) {
      console.error('Knowledge base retrieval failed:', error);
      throw error;
    }
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    try {
      // Mock implementation - replace with actual knowledge base update
      const knowledgeBases = JSON.parse(localStorage.getItem('knowledgeBases') || '[]');
      const index = knowledgeBases.findIndex((kb: KnowledgeBase) => kb.id === id);
      
      if (index === -1) {
        throw new Error('Knowledge base not found');
      }
      
      knowledgeBases[index] = {
        ...knowledgeBases[index],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('knowledgeBases', JSON.stringify(knowledgeBases));
      return knowledgeBases[index];
    } catch (error) {
      console.error('Knowledge base update failed:', error);
      throw error;
    }
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    try {
      // Mock implementation - replace with actual knowledge base deletion
      const knowledgeBases = JSON.parse(localStorage.getItem('knowledgeBases') || '[]');
      const filtered = knowledgeBases.filter((kb: KnowledgeBase) => kb.id !== id);
      localStorage.setItem('knowledgeBases', JSON.stringify(filtered));
    } catch (error) {
      console.error('Knowledge base deletion failed:', error);
      throw error;
    }
  }

  // Rule Engine Methods
  async createRule(rule: Omit<Rule, 'id'>): Promise<Rule> {
    try {
      // Mock implementation - replace with actual rule creation
      const newRule: Rule = {
        id: Date.now().toString(),
        ...rule
      };
      
      // Store in local storage for demo purposes
      const existing = JSON.parse(localStorage.getItem('rules') || '[]');
      existing.push(newRule);
      localStorage.setItem('rules', JSON.stringify(existing));
      
      return newRule;
    } catch (error) {
      console.error('Rule creation failed:', error);
      throw error;
    }
  }

  async getRules(): Promise<Rule[]> {
    try {
      // Mock implementation - replace with actual rule retrieval
      const rules = JSON.parse(localStorage.getItem('rules') || '[]');
      return rules.sort((a: Rule, b: Rule) => a.priority - b.priority);
    } catch (error) {
      console.error('Rule retrieval failed:', error);
      throw error;
    }
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule> {
    try {
      // Mock implementation - replace with actual rule update
      const rules = JSON.parse(localStorage.getItem('rules') || '[]');
      const index = rules.findIndex((rule: Rule) => rule.id === id);
      
      if (index === -1) {
        throw new Error('Rule not found');
      }
      
      rules[index] = { ...rules[index], ...updates };
      localStorage.setItem('rules', JSON.stringify(rules));
      return rules[index];
    } catch (error) {
      console.error('Rule update failed:', error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      // Mock implementation - replace with actual rule deletion
      const rules = JSON.parse(localStorage.getItem('rules') || '[]');
      const filtered = rules.filter((rule: Rule) => rule.id !== id);
      localStorage.setItem('rules', JSON.stringify(filtered));
    } catch (error) {
      console.error('Rule deletion failed:', error);
      throw error;
    }
  }

  // USDOT Application Processing
  async processUSDOTApplication(applicationData: any): Promise<any> {
    try {
      // This would integrate with Document AI to process USDOT forms
      // and Vertex AI to validate and complete the application
      
      const processedData = {
        ...applicationData,
        processedAt: new Date().toISOString(),
        status: 'processed',
        complianceChecks: await this.runComplianceChecks(applicationData),
        requiredDocuments: await this.determineRequiredDocuments(applicationData),
        estimatedProcessingTime: await this.estimateProcessingTime(applicationData)
      };
      
      return processedData;
    } catch (error) {
      console.error('USDOT application processing failed:', error);
      throw error;
    }
  }

  // Regulatory Compliance Engine
  async runComplianceChecks(applicationData: any): Promise<any> {
    try {
      // This would use the rule engine and knowledge base to determine compliance requirements
      const rules = await this.getRules();
      const applicableRules = rules.filter(rule => 
        this.evaluateRuleConditions(rule, applicationData)
      );
      
      return {
        applicableRules: applicableRules.map(rule => rule.id),
        complianceStatus: 'pending',
        requiredActions: applicableRules.flatMap(rule => rule.actions),
        conflicts: this.detectRuleConflicts(applicableRules)
      };
    } catch (error) {
      console.error('Compliance check failed:', error);
      throw error;
    }
  }

  private evaluateRuleConditions(rule: Rule, data: any): boolean {
    // Mock implementation - replace with actual rule evaluation logic
    return rule.conditions.some(condition => {
      // Simple condition evaluation - in real implementation, this would be more sophisticated
      return data[condition] !== undefined;
    });
  }

  private detectRuleConflicts(rules: Rule[]): any[] {
    // Mock implementation - replace with actual conflict detection logic
    const conflicts: any[] = [];
    
    for (const rule of rules) {
      for (const supersededRuleId of rule.supersedes) {
        const supersededRule = rules.find(r => r.id === supersededRuleId);
        if (supersededRule) {
          conflicts.push({
            type: 'supersession',
            primaryRule: rule.id,
            supersededRule: supersededRuleId,
            resolution: 'Apply primary rule'
          });
        }
      }
    }
    
    return conflicts;
  }

  private async determineRequiredDocuments(applicationData: any): Promise<string[]> {
    // Mock implementation - replace with actual document determination logic
    const documents = ['USDOT Application Form', 'Insurance Certificate'];
    
    if (applicationData.hazmatRequired === 'Yes') {
      documents.push('Hazmat Endorsement');
    }
    
    if (applicationData.interstateIntrastate === 'Interstate') {
      documents.push('Interstate Operating Authority');
    }
    
    return documents;
  }

  private async estimateProcessingTime(applicationData: any): Promise<string> {
    // Mock implementation - replace with actual processing time estimation
    let baseTime = 5; // 5 business days
    
    if (applicationData.hazmatRequired === 'Yes') {
      baseTime += 3;
    }
    
    if (applicationData.interstateIntrastate === 'Interstate') {
      baseTime += 2;
    }
    
    return `${baseTime} business days`;
  }

  // Sentiment Analysis Helper Methods
  private buildSentimentAwarePrompt(basePrompt: string, sentiment: SentimentAnalysis | null): string {
    if (!sentiment) return basePrompt;

    const sentimentContext = this.buildSentimentContext(sentiment);
    return `${basePrompt}\n\nSentiment Context: ${sentimentContext}`;
  }

  private buildSentimentContext(sentiment: SentimentAnalysis): string {
    const { score, magnitude, urgency, tone, escalationRequired } = sentiment;
    
    let context = `Customer sentiment: ${this.getSentimentDescription(score, magnitude)}. `;
    context += `Urgency level: ${urgency}. `;
    context += `Detected tone: ${tone}. `;
    
    if (escalationRequired) {
      context += `ESCALATION REQUIRED - Handle with immediate attention. `;
    }
    
    context += `Recommended response approach: ${sentiment.recommendedResponse.tone}.`;
    
    return context;
  }

  private getSentimentDescription(score: number, magnitude: number): string {
    if (score > 0.3) {
      return magnitude > 0.5 ? 'very positive' : 'positive';
    } else if (score < -0.3) {
      return magnitude > 0.5 ? 'very negative' : 'negative';
    } else {
      return magnitude > 0.5 ? 'neutral with strong emotion' : 'neutral';
    }
  }

  private getDefaultSentiment(): SentimentAnalysis {
    return {
      score: 0,
      magnitude: 0,
      emotions: {
        joy: 0,
        sorrow: 0,
        anger: 0,
        surprise: 0,
        fear: 0,
        disgust: 0
      },
      urgency: 'low',
      tone: 'professional',
      escalationRequired: false,
      recommendedResponse: {
        tone: 'professional',
        urgency: 'low',
        escalation: false,
        keywords: []
      }
    };
  }

  // Urgency Detection
  private detectUrgency(text: string, sentiment: SentimentAnalysis): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'deadline', 'expired'];
    const highUrgencyKeywords = ['frustrated', 'angry', 'disappointed', 'failed', 'broken', 'not working'];
    const criticalKeywords = ['sue', 'legal', 'complaint', 'escalate', 'manager', 'supervisor'];
    
    const lowerText = text.toLowerCase();
    
    // Check for critical keywords
    if (criticalKeywords.some(keyword => lowerText.includes(keyword)) || sentiment.escalationRequired) {
      return 'critical';
    }
    
    // Check for high urgency keywords
    if (highUrgencyKeywords.some(keyword => lowerText.includes(keyword)) || sentiment.score < -0.5) {
      return 'high';
    }
    
    // Check for urgent keywords
    if (urgentKeywords.some(keyword => lowerText.includes(keyword)) || sentiment.magnitude > 0.8) {
      return 'medium';
    }
    
    return 'low';
  }

  // Tone Detection
  private detectTone(text: string, sentiment: SentimentAnalysis): 'professional' | 'friendly' | 'empathetic' | 'urgent' | 'formal' | 'casual' {
    const lowerText = text.toLowerCase();
    
    // Check for formal language
    if (lowerText.includes('sir') || lowerText.includes('madam') || lowerText.includes('respectfully')) {
      return 'formal';
    }
    
    // Check for casual language
    if (lowerText.includes('hey') || lowerText.includes('thanks') || lowerText.includes('cool')) {
      return 'casual';
    }
    
    // Check for urgent tone
    if (sentiment.urgency === 'high' || sentiment.urgency === 'critical') {
      return 'urgent';
    }
    
    // Check for empathetic tone needed
    if (sentiment.score < -0.3 || sentiment.emotions.sorrow > 0.5 || sentiment.emotions.anger > 0.5) {
      return 'empathetic';
    }
    
    // Check for friendly tone
    if (sentiment.score > 0.3 || sentiment.emotions.joy > 0.5) {
      return 'friendly';
    }
    
    return 'professional';
  }

  // Mock implementations for demo purposes
  private async mockVertexAIGenerateContent(prompt: string, config: VertexAIConfig): Promise<AgentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: `Generated response for: ${prompt.substring(0, 50)}...`,
      confidence: 0.95,
      sources: ['knowledge_base_1', 'regulatory_docs_2'],
      rulesApplied: ['rule_1', 'rule_2'],
      knowledgeBaseUsed: ['federal_regulations', 'state_requirements'],
      sentiment: this.getDefaultSentiment(),
      metadata: {
        model: config.model,
        temperature: config.temperature,
        tokensUsed: Math.floor(Math.random() * 1000) + 500
      }
    };
  }

  private async mockVertexAIChat(messages: any[], config: VertexAIConfig): Promise<AgentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      content: `Chat response based on ${messages.length} messages`,
      confidence: 0.92,
      sources: ['conversation_history', 'knowledge_base_1'],
      rulesApplied: ['rule_3'],
      knowledgeBaseUsed: ['customer_service_kb'],
      sentiment: this.getDefaultSentiment(),
      metadata: {
        model: config.model,
        conversationLength: messages.length,
        tokensUsed: Math.floor(Math.random() * 800) + 300
      }
    };
  }

  private async mockDocumentAIProcess(document: File, config: DocumentAIConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      extractedText: `Extracted text from ${document.name}`,
      entities: [
        { type: 'PERSON', value: 'John Doe', confidence: 0.98 },
        { type: 'ORGANIZATION', value: 'Acme Transport', confidence: 0.95 }
      ],
      formFields: {
        'company_name': 'Acme Transport LLC',
        'ein': '12-3456789',
        'usdot_number': '123456'
      },
      confidence: 0.94
    };
  }

  private async mockDocumentAIExtract(document: File, config: DocumentAIConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      entities: [
        { type: 'USDOT_NUMBER', value: '123456', confidence: 0.99 },
        { type: 'EIN', value: '12-3456789', confidence: 0.97 },
        { type: 'BUSINESS_NAME', value: 'Acme Transport LLC', confidence: 0.96 }
      ],
      classifications: [
        { category: 'USDOT_APPLICATION', confidence: 0.98 },
        { category: 'TRANSPORTATION_DOCUMENT', confidence: 0.95 }
      ]
    };
  }

  private async mockDiscoveryEngineSearch(query: string, config: DiscoveryEngineConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      results: [
        {
          id: 'doc_1',
          title: 'Federal Motor Carrier Safety Regulations',
          snippet: 'Relevant content about FMCSA regulations...',
          score: 0.95,
          metadata: { source: 'federal_regulations', updated: '2024-01-15' }
        },
        {
          id: 'doc_2',
          title: 'State Transportation Requirements',
          snippet: 'State-specific transportation requirements...',
          score: 0.87,
          metadata: { source: 'state_regulations', updated: '2024-01-10' }
        }
      ],
      totalResults: 2,
      query: query
    };
  }

  private async mockDiscoveryEngineGetDocument(documentId: string, config: DiscoveryEngineConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: documentId,
      title: 'Document Title',
      content: 'Full document content...',
      metadata: {
        source: 'knowledge_base',
        lastUpdated: '2024-01-15',
        type: 'regulatory_document'
      }
    };
  }

  // Mock Natural Language API implementations
  private async mockAnalyzeSentiment(text: string): Promise<SentimentAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simple sentiment analysis based on keywords
    const lowerText = text.toLowerCase();
    let score = 0;
    let magnitude = 0;
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let escalationRequired = false;
    
    // Positive keywords
    const positiveWords = ['good', 'great', 'excellent', 'thank', 'happy', 'pleased', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'upset'];
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'deadline'];
    const escalationWords = ['sue', 'legal', 'complaint', 'escalate', 'manager', 'supervisor'];
    
    // Calculate sentiment score
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.2;
        magnitude += 0.3;
      }
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        score -= 0.2;
        magnitude += 0.3;
      }
    });
    
    // Check for urgency
    if (escalationWords.some(word => lowerText.includes(word))) {
      urgency = 'critical';
      escalationRequired = true;
    } else if (urgentWords.some(word => lowerText.includes(word))) {
      urgency = 'high';
    } else if (magnitude > 0.5) {
      urgency = 'medium';
    }
    
    // Normalize score
    score = Math.max(-1, Math.min(1, score));
    magnitude = Math.max(0, magnitude);
    
    // Calculate emotions based on sentiment
    const emotions = {
      joy: Math.max(0, score * 0.5),
      sorrow: Math.max(0, -score * 0.3),
      anger: Math.max(0, -score * 0.4),
      surprise: magnitude * 0.2,
      fear: Math.max(0, -score * 0.2),
      disgust: Math.max(0, -score * 0.1)
    };
    
    const tone = this.detectTone(text, { score, magnitude, emotions, urgency, escalationRequired } as SentimentAnalysis);
    
    return {
      score,
      magnitude,
      emotions,
      urgency,
      tone,
      escalationRequired,
      recommendedResponse: {
        tone: this.getRecommendedTone(tone, urgency, escalationRequired),
        urgency: urgency,
        escalation: escalationRequired,
        keywords: this.extractKeywords(text)
      }
    };
  }

  private async mockAnalyzeEntities(text: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      entities: [
        { name: 'USDOT', type: 'ORGANIZATION', salience: 0.8 },
        { name: 'Acme Transport', type: 'ORGANIZATION', salience: 0.6 },
        { name: 'John Doe', type: 'PERSON', salience: 0.4 }
      ]
    };
  }

  private async mockAnalyzeSyntax(text: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      sentences: text.split('.').filter(s => s.trim().length > 0),
      tokens: text.split(' ').length,
      language: 'en'
    };
  }

  private async mockClassifyText(text: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const categories = [];
    
    if (text.toLowerCase().includes('usdot') || text.toLowerCase().includes('application')) {
      categories.push({ name: 'USDOT Application', confidence: 0.9 });
    }
    
    if (text.toLowerCase().includes('complaint') || text.toLowerCase().includes('issue')) {
      categories.push({ name: 'Customer Complaint', confidence: 0.8 });
    }
    
    if (text.toLowerCase().includes('question') || text.toLowerCase().includes('help')) {
      categories.push({ name: 'Customer Support', confidence: 0.7 });
    }
    
    return { categories };
  }

  private getRecommendedTone(tone: string, urgency: string, escalationRequired: boolean): string {
    if (escalationRequired) return 'empathetic and urgent';
    if (urgency === 'critical') return 'empathetic and professional';
    if (urgency === 'high') return 'empathetic';
    if (tone === 'angry' || tone === 'frustrated') return 'empathetic and understanding';
    if (tone === 'friendly') return 'friendly and helpful';
    return 'professional and helpful';
  }

  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Extract important keywords
    const importantWords = ['usdot', 'application', 'compliance', 'regulation', 'deadline', 'urgent', 'help'];
    importantWords.forEach(word => {
      if (lowerText.includes(word)) {
        keywords.push(word);
      }
    });
    
    return keywords;
  }
}

// Export singleton instance
export const googleCloudService = new GoogleCloudService({
  projectId: process.env.REACT_APP_GCP_PROJECT_ID || 'your-project-id',
  region: process.env.REACT_APP_GCP_REGION || 'us-central1'
});

export default GoogleCloudService;
