// Using direct database connection - no separate repository

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  authorId: string;
  
  // Agent Configuration
  personality: any;
  capabilities: string[];
  learningProfile: any;
  
  // Marketplace Information
  price: number;
  currency: 'USD' | 'credits' | 'free';
  rating: number;
  reviewCount: number;
  downloadCount: number;
  
  // Technical Details
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requirements: string[];
  compatibility: string[];
  size: number; // KB
  
  // Licensing
  license: 'free' | 'premium' | 'enterprise' | 'custom';
  usageLimits: {
    maxInstances: number;
    maxInteractions: number;
    timeLimit: number; // days
  };
  
  // Status
  status: 'published' | 'draft' | 'review' | 'suspended';
  featured: boolean;
  verified: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastDownloaded: string;
  
  // Reviews and Ratings
  reviews: AgentReview[];
  screenshots: string[];
  documentation: string;
  changelog: string[];
}

export interface AgentReview {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  createdAt: string;
  helpful: number;
  reported: boolean;
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: string;
  subcategories: string[];
  agentCount: number;
}

export interface MarketplaceStats {
  totalAgents: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number }>;
  topAgents: Array<{ agentId: string; downloads: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

export class AIAgentMarketplace {
  constructor() {
    // Mock implementation - no database dependency
  }

  // Agent Management
  async publishAgent(agent: Partial<MarketplaceAgent>): Promise<MarketplaceAgent> {
    try {
      const marketplaceAgent: MarketplaceAgent = {
        id: this.generateAgentId(),
        name: agent.name || 'Unnamed Agent',
        description: agent.description || '',
        category: agent.category || 'general',
        tags: agent.tags || [],
        version: agent.version || '1.0.0',
        author: agent.author || 'Unknown',
        authorId: agent.authorId || 'anonymous',
        
        personality: agent.personality || {},
        capabilities: agent.capabilities || [],
        learningProfile: agent.learningProfile || {},
        
        price: agent.price || 0,
        currency: agent.currency || 'free',
        rating: 0,
        reviewCount: 0,
        downloadCount: 0,
        
        complexity: agent.complexity || 'beginner',
        requirements: agent.requirements || [],
        compatibility: agent.compatibility || [],
        size: agent.size || 0,
        
        license: agent.license || 'free',
        usageLimits: agent.usageLimits || {
          maxInstances: 1,
          maxInteractions: 1000,
          timeLimit: 30
        },
        
        status: 'review',
        featured: false,
        verified: false,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastDownloaded: new Date().toISOString(),
        
        reviews: [],
        screenshots: agent.screenshots || [],
        documentation: agent.documentation || '',
        changelog: agent.changelog || []
      };

      await this.saveMarketplaceAgent(marketplaceAgent);
      return marketplaceAgent;
    } catch (error) {
      console.error('Error publishing agent:', error);
      throw new Error('Failed to publish agent');
    }
  }

  async getAgent(agentId: string): Promise<MarketplaceAgent | null> {
    try {
      const query = 'SELECT * FROM marketplace_agents WHERE id = ?';
      const result = await this.query(query, [agentId]);
      return result.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent');
    }
  }

  async searchAgents(filters: {
    query?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    complexity?: string;
    license?: string;
    featured?: boolean;
    verified?: boolean;
    sortBy?: 'rating' | 'downloads' | 'price' | 'newest' | 'popular';
    limit?: number;
    offset?: number;
  } = {}): Promise<MarketplaceAgent[]> {
    try {
      let query = 'SELECT * FROM marketplace_agents WHERE status = "published"';
      const params: any[] = [];

      if (filters.query) {
        query += ` AND (
          name LIKE ? OR 
          description LIKE ? OR 
          tags LIKE ? OR
          author LIKE ?
        )`;
        const searchTerm = `%${filters.query}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.priceRange) {
        query += ' AND price >= ? AND price <= ?';
        params.push(filters.priceRange.min, filters.priceRange.max);
      }

      if (filters.rating) {
        query += ' AND rating >= ?';
        params.push(filters.rating);
      }

      if (filters.complexity) {
        query += ' AND complexity = ?';
        params.push(filters.complexity);
      }

      if (filters.license) {
        query += ' AND license = ?';
        params.push(filters.license);
      }

      if (filters.featured) {
        query += ' AND featured = 1';
      }

      if (filters.verified) {
        query += ' AND verified = 1';
      }

      // Sorting
      switch (filters.sortBy) {
        case 'rating':
          query += ' ORDER BY rating DESC, reviewCount DESC';
          break;
        case 'downloads':
          query += ' ORDER BY downloadCount DESC';
          break;
        case 'price':
          query += ' ORDER BY price ASC';
          break;
        case 'newest':
          query += ' ORDER BY createdAt DESC';
          break;
        case 'popular':
        default:
          query += ' ORDER BY downloadCount DESC, rating DESC';
          break;
      }

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      // Mock data - return empty array for now
      return [];
    } catch (error) {
      console.error('Error searching agents:', error);
      throw new Error('Failed to search agents');
    }
  }

  async downloadAgent(agentId: string, userId: string): Promise<{ success: boolean; agent?: any }> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Check download limits
      if (agent.usageLimits.maxInstances > 0) {
        const userDownloads = await this.getUserDownloads(userId, agentId);
        if (userDownloads >= agent.usageLimits.maxInstances) {
          throw new Error('Download limit exceeded');
        }
      }

      // Update download count
      await this.updateAgent(agentId, {
        downloadCount: agent.downloadCount + 1,
        lastDownloaded: new Date().toISOString()
      });

      // Record download
      await this.recordDownload(agentId, userId);

      return { success: true, agent };
    } catch (error) {
      console.error('Error downloading agent:', error);
      throw new Error('Failed to download agent');
    }
  }

  // Review System
  async addReview(agentId: string, review: Omit<AgentReview, 'id' | 'agentId' | 'createdAt' | 'helpful' | 'reported'>): Promise<AgentReview> {
    try {
      const newReview: AgentReview = {
        id: this.generateReviewId(),
        agentId,
        ...review,
        createdAt: new Date().toISOString(),
        helpful: 0,
        reported: false
      };

      // Add review to agent
      const agent = await this.getAgent(agentId);
      if (agent) {
        agent.reviews.push(newReview);
        
        // Recalculate rating
        const totalRating = agent.reviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = totalRating / agent.reviews.length;
        
        await this.updateAgent(agentId, {
          reviews: agent.reviews,
          rating: Math.round(newRating * 10) / 10,
          reviewCount: agent.reviews.length
        });
      }

      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
    }
  }

  async getAgentReviews(agentId: string, limit: number = 10): Promise<AgentReview[]> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent.reviews
        .sort((a, b) => b.helpful - a.helpful)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  // Categories
  async getCategories(): Promise<AgentCategory[]> {
    return [
      {
        id: 'customer_service',
        name: 'Customer Service',
        description: 'Agents specialized in customer support and service',
        icon: 'headset',
        color: '#3B82F6',
        subcategories: ['chat_support', 'phone_support', 'email_support'],
        agentCount: 0
      },
      {
        id: 'data_analysis',
        name: 'Data Analysis',
        description: 'Agents for data processing and business intelligence',
        icon: 'chart-bar',
        color: '#10B981',
        subcategories: ['statistical_analysis', 'visualization', 'reporting'],
        agentCount: 0
      },
      {
        id: 'automation',
        name: 'Automation',
        description: 'Workflow automation and process optimization agents',
        icon: 'cog',
        color: '#F59E0B',
        subcategories: ['workflow_automation', 'task_automation', 'process_optimization'],
        agentCount: 0
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Agents for messaging, email, and communication tasks',
        icon: 'chat',
        color: '#8B5CF6',
        subcategories: ['email_management', 'messaging', 'social_media'],
        agentCount: 0
      },
      {
        id: 'sales_marketing',
        name: 'Sales & Marketing',
        description: 'Agents for sales support and marketing automation',
        icon: 'trending-up',
        color: '#EF4444',
        subcategories: ['lead_generation', 'sales_support', 'marketing_automation'],
        agentCount: 0
      },
      {
        id: 'hr_recruitment',
        name: 'HR & Recruitment',
        description: 'Human resources and recruitment assistance agents',
        icon: 'users',
        color: '#06B6D4',
        subcategories: ['recruitment', 'employee_support', 'hr_automation'],
        agentCount: 0
      }
    ];
  }

  // Featured and Recommended Agents
  async getFeaturedAgents(limit: number = 6): Promise<MarketplaceAgent[]> {
    try {
      const query = `
        SELECT * FROM marketplace_agents 
        WHERE status = "published" AND featured = 1 
        ORDER BY rating DESC, downloadCount DESC 
        LIMIT ?
      `;
      const result = await this.query(query, [limit]);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching featured agents:', error);
      throw new Error('Failed to fetch featured agents');
    }
  }

  async getRecommendedAgents(userId: string, limit: number = 6): Promise<MarketplaceAgent[]> {
    try {
      // Get user's download history and preferences
      const userDownloads = await this.getUserDownloadHistory(userId);
      const userPreferences = await this.getUserPreferences(userId);

      // Simple recommendation algorithm based on similar agents
      let query = 'SELECT * FROM marketplace_agents WHERE status = "published"';
      const params: any[] = [];

      if (userDownloads.length > 0) {
        const categories = [...new Set(userDownloads.map(d => d.category))];
        if (categories.length > 0) {
          query += ` AND category IN (${categories.map(() => '?').join(',')})`;
          params.push(...categories);
        }
      }

      query += ' ORDER BY rating DESC, downloadCount DESC LIMIT ?';
      params.push(limit);

      const result = await this.query(query, params);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching recommended agents:', error);
      throw new Error('Failed to fetch recommended agents');
    }
  }

  // Analytics and Statistics
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const totalAgentsQuery = 'SELECT COUNT(*) as count FROM marketplace_agents WHERE status = "published"';
      const totalDownloadsQuery = 'SELECT SUM(downloadCount) as count FROM marketplace_agents';
      const averageRatingQuery = 'SELECT AVG(rating) as rating FROM marketplace_agents WHERE reviewCount > 0';
      const topCategoriesQuery = 'SELECT category, COUNT(*) as count FROM marketplace_agents GROUP BY category ORDER BY count DESC LIMIT 5';
      const topAgentsQuery = 'SELECT id, downloadCount FROM marketplace_agents ORDER BY downloadCount DESC LIMIT 5';

      const [totalAgents, totalDownloads, averageRating, topCategories, topAgents] = await Promise.all([
        this.query(totalAgentsQuery),
        this.query(totalDownloadsQuery),
        this.query(averageRatingQuery),
        this.query(topCategoriesQuery),
        this.query(topAgentsQuery)
      ]);

      return {
        totalAgents: totalAgents.rows?.[0]?.count || 0,
        totalDownloads: totalDownloads.rows?.[0]?.count || 0,
        totalRevenue: 0, // Would need payment integration
        averageRating: Math.round((averageRating.rows?.[0]?.rating || 0) * 10) / 10,
        topCategories: topCategories.rows?.map((row: any) => ({ category: row.category, count: row.count })) || [],
        topAgents: topAgents.rows?.map((row: any) => ({ agentId: row.id, downloads: row.downloadCount })) || [],
        recentActivity: [] // Would need activity tracking
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      throw new Error('Failed to fetch marketplace stats');
    }
  }

  // Agent Management for Authors
  async getUserAgents(userId: string): Promise<MarketplaceAgent[]> {
    try {
      const query = 'SELECT * FROM marketplace_agents WHERE authorId = ? ORDER BY createdAt DESC';
      const result = await this.query(query, [userId]);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching user agents:', error);
      throw new Error('Failed to fetch user agents');
    }
  }

  async updateAgent(agentId: string, updates: Partial<MarketplaceAgent>): Promise<MarketplaceAgent> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const updatedAgent = {
        ...agent,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveMarketplaceAgent(updatedAgent);
      return updatedAgent;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent');
    }
  }

  // Private Helper Methods
  private async saveMarketplaceAgent(agent: MarketplaceAgent): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO marketplace_agents (
        id, name, description, category, tags, version, author, authorId,
        personality, capabilities, learningProfile, price, currency, rating,
        reviewCount, downloadCount, complexity, requirements, compatibility,
        size, license, usageLimits, status, featured, verified, createdAt,
        updatedAt, lastDownloaded, reviews, screenshots, documentation, changelog
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      agent.id, agent.name, agent.description, agent.category, JSON.stringify(agent.tags),
      agent.version, agent.author, agent.authorId, JSON.stringify(agent.personality),
      JSON.stringify(agent.capabilities), JSON.stringify(agent.learningProfile),
      agent.price, agent.currency, agent.rating, agent.reviewCount, agent.downloadCount,
      agent.complexity, JSON.stringify(agent.requirements), JSON.stringify(agent.compatibility),
      agent.size, agent.license, JSON.stringify(agent.usageLimits), agent.status,
      agent.featured, agent.verified, agent.createdAt, agent.updatedAt,
      agent.lastDownloaded, JSON.stringify(agent.reviews), JSON.stringify(agent.screenshots),
      agent.documentation, JSON.stringify(agent.changelog)
    ];

    await this.query(query, values);
  }

  private async recordDownload(agentId: string, userId: string): Promise<void> {
    const query = `
      INSERT INTO agent_downloads (agentId, userId, downloadedAt)
      VALUES (?, ?, ?)
    `;
    await this.query(query, [agentId, userId, new Date().toISOString()]);
  }

  private async getUserDownloads(userId: string, agentId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM agent_downloads WHERE userId = ? AND agentId = ?';
    const result = await this.query(query, [userId, agentId]);
    return result.data?.[0]?.count || 0;
  }

  private async getUserDownloadHistory(userId: string): Promise<any[]> {
    const query = `
      SELECT ad.*, ma.category 
      FROM agent_downloads ad 
      JOIN marketplace_agents ma ON ad.agentId = ma.id 
      WHERE ad.userId = ? 
      ORDER BY ad.downloadedAt DESC
    `;
    const result = await this.query(query, [userId]);
    return result.rows || [];
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // Would implement user preference tracking
    return {};
  }

  private generateAgentId(): string {
    return `marketplace_agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const aiAgentMarketplace = new AIAgentMarketplace();
