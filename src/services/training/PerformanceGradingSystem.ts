/**
 * REGULATION TRAINING PERFORMANCE GRADING SYSTEM
 * 
 * Evaluates agent performance based on USDOT knowledge, conversation quality,
 * and regulatory compliance accuracy
 */

import { FakeClient, ConversationMessage } from './ScenarioGenerator';

export interface GradingCriteria {
  // USDOT Knowledge (40%)
  correctServiceIdentification: number;      // 0-100
  properRegulationExplanation: number;       // 0-100
  accurateRequirementAssessment: number;     // 0-100
  complianceGuidanceQuality: number;         // 0-100

  // Conversation Quality (30%)
  informationGatheringEfficiency: number;    // 0-100
  clientCommunicationClarity: number;       // 0-100
  questionRelevance: number;                // 0-100
  responseCompleteness: number;             // 0-100

  // Regulatory Accuracy (30%)
  legalRequirementAccuracy: number;         // 0-100
  exemptionIdentification: number;          // 0-100
  riskAssessmentAccuracy: number;           // 0-100
  documentationGuidance: number;            // 0-100
}

export interface PerformanceScore {
  overallScore: number;                     // 0-100
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  criteria: GradingCriteria;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedBreakdown: {
    usdotKnowledge: number;
    conversationQuality: number;
    regulatoryAccuracy: number;
  };
}

export interface TrainingError {
  type: 'knowledge_gap' | 'communication_issue' | 'regulatory_error' | 'process_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  correction: string;
  points: number; // Points deducted
}

export class PerformanceGradingSystem {
  private static instance: PerformanceGradingSystem;

  private constructor() {}

  public static getInstance(): PerformanceGradingSystem {
    if (!PerformanceGradingSystem.instance) {
      PerformanceGradingSystem.instance = new PerformanceGradingSystem();
    }
    return PerformanceGradingSystem.instance;
  }

  /**
   * Grade a complete training session
   */
  public gradeSession(
    client: FakeClient,
    conversationHistory: ConversationMessage[],
    expectedServices: string[],
    actualRecommendations: string[]
  ): PerformanceScore {
    const criteria = this.evaluateCriteria(client, conversationHistory, expectedServices, actualRecommendations);
    const errors = this.identifyErrors(client, conversationHistory, expectedServices, actualRecommendations);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(criteria, errors);
    
    // Generate insights
    const strengths = this.identifyStrengths(criteria);
    const weaknesses = this.identifyWeaknesses(criteria, errors);
    const recommendations = this.generateRecommendations(criteria, errors);
    
    // Calculate category scores
    const detailedBreakdown = {
      usdotKnowledge: this.calculateCategoryScore([
        criteria.correctServiceIdentification,
        criteria.properRegulationExplanation,
        criteria.accurateRequirementAssessment,
        criteria.complianceGuidanceQuality
      ]),
      conversationQuality: this.calculateCategoryScore([
        criteria.informationGatheringEfficiency,
        criteria.clientCommunicationClarity,
        criteria.questionRelevance,
        criteria.responseCompleteness
      ]),
      regulatoryAccuracy: this.calculateCategoryScore([
        criteria.legalRequirementAccuracy,
        criteria.exemptionIdentification,
        criteria.riskAssessmentAccuracy,
        criteria.documentationGuidance
      ])
    };

    return {
      overallScore,
      grade: this.calculateGrade(overallScore),
      criteria,
      strengths,
      weaknesses,
      recommendations,
      detailedBreakdown
    };
  }

