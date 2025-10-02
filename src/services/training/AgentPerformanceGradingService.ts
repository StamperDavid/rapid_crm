/**
 * Agent Performance Grading Service
 * Provides real-time intelligence for evaluating AI agent performance during training
 */

import { Database } from 'sqlite3';

export interface TrainingStep {
  stepId: string;
  expectedAction: string;
  actualAction: string;
  timestamp: string;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  confidence?: number; // 0-1 scale
}

export interface PerformanceMetrics {
  accuracy: number; // 0-100 percentage
  speed: number; // average time per step in seconds
  confidence: number; // average confidence score
  mistakes: TrainingMistake[];
  pathDeviation: number; // how much the agent deviated from expected path
  completionRate: number; // percentage of steps completed
}

export interface TrainingMistake {
  stepId: string;
  expectedAction: string;
  actualAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  timestamp: string;
  impact: string; // description of how this mistake affects the process
}

export interface ScenarioEvaluation {
  scenarioId: string;
  agentId: string;
  sessionId: string;
  overallScore: number;
  performanceMetrics: PerformanceMetrics;
  recommendations: string[];
  passed: boolean;
  needsIntervention: boolean;
}

export class AgentPerformanceGradingService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Evaluate a single training step in real-time
   */
  async evaluateStep(
    sessionId: string,
    stepId: string,
    expectedAction: string,
    actualAction: string,
    timeSpent: number,
    confidence?: number
  ): Promise<{ isCorrect: boolean; mistake?: TrainingMistake; score: number }> {
    const isCorrect = this.compareActions(expectedAction, actualAction);
    const timestamp = new Date().toISOString();
    
    let mistake: TrainingMistake | undefined;
    let score = isCorrect ? 100 : 0;

    if (!isCorrect) {
      mistake = this.analyzeMistake(stepId, expectedAction, actualAction, timestamp);
      score = this.calculateStepScore(mistake, timeSpent, confidence);
    }

    // Store step evaluation
    await this.storeStepEvaluation(sessionId, stepId, expectedAction, actualAction, isCorrect, timeSpent, confidence, score);

    return { isCorrect, mistake, score };
  }

  /**
   * Calculate overall session performance
   */
  async calculateSessionPerformance(sessionId: string): Promise<PerformanceMetrics> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_steps,
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_steps,
          AVG(time_spent) as avg_time_spent,
          AVG(confidence) as avg_confidence,
          GROUP_CONCAT(
            CASE WHEN is_correct = 0 THEN 
              json_object(
                'stepId', step_id,
                'expectedAction', expected_action,
                'actualAction', actual_action,
                'severity', mistake_severity,
                'explanation', mistake_explanation,
                'timestamp', timestamp,
                'impact', mistake_impact
              )
            END
          ) as mistakes_json
        FROM training_step_evaluations 
        WHERE session_id = ?
      `;

      this.db.get(query, [sessionId], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        const totalSteps = row.total_steps || 0;
        const correctSteps = row.correct_steps || 0;
        const accuracy = totalSteps > 0 ? (correctSteps / totalSteps) * 100 : 0;
        const speed = row.avg_time_spent || 0;
        const confidence = row.avg_confidence || 0;

        // Parse mistakes
        const mistakes: TrainingMistake[] = [];
        if (row.mistakes_json) {
          try {
            const mistakeObjects = row.mistakes_json.split(',').map((m: string) => JSON.parse(m));
            mistakes.push(...mistakeObjects);
          } catch (e) {
            console.warn('Failed to parse mistakes JSON:', e);
          }
        }

        const pathDeviation = this.calculatePathDeviation(sessionId);
        const completionRate = this.calculateCompletionRate(sessionId);

        resolve({
          accuracy,
          speed: speed / 1000, // convert to seconds
          confidence,
          mistakes,
          pathDeviation,
          completionRate
        });
      });
    });
  }

  /**
   * Evaluate complete scenario performance
   */
  async evaluateScenario(sessionId: string): Promise<ScenarioEvaluation> {
    const performanceMetrics = await this.calculateSessionPerformance(sessionId);
    
    // Get session and scenario details
    const sessionDetails = await this.getSessionDetails(sessionId);
    const scenarioDetails = await this.getScenarioDetails(sessionDetails.scenarioId);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(performanceMetrics, scenarioDetails.difficultyLevel);

    // Determine if passed
    const settings = await this.getTrainingSettings(scenarioDetails.registrationType);
    const passed = overallScore >= settings.performanceThreshold;

    // Generate recommendations
    const recommendations = this.generateRecommendations(performanceMetrics, scenarioDetails);

    // Check if intervention needed
    const needsIntervention = this.needsIntervention(performanceMetrics, sessionDetails);

    return {
      scenarioId: sessionDetails.scenarioId,
      agentId: sessionDetails.agentId,
      sessionId,
      overallScore,
      performanceMetrics,
      recommendations,
      passed,
      needsIntervention
    };
  }

  /**
   * Check if agent should be replaced based on performance
   */
  async shouldReplaceAgent(agentId: string, registrationType: string): Promise<{ shouldReplace: boolean; reason: string }> {
    const settings = await this.getTrainingSettings(registrationType);
    
    // Get recent performance history
    const recentSessions = await this.getRecentSessions(agentId, registrationType, 10);
    
    if (recentSessions.length < settings.maxTrainingAttempts) {
      return { shouldReplace: false, reason: 'Insufficient training attempts' };
    }

    const averageScore = recentSessions.reduce((sum, session) => sum + session.score, 0) / recentSessions.length;
    const failureRate = recentSessions.filter(session => !session.passed).length / recentSessions.length;

    if (averageScore < settings.performanceThreshold || failureRate > 0.7) {
      return { 
        shouldReplace: true, 
        reason: `Poor performance: ${averageScore.toFixed(1)}% average score, ${(failureRate * 100).toFixed(1)}% failure rate` 
      };
    }

    return { shouldReplace: false, reason: 'Performance within acceptable range' };
  }

  /**
   * Save Golden Master agent if performance is perfect
   */
  async saveGoldenMaster(sessionId: string): Promise<boolean> {
    const evaluation = await this.evaluateScenario(sessionId);
    const settings = await this.getTrainingSettings('USDOT'); // Assuming USDOT for now

    if (evaluation.overallScore >= settings.goldenMasterThreshold && evaluation.performanceMetrics.accuracy === 100) {
      const sessionDetails = await this.getSessionDetails(sessionId);
      const agentConfig = await this.getAgentConfiguration(sessionDetails.agentId);
      
      const goldenMasterId = `golden_master_${Date.now()}`;
      
      await this.insertGoldenMaster({
        id: goldenMasterId,
        registrationType: 'USDOT',
        agentName: `Golden Master - ${new Date().toISOString()}`,
        agentConfig: JSON.stringify(agentConfig),
        trainingData: JSON.stringify(await this.getTrainingData(sessionId)),
        performanceMetrics: JSON.stringify(evaluation.performanceMetrics),
        accuracyPercentage: evaluation.overallScore,
        createdFromSessionId: sessionId
      });

      return true;
    }

    return false;
  }

  // Private helper methods

  private compareActions(expected: string, actual: string): boolean {
    // Normalize actions for comparison
    const normalize = (action: string) => action.toLowerCase().trim().replace(/\s+/g, ' ');
    return normalize(expected) === normalize(actual);
  }

  private analyzeMistake(stepId: string, expected: string, actual: string, timestamp: string): TrainingMistake {
    const severity = this.determineMistakeSeverity(expected, actual);
    const explanation = this.generateMistakeExplanation(expected, actual);
    const impact = this.assessMistakeImpact(stepId, expected, actual);

    return {
      stepId,
      expectedAction: expected,
      actualAction: actual,
      severity,
      explanation,
      timestamp,
      impact
    };
  }

  private determineMistakeSeverity(expected: string, actual: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical mistakes that would cause registration failure
    if (expected.includes('3rd party') && !actual.includes('3rd party')) {
      return 'critical';
    }
    
    // High severity - major process deviations
    if (expected.includes('business type') || expected.includes('entity type')) {
      return 'high';
    }
    
    // Medium severity - important but recoverable
    if (expected.includes('contact') || expected.includes('address')) {
      return 'medium';
    }
    
    // Low severity - minor details
    return 'low';
  }

  private generateMistakeExplanation(expected: string, actual: string): string {
    if (expected.includes('3rd party') && !actual.includes('3rd party')) {
      return 'Failed to correctly identify 3rd party service provider status. This is critical for determining the correct registration path.';
    }
    
    if (expected.includes('business type') && !actual.includes('business type')) {
      return 'Incorrect business entity type selection. This affects the required documentation and registration process.';
    }
    
    return `Expected: "${expected}" but got: "${actual}". This may affect the registration process flow.`;
  }

  private assessMistakeImpact(stepId: string, expected: string, actual: string): string {
    if (stepId.includes('3rd_party')) {
      return 'This mistake will cause the agent to follow the wrong registration path entirely, leading to complete failure.';
    }
    
    if (stepId.includes('business_type')) {
      return 'This mistake will require additional documentation and may cause delays in the registration process.';
    }
    
    return 'This mistake may cause minor delays but is generally recoverable.';
  }

  private calculateStepScore(mistake: TrainingMistake, timeSpent: number, confidence?: number): number {
    let score = 0;
    
    // Base score based on mistake severity
    switch (mistake.severity) {
      case 'critical': score = 0; break;
      case 'high': score = 25; break;
      case 'medium': score = 50; break;
      case 'low': score = 75; break;
    }
    
    // Time bonus/penalty
    const expectedTime = 5000; // 5 seconds expected per step
    if (timeSpent <= expectedTime) {
      score += 10; // Speed bonus
    } else if (timeSpent > expectedTime * 2) {
      score -= 10; // Slow penalty
    }
    
    // Confidence bonus
    if (confidence && confidence > 0.8) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculatePathDeviation(sessionId: string): number {
    // This would analyze how much the agent deviated from the expected path
    // For now, return a placeholder value
    return 0.1; // 10% deviation
  }

  private calculateCompletionRate(sessionId: string): number {
    // This would calculate what percentage of the scenario was completed
    // For now, return a placeholder value
    return 100; // 100% completion
  }

  private calculateOverallScore(metrics: PerformanceMetrics, difficultyLevel: number): number {
    // Weighted scoring system
    const accuracyWeight = 0.5;
    const speedWeight = 0.2;
    const confidenceWeight = 0.2;
    const pathDeviationWeight = 0.1;
    
    // Normalize speed (faster is better)
    const speedScore = Math.max(0, 100 - (metrics.speed * 10));
    
    // Normalize path deviation (less deviation is better)
    const deviationScore = Math.max(0, 100 - (metrics.pathDeviation * 100));
    
    const overallScore = 
      (metrics.accuracy * accuracyWeight) +
      (speedScore * speedWeight) +
      (metrics.confidence * 100 * confidenceWeight) +
      (deviationScore * pathDeviationWeight);
    
    // Adjust for difficulty
    const difficultyMultiplier = 1 + (difficultyLevel - 5) * 0.1;
    
    return Math.max(0, Math.min(100, overallScore * difficultyMultiplier));
  }

  private generateRecommendations(metrics: PerformanceMetrics, scenarioDetails: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.accuracy < 90) {
      recommendations.push('Focus on improving accuracy. Review common mistakes and practice similar scenarios.');
    }
    
    if (metrics.speed > 10) {
      recommendations.push('Work on reducing response time. Consider streamlining decision-making processes.');
    }
    
    if (metrics.confidence < 0.7) {
      recommendations.push('Increase confidence in responses. Review training materials and practice more scenarios.');
    }
    
    if (metrics.mistakes.length > 0) {
      const criticalMistakes = metrics.mistakes.filter(m => m.severity === 'critical');
      if (criticalMistakes.length > 0) {
        recommendations.push('Address critical mistakes immediately. These cause complete registration failures.');
      }
    }
    
    return recommendations;
  }

  private needsIntervention(metrics: PerformanceMetrics, sessionDetails: any): boolean {
    // Check for critical issues that require human intervention
    const criticalMistakes = metrics.mistakes.filter(m => m.severity === 'critical');
    const lowAccuracy = metrics.accuracy < 50;
    const verySlow = metrics.speed > 30; // 30 seconds per step
    
    return criticalMistakes.length > 0 || lowAccuracy || verySlow;
  }

  // Database helper methods

  private async storeStepEvaluation(
    sessionId: string,
    stepId: string,
    expectedAction: string,
    actualAction: string,
    isCorrect: boolean,
    timeSpent: number,
    confidence?: number,
    score?: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO training_step_evaluations 
        (session_id, step_id, expected_action, actual_action, is_correct, time_spent, confidence, score, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        sessionId, stepId, expectedAction, actualAction, isCorrect ? 1 : 0,
        timeSpent, confidence, score, new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async getSessionDetails(sessionId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM training_sessions WHERE id = ?',
        [sessionId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  private async getScenarioDetails(scenarioId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM training_scenarios WHERE id = ?',
        [scenarioId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  private async getTrainingSettings(registrationType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM training_environment_settings WHERE registration_type = ?',
        [registrationType],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  private async getRecentSessions(agentId: string, registrationType: string, limit: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ts.*, ts.score, 
               CASE WHEN ts.score >= tes.performance_threshold THEN 1 ELSE 0 END as passed
        FROM training_sessions ts
        JOIN training_scenarios tsc ON ts.scenario_id = tsc.id
        JOIN training_environment_settings tes ON tsc.registration_type = tes.registration_type
        WHERE ts.agent_id = ? AND tsc.registration_type = ?
        ORDER BY ts.created_at DESC
        LIMIT ?
      `;
      
      this.db.all(query, [agentId, registrationType, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  private async getAgentConfiguration(agentId: string): Promise<any> {
    // This would retrieve the agent's configuration
    // For now, return a placeholder
    return { agentId, type: 'USDOT_Registration_Agent' };
  }

  private async getTrainingData(sessionId: string): Promise<any> {
    // This would retrieve the training data used in the session
    // For now, return a placeholder
    return { sessionId, trainingType: 'USDOT_Registration' };
  }

  private async insertGoldenMaster(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO golden_master_agents 
        (id, registration_type, agent_name, agent_config, training_data, performance_metrics, accuracy_percentage, created_from_session_id, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [
        data.id, data.registrationType, data.agentName, data.agentConfig,
        data.trainingData, data.performanceMetrics, data.accuracyPercentage,
        data.createdFromSessionId, 1, new Date().toISOString(), new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default AgentPerformanceGradingService;
