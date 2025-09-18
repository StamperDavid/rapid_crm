const express = require('express');
const { TrendingContentService } = require('./TrendingContentServiceCommonJS');

function createTrendingContentApiRoutes(db) {
  const router = express.Router();
  const trendingService = new TrendingContentService(db);

  // ===== TRENDING TOPICS RESEARCH =====

  // Get trending topics for target demographics
  router.get('/trending-topics', async (req, res) => {
    try {
      const { demographics } = req.query;
      const targetDemographics = demographics ? demographics.split(',') : 
        ['transportation', 'fleet-management', 'trucking', 'logistics'];
      
      const trendingTopics = await trendingService.researchTrendingTopics(targetDemographics);
      
      res.json({
        success: true,
        trendingTopics: trendingTopics,
        total: trendingTopics.length
      });
    } catch (error) {
      console.error('Error getting trending topics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== COMPETITOR INTELLIGENCE =====

  // Analyze competitor content strategies
  router.get('/competitor-strategies', async (req, res) => {
    try {
      // Get competitors from database
      const competitors = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM seo_competitors WHERE monitoring_enabled = 1', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const strategies = await trendingService.analyzeCompetitorContentStrategies(competitors);
      
      res.json({
        success: true,
        competitorStrategies: strategies,
        total: strategies.length
      });
    } catch (error) {
      console.error('Error analyzing competitor strategies:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== COST-EFFECTIVE ALTERNATIVES =====

  // Generate cost-effective content alternatives
  router.get('/cost-effective-alternatives', async (req, res) => {
    try {
      const { budget } = req.query;
      const contentBudget = budget ? parseInt(budget) : 5000;

      // Get competitors from database
      const competitors = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM seo_competitors WHERE monitoring_enabled = 1', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const strategies = await trendingService.analyzeCompetitorContentStrategies(competitors);
      const alternatives = await trendingService.generateCostEffectiveAlternatives(strategies, contentBudget);
      
      res.json({
        success: true,
        alternatives: alternatives,
        total: alternatives.length,
        budget: contentBudget
      });
    } catch (error) {
      console.error('Error generating cost-effective alternatives:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== STRATEGIC RECOMMENDATIONS =====

  // Generate comprehensive strategic recommendations
  router.get('/strategic-recommendations', async (req, res) => {
    try {
      const { demographics, budget } = req.query;
      const targetDemographics = demographics ? demographics.split(',') : 
        ['transportation', 'fleet-management', 'trucking', 'logistics'];
      const contentBudget = budget ? parseInt(budget) : 5000;

      // Get trending topics
      const trendingTopics = await trendingService.researchTrendingTopics(targetDemographics);
      
      // Get competitors and analyze strategies
      const competitors = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM seo_competitors WHERE monitoring_enabled = 1', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const strategies = await trendingService.analyzeCompetitorContentStrategies(competitors);
      const alternatives = await trendingService.generateCostEffectiveAlternatives(strategies, contentBudget);
      
      // Generate strategic recommendations
      const recommendations = await trendingService.generateStrategicRecommendations(
        trendingTopics, 
        strategies, 
        alternatives
      );
      
      res.json({
        success: true,
        recommendations: recommendations,
        total: recommendations.length,
        summary: {
          trendingTopics: trendingTopics.length,
          competitorStrategies: strategies.length,
          costEffectiveAlternatives: alternatives.length,
          strategicRecommendations: recommendations.length
        }
      });
    } catch (error) {
      console.error('Error generating strategic recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== DEMOGRAPHIC INSIGHTS =====

  // Get demographic insights for content targeting
  router.get('/demographic-insights', async (req, res) => {
    try {
      const { demographics } = req.query;
      const targetDemographics = demographics ? demographics.split(',') : 
        ['fleet-managers', 'trucking-community', 'logistics-professionals'];
      
      const insights = await trendingService.getDemographicInsights(targetDemographics);
      
      res.json({
        success: true,
        demographicInsights: insights,
        targetDemographics: targetDemographics
      });
    } catch (error) {
      console.error('Error getting demographic insights:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== CONTENT OPPORTUNITY QUEUE =====

  // Queue content opportunities based on trending topics and competitor analysis
  router.post('/queue-opportunities', async (req, res) => {
    try {
      const { demographics, budget, priority } = req.body;
      const targetDemographics = demographics || ['transportation', 'fleet-management', 'trucking', 'logistics'];
      const contentBudget = budget || 5000;
      const priorityFilter = priority || 'high';

      // Get trending topics
      const trendingTopics = await trendingService.researchTrendingTopics(targetDemographics);
      
      // Get competitors and analyze strategies
      const competitors = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM seo_competitors WHERE monitoring_enabled = 1', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const strategies = await trendingService.analyzeCompetitorContentStrategies(competitors);
      const alternatives = await trendingService.generateCostEffectiveAlternatives(strategies, contentBudget);
      
      // Generate strategic recommendations
      const recommendations = await trendingService.generateStrategicRecommendations(
        trendingTopics, 
        strategies, 
        alternatives
      );

      // Filter by priority
      const filteredRecommendations = recommendations.filter(rec => 
        priorityFilter === 'all' || rec.priority === priorityFilter
      );

      // Save to content generation queue
      await trendingService.saveContentOpportunities(filteredRecommendations);
      
      res.json({
        success: true,
        message: `Queued ${filteredRecommendations.length} content opportunities`,
        queued: filteredRecommendations.length,
        total: recommendations.length,
        priority: priorityFilter
      });
    } catch (error) {
      console.error('Error queueing content opportunities:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== COMPETITOR SPY DASHBOARD =====

  // Get comprehensive competitor intelligence dashboard
  router.get('/spy-dashboard', async (req, res) => {
    try {
      // Get competitors from database
      const competitors = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM seo_competitors WHERE monitoring_enabled = 1', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Analyze competitor strategies
      const strategies = await trendingService.analyzeCompetitorContentStrategies(competitors);
      
      // Get trending topics
      const trendingTopics = await trendingService.researchTrendingTopics();
      
      // Generate cost-effective alternatives
      const alternatives = await trendingService.generateCostEffectiveAlternatives(strategies, 5000);
      
      // Get demographic insights
      const demographicInsights = await trendingService.getDemographicInsights();
      
      res.json({
        success: true,
        spyDashboard: {
          competitors: competitors.length,
          competitorStrategies: strategies,
          trendingTopics: trendingTopics.slice(0, 10), // Top 10 trending
          costEffectiveAlternatives: alternatives.slice(0, 5), // Top 5 alternatives
          demographicInsights: demographicInsights,
          summary: {
            totalCompetitors: competitors.length,
            activeStrategies: strategies.length,
            trendingOpportunities: trendingTopics.length,
            costEffectiveOptions: alternatives.length,
            targetDemographics: Object.keys(demographicInsights).length
          }
        }
      });
    } catch (error) {
      console.error('Error getting spy dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createTrendingContentApiRoutes };
