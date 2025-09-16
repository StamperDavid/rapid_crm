/**
 * USDOT COMPLIANCE CONSULTING AGENT
 * AI-powered compliance consultant for transportation companies
 * Provides expert guidance, auditing, and consulting services
 * We are a transportation compliance agency helping companies stay compliant
 */

import { transportationIntelligenceService } from './TransportationIntelligenceService';

export interface ComplianceViolation {
  id: string;
  type: 'hours_of_service' | 'vehicle_maintenance' | 'drug_alcohol' | 'hazmat' | 'recordkeeping';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  regulation: string;
  penalty: string;
  correctiveAction: string;
  deadline: string;
}

export interface ComplianceRecommendation {
  id: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  category: 'safety' | 'efficiency' | 'cost' | 'compliance';
  title: string;
  description: string;
  implementation: string;
  expectedBenefit: string;
  estimatedCost: 'low' | 'medium' | 'high';
}

export interface ClientComplianceStatus {
  clientId: string;
  companyName: string;
  overallScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  violations: ComplianceViolation[];
  recommendedServices: string[];
  estimatedPenalties: number;
  lastUpdated: string;
}

export class USDOTComplianceAgent {
  private intelligenceService = transportationIntelligenceService;

  constructor() {
    console.log('🏢 USDOT Compliance Consulting Agent initialized - Ready to help transportation companies stay compliant');
  }

