/**
 * Critical Path Training Scenarios
 * Focuses on the most common USDOT application failure points
 */

export interface CriticalPathScenario {
  id: string;
  name: string;
  description: string;
  failurePoint: string;
  difficulty: number;
  businessContext: any;
  expectedAnswers: any;
  commonMistakes: string[];
  validationRules: any[];
  testData: any;
}

export class CriticalPathTrainingScenarios {
  
  /**
   * Get critical path scenarios based on common USDOT application failures
   */
  static getCriticalPathScenarios(): CriticalPathScenario[] {
    return [
      // CRITICAL PATH 1: Business Entity vs Operation Type Mismatch
      {
        id: 'critical_001',
        name: 'Sole Proprietor Transporting Hazmat',
        description: 'Sole proprietor attempting to transport hazardous materials - common failure point',
        failurePoint: 'Business entity type incompatible with operation type',
        difficulty: 8,
        businessContext: {
          businessType: 'sole proprietor',
          operationType: 'hazardous materials transportation',
          interstateCommerce: true
        },
        expectedAnswers: {
          formOfBusiness: 'sole proprietor',
          propertyType: 'hazardous materials',
          interstateCommerce: 'Yes',
          // Should trigger warning about sole proprietor limitations
          warning: 'Sole proprietors may face limitations with hazmat operations'
        },
        commonMistakes: [
          'Not understanding sole proprietor limitations for hazmat',
          'Failing to recommend LLC/Corporation for hazmat operations',
          'Not explaining insurance requirements for hazmat',
          'Missing CDL requirements for hazmat drivers'
        ],
        validationRules: [
          {
            rule: 'hazmat_sole_proprietor_warning',
            message: 'Sole proprietors transporting hazmat should consider LLC/Corporation structure',
            severity: 'high'
          },
          {
            rule: 'hazmat_cdl_requirement',
            message: 'All drivers must have CDL for hazmat operations',
            severity: 'critical'
          }
        ],
        testData: {
          legalBusinessName: 'John Smith Trucking',
          doingBusinessAs: 'Smith Hauling',
          ein: '12-3456789',
          formOfBusiness: 'sole proprietor',
          propertyType: 'hazardous materials',
          interstateCommerce: 'Yes',
          vehicles: { owned: 2, leased: 0 },
          drivers: { cdl: 1, interstate: 2 }
        }
      },

      // CRITICAL PATH 2: Vehicle Count vs Driver Count Mismatch
      {
        id: 'critical_002',
        name: 'Fleet Size vs Driver Capacity Mismatch',
        description: 'Company has more vehicles than drivers can operate - common compliance issue',
        failurePoint: 'Vehicle count exceeds driver capacity',
        difficulty: 6,
        businessContext: {
          businessType: 'corporation',
          operationType: 'general freight',
          fleetSize: 10,
          driverCount: 3
        },
        expectedAnswers: {
          totalVehicles: 10,
          totalDrivers: 3,
          // Should identify the mismatch
          validationError: 'Vehicle count (10) exceeds driver capacity (3)',
          recommendation: 'Either reduce vehicles or hire more drivers'
        },
        commonMistakes: [
          'Not catching vehicle/driver count mismatches',
          'Failing to explain driver hour limitations',
          'Not considering team driving arrangements',
          'Missing lease driver options'
        ],
        validationRules: [
          {
            rule: 'vehicle_driver_ratio',
            message: 'Vehicle count should not exceed driver capacity',
            severity: 'critical'
          },
          {
            rule: 'driver_hour_limits',
            message: 'Consider driver hour limitations for fleet operations',
            severity: 'high'
          }
        ],
        testData: {
          legalBusinessName: 'ABC Transport LLC',
          formOfBusiness: 'limited liability company',
          propertyType: 'general freight',
          interstateCommerce: 'Yes',
          vehicles: { owned: 10, leased: 0 },
          drivers: { cdl: 3, interstate: 3 }
        }
      },

      // CRITICAL PATH 3: Interstate vs Intrastate Commerce Confusion
      {
        id: 'critical_003',
        name: 'Interstate Commerce Misclassification',
        description: 'Company incorrectly classifies interstate vs intrastate operations',
        failurePoint: 'Incorrect commerce classification affects registration requirements',
        difficulty: 7,
        businessContext: {
          businessType: 'corporation',
          operationType: 'general freight',
          states: ['CA', 'NV', 'AZ'],
          commerceType: 'interstate'
        },
        expectedAnswers: {
          interstateCommerce: 'Yes',
          statesOfOperation: ['CA', 'NV', 'AZ'],
          // Should correctly identify interstate commerce
          classification: 'Interstate commerce - crossing state lines'
        },
        commonMistakes: [
          'Confusing interstate vs intrastate commerce',
          'Not understanding state line crossing rules',
          'Missing IFTA requirements for interstate',
          'Not explaining different insurance requirements'
        ],
        validationRules: [
          {
            rule: 'interstate_commerce_definition',
            message: 'Crossing state lines = interstate commerce',
            severity: 'critical'
          },
          {
            rule: 'ifta_requirement',
            message: 'Interstate operations require IFTA registration',
            severity: 'high'
          }
        ],
        testData: {
          legalBusinessName: 'Cross State Logistics Inc',
          formOfBusiness: 'corporation',
          propertyType: 'general freight',
          interstateCommerce: 'Yes',
          statesOfOperation: ['CA', 'NV', 'AZ'],
          vehicles: { owned: 5, leased: 2 },
          drivers: { cdl: 4, interstate: 4 }
        }
      },

      // CRITICAL PATH 4: Missing Required Documents
      {
        id: 'critical_004',
        name: 'Missing Critical Documentation',
        description: 'Company fails to provide required documents for registration',
        failurePoint: 'Incomplete documentation causes application rejection',
        difficulty: 5,
        businessContext: {
          businessType: 'corporation',
          operationType: 'general freight',
          missingDocuments: ['EIN', 'Insurance Certificate', 'Process Agent']
        },
        expectedAnswers: {
          ein: 'Required - must provide EIN or SSN',
          insurance: 'Required - must provide certificate',
          processAgent: 'Required - must designate process agent',
          // Should identify missing documents
          missingDocs: ['EIN', 'Insurance Certificate', 'Process Agent']
        },
        commonMistakes: [
          'Not identifying required documents',
          'Failing to explain document purposes',
          'Not providing document templates',
          'Missing state-specific requirements'
        ],
        validationRules: [
          {
            rule: 'required_documents',
            message: 'All required documents must be provided',
            severity: 'critical'
          },
          {
            rule: 'document_validation',
            message: 'Documents must be current and valid',
            severity: 'high'
          }
        ],
        testData: {
          legalBusinessName: 'New Start Trucking LLC',
          formOfBusiness: 'limited liability company',
          ein: '', // Missing EIN
          propertyType: 'general freight',
          interstateCommerce: 'Yes',
          vehicles: { owned: 2, leased: 0 },
          drivers: { cdl: 2, interstate: 2 }
        }
      },

      // CRITICAL PATH 5: CDL Requirements for Operation Type
      {
        id: 'critical_005',
        name: 'CDL Requirements Mismatch',
        description: 'Company operating vehicles requiring CDL without CDL drivers',
        failurePoint: 'Vehicle weight requirements vs driver qualifications',
        difficulty: 9,
        businessContext: {
          businessType: 'corporation',
          operationType: 'general freight',
          vehicleWeight: '26,001+ lbs',
          driverLicenses: 'Regular licenses only'
        },
        expectedAnswers: {
          vehicleWeight: '26,001+ lbs',
          cdlRequired: 'Yes - vehicles over 26,001 lbs require CDL',
          driverLicenses: 'CDL required for all drivers',
          // Should identify CDL requirement
          cdlRequirement: 'All drivers must have CDL for vehicles over 26,001 lbs'
        },
        commonMistakes: [
          'Not understanding CDL weight requirements',
          'Failing to explain CDL vs regular license',
          'Not identifying vehicle weight categories',
          'Missing CDL training requirements'
        ],
        validationRules: [
          {
            rule: 'cdl_weight_requirement',
            message: 'Vehicles over 26,001 lbs require CDL drivers',
            severity: 'critical'
          },
          {
            rule: 'cdl_training_requirement',
            message: 'CDL drivers must complete required training',
            severity: 'high'
          }
        ],
        testData: {
          legalBusinessName: 'Heavy Haul Transport Inc',
          formOfBusiness: 'corporation',
          propertyType: 'general freight',
          interstateCommerce: 'Yes',
          vehicles: { owned: 3, leased: 0 },
          vehicleWeight: '26,001+ lbs',
          drivers: { cdl: 0, interstate: 3 } // No CDL drivers!
        }
      },

      // CRITICAL PATH 6: Insurance Requirements by Operation Type
      {
        id: 'critical_006',
        name: 'Inadequate Insurance Coverage',
        description: 'Company has insufficient insurance for operation type',
        failurePoint: 'Insurance coverage doesn\'t match operation requirements',
        difficulty: 8,
        businessContext: {
          businessType: 'corporation',
          operationType: 'hazardous materials',
          currentInsurance: 'General liability only',
          requiredInsurance: 'Hazmat liability + General liability'
        },
        expectedAnswers: {
          operationType: 'hazardous materials',
          requiredInsurance: 'Hazmat liability insurance required',
          currentInsurance: 'Insufficient - need hazmat coverage',
          // Should identify insurance gap
          insuranceGap: 'Missing hazmat liability coverage'
        },
        commonMistakes: [
          'Not understanding hazmat insurance requirements',
          'Failing to explain different insurance types',
          'Not identifying coverage gaps',
          'Missing state-specific insurance requirements'
        ],
        validationRules: [
          {
            rule: 'hazmat_insurance_requirement',
            message: 'Hazmat operations require specialized insurance',
            severity: 'critical'
          },
          {
            rule: 'insurance_coverage_validation',
            message: 'Insurance must cover all operation types',
            severity: 'high'
          }
        ],
        testData: {
          legalBusinessName: 'Hazmat Haulers LLC',
          formOfBusiness: 'limited liability company',
          propertyType: 'hazardous materials',
          interstateCommerce: 'Yes',
          vehicles: { owned: 4, leased: 1 },
          drivers: { cdl: 4, interstate: 4 },
          insurance: 'General liability only' // Missing hazmat coverage
        }
      }
    ];
  }

