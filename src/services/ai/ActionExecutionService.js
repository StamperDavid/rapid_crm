/**
 * ACTION EXECUTION SERVICE - CommonJS Version
 * Handles actual execution of actions the AI is asked to perform
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class ActionExecutionService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
    this.db = new Database(this.dbPath, { 
      timeout: 10000,
      verbose: null
    });
    this.initializeTables();
    console.log('Action Execution Service initialized');
  }

  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ai_action_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        action_description TEXT NOT NULL,
        parameters TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        executed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Action execution tables initialized');
  }

  async executeVoiceChange(userId, voiceId, provider = 'unreal-speech') {
    try {
      const actionId = this.logAction(userId, 'voice_change', `Change default voice to ${voiceId}`, {
        voiceId,
        provider,
        timestamp: new Date().toISOString()
      });

      const { VoicePreferenceService } = require('./VoicePreferenceService');
      const voiceService = new VoicePreferenceService();
      
      const success = voiceService.setUserVoicePreference(userId, voiceId, provider);
      
      if (success) {
        this.updateActionStatus(actionId, 'completed', {
          success: true,
          newVoice: voiceId,
          message: `Voice successfully changed to ${voiceId}`
        });
        
        return {
          success: true,
          action: 'voice_change',
          result: `Voice successfully changed to ${voiceId}`,
          actionId: actionId
        };
      } else {
        this.updateActionStatus(actionId, 'failed', {
          success: false,
          error: 'Failed to change voice preference'
        });
        
        return {
          success: false,
          action: 'voice_change',
          result: 'Failed to change voice preference',
          actionId: actionId
        };
      }
    } catch (error) {
      console.error('Error executing voice change:', error);
      return {
        success: false,
        action: 'voice_change',
        result: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async executeCRMAction(userId, actionType, data) {
    try {
      const actionId = this.logAction(userId, actionType, `Perform CRM action: ${actionType}`, data);
      
      let result = null;
      
      switch (actionType) {
        case 'add_contact':
          result = await this.addContact(data);
          break;
        case 'add_company':
          result = await this.addCompany(data);
          break;
        case 'add_deal':
          result = await this.addDeal(data);
          break;
        case 'update_contact':
          result = await this.updateContact(data);
          break;
        default:
          throw new Error(`Unknown CRM action: ${actionType}`);
      }
      
      if (result.success) {
        this.updateActionStatus(actionId, 'completed', result);
      } else {
        this.updateActionStatus(actionId, 'failed', result);
      }
      
      return {
        success: result.success,
        action: actionType,
        result: result,
        actionId: actionId
      };
      
    } catch (error) {
      console.error('Error executing CRM action:', error);
      return {
        success: false,
        action: actionType,
        result: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async executeSystemAction(userId, actionType, data) {
    try {
      const actionId = this.logAction(userId, actionType, `Perform system action: ${actionType}`, data);
      
      let result = null;
      
      switch (actionType) {
        case 'restart_server':
          result = await this.restartServer();
          break;
        case 'backup_database':
          result = await this.backupDatabase();
          break;
        case 'cleanup_logs':
          result = await this.cleanupLogs();
          break;
        default:
          throw new Error(`Unknown system action: ${actionType}`);
      }
      
      if (result.success) {
        this.updateActionStatus(actionId, 'completed', result);
      } else {
        this.updateActionStatus(actionId, 'failed', result);
      }
      
      return {
        success: result.success,
        action: actionType,
        result: result,
        actionId: actionId
      };
      
    } catch (error) {
      console.error('Error executing system action:', error);
      return {
        success: false,
        action: actionType,
        result: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async addContact(data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO contacts (
          firstName, lastName, email, phone, companyId, 
          position, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.firstName || '',
        data.lastName || '',
        data.email || '',
        data.phone || '',
        data.companyId || '1',
        data.position || '',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      return {
        success: true,
        contactId: result.lastInsertRowid,
        message: `Contact ${data.firstName} ${data.lastName} added successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addCompany(data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO companies (
          name, industry, phone, email, website,
          address, city, state, zip, country,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.name || '',
        data.industry || '',
        data.phone || '',
        data.email || '',
        data.website || '',
        data.address || '',
        data.city || '',
        data.state || '',
        data.zip || '',
        data.country || 'US',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      return {
        success: true,
        companyId: result.lastInsertRowid,
        message: `Company ${data.name} added successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addDeal(data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO deals (
          title, description, value, stage, probability,
          expected_close_date, company_id, contact_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.title || '',
        data.description || '',
        data.value || 0,
        data.stage || 'prospecting',
        data.probability || 0,
        data.expectedCloseDate || null,
        data.companyId || null,
        data.contactId || null,
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      return {
        success: true,
        dealId: result.lastInsertRowid,
        message: `Deal "${data.title}" added successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateContact(data) {
    try {
      const stmt = this.db.prepare(`
        UPDATE contacts SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          position = COALESCE(?, position),
          updated_at = ?
        WHERE id = ?
      `);
      
      const result = stmt.run(
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.position,
        new Date().toISOString(),
        data.contactId
      );
      
      return {
        success: result.changes > 0,
        message: result.changes > 0 ? 'Contact updated successfully' : 'Contact not found',
        changes: result.changes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restartServer() {
    return {
      success: true,
      message: 'Server restart initiated (simulated)',
      note: 'In production, this would actually restart the server'
    };
  }

  async backupDatabase() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./instance/rapid_crm_backup_${timestamp}.db`;
      
      fs.copyFileSync(this.dbPath, backupPath);
      
      return {
        success: true,
        message: 'Database backup created successfully',
        backupPath: backupPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanupLogs() {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM ai_action_log
        WHERE created_at < datetime('now', '-30 days')
      `);
      
      const result = stmt.run();
      
      return {
        success: true,
        message: `Cleaned up ${result.changes} old log entries`,
        deletedCount: result.changes
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  logAction(userId, actionType, description, parameters) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO ai_action_log (user_id, action_type, action_description, parameters)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        userId,
        actionType,
        description,
        JSON.stringify(parameters || {})
      );
      
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error logging action:', error);
      return null;
    }
  }

  updateActionStatus(actionId, status, result) {
    try {
      const stmt = this.db.prepare(`
        UPDATE ai_action_log 
        SET status = ?, result = ?, executed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(status, JSON.stringify(result), actionId);
    } catch (error) {
      console.error('Error updating action status:', error);
    }
  }

  getUserActionHistory(userId, limit = 20) {
    try {
      const stmt = this.db.prepare(`
        SELECT action_type, action_description, status, result, executed_at, created_at
        FROM ai_action_log
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `);
      
      return stmt.all(userId, limit);
    } catch (error) {
      console.error('Error getting action history:', error);
      return [];
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = { ActionExecutionService };

