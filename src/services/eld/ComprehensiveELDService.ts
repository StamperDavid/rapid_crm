/**
 * Comprehensive ELD Compliance Service
 * Based on Foley's compliance model - a complete DOT compliance solution for transportation companies
 * Uses ONLY the existing rapid_crm.db database - no external dependencies
 */

// Core ELD Interfaces
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
  inspection_type: 'pre_trip' | 'post_trip' | 'intermediate';
  inspection_date: string;
  defects: any[]; // JSON array of defects
  is_safe_to_drive: boolean;
  signature?: string;
  created_at: string;
  updated_at: string;
}

export interface ELDAlert {
  id: number;
  driver_id: string;
  alert_type: 'hos_violation' | 'dvir_defect' | 'maintenance_due' | 'license_expiry' | 'medical_expiry';
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

// Foley-style Compliance Service Interfaces
export interface ComplianceService {
  id: string;
  company_id: string;
  service_type: 'ELD_Hardware' | 'ELD_Software' | 'HOS_Training' | 'DOT_Physicals' | 'Drug_Testing' | 'Clearinghouse' | 'IFTA_Filing' | 'IRP_Renewal';
  service_level: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  start_date: string;
  renewal_date: string;
  monthly_cost: number;
  setup_fee: number;
  features: string[];
  compliance_requirements: string[];
  created_at: string;
  updated_at: string;
}

export interface DriverQualificationFile {
  id: string;
  driver_id: string;
  company_id: string;
  documents: {
    cdl_license: { url: string; expiry_date: string; status: 'valid' | 'expired' | 'expiring_soon' };
    medical_certificate: { url: string; expiry_date: string; status: 'valid' | 'expired' | 'expiring_soon' };
    drug_test: { url: string; test_date: string; status: 'passed' | 'failed' | 'pending' };
    background_check: { url: string; check_date: string; status: 'passed' | 'failed' | 'pending' };
    employment_application: { url: string; status: 'complete' | 'incomplete' };
    previous_employment_verification: { url: string; status: 'complete' | 'incomplete' };
    motor_vehicle_record: { url: string; status: 'current' | 'outdated' };
  };
  audit_ready: boolean;
  compliance_score: number;
  last_audit_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DOTComplianceStatus {
  company_id: string;
  overall_score: number;
  critical_violations: number;
  warning_violations: number;
  last_audit_date?: string;
  next_audit_due?: string;
  compliance_areas: {
    driver_qualification: { score: number; violations: number; status: 'compliant' | 'non_compliant' | 'at_risk' };
    hours_of_service: { score: number; violations: number; status: 'compliant' | 'non_compliant' | 'at_risk' };
    vehicle_maintenance: { score: number; violations: number; status: 'compliant' | 'non_compliant' | 'at_risk' };
    drug_alcohol_testing: { score: number; violations: number; status: 'compliant' | 'non_compliant' | 'at_risk' };
    hazmat_compliance: { score: number; violations: number; status: 'compliant' | 'non_compliant' | 'at_risk' };
  };
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

class ComprehensiveELDService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  // ===== CORE ELD FUNCTIONALITY =====

  /**
   * Store HOS (Hours of Service) log entry
   */
  async storeHOSLog(logData: Omit<HOSLog, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/hos-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...logData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error storing HOS log:', error);
      return false;
    }
  }

