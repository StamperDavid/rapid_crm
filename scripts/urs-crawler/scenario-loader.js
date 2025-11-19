/**
 * Load URS Application Scenarios from Database
 * 
 * Uses the 918 pre-existing scenarios from alex_training_scenarios table
 */

const Database = require('better-sqlite3');
const path = require('path');

class ScenarioLoader {
  constructor() {
    const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');
    this.db = new Database(dbPath, { readonly: true });
  }

  /**
   * Load all scenarios from database
   */
  getAllScenarios() {
    const scenarios = this.db.prepare(`
      SELECT 
        id,
        scenario_data,
        state,
        operation_type,
        operation_radius,
        business_type,
        has_hazmat,
        fleet_size,
        expected_usdot_required,
        expected_mc_authority_required,
        expected_hazmat_required,
        expected_ifta_required,
        expected_state_registration_required,
        expected_reasoning
      FROM alex_training_scenarios
      WHERE is_active = 1
      ORDER BY id
    `).all();

    console.log(`📦 Loaded ${scenarios.length} scenarios from database`);
    
    return scenarios.map(s => ({
      id: s.id,
      data: JSON.parse(s.scenario_data),
      state: s.state,
      operationType: s.operation_type,
      operationRadius: s.operation_radius,
      businessType: s.business_type,
      hasHazmat: s.has_hazmat === 1,
      fleetSize: s.fleet_size,
      expectedAnswers: {
        usdotRequired: s.expected_usdot_required === 1,
        mcAuthorityRequired: s.expected_mc_authority_required === 1,
        hazmatRequired: s.expected_hazmat_required === 1,
        iftaRequired: s.expected_ifta_required === 1,
        stateRegistrationRequired: s.expected_state_registration_required === 1
      },
      reasoning: s.expected_reasoning
    }));
  }

  /**
   * Get scenarios by criteria
   */
  getScenariosByCriteria(criteria = {}) {
    let query = `
      SELECT * FROM alex_training_scenarios
      WHERE is_active = 1
    `;
    const params = [];

    if (criteria.operationType) {
      query += ` AND operation_type = ?`;
      params.push(criteria.operationType);
    }

    if (criteria.operationRadius) {
      query += ` AND operation_radius = ?`;
      params.push(criteria.operationRadius);
    }

    if (criteria.hasHazmat !== undefined) {
      query += ` AND has_hazmat = ?`;
      params.push(criteria.hasHazmat ? 1 : 0);
    }

    if (criteria.state) {
      query += ` AND state = ?`;
      params.push(criteria.state);
    }

    query += ` ORDER BY id LIMIT ?`;
    params.push(criteria.limit || 100);

    const scenarios = this.db.prepare(query).all(...params);
    
    return scenarios.map(s => ({
      id: s.id,
      data: JSON.parse(s.scenario_data),
      operationType: s.operation_type,
      operationRadius: s.operation_radius,
      businessType: s.business_type,
      hasHazmat: s.has_hazmat === 1
    }));
  }

  /**
   * Get a diverse sample of scenarios for crawler testing
   * Returns scenarios that cover different paths
   */
  getDiverseSample(count = 20) {
    // Get a mix of different scenario types
    const scenarios = this.db.prepare(`
      WITH diverse_scenarios AS (
        SELECT *, 
          ROW_NUMBER() OVER (PARTITION BY operation_type, operation_radius, has_hazmat ORDER BY RANDOM()) as rn
        FROM alex_training_scenarios
        WHERE is_active = 1
      )
      SELECT * FROM diverse_scenarios
      WHERE rn <= ?
      ORDER BY RANDOM()
      LIMIT ?
    `).all(Math.ceil(count / 8), count); // Up to count/8 per combination, total of count

    console.log(`📊 Selected ${scenarios.length} diverse scenarios for testing`);
    
    return scenarios.map(s => ({
      id: s.id,
      data: JSON.parse(s.scenario_data),
      operationType: s.operation_type,
      operationRadius: s.operation_radius,
      businessType: s.business_type,
      hasHazmat: s.has_hazmat === 1,
      fleetSize: s.fleet_size
    }));
  }

  /**
   * Get count of scenarios by type
   */
  getScenarioStats() {
    const stats = this.db.prepare(`
      SELECT 
        operation_type,
        operation_radius,
        has_hazmat,
        COUNT(*) as count
      FROM alex_training_scenarios
      WHERE is_active = 1
      GROUP BY operation_type, operation_radius, has_hazmat
      ORDER BY operation_type, operation_radius, has_hazmat
    `).all();

    console.log('\n📊 Scenario Statistics:');
    console.log('─'.repeat(80));
    console.log('Operation Type     | Radius      | Hazmat | Count');
    console.log('─'.repeat(80));
    
    let total = 0;
    stats.forEach(stat => {
      console.log(
        `${stat.operation_type.padEnd(18)} | ${stat.operation_radius.padEnd(11)} | ${stat.has_hazmat ? 'YES' : 'NO '}    | ${stat.count}`
      );
      total += stat.count;
    });
    
    console.log('─'.repeat(80));
    console.log(`Total Scenarios: ${total}`);
    console.log('');

    return stats;
  }

  close() {
    this.db.close();
  }
}

module.exports = { ScenarioLoader };

// Allow running as standalone script
if (require.main === module) {
  const loader = new ScenarioLoader();
  loader.getScenarioStats();
  
  console.log('\n🎯 Sample of 10 diverse scenarios:');
  const sample = loader.getDiverseSample(10);
  sample.forEach((s, i) => {
    console.log(`\n${i + 1}. ${s.id}`);
    console.log(`   Type: ${s.operationType} / ${s.operationRadius}`);
    console.log(`   Hazmat: ${s.hasHazmat ? 'YES' : 'NO'}`);
    console.log(`   Business: ${s.businessType}`);
  });
  
  loader.close();
}