  /**
   * Analyze client compliance status for consulting services
   */
  async analyzeClientCompliance(clientData: any): Promise<ClientComplianceStatus> {
    console.log(`🔍 Analyzing compliance for client: ${clientData.companyName || clientData.clientId || 'unknown'}`);

    // Get compliance analysis from intelligence service
    const analysis = this.intelligenceService.analyzeClientCompliance(clientData);
    
    // Generate specific violations
    const violations = await this.identifyViolations(clientData);
    
    // Get recommended consulting services
    const recommendedServices = analysis.recommendedServices;

    return {
      clientId: clientData.clientId || 'unknown',
      companyName: clientData.companyName || 'Unknown Company',
      overallScore: analysis.overallScore,
      status: analysis.complianceStatus,
      violations,
      recommendedServices,
      estimatedPenalties: analysis.estimatedPenalties,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Identify specific compliance violations for client
   */
  private async identifyViolations(clientData: any): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Hours of Service violations
    if (fleetData?.hoursOfServiceViolations > 0) {
      const hosRegulation = this.intelligenceService.getRegulation('49cfr395_hos');
      violations.push({
        id: `hos_violation_${Date.now()}`,
        type: 'hours_of_service',
        severity: 'critical',
        description: `${fleetData.hoursOfServiceViolations} Hours of Service violations detected`,
        regulation: hosRegulation?.section || '49 CFR 395',
        penalty: hosRegulation?.penalties[0] || 'Civil penalty up to $16,864 per violation',
        correctiveAction: 'Implement ELD system and driver training on HOS regulations',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
    }

    // Vehicle maintenance violations
    if (fleetData?.vehicleMaintenanceIssues > 0) {
      const maintenanceRegulation = this.intelligenceService.getRegulation('49cfr396_vehicle_maintenance');
      violations.push({
        id: `maintenance_violation_${Date.now()}`,
        type: 'vehicle_maintenance',
        severity: 'high',
        description: `${fleetData.vehicleMaintenanceIssues} vehicle maintenance issues found`,
        regulation: maintenanceRegulation?.section || '49 CFR 396',
        penalty: maintenanceRegulation?.penalties[0] || 'Civil penalty up to $16,864 per violation',
        correctiveAction: 'Schedule immediate vehicle inspections and repairs',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
      });
    }

    // Drug and alcohol testing compliance
    if (fleetData?.drugAlcoholTestingCompliance < 0.95) {
      const drugRegulation = this.intelligenceService.getRegulation('49cfr382_drug_alcohol');
      violations.push({
        id: `drug_testing_violation_${Date.now()}`,
        type: 'drug_alcohol',
        severity: 'high',
        description: `Drug and alcohol testing compliance at ${(fleetData.drugAlcoholTestingCompliance * 100).toFixed(1)}% (minimum 95% required)`,
        regulation: drugRegulation?.section || '49 CFR 382',
        penalty: drugRegulation?.penalties[0] || 'Civil penalty up to $2,500 per violation',
        correctiveAction: 'Schedule additional random testing to meet compliance threshold',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
      });
    }

    return violations;
  }

  /**
   * Generate compliance recommendations
   */
  private async generateRecommendations(fleetData: any, analysis: any): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];

    // High-priority recommendations based on violations
    if (analysis.overallScore < 80) {
      recommendations.push({
        id: `automated_monitoring_${Date.now()}`,
        priority: 'immediate',
        category: 'compliance',
        title: 'Implement Automated Compliance Monitoring',
        description: 'Deploy ELD system with automated compliance reporting and real-time alerts',
        implementation: 'Install ELD devices in all vehicles and train drivers on proper usage',
        expectedBenefit: 'Reduce compliance violations by 90% and improve CSA scores',
        estimatedCost: 'medium'
      });
    }

    // Safety recommendations
    if (fleetData?.accidentRate > 0.1) {
      recommendations.push({
        id: `safety_training_${Date.now()}`,
        priority: 'high',
        category: 'safety',
        title: 'Enhanced Driver Safety Training Program',
        description: 'Implement comprehensive safety training including defensive driving and accident prevention',
        implementation: 'Monthly safety meetings, quarterly training sessions, and annual certification',
        expectedBenefit: 'Reduce accident rate by 50% and improve driver safety scores',
        estimatedCost: 'low'
      });
    }

    // Efficiency recommendations
    if (fleetData?.fuelEfficiency < 6.5) {
      recommendations.push({
        id: `fuel_efficiency_${Date.now()}`,
        priority: 'medium',
        category: 'efficiency',
        title: 'Fuel Efficiency Optimization Program',
        description: 'Implement fuel-efficient driving practices and route optimization',
        implementation: 'Driver training on fuel-efficient techniques and GPS route optimization',
        expectedBenefit: 'Reduce fuel costs by 15-20% and improve environmental compliance',
        estimatedCost: 'low'
      });
    }

    // Cost optimization recommendations
    if (fleetData?.maintenanceCosts > fleetData?.revenue * 0.15) {
      recommendations.push({
        id: `predictive_maintenance_${Date.now()}`,
        priority: 'medium',
        category: 'cost',
        title: 'Predictive Maintenance Program',
        description: 'Use telematics data to predict and prevent vehicle breakdowns',
        implementation: 'Install telematics system with predictive maintenance alerts',
        expectedBenefit: 'Reduce maintenance costs by 25% and prevent unexpected breakdowns',
        estimatedCost: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Get regulatory guidance for specific question
   */
  async getRegulatoryGuidance(question: string, context: any = {}): Promise<{
    answer: string;
    regulations: string[];
    recommendations: string[];
    sources: string[];
  }> {
    console.log(`📋 Providing regulatory guidance for: ${question}`);

    // Simple keyword-based guidance (in real implementation, this would use NLP)
    const keywords = question.toLowerCase();
    let answer = '';
    let regulations: string[] = [];
    let recommendations: string[] = [];
    let sources: string[] = [];

    if (keywords.includes('hours') || keywords.includes('hos')) {
      const hosReg = this.intelligenceService.getRegulation('49cfr395_hos');
      answer = `Hours of Service regulations require drivers to take a 10-hour break after 11 hours of driving. Maximum 14 hours on-duty after break. 30-minute break required after 8 hours driving.`;
      regulations = [hosReg?.section || '49 CFR 395'];
      recommendations = ['Implement ELD system for automatic HOS tracking', 'Train drivers on HOS requirements'];
      sources = ['Federal Motor Carrier Safety Administration', '49 CFR 395'];
    } else if (keywords.includes('maintenance') || keywords.includes('inspection')) {
      const maintenanceReg = this.intelligenceService.getRegulation('49cfr396_vehicle_maintenance');
      answer = `Vehicle maintenance requires daily inspections, annual inspections by qualified inspector, and immediate repair of defects. Records must be retained for 12 months.`;
      regulations = [maintenanceReg?.section || '49 CFR 396'];
      recommendations = ['Implement systematic maintenance program', 'Train drivers on pre-trip inspections'];
      sources = ['Federal Motor Carrier Safety Administration', '49 CFR 396'];
    } else if (keywords.includes('drug') || keywords.includes('alcohol')) {
      const drugReg = this.intelligenceService.getRegulation('49cfr382_drug_alcohol');
      answer = `Drug and alcohol testing requires pre-employment, random, post-accident, and reasonable suspicion testing. Minimum 25% random drug testing, 10% alcohol testing annually.`;
      regulations = [drugReg?.section || '49 CFR 382'];
      recommendations = ['Maintain random testing pool', 'Train supervisors on reasonable suspicion'];
      sources = ['Federal Motor Carrier Safety Administration', '49 CFR 382'];
    } else {
      answer = 'Please provide more specific details about your compliance question. I can help with Hours of Service, vehicle maintenance, drug/alcohol testing, hazmat, and general USDOT requirements.';
      regulations = [];
      recommendations = ['Contact FMCSA for specific guidance', 'Consult with compliance specialist'];
      sources = ['Federal Motor Carrier Safety Administration'];
    }

    return {
      answer,
      regulations,
      recommendations,
      sources
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(fleetData: any): Promise<any> {
    console.log(`📊 Generating compliance report for fleet: ${fleetData.fleetId || 'unknown'}`);

    const complianceStatus = await this.analyzeFleetCompliance(fleetData);
    const intelligenceReport = this.intelligenceService.generateComplianceReport(fleetData);

    return {
      ...intelligenceReport,
      agentAnalysis: complianceStatus,
      generatedBy: 'USDOT Compliance Agent',
      confidence: 0.95
    };
  }

  /**
   * Monitor real-time compliance
   */
  async monitorRealTimeCompliance(fleetData: any): Promise<{
    alerts: string[];
    violations: ComplianceViolation[];
    recommendations: ComplianceRecommendation[];
  }> {
    const alerts: string[] = [];
    const complianceStatus = await this.analyzeFleetCompliance(fleetData);

    // Generate real-time alerts
    if (complianceStatus.overallScore < 70) {
      alerts.push('🚨 CRITICAL: Fleet compliance score below acceptable threshold');
    }

    if (complianceStatus.violations.some(v => v.severity === 'critical')) {
      alerts.push('⚠️ CRITICAL: Critical compliance violations detected - immediate action required');
    }

    if (complianceStatus.violations.length > 3) {
      alerts.push('⚠️ WARNING: Multiple compliance violations detected');
    }

    return {
      alerts,
      violations: complianceStatus.violations,
      recommendations: complianceStatus.recommendations
    };
  }
}

// Export singleton instance
export const usdotComplianceAgent = new USDOTComplianceAgent();
