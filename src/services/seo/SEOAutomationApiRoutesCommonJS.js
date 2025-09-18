const { Router } = require('express');
const { SEOAutomationService } = require('./SEOAutomationServiceCommonJS');

function createSEOAutomationApiRoutes(db) {
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

  // ===== CONTENT OPPORTUNITIES =====

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

  // ===== COMPETITOR MANAGEMENT =====

  // Add new competitor
  router.post('/competitors', async (req, res) => {
    try {
      const { domain, company_name, industry, target_keywords, monitoring_enabled } = req.body;
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO seo_competitors (domain, company_name, industry, target_keywords, monitoring_enabled, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
          [domain, company_name, industry, JSON.stringify(target_keywords), monitoring_enabled ? 1 : 0],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
      
      res.json({
        success: true,
        message: 'Competitor added successfully',
        competitor: { id: result.id, domain, company_name, industry, target_keywords, monitoring_enabled }
      });
    } catch (error) {
      console.error('Error adding competitor:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update competitor
  router.put('/competitors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { domain, company_name, industry, target_keywords, monitoring_enabled } = req.body;
      
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE seo_competitors SET domain = ?, company_name = ?, industry = ?, target_keywords = ?, monitoring_enabled = ?, updated_at = datetime("now") WHERE id = ?',
          [domain, company_name, industry, JSON.stringify(target_keywords), monitoring_enabled ? 1 : 0, id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      res.json({
        success: true,
        message: 'Competitor updated successfully'
      });
    } catch (error) {
      console.error('Error updating competitor:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete competitor
  router.delete('/competitors/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM seo_competitors WHERE id = ?',
          [id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      res.json({
        success: true,
        message: 'Competitor deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting competitor:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== KEYWORD TRACKING =====

  // Get keyword rankings
  router.get('/keywords/rankings', async (req, res) => {
    try {
      const rankings = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM keyword_rankings ORDER BY date_recorded DESC LIMIT 100',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      res.json({
        success: true,
        rankings: rankings
      });
    } catch (error) {
      console.error('Error getting keyword rankings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Add keyword tracking
  router.post('/keywords/track', async (req, res) => {
    try {
      const { keyword, competitor_id, current_ranking, target_ranking } = req.body;
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO keyword_rankings (keyword, competitor_id, position, date_recorded) VALUES (?, ?, ?, datetime("now"))',
          [keyword, competitor_id, current_ranking],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
      
      res.json({
        success: true,
        message: 'Keyword tracking added successfully',
        tracking: { id: result.id, keyword, competitor_id, current_ranking, target_ranking }
      });
    } catch (error) {
      console.error('Error adding keyword tracking:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== CONTENT GENERATION QUEUE =====

  // Get content generation queue
  router.get('/content/queue', async (req, res) => {
    try {
      const queue = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM content_generation_queue ORDER BY created_at ASC',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      res.json({
        success: true,
        queue: queue
      });
    } catch (error) {
      console.error('Error getting content generation queue:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Process content generation queue
  router.post('/content/queue/process', async (req, res) => {
    try {
      const { limit = 5 } = req.body;
      
      const queue = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM content_generation_queue WHERE status = "pending" ORDER BY created_at ASC LIMIT ?',
          [limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      // Process each item in queue
      const processed = [];
      for (const item of queue) {
        try {
          // Simulate content generation
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Update status to completed
          await new Promise((resolve, reject) => {
            this.db.run(
              'UPDATE content_generation_queue SET status = "completed", completed_at = datetime("now") WHERE id = ?',
              [item.id],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          processed.push(item);
        } catch (error) {
          console.error(`Error processing content item ${item.id}:`, error);
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${processed.length} content items`,
        processed: processed
      });
    } catch (error) {
      console.error('Error processing content generation queue:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== SEO SETTINGS =====

  // Get SEO settings
  router.get('/settings', async (req, res) => {
    try {
      const settings = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM seo_automation_settings',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.setting_name] = setting.setting_value;
        return acc;
      }, {});
      
      res.json({
        success: true,
        settings: settingsObj
      });
    } catch (error) {
      console.error('Error getting SEO settings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update SEO settings
  router.put('/settings', async (req, res) => {
    try {
      const settings = req.body;
      
      for (const [key, value] of Object.entries(settings)) {
        await new Promise((resolve, reject) => {
          this.db.run(
            'INSERT OR REPLACE INTO seo_automation_settings (setting_name, setting_value, updated_at) VALUES (?, ?, datetime("now"))',
            [key, JSON.stringify(value)],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      
      res.json({
        success: true,
        message: 'SEO settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== SOCIAL MEDIA SEO =====

  // Get social media metrics for all competitors
  router.get('/social/metrics', async (req, res) => {
    try {
      const metrics = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM social_seo_metrics ORDER BY date_recorded DESC LIMIT 100',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      res.json({
        success: true,
        metrics: metrics
      });
    } catch (error) {
      console.error('Error getting social media metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Add social media metrics
  router.post('/social/metrics', async (req, res) => {
    try {
      const { competitor_id, platform, followers, engagement_rate, posts_count, avg_likes, avg_shares } = req.body;
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO social_seo_metrics (competitor_id, platform, followers, engagement_rate, posts_count, avg_likes, avg_shares, date_recorded) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
          [competitor_id, platform, followers, engagement_rate, posts_count, avg_likes, avg_shares],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
      
      res.json({
        success: true,
        message: 'Social media metrics added successfully',
        metrics: { id: result.id, competitor_id, platform, followers, engagement_rate, posts_count, avg_likes, avg_shares }
      });
    } catch (error) {
      console.error('Error adding social media metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get social media recommendations
  router.get('/social/recommendations', async (req, res) => {
    try {
      const recommendations = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM seo_recommendations WHERE type = "social_media" ORDER BY created_at DESC',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      res.json({
        success: true,
        recommendations: recommendations
      });
    } catch (error) {
      console.error('Error getting social media recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== CHANGE LOGGING =====

  // Get SEO change log
  router.get('/changes/log', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      
      const changes = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM seo_change_log ORDER BY created_at DESC LIMIT ?',
          [limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      res.json({
        success: true,
        changes: changes
      });
    } catch (error) {
      console.error('Error getting SEO change log:', error);
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

module.exports = { createSEOAutomationApiRoutes };
