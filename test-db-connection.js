import db from './src/lib/database.js';

try {
  console.log('Testing database connection...');

  // Test basic query
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log('Database connection successful. Users count:', result.count);

  // Test user lookup
  const users = db.prepare('SELECT username FROM users LIMIT 5').all();
  console.log('Sample users:', users.map(u => u.username));

} catch (error) {
  console.error('Database connection failed:', error);
} finally {
  // Close database connection
  if (db && typeof db.close === 'function') {
    db.close();
  }
}
