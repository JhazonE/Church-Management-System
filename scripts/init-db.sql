-- Initialize database schema for CLC Finance

-- Users table (created first since others reference it)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
  password TEXT, -- Only used during development
  permissions TEXT NOT NULL -- JSON string
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  join_date TIMESTAMP NOT NULL,
  avatar_url TEXT,
  address TEXT,
  network TEXT NOT NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT NOT NULL,
  resource TEXT NOT NULL CHECK (resource IN ('Main Hall', 'Community Room', 'Chapel'))
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_name TEXT NOT NULL,
  member_id TEXT REFERENCES members(id),
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP NOT NULL,
  category TEXT NOT NULL,
  giving_type_id TEXT REFERENCES giving_types(id),
  service_time TEXT,
  recorded_by_id TEXT REFERENCES users(id),
  reference TEXT
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP NOT NULL,
  category TEXT NOT NULL,
  recorded_by_id TEXT REFERENCES users(id)
);

-- Donation categories table
CREATE TABLE IF NOT EXISTS donation_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service times table
CREATE TABLE IF NOT EXISTS service_times (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Giving types table
CREATE TABLE IF NOT EXISTS giving_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Networks table
CREATE TABLE IF NOT EXISTS networks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default data
INSERT INTO users (id, name, username, role, password, permissions) VALUES
('admin-1', 'Administrator', 'admin', 'Admin', 'admin123', '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true}')
ON CONFLICT (id) DO UPDATE SET
    permissions = '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true}';

INSERT INTO donation_categories (id, name) VALUES
('tithe', 'Tithe'),
('offering', 'Offering'),
('special', 'Special Offering')
ON CONFLICT (id) DO NOTHING;

INSERT INTO expense_categories (id, name) VALUES
('utilities', 'Utilities'),
('maintenance', 'Maintenance'),
('supplies', 'Office Supplies'),
('events', 'Events')
ON CONFLICT (id) DO NOTHING;

INSERT INTO service_times (id, time) VALUES
('morning', 'Morning Service'),
('afternoon', 'Afternoon Service'),
('evening', 'Evening Service')
ON CONFLICT (id) DO NOTHING;

INSERT INTO giving_types (id, name) VALUES
('cash', 'Cash'),
('check', 'Check'),
('online', 'Online'),
('transfer', 'Bank Transfer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO networks (id, name) VALUES
('main', 'Main Campus'),
('north', 'North District'),
('south', 'South District')
ON CONFLICT (id) DO NOTHING;
