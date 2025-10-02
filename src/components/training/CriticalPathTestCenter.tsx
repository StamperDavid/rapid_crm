/**
 * Critical Path Test Center
 * Tests AI agents on the most common USDOT application failure points
 */

import React, { useState, useEffect } from 'react';
import {
  ExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  LightBulbIcon
} from '@heroicons/react/outline';
import Tooltip from '../Tooltip';

interface CriticalPathTest {
  id: string;
  name: string;
  description: string;
  failurePoint: string;
  difficulty: number;
  testData: any;
  expectedAnswers: any;
  commonMistakes: string[];
  validationRules: any[];
}

interface TestResult {
  testId: string;
  agentResponse: any;
  passed: boolean;
  score: number;
  mistakes: string[];
  recommendations: string[];
  timeSpent: number;
}

const CriticalPathTestCenter: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<CriticalPathTest | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('test_agent_001');
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // Critical path tests based on real USDOT failure points
  const criticalPathTests: CriticalPathTest[] = [
    {
      id: 'critical_001',
      name: 'Sole Proprietor Transporting Hazmat',
      description: 'Sole proprietor attempting to transport hazardous materials - common failure point',
      failurePoint: 'Business entity type incompatible with operation type',
      difficulty: 8,
      testData: {
        legalBusinessName: 'John Smith Trucking',
        doingBusinessAs: 'Smith Hauling',
        ein: '12-3456789',
        formOfBusiness: 'sole proprietor',
        propertyType: 'hazardous materials',
        interstateCommerce: 'Yes',
        vehicles: { owned: 2, leased: 0 },
        drivers: { cdl: 1, interstate: 2 }
      },
      expectedAnswers: {
        formOfBusiness: 'sole proprietor',
        propertyType: 'hazardous materials',
        interstateCommerce: 'Yes',
        warning: 'Sole proprietors may face limitations with hazmat operations',
        recommendation: 'Consider LLC or Corporation structure for hazmat operations'
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
      ]
    },
    {
      id: 'critical_002',
      name: 'Fleet Size vs Driver Capacity Mismatch',
      description: 'Company has more vehicles than drivers can operate - common compliance issue',
      failurePoint: 'Vehicle count exceeds driver capacity',
      difficulty: 6,
      testData: {
        legalBusinessName: 'ABC Transport LLC',
        formOfBusiness: 'limited liability company',
        propertyType: 'general freight',
        interstateCommerce: 'Yes',
        vehicles: { owned: 10, leased: 0 },
        drivers: { cdl: 3, interstate: 3 }
      },
      expectedAnswers: {
        totalVehicles: 10,
        totalDrivers: 3,
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
        }
      ]
    },
    {
      id: 'critical_003',
      name: 'CDL Requirements Mismatch',
      description: 'Company operating vehicles requiring CDL without CDL drivers',
      failurePoint: 'Vehicle weight requirements vs driver qualifications',
      difficulty: 9,
      testData: {
        legalBusinessName: 'Heavy Haul Transport Inc',
        formOfBusiness: 'corporation',
        propertyType: 'general freight',
        interstateCommerce: 'Yes',
        vehicles: { owned: 3, leased: 0 },
        vehicleWeight: '26,001+ lbs',
        drivers: { cdl: 0, interstate: 3 } // No CDL drivers!
      },
      expectedAnswers: {
        vehicleWeight: '26,001+ lbs',
        cdlRequired: 'Yes - vehicles over 26,001 lbs require CDL',
        driverLicenses: 'CDL required for all drivers',
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
        }
      ]
    }
  ];

  const startTest = (test: CriticalPathTest) => {
    setCurrentTest(test);
    setIsRunning(true);
    setTestStartTime(Date.now());
  };

  const submitAgentResponse = (response: any) => {
    if (!currentTest) return;

    const timeSpent = Date.now() - testStartTime;
    const result = evaluateResponse(currentTest, response, timeSpent);
    
    setTestResults(prev => [...prev, result]);
    setIsRunning(false);
    setCurrentTest(null);
  };

  const evaluateResponse = (test: CriticalPathTest, response: any, timeSpent: number): TestResult => {
    const mistakes: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check validation rules
    test.validationRules.forEach(rule => {
      const ruleResult = checkValidationRule(rule, response, test);
      if (!ruleResult.passed) {
        mistakes.push(ruleResult.message);
        score -= rule.severity === 'critical' ? 30 : rule.severity === 'high' ? 20 : 10;
      }
    });

    // Check for common mistakes
    test.commonMistakes.forEach(mistake => {
      if (detectCommonMistake(mistake, response)) {
        mistakes.push(mistake);
        score -= 15;
      }
    });

    // Generate recommendations
    if (mistakes.length > 0) {
      recommendations.push(...generateRecommendations(test, mistakes));
    }

    return {
      testId: test.id,
      agentResponse: response,
      passed: score >= 70,
      score: Math.max(0, score),
      mistakes,
      recommendations,
      timeSpent
    };
  };

  const checkValidationRule = (rule: any, response: any, test: CriticalPathTest): {
    passed: boolean;
    message: string;
  } => {
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
      
      case 'cdl_weight_requirement':
        return {
          passed: response.vehicleWeight === '26,001+ lbs' ? response.cdlDrivers > 0 : true,
          message: rule.message
        };
      
      default:
        return { passed: true, message: '' };
    }
  };

  const detectCommonMistake = (mistake: string, response: any): boolean => {
    // Simple keyword-based detection for demo
    const keywords = mistake.toLowerCase().split(' ');
    const responseText = JSON.stringify(response).toLowerCase();
    return keywords.some(keyword => responseText.includes(keyword));
  };

  const generateRecommendations = (test: CriticalPathTest, mistakes: string[]): string[] => {
    const recommendations: string[] = [];
    
    if (mistakes.some(m => m.includes('sole proprietor') && m.includes('hazmat'))) {
      recommendations.push('Recommend LLC or Corporation structure for hazmat operations');
    }
    
    if (mistakes.some(m => m.includes('vehicle') && m.includes('driver'))) {
      recommendations.push('Consider hiring more drivers or reducing fleet size');
    }
    
    if (mistakes.some(m => m.includes('CDL'))) {
      recommendations.push('Verify CDL requirements for vehicle weight and operation type');
    }
    
    return recommendations;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 8) return 'text-red-600 bg-red-100';
    if (difficulty >= 6) return 'text-orange-600 bg-orange-100';
    if (difficulty >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const overallStats = {
    totalTests: testResults.length,
    passedTests: testResults.filter(r => r.passed).length,
    averageScore: testResults.length > 0 ? testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length : 0,
    averageTime: testResults.length > 0 ? testResults.reduce((sum, r) => sum + r.timeSpent, 0) / testResults.length : 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Critical Path Test Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test AI agents on the most common USDOT application failure points
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="test_agent_001">Test Agent 001</option>
            <option value="test_agent_002">Test Agent 002</option>
            <option value="test_agent_003">Test Agent 003</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.totalTests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.passedTests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {overallStats.averageScore.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(overallStats.averageTime / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Path Tests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Critical Path Tests
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These tests focus on the most common USDOT application failure points
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criticalPathTests.map((test) => (
              <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {test.name}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(test.difficulty)}`}>
                    Level {test.difficulty}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {test.description}
                </p>
                
                <div className="mb-3">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                    Failure Point:
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {test.failurePoint}
                  </p>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Common Mistakes:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {test.commonMistakes.slice(0, 2).map((mistake, index) => (
                      <li key={index} className="flex items-start">
                        <ExclamationIcon className="h-3 w-3 text-orange-500 mt-0.5 mr-1 flex-shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => startTest(test)}
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? 'Running Test...' : 'Start Test'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Test Results
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {testResults.map((result, index) => {
                const test = criticalPathTests.find(t => t.id === result.testId);
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {test?.name || 'Unknown Test'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(result.score)}`}>
                          {result.score.toFixed(1)}%
                        </span>
                        {result.passed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Time Spent:</p>
                        <p className="text-gray-600 dark:text-gray-400">{(result.timeSpent / 1000).toFixed(1)}s</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Mistakes:</p>
                        <p className="text-gray-600 dark:text-gray-400">{result.mistakes.length}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendations:</p>
                        <p className="text-gray-600 dark:text-gray-400">{result.recommendations.length}</p>
                      </div>
                    </div>
                    
                    {result.mistakes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Mistakes:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {result.mistakes.map((mistake, mistakeIndex) => (
                            <li key={mistakeIndex} className="flex items-start">
                              <XCircleIcon className="h-3 w-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Recommendations:</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {result.recommendations.map((recommendation, recIndex) => (
                            <li key={recIndex} className="flex items-start">
                              <LightBulbIcon className="h-3 w-3 text-blue-500 mt-0.5 mr-1 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalPathTestCenter;
