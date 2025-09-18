const { SEOAutomationService } = require('../seo/SEOAutomationServiceCommonJS');

class SEOAutomationAgent {
  constructor(database) {
    this.db = database;
    this.seoService = new SEOAutomationService(database);
    this.isRunning = false;
    this.scheduleInterval = null;
  }

  // ===== AGENT CONTROL =====

  async start() {
    if (this.isRunning) {
      return { success: false, message: 'SEO Automation Agent is already running' };
    }

    this.isRunning = true;
    console.log('🤖 SEO Automation Agent started');

    // Run initial analysis
    await this.runFullAnalysis();

    // Schedule daily tasks
    this.scheduleInterval = setInterval(async () => {
      await this.runDailyTasks();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return { success: true, message: 'SEO Automation Agent started successfully' };
  }

  async stop() {
    if (!this.isRunning) {
      return { success: false, message: 'SEO Automation Agent is not running' };
    }

    this.isRunning = false;
    
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    console.log('🤖 SEO Automation Agent stopped');
    return { success: true, message: 'SEO Automation Agent stopped successfully' };
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: await this.getLastRunTime(),
      nextScheduledRun: this.scheduleInterval ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      stats: await this.getAgentStats()
    };
  }

  // ===== AUTOMATED TASKS =====

  async runFullAnalysis() {
    console.log('🔍 Running full SEO analysis...');
    
    try {
      // 1. Analyze all competitors
      const competitorAnalyses = await this.seoService.analyzeCompetitors();
      console.log(`✅ Analyzed ${competitorAnalyses.length} competitors`);

      // 2. Generate SEO recommendations
      const recommendations = await this.seoService.generateSEORecommendations(competitorAnalyses);
      console.log(`✅ Generated ${recommendations.length} SEO recommendations`);

      // 3. Generate content opportunities
      const contentOpportunities = await this.seoService.generateContentOpportunities(competitorAnalyses);
      console.log(`✅ Generated ${contentOpportunities.length} content opportunities`);

      // 4. Generate social media recommendations
      const socialRecommendations = await this.seoService.generateSocialRecommendations(competitorAnalyses);
      console.log(`✅ Generated ${socialRecommendations.length} social media recommendations`);

      // 5. Log the analysis
      await this.logAgentActivity('full_analysis', {
        competitors_analyzed: competitorAnalyses.length,
        recommendations_generated: recommendations.length,
        content_opportunities: contentOpportunities.length,
        social_recommendations: socialRecommendations.length
      });

      return {
        success: true,
        message: 'Full SEO analysis completed successfully',
        data: {
          competitors: competitorAnalyses.length,
          recommendations: recommendations.length,
          contentOpportunities: contentOpportunities.length,
          socialRecommendations: socialRecommendations.length
        }
      };
    } catch (error) {
      console.error('❌ Error running full SEO analysis:', error);
      await this.logAgentActivity('full_analysis_error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async runDailyTasks() {
    console.log('🌅 Running daily SEO automation tasks...');
    
    try {
      const result = await this.seoService.runDailySEOTasks();
      
      await this.logAgentActivity('daily_tasks', {
        success: result.success,
        tasks_completed: result.tasksCompleted || 0
      });

      return result;
    } catch (error) {
      console.error('❌ Error running daily SEO tasks:', error);
      await this.logAgentActivity('daily_tasks_error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async processContentQueue() {
    console.log('📝 Processing content generation queue...');
    
    try {
      const queue = await this.seoService.getContentOpportunities();
      const pendingItems = queue.filter(item => item.status === 'pending');
      
      let processed = 0;
      for (const item of pendingItems.slice(0, 5)) { // Process up to 5 items
        try {
          await this.seoService.queueContentGeneration(item);
          processed++;
        } catch (error) {
          console.error(`❌ Error processing content item ${item.id}:`, error);
        }
      }

      await this.logAgentActivity('content_queue_processing', {
        items_processed: processed,
        total_pending: pendingItems.length
      });

      return {
        success: true,
        message: `Processed ${processed} content items`,
        processed: processed,
        totalPending: pendingItems.length
      };
    } catch (error) {
      console.error('❌ Error processing content queue:', error);
      await this.logAgentActivity('content_queue_error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async implementApprovedRecommendations() {
    console.log('⚡ Implementing approved SEO recommendations...');
    
    try {
      const pendingRecommendations = await this.seoService.getPendingRecommendations();
      const approvedRecommendations = pendingRecommendations.filter(rec => rec.status === 'approved');
      
      let implemented = 0;
      for (const recommendation of approvedRecommendations.slice(0, 3)) { // Implement up to 3
        try {
          await this.seoService.implementRecommendation(recommendation.id);
          implemented++;
        } catch (error) {
          console.error(`❌ Error implementing recommendation ${recommendation.id}:`, error);
        }
      }

      await this.logAgentActivity('recommendation_implementation', {
        recommendations_implemented: implemented,
        total_approved: approvedRecommendations.length
      });

      return {
        success: true,
        message: `Implemented ${implemented} SEO recommendations`,
        implemented: implemented,
        totalApproved: approvedRecommendations.length
      };
    } catch (error) {
      console.error('❌ Error implementing recommendations:', error);
      await this.logAgentActivity('recommendation_implementation_error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // ===== INTELLIGENT DECISIONS =====

  async makeIntelligentDecisions() {
    console.log('🧠 Making intelligent SEO decisions...');
    
    try {
      const decisions = [];

      // 1. Check for high-priority content opportunities
      const contentOpportunities = await this.seoService.getContentOpportunities();
      const highPriorityContent = contentOpportunities.filter(opp => 
        opp.opportunity_score > 80 && opp.status === 'pending'
      );

      if (highPriorityContent.length > 0) {
        decisions.push({
          type: 'content_generation',
          priority: 'high',
          action: 'queue_high_priority_content',
          items: highPriorityContent.length,
          reasoning: 'High-opportunity content detected that should be prioritized'
        });
      }

      // 2. Check for low-risk recommendations that can be auto-approved
      const pendingRecommendations = await this.seoService.getPendingRecommendations();
      const lowRiskRecommendations = pendingRecommendations.filter(rec => 
        rec.impact_level === 'low' && rec.confidence_score > 0.8
      );

      if (lowRiskRecommendations.length > 0) {
        decisions.push({
          type: 'auto_approval',
          priority: 'medium',
          action: 'auto_approve_low_risk',
          items: lowRiskRecommendations.length,
          reasoning: 'Low-risk, high-confidence recommendations can be auto-approved'
        });
      }

      // 3. Check for competitor changes that require attention
      const competitors = await this.seoService.getActiveCompetitors();
      const staleCompetitors = competitors.filter(comp => {
        if (!comp.last_analyzed) return true;
        const lastAnalyzed = new Date(comp.last_analyzed);
        const daysSinceAnalysis = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceAnalysis > 7; // More than 7 days old
      });

      if (staleCompetitors.length > 0) {
        decisions.push({
          type: 'competitor_analysis',
          priority: 'medium',
          action: 'update_stale_competitors',
          items: staleCompetitors.length,
          reasoning: 'Some competitors have not been analyzed recently'
        });
      }

      await this.logAgentActivity('intelligent_decisions', {
        decisions_made: decisions.length,
        decisions: decisions
      });

      return {
        success: true,
        message: `Made ${decisions.length} intelligent decisions`,
        decisions: decisions
      };
    } catch (error) {
      console.error('❌ Error making intelligent decisions:', error);
      await this.logAgentActivity('intelligent_decisions_error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // ===== UTILITY METHODS =====

  async getLastRunTime() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT created_at FROM seo_change_log WHERE change_type = "agent_activity" ORDER BY created_at DESC LIMIT 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.created_at : null);
        }
      );
    });
  }

  async getAgentStats() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          change_type,
          COUNT(*) as count,
          MAX(created_at) as last_activity
         FROM seo_change_log 
         WHERE change_type LIKE 'agent_%' 
         GROUP BY change_type`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async logAgentActivity(activityType, data) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO seo_change_log (change_type, change_description, change_data, created_at) VALUES (?, ?, ?, datetime("now"))',
        [`agent_${activityType}`, `SEO Agent: ${activityType}`, JSON.stringify(data)],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // ===== AI INTEGRATION =====

  async handleAICommand(command, parameters = {}) {
    console.log(`🤖 AI Command received: ${command}`, parameters);
    
    try {
      switch (command) {
        case 'start_agent':
          return await this.start();
        
        case 'stop_agent':
          return await this.stop();
        
        case 'get_status':
          return await this.getStatus();
        
        case 'run_analysis':
          return await this.runFullAnalysis();
        
        case 'run_daily_tasks':
          return await this.runDailyTasks();
        
        case 'process_content_queue':
          return await this.processContentQueue();
        
        case 'implement_recommendations':
          return await this.implementApprovedRecommendations();
        
        case 'make_decisions':
          return await this.makeIntelligentDecisions();
        
        case 'add_competitor':
          const { domain, company_name, industry, target_keywords } = parameters;
          const competitor = await this.seoService.addCompetitor(domain, company_name, industry, target_keywords);
          return { success: true, message: 'Competitor added successfully', competitor };
        
        case 'get_competitors':
          const competitors = await this.seoService.getActiveCompetitors();
          return { success: true, competitors };
        
        case 'get_recommendations':
          const recommendations = await this.seoService.getPendingRecommendations();
          return { success: true, recommendations };
        
        case 'get_content_opportunities':
          const opportunities = await this.seoService.getContentOpportunities();
          return { success: true, opportunities };
        
        default:
          return { success: false, error: `Unknown command: ${command}` };
      }
    } catch (error) {
      console.error(`❌ Error handling AI command ${command}:`, error);
      await this.logAgentActivity('ai_command_error', { command, error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = { SEOAutomationAgent };
