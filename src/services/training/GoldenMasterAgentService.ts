/**
 * Golden Master Agent Service
 * Manages the creation, storage, and replacement of Golden Master agents
 */

import { Database } from 'sqlite3';

export interface GoldenMasterAgent {
  id: string;
  registrationType: string;
  agentName: string;
  agentConfig: any;
  trainingData: any;
  performanceMetrics: any;
  accuracyPercentage: number;
  createdFromSessionId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentReplacementPlan {
  agentId: string;
  registrationType: string;
  currentPerformance: {
    averageAccuracy: number;
    totalSessions: number;
    failureRate: number;
    lastTrainingDate: string;
  };
  replacementReason: string;
  goldenMasterCandidate?: GoldenMasterAgent;
  replacementStrategy: 'immediate' | 'gradual' | 'scheduled';
  estimatedReplacementTime: string;
}

export interface TrainingSession {
  id: string;
  agentId: string;
  scenarioId: string;
  score: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  performanceData?: any;
}

export class GoldenMasterAgentService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a Golden Master agent from a perfect training session
   */
  async createGoldenMaster(
    sessionId: string,
    agentId: string,
    registrationType: string
  ): Promise<GoldenMasterAgent | null> {
    try {
      // Get session details
      const session = await this.getSessionDetails(sessionId);
      if (!session || !session.completed || session.score < 100) {
        throw new Error('Session must be completed with 100% accuracy to create Golden Master');
      }

      // Get agent configuration
      const agentConfig = await this.getAgentConfiguration(agentId);
      
      // Get training data used in the session
      const trainingData = await this.getTrainingData(sessionId);
      
      // Get performance metrics
      const performanceMetrics = await this.getSessionPerformanceMetrics(sessionId);

      // Create Golden Master
      const goldenMasterId = `golden_master_${registrationType}_${Date.now()}`;
      const goldenMasterName = `Golden Master ${registrationType} - ${new Date().toLocaleDateString()}`;

      const goldenMaster: GoldenMasterAgent = {
        id: goldenMasterId,
        registrationType,
        agentName: goldenMasterName,
        agentConfig,
        trainingData,
        performanceMetrics,
        accuracyPercentage: 100.0,
        createdFromSessionId: sessionId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to database
      await this.saveGoldenMaster(goldenMaster);

      // Log the creation
      console.log(`✅ Golden Master created: ${goldenMasterName} (${goldenMasterId})`);

      return goldenMaster;
    } catch (error) {
      console.error('Error creating Golden Master:', error);
      return null;
    }
  }

  /**
   * Get all Golden Master agents for a registration type
   */
  async getGoldenMasters(registrationType?: string): Promise<GoldenMasterAgent[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM golden_master_agents WHERE is_active = 1';
      const params: any[] = [];

      if (registrationType) {
        query += ' AND registration_type = ?';
        params.push(registrationType);
      }

      query += ' ORDER BY created_at DESC';

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const goldenMasters = rows.map(row => ({
          ...row,
          agentConfig: JSON.parse(row.agent_config),
          trainingData: JSON.parse(row.training_data),
          performanceMetrics: JSON.parse(row.performance_metrics),
          isActive: row.is_active === 1
        }));

        resolve(goldenMasters);
      });
    });
  }

  /**
   * Get the best Golden Master for a specific registration type
   */
  async getBestGoldenMaster(registrationType: string): Promise<GoldenMasterAgent | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM golden_master_agents 
        WHERE registration_type = ? AND is_active = 1 
        ORDER BY accuracy_percentage DESC, created_at DESC 
        LIMIT 1
      `;

      this.db.get(query, [registrationType], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const goldenMaster: GoldenMasterAgent = {
          ...row,
          agentConfig: JSON.parse(row.agent_config),
          trainingData: JSON.parse(row.training_data),
          performanceMetrics: JSON.parse(row.performance_metrics),
          isActive: row.is_active === 1
        };

        resolve(goldenMaster);
      });
    });
  }

  /**
   * Analyze if an agent should be replaced
   */
  async analyzeAgentForReplacement(
    agentId: string,
    registrationType: string
  ): Promise<AgentReplacementPlan | null> {
    try {
      // Get agent performance history
      const performanceHistory = await this.getAgentPerformanceHistory(agentId, registrationType);
      
      if (performanceHistory.length < 5) {
        return null; // Not enough data to make a decision
      }

      // Calculate current performance metrics
      const currentPerformance = this.calculatePerformanceMetrics(performanceHistory);
      
      // Check if agent meets replacement criteria
      const replacementCriteria = await this.getReplacementCriteria(registrationType);
      
      const shouldReplace = 
        currentPerformance.averageAccuracy < replacementCriteria.minAccuracy ||
        currentPerformance.failureRate > replacementCriteria.maxFailureRate ||
        this.isAgentStagnant(currentPerformance, performanceHistory);

      if (!shouldReplace) {
        return null;
      }

      // Get best Golden Master for replacement
      const goldenMasterCandidate = await this.getBestGoldenMaster(registrationType);
      
      if (!goldenMasterCandidate) {
        console.warn(`No Golden Master available for ${registrationType} registration type`);
        return null;
      }

      // Determine replacement strategy
      const replacementStrategy = this.determineReplacementStrategy(currentPerformance, goldenMasterCandidate);
      
      // Generate replacement plan
      const replacementPlan: AgentReplacementPlan = {
        agentId,
        registrationType,
        currentPerformance,
        replacementReason: this.generateReplacementReason(currentPerformance, replacementCriteria),
        goldenMasterCandidate,
        replacementStrategy,
        estimatedReplacementTime: this.estimateReplacementTime(replacementStrategy)
      };

      return replacementPlan;
    } catch (error) {
      console.error('Error analyzing agent for replacement:', error);
      return null;
    }
  }

  /**
   * Execute agent replacement
   */
  async executeAgentReplacement(
    replacementPlan: AgentReplacementPlan,
    replacementStrategy: 'immediate' | 'gradual' | 'scheduled' = 'immediate'
  ): Promise<boolean> {
    try {
      const { agentId, goldenMasterCandidate } = replacementPlan;

      switch (replacementStrategy) {
        case 'immediate':
          return await this.immediateReplacement(agentId, goldenMasterCandidate);
        
        case 'gradual':
          return await this.gradualReplacement(agentId, goldenMasterCandidate);
        
        case 'scheduled':
          return await this.scheduleReplacement(agentId, goldenMasterCandidate);
        
        default:
          throw new Error(`Unknown replacement strategy: ${replacementStrategy}`);
      }
    } catch (error) {
      console.error('Error executing agent replacement:', error);
      return false;
    }
  }

  /**
   * Deactivate a Golden Master agent
   */
  async deactivateGoldenMaster(goldenMasterId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE golden_master_agents 
        SET is_active = 0, updated_at = ? 
        WHERE id = ?
      `;

      this.db.run(query, [new Date().toISOString(), goldenMasterId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Get Golden Master performance statistics
   */
  async getGoldenMasterStats(registrationType?: string): Promise<{
    totalGoldenMasters: number;
    activeGoldenMasters: number;
    averageAccuracy: number;
    oldestGoldenMaster: string;
    newestGoldenMaster: string;
  }> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM golden_master_agents';
      const params: any[] = [];

      if (registrationType) {
        query += ' WHERE registration_type = ?';
        params.push(registrationType);
      }

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const activeMasters = rows.filter(row => row.is_active === 1);
        const totalGoldenMasters = rows.length;
        const activeGoldenMasters = activeMasters.length;
        
        const averageAccuracy = activeMasters.length > 0 
          ? activeMasters.reduce((sum, master) => sum + master.accuracy_percentage, 0) / activeMasters.length
          : 0;

        const dates = rows.map(row => new Date(row.created_at));
        const oldestGoldenMaster = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : '';
        const newestGoldenMaster = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString() : '';

        resolve({
          totalGoldenMasters,
          activeGoldenMasters,
          averageAccuracy,
          oldestGoldenMaster,
          newestGoldenMaster
        });
      });
    });
  }

  // Private helper methods

  private async getSessionDetails(sessionId: string): Promise<TrainingSession | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM training_sessions WHERE id = ?',
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  private async getAgentConfiguration(agentId: string): Promise<any> {
    // This would retrieve the agent's configuration from the AI system
    // For now, return a placeholder configuration
    return {
      agentId,
      type: 'USDOT_Registration_Agent',
      model: 'gpt-4',
      temperature: 0.1,
      maxTokens: 2000,
      systemPrompt: 'You are an expert USDOT registration assistant...',
      tools: ['web_search', 'form_filling', 'validation'],
      createdAt: new Date().toISOString()
    };
  }

  private async getTrainingData(sessionId: string): Promise<any> {
    // This would retrieve the training data used in the session
    return {
      sessionId,
      scenarios: ['usdot_scenario_001', 'usdot_scenario_002'],
      trainingType: 'USDOT_Registration',
      dataVersion: '1.0',
      createdAt: new Date().toISOString()
    };
  }

  private async getSessionPerformanceMetrics(sessionId: string): Promise<any> {
    // This would retrieve detailed performance metrics for the session
    return {
      sessionId,
      accuracy: 100.0,
      speed: 45.2, // seconds
      confidence: 0.95,
      mistakes: [],
      pathDeviation: 0.0,
      completionRate: 100.0
    };
  }

  private async saveGoldenMaster(goldenMaster: GoldenMasterAgent): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO golden_master_agents 
        (id, registration_type, agent_name, agent_config, training_data, performance_metrics, 
         accuracy_percentage, created_from_session_id, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        goldenMaster.id,
        goldenMaster.registrationType,
        goldenMaster.agentName,
        JSON.stringify(goldenMaster.agentConfig),
        JSON.stringify(goldenMaster.trainingData),
        JSON.stringify(goldenMaster.performanceMetrics),
        goldenMaster.accuracyPercentage,
        goldenMaster.createdFromSessionId,
        goldenMaster.isActive ? 1 : 0,
        goldenMaster.createdAt,
        goldenMaster.updatedAt
      ], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async getAgentPerformanceHistory(agentId: string, registrationType: string): Promise<TrainingSession[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ts.*, tsc.registration_type
        FROM training_sessions ts
        JOIN training_scenarios tsc ON ts.scenario_id = tsc.id
        WHERE ts.agent_id = ? AND tsc.registration_type = ?
        ORDER BY ts.created_at DESC
        LIMIT 20
      `;

      this.db.all(query, [agentId, registrationType], (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  private calculatePerformanceMetrics(sessions: TrainingSession[]): {
    averageAccuracy: number;
    totalSessions: number;
    failureRate: number;
    lastTrainingDate: string;
  } {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const averageAccuracy = sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions;
    const failureRate = (totalSessions - completedSessions) / totalSessions;
    const lastTrainingDate = sessions[0]?.startTime || '';

    return {
      averageAccuracy,
      totalSessions,
      failureRate,
      lastTrainingDate
    };
  }

  private async getReplacementCriteria(registrationType: string): Promise<{
    minAccuracy: number;
    maxFailureRate: number;
    maxStagnantDays: number;
  }> {
    // Get from training environment settings
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM training_environment_settings WHERE registration_type = ?',
        [registrationType],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            // Default criteria
            resolve({
              minAccuracy: 85.0,
              maxFailureRate: 0.3,
              maxStagnantDays: 7
            });
            return;
          }

          resolve({
            minAccuracy: row.performance_threshold,
            maxFailureRate: 0.3, // 30% failure rate
            maxStagnantDays: 7
          });
        }
      );
    });
  }

  private isAgentStagnant(performance: any, sessions: TrainingSession[]): boolean {
    // Check if agent hasn't improved in the last few sessions
    if (sessions.length < 5) return false;

    const recentSessions = sessions.slice(0, 3);
    const olderSessions = sessions.slice(3, 6);

    const recentAvg = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;
    const olderAvg = olderSessions.reduce((sum, s) => sum + s.score, 0) / olderSessions.length;

    // If performance hasn't improved by at least 5% in recent sessions
    return recentAvg <= olderAvg + 5;
  }

  private determineReplacementStrategy(
    currentPerformance: any,
    goldenMaster: GoldenMasterAgent
  ): 'immediate' | 'gradual' | 'scheduled' {
    // Immediate replacement for critical failures
    if (currentPerformance.averageAccuracy < 50 || currentPerformance.failureRate > 0.7) {
      return 'immediate';
    }

    // Gradual replacement for moderate issues
    if (currentPerformance.averageAccuracy < 75 || currentPerformance.failureRate > 0.4) {
      return 'gradual';
    }

    // Scheduled replacement for minor issues
    return 'scheduled';
  }

  private generateReplacementReason(performance: any, criteria: any): string {
    if (performance.averageAccuracy < criteria.minAccuracy) {
      return `Low accuracy: ${performance.averageAccuracy.toFixed(1)}% (minimum: ${criteria.minAccuracy}%)`;
    }
    
    if (performance.failureRate > criteria.maxFailureRate) {
      return `High failure rate: ${(performance.failureRate * 100).toFixed(1)}% (maximum: ${(criteria.maxFailureRate * 100).toFixed(1)}%)`;
    }
    
    return 'Performance stagnation detected';
  }

  private estimateReplacementTime(strategy: string): string {
    switch (strategy) {
      case 'immediate':
        return 'Immediate';
      case 'gradual':
        return '2-4 hours';
      case 'scheduled':
        return 'Next maintenance window';
      default:
        return 'Unknown';
    }
  }

  private async immediateReplacement(agentId: string, goldenMaster: GoldenMasterAgent): Promise<boolean> {
    try {
      // This would integrate with the actual AI agent system to replace the agent
      console.log(`🔄 Immediate replacement: ${agentId} -> ${goldenMaster.agentName}`);
      
      // For now, just log the replacement
      // In a real implementation, this would:
      // 1. Stop the current agent
      // 2. Load the Golden Master configuration
      // 3. Start the new agent with Golden Master settings
      // 4. Update routing to use the new agent
      
      return true;
    } catch (error) {
      console.error('Error in immediate replacement:', error);
      return false;
    }
  }

  private async gradualReplacement(agentId: string, goldenMaster: GoldenMasterAgent): Promise<boolean> {
    try {
      // This would implement a gradual replacement strategy
      console.log(`🔄 Gradual replacement: ${agentId} -> ${goldenMaster.agentName}`);
      
      // In a real implementation, this would:
      // 1. Start routing a percentage of requests to the Golden Master
      // 2. Gradually increase the percentage over time
      // 3. Monitor performance of both agents
      // 4. Complete the replacement once Golden Master proves stable
      
      return true;
    } catch (error) {
      console.error('Error in gradual replacement:', error);
      return false;
    }
  }

  private async scheduleReplacement(agentId: string, goldenMaster: GoldenMasterAgent): Promise<boolean> {
    try {
      // This would schedule the replacement for a maintenance window
      console.log(`🔄 Scheduled replacement: ${agentId} -> ${goldenMaster.agentName}`);
      
      // In a real implementation, this would:
      // 1. Schedule the replacement for the next maintenance window
      // 2. Prepare the Golden Master for deployment
      // 3. Execute the replacement during low-traffic periods
      
      return true;
    } catch (error) {
      console.error('Error in scheduled replacement:', error);
      return false;
    }
  }
}

export default GoldenMasterAgentService;
