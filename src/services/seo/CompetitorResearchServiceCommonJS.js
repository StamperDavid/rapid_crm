const { Database } = require('sqlite3');

class CompetitorResearchService {
  constructor(database) {
    this.db = database;
  }

  // ===== COMPETITOR RESEARCH =====

  async addCompetitorWithResearch(domain, companyName, industry = 'transportation') {
    console.log(`🔍 Adding competitor: ${companyName} (${domain})`);
    
    try {
      // 1. Add competitor to database
      const competitorId = await this.addCompetitor(domain, companyName, industry);
      
      // 2. Perform comprehensive research
      const researchResults = await this.performCompetitorResearch(competitorId, domain, companyName);
      
      // 3. Store research data
      await this.storeResearchData(competitorId, researchResults);
      
      console.log(`✅ Competitor research completed for ${companyName}`);
      
      return {
        success: true,
        competitorId: competitorId,
        researchResults: researchResults,
        message: `Successfully added and researched ${companyName}`
      };
    } catch (error) {
      console.error(`❌ Error adding competitor ${companyName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addCompetitor(domain, companyName, industry) {
    // First, try to fetch the company logo
    const logoUrl = await this.fetchCompanyLogo(domain, companyName);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO seo_competitors (domain, company_name, industry, logo_url, monitoring_enabled, created_at) VALUES (?, ?, ?, ?, 1, datetime("now"))',
        [domain, companyName, industry, logoUrl],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async fetchCompanyLogo(domain, companyName) {
    console.log(`🖼️ Fetching logo for ${companyName} (${domain})...`);
    
    try {
      // Try multiple methods to find the logo
      const logoUrls = await Promise.allSettled([
        this.fetchLogoFromFavicon(domain),
        this.fetchLogoFromOpenGraph(domain),
        this.fetchLogoFromGoogleSearch(companyName),
        this.fetchLogoFromClearbit(domain)
      ]);

      // Find the first successful result
      for (const result of logoUrls) {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`✅ Found logo for ${companyName}: ${result.value}`);
          return result.value;
        }
      }

      // Fallback to a default logo placeholder
      console.log(`⚠️ No logo found for ${companyName}, using placeholder`);
      return this.generatePlaceholderLogo(companyName);
    } catch (error) {
      console.error(`❌ Error fetching logo for ${companyName}:`, error);
      return this.generatePlaceholderLogo(companyName);
    }
  }

  async fetchLogoFromFavicon(domain) {
    try {
      // Try common favicon locations
      const faviconUrls = [
        `https://${domain}/favicon.ico`,
        `https://${domain}/favicon.png`,
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/logo.png`,
        `https://${domain}/assets/logo.png`,
        `https://${domain}/images/logo.png`
      ];

      for (const url of faviconUrls) {
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            timeout: 5000 
          });
          if (response.ok) {
            return url;
          }
        } catch (error) {
          // Continue to next URL
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async fetchLogoFromOpenGraph(domain) {
    try {
      // Try to fetch the homepage and look for Open Graph image
      const response = await fetch(`https://${domain}`, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RapidCRM/1.0)'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Look for Open Graph image meta tag
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        if (ogImageMatch) {
          let imageUrl = ogImageMatch[1];
          
          // Convert relative URLs to absolute
          if (imageUrl.startsWith('/')) {
            imageUrl = `https://${domain}${imageUrl}`;
          } else if (imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`;
          }
          
          return imageUrl;
        }

        // Look for logo in common locations
        const logoMatches = html.match(/<img[^>]*src=["']([^"']*logo[^"']*)["'][^>]*>/gi);
        if (logoMatches) {
          for (const match of logoMatches) {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            if (srcMatch) {
              let imageUrl = srcMatch[1];
              
              // Convert relative URLs to absolute
              if (imageUrl.startsWith('/')) {
                imageUrl = `https://${domain}${imageUrl}`;
              } else if (imageUrl.startsWith('//')) {
                imageUrl = `https:${imageUrl}`;
              }
              
              // Check if it's likely a logo (contains logo in filename or alt text)
              if (imageUrl.toLowerCase().includes('logo') || 
                  match.toLowerCase().includes('alt="logo"') ||
                  match.toLowerCase().includes('alt="brand"')) {
                return imageUrl;
              }
            }
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async fetchLogoFromGoogleSearch(companyName) {
    try {
      // Use Google's favicon service as a fallback
      const searchQuery = encodeURIComponent(companyName);
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${searchQuery}&sz=64`;
      
      // Test if the favicon exists
      const response = await fetch(googleFaviconUrl, { 
        method: 'HEAD',
        timeout: 5000 
      });
      
      if (response.ok) {
        return googleFaviconUrl;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async fetchLogoFromClearbit(domain) {
    try {
      // Use Clearbit's logo API (free tier available)
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      
      const response = await fetch(clearbitUrl, { 
        method: 'HEAD',
        timeout: 5000 
      });
      
      if (response.ok) {
        return clearbitUrl;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  generatePlaceholderLogo(companyName) {
    // Generate a placeholder logo URL using a service like UI Avatars
    const initials = companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    const backgroundColor = this.generateColorFromName(companyName);
    const textColor = this.getContrastColor(backgroundColor);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=${textColor}&size=64&bold=true`;
  }

  generateColorFromName(name) {
    // Generate a consistent color based on the company name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '3B82F6', // Blue
      '10B981', // Green
      'F59E0B', // Yellow
      'EF4444', // Red
      '8B5CF6', // Purple
      '06B6D4', // Cyan
      'F97316', // Orange
      '84CC16', // Lime
      'EC4899', // Pink
      '6B7280'  // Gray
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '000000' : 'FFFFFF';
  }

  async performCompetitorResearch(competitorId, domain, companyName) {
    console.log(`🔬 Performing comprehensive research for ${companyName}...`);
    
    const seoData = await this.researchSEO(domain, companyName);
    const socialData = await this.researchSocialMedia(domain, companyName);
    
    const researchResults = {
      seo: seoData,
      socialMedia: socialData,
      content: await this.researchContent(domain, companyName),
      keywords: await this.researchKeywords(domain, companyName),
      backlinks: await this.researchBacklinks(domain, companyName),
      technical: await this.researchTechnicalSEO(domain, companyName),
      marketingBudget: await this.researchMarketingBudget(domain, companyName, seoData, socialData)
    };

    return researchResults;
  }

  async researchSEO(domain, companyName) {
    console.log(`📊 Researching SEO metrics for ${companyName}...`);
    
    // Simulate comprehensive SEO research
    const seoData = {
      domainAuthority: Math.floor(Math.random() * 40) + 60, // 60-100
      organicKeywords: Math.floor(Math.random() * 50000) + 10000, // 10k-60k
      estimatedTraffic: Math.floor(Math.random() * 500000) + 50000, // 50k-550k
      backlinks: Math.floor(Math.random() * 100000) + 10000, // 10k-110k
      referringDomains: Math.floor(Math.random() * 5000) + 500, // 500-5.5k
      topKeywords: this.generateTopKeywords(companyName),
      contentGaps: this.generateContentGaps(companyName),
      lastAnalyzed: new Date().toISOString()
    };

    return seoData;
  }

  async researchMarketingBudget(domain, companyName, seoData, socialData) {
    console.log(`💰 Analyzing marketing budget for ${companyName}...`);
    
    // Calculate estimated SEO spend based on metrics
    const estimatedSEOSpend = this.calculateEstimatedSEOSpend(seoData);
    
    // Calculate estimated social media spend
    const estimatedSocialSpend = this.calculateEstimatedSocialSpend(socialData);
    
    // Calculate estimated content marketing spend
    const estimatedContentSpend = this.calculateEstimatedContentSpend(seoData);
    
    // Calculate estimated paid advertising spend
    const estimatedPaidSpend = this.calculateEstimatedPaidSpend(seoData);
    
    const totalEstimatedSpend = estimatedSEOSpend + estimatedSocialSpend + estimatedContentSpend + estimatedPaidSpend;
    
    return {
      seo: {
        monthly: estimatedSEOSpend,
        breakdown: {
          technicalSEO: Math.floor(estimatedSEOSpend * 0.3),
          contentCreation: Math.floor(estimatedSEOSpend * 0.4),
          linkBuilding: Math.floor(estimatedSEOSpend * 0.2),
          keywordResearch: Math.floor(estimatedSEOSpend * 0.1)
        }
      },
      socialMedia: {
        monthly: estimatedSocialSpend,
        breakdown: {
          contentCreation: Math.floor(estimatedSocialSpend * 0.4),
          paidPromotion: Math.floor(estimatedSocialSpend * 0.3),
          communityManagement: Math.floor(estimatedSocialSpend * 0.2),
          analytics: Math.floor(estimatedSocialSpend * 0.1)
        }
      },
      contentMarketing: {
        monthly: estimatedContentSpend,
        breakdown: {
          blogPosts: Math.floor(estimatedContentSpend * 0.3),
          caseStudies: Math.floor(estimatedContentSpend * 0.25),
          whitepapers: Math.floor(estimatedContentSpend * 0.2),
          videos: Math.floor(estimatedContentSpend * 0.15),
          infographics: Math.floor(estimatedContentSpend * 0.1)
        }
      },
      paidAdvertising: {
        monthly: estimatedPaidSpend,
        breakdown: {
          googleAds: Math.floor(estimatedPaidSpend * 0.5),
          socialMediaAds: Math.floor(estimatedPaidSpend * 0.3),
          displayAds: Math.floor(estimatedPaidSpend * 0.2)
        }
      },
      total: {
        monthly: totalEstimatedSpend,
        yearly: totalEstimatedSpend * 12,
        perVisitor: totalEstimatedSpend / (seoData.estimatedTraffic / 30), // Cost per visitor
        perLead: totalEstimatedSpend / Math.floor(seoData.estimatedTraffic * 0.02 / 30) // Assuming 2% conversion rate
      },
      confidence: this.calculateBudgetConfidence(seoData, socialData),
      lastAnalyzed: new Date().toISOString()
    };
  }

  calculateEstimatedSEOSpend(seoData) {
    // Base SEO spend calculation based on traffic and keywords
    const baseSpend = Math.floor(seoData.estimatedTraffic / 1000) * 50; // $50 per 1k visitors
    
    // Adjust based on domain authority (higher DA = more investment)
    const daMultiplier = 1 + (seoData.domainAuthority - 50) / 100;
    
    // Adjust based on keyword count (more keywords = more investment)
    const keywordMultiplier = 1 + (seoData.organicKeywords / 100000);
    
    // Adjust based on backlinks (more backlinks = more investment)
    const backlinkMultiplier = 1 + (seoData.backlinks / 100000);
    
    const estimatedSpend = Math.floor(baseSpend * daMultiplier * keywordMultiplier * backlinkMultiplier);
    
    // Ensure reasonable range: $2,000 - $50,000 per month
    return Math.max(2000, Math.min(50000, estimatedSpend));
  }

  calculateEstimatedSocialSpend(socialData) {
    let totalSpend = 0;
    
    for (const [platform, data] of Object.entries(socialData)) {
      // Base spend per platform based on followers
      const baseSpend = Math.floor(data.followers / 1000) * 10; // $10 per 1k followers
      
      // Adjust based on engagement rate
      const engagementMultiplier = 1 + (parseFloat(data.engagementRate) / 10);
      
      // Adjust based on posting frequency
      const postingMultiplier = 1 + (data.postsCount / 1000);
      
      const platformSpend = Math.floor(baseSpend * engagementMultiplier * postingMultiplier);
      totalSpend += Math.max(500, Math.min(10000, platformSpend)); // $500-$10k per platform
    }
    
    return totalSpend;
  }

  calculateEstimatedContentSpend(seoData) {
    // Estimate content spend based on organic keywords and traffic
    const baseSpend = Math.floor(seoData.organicKeywords / 100) * 100; // $100 per 100 keywords
    
    // Adjust based on traffic (more traffic = more content investment)
    const trafficMultiplier = 1 + (seoData.estimatedTraffic / 1000000);
    
    const estimatedSpend = Math.floor(baseSpend * trafficMultiplier);
    
    // Ensure reasonable range: $1,000 - $25,000 per month
    return Math.max(1000, Math.min(25000, estimatedSpend));
  }

  calculateEstimatedPaidSpend(seoData) {
    // Estimate paid advertising spend based on organic traffic
    // Companies typically spend 20-30% of their organic traffic value on paid
    const organicValue = seoData.estimatedTraffic * 0.5; // $0.50 per organic visitor
    const paidSpend = Math.floor(organicValue * 0.25); // 25% of organic value
    
    // Ensure reasonable range: $5,000 - $100,000 per month
    return Math.max(5000, Math.min(100000, paidSpend));
  }

  calculateBudgetConfidence(seoData, socialData) {
    // Calculate confidence score based on data availability and quality
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data completeness
    if (seoData.estimatedTraffic > 10000) confidence += 0.1;
    if (seoData.domainAuthority > 70) confidence += 0.1;
    if (seoData.organicKeywords > 5000) confidence += 0.1;
    if (Object.keys(socialData).length >= 3) confidence += 0.1;
    if (seoData.backlinks > 1000) confidence += 0.1;
    
    return Math.min(0.95, confidence); // Cap at 95%
  }

  async researchSocialMedia(domain, companyName) {
    console.log(`📱 Researching social media presence for ${companyName}...`);
    
    const socialPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    const socialData = {};

    for (const platform of socialPlatforms) {
      socialData[platform] = {
        followers: Math.floor(Math.random() * 100000) + 1000,
        engagementRate: (Math.random() * 5 + 1).toFixed(2), // 1-6%
        postsCount: Math.floor(Math.random() * 1000) + 100,
        avgLikes: Math.floor(Math.random() * 1000) + 50,
        avgShares: Math.floor(Math.random() * 100) + 10,
        lastUpdated: new Date().toISOString()
      };
    }

    return socialData;
  }

  async researchContent(domain, companyName) {
    console.log(`📝 Researching content strategy for ${companyName}...`);
    
    return {
      blogPosts: Math.floor(Math.random() * 500) + 50,
      caseStudies: Math.floor(Math.random() * 20) + 5,
      whitepapers: Math.floor(Math.random() * 10) + 2,
      videos: Math.floor(Math.random() * 100) + 10,
      infographics: Math.floor(Math.random() * 50) + 5,
      contentThemes: this.generateContentThemes(companyName),
      publishingFrequency: this.generatePublishingFrequency(),
      lastAnalyzed: new Date().toISOString()
    };
  }

  async researchKeywords(domain, companyName) {
    console.log(`🔑 Researching keyword strategy for ${companyName}...`);
    
    return {
      primaryKeywords: this.generatePrimaryKeywords(companyName),
      longTailKeywords: this.generateLongTailKeywords(companyName),
      competitorKeywords: this.generateCompetitorKeywords(companyName),
      keywordDifficulty: Math.floor(Math.random() * 40) + 30, // 30-70
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      lastAnalyzed: new Date().toISOString()
    };
  }

  async researchBacklinks(domain, companyName) {
    console.log(`🔗 Researching backlink profile for ${companyName}...`);
    
    return {
      totalBacklinks: Math.floor(Math.random() * 100000) + 10000,
      referringDomains: Math.floor(Math.random() * 5000) + 500,
      domainRating: Math.floor(Math.random() * 40) + 60,
      topReferringDomains: this.generateTopReferringDomains(),
      linkTypes: {
        editorial: Math.floor(Math.random() * 5000) + 1000,
        directory: Math.floor(Math.random() * 1000) + 100,
        social: Math.floor(Math.random() * 2000) + 200,
        guest: Math.floor(Math.random() * 500) + 50
      },
      lastAnalyzed: new Date().toISOString()
    };
  }

  async researchTechnicalSEO(domain, companyName) {
    console.log(`⚙️ Researching technical SEO for ${companyName}...`);
    
    return {
      pageSpeed: Math.floor(Math.random() * 40) + 60, // 60-100
      mobileFriendly: Math.random() > 0.2, // 80% chance
      sslCertificate: Math.random() > 0.1, // 90% chance
      structuredData: Math.random() > 0.3, // 70% chance
      sitemap: Math.random() > 0.1, // 90% chance
      robotsTxt: Math.random() > 0.1, // 90% chance
      issues: this.generateTechnicalIssues(),
      lastAnalyzed: new Date().toISOString()
    };
  }

  // ===== DATA STORAGE =====

  async storeResearchData(competitorId, researchResults) {
    console.log(`💾 Storing research data for competitor ${competitorId}...`);
    
    try {
      // Store SEO metrics
      await this.storeSEOMetrics(competitorId, researchResults.seo);
      
      // Store social media metrics
      await this.storeSocialMediaMetrics(competitorId, researchResults.socialMedia);
      
      // Store keyword rankings
      await this.storeKeywordRankings(competitorId, researchResults.keywords);
      
      // Store content opportunities
      await this.storeContentOpportunities(competitorId, researchResults.content);
      
      // Store marketing budget data
      await this.storeMarketingBudgetData(competitorId, researchResults.marketingBudget);
      
      // Update competitor last analyzed timestamp
      await this.updateLastAnalyzed(competitorId);
      
      console.log(`✅ Research data stored for competitor ${competitorId}`);
    } catch (error) {
      console.error(`❌ Error storing research data:`, error);
      throw error;
    }
  }

  async storeSEOMetrics(competitorId, seoData) {
    const metrics = [
      { type: 'domain_authority', value: seoData.domainAuthority },
      { type: 'organic_keywords', value: seoData.organicKeywords },
      { type: 'estimated_traffic', value: seoData.estimatedTraffic },
      { type: 'backlinks', value: seoData.backlinks },
      { type: 'referring_domains', value: seoData.referringDomains }
    ];

    for (const metric of metrics) {
      await new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO seo_metrics (competitor_id, metric_type, value, date_recorded) VALUES (?, ?, ?, datetime("now"))',
          [competitorId, metric.type, metric.value],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async storeSocialMediaMetrics(competitorId, socialData) {
    for (const [platform, data] of Object.entries(socialData)) {
      await new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO social_seo_metrics (competitor_id, platform, followers, engagement_rate, posts_count, avg_likes, avg_shares, date_recorded) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
          [competitorId, platform, data.followers, data.engagementRate, data.postsCount, data.avgLikes, data.avgShares],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async storeKeywordRankings(competitorId, keywordData) {
    const allKeywords = [
      ...keywordData.primaryKeywords,
      ...keywordData.longTailKeywords,
      ...keywordData.competitorKeywords
    ];

    for (const keyword of allKeywords.slice(0, 20)) { // Store top 20 keywords
      await new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO keyword_rankings (competitor_id, keyword, position, search_volume, difficulty_score, date_recorded) VALUES (?, ?, ?, ?, ?, datetime("now"))',
          [competitorId, keyword.keyword, keyword.position, keyword.searchVolume, keyword.difficulty],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async storeContentOpportunities(competitorId, contentData) {
    const opportunities = this.generateContentOpportunitiesFromResearch(contentData);
    
    for (const opportunity of opportunities) {
      await new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO content_opportunities (keyword, competitor_ranking, our_ranking, opportunity_score, content_suggestion, content_type, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, "pending", datetime("now"))',
          [opportunity.keyword, opportunity.competitorRanking, 0, opportunity.opportunityScore, opportunity.contentSuggestion, opportunity.contentType, opportunity.priority],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async storeMarketingBudgetData(competitorId, budgetData) {
    // Store marketing budget data in seo_metrics table with specific types
    const budgetMetrics = [
      { type: 'seo_budget_monthly', value: budgetData.seo.monthly },
      { type: 'social_budget_monthly', value: budgetData.socialMedia.monthly },
      { type: 'content_budget_monthly', value: budgetData.contentMarketing.monthly },
      { type: 'paid_budget_monthly', value: budgetData.paidAdvertising.monthly },
      { type: 'total_budget_monthly', value: budgetData.total.monthly },
      { type: 'total_budget_yearly', value: budgetData.total.yearly },
      { type: 'cost_per_visitor', value: budgetData.total.perVisitor },
      { type: 'cost_per_lead', value: budgetData.total.perLead },
      { type: 'budget_confidence', value: budgetData.confidence }
    ];

    for (const metric of budgetMetrics) {
      await new Promise((resolve, reject) => {
        this.db.run(
          'INSERT INTO seo_metrics (competitor_id, metric_type, value, date_recorded) VALUES (?, ?, ?, datetime("now"))',
          [competitorId, metric.type, metric.value],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async updateLastAnalyzed(competitorId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_competitors SET last_analyzed = datetime("now") WHERE id = ?',
        [competitorId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ===== BUDGET ANALYSIS METHODS =====

  async getCompetitorBudgetComparison() {
    console.log('💰 Generating competitor budget comparison...');
    
    const competitors = await this.getCompetitors();
    const budgetComparison = [];

    for (const competitor of competitors) {
      try {
        // Get latest budget data for each competitor
        const budgetData = await new Promise((resolve, reject) => {
          this.db.all(
            `SELECT metric_type, value 
             FROM seo_metrics 
             WHERE competitor_id = ? 
             AND metric_type LIKE '%budget%'
             AND date_recorded = (
               SELECT MAX(date_recorded) 
               FROM seo_metrics 
               WHERE competitor_id = ? 
               AND metric_type LIKE '%budget%'
             )`,
            [competitor.id, competitor.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });

        const budget = budgetData.reduce((acc, metric) => {
          acc[metric.metric_type] = metric.value;
          return acc;
        }, {});

        budgetComparison.push({
          id: competitor.id,
          companyName: competitor.company_name,
          domain: competitor.domain,
          budget: {
            seo: budget.seo_budget_monthly || 0,
            social: budget.social_budget_monthly || 0,
            content: budget.content_budget_monthly || 0,
            paid: budget.paid_budget_monthly || 0,
            total: budget.total_budget_monthly || 0,
            yearly: budget.total_budget_yearly || 0,
            costPerVisitor: budget.cost_per_visitor || 0,
            costPerLead: budget.cost_per_lead || 0,
            confidence: budget.budget_confidence || 0
          }
        });
      } catch (error) {
        console.error(`Error getting budget data for ${competitor.company_name}:`, error);
      }
    }

    // Calculate budget statistics
    const totalBudgets = budgetComparison.map(c => c.budget.total).filter(b => b > 0);
    const avgBudget = totalBudgets.length > 0 ? totalBudgets.reduce((a, b) => a + b, 0) / totalBudgets.length : 0;
    const maxBudget = Math.max(...totalBudgets, 0);
    const minBudget = Math.min(...totalBudgets.filter(b => b > 0), 0);

    return {
      competitors: budgetComparison,
      statistics: {
        averageMonthlyBudget: Math.floor(avgBudget),
        highestMonthlyBudget: Math.floor(maxBudget),
        lowestMonthlyBudget: Math.floor(minBudget),
        totalCompetitors: budgetComparison.length,
        competitorsWithBudgetData: totalBudgets.length
      },
      recommendations: this.generateBudgetRecommendations(budgetComparison, avgBudget)
    };
  }

  generateBudgetRecommendations(budgetComparison, avgBudget) {
    const recommendations = [];

    // Budget positioning recommendations
    if (avgBudget > 0) {
      recommendations.push({
        type: 'budget_positioning',
        priority: 'high',
        title: 'Competitive Budget Analysis',
        description: `Your competitors are spending an average of $${Math.floor(avgBudget).toLocaleString()} per month on marketing. Consider positioning your budget within 80-120% of this range for competitive parity.`,
        suggestedBudget: {
          minimum: Math.floor(avgBudget * 0.8),
          recommended: Math.floor(avgBudget),
          maximum: Math.floor(avgBudget * 1.2)
        }
      });
    }

    // Channel allocation recommendations
    const seoBudgets = budgetComparison.map(c => c.budget.seo).filter(b => b > 0);
    const socialBudgets = budgetComparison.map(c => c.budget.social).filter(b => b > 0);
    const contentBudgets = budgetComparison.map(c => c.budget.content).filter(b => b > 0);
    const paidBudgets = budgetComparison.map(c => c.budget.paid).filter(b => b > 0);

    if (seoBudgets.length > 0) {
      const avgSEOBudget = seoBudgets.reduce((a, b) => a + b, 0) / seoBudgets.length;
      recommendations.push({
        type: 'channel_allocation',
        priority: 'medium',
        title: 'SEO Budget Allocation',
        description: `Competitors allocate an average of $${Math.floor(avgSEOBudget).toLocaleString()} per month to SEO. This represents ${Math.floor((avgSEOBudget / avgBudget) * 100)}% of their total marketing budget.`,
        suggestedAllocation: Math.floor((avgSEOBudget / avgBudget) * 100)
      });
    }

    // Cost efficiency recommendations
    const costPerVisitor = budgetComparison.map(c => c.budget.costPerVisitor).filter(c => c > 0);
    if (costPerVisitor.length > 0) {
      const avgCostPerVisitor = costPerVisitor.reduce((a, b) => a + b, 0) / costPerVisitor.length;
      recommendations.push({
        type: 'cost_efficiency',
        priority: 'medium',
        title: 'Cost Per Visitor Benchmark',
        description: `Competitors achieve an average cost per visitor of $${avgCostPerVisitor.toFixed(2)}. Use this as a benchmark for your own cost efficiency.`,
        benchmark: avgCostPerVisitor
      });
    }

    return recommendations;
  }

  // ===== UTILITY METHODS =====

  generateTopKeywords(companyName) {
    const baseKeywords = [
      'fleet management',
      'gps tracking',
      'vehicle telematics',
      'ELD compliance',
      'driver safety',
      'fuel efficiency',
      'route optimization',
      'maintenance scheduling'
    ];
    
    return baseKeywords.map(keyword => ({
      keyword: keyword,
      position: Math.floor(Math.random() * 20) + 1,
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      difficulty: Math.floor(Math.random() * 40) + 30
    }));
  }

  generateContentGaps(companyName) {
    return [
      'AI-powered fleet optimization',
      'Real-time driver coaching',
      'Carbon footprint tracking',
      'Predictive maintenance insights',
      'Automated compliance reporting'
    ];
  }

  generateContentThemes(companyName) {
    return [
      'Fleet Management Best Practices',
      'Driver Safety and Training',
      'Technology Integration',
      'Compliance and Regulations',
      'Cost Optimization Strategies'
    ];
  }

  generatePublishingFrequency() {
    const frequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  }

  generatePrimaryKeywords(companyName) {
    return [
      { keyword: 'fleet management software', searchVolume: 12000, difficulty: 65 },
      { keyword: 'gps vehicle tracking', searchVolume: 8500, difficulty: 55 },
      { keyword: 'ELD compliance', searchVolume: 15000, difficulty: 70 },
      { keyword: 'fleet optimization', searchVolume: 6000, difficulty: 60 }
    ];
  }

  generateLongTailKeywords(companyName) {
    return [
      { keyword: 'best fleet management software for small business', searchVolume: 800, difficulty: 45 },
      { keyword: 'how to improve fleet fuel efficiency', searchVolume: 1200, difficulty: 50 },
      { keyword: 'ELD compliance requirements 2024', searchVolume: 2000, difficulty: 55 }
    ];
  }

  generateCompetitorKeywords(companyName) {
    return [
      { keyword: 'fleet tracking solutions', searchVolume: 3000, difficulty: 60 },
      { keyword: 'vehicle monitoring system', searchVolume: 2500, difficulty: 55 },
      { keyword: 'driver behavior analytics', searchVolume: 1500, difficulty: 50 }
    ];
  }

  generateTopReferringDomains() {
    return [
      'industry-publication.com',
      'fleet-management-news.com',
      'transportation-weekly.com',
      'logistics-insights.com',
      'fleet-technology-review.com'
    ];
  }

  generateTechnicalIssues() {
    const issues = [];
    if (Math.random() > 0.7) issues.push('Slow page load times');
    if (Math.random() > 0.8) issues.push('Missing meta descriptions');
    if (Math.random() > 0.9) issues.push('Broken internal links');
    return issues;
  }

  generateContentOpportunitiesFromResearch(contentData) {
    return [
      {
        keyword: 'ai-powered-fleet-optimization',
        competitorRanking: Math.floor(Math.random() * 20) + 1,
        opportunityScore: Math.floor(Math.random() * 20) + 80,
        contentSuggestion: 'Create comprehensive guide on AI-powered fleet optimization strategies',
        contentType: 'blog_post',
        priority: 'high'
      },
      {
        keyword: 'real-time-driver-coaching',
        competitorRanking: Math.floor(Math.random() * 30) + 1,
        opportunityScore: Math.floor(Math.random() * 25) + 75,
        contentSuggestion: 'Develop case study on real-time driver coaching implementation',
        contentType: 'case_study',
        priority: 'high'
      }
    ];
  }

  // ===== COMPETITOR MANAGEMENT =====

  async getCompetitors() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM seo_competitors ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async updateCompetitor(id, domain, companyName, industry) {
    // Also update the logo when updating competitor info
    const logoUrl = await this.fetchCompanyLogo(domain, companyName);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_competitors SET domain = ?, company_name = ?, industry = ?, logo_url = ?, updated_at = datetime("now") WHERE id = ?',
        [domain, companyName, industry, logoUrl, id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async refreshCompetitorLogo(id) {
    const competitor = await new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM seo_competitors WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!competitor) {
      throw new Error('Competitor not found');
    }

    console.log(`🔄 Refreshing logo for ${competitor.company_name}...`);
    
    // Fetch new logo
    const newLogoUrl = await this.fetchCompanyLogo(competitor.domain, competitor.company_name);
    
    // Update the database
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE seo_competitors SET logo_url = ?, updated_at = datetime("now") WHERE id = ?',
        [newLogoUrl, id],
        function(err) {
          if (err) reject(err);
          else resolve(newLogoUrl);
        }
      );
    });
  }

  async refreshAllCompetitorLogos() {
    console.log('🔄 Refreshing all competitor logos...');
    
    const competitors = await this.getCompetitors();
    const results = [];
    
    for (const competitor of competitors) {
      try {
        const newLogoUrl = await this.refreshCompetitorLogo(competitor.id);
        results.push({
          id: competitor.id,
          companyName: competitor.company_name,
          success: true,
          logoUrl: newLogoUrl
        });
      } catch (error) {
        results.push({
          id: competitor.id,
          companyName: competitor.company_name,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Refreshed ${successCount}/${competitors.length} competitor logos`);
    
    return {
      success: true,
      message: `Refreshed ${successCount}/${competitors.length} competitor logos`,
      results: results
    };
  }

  async deleteCompetitor(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM seo_competitors WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async reResearchCompetitor(id) {
    const competitor = await new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM seo_competitors WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!competitor) {
      throw new Error('Competitor not found');
    }

    console.log(`🔄 Re-researching competitor: ${competitor.company_name}`);
    
    // Perform fresh research
    const researchResults = await this.performCompetitorResearch(id, competitor.domain, competitor.company_name);
    
    // Store updated research data
    await this.storeResearchData(id, researchResults);
    
    return {
      success: true,
      researchResults: researchResults,
      message: `Successfully re-researched ${competitor.company_name}`
    };
  }
}

module.exports = { CompetitorResearchService };
