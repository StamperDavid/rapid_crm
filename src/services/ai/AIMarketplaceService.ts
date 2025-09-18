/**
 * AI Marketplace Service
 * Complete marketplace for AI agents with discovery, ratings, reviews, and deployment
 */

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  category: 'customer_service' | 'data_analysis' | 'automation' | 'sales_marketing' | 'content_generation' | 'voice_audio' | 'security' | 'integration';
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  pricingModel: 'one_time' | 'subscription' | 'usage_based' | 'free';
  rating: number;
  reviewCount: number;
  downloadCount: number;
  tags: string[];
  features: string[];
  requirements: {
    minMemory: string;
    minStorage: string;
    dependencies: string[];
    apiKeys: string[];
  };
  screenshots: string[];
  documentation: string;
  changelog: {
    version: string;
    date: string;
    changes: string[];
  }[];
  license: string;
  support: {
    email: string;
    documentation: string;
    community: string;
  };
  status: 'active' | 'inactive' | 'deprecated' | 'beta';
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
}

export interface AgentReview {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceStats {
  totalAgents: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  trendingAgents: MarketplaceAgent[];
  newAgents: MarketplaceAgent[];
  featuredAgents: MarketplaceAgent[];
}

export class AIMarketplaceService {
  private agents: MarketplaceAgent[] = [];
  private reviews: AgentReview[] = [];
  private stats: MarketplaceStats;

  constructor() {
    this.initializeSampleData();
    this.calculateStats();
  }

