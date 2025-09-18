/**
 * Comprehensive IFTA Service
 * Integrated with Rapid CRM Database
 */

import { Database } from 'sqlite3';

export interface IFTARegistration {
  id: string;
  companyId: string;
  iftaAccountNumber: string;
  registrationYear: number;
  registrationDate: string;
  renewalDate: string;
  status: 'active' | 'suspended' | 'cancelled';
  totalMiles: number;
  totalGallons: number;
  totalTaxDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFTAQuarterlyFiling {
  id: string;
  iftaRegistrationId: string;
  companyId: string;
  quarter: number;
  year: number;
  filingPeriodStart: string;
  filingPeriodEnd: string;
  filingDueDate: string;
  filingDate?: string;
  status: 'pending' | 'filed' | 'late' | 'amended';
  totalMiles: number;
  totalGallons: number;
  totalTaxDue: number;
  penaltyAmount: number;
  interestAmount: number;
  totalAmountDue: number;
  paymentDate?: string;
  paymentAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFTAServicePackage {
  id: string;
  packageName: string;
  packageType: 'basic' | 'standard' | 'premium' | 'enterprise';
  description: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  maxVehicles: number;
  maxQuarterlyFilings: number;
  includesAuditSupport: boolean;
  includesComplianceMonitoring: boolean;
  includesDedicatedSupport: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFTAComplianceAlert {
  id: string;
  companyId: string;
  iftaRegistrationId?: string;
  alertType: 'filing_due' | 'late_filing' | 'payment_due' | 'audit_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  dueDate?: string;
  status: 'open' | 'resolved' | 'dismissed';
  isResolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class ComprehensiveIFTAService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  // IFTA Registration Management
  async createIFTARegistration(registration: Omit<IFTARegistration, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFTARegistration> {
    const id = `ifta_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ifta_registrations (
          id, company_id, ifta_account_number, registration_year, registration_date,
          renewal_date, status, total_miles, total_gallons, total_tax_due,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        id, registration.companyId, registration.iftaAccountNumber,
        registration.registrationYear, registration.registrationDate,
        registration.renewalDate, registration.status, registration.totalMiles,
        registration.totalGallons, registration.totalTaxDue, now, now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...registration,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  async getIFTARegistrations(companyId?: string): Promise<IFTARegistration[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM ifta_registrations';
      const params: any[] = [];

      if (companyId) {
        sql += ' WHERE company_id = ?';
        params.push(companyId);
      }

      sql += ' ORDER BY registration_year DESC, created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(this.transformIFTARegistration));
        }
      });
    });
  }

  // IFTA Quarterly Filing Management
  async createQuarterlyFiling(filing: Omit<IFTAQuarterlyFiling, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFTAQuarterlyFiling> {
    const id = `ifta_q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ifta_quarterly_filings (
          id, ifta_registration_id, company_id, quarter, year,
          filing_period_start, filing_period_end, filing_due_date, filing_date,
          status, total_miles, total_gallons, total_tax_due, penalty_amount,
          interest_amount, total_amount_due, payment_date, payment_amount,
          payment_method, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        id, filing.iftaRegistrationId, filing.companyId, filing.quarter,
        filing.year, filing.filingPeriodStart, filing.filingPeriodEnd,
        filing.filingDueDate, filing.filingDate, filing.status,
        filing.totalMiles, filing.totalGallons, filing.totalTaxDue,
        filing.penaltyAmount, filing.interestAmount, filing.totalAmountDue,
        filing.paymentDate, filing.paymentAmount, filing.paymentMethod,
        filing.notes, now, now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...filing,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  async getQuarterlyFilings(companyId?: string, year?: number): Promise<IFTAQuarterlyFiling[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM ifta_quarterly_filings';
      const params: any[] = [];
      const conditions: string[] = [];

      if (companyId) {
        conditions.push('company_id = ?');
        params.push(companyId);
      }

      if (year) {
        conditions.push('year = ?');
        params.push(year);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY year DESC, quarter DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(this.transformIFTAQuarterlyFiling));
        }
      });
    });
  }

  // IFTA Service Package Management
  async createServicePackage(packageData: Omit<IFTAServicePackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFTAServicePackage> {
    const id = `ifta_pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ifta_service_packages (
          id, package_name, package_type, description, monthly_price, setup_fee,
          features, max_vehicles, max_quarterly_filings, includes_audit_support,
          includes_compliance_monitoring, includes_dedicated_support, is_active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        id, packageData.packageName, packageData.packageType, packageData.description,
        packageData.monthlyPrice, packageData.setupFee, JSON.stringify(packageData.features),
        packageData.maxVehicles, packageData.maxQuarterlyFilings, packageData.includesAuditSupport,
        packageData.includesComplianceMonitoring, packageData.includesDedicatedSupport,
        packageData.isActive, now, now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...packageData,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  async getServicePackages(): Promise<IFTAServicePackage[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM ifta_service_packages WHERE is_active = 1 ORDER BY monthly_price ASC';

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(this.transformIFTAServicePackage));
        }
      });
    });
  }

  // IFTA Compliance Alert Management
  async createComplianceAlert(alert: Omit<IFTAComplianceAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFTAComplianceAlert> {
    const id = `ifta_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ifta_compliance_alerts (
          id, company_id, ifta_registration_id, alert_type, severity, title,
          message, due_date, status, is_resolved, resolved_date, resolved_by,
          notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        id, alert.companyId, alert.iftaRegistrationId, alert.alertType,
        alert.severity, alert.title, alert.message, alert.dueDate,
        alert.status, alert.isResolved, alert.resolvedDate, alert.resolvedBy,
        alert.notes, now, now
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...alert,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  async getComplianceAlerts(companyId?: string): Promise<IFTAComplianceAlert[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM ifta_compliance_alerts';
      const params: any[] = [];

      if (companyId) {
        sql += ' WHERE company_id = ?';
        params.push(companyId);
      }

      sql += ' ORDER BY created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(this.transformIFTAComplianceAlert));
        }
      });
    });
  }

  // IFTA Revenue and Analytics
  async getIFTARevenue(year?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          strftime('%Y-%m', created_at) as month,
          SUM(monthly_fee) as recurring_revenue,
          SUM(setup_fee_paid) as setup_revenue,
          COUNT(*) as active_clients
        FROM ifta_client_services 
        WHERE status = 'active'
      `;
      const params: any[] = [];

      if (year) {
        sql += ' AND strftime("%Y", created_at) = ?';
        params.push(year.toString());
      }

      sql += ' GROUP BY strftime("%Y-%m", created_at) ORDER BY month DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getIFTAComplianceStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_registrations,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_registrations,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_registrations,
          SUM(total_tax_due) as total_tax_collected
        FROM ifta_registrations
      `;

      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Data transformation helpers
  private transformIFTARegistration(row: any): IFTARegistration {
    return {
      id: row.id,
      companyId: row.company_id,
      iftaAccountNumber: row.ifta_account_number,
      registrationYear: row.registration_year,
      registrationDate: row.registration_date,
      renewalDate: row.renewal_date,
      status: row.status,
      totalMiles: row.total_miles,
      totalGallons: row.total_gallons,
      totalTaxDue: row.total_tax_due,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformIFTAQuarterlyFiling(row: any): IFTAQuarterlyFiling {
    return {
      id: row.id,
      iftaRegistrationId: row.ifta_registration_id,
      companyId: row.company_id,
      quarter: row.quarter,
      year: row.year,
      filingPeriodStart: row.filing_period_start,
      filingPeriodEnd: row.filing_period_end,
      filingDueDate: row.filing_due_date,
      filingDate: row.filing_date,
      status: row.status,
      totalMiles: row.total_miles,
      totalGallons: row.total_gallons,
      totalTaxDue: row.total_tax_due,
      penaltyAmount: row.penalty_amount,
      interestAmount: row.interest_amount,
      totalAmountDue: row.total_amount_due,
      paymentDate: row.payment_date,
      paymentAmount: row.payment_amount,
      paymentMethod: row.payment_method,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformIFTAServicePackage(row: any): IFTAServicePackage {
    return {
      id: row.id,
      packageName: row.package_name,
      packageType: row.package_type,
      description: row.description,
      monthlyPrice: row.monthly_price,
      setupFee: row.setup_fee,
      features: JSON.parse(row.features || '[]'),
      maxVehicles: row.max_vehicles,
      maxQuarterlyFilings: row.max_quarterly_filings,
      includesAuditSupport: row.includes_audit_support,
      includesComplianceMonitoring: row.includes_compliance_monitoring,
      includesDedicatedSupport: row.includes_dedicated_support,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private transformIFTAComplianceAlert(row: any): IFTAComplianceAlert {
    return {
      id: row.id,
      companyId: row.company_id,
      iftaRegistrationId: row.ifta_registration_id,
      alertType: row.alert_type,
      severity: row.severity,
      title: row.title,
      message: row.message,
      dueDate: row.due_date,
      status: row.status,
      isResolved: row.is_resolved,
      resolvedDate: row.resolved_date,
      resolvedBy: row.resolved_by,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
