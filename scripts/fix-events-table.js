const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('Checking events table schema...\n');

// Get table info
const tableInfo = db.prepare('PRAGMA table_info(events)').all();
console.log('Columns:', tableInfo);

// Get table SQL
const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='events'").get();
console.log('\nTable SQL:', tableSql);

// Drop and recreate events table without CHECK constraint
console.log('\nDropping and recreating events table...');

db.exec(`
  DROP TABLE IF EXISTS events;
  
  CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    resource TEXT NOT NULL
  );
`);

console.log('✓ Events table recreated successfully');

db.close();
