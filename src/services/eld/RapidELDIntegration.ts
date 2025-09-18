/**
 * Rapid ELD Integration Service
 * Integrates ELD functionality with the existing Rapid CRM database
 * NO separate databases - uses the main rapid_crm.db
 */

import { runQuery, runExecute } from '../database/sqliteDatabaseService';

export interface ELDDriver {
  id: string;
  name: string;
  license_number: string;
  phone?: string;
  email?: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ELDVehicle {
  id: string;
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HOSLog {
  id: number;
  driver_id: string;
  vehicle_id?: string;
  log_type: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  start_time: string;
  end_time?: string;
  location?: string;
  odometer_reading?: number;
  is_edited: boolean;
  edit_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DVIRReport {
  id: number;
  driver_id: string;
  vehicle_id: string;
  inspection_type: 'pre_trip' | 'post_trip' | 'roadside';
  inspection_date: string;
  defects?: any; // JSON object
  is_safe_to_drive: boolean;
  signature?: string; // Base64 encoded
  created_at: string;
  updated_at: string;
}

export interface ELDAlert {
  id: number;
  driver_id: string;
  alert_type: 'hos_violation' | 'dvir_defect' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export class RapidELDService {
  /**
   * Get HOS status for a driver
   */
  async getHOSStatus(driverId?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          d.id as driver_id,
          d.name as driver_name,
          d.license_number,
          h.log_type,
          h.start_time,
          h.end_time,
          h.location,
          h.odometer_reading
        FROM drivers d
        LEFT JOIN eld_hos_logs h ON d.id = h.driver_id
        WHERE d.is_active = 1
      `;
      
      const params: any[] = [];
      
      if (driverId) {
        query += ' AND d.id = ?';
        params.push(driverId);
      }
      
      query += ' ORDER BY h.start_time DESC LIMIT 100';
      
      const logs = await runQuery(query, params);
      
      // Process logs to calculate HOS status
      const hosStatus = this.calculateHOSStatus(logs);
      
      return {
        success: true,
        data: hosStatus
      };
    } catch (error) {
      console.error('Error getting HOS status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get ELD alerts
   */
  async getAlerts(driverId?: string, alertType?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          a.*,
          d.name as driver_name
        FROM eld_alerts a
        JOIN drivers d ON a.driver_id = d.id
        WHERE a.is_resolved = 0
      `;
      
      const params: any[] = [];
      
      if (driverId) {
        query += ' AND a.driver_id = ?';
        params.push(driverId);
      }
      
      if (alertType) {
        query += ' AND a.alert_type = ?';
        params.push(alertType);
      }
      
      query += ' ORDER BY a.created_at DESC';
      
      const alerts = await runQuery(query, params);
      
      return {
        success: true,
        data: alerts
      };
    } catch (error) {
      console.error('Error getting alerts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate roadside inspection report
   */
  async generateRoadsideInspectionReport(driverId: string): Promise<any> {
    try {
      // Get driver info
      const driver = await runQuery('SELECT * FROM drivers WHERE id = ?', [driverId]);
      if (driver.length === 0) {
        return {
          success: false,
          error: 'Driver not found'
        };
      }

      // Get recent HOS logs
      const hosLogs = await runQuery(`
        SELECT * FROM eld_hos_logs 
        WHERE driver_id = ? 
        ORDER BY start_time DESC 
        LIMIT 50
      `, [driverId]);

      // Get recent DVIR reports
      const dvirReports = await runQuery(`
        SELECT * FROM eld_dvir_reports 
        WHERE driver_id = ? 
        ORDER BY inspection_date DESC 
        LIMIT 10
      `, [driverId]);

      // Get current vehicle
      const currentVehicle = await runQuery(`
        SELECT v.* FROM vehicles v
        JOIN eld_hos_logs h ON v.id = h.vehicle_id
        WHERE h.driver_id = ? AND h.end_time IS NULL
        ORDER BY h.start_time DESC
        LIMIT 1
      `, [driverId]);

      const report = {
        driver: driver[0],
        vehicle: currentVehicle[0] || null,
        hos_logs: hosLogs,
        dvir_reports: dvirReports,
        generated_at: new Date().toISOString(),
        report_type: 'roadside_inspection'
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating roadside inspection report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add HOS log entry
   */
  async addHOSLog(logData: Partial<HOSLog>): Promise<any> {
    try {
      const {
        driver_id,
        vehicle_id,
        log_type,
        start_time,
        end_time,
        location,
        odometer_reading,
        is_edited = false,
        edit_reason
      } = logData;

      if (!driver_id || !log_type || !start_time) {
        return {
          success: false,
          error: 'Missing required fields: driver_id, log_type, start_time'
        };
      }

      const result = await runExecute(`
        INSERT INTO eld_hos_logs (
          driver_id, vehicle_id, log_type, start_time, end_time, 
          location, odometer_reading, is_edited, edit_reason, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        driver_id, vehicle_id, log_type, start_time, end_time,
        location, odometer_reading, is_edited, edit_reason
      ]);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...logData
        }
      };
    } catch (error) {
      console.error('Error adding HOS log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add DVIR report
   */
  async addDVIRReport(reportData: Partial<DVIRReport>): Promise<any> {
    try {
      const {
        driver_id,
        vehicle_id,
        inspection_type,
        inspection_date,
        defects,
        is_safe_to_drive,
        signature
      } = reportData;

      if (!driver_id || !vehicle_id || !inspection_type || !inspection_date) {
        return {
          success: false,
          error: 'Missing required fields: driver_id, vehicle_id, inspection_type, inspection_date'
        };
      }

      const result = await runExecute(`
        INSERT INTO eld_dvir_reports (
          driver_id, vehicle_id, inspection_type, inspection_date,
          defects, is_safe_to_drive, signature, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        driver_id, vehicle_id, inspection_type, inspection_date,
        JSON.stringify(defects), is_safe_to_drive, signature
      ]);

      return {
        success: true,
        data: {
          id: result.lastInsertRowid,
          ...reportData
        }
      };
    } catch (error) {
      console.error('Error adding DVIR report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate HOS status from logs
   */
  private calculateHOSStatus(logs: any[]): any {
    // Group logs by driver
    const driverLogs: { [key: string]: any[] } = {};
    
    logs.forEach(log => {
      if (!driverLogs[log.driver_id]) {
        driverLogs[log.driver_id] = [];
      }
      driverLogs[log.driver_id].push(log);
    });

    const statuses: any[] = [];

    Object.keys(driverLogs).forEach(driverId => {
      const driverLog = driverLogs[driverId][0]; // Get driver info from first log
      const driverLogsList = driverLogs[driverId];

      // Calculate current status
      const currentStatus = this.getCurrentStatus(driverLogsList);
      
      // Calculate hours worked
      const hoursWorked = this.calculateHoursWorked(driverLogsList);
      
      // Check for violations
      const violations = this.checkHOSViolations(driverLogsList);

      statuses.push({
        driver_id: driverId,
        driver_name: driverLog.driver_name,
        license_number: driverLog.license_number,
        current_status: currentStatus,
        hours_worked: hoursWorked,
        violations: violations,
        last_log: driverLogsList[0] || null
      });
    });

    return statuses;
  }

  /**
   * Get current status from logs
   */
  private getCurrentStatus(logs: any[]): string {
    if (logs.length === 0) return 'off_duty';
    
    const latestLog = logs[0];
    if (latestLog.end_time) {
      return 'off_duty';
    }
    
    return latestLog.log_type || 'off_duty';
  }

  /**
   * Calculate hours worked
   */
  private calculateHoursWorked(logs: any[]): number {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let totalMinutes = 0;
    
    logs.forEach(log => {
      if (log.log_type === 'driving' || log.log_type === 'on_duty') {
        const startTime = new Date(log.start_time);
        const endTime = log.end_time ? new Date(log.end_time) : now;
        
        if (startTime >= startOfDay) {
          const minutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          totalMinutes += minutes;
        }
      }
    });
    
    return Math.round(totalMinutes / 60 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check for HOS violations
   */
  private checkHOSViolations(logs: any[]): any[] {
    const violations: any[] = [];
    
    // Check for 11-hour rule violation
    const hoursWorked = this.calculateHoursWorked(logs);
    if (hoursWorked > 11) {
      violations.push({
        type: '11_hour_rule',
        message: `Driver has worked ${hoursWorked} hours, exceeding 11-hour limit`,
        severity: 'high'
      });
    }
    
    // Check for 14-hour rule violation
    const totalHours = this.calculateTotalHours(logs);
    if (totalHours > 14) {
      violations.push({
        type: '14_hour_rule',
        message: `Driver has been on duty for ${totalHours} hours, exceeding 14-hour limit`,
        severity: 'high'
      });
    }
    
    return violations;
  }

  /**
   * Calculate total hours (including breaks)
   */
  private calculateTotalHours(logs: any[]): number {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let totalMinutes = 0;
    
    logs.forEach(log => {
      const startTime = new Date(log.start_time);
      const endTime = log.end_time ? new Date(log.end_time) : now;
      
      if (startTime >= startOfDay) {
        const minutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        totalMinutes += minutes;
      }
    });
    
    return Math.round(totalMinutes / 60 * 100) / 100;
  }
}

// Export singleton instance
export const rapidELDService = new RapidELDService();
