-- Initialize database schema for CLC Finance - MySQL Version

-- Users table (created first since others reference it)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('Admin', 'Staff') NOT NULL,
  password TEXT,
  permissions TEXT NOT NULL
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255),
  join_date DATETIME NOT NULL,
  avatar_url TEXT,
  address TEXT,
  network VARCHAR(255) NOT NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT NOT NULL,
  resource ENUM('Main Hall', 'Community Room', 'Chapel') NOT NULL
);

-- Giving types table (needs to be created before donations)
CREATE TABLE IF NOT EXISTS giving_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR(255) PRIMARY KEY,
  donor_name VARCHAR(255) NOT NULL,
  member_id VARCHAR(255),
  FOREIGN KEY (member_id) REFERENCES members(id),
  amount DECIMAL(10,2) NOT NULL,
  date DATETIME NOT NULL,
  category VARCHAR(255) NOT NULL,
  giving_type_id VARCHAR(255),
  FOREIGN KEY (giving_type_id) REFERENCES giving_types(id),
  service_time VARCHAR(255),
  recorded_by_id VARCHAR(255),
  FOREIGN KEY (recorded_by_id) REFERENCES users(id),
  reference VARCHAR(255)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATETIME NOT NULL,
  category VARCHAR(255) NOT NULL,
  recorded_by_id VARCHAR(255),
  FOREIGN KEY (recorded_by_id) REFERENCES users(id)
);

-- Donation categories table
CREATE TABLE IF NOT EXISTS donation_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Expense categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service times table
CREATE TABLE IF NOT EXISTS service_times (
  id VARCHAR(255) PRIMARY KEY,
  time VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Networks table
CREATE TABLE IF NOT EXISTS networks (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
  app_name VARCHAR(255) NOT NULL DEFAULT 'CLC Finances',
  logo_url VARCHAR(500) NOT NULL DEFAULT '/CLC logo2.png',
  theme ENUM('light', 'dark') NOT NULL DEFAULT 'dark',
  backup_time VARCHAR(10) NOT NULL DEFAULT '02:00',
  backup_enabled BOOLEAN NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data (only if they don't exist)
INSERT INTO users (id, name, username, role, password, permissions) VALUES
('admin-1', 'Administrator', 'admin', 'Admin', 'admin123', '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true}')
ON DUPLICATE KEY UPDATE permissions = '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true}';

INSERT INTO donation_categories (id, name) VALUES
('tithe', 'Tithe'),
('offering', 'Offering'),
('special', 'Special Offering')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO expense_categories (id, name) VALUES
('utilities', 'Utilities'),
('maintenance', 'Maintenance'),
('supplies', 'Office Supplies'),
('events', 'Events')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO service_times (id, time) VALUES
('morning', 'Morning Service'),
('afternoon', 'Afternoon Service'),
('evening', 'Evening Service')
ON DUPLICATE KEY UPDATE time = VALUES(time);

INSERT INTO giving_types (id, name) VALUES
('cash', 'Cash'),
('check', 'Check'),
('online', 'Online'),
('transfer', 'Bank Transfer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO networks (id, name) VALUES
('main', 'Main Campus'),
('north', 'North District'),
('south', 'South District')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES
('global', 'CLC Finances', '/CLC logo2.png', 'dark', '02:00', 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  app_name = VALUES(app_name),
  logo_url = VALUES(logo_url),
  theme = VALUES(theme),
  backup_time = VALUES(backup_time),
  backup_enabled = VALUES(backup_enabled),
  updated_at = CURRENT_TIMESTAMP;
