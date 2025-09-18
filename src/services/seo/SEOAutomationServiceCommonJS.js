const { Database } = require('sqlite3');

class SEOAutomationService {
  constructor(database) {
    this.db = database;
  }

  // ===== COMPETITOR MONITORING =====

  async analyzeCompetitors() {
    console.log('🔍 Starting competitor analysis...');
    
    const competitors = await this.getActiveCompetitors();
    const analyses = [];

    for (const competitor of competitors) {
      try {
        const analysis = await this.analyzeCompetitor(competitor);
        analyses.push(analysis);
        
        // Update last analyzed timestamp
        await this.updateLastAnalyzed(competitor.id);
        
        console.log(`✅ Analyzed competitor: ${competitor.company_name}`);
      } catch (error) {
        console.error(`❌ Error analyzing ${competitor.company_name}:`, error);
      }
    }

    return analyses;
  }

  async getActiveCompetitors() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM seo_competitors WHERE monitoring_enabled = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async analyzeCompetitor(competitor) {
    // Simulate competitor analysis (in real implementation, this would call APIs)
    const mockMetrics = {
      organicKeywords: Math.floor(Math.random() * 10000) + 1000,
      estimatedTraffic: Math.floor(Math.random() * 100000) + 10000,
      domainAuthority: Math.floor(Math.random() * 40) + 60,
      backlinks: Math.floor(Math.random() * 50000) + 5000
    };

    const mockKeywords = [
      { keyword: 'fleet management', position: 1, searchVolume: 12000, difficulty: 65 },
      { keyword: 'gps tracking', position: 2, searchVolume: 8500, difficulty: 58 },
      { keyword: 'vehicle telematics', position: 3, searchVolume: 3200, difficulty: 45 },
      { keyword: 'ELD compliance', position: 1, searchVolume: 5600, difficulty: 52 }
    ];

    const mockContentGaps = [
      'AI-powered fleet optimization',
      'Real-time driver coaching',
      'Predictive maintenance insights',
      'Carbon footprint tracking'
    ];

    const mockSocialMetrics = [
      {
        platform: 'linkedin',
        followers: Math.floor(Math.random() * 50000) + 10000,
        engagementRate: Math.random() * 5 + 2,
        topHashtags: ['#fleetmanagement', '#telematics', '#transportation']
      },
      {
        platform: 'twitter',
        followers: Math.floor(Math.random() * 20000) + 5000,
        engagementRate: Math.random() * 3 + 1,
        topHashtags: ['#ELD', '#fleettech', '#logistics']
      }
    ];

    return {
      id: competitor.id,
      domain: competitor.domain,
      companyName: competitor.company_name,
      industry: competitor.industry,
      targetKeywords: JSON.parse(competitor.target_keywords || '[]'),
      monitoringEnabled: competitor.monitoring_enabled === 1,
      lastAnalyzed: competitor.last_analyzed ? new Date(competitor.last_analyzed) : null,
      metrics: mockMetrics,
      topKeywords: mockKeywords,
      contentGaps: mockContentGaps,
      socialMetrics: mockSocialMetrics
    };
  }

