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
    console.log('⚠️  ScenarioGenerator removed - scenarios are pre-written');
    console.log('💡 Use the existing 918 scenarios in the database instead');
    
    // Scenarios are pre-written and should already be in database
    // This endpoint should not be called - scenarios exist already
    throw new Error('Scenario generation disabled - 918 scenarios already exist in database');
    
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

    // No session exists - check if scenarios exist and create session
    console.log('📊 No session found, checking for existing scenarios...');
    const scenarioCount = this.db.prepare('SELECT COUNT(*) as count FROM alex_training_scenarios WHERE is_active = 1').get();
    
    if (scenarioCount && scenarioCount.count > 0) {
      console.log(`✅ Found ${scenarioCount.count} existing scenarios, creating session...`);
      return this.createNewSession(scenarioCount.count);
    }

    console.log('⚠️ No scenarios found in database');
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

  /**
   * Test Alex AI with a scenario
   * Uses REAL LLM-based determination
   * aiService is passed to avoid TypeScript import issues
   */
  async testAlexWithScenario(scenario, aiService = null) {
    const startTime = Date.now();
    
    console.log(`🧠 Testing REAL Alex AI with scenario: ${scenario.id || 'unknown'}`);
    
    // Import the REAL Alex determination service (LLM-based)
    let alexDeterminationService;
    try {
      const module = await import('../ai/AlexDeterminationService.js');
      alexDeterminationService = module.alexDeterminationService;
    } catch (e) {
      console.error('❌ Could not load Alex Determination Service:', e.message);
      console.warn('⚠️ Falling back to basic logic');
      return this.fallbackDetermination(scenario);
    }
    
    // Call REAL Alex AI (uses LLM to analyze and make determination)
    try {
      const result = await alexDeterminationService.determine(scenario, aiService);
      
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ Alex AI determination complete in ${responseTime}ms`);
      console.log(`   USDOT: ${result.usdotRequired}`);
      console.log(`   MC Authority: ${result.mcAuthorityRequired}`);
      console.log(`   Hazmat: ${result.hazmatRequired}`);
      console.log(`   IFTA: ${result.iftaRequired}`);
      console.log(`   State Reg: ${result.stateRegistrationRequired}`);
      console.log(`   Driver Qual Files: ${result.driverQualificationFilesRequired}`);
      console.log(`   Thresholds: ${result.appliedThresholds.source} (${result.appliedThresholds.state})`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      
      return {
        usdotRequired: result.usdotRequired,
        mcAuthorityRequired: result.mcAuthorityRequired,
        hazmatRequired: result.hazmatRequired,
        iftaRequired: result.iftaRequired,
        stateRegistrationRequired: result.stateRegistrationRequired,
        driverQualificationFilesRequired: result.driverQualificationFilesRequired,
        reasoning: result.reasoning,
        appliedThresholds: result.appliedThresholds,
        confidence: result.confidence,
        rawLLMResponse: result.rawLLMResponse
      };
    } catch (error) {
      console.error('❌ Error calling Alex AI:', error);
      return this.fallbackDetermination(scenario);
    }
  }

  /**
   * Fallback determination logic if engine not available
   */
  fallbackDetermination(scenario) {
    const isInterstate = scenario.transportNonHazardousInterstate === 'Yes';
    const isForHire = scenario.receiveCompensationForTransport === 'Yes';
    const hasHazmat = scenario.transportHazardousMaterials === 'Yes';
    const totalVehicles = (scenario.cmvInterstateOnly || 0) + (scenario.cmvIntrastateOnly || 0);
    
    let reasoning = '';
    let usdotRequired = false;
    let mcAuthorityRequired = false;
    let hazmatRequired = false;
    let iftaRequired = false;
    let stateRegistrationRequired = false;
    
    if (isInterstate) {
      usdotRequired = true;
      reasoning += 'Interstate commerce detected. USDOT required for CMVs over 10,001 lbs. ';
      
      if (isForHire) {
        mcAuthorityRequired = true;
        reasoning += 'For-hire operation requires MC Authority. ';
      }
      
      if (totalVehicles >= 2) {
        iftaRequired = true;
        reasoning += `IFTA required for interstate fuel tax reporting with ${totalVehicles} vehicles. `;
      }
    } else {
      reasoning += `Intrastate operation in ${scenario.principalAddress.state}. `;
      usdotRequired = true;
      stateRegistrationRequired = true;
      reasoning += 'State-specific thresholds apply. ';
    }
    
    if (hasHazmat) {
      hazmatRequired = true;
      reasoning += 'Hazmat endorsement required for transporting hazardous materials. ';
    }
    
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
   * Submit feedback and store in knowledge base
   */
  async submitFeedback(scenarioId, isCorrect, feedback, determination, individualReviews) {
    if (!this.db || !this.currentSessionId) {
      throw new Error('No active session');
    }

    console.log(`📝 Submitting feedback for scenario ${scenarioId}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

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
      await this.storeCorrection(scenarioId, feedback, determination, individualReviews);
    }

    // Update session stats
    this.updateSessionStats();

    console.log('✅ Feedback submitted and knowledge base updated');

    return this.getOrCreateSession();
  }

  /**
   * Store correction and teach Alex AI
   */
  async storeCorrection(scenarioId, feedback, determination, individualReviews) {
    if (!this.db) return;

    // Get scenario details
    const scenario = this.db.prepare(`
      SELECT * FROM alex_training_scenarios WHERE id = ?
    `).get(scenarioId);

    if (!scenario) {
      console.warn('⚠️ Scenario not found:', scenarioId);
      return;
    }

    const scenarioData = JSON.parse(scenario.scenario_data);

    // Build detailed correction notes
    let correctionNotes = `User Feedback: ${feedback}\n\n`;
    
    if (individualReviews) {
      correctionNotes += 'Individual Reviews:\n';
      
      if (individualReviews.usdot === false) {
        correctionNotes += `- USDOT determination was INCORRECT (Alex said: ${determination.usdotRequired}, Expected: ${scenario.expected_usdot_required})\n`;
      }
      if (individualReviews.mcAuthority === false) {
        correctionNotes += `- MC Authority determination was INCORRECT (Alex said: ${determination.mcAuthorityRequired}, Expected: ${scenario.expected_mc_authority_required})\n`;
      }
      if (individualReviews.hazmat === false) {
        correctionNotes += `- Hazmat determination was INCORRECT (Alex said: ${determination.hazmatRequired}, Expected: ${scenario.expected_hazmat_required})\n`;
      }
      if (individualReviews.ifta === false) {
        correctionNotes += `- IFTA determination was INCORRECT (Alex said: ${determination.iftaRequired}, Expected: ${scenario.expected_ifta_required})\n`;
      }
      if (individualReviews.stateRegistration === false) {
        correctionNotes += `- State Registration determination was INCORRECT (Alex said: ${determination.stateRegistrationRequired}, Expected: ${scenario.expected_state_registration_required})\n`;
      }
    }

    // Store in shared knowledge base
    const knowledgeId = `knowledge_${Date.now()}`;
    
    try {
      this.db.prepare(`
        INSERT INTO shared_regulatory_knowledge (
          id, state, operation_type, operation_radius,
          usdot_required, mc_authority_required, hazmat_required,
          ifta_required, state_registration_required, reasoning,
          learned_from_scenario_id, learned_from_agent, correction_notes,
          created_at, updated_at, confidence_score, times_validated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        correctionNotes,
        new Date().toISOString(),
        new Date().toISOString(),
        1.0,
        1
      );

      console.log('✅ Correction stored in shared knowledge base:', knowledgeId);

      // Teach the REAL Alex AI
      try {
        const module = await import('../ai/AlexDeterminationService.js');
        const alexDeterminationService = module.alexDeterminationService;

        await alexDeterminationService.learnFromCorrection(
          scenarioId,
          correctionNotes,
          {
            usdotRequired: scenario.expected_usdot_required === 1,
            mcAuthorityRequired: scenario.expected_mc_authority_required === 1,
            hazmatRequired: scenario.expected_hazmat_required === 1,
            iftaRequired: scenario.expected_ifta_required === 1,
            stateRegistrationRequired: scenario.expected_state_registration_required === 1
          },
          scenarioData
        );

        console.log('✅ Alex AI learned from this correction');
      } catch (error) {
        console.warn('⚠️ Could not teach Alex AI directly:', error.message);
      }

    } catch (error) {
      console.error('❌ Error storing correction:', error);
    }
  }

  /**
   * Update session statistics
   */
  updateSessionStats() {
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
    `).get(this.currentSessionId);

    const accuracyPercentage = stats.total > 0 && (stats.correct + stats.incorrect) > 0
      ? (stats.correct / (stats.correct + stats.incorrect)) * 100 
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

    console.log(`📊 Session stats updated: ${stats.correct}/${stats.total} correct (${accuracyPercentage?.toFixed(1)}% accuracy)`);
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

