import { Message } from '../../types/conversation';

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'greeting' | 'closing' | 'escalation' | 'information' | 'custom';
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAnalytics {
  messageId: string;
  conversationId: string;
  views: number;
  reactions: {
    like: number;
    dislike: number;
    helpful: number;
    notHelpful: number;
  };
  responseTime: number;
  satisfaction: number;
  timestamp: string;
}

export interface MessageSearchResult {
  message: Message;
  relevanceScore: number;
  context: string;
}

export class MessageService {
  private templates: Map<string, MessageTemplate> = new Map();
  private analytics: Map<string, MessageAnalytics> = new Map();
  private searchIndex: Map<string, string[]> = new Map();

  constructor() {
    this.loadTemplates();
    this.loadAnalytics();
    this.initializeDefaultTemplates();
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem('rapid_crm_message_templates');
      if (stored) {
        const data = JSON.parse(stored);
        this.templates = new Map(data.templates);
      }
    } catch (error) {
      console.error('Error loading message templates:', error);
    }
  }

  private loadAnalytics(): void {
    try {
      const stored = localStorage.getItem('rapid_crm_message_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        this.analytics = new Map(data.analytics);
      }
    } catch (error) {
      console.error('Error loading message analytics:', error);
    }
  }

  private saveTemplates(): void {
    try {
      const data = {
        templates: Array.from(this.templates.entries())
      };
      localStorage.setItem('rapid_crm_message_templates', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving message templates:', error);
    }
  }

  private saveAnalytics(): void {
    try {
      const data = {
        analytics: Array.from(this.analytics.entries())
      };
      localStorage.setItem('rapid_crm_message_analytics', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving message analytics:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: MessageTemplate[] = [
      {
        id: 'greeting-1',
        name: 'Welcome Message',
        category: 'greeting',
        content: 'Hello {{customerName}}! Thank you for contacting us. How can I help you today?',
        variables: ['customerName'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'greeting-2',
        name: 'USDOT Application Welcome',
        category: 'greeting',
        content: 'Welcome to Rapid CRM! I\'m here to help you with your USDOT application process. Let\'s get started by gathering some basic information about your transportation business.',
        variables: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'escalation-1',
        name: 'Escalate to Human',
        category: 'escalation',
        content: 'I understand this is a complex matter. Let me connect you with one of our specialists who can provide more detailed assistance.',
        variables: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'closing-1',
        name: 'Thank You & Next Steps',
        category: 'closing',
        content: 'Thank you for providing that information, {{customerName}}. I\'ve recorded your details and will process your USDOT application. You\'ll receive a confirmation email shortly with next steps.',
        variables: ['customerName'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'information-1',
        name: 'USDOT Requirements',
        category: 'information',
        content: 'For USDOT registration, you\'ll need to provide: 1) Business information, 2) Operation classification, 3) Vehicle details, 4) Driver information, 5) Insurance documentation, and 6) Compliance certifications.',
        variables: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });

    this.saveTemplates();
  }

  // Template Management
  async getTemplates(category?: string): Promise<MessageTemplate[]> {
    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    return templates.filter(t => t.isActive).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTemplate(id: string): Promise<MessageTemplate | null> {
    return this.templates.get(id) || null;
  }

  async createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate> {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveTemplates();
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.templates.set(id, updatedTemplate);
    this.saveTemplates();
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    this.saveTemplates();
    return deleted;
  }

  // Template Processing
  processTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) return '';

    let content = template.content;
    
    // Replace variables
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return content;
  }

  // Message Analysis
  analyzeMessage(message: Message): MessageAnalytics {
    const analytics: MessageAnalytics = {
      messageId: message.id,
      conversationId: message.conversationId,
      views: 1,
      reactions: {
        like: 0,
        dislike: 0,
        helpful: 0,
        notHelpful: 0
      },
      responseTime: this.calculateResponseTime(message),
      satisfaction: this.calculateSatisfaction(message),
      timestamp: new Date().toISOString()
    };

    this.analytics.set(message.id, analytics);
    this.saveAnalytics();
    return analytics;
  }

  private calculateResponseTime(message: Message): number {
    // This would typically be calculated based on conversation context
    // For now, we'll simulate based on message length and complexity
    const baseTime = 1000; // 1 second base
    const lengthFactor = message.content.length * 10; // 10ms per character
    const complexityFactor = this.analyzeComplexity(message.content) * 500; // 500ms per complexity point
    
    return baseTime + lengthFactor + complexityFactor;
  }

  private analyzeComplexity(content: string): number {
    // Simple complexity analysis based on content features
    let complexity = 0;
    
    // Check for technical terms
    const technicalTerms = ['USDOT', 'FMCSA', 'compliance', 'regulation', 'certification'];
    technicalTerms.forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        complexity += 1;
      }
    });
    
    // Check for question marks (questions are more complex)
    complexity += (content.match(/\?/g) || []).length;
    
    // Check for multiple sentences
    complexity += (content.match(/\./g) || []).length;
    
    return Math.min(complexity, 5); // Cap at 5
  }

  private calculateSatisfaction(message: Message): number {
    // This would typically come from user feedback
    // For now, we'll simulate based on message characteristics
    let satisfaction = 0.7; // Base satisfaction
    
    // Longer, more detailed messages tend to be more satisfying
    if (message.content.length > 100) satisfaction += 0.1;
    if (message.content.length > 200) satisfaction += 0.1;
    
    // Messages with helpful information
    const helpfulKeywords = ['help', 'assist', 'support', 'solution', 'recommend'];
    helpfulKeywords.forEach(keyword => {
      if (message.content.toLowerCase().includes(keyword)) {
        satisfaction += 0.05;
      }
    });
    
    return Math.min(satisfaction, 1.0);
  }

  // Message Search
  async searchMessages(query: string, conversationId?: string): Promise<MessageSearchResult[]> {
    const results: MessageSearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    // This would typically use a proper search index
    // For now, we'll do a simple text search
    this.searchIndex.forEach((content, messageId) => {
      if (content.some(text => text.toLowerCase().includes(queryLower))) {
        const message = this.findMessageById(messageId);
        if (message && (!conversationId || message.conversationId === conversationId)) {
          results.push({
            message,
            relevanceScore: this.calculateRelevanceScore(content, queryLower),
            context: this.extractContext(content, queryLower)
          });
        }
      }
    });
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private findMessageById(messageId: string): Message | null {
    // This would typically query the conversation service
    // For now, we'll return null as this is a simplified implementation
    return null;
  }

  private calculateRelevanceScore(content: string[], query: string): number {
    let score = 0;
    content.forEach(text => {
      const textLower = text.toLowerCase();
      if (textLower.includes(query)) {
        score += 1;
        // Boost score for exact matches
        if (textLower === query) score += 2;
        // Boost score for matches at the beginning
        if (textLower.startsWith(query)) score += 1;
      }
    });
    return score;
  }

  private extractContext(content: string[], query: string): string {
    // Extract surrounding context for search results
    const queryLower = query.toLowerCase();
    for (const text of content) {
      const textLower = text.toLowerCase();
      const index = textLower.indexOf(queryLower);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        return text.substring(start, end);
      }
    }
    return content[0] || '';
  }

  // Analytics
  async getMessageAnalytics(messageId: string): Promise<MessageAnalytics | null> {
    return this.analytics.get(messageId) || null;
  }

  async updateMessageAnalytics(messageId: string, updates: Partial<MessageAnalytics>): Promise<MessageAnalytics | null> {
    const analytics = this.analytics.get(messageId);
    if (!analytics) return null;

    const updatedAnalytics = {
      ...analytics,
      ...updates,
      timestamp: new Date().toISOString()
    };

    this.analytics.set(messageId, updatedAnalytics);
    this.saveAnalytics();
    return updatedAnalytics;
  }

  async recordReaction(messageId: string, reaction: keyof MessageAnalytics['reactions']): Promise<boolean> {
    const analytics = this.analytics.get(messageId);
    if (!analytics) return false;

    analytics.reactions[reaction]++;
    this.analytics.set(messageId, analytics);
    this.saveAnalytics();
    return true;
  }

  async recordView(messageId: string): Promise<boolean> {
    const analytics = this.analytics.get(messageId);
    if (!analytics) return false;

    analytics.views++;
    this.analytics.set(messageId, analytics);
    this.saveAnalytics();
    return true;
  }

  // Message Indexing
  indexMessage(message: Message): void {
    const content = [
      message.content,
      message.senderId,
      message.senderType
    ];
    
    this.searchIndex.set(message.id, content);
  }

  // Bulk Operations
  async bulkCreateTemplates(templates: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<MessageTemplate[]> {
    const createdTemplates: MessageTemplate[] = [];
    
    for (const template of templates) {
      const created = await this.createTemplate(template);
      createdTemplates.push(created);
    }
    
    return createdTemplates;
  }

  async exportTemplates(): Promise<string> {
    const templates = Array.from(this.templates.values());
    return JSON.stringify(templates, null, 2);
  }

  async importTemplates(templatesJson: string): Promise<MessageTemplate[]> {
    try {
      const templates = JSON.parse(templatesJson);
      const importedTemplates: MessageTemplate[] = [];
      
      for (const template of templates) {
        const { id, createdAt, updatedAt, ...templateData } = template;
        const imported = await this.createTemplate(templateData);
        importedTemplates.push(imported);
      }
      
      return importedTemplates;
    } catch (error) {
      throw new Error('Invalid templates format');
    }
  }
}

export const messageService = new MessageService();
