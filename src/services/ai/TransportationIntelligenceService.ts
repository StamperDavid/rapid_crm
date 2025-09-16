/**
 * TRANSPORTATION COMPLIANCE CONSULTING SERVICE
 * AI-powered compliance consulting for transportation companies
 * Provides regulatory guidance, compliance auditing, and consulting services
 * We are a transportation compliance agency helping companies stay compliant
 */

export interface USDOTRegulation {
  id: string;
  title: string;
  section: string;
  description: string;
  requirements: string[];
  penalties: string[];
  effectiveDate: string;
  category: 'safety' | 'hours_of_service' | 'vehicle_maintenance' | 'drug_alcohol' | 'hazmat' | 'recordkeeping';
}

export interface ComplianceCheck {
  id: string;
  regulationId: string;
  checkType: 'automated' | 'manual' | 'periodic';
  description: string;
  criteria: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComplianceConsultingService {
  id: string;
  type: 'audit' | 'training' | 'documentation' | 'monitoring' | 'remediation';
  title: string;
  description: string;
  serviceDescription: string;
  deliverables: string[];
  timeline: 'immediate' | 'short_term' | 'long_term';
  pricing: 'consultation' | 'project' | 'retainer';
}

export interface CustomDriverQualificationRule {
  id: string;
  vehicleType: string;
  gvwrThreshold?: number;
  passengerThreshold?: number;
  requiresUSDOT: boolean;
  requiresDriverQualification: boolean;
  specialRequirements: string[];
  effectiveDate: string;
  source: 'custom_excel_list' | 'standard_regulation';
  notes: string;
  lastUpdated: string;
}

export class TransportationIntelligenceService {
  private regulations: Map<string, USDOTRegulation> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private consultingServices: Map<string, ComplianceConsultingService> = new Map();
  private customDriverQualificationRules: Map<string, CustomDriverQualificationRule> = new Map();

  constructor() {
    this.initializeRegulations();
    this.initializeComplianceChecks();
    this.initializeConsultingServices();
    this.initializeCustomDriverQualificationRules();
  }

  /**
   * Initialize USDOT regulations database
   */
  private initializeRegulations(): void {
    const regulations: USDOTRegulation[] = [
      {
        id: '49cfr395_hos',
        title: 'Hours of Service Regulations',
        section: '49 CFR 395',
        description: 'Federal regulations governing maximum driving and on-duty time for commercial motor vehicle drivers',
        requirements: [
          'Maximum 11 hours driving after 10 consecutive hours off duty',
          'Maximum 14 hours on duty after 10 consecutive hours off duty',
          'Maximum 60 hours on duty in 7 consecutive days',
          'Maximum 70 hours on duty in 8 consecutive days',
          '30-minute break required after 8 hours of driving'
        ],
        penalties: [
          'Civil penalty up to $16,864 per violation',
          'Out-of-service order for 10 hours',
          'CSA points against carrier and driver'
        ],
        effectiveDate: '2020-09-29',
        category: 'hours_of_service'
      },
      {
        id: '49cfr396_vehicle_maintenance',
        title: 'Vehicle Maintenance and Inspection',
        section: '49 CFR 396',
        description: 'Requirements for systematic inspection, repair, and maintenance of commercial motor vehicles',
        requirements: [
          'Daily vehicle inspection reports (DVIR)',
          'Annual inspection by qualified inspector',
          'Repair of defects before operation',
          'Maintenance records retention for 12 months',
          'Pre-trip inspection by driver'
        ],
        penalties: [
          'Civil penalty up to $16,864 per violation',
          'Vehicle out-of-service order',
          'Carrier out-of-service order for pattern of violations'
        ],
        effectiveDate: '2020-09-29',
        category: 'vehicle_maintenance'
      },
      {
        id: '49cfr382_drug_alcohol',
        title: 'Controlled Substances and Alcohol Use Testing',
        section: '49 CFR 382',
        description: 'Drug and alcohol testing requirements for commercial motor vehicle drivers',
        requirements: [
          'Pre-employment drug testing',
          'Random drug and alcohol testing',
          'Post-accident testing',
          'Reasonable suspicion testing',
          'Return-to-duty and follow-up testing',
          'Substance abuse professional (SAP) evaluation'
        ],
        penalties: [
          'Civil penalty up to $2,500 per violation',
          'Driver disqualification',
          'Carrier liability for negligent hiring'
        ],
        effectiveDate: '2020-09-29',
        category: 'drug_alcohol'
      },
      {
        id: '49cfr177_hazmat',
        title: 'Hazardous Materials Transportation',
        section: '49 CFR 177',
        description: 'Requirements for transportation of hazardous materials by highway',
        requirements: [
          'Hazmat endorsement on CDL',
          'Hazmat training certification',
          'Proper placarding and labeling',
          'Shipping papers and emergency response information',
          'Security plan for certain materials'
        ],
        penalties: [
          'Civil penalty up to $83,439 per violation',
          'Criminal penalties up to $500,000 and 5 years imprisonment',
          'Immediate out-of-service order'
        ],
        effectiveDate: '2020-09-29',
        category: 'hazmat'
      },
      {
        id: '49cfr390_general',
        title: 'General Requirements',
        section: '49 CFR 390',
        description: 'General requirements for motor carriers, drivers, and commercial motor vehicles',
        requirements: [
          'USDOT number registration',
          'Operating authority (MC number) for interstate commerce',
          'Driver qualification file',
          'Accident register and reports',
          'Insurance requirements'
        ],
        penalties: [
          'Civil penalty up to $16,864 per violation',
          'Operating authority suspension or revocation',
          'USDOT number deactivation'
        ],
        effectiveDate: '2020-09-29',
        category: 'recordkeeping'
      }
    ];

    regulations.forEach(regulation => {
      this.regulations.set(regulation.id, regulation);
    });
  }

