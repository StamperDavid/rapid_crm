/**
 * AI AGENT TESTING FRAMEWORK - CommonJS Version
 * Comprehensive testing and validation system for AI agents
 */

class AIAgentTestingFramework {
  constructor() {
    this.testSuites = new Map();
    this.testResults = new Map();
    this.benchmarks = new Map();
    this.initializeDefaultTestSuites();
    console.log('🧪 AI Agent Testing Framework initialized');
  }

  /**
   * Initialize default test suites for transportation industry
   */
  initializeDefaultTestSuites() {
    // USDOT Compliance Test Suite
    const usdotComplianceSuite = {
      id: 'usdot_compliance_suite',
      name: 'USDOT Compliance Agent Tests',
      description: 'Comprehensive tests for USDOT compliance agents',
      category: 'compliance',
      version: '1.0.0',
      testCases: [
        {
          id: 'hos_basic_question',
          name: 'Hours of Service Basic Question',
          description: 'Test basic HOS regulation knowledge',
          input: {
            question: 'What is the maximum driving time allowed after 10 hours off duty?',
            context: { fleetSize: 25, operationType: 'interstate' }
          },
          expectedKeywords: ['11 hours', 'driving', 'off duty', '49 CFR 395'],
          category: 'compliance',
          difficulty: 'easy',
          timeout: 5000
        },
        {
          id: 'vehicle_maintenance_complex',
          name: 'Vehicle Maintenance Complex Scenario',
          description: 'Test complex vehicle maintenance compliance scenario',
          input: {
            question: 'Our driver found a brake issue during pre-trip inspection. What are the compliance requirements?',
            context: { 
              vehicleType: 'tractor_trailer',
              cargoType: 'general_freight',
              hazmat: false,
              lastInspection: '2024-01-15'
            }
          },
          expectedKeywords: ['repair', 'defect', 'operation', 'DVIR', '49 CFR 396'],
          category: 'compliance',
          difficulty: 'medium',
          timeout: 8000
        },
        {
          id: 'hazmat_emergency',
          name: 'Hazmat Emergency Response',
          description: 'Test hazmat emergency response knowledge',
          input: {
            question: 'Our hazmat driver had an accident. What are the immediate compliance requirements?',
            context: {
              hazmatClass: '3', // Flammable liquids
              quantity: '5000 gallons',
              location: 'highway',
              injuries: false
            }
          },
          expectedKeywords: ['emergency response', 'shipping papers', 'placards', '49 CFR 177', 'immediate'],
          category: 'compliance',
          difficulty: 'hard',
          timeout: 10000
        }
      ]
    };

    // Customer Service Test Suite
    const customerServiceSuite = {
      id: 'customer_service_suite',
      name: 'Customer Service Agent Tests',
      description: 'Tests for customer service and support agents',
      category: 'customer_service',
      version: '1.0.0',
      testCases: [
        {
          id: 'billing_inquiry',
          name: 'Billing Inquiry Handling',
          description: 'Test handling of billing inquiries',
          input: {
            question: 'I was charged twice for the same shipment. Can you help?',
            context: { customerType: 'existing', priority: 'high' }
          },
          expectedKeywords: ['apologize', 'investigate', 'refund', 'billing', 'resolve'],
          category: 'customer_service',
          difficulty: 'easy',
          timeout: 5000
        }
      ]
    };

    this.testSuites.set(usdotComplianceSuite.id, usdotComplianceSuite);
    this.testSuites.set(customerServiceSuite.id, customerServiceSuite);
  }