  /**
   * Get scenario by failure point
   */
  static getScenarioByFailurePoint(failurePoint: string): CriticalPathScenario | null {
    const scenarios = this.getCriticalPathScenarios();
    return scenarios.find(scenario => 
      scenario.failurePoint.toLowerCase().includes(failurePoint.toLowerCase())
    ) || null;
  }

  /**
   * Get scenarios by difficulty level
   */
  static getScenariosByDifficulty(minDifficulty: number, maxDifficulty: number): CriticalPathScenario[] {
    const scenarios = this.getCriticalPathScenarios();
    return scenarios.filter(scenario => 
      scenario.difficulty >= minDifficulty && scenario.difficulty <= maxDifficulty
    );
  }

  /**
   * Get most common failure points
   */
  static getMostCommonFailurePoints(): string[] {
    return [
      'Business entity type incompatible with operation type',
      'Vehicle count exceeds driver capacity',
      'Incorrect commerce classification affects registration requirements',
      'Incomplete documentation causes application rejection',
      'Vehicle weight requirements vs driver qualifications',
      'Insurance coverage doesn\'t match operation requirements'
    ];
  }

  /**
   * Validate agent response against critical path scenario
   */
  static validateCriticalPathResponse(
    scenario: CriticalPathScenario,
    agentResponse: any
  ): {
    passed: boolean;
    score: number;
    mistakes: string[];
    recommendations: string[];
  } {
    const mistakes: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check each validation rule
    scenario.validationRules.forEach(rule => {
      const ruleResult = this.checkValidationRule(rule, agentResponse, scenario);
      if (!ruleResult.passed) {
        mistakes.push(ruleResult.message);
        score -= rule.severity === 'critical' ? 30 : rule.severity === 'high' ? 20 : 10;
      }
    });

    // Check for common mistakes
    scenario.commonMistakes.forEach(mistake => {
      if (this.detectCommonMistake(mistake, agentResponse)) {
        mistakes.push(mistake);
        score -= 15;
      }
    });

    // Generate recommendations
    if (mistakes.length > 0) {
      recommendations.push(...this.generateRecommendations(scenario, mistakes));
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      mistakes,
      recommendations
    };
  }

