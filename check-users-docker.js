const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT id, username, password, permissions FROM users').all();
  console.log('Users in database:');
  users.forEach(user => {
    console.log(`ID: ${user.id}, Username: ${user.username}, Password: ${user.password}, Permissions: ${user.permissions}`);
  });
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
