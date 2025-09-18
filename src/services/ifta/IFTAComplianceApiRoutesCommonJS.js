/**
 * IFTA Compliance API Routes - CommonJS Version
 * Integrated with Rapid CRM Database
 */

const { Router } = require('express');
const { ComprehensiveIFTAService } = require('./ComprehensiveIFTAServiceCommonJS');

class IFTAComplianceApiRoutes {
  constructor(database) {
    this.router = Router();
    this.iftaService = new ComprehensiveIFTAService(database);
    this.setupRoutes();
  }

  setupRoutes() {
    // IFTA Registration Routes
    this.router.post('/registrations', async (req, res) => {
      try {
        const registration = await this.iftaService.createIFTARegistration(req.body);
        res.status(201).json(registration);
      } catch (error) {
        console.error('Error creating IFTA registration:', error);
        res.status(500).json({ error: 'Failed to create IFTA registration' });
      }
    });

    this.router.get('/registrations', async (req, res) => {
      try {
        const { companyId } = req.query;
        const registrations = await this.iftaService.getIFTARegistrations(companyId);
        res.json(registrations);
      } catch (error) {
        console.error('Error fetching IFTA registrations:', error);
        res.status(500).json({ error: 'Failed to fetch IFTA registrations' });
      }
    });

    // IFTA Quarterly Filing Routes
    this.router.post('/quarterly-filings', async (req, res) => {
      try {
        const filing = await this.iftaService.createQuarterlyFiling(req.body);
        res.status(201).json(filing);
      } catch (error) {
        console.error('Error creating quarterly filing:', error);
        res.status(500).json({ error: 'Failed to create quarterly filing' });
      }
    });

    this.router.get('/quarterly-filings', async (req, res) => {
      try {
        const { companyId, year } = req.query;
        const filings = await this.iftaService.getQuarterlyFilings(
          companyId,
          year ? parseInt(year) : undefined
        );
        res.json(filings);
      } catch (error) {
        console.error('Error fetching quarterly filings:', error);
        res.status(500).json({ error: 'Failed to fetch quarterly filings' });
      }
    });

    // IFTA Service Package Routes
    this.router.post('/service-packages', async (req, res) => {
      try {
        const servicePackage = await this.iftaService.createServicePackage(req.body);
        res.status(201).json(servicePackage);
      } catch (error) {
        console.error('Error creating service package:', error);
        res.status(500).json({ error: 'Failed to create service package' });
      }
    });

    this.router.get('/service-packages', async (req, res) => {
      try {
        const packages = await this.iftaService.getServicePackages();
        res.json(packages);
      } catch (error) {
        console.error('Error fetching service packages:', error);
        res.status(500).json({ error: 'Failed to fetch service packages' });
      }
    });

    // IFTA Compliance Alert Routes
    this.router.post('/compliance-alerts', async (req, res) => {
      try {
        const alert = await this.iftaService.createComplianceAlert(req.body);
        res.status(201).json(alert);
      } catch (error) {
        console.error('Error creating compliance alert:', error);
        res.status(500).json({ error: 'Failed to create compliance alert' });
      }
    });

    this.router.get('/compliance-alerts', async (req, res) => {
      try {
        const { companyId } = req.query;
        const alerts = await this.iftaService.getComplianceAlerts(companyId);
        res.json(alerts);
      } catch (error) {
        console.error('Error fetching compliance alerts:', error);
        res.status(500).json({ error: 'Failed to fetch compliance alerts' });
      }
    });

    // IFTA Analytics Routes
    this.router.get('/revenue', async (req, res) => {
      try {
        const { year } = req.query;
        const revenue = await this.iftaService.getIFTARevenue(
          year ? parseInt(year) : undefined
        );
        res.json(revenue);
      } catch (error) {
        console.error('Error fetching IFTA revenue:', error);
        res.status(500).json({ error: 'Failed to fetch IFTA revenue' });
      }
    });

    this.router.get('/compliance-stats', async (req, res) => {
      try {
        const stats = await this.iftaService.getIFTAComplianceStats();
        res.json(stats);
      } catch (error) {
        console.error('Error fetching compliance stats:', error);
        res.status(500).json({ error: 'Failed to fetch compliance stats' });
      }
    });

    // IFTA Dashboard Data Route
    this.router.get('/dashboard-data', async (req, res) => {
      try {
        const [servicePackages, complianceAlerts, revenue, complianceStats] = await Promise.all([
          this.iftaService.getServicePackages(),
          this.iftaService.getComplianceAlerts(),
          this.iftaService.getIFTARevenue(),
          this.iftaService.getIFTAComplianceStats()
        ]);

        res.json({
          servicePackages,
          complianceAlerts,
          revenue,
          complianceStats
        });
      } catch (error) {
        console.error('Error fetching IFTA dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch IFTA dashboard data' });
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

// Export a function to create the routes with database
function createIFTAComplianceApiRoutes(database) {
  return new IFTAComplianceApiRoutes(database);
}

module.exports = { createIFTAComplianceApiRoutes };