  private static checkValidationRule(rule: any, response: any, scenario: CriticalPathScenario): {
    passed: boolean;
    message: string;
  } {
    // Implement specific validation logic for each rule type
    switch (rule.rule) {
      case 'hazmat_sole_proprietor_warning':
        return {
          passed: !(response.formOfBusiness === 'sole proprietor' && response.propertyType === 'hazardous materials'),
          message: rule.message
        };
      
      case 'vehicle_driver_ratio':
        return {
          passed: response.totalVehicles <= response.totalDrivers * 2,
          message: rule.message
        };
      
      case 'interstate_commerce_definition':
        return {
          passed: response.interstateCommerce === 'Yes' && response.statesOfOperation?.length > 1,
          message: rule.message
        };
      
      case 'required_documents':
        return {
          passed: response.ein && response.insurance && response.processAgent,
          message: rule.message
        };
      
      case 'cdl_weight_requirement':
        return {
          passed: response.vehicleWeight === '26,001+ lbs' ? response.cdlDrivers > 0 : true,
          message: rule.message
        };
      
      case 'hazmat_insurance_requirement':
        return {
          passed: response.propertyType === 'hazardous materials' ? 
            response.insurance?.includes('hazmat') : true,
          message: rule.message
        };
      
      default:
        return { passed: true, message: '' };
    }
  }

  private static detectCommonMistake(mistake: string, response: any): boolean {
    // Implement logic to detect common mistakes in agent responses
    // This would analyze the agent's response for specific error patterns
    return false; // Placeholder
  }

  private static generateRecommendations(scenario: CriticalPathScenario, mistakes: string[]): string[] {
    const recommendations: string[] = [];
    
    if (mistakes.some(m => m.includes('sole proprietor') && m.includes('hazmat'))) {
      recommendations.push('Recommend LLC or Corporation structure for hazmat operations');
    }
    
    if (mistakes.some(m => m.includes('vehicle') && m.includes('driver'))) {
      recommendations.push('Consider hiring more drivers or reducing fleet size');
    }
    
    if (mistakes.some(m => m.includes('interstate'))) {
      recommendations.push('Review interstate commerce requirements and IFTA registration');
    }
    
    if (mistakes.some(m => m.includes('document'))) {
      recommendations.push('Ensure all required documents are current and valid');
    }
    
    if (mistakes.some(m => m.includes('CDL'))) {
      recommendations.push('Verify CDL requirements for vehicle weight and operation type');
    }
    
    if (mistakes.some(m => m.includes('insurance'))) {
      recommendations.push('Review insurance coverage for operation type and requirements');
    }
    
    return recommendations;
  }
}

export default CriticalPathTrainingScenarios;
