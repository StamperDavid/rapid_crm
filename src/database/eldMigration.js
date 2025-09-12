/**
 * ELD Service Database Migration
 * Containerized migration script for ELD service tracking tables
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class EldDatabaseMigration {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = new sqlite3.Database(dbPath);
  }

  async runMigration() {
    try {
      console.log('🔄 Starting ELD service database migration...');
      
      // Read the ELD schema file
      const schemaPath = path.join(__dirname, 'eld_service_schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the schema
      await this.executeSchema(schema);
      
      console.log('✅ ELD service database migration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ ELD service database migration failed:', error);
      throw error;
    }
  }

  async executeSchema(schema) {
    return new Promise((resolve, reject) => {
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      let completed = 0;
      let hasError = false;

      if (statements.length === 0) {
        resolve();
        return;
      }

      statements.forEach((statement, index) => {
        this.db.run(statement, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error(`❌ Migration statement ${index + 1} failed:`, err.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
            hasError = true;
          } else if (!err) {
            console.log(`✅ Migration statement ${index + 1} executed successfully`);
          }

          completed++;
          if (completed === statements.length) {
            if (hasError) {
              reject(new Error('Some migration statements failed'));
            } else {
              resolve();
            }
          }
        });
      });
    });
  }

  async verifyMigration() {
    try {
      console.log('🔍 Verifying ELD service migration...');
      
      const tables = [
        'service_renewals',
        'eld_services', 
        'ifta_quarterly_renewals',
        'service_automation_rules',
        'service_compliance_alerts'
      ];

      for (const table of tables) {
        const exists = await this.tableExists(table);
        if (exists) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
          return false;
        }
      }

      console.log('✅ All ELD service tables verified');
      return true;
    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      return false;
    }
  }

  async tableExists(tableName) {
    return new Promise((resolve) => {
      this.db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName],
        (err, row) => {
          resolve(!!row);
        }
      );
    });
  }

  async seedInitialData() {
    try {
      console.log('🌱 Seeding initial ELD service data...');
      
      // Create default ELD compliance agent
      const agentId = 'eld-compliance-agent-001';
      const agentExists = await this.recordExists('agents', 'id', agentId);
      
      if (!agentExists) {
        await this.insertRecord('agents', {
          id: agentId,
          name: 'ELD Compliance Agent',
          description: 'Automated agent for ELD service compliance monitoring and renewal management',
          type: 'Compliance',
          status: 'Active',
          capabilities: JSON.stringify([
            'service_renewal_monitoring',
            'compliance_alerting',
            'ifta_quarterly_processing',
            'automated_communications'
          ]),
          personality: 'Professional and proactive compliance assistant',
          knowledge_base_ids: JSON.stringify(['eld_compliance', 'ifta_regulations']),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('✅ Created ELD Compliance Agent');
      }

      // Create ELD knowledge base
      const knowledgeBaseId = 'eld-compliance-kb-001';
      const kbExists = await this.recordExists('knowledge_bases', 'id', knowledgeBaseId);
      
      if (!kbExists) {
        await this.insertRecord('knowledge_bases', {
          id: knowledgeBaseId,
          name: 'ELD Compliance Knowledge Base',
          description: 'Comprehensive knowledge base for ELD compliance, IFTA regulations, and service renewals',
          type: 'Regulatory',
          content: JSON.stringify({
            eld_requirements: [
              'FMCSA ELD mandate compliance',
              'Hours of Service (HOS) tracking',
              'Driver Vehicle Inspection Reports (DVIR)',
              'Roadside inspection preparation'
            ],
            ifta_quarterly: [
              'Quarterly filing deadlines',
              'Mileage and fuel tax calculations',
              'Documentation requirements',
              'Payment processing procedures'
            ],
            renewal_automation: [
              'Service renewal tracking',
              'Compliance monitoring',
              'Automated communications',
              'Escalation procedures'
            ]
          }),
          tags: JSON.stringify(['eld', 'compliance', 'ifta', 'renewals', 'automation']),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('✅ Created ELD Compliance Knowledge Base');
      }

      console.log('✅ Initial ELD service data seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed initial data:', error);
      throw error;
    }
  }

  async recordExists(table, column, value) {
    return new Promise((resolve) => {
      this.db.get(
        `SELECT ${column} FROM ${table} WHERE ${column} = ?`,
        [value],
        (err, row) => {
          resolve(!!row);
        }
      );
    });
  }

  async insertRecord(table, data) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      this.db.run(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

// Containerized migration runner
async function runEldMigration(dbPath) {
  const migration = new EldDatabaseMigration(dbPath);
  
  try {
    await migration.runMigration();
    const verified = await migration.verifyMigration();
    
    if (verified) {
      await migration.seedInitialData();
      console.log('🎉 ELD service migration completed successfully in containerized environment');
      return true;
    } else {
      throw new Error('Migration verification failed');
    }
  } catch (error) {
    console.error('💥 ELD service migration failed:', error);
    throw error;
  } finally {
    migration.close();
  }
}

module.exports = {
  EldDatabaseMigration,
  runEldMigration
};


