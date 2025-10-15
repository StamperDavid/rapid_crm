/**
 * Alex Training Service (CommonJS)
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
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
        console.log('✅ Alex Training database initialized');
      } else {
        console.warn('⚠️ Alex Training schema not found, skipping initialization');
      }
    } catch (error) {
      console.error('❌ Error initializing Alex training database:', error);
    }
  }

  /**
   * Generate all training scenarios
   */
  async generateTrainingScenarios() {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🎯 Generating training scenarios...');
    
    // For now, generate a smaller set for testing
    const scenarios = this.generateTestScenarios();
    
    // Store scenarios in database
    const insertScenario = this.db.prepare(`
      INSERT OR IGNORE INTO alex_training_scenarios (
        id, scenario_data, state, operation_type, operation_radius, business_type,
        has_hazmat, fleet_size, expected_usdot_required, expected_mc_authority_required,
        expected_hazmat_required, expected_ifta_required, expected_state_registration_required,
        expected_reasoning, created_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertMany = this.db.transaction((scenarios) => {
      for (const scenario of scenarios) {
        insertScenario.run(
          scenario.id,
          JSON.stringify(scenario),
          scenario.principalAddress.state,
          scenario.receiveCompensationForTransport === 'Yes' ? 'for_hire' : 'private_property',
          scenario.transportNonHazardousInterstate === 'Yes' ? 'interstate' : 'intrastate',
          scenario.formOfBusiness,
          scenario.cargoClassifications.includes('hazmat') ? 1 : 0,
          this.determineFleetSize(scenario),
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
   * Generate test scenarios (simplified for now)
   */
  generateTestScenarios() {
    const scenarios = [];
    const states = ['CA', 'TX', 'FL', 'NY', 'PA'];
    let id = 1;

    for (const state of states) {
      // For-hire interstate
      scenarios.push(this.createTestScenario(id++, state, true, true, false));
      scenarios.push(this.createTestScenario(id++, state, true, true, true));
      
      // For-hire intrastate
      scenarios.push(this.createTestScenario(id++, state, true, false, false));
      
      // Private interstate
      scenarios.push(this.createTestScenario(id++, state, false, true, false));
      
      // Private intrastate
      scenarios.push(this.createTestScenario(id++, state, false, false, false));
    }

    return scenarios;
  }

  createTestScenario(id, state, isForHire, isInterstate, hasHazmat) {
    const companyName = `Test Company ${id}`;
    const totalVehicles = Math.floor(Math.random() * 10) + 1;

    return {
      id: `scenario_${id.toString().padStart(6, '0')}`,
      hasDunsBradstreet: 'No',
      legalBusinessName: companyName + ' LLC',
      doingBusinessAs: companyName,
      principalAddressSameAsContact: 'Yes',
      principalAddress: {
        country: 'United States',
        street: '123 Main Street',
        city: 'Test City',
        state: state,
        postalCode: '12345'
      },
      mailingAddress: {
        country: 'United States',
        street: '123 Main Street',
        city: 'Test City',
        state: state,
        postalCode: '12345'
      },
      businessPhone: '(555) 123-4567',
      ein: '12-3456789',
      isUnitOfGovernment: 'No',
      formOfBusiness: 'limited_liability_company',
      ownershipControl: 'us_citizen',
      companyContact: {
        firstName: 'John',
        middleName: '',
        lastName: 'Doe',
        suffix: '',
        title: 'Owner',
        email: 'john@testcompany.com',
        phone: '(555) 123-4567',
        address: {
          country: 'United States',
          street: '123 Main Street',
          city: 'Test City',
          state: state,
          postalCode: '12345'
        }
      },
      operateAsIntermodalEquipmentProvider: 'No',
      transportProperty: 'Yes',
      receiveCompensationForTransport: isForHire ? 'Yes' : 'No',
      propertyType: hasHazmat ? 'hazardous_materials' : 'other_non_hazardous',
      transportNonHazardousInterstate: isInterstate ? 'Yes' : 'No',
      transportOwnProperty: isForHire ? 'No' : 'Yes',
      transportPassengers: 'No',
      provideBrokerServices: 'No',
      provideFreightForwarderServices: 'No',
      operateCargoTankFacility: 'No',
      operateAsDriveaway: 'No',
      operateAsTowaway: 'No',
      cargoClassifications: hasHazmat ? ['general_freight', 'hazmat'] : ['general_freight'],
      nonCMVProperty: 0,
      vehicles: {
        straightTrucks: { owned: totalVehicles, termLeased: 0, tripLeased: 0, towDriveway: 0, serviced: 0 },
        truckTractors: { owned: 0, termLeased: 0, tripLeased: 0, towDriveway: 0, serviced: 0 },
        trailers: { owned: 0, termLeased: 0, tripLeased: 0, towDriveway: 0, serviced: 0 },
        iepTrailerChassis: { owned: 0, termLeased: 0, tripLeased: 0, towDriveway: 0, serviced: 0 }
      },
      vehiclesInCanada: 0,
      vehiclesInMexico: 0,
      cmvInterstateOnly: isInterstate ? totalVehicles : 0,
      cmvIntrastateOnly: isInterstate ? 0 : totalVehicles,
      driversInterstate: {
        within100Miles: isInterstate ? 1 : 0,
        beyond100Miles: isInterstate ? totalVehicles : 0
      },
      driversIntrastate: {
        within100Miles: isInterstate ? 0 : 1,
        beyond100Miles: isInterstate ? 0 : totalVehicles
      },
      driversWithCDL: totalVehicles,
      driversInCanada: 0,
      driversInMexico: 0,
      hasAffiliations: 'No',
      certifyWillingAndAble: 'Yes',
      certifyProduceDocuments: 'Yes',
      certifyNotDisqualified: 'Yes',
      certifyUnderstandProcessAgent: 'Yes',
      certifyNotUnderSuspension: 'Yes',
      certifyDeficienciesCorrected: 'Yes',
      electronicSignature: 'John Doe',
      expectedRequirements: this.determineExpectedRequirements(state, isForHire, isInterstate, hasHazmat, totalVehicles),
      generatedAt: new Date().toISOString()
    };
  }

  determineExpectedRequirements(state, isForHire, isInterstate, hasHazmat, vehicleCount) {
    let reasoning = '';
    let usdotRequired = false;
    let mcAuthorityRequired = false;
    let hazmatEndorsementRequired = false;
    let iftaRequired = false;
    let stateRegistrationRequired = false;

    if (isInterstate) {
      reasoning += 'Interstate operation: Federal 49 CFR applies. ';
      usdotRequired = true;
      reasoning += 'USDOT required for interstate commerce with CMVs over 10,001 lbs. ';
      
      if (isForHire) {
        mcAuthorityRequired = true;
        reasoning += 'MC Authority required for for-hire interstate property transport. ';
      }
      
      if (vehicleCount >= 2) {
        iftaRequired = true;
        reasoning += 'IFTA required for interstate fuel tax reporting. ';
      }
    } else {
      reasoning += `Intrastate operation in ${state}: State-specific thresholds apply (qualified states list). `;
      usdotRequired = true;
      stateRegistrationRequired = true;
    }

    if (hasHazmat) {
      hazmatEndorsementRequired = true;
      reasoning += 'Hazmat endorsement required for transporting hazardous materials. ';
    }

    return {
      usdotRequired,
      mcAuthorityRequired,
      hazmatEndorsementRequired,
      iftaRequired,
      stateRegistrationRequired,
      reasoning: reasoning.trim()
    };
  }

  /**
   * Create a new training session
   */
  createTrainingSession(name, totalScenarios) {
    if (!this.db) throw new Error('Database not initialized');

    const sessionId = `session_${Date.now()}`;
    
    this.db.prepare(`
      INSERT INTO alex_training_sessions (
        id, session_name, started_at, total_scenarios, scenarios_completed,
        scenarios_correct, scenarios_incorrect, scenarios_pending_review, status
      ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 'in_progress')
    `).run(sessionId, name, new Date().toISOString(), totalScenarios);

    this.currentSessionId = sessionId;

    return this.getSession(sessionId);
  }

  /**
   * Get current or latest training session
   */
  getOrCreateSession() {
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
    `).get();

    if (latestSession) {
      this.currentSessionId = latestSession.id;
      return this.mapSession(latestSession);
    }

    // Create new session
    return this.createTrainingSession('Training Session', 0);
  }

  getSession(sessionId) {
    if (!this.db) return null;

    const session = this.db.prepare(`
      SELECT * FROM alex_training_sessions WHERE id = ?
    `).get(sessionId);

    return session ? this.mapSession(session) : null;
  }

  mapSession(row) {
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
  getNextScenario() {
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
    `).get(this.currentSessionId);

    if (!scenario) return null;

    return JSON.parse(scenario.scenario_data);
  }

  /**
   * Test Alex with a scenario and get response
   */
  async testAlexWithScenario(scenario) {
    const startTime = Date.now();
    
    // Simulate Alex's determination logic
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
    const response = {
      usdotRequired,
      mcAuthorityRequired,
      hazmatRequired,
      iftaRequired,
      stateRegistrationRequired,
      reasoning,
      confidence: 0.85,
      responseTimeMs: responseTime
    };

    // Store test result
    await this.storeTestResult(scenario.id, response);

    return response;
  }

  /**
   * Store Alex's test result
   */
  async storeTestResult(scenarioId, response) {
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
  async submitFeedback(scenarioId, isCorrect, feedback, alexResponse) {
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

    return this.getSession(this.currentSessionId);
  }

  /**
   * Store correction in shared knowledge base
   */
  async storeCorrection(scenarioId, feedback) {
    if (!this.db) return;

    const scenario = this.db.prepare(`
      SELECT * FROM alex_training_scenarios WHERE id = ?
    `).get(scenarioId);

    if (!scenario) return;

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

    console.log('✅ Correction stored in shared knowledge base');
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

  determineFleetSize(scenario) {
    const total = scenario.cmvInterstateOnly + scenario.cmvIntrastateOnly;
    if (total <= 3) return 'small';
    if (total <= 10) return 'medium';
    return 'large';
  }
}

// Export singleton instance
const alexTrainingService = new AlexTrainingService();
module.exports = { alexTrainingService };

