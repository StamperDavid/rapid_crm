const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('instance/rapid_crm.db');
db.all('SELECT name FROM sqlite_master WHERE type=\"table\"', (err, tables) => {
  if (err) console.error(err);
  else {
    console.log('Tables in REAL database:');
    tables.forEach(t => console.log('- ' + t.name));
  }
  db.close();
});