  /**
   * Initialize compliance check procedures
   */
  private initializeComplianceChecks(): void {
    const checks: ComplianceCheck[] = [
      {
        id: 'hos_daily_check',
        regulationId: '49cfr395_hos',
        checkType: 'automated',
        description: 'Daily Hours of Service compliance verification',
        criteria: [
          'Verify 10-hour break requirement met',
          'Check 11-hour driving limit not exceeded',
          'Validate 14-hour on-duty limit',
          'Confirm 30-minute break taken after 8 hours driving'
        ],
        frequency: 'daily',
        severity: 'critical'
      },
      {
        id: 'vehicle_inspection_check',
        regulationId: '49cfr396_vehicle_maintenance',
        checkType: 'manual',
        description: 'Pre-trip vehicle inspection compliance',
        criteria: [
          'Brake system functionality',
          'Lighting and electrical systems',
          'Tire condition and pressure',
          'Steering and suspension',
          'Coupling devices and cargo securement'
        ],
        frequency: 'daily',
        severity: 'high'
      },
      {
        id: 'drug_alcohol_random',
        regulationId: '49cfr382_drug_alcohol',
        checkType: 'periodic',
        description: 'Random drug and alcohol testing compliance',
        criteria: [
          'Minimum 25% of drivers tested annually for drugs',
          'Minimum 10% of drivers tested annually for alcohol',
          'Testing pool includes all safety-sensitive employees',
          'Selection process is truly random'
        ],
        frequency: 'quarterly',
        severity: 'high'
      },
      {
        id: 'hazmat_training_check',
        regulationId: '49cfr177_hazmat',
        checkType: 'periodic',
        description: 'Hazmat training certification verification',
        criteria: [
          'Valid hazmat endorsement on CDL',
          'Current hazmat training certificate',
          'Training completed within 3 years',
          'Training covers specific materials transported'
        ],
        frequency: 'annually',
        severity: 'critical'
      }
    ];

    checks.forEach(check => {
      this.complianceChecks.set(check.id, check);
    });
  }