  /**
   * Evaluate all grading criteria
   */
  private evaluateCriteria(
    client: FakeClient,
    conversationHistory: ConversationMessage[],
    expectedServices: string[],
    actualRecommendations: string[]
  ): GradingCriteria {
    return {
      // USDOT Knowledge (40%)
      correctServiceIdentification: this.evaluateServiceIdentification(expectedServices, actualRecommendations),
      properRegulationExplanation: this.evaluateRegulationExplanation(conversationHistory, client),
      accurateRequirementAssessment: this.evaluateRequirementAssessment(client, conversationHistory),
      complianceGuidanceQuality: this.evaluateComplianceGuidance(conversationHistory, client),

      // Conversation Quality (30%)
      informationGatheringEfficiency: this.evaluateInformationGathering(conversationHistory, client),
      clientCommunicationClarity: this.evaluateCommunicationClarity(conversationHistory),
      questionRelevance: this.evaluateQuestionRelevance(conversationHistory, client),
      responseCompleteness: this.evaluateResponseCompleteness(conversationHistory, client),

      // Regulatory Accuracy (30%)
      legalRequirementAccuracy: this.evaluateLegalAccuracy(client, conversationHistory),
      exemptionIdentification: this.evaluateExemptionIdentification(client, conversationHistory),
      riskAssessmentAccuracy: this.evaluateRiskAssessment(client, conversationHistory),
      documentationGuidance: this.evaluateDocumentationGuidance(conversationHistory, client)
    };
  }

  /**
   * USDOT Knowledge Evaluation Methods
   */
  private evaluateServiceIdentification(expectedServices: string[], actualRecommendations: string[]): number {
    if (actualRecommendations.length === 0) return 0;
    
    const correctServices = expectedServices.filter(service => 
      actualRecommendations.some(rec => rec.toLowerCase().includes(service.toLowerCase()))
    );
    
    const incorrectServices = actualRecommendations.filter(rec => 
      !expectedServices.some(service => rec.toLowerCase().includes(service.toLowerCase()))
    );
    
    const accuracy = (correctServices.length / expectedServices.length) * 100;
    const penalty = incorrectServices.length * 10; // 10 points per incorrect recommendation
    
    return Math.max(0, accuracy - penalty);
  }

  private evaluateRegulationExplanation(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for proper USDOT explanation
    const hasUSDOTExplanation = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('usdot') && 
      (msg.message.toLowerCase().includes('registration') || msg.message.toLowerCase().includes('number'))
    );
    
    if (hasUSDOTExplanation) score += 25;
    