  /**
   * Get HOS logs for a driver or date range
   */
  async getHOSLogs(filters: {
    driver_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  } = {}): Promise<HOSLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters.driver_id) params.append('driver_id', filters.driver_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${this.baseUrl}/eld/hos-logs?${params}`);
      const data = await response.json();
      return data.success ? data.logs : [];
    } catch (error) {
      console.error('Error fetching HOS logs:', error);
      return [];
    }
  }

  /**
   * Store DVIR (Driver Vehicle Inspection Report)
   */
  async storeDVIRReport(reportData: Omit<DVIRReport, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/dvir-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error storing DVIR report:', error);
      return false;
    }
  }

  /**
   * Get DVIR reports
   */
  async getDVIRReports(filters: {
    driver_id?: string;
    vehicle_id?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<DVIRReport[]> {
    try {
      const params = new URLSearchParams();
      if (filters.driver_id) params.append('driver_id', filters.driver_id);
      if (filters.vehicle_id) params.append('vehicle_id', filters.vehicle_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`${this.baseUrl}/eld/dvir-reports?${params}`);
      const data = await response.json();
      return data.success ? data.reports : [];
    } catch (error) {
      console.error('Error fetching DVIR reports:', error);
      return [];
    }
  }

  /**
   * Create compliance alert
   */
  async createAlert(alertData: Omit<ELDAlert, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alertData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating alert:', error);
      return false;
    }
  }

  /**
   * Get compliance alerts
   */
  async getAlerts(filters: {
    driver_id?: string;
    alert_type?: string;
    severity?: string;
    is_resolved?: boolean;
  } = {}): Promise<ELDAlert[]> {
    try {
      const params = new URLSearchParams();
      if (filters.driver_id) params.append('driver_id', filters.driver_id);
      if (filters.alert_type) params.append('alert_type', filters.alert_type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.is_resolved !== undefined) params.append('is_resolved', filters.is_resolved.toString());

      const response = await fetch(`${this.baseUrl}/eld/alerts?${params}`);
      const data = await response.json();
      return data.success ? data.alerts : [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  // ===== FOLEY-STYLE COMPLIANCE SERVICES =====

  /**
   * Register a new compliance service for a company
   */
  async registerComplianceService(serviceData: Omit<ComplianceService, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/compliance-services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceData,
          id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error registering compliance service:', error);
      return false;
    }
  }

  /**
   * Get compliance services for a company
   */
  async getCompanyComplianceServices(companyId: string): Promise<ComplianceService[]> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/compliance-services/company/${companyId}`);
      const data = await response.json();
      return data.success ? data.services : [];
    } catch (error) {
      console.error('Error fetching compliance services:', error);
      return [];
    }
  }

  /**
   * Create or update driver qualification file
   */
  async updateDriverQualificationFile(fileData: Omit<DriverQualificationFile, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/driver-qualification-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fileData,
          id: `dqf_${fileData.driver_id}_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating driver qualification file:', error);
      return false;
    }
  }

  /**
   * Get driver qualification file
   */
  async getDriverQualificationFile(driverId: string): Promise<DriverQualificationFile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/driver-qualification-files/${driverId}`);
      const data = await response.json();
      return data.success ? data.file : null;
    } catch (error) {
      console.error('Error fetching driver qualification file:', error);
      return null;
    }
  }

  /**
   * Get comprehensive DOT compliance status for a company
   */
  async getDOTComplianceStatus(companyId: string): Promise<DOTComplianceStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/compliance-status/${companyId}`);
      const data = await response.json();
      return data.success ? data.status : null;
    } catch (error) {
      console.error('Error fetching DOT compliance status:', error);
      return null;
    }
  }

  /**
   * Calculate compliance score based on various factors
   */
  async calculateComplianceScore(companyId: string): Promise<{
    overall_score: number;
    breakdown: {
      driver_qualification: number;
      hours_of_service: number;
      vehicle_maintenance: number;
      drug_alcohol_testing: number;
      hazmat_compliance: number;
    };
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/eld/compliance-score/${companyId}`);
      const data = await response.json();
      return data.success ? data.score : {
        overall_score: 0,
        breakdown: {
          driver_qualification: 0,
          hours_of_service: 0,
          vehicle_maintenance: 0,
          drug_alcohol_testing: 0,
          hazmat_compliance: 0
        },
        recommendations: []
      };
    } catch (error) {
      console.error('Error calculating compliance score:', error);
      return {
        overall_score: 0,
        breakdown: {
          driver_qualification: 0,
          hours_of_service: 0,
          vehicle_maintenance: 0,
          drug_alcohol_testing: 0,
          hazmat_compliance: 0
        },
        recommendations: []
      };
    }
  }

  // ===== SERVICE MANAGEMENT =====

  /**
   * Get available compliance service packages
   */
  getAvailableServicePackages(): ComplianceService[] {
    return [
      {
        id: 'basic_eld',
        company_id: '',
        service_type: 'ELD_Software',
        service_level: 'basic',
        status: 'active',
        start_date: '',
        renewal_date: '',
        monthly_cost: 25,
        setup_fee: 100,
        features: [
          'Basic HOS logging',
          'DVIR reports',
          'Driver alerts',
          'Basic compliance monitoring'
        ],
        compliance_requirements: ['FMCSA ELD mandate'],
        created_at: '',
        updated_at: ''
      },
      {
        id: 'standard_eld',
        company_id: '',
        service_type: 'ELD_Software',
        service_level: 'standard',
        status: 'active',
        start_date: '',
        renewal_date: '',
        monthly_cost: 45,
        setup_fee: 150,
        features: [
          'Advanced HOS logging',
          'DVIR reports with photos',
          'Real-time alerts',
          'Compliance monitoring',
          'Driver qualification file management',
          'Basic reporting'
        ],
        compliance_requirements: ['FMCSA ELD mandate', 'DOT driver qualification'],
        created_at: '',
        updated_at: ''
      },
      {
        id: 'premium_eld',
        company_id: '',
        service_type: 'ELD_Software',
        service_level: 'premium',
        status: 'active',
        start_date: '',
        renewal_date: '',
        monthly_cost: 75,
        setup_fee: 200,
        features: [
          'Full HOS compliance suite',
          'Advanced DVIR with AI defect detection',
          'Real-time alerts and notifications',
          'Comprehensive compliance monitoring',
          'Driver qualification file management',
          'DOT physical management',
          'Drug testing coordination',
          'IFTA filing assistance',
          'Audit preparation support'
        ],
        compliance_requirements: ['FMCSA ELD mandate', 'DOT driver qualification', 'DOT physicals', 'Drug testing', 'IFTA filing'],
        created_at: '',
        updated_at: ''
      },
      {
        id: 'enterprise_eld',
        company_id: '',
        service_type: 'ELD_Software',
        service_level: 'enterprise',
        status: 'active',
        start_date: '',
        renewal_date: '',
        monthly_cost: 125,
        setup_fee: 300,
        features: [
          'Complete DOT compliance suite',
          'AI-powered compliance monitoring',
          'Real-time alerts and notifications',
          'Driver qualification file management',
          'DOT physical management',
          'Drug testing coordination',
          'FMCSA Clearinghouse management',
          'IFTA filing assistance',
          'IRP renewal management',
          'Dedicated account manager',
          '24/7 compliance support',
          'Custom reporting and analytics',
          'Audit preparation and support',
          'Regulatory updates and training'
        ],
        compliance_requirements: ['FMCSA ELD mandate', 'DOT driver qualification', 'DOT physicals', 'Drug testing', 'IFTA filing', 'IRP renewal', 'Clearinghouse management'],
        created_at: '',
        updated_at: ''
      }
    ];
  }

  /**
   * Get service pricing information
   */
  getServicePricing(): {
    [key: string]: {
      monthly_cost: number;
      setup_fee: number;
      features: string[];
      target_companies: string;
    };
  } {
    return {
      basic: {
        monthly_cost: 25,
        setup_fee: 100,
        features: ['Basic ELD compliance', 'HOS logging', 'DVIR reports'],
        target_companies: 'Small fleets (1-5 vehicles)'
      },
      standard: {
        monthly_cost: 45,
        setup_fee: 150,
        features: ['Standard ELD compliance', 'Driver qualification files', 'Basic reporting'],
        target_companies: 'Medium fleets (6-25 vehicles)'
      },
      premium: {
        monthly_cost: 75,
        setup_fee: 200,
        features: ['Premium ELD compliance', 'DOT physicals', 'Drug testing', 'IFTA filing'],
        target_companies: 'Large fleets (26-100 vehicles)'
      },
      enterprise: {
        monthly_cost: 125,
        setup_fee: 300,
        features: ['Complete DOT compliance', 'Dedicated support', 'Custom reporting', 'Audit support'],
        target_companies: 'Enterprise fleets (100+ vehicles)'
      }
    };
  }
}

// Export singleton instance
export const comprehensiveELDService = new ComprehensiveELDService();
