const express = require('express');

/**
 * ELD Compliance API Routes - CommonJS Version
 * Uses ONLY the existing rapid_crm.db database - no external dependencies
 */

class ELDComplianceApiRoutes {
  constructor(database) {
    this.db = database;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // HOS Logs endpoints
    this.router.get('/hos-logs', this.getHosLogs.bind(this));
    this.router.post('/hos-logs', this.createHosLog.bind(this));
    this.router.put('/hos-logs/:id', this.updateHosLog.bind(this));
    this.router.delete('/hos-logs/:id', this.deleteHosLog.bind(this));

    // DVIR Reports endpoints
    this.router.get('/dvir-reports', this.getDvirReports.bind(this));
    this.router.post('/dvir-reports', this.createDvirReport.bind(this));
    this.router.put('/dvir-reports/:id', this.updateDvirReport.bind(this));
    this.router.delete('/dvir-reports/:id', this.deleteDvirReport.bind(this));

    // ELD Alerts endpoints
    this.router.get('/alerts', this.getEldAlerts.bind(this));
    this.router.post('/alerts', this.createEldAlert.bind(this));
    this.router.put('/alerts/:id', this.updateEldAlert.bind(this));

    // Compliance endpoints
    this.router.get('/compliance/status', this.getComplianceStatus.bind(this));
    this.router.get('/compliance/violations', this.getComplianceViolations.bind(this));
    this.router.post('/compliance/acknowledge', this.acknowledgeComplianceIssue.bind(this));

    // Geotab integration endpoints
    this.router.post('/geotab/sync', this.syncGeotabData.bind(this));
    this.router.get('/geotab/devices', this.getGeotabDevices.bind(this));
    this.router.post('/geotab/credentials', this.storeGeotabCredentials.bind(this));
  }

