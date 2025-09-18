const { Router } = require('express');
const { CompetitorResearchService } = require('./CompetitorResearchServiceCommonJS');

function createCompetitorResearchApiRoutes(db) {
  const router = Router();
  const researchService = new CompetitorResearchService(db);

  // ===== COMPETITOR MANAGEMENT WITH RESEARCH =====

  // Add competitor with automatic research
  router.post('/add', async (req, res) => {
    try {
      const { domain, companyName, industry = 'transportation' } = req.body;
      
      if (!domain || !companyName) {
        return res.status(400).json({
          success: false,
          error: 'Domain and company name are required'
        });
      }

      console.log(`🔍 Adding competitor with research: ${companyName} (${domain})`);
      
      const result = await researchService.addCompetitorWithResearch(domain, companyName, industry);
      
      res.json(result);
    } catch (error) {
      console.error('Error adding competitor with research:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get all competitors with research data
  router.get('/list', async (req, res) => {
    try {
      const competitors = await researchService.getCompetitors();
      
      // Get research data for each competitor
      const competitorsWithResearch = await Promise.all(
        competitors.map(async (competitor) => {
          try {
            // Get latest SEO metrics
            const seoMetrics = await new Promise((resolve, reject) => {
              db.all(
                `SELECT metric_type, value, date_recorded 
                 FROM seo_metrics 
                 WHERE competitor_id = ? 
                 ORDER BY date_recorded DESC 
                 LIMIT 10`,
                [competitor.id],
                (err, rows) => {
                  if (err) reject(err);
                  else resolve(rows);
                }
              );
            });

            // Get latest social media metrics
            const socialMetrics = await new Promise((resolve, reject) => {
              db.all(
                `SELECT platform, followers, engagement_rate, posts_count, avg_likes, avg_shares, date_recorded
                 FROM social_seo_metrics 
                 WHERE competitor_id = ? 
                 ORDER BY date_recorded DESC 
                 LIMIT 20`,
                [competitor.id],
                (err, rows) => {
                  if (err) reject(err);
                  else resolve(rows);
                }
              );
            });

            // Get keyword rankings
            const keywordRankings = await new Promise((resolve, reject) => {
              db.all(
                `SELECT keyword, position, search_volume, difficulty_score, date_recorded
                 FROM keyword_rankings 
                 WHERE competitor_id = ? 
                 ORDER BY date_recorded DESC 
                 LIMIT 20`,
                [competitor.id],
                (err, rows) => {
                  if (err) reject(err);
                  else resolve(rows);
                }
              );
            });

            return {
              ...competitor,
              research: {
                seoMetrics: seoMetrics,
                socialMetrics: socialMetrics,
                keywordRankings: keywordRankings,
                lastResearched: competitor.last_analyzed
              }
            };
          } catch (error) {
            console.error(`Error getting research data for competitor ${competitor.id}:`, error);
            return {
              ...competitor,
              research: {
                seoMetrics: [],
                socialMetrics: [],
                keywordRankings: [],
                lastResearched: competitor.last_analyzed,
                error: 'Failed to load research data'
              }
            };
          }
        })
      );

      res.json({
        success: true,
        competitors: competitorsWithResearch,
        total: competitorsWithResearch.length
      });
    } catch (error) {
      console.error('Error getting competitors with research:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update competitor
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { domain, companyName, industry } = req.body;
      
      await researchService.updateCompetitor(id, domain, companyName, industry);
      
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
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      await researchService.deleteCompetitor(id);
      
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

  // ===== RESEARCH OPERATIONS =====

  // Re-research a specific competitor
  router.post('/:id/research', async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`🔄 Re-researching competitor ID: ${id}`);
      
      const result = await researchService.reResearchCompetitor(id);
      
      res.json(result);
    } catch (error) {
      console.error('Error re-researching competitor:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Refresh competitor logo
  router.post('/:id/refresh-logo', async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`🔄 Refreshing logo for competitor ID: ${id}`);
      
      const newLogoUrl = await researchService.refreshCompetitorLogo(id);
      
      res.json({
        success: true,
        logoUrl: newLogoUrl,
        message: 'Competitor logo refreshed successfully'
      });
    } catch (error) {
      console.error('Error refreshing competitor logo:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Refresh all competitor logos
  router.post('/refresh-all-logos', async (req, res) => {
    try {
      console.log('🔄 Refreshing all competitor logos...');
      
      const result = await researchService.refreshAllCompetitorLogos();
      
      res.json(result);
    } catch (error) {
      console.error('Error refreshing all competitor logos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Research all competitors
  router.post('/research-all', async (req, res) => {
    try {
      console.log('🔄 Researching all competitors...');
      
      const competitors = await researchService.getCompetitors();
      const results = [];
      
      for (const competitor of competitors) {
        try {
          const result = await researchService.reResearchCompetitor(competitor.id);
          results.push({
            competitor: competitor.company_name,
            success: true,
            result: result
          });
        } catch (error) {
          results.push({
            competitor: competitor.company_name,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Research completed for ${successCount}/${competitors.length} competitors`,
        results: results
      });
    } catch (error) {
      console.error('Error researching all competitors:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== RESEARCH DATA ENDPOINTS =====

  // Get detailed research data for a competitor
  router.get('/:id/research', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get comprehensive research data
      const [seoMetrics, socialMetrics, keywordRankings, contentOpportunities] = await Promise.all([
        new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM seo_metrics WHERE competitor_id = ? ORDER BY date_recorded DESC',
            [id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        }),
        new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM social_seo_metrics WHERE competitor_id = ? ORDER BY date_recorded DESC',
            [id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        }),
        new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM keyword_rankings WHERE competitor_id = ? ORDER BY date_recorded DESC',
            [id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        }),
        new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM content_opportunities WHERE competitor_id = ? ORDER BY opportunity_score DESC',
            [id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        })
      ]);

      res.json({
        success: true,
        research: {
          seoMetrics: seoMetrics,
          socialMetrics: socialMetrics,
          keywordRankings: keywordRankings,
          contentOpportunities: contentOpportunities
        }
      });
    } catch (error) {
      console.error('Error getting competitor research data:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get competitor comparison data
  router.get('/compare', async (req, res) => {
    try {
      const competitors = await researchService.getCompetitors();
      
      const comparisonData = await Promise.all(
        competitors.map(async (competitor) => {
          // Get latest metrics for comparison
          const latestMetrics = await new Promise((resolve, reject) => {
            db.all(
              `SELECT metric_type, value 
               FROM seo_metrics 
               WHERE competitor_id = ? 
               AND date_recorded = (
                 SELECT MAX(date_recorded) 
                 FROM seo_metrics 
                 WHERE competitor_id = ?
               )`,
              [competitor.id, competitor.id],
              (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            );
          });

          const metrics = latestMetrics.reduce((acc, metric) => {
            acc[metric.metric_type] = metric.value;
            return acc;
          }, {});

          return {
            id: competitor.id,
            companyName: competitor.company_name,
            domain: competitor.domain,
            metrics: metrics,
            lastAnalyzed: competitor.last_analyzed
          };
        })
      );

      res.json({
        success: true,
        comparison: comparisonData
      });
    } catch (error) {
      console.error('Error getting competitor comparison:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ===== ANALYTICS ENDPOINTS =====

  // Get competitor budget comparison
  router.get('/budget/comparison', async (req, res) => {
    try {
      const budgetComparison = await researchService.getCompetitorBudgetComparison();
      
      res.json({
        success: true,
        budgetComparison: budgetComparison
      });
    } catch (error) {
      console.error('Error getting competitor budget comparison:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get marketing budget recommendations
  router.get('/budget/recommendations', async (req, res) => {
    try {
      const budgetComparison = await researchService.getCompetitorBudgetComparison();
      
      res.json({
        success: true,
        recommendations: budgetComparison.recommendations,
        statistics: budgetComparison.statistics
      });
    } catch (error) {
      console.error('Error getting budget recommendations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get competitor analytics dashboard
  router.get('/analytics/dashboard', async (req, res) => {
    try {
      const competitors = await researchService.getCompetitors();
      
      // Get summary statistics
      const totalCompetitors = competitors.length;
      const activeCompetitors = competitors.filter(c => c.monitoring_enabled).length;
      
      // Get latest research dates
      const lastResearched = competitors
        .filter(c => c.last_analyzed)
        .sort((a, b) => new Date(b.last_analyzed) - new Date(a.last_analyzed))[0]?.last_analyzed;

      // Get total metrics across all competitors
      const totalMetrics = await new Promise((resolve, reject) => {
        db.all(
          `SELECT 
            COUNT(*) as total_seo_metrics,
            COUNT(DISTINCT competitor_id) as competitors_with_seo,
            MAX(date_recorded) as latest_research
           FROM seo_metrics`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows[0]);
          }
        );
      });

      const totalSocialMetrics = await new Promise((resolve, reject) => {
        db.all(
          `SELECT 
            COUNT(*) as total_social_metrics,
            COUNT(DISTINCT competitor_id) as competitors_with_social,
            COUNT(DISTINCT platform) as platforms_tracked
           FROM social_seo_metrics`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows[0]);
          }
        );
      });

      res.json({
        success: true,
        dashboard: {
          summary: {
            totalCompetitors: totalCompetitors,
            activeCompetitors: activeCompetitors,
            lastResearched: lastResearched
          },
          metrics: {
            seo: totalMetrics,
            social: totalSocialMetrics
          },
          competitors: competitors.map(c => ({
            id: c.id,
            name: c.company_name,
            domain: c.domain,
            lastAnalyzed: c.last_analyzed,
            monitoringEnabled: c.monitoring_enabled
          }))
        }
      });
    } catch (error) {
      console.error('Error getting competitor analytics dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createCompetitorResearchApiRoutes };
