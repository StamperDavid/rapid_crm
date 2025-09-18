/**
 * Geotab Integration Service
 * Integrates with Geotab API for ELD data synchronization
 * Uses ONLY the existing rapid_crm.db database
 */

import { runQuery, runExecute } from '../database/sqliteDatabaseService';

export interface GeotabCredentials {
  serverName: string;
  databaseName: string;
  username: string;
  password: string;
}

export interface GeotabDevice {
  id: string;
  name: string;
  serialNumber: string;
  vehicleId?: string;
  driverId?: string;
  isActive: boolean;
}

export interface GeotabLogRecord {
  id: string;
  deviceId: string;
  driverId?: string;
  dateTime: string;
  logType: 'Driving' | 'OnDuty' | 'OffDuty' | 'SleeperBerth';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  odometer?: number;
  engineHours?: number;
}

export interface GeotabDVIRRecord {
  id: string;
  deviceId: string;
  driverId?: string;
  dateTime: string;
  inspectionType: 'PreTrip' | 'PostTrip' | 'Intermediate';
  defects: any[];
  isSafeToDrive: boolean;
  signature?: string;
}

export class GeotabIntegrationService {
  private apiBaseUrl: string = 'https://my.geotab.com/apiv1';
  private sessionId: string | null = null;
  private sessionExpiry: Date | null = null;