  private initializeSampleData() {
    this.agents = [
      {
        id: 'agent_001',
        name: 'Customer Support Pro',
        description: 'Advanced customer support agent with natural language processing and sentiment analysis capabilities.',
        author: {
          id: 'author_001',
          name: 'AI Solutions Inc.',
          verified: true
        },
        category: 'customer_service',
        complexity: 'intermediate',
        price: 99.99,
        currency: 'USD',
        pricingModel: 'one_time',
        rating: 4.8,
        reviewCount: 156,
        downloadCount: 2340,
        tags: ['customer-service', 'nlp', 'sentiment-analysis', 'automation'],
        features: [
          'Natural language understanding',
          'Sentiment analysis',
          'Multi-language support',
          'Integration with popular CRM systems',
          'Customizable responses',
          'Analytics dashboard'
        ],
        requirements: {
          minMemory: '2GB',
          minStorage: '500MB',
          dependencies: ['OpenAI API', 'Google Cloud NLP'],
          apiKeys: ['OPENAI_API_KEY', 'GOOGLE_CLOUD_KEY']
        },
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        documentation: 'https://docs.example.com/customer-support-pro',
        changelog: [
          {
            version: '2.1.0',
            date: '2024-01-15',
            changes: ['Added multi-language support', 'Improved sentiment analysis', 'Fixed bug in response generation']
          }
        ],
        license: 'Commercial',
        support: {
          email: 'support@aisolutions.com',
          documentation: 'https://docs.example.com',
          community: 'https://community.example.com'
        },
        status: 'active',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-15'),
        featured: true
      },
      {
        id: 'agent_002',
        name: 'Data Insights Generator',
        description: 'Powerful data analysis agent that generates insights from complex datasets using advanced ML algorithms.',
        author: {
          id: 'author_002',
          name: 'DataTech Labs',
          verified: true
        },
        category: 'data_analysis',
        complexity: 'advanced',
        price: 199.99,
        currency: 'USD',
        pricingModel: 'subscription',
        rating: 4.6,
        reviewCount: 89,
        downloadCount: 1200,
        tags: ['data-analysis', 'machine-learning', 'insights', 'visualization'],
        features: [
          'Automated data analysis',
          'ML-powered insights',
          'Interactive visualizations',
          'Report generation',
          'Data cleaning',
          'Statistical analysis'
        ],
        requirements: {
          minMemory: '4GB',
          minStorage: '2GB',
          dependencies: ['Python 3.8+', 'Pandas', 'Scikit-learn'],
          apiKeys: []
        },
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        documentation: 'https://docs.example.com/data-insights',
        changelog: [
          {
            version: '1.5.0',
            date: '2024-01-10',
            changes: ['Added new visualization types', 'Improved ML algorithms', 'Enhanced report templates']
          }
        ],
        license: 'Commercial',
        support: {
          email: 'support@datatech.com',
          documentation: 'https://docs.datatech.com',
          community: 'https://community.datatech.com'
        },
        status: 'active',
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date('2024-01-10'),
        featured: true
      },
      {
        id: 'agent_003',
        name: 'Content Creator AI',
        description: 'Creative content generation agent for blogs, social media, and marketing materials.',
        author: {
          id: 'author_003',
          name: 'Creative AI Co.',
          verified: false
        },
        category: 'content_generation',
        complexity: 'beginner',
        price: 0,
        currency: 'USD',
        pricingModel: 'free',
        rating: 4.2,
        reviewCount: 234,
        downloadCount: 5600,
        tags: ['content-creation', 'marketing', 'social-media', 'blogging'],
        features: [
          'Blog post generation',
          'Social media content',
          'Marketing copy',
          'SEO optimization',
          'Content templates',
          'Brand voice adaptation'
        ],
        requirements: {
          minMemory: '1GB',
          minStorage: '200MB',
          dependencies: ['OpenAI API'],
          apiKeys: ['OPENAI_API_KEY']
        },
        screenshots: ['screenshot1.jpg'],
        documentation: 'https://docs.example.com/content-creator',
        changelog: [
          {
            version: '1.0.0',
            date: '2024-01-01',
            changes: ['Initial release', 'Basic content generation', 'Template system']
          }
        ],
        license: 'MIT',
        support: {
          email: 'support@creativeai.com',
          documentation: 'https://docs.creativeai.com',
          community: 'https://github.com/creativeai/content-creator'
        },
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        featured: false
      }
    ];

    // Initialize sample reviews
    this.reviews = [
      {
        id: 'review_001',
        agentId: 'agent_001',
        userId: 'user_001',
        userName: 'John Smith',
        rating: 5,
        title: 'Excellent customer support automation',
        content: 'This agent has transformed our customer support. Response times are down 70% and customer satisfaction is up significantly.',
        pros: ['Fast response times', 'Easy to integrate', 'Great documentation'],
        cons: ['Could use more customization options'],
        verified: true,
        helpful: 23,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];
  }

  private calculateStats() {
    this.stats = {
      totalAgents: this.agents.length,
      totalDownloads: this.agents.reduce((sum, agent) => sum + agent.downloadCount, 0),
      totalRevenue: this.agents.reduce((sum, agent) => sum + (agent.price * agent.downloadCount), 0),
      averageRating: this.agents.reduce((sum, agent) => sum + agent.rating, 0) / this.agents.length,
      topCategories: this.getTopCategories(),
      trendingAgents: this.getTrendingAgents(),
      newAgents: this.getNewAgents(),
      featuredAgents: this.getFeaturedAgents()
    };
  }

  private getTopCategories() {
    const categoryCount = this.agents.reduce((acc, agent) => {
      acc[agent.category] = (acc[agent.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / this.agents.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTrendingAgents(): MarketplaceAgent[] {
    return this.agents
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5);
  }

  private getNewAgents(): MarketplaceAgent[] {
    return this.agents
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }

  private getFeaturedAgents(): MarketplaceAgent[] {
    return this.agents.filter(agent => agent.featured);
  }

  // Get all agents with filtering and pagination
  async getAgents(filters?: {
    category?: string;
    complexity?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    search?: string;
    sortBy?: 'rating' | 'downloads' | 'price' | 'date';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ agents: MarketplaceAgent[]; total: number; page: number; totalPages: number }> {
    let filteredAgents = [...this.agents];

    // Apply filters
    if (filters?.category) {
      filteredAgents = filteredAgents.filter(agent => agent.category === filters.category);
    }

    if (filters?.complexity) {
      filteredAgents = filteredAgents.filter(agent => agent.complexity === filters.complexity);
    }

    if (filters?.priceRange) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.price >= filters.priceRange!.min && agent.price <= filters.priceRange!.max
      );
    }

    if (filters?.rating) {
      filteredAgents = filteredAgents.filter(agent => agent.rating >= filters.rating!);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAgents = filteredAgents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.description.toLowerCase().includes(searchTerm) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredAgents.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'downloads':
            aValue = a.downloadCount;
            bValue = b.downloadCount;
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'date':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

    return {
      agents: paginatedAgents,
      total: filteredAgents.length,
      page,
      totalPages: Math.ceil(filteredAgents.length / limit)
    };
  }

  // Get agent by ID
  async getAgent(id: string): Promise<MarketplaceAgent | null> {
    return this.agents.find(agent => agent.id === id) || null;
  }

  // Get agent reviews
  async getAgentReviews(agentId: string): Promise<AgentReview[]> {
    return this.reviews.filter(review => review.agentId === agentId);
  }

  // Add agent review
  async addReview(review: Omit<AgentReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentReview> {
    const newReview: AgentReview = {
      ...review,
      id: `review_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reviews.push(newReview);
    return newReview;
  }

  // Get marketplace statistics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    return this.stats;
  }

  // Download agent
  async downloadAgent(agentId: string, userId: string): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    // Increment download count
    agent.downloadCount++;
    
    // In a real implementation, this would generate a download URL
    const downloadUrl = `https://marketplace.example.com/download/${agentId}?user=${userId}`;
    
    return { success: true, downloadUrl };
  }

  // Publish agent
  async publishAgent(agent: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'reviewCount'>): Promise<MarketplaceAgent> {
    const newAgent: MarketplaceAgent = {
      ...agent,
      id: `agent_${Date.now()}`,
      downloadCount: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.agents.push(newAgent);
    this.calculateStats();
    
    return newAgent;
  }

  // Update agent
  async updateAgent(id: string, updates: Partial<MarketplaceAgent>): Promise<MarketplaceAgent | null> {
    const agentIndex = this.agents.findIndex(agent => agent.id === id);
    if (agentIndex === -1) {
      return null;
    }

    this.agents[agentIndex] = {
      ...this.agents[agentIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.calculateStats();
    return this.agents[agentIndex];
  }

  // Delete agent
  async deleteAgent(id: string): Promise<boolean> {
    const agentIndex = this.agents.findIndex(agent => agent.id === id);
    if (agentIndex === -1) {
      return false;
    }

    this.agents.splice(agentIndex, 1);
    this.calculateStats();
    return true;
  }

  // Search agents
  async searchAgents(query: string, filters?: any): Promise<MarketplaceAgent[]> {
    const searchResults = await this.getAgents({
      ...filters,
      search: query
    });
    return searchResults.agents;
  }

  // Get agent categories
  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.getTopCategories();
  }
}

// Singleton instance
export const aiMarketplaceService = new AIMarketplaceService();