  /**
   * Run a single test case against an agent
   */
  async runTestCase(testCase, agentId, agentFunction) {
    const startTime = Date.now();
    let actualOutput = null;
    let errors = [];
    let warnings = [];

    try {
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), testCase.timeout);
      });

      // Run the test
      const testPromise = agentFunction(testCase.input);
      actualOutput = await Promise.race([testPromise, timeoutPromise]);

    } catch (error) {
      errors.push(`Test execution failed: ${error.message}`);
      actualOutput = { error: error.message };
    }

    const responseTime = Date.now() - startTime;

    // Analyze the response
    const metrics = this.analyzeResponse(actualOutput, testCase);
    const passed = this.evaluateTestResult(actualOutput, testCase, metrics);

    const result = {
      testCaseId: testCase.id,
      agentId,
      passed,
      score: this.calculateScore(metrics),
      responseTime,
      actualOutput,
      expectedOutput: testCase.expectedOutput,
      errors,
      warnings,
      metrics,
      timestamp: new Date().toISOString()
    };

    return result;
  }

  /**
   * Run a complete test suite against an agent
   */
  async runTestSuite(suiteId, agentId, agentFunction) {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    console.log(`🧪 Running test suite: ${suite.name} for agent: ${agentId}`);
    
    const results = [];
    
    for (const testCase of suite.testCases) {
      try {
        const result = await this.runTestCase(testCase, agentId, agentFunction);
        results.push(result);
        
        // Store result
        if (!this.testResults.has(agentId)) {
          this.testResults.set(agentId, []);
        }
        this.testResults.get(agentId).push(result);
        
        console.log(`  ✅ ${testCase.name}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.score}/100)`);
      } catch (error) {
        console.error(`  ❌ ${testCase.name}: ERROR - ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Analyze agent response quality
   */
  analyzeResponse(actualOutput, testCase) {
    const outputText = JSON.stringify(actualOutput).toLowerCase();
    
    // Check for expected keywords
    let keywordMatches = 0;
    if (testCase.expectedKeywords) {
      keywordMatches = testCase.expectedKeywords.filter(keyword => 
        outputText.includes(keyword.toLowerCase())
      ).length;
    }
    
    const relevance = testCase.expectedKeywords ? 
      (keywordMatches / testCase.expectedKeywords.length) * 100 : 80;
    
    // Basic completeness check
    const completeness = outputText.length > 50 ? 90 : 60;
    
    // Clarity check (basic heuristics)
    const clarity = this.assessClarity(actualOutput);
    
    // Accuracy (simplified - would need more sophisticated analysis)
    const accuracy = relevance > 70 ? 85 : 60;

    return { relevance, accuracy, completeness, clarity };
  }

  /**
   * Assess response clarity
   */
  assessClarity(output) {
    if (typeof output === 'string') {
      // Check for proper sentence structure, length, etc.
      const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
      
      if (sentences.length > 0 && avgLength > 20 && avgLength < 150) {
        return 90;
      } else if (sentences.length > 0) {
        return 70;
      }
    } else if (typeof output === 'object' && output !== null) {
      // Check for structured response
      return Object.keys(output).length > 2 ? 85 : 60;
    }
    
    return 50;
  }

  /**
   * Evaluate if test passed
   */
  evaluateTestResult(actualOutput, testCase, metrics) {
    // Basic pass/fail criteria
    if (metrics.relevance < 50) return false;
    if (metrics.accuracy < 60) return false;
    if (metrics.completeness < 70) return false;
    
    return true;
  }

  /**
   * Calculate overall test score
   */
  calculateScore(metrics) {
    return Math.round(
      (metrics.relevance * 0.3) +
      (metrics.accuracy * 0.3) +
      (metrics.completeness * 0.2) +
      (metrics.clarity * 0.2)
    );
  }

  /**
   * Generate agent benchmark report
   */
  generateBenchmark(agentId) {
    const results = this.testResults.get(agentId) || [];
    
    if (results.length === 0) {
      throw new Error(`No test results found for agent ${agentId}`);
    }

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const passRate = (results.filter(r => r.passed).length / results.length) * 100;

    // Analyze strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    if (overallScore >= 85) {
      strengths.push('High overall performance');
    } else if (overallScore < 70) {
      weaknesses.push('Below average performance');
      recommendations.push('Review and improve agent training data');
    }

    if (averageResponseTime < 3000) {
      strengths.push('Fast response times');
    } else if (averageResponseTime > 8000) {
      weaknesses.push('Slow response times');
      recommendations.push('Optimize agent processing efficiency');
    }

    if (passRate >= 90) {
      strengths.push('High test pass rate');
    } else if (passRate < 70) {
      weaknesses.push('Low test pass rate');
      recommendations.push('Improve agent accuracy and reliability');
    }

    const benchmark = {
      agentId,
      overallScore,
      averageResponseTime,
      passRate,
      testResults: results,
      strengths,
      weaknesses,
      recommendations,
      lastTested: new Date().toISOString()
    };

    this.benchmarks.set(agentId, benchmark);
    return benchmark;
  }

  /**
   * Get all test suites
   */
  getAllTestSuites() {
    return Array.from(this.testSuites.values());
  }

  /**
   * Get test results for an agent
   */
  getTestResults(agentId) {
    return this.testResults.get(agentId) || [];
  }

  /**
   * Get benchmark for an agent
   */
  getBenchmark(agentId) {
    return this.benchmarks.get(agentId) || null;
  }
}

// Export singleton instance using CommonJS
const aiAgentTestingFramework = new AIAgentTestingFramework();
module.exports = { aiAgentTestingFramework };
