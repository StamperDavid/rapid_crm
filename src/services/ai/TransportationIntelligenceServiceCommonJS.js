/**
 * TRANSPORTATION INTELLIGENCE SERVICE - CommonJS Version
 * Industry-specific AI knowledge base for transportation and USDOT compliance
 */

class TransportationIntelligenceService {
  constructor() {
    this.regulations = new Map();
    this.complianceChecks = new Map();
    this.fleetInsights = new Map();
    this.initializeRegulations();
    this.initializeComplianceChecks();
    this.initializeFleetInsights();
  }

  /**
   * Initialize USDOT regulations database
   */
  initializeRegulations() {
    const regulations = [
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
  initializeComplianceChecks() {
    const checks = [
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
   * Initialize fleet management insights
   */
  initializeFleetInsights() {
    const insights = [
      {
        id: 'fuel_efficiency_optimization',
        type: 'efficiency',
        title: 'Fuel Efficiency Optimization',
        description: 'Implementing fuel-efficient driving practices and route optimization',
        recommendation: 'Train drivers on fuel-efficient driving techniques and implement GPS route optimization',
        impact: 'high',
        implementation: 'short_term'
      },
      {
        id: 'predictive_maintenance',
        type: 'cost',
        title: 'Predictive Maintenance Program',
        description: 'Using telematics data to predict and prevent vehicle breakdowns',
        recommendation: 'Implement telematics system with predictive maintenance alerts',
        impact: 'high',
        implementation: 'medium_term'
      },
      {
        id: 'driver_safety_training',
        type: 'safety',
        title: 'Advanced Driver Safety Training',
        description: 'Comprehensive safety training program to reduce accidents and violations',
        recommendation: 'Implement monthly safety training sessions and defensive driving courses',
        impact: 'high',
        implementation: 'immediate'
      },
      {
        id: 'compliance_automation',
        type: 'compliance',
        title: 'Automated Compliance Monitoring',
        description: 'Automated systems to monitor and ensure regulatory compliance',
        recommendation: 'Deploy ELD system with automated compliance reporting and alerts',
        impact: 'high',
        implementation: 'immediate'
      },
      {
        id: 'cost_analysis_optimization',
        type: 'cost',
        title: 'Operating Cost Analysis and Optimization',
        description: 'Detailed analysis of operating costs to identify savings opportunities',
        recommendation: 'Implement cost tracking system and monthly cost analysis reports',
        impact: 'medium',
        implementation: 'short_term'
      }
    ];

    insights.forEach(insight => {
      this.fleetInsights.set(insight.id, insight);
    });
  }

  /**
   * Get all regulations
   */
  getAllRegulations() {
    return Array.from(this.regulations.values());
  }

  /**
   * Get all compliance checks
   */
  getAllComplianceChecks() {
    return Array.from(this.complianceChecks.values());
  }

  /**
   * Get all fleet insights
   */
  getAllFleetInsights() {
    return Array.from(this.fleetInsights.values());
  }

  /**
   * Analyze fleet compliance status
   */
  analyzeFleetCompliance(fleetData) {
    const criticalIssues = [];
    const recommendations = [];
    let score = 100;

    // Simulate compliance analysis
    if (fleetData?.hoursOfServiceViolations > 0) {
      criticalIssues.push('Hours of Service violations detected');
      score -= 20;
    }

    if (fleetData?.vehicleMaintenanceIssues > 0) {
      criticalIssues.push('Vehicle maintenance issues found');
      score -= 15;
    }

    if (fleetData?.drugAlcoholTestingCompliance < 0.95) {
      criticalIssues.push('Drug and alcohol testing compliance below threshold');
      score -= 10;
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push('Implement automated compliance monitoring system');
    }
    if (fleetData?.accidentRate > 0.1) {
      recommendations.push('Increase driver safety training frequency');
    }
    if (fleetData?.fuelEfficiency < 6.5) {
      recommendations.push('Implement fuel efficiency optimization program');
    }

    let complianceStatus;
    if (score >= 90) complianceStatus = 'compliant';
    else if (score >= 70) complianceStatus = 'at_risk';
    else complianceStatus = 'non_compliant';

    return {
      overallScore: score,
      criticalIssues,
      recommendations,
      complianceStatus
    };
  }
}

// Export singleton instance using CommonJS
const transportationIntelligenceService = new TransportationIntelligenceService();
module.exports = { transportationIntelligenceService };
