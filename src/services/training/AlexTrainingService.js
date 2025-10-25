/**
 * Alex Training Service
 * Manages training sessions, scenario testing, and feedback processing
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class AlexTrainingService {
  constructor() {
    this.db = null;
    this.currentSessionId = null;
    this.scenarioQueue = [];
    this.initializeDatabase();
  }

  initializeDatabase() {
    try {
      const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');
      this.db = new Database(dbPath);
      
      // Load schema
      const schemaPath = path.join(process.cwd(), 'src', 'database', 'alex_training_schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
      
      console.log('✅ Alex Training database initialized');
    } catch (error) {
      console.error('❌ Error initializing training database:', error);
    }
  }

  /**
   * Generate all training scenarios (replaces old scenarios)
   * Uses ScenarioGenerator.ts via dynamic import
   */
  async generateTrainingScenarios() {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🎯 Generating training scenarios for transportation compliance...');
    console.log('🗑️  Deleting old scenarios...');
    
    // Delete all existing scenarios
    this.db.prepare('DELETE FROM alex_training_scenarios').run();
    this.db.prepare('DELETE FROM alex_test_results').run();
    this.db.prepare('DELETE FROM alex_training_sessions').run();
    
    console.log('✅ Old scenarios deleted');
    console.log('🎯 Generating new scenarios using ScenarioGenerator...');
    
    // Use the TypeScript ScenarioGenerator via dynamic import
    const { scenarioGenerator } = await import('./ScenarioGenerator.ts');
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

    const insertMany = this.db.transaction((scenarios) => {
      for (const scenario of scenarios) {
        const operationType = scenario.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private_property';
        const operationRadius = scenario.transportNonHazardousInterstate === 'Yes' ? 'interstate' : 'intrastate';
        const fleetSize = scenario.vehicles.straightTrucks.owned + scenario.vehicles.truckTractors.owned;
        
        insertScenario.run(
          scenario.id,
          JSON.stringify(scenario),
          scenario.principalAddress.state,
          operationType,
          operationRadius,
          scenario.formOfBusiness,
          scenario.transportHazardousMaterials === 'Yes' ? 1 : 0,
          fleetSize,
          scenario.complianceRequirements.usdotRequired ? 1 : 0,
          scenario.complianceRequirements.mcAuthorityRequired ? 1 : 0,
          scenario.complianceRequirements.hazmatEndorsementRequired ? 1 : 0,
          scenario.complianceRequirements.iftaRequired ? 1 : 0,
          scenario.complianceRequirements.stateRegistrationRequired ? 1 : 0,
          scenario.complianceRequirements.reasoning,
          new Date().toISOString()
        );
      }
    });

    insertMany(scenarios);
    console.log(`✅ Stored ${scenarios.length} scenarios in database`);

    // Create new training session
    const session = this.createNewSession(scenarios.length);
    
    return {
      success: true,
      count: scenarios.length,
      session
    };
  }

  createNewSession(totalScenarios) {
    const sessionId = `session_${Date.now()}`;
    const sessionName = `Training Session ${new Date().toLocaleDateString()}`;
    
    this.db.prepare(`
      INSERT INTO alex_training_sessions (
        id, session_name, started_at, total_scenarios, scenarios_completed,
        scenarios_correct, scenarios_incorrect, scenarios_pending_review,
        accuracy_percentage, average_response_time_ms, status
      ) VALUES (?, ?, ?, ?, 0, 0, 0, ?, NULL, NULL, 'in_progress')
    `).run(sessionId, sessionName, new Date().toISOString(), totalScenarios, totalScenarios);

    this.currentSessionId = sessionId;
    
    return {
      id: sessionId,
      sessionName,
      startedAt: new Date().toISOString(),
      completedAt: null,
      totalScenarios,
      scenariosCompleted: 0,
      scenariosCorrect: 0,
      scenariosIncorrect: 0,
      scenariosPendingReview: totalScenarios,
      accuracyPercentage: null,
      averageResponseTimeMs: null,
      status: 'in_progress',
      notes: null
    };
  }

  getOrCreateSession() {
    if (this.currentSessionId) {
      const session = this.db.prepare('SELECT * FROM alex_training_sessions WHERE id = ?').get(this.currentSessionId);
      if (session) {
        return {
          id: session.id,
          sessionName: session.session_name,
          startedAt: session.started_at,
          completedAt: session.completed_at,
          totalScenarios: session.total_scenarios,
          scenariosCompleted: session.scenarios_completed,
          scenariosCorrect: session.scenarios_correct,
          scenariosIncorrect: session.scenarios_incorrect,
          scenariosPendingReview: session.scenarios_pending_review,
          accuracyPercentage: session.accuracy_percentage,
          averageResponseTimeMs: session.average_response_time_ms,
          status: session.status,
          notes: session.notes
        };
      }
    }

    // Try to get most recent session
    const session = this.db.prepare(`
      SELECT * FROM alex_training_sessions 
      ORDER BY started_at DESC 
      LIMIT 1
    `).get();

    if (session) {
      this.currentSessionId = session.id;
      return {
        id: session.id,
        sessionName: session.session_name,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        totalScenarios: session.total_scenarios,
        scenariosCompleted: session.scenarios_completed,
        scenariosCorrect: session.scenarios_correct,
        scenariosIncorrect: session.scenarios_incorrect,
        scenariosPendingReview: session.scenarios_pending_review,
        accuracyPercentage: session.accuracy_percentage,
        averageResponseTimeMs: session.average_response_time_ms,
        status: session.status,
        notes: session.notes
      };
    }

    return null;
  }

  /**
   * Get all scenarios from database
   */
  getAllScenarios() {
    if (!this.db) return [];
    
    const scenarios = this.db.prepare(`
      SELECT * FROM alex_training_scenarios 
      WHERE is_active = 1
      ORDER BY id
    `).all();

    return scenarios.map(s => JSON.parse(s.scenario_data));
  }

  getNextScenario() {
    console.log('🎯 getNextScenario() called');
    
    if (!this.currentSessionId) {
      console.log('⚠️ No current session, creating one...');
      const session = this.getOrCreateSession();
      if (!session) {
        console.log('❌ Could not create session');
        return null;
      }
    }

    console.log(`📝 Current session ID: ${this.currentSessionId}`);
    
    // Get untested scenarios for this session
    console.log('🔍 Looking for untested scenarios...');
    const scenario = this.db.prepare(`
      SELECT ats.* 
      FROM alex_training_scenarios ats
      WHERE ats.is_active = 1
      AND ats.id NOT IN (
        SELECT scenario_id 
        FROM alex_test_results 
        WHERE test_session_id = ?
      )
      ORDER BY RANDOM()
      LIMIT 1
    `).get(this.currentSessionId);

    if (scenario) {
      console.log(`✅ Found scenario: ${scenario.id}`);
      return {
        ...JSON.parse(scenario.scenario_data),
        id: scenario.id
      };
    }

    console.log('⚠️ No untested scenarios found');
    return null;
  }
}

// Singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new AlexTrainingService();
  }
  return instance;
}

module.exports = {
  alexTrainingService: getInstance(),
  AlexTrainingService
};

