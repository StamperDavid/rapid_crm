import { Lead } from '../../types/schema';

export interface LeadScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  category: 'Hot' | 'Warm' | 'Cold';
  breakdown: {
    companySize: number;
    businessType: number;
    compliance: number;
    engagement: number;
    budget: number;
    timeline: number;
    geographic: number;
  };
  recommendations: string[];
  riskFactors: string[];
}

export interface ScoringCriteria {
  companySize: {
    [key: string]: number;
  };
  businessType: {
    [key: string]: number;
  };
  compliance: {
    [key: string]: number;
  };
  engagement: {
    [key: string]: number;
  };
  budget: {
    [key: string]: number;
  };
  timeline: {
    [key: string]: number;
  };
  geographic: {
    [key: string]: number;
  };
}

export class LeadScoringService {
  private static readonly SCORING_CRITERIA: ScoringCriteria = {
    companySize: {
      '1-5': 30,      // Small fleet - high compliance needs per vehicle
      '6-20': 60,     // Medium fleet - sweet spot for compliance services
      '21-50': 80,    // Large fleet - significant compliance needs
      '50+': 100,     // Enterprise fleet - major compliance opportunities
      'Unknown': 10   // Unknown size
    },
    businessType: {
      'Carrier': 100,         // Highest compliance needs - direct transportation
      'Freight Forwarder': 80, // High compliance needs - logistics coordination
      'Broker': 60,            // Medium compliance needs - freight brokerage
      'Owner Operator': 40,    // Lower compliance needs - single truck
      'Shipper': 20,           // Minimal compliance needs - cargo owner
      'Other': 15              // Other business types
    },
    compliance: {
      'No USDOT + Violations': 100,  // Highest urgency - non-compliant with violations
      'No USDOT': 80,               // High urgency - not compliant
      'USDOT + Poor Safety': 70,    // High urgency - poor safety record
      'USDOT + Average Safety': 40, // Medium urgency - average safety
      'USDOT + Good Safety': 20,    // Lower urgency - good safety
      'Unknown': 10                 // Unknown compliance status
    },
    engagement: {
      'High': 40,    // Multiple touchpoints, responsive
      'Medium': 25,  // Some engagement, occasional response
      'Low': 10,     // Minimal engagement
      'None': 0      // No engagement
    },
    budget: {
      'High': 30,    // $25k+ annual compliance budget
      'Medium': 20,  // $10k-25k annual compliance budget
      'Low': 10,     // $5k-10k annual compliance budget
      'Unknown': 5   // Unknown budget
    },
    timeline: {
      'Immediate': 30,    // Need compliance help within 30 days (urgent)
      'Short Term': 25,   // Need compliance help within 90 days
      'Medium Term': 15,  // Need compliance help within 6 months
      'Long Term': 10,    // Need compliance help within 1 year
      'Unknown': 5        // Unknown timeline
    },
    geographic: {
      'Multi-State': 30,   // Operating in multiple states - complex compliance
      'Regional': 25,      // Operating in 2-3 states - moderate complexity
      'Single State': 15,  // Operating in one state - simpler compliance
      'Local': 10,         // Local operations only - minimal compliance needs
      'Unknown': 5         // Unknown geographic scope
    }
  };

  private static readonly MAX_SCORE = 300;

  static calculateLeadScore(lead: Lead): LeadScore {
    const breakdown = this.calculateScoreBreakdown(lead);
    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const percentage = Math.round((totalScore / this.MAX_SCORE) * 100);
    const grade = this.calculateGrade(percentage);
    const category = this.calculateCategory(percentage);
    const recommendations = this.generateRecommendations(lead, breakdown);
    const riskFactors = this.identifyRiskFactors(lead, breakdown);

    return {
      totalScore,
      maxScore: this.MAX_SCORE,
      percentage,
      grade,
      category,
      breakdown,
      recommendations,
      riskFactors
    };
  }

  private static calculateScoreBreakdown(lead: Lead) {
    return {
      companySize: this.scoreCompanySize(lead),
      businessType: this.scoreBusinessType(lead),
      compliance: this.scoreCompliance(lead),
      engagement: this.scoreEngagement(lead),
      budget: this.scoreBudget(lead),
      timeline: this.scoreTimeline(lead),
      geographic: this.scoreGeographic(lead)
    };
  }

  private static scoreCompanySize(lead: Lead): number {
    if (!lead.fleetSize) return this.SCORING_CRITERIA.companySize['Unknown'];
    
    const fleetSize = lead.fleetSize;
    if (fleetSize <= 5) return this.SCORING_CRITERIA.companySize['1-5'];
    if (fleetSize <= 20) return this.SCORING_CRITERIA.companySize['6-20'];
    if (fleetSize <= 50) return this.SCORING_CRITERIA.companySize['21-50'];
    return this.SCORING_CRITERIA.companySize['50+'];
  }

  private static scoreBusinessType(lead: Lead): number {
    if (!lead.businessType) return this.SCORING_CRITERIA.businessType['Other'];
    return this.SCORING_CRITERIA.businessType[lead.businessType] || this.SCORING_CRITERIA.businessType['Other'];
  }

