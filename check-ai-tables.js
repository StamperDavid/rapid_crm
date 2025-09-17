const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./instance/rapid_crm.db');

console.log('🔍 Checking for AI collaboration tables...');

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'ai_%'", (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📋 AI Tables found:', rows.map(r => r.name));
    
    if (rows.length === 0) {
      console.log('❌ No AI collaboration tables found!');
      console.log('🔧 This explains why the AI-to-AI system is not working.');
    } else {
      console.log('✅ AI collaboration tables exist');
    }
  }
  
  db.close();
});