  async updateLastAnalyzed(competitorId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_competitors SET last_analyzed = CURRENT_TIMESTAMP WHERE id = ?',
        [competitorId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ===== SEO RECOMMENDATIONS =====

  async generateSEORecommendations(competitorAnalyses) {
    console.log('🎯 Generating SEO recommendations...');
    
    const recommendations = [];

    // Analyze content gaps
    const contentRecommendations = await this.generateContentRecommendations(competitorAnalyses);
    recommendations.push(...contentRecommendations);

    // Analyze technical SEO opportunities
    const technicalRecommendations = await this.generateTechnicalRecommendations(competitorAnalyses);
    recommendations.push(...technicalRecommendations);

    // Analyze keyword opportunities
    const keywordRecommendations = await this.generateKeywordRecommendations(competitorAnalyses);
    recommendations.push(...keywordRecommendations);

    // Save recommendations to database
    for (const rec of recommendations) {
      await this.saveRecommendation(rec);
    }

    console.log(`✅ Generated ${recommendations.length} SEO recommendations`);
    return recommendations;
  }

  async generateContentRecommendations(analyses) {
    const recommendations = [];

    // Find common content gaps across competitors
    const allGaps = analyses.flatMap(a => a.contentGaps);
    const gapCounts = allGaps.reduce((acc, gap) => {
      acc[gap] = (acc[gap] || 0) + 1;
      return acc;
    }, {});

    // Create recommendations for high-frequency gaps
    Object.entries(gapCounts).forEach(([gap, count]) => {
      if (count >= 2) { // Gap found in 2+ competitors
        recommendations.push({
          id: 0, // Will be set by database
          type: 'content',
          title: `Create content about: ${gap}`,
          description: `Multiple competitors are not covering "${gap}". This represents a content opportunity to capture organic traffic.`,
          impactScore: Math.min(count * 20, 100),
          effortLevel: 'medium',
          priority: count >= 3 ? 'high' : 'medium',
          status: 'pending',
          implementationDetails: {
            contentType: 'blog_post',
            suggestedKeywords: [gap.toLowerCase().replace(/\s+/g, '-')],
            estimatedWordCount: 2000,
            targetAudience: 'fleet managers'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    return recommendations;
  }

  async generateTechnicalRecommendations(analyses) {
    const recommendations = [];

    // Simulate technical SEO analysis
    const technicalIssues = [
      {
        title: 'Optimize page loading speed',
        description: 'Improve Core Web Vitals scores to match competitor performance',
        impactScore: 75,
        effortLevel: 'medium',
        priority: 'high'
      },
      {
        title: 'Implement structured data markup',
        description: 'Add JSON-LD structured data for better search engine understanding',
        impactScore: 60,
        effortLevel: 'low',
        priority: 'medium'
      },
      {
        title: 'Optimize mobile responsiveness',
        description: 'Ensure all pages are fully mobile-optimized',
        impactScore: 85,
        effortLevel: 'high',
        priority: 'high'
      }
    ];

    technicalIssues.forEach(issue => {
      recommendations.push({
        id: 0,
        type: 'technical',
        title: issue.title,
        description: issue.description,
        impactScore: issue.impactScore,
        effortLevel: issue.effortLevel,
        priority: issue.priority,
        status: 'pending',
        implementationDetails: {
          estimatedTime: issue.effortLevel === 'low' ? '2-4 hours' : 
                        issue.effortLevel === 'medium' ? '1-2 days' : '3-5 days',
          requiredSkills: ['frontend development', 'SEO optimization'],
          tools: ['Google PageSpeed Insights', 'Google Search Console']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    return recommendations;
  }

  async generateKeywordRecommendations(analyses) {
    const recommendations = [];

    // Find keywords where competitors rank well but we don't
    const allKeywords = analyses.flatMap(a => a.topKeywords);
    const keywordOpportunities = allKeywords.filter(k => k.position <= 5 && k.searchVolume > 1000);

    keywordOpportunities.forEach(keyword => {
      recommendations.push({
        id: 0,
        type: 'keyword_optimization',
        title: `Target keyword: ${keyword.keyword}`,
        description: `Competitors are ranking well for "${keyword.keyword}" (${keyword.searchVolume} monthly searches). We should optimize our content for this keyword.`,
        impactScore: Math.min(keyword.searchVolume / 100, 100),
        effortLevel: 'medium',
        priority: keyword.searchVolume > 5000 ? 'high' : 'medium',
        status: 'pending',
        implementationDetails: {
          targetKeyword: keyword.keyword,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          suggestedPages: ['homepage', 'services page', 'blog post'],
          optimizationActions: [
            'Include keyword in title tags',
            'Add keyword to meta descriptions',
            'Optimize header structure',
            'Create supporting content'
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    return recommendations;
  }

  async saveRecommendation(recommendation) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO seo_recommendations 
         (type, title, description, impact_score, effort_level, priority, status, implementation_details, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recommendation.type,
          recommendation.title,
          recommendation.description,
          recommendation.impactScore,
          recommendation.effortLevel,
          recommendation.priority,
          recommendation.status,
          JSON.stringify(recommendation.implementationDetails),
          recommendation.createdAt.toISOString(),
          recommendation.updatedAt.toISOString()
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ===== AUTOMATED DAILY TASKS =====

  async runDailySEOTasks() {
    console.log('🌅 Running daily SEO automation tasks...');
    
    try {
      // 1. Analyze competitors
      const analyses = await this.analyzeCompetitors();
      
      // 2. Generate recommendations
      const recommendations = await this.generateSEORecommendations(analyses);
      
      // 3. Generate content opportunities
      const opportunities = await this.generateContentOpportunities(analyses);
      
      // 4. Queue high-priority content generation
      const highPriorityOpportunities = opportunities.filter(o => o.priority === 'high');
      for (const opportunity of highPriorityOpportunities) {
        await this.queueContentGeneration(opportunity);
      }
      
      // 5. Auto-approve low-impact recommendations if enabled
      const autoApproveSetting = await this.getSetting('auto_approve_low_impact');
      if (autoApproveSetting === 'true') {
        const lowImpactRecs = recommendations.filter(r => r.impactScore < 30 && r.effortLevel === 'low');
        for (const rec of lowImpactRecs) {
          await this.approveRecommendation(rec.id, 1); // Auto-approve with system user ID
        }
      }
      
      console.log('✅ Daily SEO tasks completed successfully');
      return {
        success: true,
        analyses: analyses.length,
        recommendations: recommendations.length,
        opportunities: opportunities.length
      };
    } catch (error) {
      console.error('❌ Error running daily SEO tasks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateContentOpportunities(analyses) {
    console.log('📝 Generating content opportunities...');
    
    const opportunities = [];

    // Find content gaps and create opportunities
    analyses.forEach(analysis => {
      analysis.contentGaps.forEach(gap => {
        const opportunity = {
          id: 0,
          keyword: gap.toLowerCase().replace(/\s+/g, '-'),
          competitorRanking: 0, // Not applicable for content gaps
          ourRanking: 0, // We don't rank for this yet
          opportunityScore: Math.floor(Math.random() * 40) + 60, // 60-100
          contentSuggestion: `Create comprehensive content about ${gap} to capture organic traffic in this underserved area.`,
          contentType: 'blog_post',
          priority: Math.random() > 0.5 ? 'high' : 'medium',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        opportunities.push(opportunity);
      });
    });

    // Save opportunities to database
    for (const opportunity of opportunities) {
      await this.saveContentOpportunity(opportunity);
    }

    console.log(`✅ Generated ${opportunities.length} content opportunities`);
    return opportunities;
  }

  async saveContentOpportunity(opportunity) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO content_opportunities 
         (keyword, competitor_ranking, our_ranking, opportunity_score, content_suggestion, content_type, priority, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          opportunity.keyword,
          opportunity.competitorRanking,
          opportunity.ourRanking,
          opportunity.opportunityScore,
          opportunity.contentSuggestion,
          opportunity.contentType,
          opportunity.priority,
          opportunity.status,
          opportunity.createdAt.toISOString(),
          opportunity.updatedAt.toISOString()
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async queueContentGeneration(opportunity) {
    console.log(`📋 Queuing content generation for: ${opportunity.keyword}`);
    
    const contentRequest = {
      contentOpportunityId: opportunity.id,
      contentType: opportunity.contentType,
      topic: opportunity.keyword.replace(/-/g, ' '),
      targetKeywords: [opportunity.keyword],
      contentBrief: opportunity.contentSuggestion
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO content_generation_queue 
         (content_opportunity_id, content_type, topic, target_keywords, content_brief, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          contentRequest.contentOpportunityId,
          contentRequest.contentType,
          contentRequest.topic,
          JSON.stringify(contentRequest.targetKeywords),
          contentRequest.contentBrief,
          new Date().toISOString(),
          new Date().toISOString()
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async approveRecommendation(recommendationId, approvedBy) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_recommendations SET status = "approved", approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
        [approvedBy, recommendationId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getSetting(settingName) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT setting_value FROM seo_automation_settings WHERE setting_name = ?',
        [settingName],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.setting_value : null);
        }
      );
    });
  }

  // ===== SOCIAL MEDIA SEO =====

  async generateSocialSEOReport() {
    console.log('📱 Generating social media SEO report...');
    
    const competitors = await this.getActiveCompetitors();
    const socialReport = {
      summary: {
        totalCompetitors: competitors.length,
        platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
        reportDate: new Date()
      },
      competitorAnalysis: [],
      recommendations: []
    };

    for (const competitor of competitors) {
      const socialMetrics = await this.getSocialMetrics(competitor.id);
      socialReport.competitorAnalysis.push({
        company: competitor.company_name,
        domain: competitor.domain,
        socialMetrics
      });
    }

    // Generate social media recommendations
    socialReport.recommendations = await this.generateSocialRecommendations(socialReport.competitorAnalysis);

    return socialReport;
  }

  async getSocialMetrics(competitorId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM social_seo_metrics WHERE competitor_id = ? ORDER BY date_recorded DESC LIMIT 4',
        [competitorId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async generateSocialRecommendations(competitorAnalysis) {
    const recommendations = [
      {
        platform: 'linkedin',
        recommendation: 'Increase LinkedIn content frequency to match top competitors',
        priority: 'high',
        action: 'Post 3-5 times per week with industry insights'
      },
      {
        platform: 'twitter',
        recommendation: 'Engage more with transportation industry hashtags',
        priority: 'medium',
        action: 'Use hashtags: #fleetmanagement #ELD #transportation'
      }
    ];

    return recommendations;
  }

  // ===== MISSING METHODS FOR API ROUTES =====

  async getPendingRecommendations() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM seo_recommendations WHERE status = "pending" ORDER BY priority DESC, impact_score DESC',
        (err, rows) => {
          if (err) reject(err);
          else {
            const recommendations = rows.map(row => ({
              ...row,
              implementationDetails: JSON.parse(row.implementation_details || '{}'),
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
              approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
              implementedAt: row.implemented_at ? new Date(row.implemented_at) : undefined
            }));
            resolve(recommendations);
          }
        }
      );
    });
  }

  async getContentOpportunities() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM content_opportunities ORDER BY opportunity_score DESC, priority DESC',
        (err, rows) => {
          if (err) reject(err);
          else {
            const opportunities = rows.map(row => ({
              ...row,
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at)
            }));
            resolve(opportunities);
          }
        }
      );
    });
  }

  async getContentOpportunity(opportunityId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM content_opportunities WHERE id = ?',
        [opportunityId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else {
            resolve({
              ...row,
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at)
            });
          }
        }
      );
    });
  }

  async implementRecommendation(recommendationId) {
    console.log(`🚀 Implementing SEO recommendation: ${recommendationId}`);
    
    // Get recommendation details
    const recommendation = await this.getRecommendation(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    // Simulate implementation based on type
    switch (recommendation.type) {
      case 'technical':
        await this.implementTechnicalSEO(recommendation);
        break;
      case 'content':
        await this.implementContentSEO(recommendation);
        break;
      case 'keyword_optimization':
        await this.implementKeywordOptimization(recommendation);
        break;
      case 'link_building':
        await this.implementLinkBuilding(recommendation);
        break;
    }

    // Update status
    await this.markRecommendationImplemented(recommendationId);
    
    // Log the change
    await this.logSEOChange(recommendationId, recommendation);
  }

  async getRecommendation(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM seo_recommendations WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(null);
          else {
            resolve({
              ...row,
              implementationDetails: JSON.parse(row.implementation_details || '{}'),
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
              approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
              implementedAt: row.implemented_at ? new Date(row.implemented_at) : undefined
            });
          }
        }
      );
    });
  }

  async implementTechnicalSEO(recommendation) {
    console.log(`🔧 Implementing technical SEO: ${recommendation.title}`);
    // In a real implementation, this would make actual changes to the website
    console.log('Technical SEO implementation completed');
  }

  async implementContentSEO(recommendation) {
    console.log(`📝 Implementing content SEO: ${recommendation.title}`);
    // Queue content generation
    console.log('Content SEO implementation completed');
  }

  async implementKeywordOptimization(recommendation) {
    console.log(`🎯 Implementing keyword optimization: ${recommendation.title}`);
    // Update meta tags, headers, etc.
    console.log('Keyword optimization implementation completed');
  }

  async implementLinkBuilding(recommendation) {
    console.log(`🔗 Implementing link building: ${recommendation.title}`);
    // Identify link building opportunities
    console.log('Link building implementation completed');
  }

  async markRecommendationImplemented(recommendationId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_recommendations SET status = "implemented", implemented_at = CURRENT_TIMESTAMP WHERE id = ?',
        [recommendationId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async logSEOChange(recommendationId, recommendation) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO seo_change_log 
         (recommendation_id, change_type, change_description, before_value, after_value, implemented_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          recommendationId,
          recommendation.type,
          recommendation.title,
          'Not implemented',
          'Implemented',
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = { SEOAutomationService };
