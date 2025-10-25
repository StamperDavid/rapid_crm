/**
 * Alex Training Service
 * Manages training sessions, scenario testing, and feedback processing
 */

import { scenarioGenerator, USDOTApplicationScenario } from './ScenarioGenerator';
import Database from 'better-sqlite3';
import path from 'path';

interface TrainingSession {
  id: string;
  sessionName: string;
  startedAt: string;
  completedAt: string | null;
  totalScenarios: number;
  scenariosCompleted: number;
  scenariosCorrect: number;
  scenariosIncorrect: number;
  scenariosPendingReview: number;
  accuracyPercentage: number | null;
  averageResponseTimeMs: number | null;
  status: 'in_progress' | 'completed' | 'paused';
  notes: string | null;
}

interface AlexTestResult {
  id: string;
  scenarioId: string;
  testSessionId: string;
  alexUsdotRequired: boolean;
  alexMcAuthorityRequired: boolean;
  alexHazmatRequired: boolean;
  alexIftaRequired: boolean;
  alexStateRegistrationRequired: boolean;
  alexReasoning: string;
  alexFullResponse: string;
  isCorrect: boolean | null;
  mistakes: string | null;
  reviewerFeedback: string | null;
  correctAnswer: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  testedAt: string;
  responseTimeMs: number;
}

