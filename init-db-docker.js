const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
    password TEXT,
    permissions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    join_date TEXT NOT NULL,
    avatar_url TEXT,
    address TEXT,
    network TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    resource TEXT NOT NULL CHECK (resource IN ('Main Hall', 'Community Room', 'Chapel'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    member_id TEXT REFERENCES members(id),
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    giving_type_id TEXT REFERENCES giving_types(id),
    service_time TEXT,
    recorded_by_id TEXT REFERENCES users(id),
    reference TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    recorded_by_id TEXT REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS donation_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expense_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS service_times (
    id TEXT PRIMARY KEY,
    time TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS giving_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS networks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

db.exec(createTablesSQL);

// Insert users
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, name, username, role, password, permissions)
  VALUES (?, ?, ?, ?, ?, ?)
`);

async function insertUsers() {
  const users = [
    {
      id: 'u1',
      name: 'Admin User',
      username: 'admin',
      role: 'Admin',
      password: 'password',
      permissions: {
        dashboard: true,
        members: true,
        events: true,
        donations: true,
        expenses: true,
        reports: true,
        users: true,
      }
    },
    {
      id: 'u2',
      name: 'Staff User',
      username: 'staff',
      role: 'Staff',
      password: 'password',
      permissions: {
        dashboard: false,
        members: true,
        events: true,
        donations: true,
        expenses: true,
        reports: true,
        users: false,
      }
    }
  ];

  for (const user of users) {
    let hashedPassword = user.password;
    if (hashedPassword && !hashedPassword.startsWith('$2')) {
      hashedPassword = await bcrypt.hash(user.password, 10);
    }

    insertUser.run(user.id, user.name, user.username, user.role, hashedPassword, JSON.stringify(user.permissions));
  }
}

// Run the initialization
insertUsers().then(() => {
  console.log('Database initialized successfully!');
  db.close();
}).catch(console.error);
