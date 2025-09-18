const { Router } = require('express');
const { SEOAutomationAgent } = require('./SEOAutomationAgentCommonJS');

function createSEOAutomationAgentApiRoutes(db) {
  const router = Router();
  const seoAgent = new SEOAutomationAgent(db);

  // ===== AGENT CONTROL =====

  // Start SEO automation agent
  router.post('/start', async (req, res) => {
    try {
      const result = await seoAgent.start();
      res.json(result);
    } catch (error) {
      console.error('Error starting SEO automation agent:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Stop SEO automation agent
  router.post('/stop', async (req, res) => {
    try {
      const result = await seoAgent.stop();
      res.json(result);
    } catch (error) {
      console.error('Error stopping SEO automation agent:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get agent status
  router.get('/status', async (req, res) => {
    try {
      const status = await seoAgent.getStatus();
      res.json({
        success: true,
        status: status
      });
    } catch (error) {
      console.error('Error getting SEO automation agent status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== AUTOMATED TASKS =====

  // Run full SEO analysis
  router.post('/analyze', async (req, res) => {
    try {
      const result = await seoAgent.runFullAnalysis();
      res.json(result);
    } catch (error) {
      console.error('Error running full SEO analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Run daily SEO tasks
  router.post('/daily-tasks', async (req, res) => {
    try {
      const result = await seoAgent.runDailyTasks();
      res.json(result);
    } catch (error) {
      console.error('Error running daily SEO tasks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Process content generation queue
  router.post('/process-content-queue', async (req, res) => {
    try {
      const result = await seoAgent.processContentQueue();
      res.json(result);
    } catch (error) {
      console.error('Error processing content queue:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Implement approved recommendations
  router.post('/implement-recommendations', async (req, res) => {
    try {
      const result = await seoAgent.implementApprovedRecommendations();
      res.json(result);
    } catch (error) {
      console.error('Error implementing recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Make intelligent decisions
  router.post('/make-decisions', async (req, res) => {
    try {
      const result = await seoAgent.makeIntelligentDecisions();
      res.json(result);
    } catch (error) {
      console.error('Error making intelligent decisions:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== AI INTEGRATION =====

  // Handle AI commands
  router.post('/ai-command', async (req, res) => {
    try {
      const { command, parameters } = req.body;
      
      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Command is required'
        });
      }

      const result = await seoAgent.handleAICommand(command, parameters);
      res.json(result);
    } catch (error) {
      console.error('Error handling AI command:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== QUICK ACTIONS =====

  // Add competitor via agent
  router.post('/add-competitor', async (req, res) => {
    try {
      const { domain, company_name, industry, target_keywords } = req.body;
      
      const result = await seoAgent.handleAICommand('add_competitor', {
        domain,
        company_name,
        industry,
        target_keywords
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error adding competitor via agent:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get agent dashboard data
  router.get('/dashboard', async (req, res) => {
    try {
      const [status, competitors, recommendations, opportunities] = await Promise.all([
        seoAgent.getStatus(),
        seoAgent.handleAICommand('get_competitors'),
        seoAgent.handleAICommand('get_recommendations'),
        seoAgent.handleAICommand('get_content_opportunities')
      ]);

      const dashboard = {
        agent: status,
        competitors: competitors.competitors || [],
        recommendations: recommendations.recommendations || [],
        contentOpportunities: opportunities.opportunities || []
      };

      res.json({
        success: true,
        dashboard: dashboard
      });
    } catch (error) {
      console.error('Error getting agent dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createSEOAutomationAgentApiRoutes };