export class AlexTrainingService {
  private static instance: AlexTrainingService;
  private db: Database.Database | null = null;
  private currentSessionId: string | null = null;
  private scenarioQueue: string[] = [];

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): AlexTrainingService {
    if (!AlexTrainingService.instance) {
      AlexTrainingService.instance = new AlexTrainingService();
    }
    return AlexTrainingService.instance;
  }

  private initializeDatabase() {
    try {
      const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');
      this.db = new Database(dbPath);
      
      // Load schema
      const schemaPath = path.join(process.cwd(), 'src', 'database', 'alex_training_schema.sql');
      const schema = require('fs').readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
      
      console.log('✅ Alex Training database initialized');
    } catch (error) {
      console.error('❌ Error initializing training database:', error);
    }
  }

  /**
   * Generate all training scenarios
   */
  public async generateTrainingScenarios(): Promise<{ success: boolean; count: number; session: TrainingSession }> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🎯 Generating 918 transportation compliance training scenarios...');
    console.log('🗑️  Deleting old scenarios...');
    
    // Delete all existing scenarios
    this.db.prepare('DELETE FROM alex_training_scenarios').run();
    this.db.prepare('DELETE FROM alex_test_results').run();
    this.db.prepare('DELETE FROM alex_training_sessions').run();
    
    console.log('✅ Old scenarios deleted');
    console.log('🎯 Generating new 918 scenarios...');
    
    const scenarios = await scenarioGenerator.generateAllScenarios();
    console.log(`📊 Generated ${scenarios.length} scenarios`);
    
    // Store scenarios in database
    const insertScenario = this.db.prepare(`
      INSERT INTO alex_training_scenarios (
        id, scenario_data, state, operation_type, operation_radius, business_type,
        has_hazmat, fleet_size, expected_usdot_required, expected_mc_authority_required,
        expected_hazmat_required, expected_ifta_required, expected_state_registration_required,
        expected_reasoning, created_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertMany = this.db.transaction((scenarios: USDOTApplicationScenario[]) => {
      for (const scenario of scenarios) {
        const operationType = scenario.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private_property';
        const operationRadius = scenario.transportNonHazardousInterstate === 'Yes' ? 'interstate' : 'intrastate';
        const fleetSize = this.determineFleetSize(scenario);
        
        insertScenario.run(
          scenario.id,
          JSON.stringify(scenario),
          scenario.principalAddress.state,
          operationType,
          operationRadius,
          scenario.formOfBusiness,
          scenario.cargoClassifications.includes('hazmat') ? 1 : 0,
          fleetSize,
          scenario.expectedRequirements.usdotRequired ? 1 : 0,
          scenario.expectedRequirements.mcAuthorityRequired ? 1 : 0,
          scenario.expectedRequirements.hazmatEndorsementRequired ? 1 : 0,
          scenario.expectedRequirements.iftaRequired ? 1 : 0,
          scenario.expectedRequirements.stateRegistrationRequired ? 1 : 0,
          scenario.expectedRequirements.reasoning,
          new Date().toISOString()
        );
      }
    });

    insertMany(scenarios);

    // Create training session
    const session = this.createTrainingSession('Main Training Session', scenarios.length);

    console.log(`✅ Generated ${scenarios.length} training scenarios`);
    return { success: true, count: scenarios.length, session };
  }

  /**
   * Create a new training session
   */
  private createTrainingSession(name: string, totalScenarios: number): TrainingSession {
    if (!this.db) throw new Error('Database not initialized');

    const sessionId = `session_${Date.now()}`;
    
    this.db.prepare(`
      INSERT INTO alex_training_sessions (
        id, session_name, started_at, total_scenarios, scenarios_completed,
        scenarios_correct, scenarios_incorrect, scenarios_pending_review, status
      ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 'in_progress')
    `).run(sessionId, name, new Date().toISOString(), totalScenarios);

    this.currentSessionId = sessionId;

    return this.getSession(sessionId)!;
  }

  /**
   * Get current or latest training session
   */
  public getOrCreateSession(): TrainingSession {
    if (!this.db) throw new Error('Database not initialized');

    // Try to get current session
    if (this.currentSessionId) {
      const session = this.getSession(this.currentSessionId);
      if (session) return session;
    }

    // Get latest session
    const latestSession = this.db.prepare(`
      SELECT * FROM alex_training_sessions 
      ORDER BY started_at DESC LIMIT 1
    `).get() as any;

    if (latestSession) {
      this.currentSessionId = latestSession.id;
      return this.mapSession(latestSession);
    }

    // Create new session
    return this.createTrainingSession('Training Session', 0);
  }

  private getSession(sessionId: string): TrainingSession | null {
    if (!this.db) return null;

    const session = this.db.prepare(`
      SELECT * FROM alex_training_sessions WHERE id = ?
    `).get(sessionId) as any;

    return session ? this.mapSession(session) : null;
  }

  private mapSession(row: any): TrainingSession {
    return {
      id: row.id,
      sessionName: row.session_name,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalScenarios: row.total_scenarios,
      scenariosCompleted: row.scenarios_completed,
      scenariosCorrect: row.scenarios_correct,
      scenariosIncorrect: row.scenarios_incorrect,
      scenariosPendingReview: row.scenarios_pending_review,
      accuracyPercentage: row.accuracy_percentage,
      averageResponseTimeMs: row.average_response_time_ms,
      status: row.status,
      notes: row.notes
    };
  }

  /**
   * Get next scenario for testing
   */
  public getNextScenario(): USDOTApplicationScenario | null {
    if (!this.db) return null;

    // Get a random untested scenario
    const scenario = this.db.prepare(`
      SELECT * FROM alex_training_scenarios
      WHERE id NOT IN (
        SELECT scenario_id FROM alex_test_results 
        WHERE test_session_id = ?
      )
      AND is_active = 1
      ORDER BY RANDOM()
      LIMIT 1
    `).get(this.currentSessionId) as any;

    if (!scenario) return null;

    return JSON.parse(scenario.scenario_data);
  }

  /**
   * Test Alex with a scenario and get response
   */
  public async testAlexWithScenario(scenario: USDOTApplicationScenario): Promise<{
    usdotRequired: boolean;
    mcAuthorityRequired: boolean;
    hazmatRequired: boolean;
    iftaRequired: boolean;
    stateRegistrationRequired: boolean;
    reasoning: string;
    confidence: number;
  }> {
    // This would call the actual Alex agent
    // For now, simulating Alex's response with some logic
    
    const startTime = Date.now();
    
    // Determine what Alex would say based on the scenario
    const operationType = scenario.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private_property';
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const hasHazmat = scenario.cargoClassifications.includes('hazmat');
    const totalVehicles = scenario.cmvInterstateOnly + scenario.cmvIntrastateOnly;

    let reasoning = '';
    let usdotRequired = false;
    let mcAuthorityRequired = false;
    let hazmatRequired = false;
    let iftaRequired = false;
    let stateRegistrationRequired = false;

    // Alex's logic (this would be the actual agent's determination)
    if (isInterstate) {
      usdotRequired = true;
      reasoning += `Interstate commerce detected. USDOT required for CMVs over 10,001 lbs. `;
      
      if (operationType === 'for_hire') {
        mcAuthorityRequired = true;
        reasoning += `For-hire operation requires MC Authority. `;
      }
      
      if (totalVehicles >= 2) {
        iftaRequired = true;
        reasoning += `IFTA required for interstate fuel tax reporting with ${totalVehicles} vehicles. `;
      }
    } else {
      reasoning += `Intrastate operation in ${scenario.principalAddress.state}. `;
      usdotRequired = true;
      stateRegistrationRequired = true;
      reasoning += `State-specific thresholds apply. `;
    }

    if (hasHazmat) {
      hazmatRequired = true;
      reasoning += `Hazmat endorsement required for transporting hazardous materials. `;
    }

    const responseTime = Date.now() - startTime;

    // Store test result
    await this.storeTestResult(scenario.id, {
      usdotRequired,
      mcAuthorityRequired,
      hazmatRequired,
      iftaRequired,
      stateRegistrationRequired,
      reasoning,
      confidence: 0.85,
      responseTimeMs: responseTime
    });

    return {
      usdotRequired,
      mcAuthorityRequired,
      hazmatRequired,
      iftaRequired,
      stateRegistrationRequired,
      reasoning,
      confidence: 0.85
    };
  }

  /**
   * Store Alex's test result
   */
  private async storeTestResult(scenarioId: string, response: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const resultId = `result_${Date.now()}`;
    
    this.db.prepare(`
      INSERT INTO alex_test_results (
        id, scenario_id, test_session_id,
        alex_usdot_required, alex_mc_authority_required, alex_hazmat_required,
        alex_ifta_required, alex_state_registration_required, alex_reasoning,
        alex_full_response, tested_at, response_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      resultId,
      scenarioId,
      this.currentSessionId,
      response.usdotRequired ? 1 : 0,
      response.mcAuthorityRequired ? 1 : 0,
      response.hazmatRequired ? 1 : 0,
      response.iftaRequired ? 1 : 0,
      response.stateRegistrationRequired ? 1 : 0,
      response.reasoning,
      JSON.stringify(response),
      new Date().toISOString(),
      response.responseTimeMs
    );

    return resultId;
  }

  /**
   * Submit feedback for a test result
   */
  public async submitFeedback(
    scenarioId: string,
    isCorrect: boolean,
    feedback: string,
    alexResponse: any
  ): Promise<TrainingSession> {
    if (!this.db) throw new Error('Database not initialized');

    // Update test result with review
    this.db.prepare(`
      UPDATE alex_test_results
      SET is_correct = ?,
          reviewer_feedback = ?,
          reviewed_by = 'admin',
          reviewed_at = ?
      WHERE scenario_id = ? AND test_session_id = ?
    `).run(
      isCorrect ? 1 : 0,
      feedback,
      new Date().toISOString(),
      scenarioId,
      this.currentSessionId
    );

    // If incorrect, store correction in shared knowledge base
    if (!isCorrect && feedback) {
      await this.storeCorrection(scenarioId, feedback);
    }

    // Update session stats
    this.updateSessionStats();

    return this.getSession(this.currentSessionId!)!;
  }

  /**
   * Store correction in shared knowledge base
   */
  private async storeCorrection(scenarioId: string, feedback: string) {
    if (!this.db) return;

    // Get scenario
    const scenario = this.db.prepare(`
      SELECT * FROM alex_training_scenarios WHERE id = ?
    `).get(scenarioId) as any;

    if (!scenario) return;

    // Store in shared regulatory knowledge
    const knowledgeId = `knowledge_${Date.now()}`;
    
    this.db.prepare(`
      INSERT INTO shared_regulatory_knowledge (
        id, state, operation_type, operation_radius,
        usdot_required, mc_authority_required, hazmat_required,
        ifta_required, state_registration_required, reasoning,
        learned_from_scenario_id, learned_from_agent, correction_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      knowledgeId,
      scenario.state,
      scenario.operation_type,
      scenario.operation_radius,
      scenario.expected_usdot_required,
      scenario.expected_mc_authority_required,
      scenario.expected_hazmat_required,
      scenario.expected_ifta_required,
      scenario.expected_state_registration_required,
      scenario.expected_reasoning,
      scenarioId,
      'alex',
      feedback,
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  /**
   * Update session statistics
   */
  private updateSessionStats() {
    if (!this.db || !this.currentSessionId) return;

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as incorrect,
        SUM(CASE WHEN is_correct IS NULL THEN 1 ELSE 0 END) as pending,
        AVG(response_time_ms) as avg_response_time
      FROM alex_test_results
      WHERE test_session_id = ?
    `).get(this.currentSessionId) as any;

    const accuracyPercentage = stats.total > 0 
      ? (stats.correct / stats.total) * 100 
      : null;

    this.db.prepare(`
      UPDATE alex_training_sessions
      SET scenarios_completed = ?,
          scenarios_correct = ?,
          scenarios_incorrect = ?,
          scenarios_pending_review = ?,
          accuracy_percentage = ?,
          average_response_time_ms = ?
      WHERE id = ?
    `).run(
      stats.total,
      stats.correct,
      stats.incorrect,
      stats.pending,
      accuracyPercentage,
      stats.avg_response_time,
      this.currentSessionId
    );
  }

  private determineFleetSize(scenario: USDOTApplicationScenario): string {
    const total = scenario.cmvInterstateOnly + scenario.cmvIntrastateOnly;
    if (total <= 3) return 'small';
    if (total <= 10) return 'medium';
    return 'large';
  }
}

export const alexTrainingService = AlexTrainingService.getInstance();