  private static scoreCompliance(lead: Lead): number {
    // For a compliance agency, non-compliant leads are the highest priority
    if (!lead.hasUSDOT) {
      // Check if they have violations or are in trouble
      const hasViolations = lead.painPoints?.some(point => 
        point.toLowerCase().includes('violation') || 
        point.toLowerCase().includes('fine') ||
        point.toLowerCase().includes('audit') ||
        point.toLowerCase().includes('shutdown')
      );
      return hasViolations ? 
        this.SCORING_CRITERIA.compliance['No USDOT + Violations'] : 
        this.SCORING_CRITERIA.compliance['No USDOT'];
    }
    
    // If they have USDOT, check their safety record and compliance needs
    const hasComplianceIssues = lead.painPoints?.some(point => 
      point.toLowerCase().includes('safety') || 
      point.toLowerCase().includes('compliance') ||
      point.toLowerCase().includes('audit') ||
      point.toLowerCase().includes('violation')
    );
    
    if (hasComplianceIssues) {
      return this.SCORING_CRITERIA.compliance['USDOT + Poor Safety'];
    }
    
    // Check fleet size for compliance complexity
    if (lead.fleetSize && lead.fleetSize > 20) {
      return this.SCORING_CRITERIA.compliance['USDOT + Average Safety'];
    } else if (lead.fleetSize && lead.fleetSize > 5) {
      return this.SCORING_CRITERIA.compliance['USDOT + Good Safety'];
    } else {
      return this.SCORING_CRITERIA.compliance['USDOT + Good Safety'];
    }
  }

  private static scoreEngagement(lead: Lead): number {
    // This would be calculated based on actual engagement data
    // For now, we'll use lead source as a proxy
    const highEngagementSources = ['Website', 'Referral', 'Trade Show'];
    const mediumEngagementSources = ['Email Campaign', 'Social Media', 'LinkedIn'];
    
    if (highEngagementSources.includes(lead.leadSource)) {
      return this.SCORING_CRITERIA.engagement['High'];
    } else if (mediumEngagementSources.includes(lead.leadSource)) {
      return this.SCORING_CRITERIA.engagement['Medium'];
    } else {
      return this.SCORING_CRITERIA.engagement['Low'];
    }
  }

  private static scoreBudget(lead: Lead): number {
    if (!lead.budget) return this.SCORING_CRITERIA.budget['Unknown'];
    
    // Compliance services typically range from $5k-50k annually
    if (lead.budget >= 25000) return this.SCORING_CRITERIA.budget['High'];
    if (lead.budget >= 10000) return this.SCORING_CRITERIA.budget['Medium'];
    return this.SCORING_CRITERIA.budget['Low'];
  }

  private static scoreTimeline(lead: Lead): number {
    if (!lead.timeline) return this.SCORING_CRITERIA.timeline['Unknown'];
    
    const timeline = lead.timeline.toLowerCase();
    
    // Check for compliance urgency keywords
    const urgentKeywords = ['immediate', 'urgent', 'asap', 'emergency', 'audit', 'violation', 'fine', 'shutdown'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => timeline.includes(keyword));
    
    if (hasUrgentKeywords || timeline.includes('30 day') || timeline.includes('immediately')) {
      return this.SCORING_CRITERIA.timeline['Immediate'];
    } else if (timeline.includes('month') || timeline.includes('60') || timeline.includes('90')) {
      return this.SCORING_CRITERIA.timeline['Short Term'];
    } else if (timeline.includes('6 month') || timeline.includes('quarter') || timeline.includes('180')) {
      return this.SCORING_CRITERIA.timeline['Medium Term'];
    } else {
      return this.SCORING_CRITERIA.timeline['Long Term'];
    }
  }

  private static scoreGeographic(lead: Lead): number {
    if (!lead.operatingStates || lead.operatingStates.length === 0) {
      return this.SCORING_CRITERIA.geographic['Unknown'];
    }
    
    const stateCount = lead.operatingStates.length;
    if (stateCount >= 5) return this.SCORING_CRITERIA.geographic['Multi-State'];
    if (stateCount >= 2) return this.SCORING_CRITERIA.geographic['Regional'];
    return this.SCORING_CRITERIA.geographic['Single State'];
  }

  private static calculateGrade(percentage: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private static calculateCategory(percentage: number): 'Hot' | 'Warm' | 'Cold' {
    if (percentage >= 80) return 'Hot';
    if (percentage >= 60) return 'Warm';
    return 'Cold';
  }

  private static generateRecommendations(lead: Lead, breakdown: any): string[] {
    const recommendations: string[] = [];
    
    if (breakdown.companySize < 30) {
      recommendations.push('Focus on fleet expansion opportunities');
    }
    
    if (breakdown.compliance < 20) {
      recommendations.push('Emphasize compliance and safety benefits');
    }
    
    if (breakdown.engagement < 15) {
      recommendations.push('Increase engagement through targeted outreach');
    }
    
    if (breakdown.budget < 15) {
      recommendations.push('Present cost-effective solutions');
    }
    
    if (breakdown.timeline < 15) {
      recommendations.push('Understand their timeline and urgency');
    }
    
    if (breakdown.geographic < 15) {
      recommendations.push('Highlight multi-state service capabilities');
    }
    
    return recommendations;
  }

  private static identifyRiskFactors(lead: Lead, breakdown: any): string[] {
    const riskFactors: string[] = [];
    
    if (breakdown.companySize < 20) {
      riskFactors.push('Small fleet size may limit service needs');
    }
    
    if (breakdown.compliance === 0) {
      riskFactors.push('No USDOT number - compliance concerns');
    }
    
    if (breakdown.engagement < 10) {
      riskFactors.push('Low engagement - may be difficult to convert');
    }
    
    if (breakdown.budget < 10) {
      riskFactors.push('Limited budget may affect deal size');
    }
    
    if (breakdown.timeline < 10) {
      riskFactors.push('Unclear timeline - may be long sales cycle');
    }
    
    return riskFactors;
  }

  static getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  static getCategoryColor(category: string): string {
    switch (category) {
      case 'Hot': return 'text-red-600 bg-red-100';
      case 'Warm': return 'text-yellow-600 bg-yellow-100';
      case 'Cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}