  /**
   * Authenticate with Geotab API
   */
  async authenticate(credentials: GeotabCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: credentials.username,
          password: credentials.password,
          database: credentials.databaseName
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.sessionId = data.result.credentials.sessionId;
      this.sessionExpiry = new Date(data.result.credentials.expiry);

      // Store credentials in database
      await this.storeCredentials(credentials);

      console.log('✅ Geotab authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Geotab authentication failed:', error);
      return false;
    }
  }

  /**
   * Store Geotab credentials in database
   */
  private async storeCredentials(credentials: GeotabCredentials): Promise<void> {
    try {
      await runExecute(`
        INSERT OR REPLACE INTO geotab_credentials 
        (company_id, server_name, database_name, username, session_id, session_expiry, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        'default_company', // This should be passed as parameter
        credentials.serverName,
        credentials.databaseName,
        credentials.username,
        this.sessionId,
        this.sessionExpiry?.toISOString()
      ]);
    } catch (error) {
      console.error('Error storing Geotab credentials:', error);
    }
  }

  /**
   * Get Geotab devices
   */
  async getDevices(): Promise<GeotabDevice[]> {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated with Geotab');
      }

      const response = await fetch(`${this.apiBaseUrl}/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'Get',
          params: {
            typeName: 'Device',
            credentials: {
              sessionId: this.sessionId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error getting Geotab devices:', error);
      return [];
    }
  }

  /**
   * Sync Geotab devices to local database
   */
  async syncDevices(companyId: string): Promise<boolean> {
    try {
      const devices = await this.getDevices();
      
      for (const device of devices) {
        await runExecute(`
          INSERT OR REPLACE INTO geotab_devices 
          (company_id, device_id, device_name, vehicle_id, driver_id, is_active, last_sync, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          companyId,
          device.id,
          device.name,
          device.vehicleId,
          device.driverId,
          device.isActive ? 1 : 0
        ]);
      }

      console.log(`✅ Synced ${devices.length} Geotab devices`);
      return true;
    } catch (error) {
      console.error('Error syncing Geotab devices:', error);
      return false;
    }
  }

  /**
   * Get HOS logs from Geotab
   */
  async getHOSLogs(deviceId: string, fromDate: string, toDate: string): Promise<GeotabLogRecord[]> {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated with Geotab');
      }

      const response = await fetch(`${this.apiBaseUrl}/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'Get',
          params: {
            typeName: 'LogRecord',
            search: {
              deviceSearch: {
                id: deviceId
              },
              fromDate: fromDate,
              toDate: toDate
            },
            credentials: {
              sessionId: this.sessionId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get HOS logs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error getting HOS logs from Geotab:', error);
      return [];
    }
  }

  /**
   * Sync HOS logs from Geotab to local database
   */
  async syncHOSLogs(companyId: string, deviceId: string, fromDate: string, toDate: string): Promise<boolean> {
    try {
      const geotabLogs = await this.getHOSLogs(deviceId, fromDate, toDate);
      
      for (const log of geotabLogs) {
        // Convert Geotab log type to our format
        let logType: string;
        switch (log.logType) {
          case 'Driving':
            logType = 'driving';
            break;
          case 'OnDuty':
            logType = 'on_duty';
            break;
          case 'OffDuty':
            logType = 'off_duty';
            break;
          case 'SleeperBerth':
            logType = 'sleeper_berth';
            break;
          default:
            logType = 'off_duty';
        }

        await runExecute(`
          INSERT OR REPLACE INTO eld_hos_logs 
          (driver_id, vehicle_id, log_type, start_time, end_time, location, odometer_reading, is_edited, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          log.driverId,
          deviceId, // Using deviceId as vehicle_id for now
          logType,
          log.dateTime,
          null, // Geotab logs are typically point-in-time
          log.location ? JSON.stringify(log.location) : null,
          log.odometer
        ]);
      }

      console.log(`✅ Synced ${geotabLogs.length} HOS logs from Geotab`);
      return true;
    } catch (error) {
      console.error('Error syncing HOS logs from Geotab:', error);
      return false;
    }
  }

  /**
   * Get DVIR reports from Geotab
   */
  async getDVIRReports(deviceId: string, fromDate: string, toDate: string): Promise<GeotabDVIRRecord[]> {
    try {
      if (!this.sessionId) {
        throw new Error('Not authenticated with Geotab');
      }

      const response = await fetch(`${this.apiBaseUrl}/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'Get',
          params: {
            typeName: 'DVIRLog',
            search: {
              deviceSearch: {
                id: deviceId
              },
              fromDate: fromDate,
              toDate: toDate
            },
            credentials: {
              sessionId: this.sessionId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get DVIR reports: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error getting DVIR reports from Geotab:', error);
      return [];
    }
  }

  /**
   * Sync DVIR reports from Geotab to local database
   */
  async syncDVIRReports(companyId: string, deviceId: string, fromDate: string, toDate: string): Promise<boolean> {
    try {
      const geotabDVIRs = await this.getDVIRReports(deviceId, fromDate, toDate);
      
      for (const dvir of geotabDVIRs) {
        // Convert Geotab inspection type to our format
        let inspectionType: string;
        switch (dvir.inspectionType) {
          case 'PreTrip':
            inspectionType = 'pre_trip';
            break;
          case 'PostTrip':
            inspectionType = 'post_trip';
            break;
          case 'Intermediate':
            inspectionType = 'intermediate';
            break;
          default:
            inspectionType = 'pre_trip';
        }

        await runExecute(`
          INSERT OR REPLACE INTO eld_dvir_reports 
          (driver_id, vehicle_id, inspection_type, inspection_date, defects, is_safe_to_drive, signature, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          dvir.driverId,
          deviceId, // Using deviceId as vehicle_id for now
          inspectionType,
          dvir.dateTime,
          JSON.stringify(dvir.defects),
          dvir.isSafeToDrive ? 1 : 0,
          dvir.signature
        ]);
      }

      console.log(`✅ Synced ${geotabDVIRs.length} DVIR reports from Geotab`);
      return true;
    } catch (error) {
      console.error('Error syncing DVIR reports from Geotab:', error);
      return false;
    }
  }

  /**
   * Full sync of all Geotab data for a company
   */
  async fullSync(companyId: string, fromDate: string, toDate: string): Promise<boolean> {
    try {
      console.log('🔄 Starting full Geotab sync...');

      // Sync devices first
      const devicesSynced = await this.syncDevices(companyId);
      if (!devicesSynced) {
        throw new Error('Failed to sync devices');
      }

      // Get all devices for this company
      const devices = await runQuery(`
        SELECT device_id FROM geotab_devices 
        WHERE company_id = ? AND is_active = 1
      `, [companyId]);

      // Sync HOS logs and DVIR reports for each device
      for (const device of devices) {
        await this.syncHOSLogs(companyId, device.device_id, fromDate, toDate);
        await this.syncDVIRReports(companyId, device.device_id, fromDate, toDate);
      }

      console.log('✅ Full Geotab sync completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Full Geotab sync failed:', error);
      return false;
    }
  }

  /**
   * Check if session is still valid
   */
  private isSessionValid(): boolean {
    if (!this.sessionId || !this.sessionExpiry) {
      return false;
    }
    return new Date() < this.sessionExpiry;
  }

  /**
   * Get stored credentials from database
   */
  async getStoredCredentials(companyId: string): Promise<GeotabCredentials | null> {
    try {
      const result = await runQuery(`
        SELECT server_name, database_name, username, session_id, session_expiry
        FROM geotab_credentials 
        WHERE company_id = ? AND is_active = 1
        ORDER BY updated_at DESC
        LIMIT 1
      `, [companyId]);

      if (result.length === 0) {
        return null;
      }

      const cred = result[0];
      return {
        serverName: cred.server_name,
        databaseName: cred.database_name,
        username: cred.username,
        password: '' // Password is not stored for security
      };
    } catch (error) {
      console.error('Error getting stored Geotab credentials:', error);
      return null;
    }
  }

  /**
   * Test connection to Geotab
   */
  async testConnection(credentials: GeotabCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials: {
            userName: credentials.username,
            password: credentials.password,
            database: credentials.databaseName
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Geotab connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const geotabIntegrationService = new GeotabIntegrationService();
