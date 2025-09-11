import { DatabaseService } from '../DatabaseService';
import { Migration } from '../config';

export class MigrationService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        version VARCHAR(50) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rollback_sql TEXT
      )
    `;
    
    await this.db.executeQuery('primary', query);
  }

  async getAppliedMigrations(): Promise<Migration[]> {
    const query = 'SELECT * FROM migrations ORDER BY applied_at ASC';
    const result = await this.db.executeQuery<Migration>('primary', query);
    return result.data;
  }

  async isMigrationApplied(migrationName: string): Promise<boolean> {
    const query = 'SELECT 1 FROM migrations WHERE name = $1 LIMIT 1';
    const result = await this.db.executeQuery('primary', query, [migrationName]);
    return result.data.length > 0;
  }

  async applyMigration(migration: Migration): Promise<void> {
    if (await this.isMigrationApplied(migration.name)) {
      console.log(`Migration ${migration.name} already applied, skipping...`);
      return;
    }

    try {
      // Execute the migration SQL
      await this.db.executeQuery('primary', migration.sql);
      
      // Record the migration
      const insertQuery = `
        INSERT INTO migrations (name, version, rollback_sql) 
        VALUES ($1, $2, $3)
      `;
      await this.db.executeQuery('primary', insertQuery, [
        migration.name,
        migration.version,
        migration.rollbackSql
      ]);
      
      console.log(`Migration ${migration.name} applied successfully`);
    } catch (error) {
      console.error(`Failed to apply migration ${migration.name}:`, error);
      throw error;
    }
  }

  async rollbackMigration(migrationName: string): Promise<void> {
    const query = 'SELECT rollback_sql FROM migrations WHERE name = $1';
    const result = await this.db.executeQuery<{ rollback_sql: string }>('primary', query, [migrationName]);
    
    if (result.data.length === 0) {
      throw new Error(`Migration ${migrationName} not found`);
    }

    const rollbackSql = result.data[0].rollback_sql;
    if (!rollbackSql) {
      throw new Error(`No rollback SQL available for migration ${migrationName}`);
    }

    try {
      // Execute rollback SQL
      await this.db.executeQuery('primary', rollbackSql);
      
      // Remove migration record
      const deleteQuery = 'DELETE FROM migrations WHERE name = $1';
      await this.db.executeQuery('primary', deleteQuery, [migrationName]);
      
      console.log(`Migration ${migrationName} rolled back successfully`);
    } catch (error) {
      console.error(`Failed to rollback migration ${migrationName}:`, error);
      throw error;
    }
  }

  async runAllMigrations(): Promise<void> {
    await this.createMigrationsTable();
    
    const migrations = this.getAvailableMigrations();
    
    for (const migration of migrations) {
      await this.applyMigration(migration);
    }
  }

  private getAvailableMigrations(): Migration[] {
    return [
      {
        id: '001',
        name: 'create_companies_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(50),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            zip_code VARCHAR(20),
            country VARCHAR(100) DEFAULT 'US',
            website VARCHAR(255),
            industry VARCHAR(100),
            size VARCHAR(20) CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
            status VARCHAR(20) DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect', 'customer')),
            usdot_number VARCHAR(20) UNIQUE,
            mc_number VARCHAR(20) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID,
            updated_by UUID
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS companies'
      },
      {
        id: '002',
        name: 'create_users_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'compliance_officer', 'sales_rep')),
            department VARCHAR(100),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            two_factor_enabled BOOLEAN DEFAULT FALSE,
            two_factor_secret VARCHAR(255),
            last_login TIMESTAMP,
            login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP,
            password_reset_token VARCHAR(255),
            password_reset_expires TIMESTAMP,
            email_verified BOOLEAN DEFAULT FALSE,
            email_verification_token VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID,
            updated_by UUID
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS users'
      },
      {
        id: '003',
        name: 'create_deals_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS deals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            value DECIMAL(15,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            stage VARCHAR(50) DEFAULT 'prospect' CHECK (stage IN ('prospect', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
            probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
            expected_close_date DATE,
            actual_close_date DATE,
            company_id UUID REFERENCES companies(id),
            contact_id UUID,
            owner_id UUID REFERENCES users(id),
            source VARCHAR(100),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'cancelled')),
            tags TEXT[],
            custom_fields JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS deals'
      },
      {
        id: '004',
        name: 'create_contacts_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            mobile VARCHAR(50),
            title VARCHAR(100),
            department VARCHAR(100),
            company_id UUID REFERENCES companies(id),
            is_primary BOOLEAN DEFAULT FALSE,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS contacts'
      },
      {
        id: '005',
        name: 'create_vehicles_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS vehicles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id),
            make VARCHAR(100),
            model VARCHAR(100),
            year INTEGER,
            vin VARCHAR(17) UNIQUE,
            license_plate VARCHAR(20),
            vehicle_type VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS vehicles'
      },
      {
        id: '006',
        name: 'create_drivers_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS drivers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            license_number VARCHAR(50) UNIQUE,
            license_state VARCHAR(2),
            license_expiry DATE,
            cdl_class VARCHAR(10),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS drivers'
      },
      {
        id: '007',
        name: 'create_usdot_applications_table',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE TABLE IF NOT EXISTS usdot_applications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id),
            application_data JSONB NOT NULL,
            status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
            submission_date DATE,
            approval_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          )
        `,
        rollbackSql: 'DROP TABLE IF EXISTS usdot_applications'
      },
      {
        id: '008',
        name: 'create_indexes',
        version: '1.0.0',
        appliedAt: '',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
          CREATE INDEX IF NOT EXISTS idx_companies_usdot ON companies(usdot_number);
          CREATE INDEX IF NOT EXISTS idx_companies_mc ON companies(mc_number);
          CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
          CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
          CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
          CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
          CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
          CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
          CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(expected_close_date);
          CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
          CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
          CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
          CREATE INDEX IF NOT EXISTS idx_usdot_applications_company ON usdot_applications(company_id);
        `,
        rollbackSql: `
          DROP INDEX IF EXISTS idx_companies_email;
          DROP INDEX IF EXISTS idx_companies_usdot;
          DROP INDEX IF EXISTS idx_companies_mc;
          DROP INDEX IF EXISTS idx_companies_status;
          DROP INDEX IF EXISTS idx_users_email;
          DROP INDEX IF EXISTS idx_users_role;
          DROP INDEX IF EXISTS idx_users_status;
          DROP INDEX IF EXISTS idx_deals_company;
          DROP INDEX IF EXISTS idx_deals_owner;
          DROP INDEX IF EXISTS idx_deals_stage;
          DROP INDEX IF EXISTS idx_deals_status;
          DROP INDEX IF EXISTS idx_deals_close_date;
          DROP INDEX IF EXISTS idx_contacts_company;
          DROP INDEX IF EXISTS idx_vehicles_company;
          DROP INDEX IF EXISTS idx_drivers_company;
          DROP INDEX IF EXISTS idx_usdot_applications_company;
        `
      }
    ];
  }
}