  // HOS Logs methods
  async getHosLogs(req, res) {
    try {
      const { driverId, limit = 50, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM eld_hos_logs';
      const params = [];
      
      if (driverId) {
        query += ' WHERE driver_id = ?';
        params.push(driverId);
      }
      
      query += ' ORDER BY start_time DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error fetching HOS logs:', err);
          return res.status(500).json({ error: 'Failed to fetch HOS logs' });
        }
        res.json(rows || []);
      });
    } catch (error) {
      console.error('Error in getHosLogs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createHosLog(req, res) {
    try {
      const { driverId, vehicleId, logType, startTime, endTime, location, notes } = req.body;
      
      const query = `
        INSERT INTO eld_hos_logs 
        (driver_id, vehicle_id, log_type, start_time, end_time, location, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      this.db.run(query, [driverId, vehicleId, logType, startTime, endTime, location, notes], function(err) {
        if (err) {
          console.error('Error creating HOS log:', err);
          return res.status(500).json({ error: 'Failed to create HOS log' });
        }
        res.json({ id: this.lastID, message: 'HOS log created successfully' });
      });
    } catch (error) {
      console.error('Error in createHosLog:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateHosLog(req, res) {
    try {
      const { id } = req.params;
      const { logType, startTime, endTime, location, notes } = req.body;
      
      const query = `
        UPDATE eld_hos_logs 
        SET log_type = ?, start_time = ?, end_time = ?, location = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      
      this.db.run(query, [logType, startTime, endTime, location, notes, id], function(err) {
        if (err) {
          console.error('Error updating HOS log:', err);
          return res.status(500).json({ error: 'Failed to update HOS log' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'HOS log not found' });
        }
        res.json({ message: 'HOS log updated successfully' });
      });
    } catch (error) {
      console.error('Error in updateHosLog:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteHosLog(req, res) {
    try {
      const { id } = req.params;
      
      const query = 'DELETE FROM eld_hos_logs WHERE id = ?';
      
      this.db.run(query, [id], function(err) {
        if (err) {
          console.error('Error deleting HOS log:', err);
          return res.status(500).json({ error: 'Failed to delete HOS log' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'HOS log not found' });
        }
        res.json({ message: 'HOS log deleted successfully' });
      });
    } catch (error) {
      console.error('Error in deleteHosLog:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DVIR Reports methods
  async getDvirReports(req, res) {
    try {
      const { driverId, vehicleId, limit = 50, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM eld_dvir_reports';
      const params = [];
      const conditions = [];
      
      if (driverId) {
        conditions.push('driver_id = ?');
        params.push(driverId);
      }
      if (vehicleId) {
        conditions.push('vehicle_id = ?');
        params.push(vehicleId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY inspection_date DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error fetching DVIR reports:', err);
          return res.status(500).json({ error: 'Failed to fetch DVIR reports' });
        }
        res.json(rows || []);
      });
    } catch (error) {
      console.error('Error in getDvirReports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createDvirReport(req, res) {
    try {
      const { driverId, vehicleId, inspectionType, inspectionDate, defects, notes } = req.body;
      
      const query = `
        INSERT INTO eld_dvir_reports 
        (driver_id, vehicle_id, inspection_type, inspection_date, defects, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      this.db.run(query, [driverId, vehicleId, inspectionType, inspectionDate, JSON.stringify(defects), notes], function(err) {
        if (err) {
          console.error('Error creating DVIR report:', err);
          return res.status(500).json({ error: 'Failed to create DVIR report' });
        }
        res.json({ id: this.lastID, message: 'DVIR report created successfully' });
      });
    } catch (error) {
      console.error('Error in createDvirReport:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateDvirReport(req, res) {
    try {
      const { id } = req.params;
      const { inspectionType, inspectionDate, defects, notes } = req.body;
      
      const query = `
        UPDATE eld_dvir_reports 
        SET inspection_type = ?, inspection_date = ?, defects = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      
      this.db.run(query, [inspectionType, inspectionDate, JSON.stringify(defects), notes, id], function(err) {
        if (err) {
          console.error('Error updating DVIR report:', err);
          return res.status(500).json({ error: 'Failed to update DVIR report' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'DVIR report not found' });
        }
        res.json({ message: 'DVIR report updated successfully' });
      });
    } catch (error) {
      console.error('Error in updateDvirReport:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteDvirReport(req, res) {
    try {
      const { id } = req.params;
      
      const query = 'DELETE FROM eld_dvir_reports WHERE id = ?';
      
      this.db.run(query, [id], function(err) {
        if (err) {
          console.error('Error deleting DVIR report:', err);
          return res.status(500).json({ error: 'Failed to delete DVIR report' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'DVIR report not found' });
        }
        res.json({ message: 'DVIR report deleted successfully' });
      });
    } catch (error) {
      console.error('Error in deleteDvirReport:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ELD Alerts methods
  async getEldAlerts(req, res) {
    try {
      const { status, severity, limit = 50, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM eld_alerts';
      const params = [];
      const conditions = [];
      
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      if (severity) {
        conditions.push('severity = ?');
        params.push(severity);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error fetching ELD alerts:', err);
          return res.status(500).json({ error: 'Failed to fetch ELD alerts' });
        }
        res.json(rows || []);
      });
    } catch (error) {
      console.error('Error in getEldAlerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createEldAlert(req, res) {
    try {
      const { driverId, vehicleId, alertType, severity, message, details } = req.body;
      
      const query = `
        INSERT INTO eld_alerts 
        (driver_id, vehicle_id, alert_type, severity, message, details, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))
      `;
      
      this.db.run(query, [driverId, vehicleId, alertType, severity, message, JSON.stringify(details)], function(err) {
        if (err) {
          console.error('Error creating ELD alert:', err);
          return res.status(500).json({ error: 'Failed to create ELD alert' });
        }
        res.json({ id: this.lastID, message: 'ELD alert created successfully' });
      });
    } catch (error) {
      console.error('Error in createEldAlert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEldAlert(req, res) {
    try {
      const { id } = req.params;
      const { status, acknowledgedBy, notes } = req.body;
      
      const query = `
        UPDATE eld_alerts 
        SET status = ?, acknowledged_by = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      
      this.db.run(query, [status, acknowledgedBy, notes, id], function(err) {
        if (err) {
          console.error('Error updating ELD alert:', err);
          return res.status(500).json({ error: 'Failed to update ELD alert' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'ELD alert not found' });
        }
        res.json({ message: 'ELD alert updated successfully' });
      });
    } catch (error) {
      console.error('Error in updateEldAlert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Compliance methods
  async getComplianceStatus(req, res) {
    try {
      const { companyId } = req.query;
      
      // Mock compliance status - in real implementation, calculate from actual data
      const complianceStatus = {
        overallScore: 87,
        hosCompliance: 92,
        dvirCompliance: 85,
        alertCount: 3,
        violationCount: 1,
        lastAudit: '2024-12-01',
        nextAudit: '2025-03-01'
      };
      
      res.json(complianceStatus);
    } catch (error) {
      console.error('Error in getComplianceStatus:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getComplianceViolations(req, res) {
    try {
      const { companyId, status, limit = 50, offset = 0 } = req.query;
      
      // Mock violations data - in real implementation, fetch from database
      const violations = [
        {
          id: 1,
          type: 'HOS Violation',
          severity: 'high',
          driverId: 'driver_1',
          vehicleId: 'vehicle_1',
          description: '11-hour rule violation',
          occurredAt: '2024-12-15T10:30:00Z',
          status: 'open'
        }
      ];
      
      res.json(violations);
    } catch (error) {
      console.error('Error in getComplianceViolations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async acknowledgeComplianceIssue(req, res) {
    try {
      const { violationId, acknowledgedBy, notes } = req.body;
      
      // Mock acknowledgment - in real implementation, update database
      res.json({ message: 'Compliance issue acknowledged successfully' });
    } catch (error) {
      console.error('Error in acknowledgeComplianceIssue:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Geotab integration methods
  async syncGeotabData(req, res) {
    try {
      const { credentials } = req.body;
      
      // Mock Geotab sync - in real implementation, integrate with Geotab API
      res.json({ message: 'Geotab data synchronized successfully', recordsProcessed: 150 });
    } catch (error) {
      console.error('Error in syncGeotabData:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGeotabDevices(req, res) {
    try {
      // Mock Geotab devices - in real implementation, fetch from Geotab API
      const devices = [
        {
          id: 'device_1',
          name: 'Truck 001 ELD',
          serialNumber: 'GT001234',
          status: 'active',
          lastSync: '2024-12-18T15:30:00Z'
        }
      ];
      
      res.json(devices);
    } catch (error) {
      console.error('Error in getGeotabDevices:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async storeGeotabCredentials(req, res) {
    try {
      const { username, password, database, server } = req.body;
      
      // Mock credential storage - in real implementation, store securely
      res.json({ message: 'Geotab credentials stored successfully' });
    } catch (error) {
      console.error('Error in storeGeotabCredentials:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter() {
    return this.router;
  }
}

function createELDComplianceApiRoutes(database) {
  return new ELDComplianceApiRoutes(database);
}

module.exports = {
  ELDComplianceApiRoutes,
  createELDComplianceApiRoutes
};