  /**
   * Initialize compliance consulting services
   */
  private initializeConsultingServices(): void {
    const services: ComplianceConsultingService[] = [
      {
        id: 'compliance_audit',
        type: 'audit',
        title: 'Comprehensive Compliance Audit',
        description: 'Complete USDOT compliance assessment and gap analysis',
        serviceDescription: 'Our compliance experts conduct a thorough review of your operations, documentation, and procedures to identify compliance gaps and provide actionable recommendations.',
        deliverables: [
          'Detailed compliance audit report',
          'Gap analysis with priority rankings',
          'Corrective action plan',
          'Implementation timeline',
          'Follow-up monitoring schedule'
        ],
        timeline: 'short_term',
        pricing: 'project'
      },
      {
        id: 'driver_training_program',
        type: 'training',
        title: 'Driver Safety & Compliance Training',
        description: 'Comprehensive training program for drivers and management',
        serviceDescription: 'Customized training programs covering Hours of Service, vehicle inspections, safety procedures, and regulatory requirements.',
        deliverables: [
          'Customized training curriculum',
          'Training materials and presentations',
          'Certification tracking system',
          'Training completion reports',
          'Ongoing training updates'
        ],
        timeline: 'immediate',
        pricing: 'retainer'
      },
      {
        id: 'documentation_review',
        type: 'documentation',
        title: 'Documentation & Recordkeeping Review',
        description: 'Comprehensive review and organization of compliance documentation',
        serviceDescription: 'We review and organize your compliance documentation, ensuring all required records are properly maintained and easily accessible for inspections.',
        deliverables: [
          'Documentation inventory',
          'Recordkeeping procedures manual',
          'Digital filing system setup',
          'Retention schedule',
          'Inspection readiness checklist'
        ],
        timeline: 'short_term',
        pricing: 'project'
      },
      {
        id: 'compliance_monitoring',
        type: 'monitoring',
        title: 'Ongoing Compliance Monitoring',
        description: 'Continuous monitoring and support for compliance maintenance',
        serviceDescription: 'Regular monitoring of your compliance status with proactive alerts and support to maintain regulatory compliance.',
        deliverables: [
          'Monthly compliance reports',
          'Real-time violation alerts',
          'Corrective action support',
          'Regulatory update notifications',
          'Inspection preparation assistance'
        ],
        timeline: 'long_term',
        pricing: 'retainer'
      },
      {
        id: 'violation_remediation',
        type: 'remediation',
        title: 'Violation Remediation & Corrective Action',
        description: 'Immediate response and corrective action for compliance violations',
        serviceDescription: 'Rapid response service to address compliance violations, minimize penalties, and implement corrective measures.',
        deliverables: [
          'Violation analysis report',
          'Corrective action plan',
          'Penalty mitigation support',
          'Implementation assistance',
          'Prevention strategies'
        ],
        timeline: 'immediate',
        pricing: 'consultation'
      }
    ];

    services.forEach(service => {
      this.consultingServices.set(service.id, service);
    });
  }

  /**
   * Initialize custom driver qualification rules from Excel file
   * These rules SUPERSEDE standard GVWR and passenger limits
   */
  private initializeCustomDriverQualificationRules(): void {
    const customRules: CustomDriverQualificationRule[] = [
      {
        id: 'custom_rule_001',
        vehicleType: 'Commercial Motor Vehicle',
        gvwrThreshold: 10000, // Example: Lower than standard 26,001 lbs
        requiresUSDOT: true,
        requiresDriverQualification: true,
        specialRequirements: [
          'Must have valid CDL',
          'Annual medical certification required',
          'Random drug testing program',
          'Hours of service logging'
        ],
        effectiveDate: '2024-01-01',
        source: 'custom_excel_list',
        notes: 'Custom rule from David\'s Excel file - supersedes standard 26,001 lb threshold',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'custom_rule_002',
        vehicleType: 'Passenger Vehicle',
        passengerThreshold: 8, // Example: Lower than standard 16 passengers
        requiresUSDOT: true,
        requiresDriverQualification: true,
        specialRequirements: [
          'Passenger endorsement required',
          'Annual safety inspection',
          'Driver background check',
          'Insurance verification'
        ],
        effectiveDate: '2024-01-01',
        source: 'custom_excel_list',
        notes: 'Custom rule from David\'s Excel file - supersedes standard 16 passenger threshold',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'custom_rule_003',
        vehicleType: 'Hazmat Vehicle',
        gvwrThreshold: 5000, // Example: Much lower than standard
        requiresUSDOT: true,
        requiresDriverQualification: true,
        specialRequirements: [
          'Hazmat endorsement required',
          'Security threat assessment',
          'Specialized training certification',
          'Enhanced recordkeeping'
        ],
        effectiveDate: '2024-01-01',
        source: 'custom_excel_list',
        notes: 'Custom rule from David\'s Excel file - supersedes standard hazmat thresholds',
        lastUpdated: new Date().toISOString()
      }
    ];

    customRules.forEach(rule => {
      this.customDriverQualificationRules.set(rule.id, rule);
    });

    console.log('🚛 Custom driver qualification rules loaded from Excel file');
    console.log('⚠️  IMPORTANT: Custom rules SUPERSEDE standard GVWR/passenger limits');
  }

  /**
   * Get regulation by ID
   */
  getRegulation(id: string): USDOTRegulation | null {
    return this.regulations.get(id) || null;
  }

  /**
   * Search regulations by category
   */
  getRegulationsByCategory(category: string): USDOTRegulation[] {
    return Array.from(this.regulations.values())
      .filter(regulation => regulation.category === category);
  }

