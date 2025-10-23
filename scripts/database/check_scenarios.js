/**
 * Check current database for alex_training_scenarios
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'instance', 'rapid_crm.db');

console.log('🔍 Checking current database for training scenarios...\n');
console.log(`Database: ${dbPath}\n`);

try {
  const db = new Database(dbPath, { readonly: true });
  
  // Check if table exists
  const tableCheck = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='alex_training_scenarios'
  `).get();
  
  if (!tableCheck) {
    console.log('❌ Table "alex_training_scenarios" does not exist');
    console.log('📝 Run the server - it will create the table automatically');
    db.close();
    process.exit(0);
  }
  
  // Count scenarios
  const count = db.prepare(`
    SELECT COUNT(*) as count FROM alex_training_scenarios
  `).get();
  
  console.log(`Total scenarios: ${count.count}`);
  
  if (count.count === 0) {
    console.log('\n⚠️  No scenarios in database');
    console.log('📝 Solution: Use the "Generate Training Scenarios" button in the USDOT Training Center');
  } else {
    // Get active scenarios
    const activeCount = db.prepare(`
      SELECT COUNT(*) as count FROM alex_training_scenarios WHERE is_active = 1
    `).get();
    
    console.log(`Active scenarios: ${activeCount.count}`);
    
    // Get breakdown by state
    const byState = db.prepare(`
      SELECT state, COUNT(*) as count 
      FROM alex_training_scenarios 
      WHERE is_active = 1
      GROUP BY state 
      ORDER BY count DESC
      LIMIT 5
    `).all();
    
    console.log('\nTop 5 states by scenario count:');
    byState.forEach(s => {
      console.log(`  ${s.state}: ${s.count} scenarios`);
    });
    
    // Check sessions
    const sessionCount = db.prepare(`
      SELECT COUNT(*) as count FROM alex_training_sessions
    `).get();
    
    console.log(`\nTraining sessions: ${sessionCount.count}`);
    
    if (sessionCount.count > 0) {
      const latestSession = db.prepare(`
        SELECT id, session_name, total_scenarios, scenarios_completed, status
        FROM alex_training_sessions
        ORDER BY started_at DESC
        LIMIT 1
      `).get();
      
      console.log(`\nLatest session: ${latestSession.session_name}`);
      console.log(`  Status: ${latestSession.status}`);
      console.log(`  Progress: ${latestSession.scenarios_completed}/${latestSession.total_scenarios}`);
    }
  }
  
  db.close();
  console.log('\n✅ Check complete!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  process.exit(1);
}