    // Check for MC authority explanation (if needed)
    if (client.operations.transportsProperty && client.operations.receivesCompensation) {
      const hasMCExplanation = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('mc') && 
        (msg.message.toLowerCase().includes('authority') || msg.message.toLowerCase().includes('permit'))
      );
      if (hasMCExplanation) score += 25;
    }
    
    // Check for IFTA explanation (if interstate)
    if (client.operations.transportsInterstate) {
      const hasIFTAExplanation = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('ifta') && 
        (msg.message.toLowerCase().includes('fuel') || msg.message.toLowerCase().includes('tax'))
      );
      if (hasIFTAExplanation) score += 25;
    }
    
    // Check for ELD explanation (if required)
    if (this.requiresELD(client)) {
      const hasELDExplanation = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('eld') && 
        (msg.message.toLowerCase().includes('electronic') || msg.message.toLowerCase().includes('logging'))
      );
      if (hasELDExplanation) score += 25;
    }
    
    return score;
  }

  private evaluateRequirementAssessment(client: FakeClient, conversationHistory: ConversationMessage[]): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check weight class assessment
    const hasWeightAssessment = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('weight') || 
      msg.message.toLowerCase().includes('26,000') ||
      msg.message.toLowerCase().includes('gvwr')
    );
    if (hasWeightAssessment) score += 20;
    
    // Check interstate assessment
    if (client.operations.transportsInterstate) {
      const hasInterstateAssessment = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('interstate') || 
        msg.message.toLowerCase().includes('across state')
      );
      if (hasInterstateAssessment) score += 20;
    }
    
    // Check cargo type assessment
    const hasCargoAssessment = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('cargo') || 
      msg.message.toLowerCase().includes('freight') ||
      msg.message.toLowerCase().includes('commodities')
    );
    if (hasCargoAssessment) score += 20;
    
    // Check compensation assessment
    if (client.operations.receivesCompensation) {
      const hasCompensationAssessment = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('compensation') || 
        msg.message.toLowerCase().includes('payment') ||
        msg.message.toLowerCase().includes('money')
      );
      if (hasCompensationAssessment) score += 20;
    }
    
    // Check hazmat assessment (if applicable)
    if (client.operations.propertyType === 'hazardous_materials') {
      const hasHazmatAssessment = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('hazardous') || 
        msg.message.toLowerCase().includes('hazmat')
      );
      if (hasHazmatAssessment) score += 20;
    }
    
    return Math.min(100, score);
  }

  private evaluateComplianceGuidance(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for compliance timeline guidance
    const hasTimelineGuidance = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('timeline') || 
      msg.message.toLowerCase().includes('days') ||
      msg.message.toLowerCase().includes('process')
    );
    if (hasTimelineGuidance) score += 25;
    
    // Check for cost guidance
    const hasCostGuidance = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('cost') || 
      msg.message.toLowerCase().includes('fee') ||
      msg.message.toLowerCase().includes('price')
    );
    if (hasCostGuidance) score += 25;
    
    // Check for documentation guidance
    const hasDocumentationGuidance = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('document') || 
      msg.message.toLowerCase().includes('paperwork') ||
      msg.message.toLowerCase().includes('form')
    );
    if (hasDocumentationGuidance) score += 25;
    
    // Check for ongoing compliance guidance
    const hasOngoingGuidance = agentMessages.some(msg => 
      msg.message.toLowerCase().includes('maintain') || 
      msg.message.toLowerCase().includes('renewal') ||
      msg.message.toLowerCase().includes('annual')
    );
    if (hasOngoingGuidance) score += 25;
    
    return score;
  }

  /**
   * Conversation Quality Evaluation Methods
   */
  private evaluateInformationGathering(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    const clientMessages = conversationHistory.filter(msg => msg.speaker === 'client');
    
    // Check for systematic information gathering
    const questions = agentMessages.filter(msg => msg.message.includes('?'));
    const efficiency = Math.min(100, (questions.length / 8) * 100); // Optimal around 8 questions
    
    // Check for key information gathered
    let informationScore = 0;
    const keyInfo = [
      'business name', 'operation type', 'vehicles', 'interstate', 
      'compensation', 'cargo', 'weight', 'hazmat'
    ];
    
    const conversationText = clientMessages.map(msg => msg.message.toLowerCase()).join(' ');
    keyInfo.forEach(info => {
      if (conversationText.includes(info)) informationScore += 12.5;
    });
    
    return (efficiency + informationScore) / 2;
  }

  private evaluateCommunicationClarity(conversationHistory: ConversationMessage[]): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for clear, professional language
    agentMessages.forEach(msg => {
      if (msg.message.length > 20 && msg.message.length < 200) score += 10; // Appropriate length
      if (!msg.message.includes('um') && !msg.message.includes('uh')) score += 10; // No filler words
      if (msg.message.includes('I understand') || msg.message.includes('Let me help')) score += 5; // Empathy
    });
    
    return Math.min(100, score);
  }

  private evaluateQuestionRelevance(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    const questions = agentMessages.filter(msg => msg.message.includes('?'));
    
    if (questions.length === 0) return 0;
    
    let relevantQuestions = 0;
    questions.forEach(question => {
      const q = question.message.toLowerCase();
      if (q.includes('business') || q.includes('operation') || q.includes('vehicle') ||
          q.includes('interstate') || q.includes('cargo') || q.includes('weight') ||
          q.includes('hazmat') || q.includes('compensation')) {
        relevantQuestions++;
      }
    });
    
    return (relevantQuestions / questions.length) * 100;
  }

  private evaluateResponseCompleteness(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for complete responses (not just yes/no)
    agentMessages.forEach(msg => {
      if (msg.message.length > 50) score += 15; // Substantial responses
      if (msg.message.includes('because') || msg.message.includes('due to')) score += 10; // Explanations
      if (msg.message.includes('next step') || msg.message.includes('also')) score += 10; // Action items
    });
    
    return Math.min(100, score);
  }

  /**
   * Regulatory Accuracy Evaluation Methods
   */
  private evaluateLegalAccuracy(client: FakeClient, conversationHistory: ConversationMessage[]): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 100;
    
    // Check for legal accuracy in responses
    agentMessages.forEach(msg => {
      const message = msg.message.toLowerCase();
      
      // Penalize incorrect statements
      if (message.includes('no usdot required') && this.requiresUSDOT(client)) score -= 20;
      if (message.includes('no mc required') && this.requiresMC(client)) score -= 20;
      if (message.includes('no ifta required') && this.requiresIFTA(client)) score -= 15;
      if (message.includes('no eld required') && this.requiresELD(client)) score -= 15;
    });
    
    return Math.max(0, score);
  }

  private evaluateExemptionIdentification(client: FakeClient, conversationHistory: ConversationMessage[]): number {
    if (client.operations.propertyType === 'exempt_commodities') {
      const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
      const hasExemptionDiscussion = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('exempt') || 
        msg.message.toLowerCase().includes('exception')
      );
      return hasExemptionDiscussion ? 100 : 0;
    }
    return 100; // No exemptions to identify
  }

  private evaluateRiskAssessment(client: FakeClient, conversationHistory: ConversationMessage[]): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for risk identification
    if (client.operations.propertyType === 'hazardous_materials') {
      const hasHazmatRisk = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('risk') || 
        msg.message.toLowerCase().includes('danger') ||
        msg.message.toLowerCase().includes('safety')
      );
      if (hasHazmatRisk) score += 50;
    }
    
    // Check for interstate risk assessment
    if (client.operations.transportsInterstate) {
      const hasInterstateRisk = agentMessages.some(msg => 
        msg.message.toLowerCase().includes('multiple states') || 
        msg.message.toLowerCase().includes('cross border')
      );
      if (hasInterstateRisk) score += 50;
    }
    
    return score;
  }

  private evaluateDocumentationGuidance(conversationHistory: ConversationMessage[], client: FakeClient): number {
    const agentMessages = conversationHistory.filter(msg => msg.speaker === 'agent');
    let score = 0;
    
    // Check for specific documentation mentioned
    const docs = ['insurance', 'ein', 'business license', 'operating authority'];
    docs.forEach(doc => {
      const hasDoc = agentMessages.some(msg => 
        msg.message.toLowerCase().includes(doc)
      );
      if (hasDoc) score += 25;
    });
    
    return score;
  }

  /**
   * Utility Methods
   */
  private requiresUSDOT(client: FakeClient): boolean {
    return client.operations.transportsProperty && 
           (client.vehicles.interstateVehicles > 0 || client.vehicles.intrastateVehicles > 0);
  }

  private requiresMC(client: FakeClient): boolean {
    return client.operations.transportsProperty && 
           client.operations.receivesCompensation && 
           client.operations.transportsInterstate;
  }

  private requiresIFTA(client: FakeClient): boolean {
    return client.operations.transportsInterstate && 
           (client.vehicles.interstateVehicles > 0);
  }

  private requiresELD(client: FakeClient): boolean {
    return client.vehicles.truckTractors.owned > 0 || 
           client.vehicles.truckTractors.termLeased > 0;
  }

  private calculateOverallScore(criteria: GradingCriteria, errors: TrainingError[]): number {
    // Calculate weighted average
    const usdotKnowledge = this.calculateCategoryScore([
      criteria.correctServiceIdentification,
      criteria.properRegulationExplanation,
      criteria.accurateRequirementAssessment,
      criteria.complianceGuidanceQuality
    ]);

    const conversationQuality = this.calculateCategoryScore([
      criteria.informationGatheringEfficiency,
      criteria.clientCommunicationClarity,
      criteria.questionRelevance,
      criteria.responseCompleteness
    ]);

    const regulatoryAccuracy = this.calculateCategoryScore([
      criteria.legalRequirementAccuracy,
      criteria.exemptionIdentification,
      criteria.riskAssessmentAccuracy,
      criteria.documentationGuidance
    ]);

    // Weighted average: 40% USDOT Knowledge, 30% Conversation Quality, 30% Regulatory Accuracy
    const weightedScore = (usdotKnowledge * 0.4) + (conversationQuality * 0.3) + (regulatoryAccuracy * 0.3);
    
    // Apply error penalties
    const errorPenalty = errors.reduce((sum, error) => {
      const penalty = error.severity === 'critical' ? 20 : 
                     error.severity === 'high' ? 15 :
                     error.severity === 'medium' ? 10 : 5;
      return sum + penalty;
    }, 0);

    return Math.max(0, weightedScore - errorPenalty);
  }

  private calculateCategoryScore(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyErrors(
    client: FakeClient,
    conversationHistory: ConversationMessage[],
    expectedServices: string[],
    actualRecommendations: string[]
  ): TrainingError[] {
    const errors: TrainingError[] = [];
    
    // Check for missing services
    expectedServices.forEach(service => {
      const hasService = actualRecommendations.some(rec => 
        rec.toLowerCase().includes(service.toLowerCase())
      );
      if (!hasService) {
        errors.push({
          type: 'knowledge_gap',
          severity: 'high',
          description: `Failed to recommend ${service}`,
          impact: 'Client may be operating without required authority',
          correction: 'Review USDOT requirements for this operation type',
          points: 15
        });
      }
    });
    
    // Check for incorrect recommendations
    actualRecommendations.forEach(rec => {
      const isCorrect = expectedServices.some(service => 
        rec.toLowerCase().includes(service.toLowerCase())
      );
      if (!isCorrect) {
        errors.push({
          type: 'regulatory_error',
          severity: 'medium',
          description: `Incorrectly recommended ${rec}`,
          impact: 'Client may apply for unnecessary authority',
          correction: 'Review operation requirements more carefully',
          points: 10
        });
      }
    });
    
    return errors;
  }

  private identifyStrengths(criteria: GradingCriteria): string[] {
    const strengths: string[] = [];
    
    if (criteria.correctServiceIdentification >= 90) {
      strengths.push('Excellent service identification accuracy');
    }
    if (criteria.clientCommunicationClarity >= 90) {
      strengths.push('Clear and professional communication');
    }
    if (criteria.legalRequirementAccuracy >= 90) {
      strengths.push('Strong regulatory knowledge');
    }
    if (criteria.informationGatheringEfficiency >= 90) {
      strengths.push('Efficient information gathering');
    }
    
    return strengths;
  }

  private identifyWeaknesses(criteria: GradingCriteria, errors: TrainingError[]): string[] {
    const weaknesses: string[] = [];
    
    if (criteria.correctServiceIdentification < 70) {
      weaknesses.push('Service identification needs improvement');
    }
    if (criteria.clientCommunicationClarity < 70) {
      weaknesses.push('Communication clarity could be better');
    }
    if (criteria.legalRequirementAccuracy < 70) {
      weaknesses.push('Regulatory knowledge gaps identified');
    }
    if (criteria.informationGatheringEfficiency < 70) {
      weaknesses.push('Information gathering process needs refinement');
    }
    
    // Add error-based weaknesses
    errors.forEach(error => {
      if (error.severity === 'critical' || error.severity === 'high') {
        weaknesses.push(error.description);
      }
    });
    
    return weaknesses;
  }

  private generateRecommendations(criteria: GradingCriteria, errors: TrainingError[]): string[] {
    const recommendations: string[] = [];
    
    if (criteria.correctServiceIdentification < 80) {
      recommendations.push('Review USDOT service requirements matrix');
    }
    if (criteria.clientCommunicationClarity < 80) {
      recommendations.push('Practice clear, concise explanations');
    }
    if (criteria.legalRequirementAccuracy < 80) {
      recommendations.push('Study FMCSA regulations and exemptions');
    }
    if (criteria.informationGatheringEfficiency < 80) {
      recommendations.push('Develop systematic questioning approach');
    }
    
    // Add specific error corrections
    errors.forEach(error => {
      if (!recommendations.includes(error.correction)) {
        recommendations.push(error.correction);
      }
    });
    
    return recommendations;
  }
}