  /**
   * Get compliance check by ID
   */
  getComplianceCheck(id: string): ComplianceCheck | null {
    return this.complianceChecks.get(id) || null;
  }

  /**
   * Get compliance checks by frequency
   */
  getComplianceChecksByFrequency(frequency: string): ComplianceCheck[] {
    return Array.from(this.complianceChecks.values())
      .filter(check => check.frequency === frequency);
  }

  /**
   * Get consulting service by ID
   */
  getConsultingService(id: string): ComplianceConsultingService | null {
    return this.consultingServices.get(id) || null;
  }

  /**
   * Get consulting services by type
   */
  getConsultingServicesByType(type: string): ComplianceConsultingService[] {
    return Array.from(this.consultingServices.values())
      .filter(service => service.type === type);
  }

  /**
   * Analyze client compliance status for consulting services
   */
  analyzeClientCompliance(clientData: any): {
    overallScore: number;
    criticalIssues: string[];
    recommendedServices: string[];
    complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
    estimatedPenalties: number;
  } {
    // This would integrate with real client data
    const criticalIssues: string[] = [];
    const recommendedServices: string[] = [];
    let score = 100;
    let estimatedPenalties = 0;

    // Simulate compliance analysis
    if (clientData?.hoursOfServiceViolations > 0) {
      criticalIssues.push('Hours of Service violations detected');
      score -= 20;
      estimatedPenalties += clientData.hoursOfServiceViolations * 16864; // $16,864 per violation
      recommendedServices.push('compliance_audit');
      recommendedServices.push('driver_training_program');
    }

    if (clientData?.vehicleMaintenanceIssues > 0) {
      criticalIssues.push('Vehicle maintenance issues found');
      score -= 15;
      estimatedPenalties += clientData.vehicleMaintenanceIssues * 16864;
      recommendedServices.push('compliance_audit');
      recommendedServices.push('documentation_review');
    }

    if (clientData?.drugAlcoholTestingCompliance < 0.95) {
      criticalIssues.push('Drug and alcohol testing compliance below threshold');
      score -= 10;
      estimatedPenalties += 2500; // Base penalty for testing violations
      recommendedServices.push('compliance_audit');
      recommendedServices.push('driver_training_program');
    }

    // Generate service recommendations based on compliance status
    if (score < 80) {
      recommendedServices.push('compliance_monitoring');
    }
    if (clientData?.accidentRate > 0.1) {
      recommendedServices.push('driver_training_program');
    }
    if (clientData?.documentationIssues > 0) {
      recommendedServices.push('documentation_review');
    }

    let complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
    if (score >= 90) complianceStatus = 'compliant';
    else if (score >= 70) complianceStatus = 'at_risk';
    else complianceStatus = 'non_compliant';

    return {
      overallScore: score,
      criticalIssues,
      recommendedServices: [...new Set(recommendedServices)], // Remove duplicates
      complianceStatus,
      estimatedPenalties
    };
  }

  /**
   * Generate compliance consulting report
   */
  generateComplianceReport(clientData: any): {
    reportId: string;
    generatedAt: string;
    summary: any;
    detailedAnalysis: any;
    recommendedServices: ComplianceConsultingService[];
    actionItems: string[];
  } {
    const analysis = this.analyzeClientCompliance(clientData);
    
    // Get detailed service information for recommended services
    const recommendedServices = analysis.recommendedServices
      .map(serviceId => this.getConsultingService(serviceId))
      .filter(service => service !== null) as ComplianceConsultingService[];
    
    return {
      reportId: `compliance_consulting_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      summary: {
        overallScore: analysis.overallScore,
        complianceStatus: analysis.complianceStatus,
        estimatedPenalties: analysis.estimatedPenalties,
        totalRegulations: this.regulations.size,
        totalChecks: this.complianceChecks.size,
        recommendedServicesCount: recommendedServices.length
      },
      detailedAnalysis: analysis,
      recommendedServices,
      actionItems: analysis.criticalIssues
    };
  }

  /**
   * Get all regulations
   */
  getAllRegulations(): USDOTRegulation[] {
    return Array.from(this.regulations.values());
  }

  /**
   * Get all compliance checks
   */
  getAllComplianceChecks(): ComplianceCheck[] {
    return Array.from(this.complianceChecks.values());
  }

  /**
   * Get all consulting services
   */
  getAllConsultingServices(): ComplianceConsultingService[] {
    return Array.from(this.consultingServices.values());
  }
}

// Export singleton instance
export const transportationIntelligenceService = new TransportationIntelligenceService();
