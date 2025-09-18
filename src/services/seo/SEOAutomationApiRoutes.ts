import { Router } from 'express';
import { SEOAutomationService } from './SEOAutomationService';
import { Database } from 'sqlite3';

export function createSEOAutomationApiRoutes(db: Database) {
  const router = Router();
  const seoService = new SEOAutomationService(db);

  // ===== COMPETITOR ANALYSIS =====

  // Get all competitors
  router.get('/competitors', async (req, res) => {
    try {
      const competitors = await seoService.getActiveCompetitors();
      res.json({
        success: true,
        competitors: competitors
      });
    } catch (error) {
      console.error('Error getting competitors:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Analyze all competitors
  router.post('/competitors/analyze', async (req, res) => {
    try {
      console.log('🔍 Starting competitor analysis...');
      const analyses = await seoService.analyzeCompetitors();
      
      res.json({
        success: true,
        message: `Analyzed ${analyses.length} competitors`,
        analyses: analyses
      });
    } catch (error) {
      console.error('Error analyzing competitors:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== SEO RECOMMENDATIONS =====

  // Get pending recommendations
  router.get('/recommendations/pending', async (req, res) => {
    try {
      const recommendations = await seoService.getPendingRecommendations();
      res.json({
        success: true,
        recommendations: recommendations
      });
    } catch (error) {
      console.error('Error getting pending recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Approve a recommendation
  router.post('/recommendations/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      
      await seoService.approveRecommendation(parseInt(id), approvedBy);
      
      res.json({
        success: true,
        message: 'Recommendation approved successfully'
      });
    } catch (error) {
      console.error('Error approving recommendation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Implement a recommendation
  router.post('/recommendations/:id/implement', async (req, res) => {
    try {
      const { id } = req.params;
      
      await seoService.implementRecommendation(parseInt(id));
      
      res.json({
        success: true,
        message: 'Recommendation implemented successfully'
      });
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== CONTENT GENERATION =====

  // Get content opportunities
  router.get('/content/opportunities', async (req, res) => {
    try {
      const opportunities = await seoService.getContentOpportunities();
      res.json({
        success: true,
        opportunities: opportunities
      });
    } catch (error) {
      console.error('Error getting content opportunities:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Queue content generation
  router.post('/content/queue', async (req, res) => {
    try {
      const { opportunityId } = req.body;
      
      // Get the opportunity first
      const opportunity = await seoService.getContentOpportunity(opportunityId);
      if (!opportunity) {
        return res.status(404).json({
          success: false,
          error: 'Content opportunity not found'
        });
      }
      
      await seoService.queueContentGeneration(opportunity);
      
      res.json({
        success: true,
        message: 'Content generation queued successfully'
      });
    } catch (error) {
      console.error('Error queuing content generation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== AUTOMATED TASKS =====

  // Run daily SEO tasks
  router.post('/tasks/daily', async (req, res) => {
    try {
      console.log('🌅 Running daily SEO automation tasks...');
      const result = await seoService.runDailySEOTasks();
      
      res.json({
        success: result.success,
        message: result.success ? 'Daily SEO tasks completed successfully' : 'Daily SEO tasks failed',
        data: result
      });
    } catch (error) {
      console.error('Error running daily SEO tasks:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== SOCIAL MEDIA SEO =====

  // Generate social media SEO report
  router.get('/social/report', async (req, res) => {
    try {
      const report = await seoService.generateSocialSEOReport();
      
      res.json({
        success: true,
        report: report
      });
    } catch (error) {
      console.error('Error generating social SEO report:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== DASHBOARD DATA =====

  // Get SEO dashboard overview
  router.get('/dashboard/overview', async (req, res) => {
    try {
      const competitors = await seoService.getActiveCompetitors();
      const pendingRecommendations = await seoService.getPendingRecommendations();
      const contentOpportunities = await seoService.getContentOpportunities();
      
      const overview = {
        competitors: {
          total: competitors.length,
          lastAnalyzed: competitors.reduce((latest, comp) => {
            if (!comp.last_analyzed) return latest;
            const analyzed = new Date(comp.last_analyzed);
            return !latest || analyzed > latest ? analyzed : latest;
          }, null)
        },
        recommendations: {
          pending: pendingRecommendations.length,
          highPriority: pendingRecommendations.filter(r => r.priority === 'high').length,
          byType: pendingRecommendations.reduce((acc, rec) => {
            acc[rec.type] = (acc[rec.type] || 0) + 1;
            return acc;
          }, {})
        },
        content: {
          opportunities: contentOpportunities.length,
          highPriority: contentOpportunities.filter(o => o.priority === 'high').length,
          queued: contentOpportunities.filter(o => o.status === 'queued').length
        }
      };
      
      res.json({
        success: true,
        overview: overview
      });
    } catch (error) {
      console.error('Error getting SEO dashboard overview:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
