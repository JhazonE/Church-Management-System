import path from 'path';
import mysql from 'mysql2/promise';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Use MySQL when DATABASE_URL is set, otherwise fallback to SQLite for Electron builds
const useMySQL = process.env.DATABASE_URL || process.env.FORCE_MYSQL === 'true';
const useSQLite = process.env.FORCE_SQLITE === 'true' || (!useMySQL && !process.env.NODE_ENV?.includes('production'));
const isElectron = !useMySQL && (process.env.ELECTRON === 'true' || process.env.NODE_ENV !== 'production');

let sqliteDb: any;
let mysqlPool: any;

if (isElectron) {
  // Use SQLite for Electron
  const Database = require('better-sqlite3');
  const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
  sqliteDb = new Database(dbPath);

  // Enable WAL mode for better performance
  sqliteDb.pragma('journal_mode = WAL');

  // Create tables for SQLite
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
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      resource TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
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

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'global',
      app_name TEXT NOT NULL DEFAULT 'CLC Finances',
      logo_url TEXT NOT NULL DEFAULT '/CLC logo2.png',
      theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
      backup_time TEXT NOT NULL DEFAULT '02:00',
      backup_enabled BOOLEAN NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  sqliteDb.exec(createTablesSQL);

  // Insert default settings if not exists
  const insertDefaultSettingsSQL = `
    INSERT OR IGNORE INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES
    ('global', 'CLC Finances', '/CLC logo2.png', 'dark', '02:00', 1, CURRENT_TIMESTAMP);
  `;

  sqliteDb.exec(insertDefaultSettingsSQL);

  // Insert default data for SQLite
  const insertDefaultDataSQL = `
    INSERT OR IGNORE INTO users (id, name, username, role, password, permissions) VALUES
    ('admin-1', 'Administrator', 'admin', 'Admin', 'admin123', '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true, "settings": true}');

    INSERT OR IGNORE INTO donation_categories (id, name) VALUES
    ('tithe', 'Tithe'),
    ('offering', 'Offering'),
    ('special', 'Special Offering');

    INSERT OR IGNORE INTO expense_categories (id, name) VALUES
    ('utilities', 'Utilities'),
    ('maintenance', 'Maintenance'),
    ('supplies', 'Office Supplies'),
    ('events', 'Events');



    INSERT OR IGNORE INTO giving_types (id, name) VALUES
    ('cash', 'Cash'),
    ('check', 'Check'),
    ('online', 'Online'),
    ('transfer', 'Bank Transfer');

    INSERT OR IGNORE INTO networks (id, name) VALUES
    ('main', 'Main Campus'),
    ('north', 'North District'),
    ('south', 'South District');

    INSERT OR IGNORE INTO resources (id, name) VALUES
    ('res1', 'Main Hall'),
    ('res2', 'Community Room'),
    ('res3', 'Chapel');
  `;

  // Commented out to prevent default data from reappearing on every app restart
  // sqliteDb.exec(insertDefaultDataSQL);
} else {
  // Use MySQL for web deployment
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_user:clc_password@localhost:3306/clc_finance';

  const url = new URL(connectionString);
  mysqlPool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 20,
    insecureAuth: true,
    connectTimeout: 60000,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(url.password),
      auth_gssapi_client: () => {
        // For gssapi, we need to provide the password mechanism
        // Since gssapi is about Kerberos, but the server might be misconfigured
        // Let's try to fall back to clear password
        return () => Buffer.from(url.password);
      }
    }
  });

  // Create tables for MySQL
  const createTables = async () => {
    try {
      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          role ENUM('Admin', 'Staff') NOT NULL,
          password TEXT,
          permissions TEXT NOT NULL
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS members (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(255),
          join_date DATETIME NOT NULL,
          avatar_url TEXT,
          address TEXT,
          network VARCHAR(255) NOT NULL
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS events (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date DATETIME NOT NULL,
          description TEXT NOT NULL,
          resource VARCHAR(255) NOT NULL
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS resources (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE
        )
      `);

      await mysqlPool.execute(`
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
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS expenses (
          id VARCHAR(255) PRIMARY KEY,
          description TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          date DATETIME NOT NULL,
          category VARCHAR(255) NOT NULL,
          recorded_by_id VARCHAR(255),
          FOREIGN KEY (recorded_by_id) REFERENCES users(id)
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS donation_categories (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS expense_categories (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS service_times (
          id VARCHAR(255) PRIMARY KEY,
          time VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS giving_types (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS networks (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await mysqlPool.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
          app_name VARCHAR(255) NOT NULL DEFAULT 'CLC Finances',
          logo_url VARCHAR(500) NOT NULL DEFAULT '/CLC logo2.png',
          theme ENUM('light', 'dark') NOT NULL DEFAULT 'dark',
          backup_time VARCHAR(10) NOT NULL DEFAULT '02:00',
          backup_enabled BOOLEAN NOT NULL DEFAULT 1,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  };

  const seedMySQLData = async () => {
    try {
      const [users]: any = await mysqlPool.execute('SELECT COUNT(*) as count FROM users');
      if (users[0].count === 0) {
        console.log('Seeding initial data for MySQL...');

        // Seed Users
        await mysqlPool.execute(`
          INSERT INTO users (id, name, username, role, password, permissions) VALUES
          ('admin-1', 'Administrator', 'admin', 'Admin', 'admin123', '{"dashboard": true, "members": true, "donations": true, "expenses": true, "events": true, "reports": true, "users": true, "settings": true}')
        `);

        // Seed Donation Categories
        await mysqlPool.execute(`
          INSERT INTO donation_categories (id, name) VALUES
          ('tithe', 'Tithe'),
          ('offering', 'Offering'),
          ('special', 'Special Offering')
        `);

        // Seed Expense Categories
        await mysqlPool.execute(`
          INSERT INTO expense_categories (id, name) VALUES
          ('utilities', 'Utilities'),
          ('maintenance', 'Maintenance'),
          ('supplies', 'Office Supplies'),
          ('events', 'Events')
        `);

        // Seed Giving Types
        await mysqlPool.execute(`
          INSERT INTO giving_types (id, name) VALUES
          ('cash', 'Cash'),
          ('check', 'Check'),
          ('online', 'Online'),
          ('transfer', 'Bank Transfer')
        `);

        // Seed Networks
        await mysqlPool.execute(`
          INSERT INTO networks (id, name) VALUES
          ('main', 'Main Campus'),
          ('north', 'North District'),
          ('south', 'South District')
        `);

        // Seed Resources
        await mysqlPool.execute(`
          INSERT INTO resources (id, name) VALUES
          ('res1', 'Main Hall'),
          ('res2', 'Community Room'),
          ('res3', 'Chapel')
        `);

        console.log('MySQL seeding completed.');
      }
    } catch (error) {
      console.error('Error seeding MySQL data:', error);
    }
  };

  createTables().then(() => seedMySQLData()).catch(console.error);
}

// Export the appropriate database connection
export default isElectron ? sqliteDb : mysqlPool;

// Helper functions for querying (unified for both SQLite and MySQL)
export const getAllMembers = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM members');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM members');
    return rows;
  }
};

export const getAllEvents = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM events');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM events');
    return rows;
  }
};

export const getAllDonations = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM donations');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM donations');
    return rows;
  }
};

export const getAllExpenses = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM expenses');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM expenses');
    return rows;
  }
};

export const getAllUsers = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM users');
    const users = stmt.all();
    return users.map((user: any) => ({
      ...user,
      permissions: JSON.parse(user.permissions)
    }));
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM users');
    return (rows as any[]).map((user: any) => ({
      ...user,
      permissions: JSON.parse(user.permissions)
    }));
  }
};

export const getUserById = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    if (user) {
      (user as any).permissions = JSON.parse((user as any).permissions);
    }
    return user;
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const user = (rows as any[])[0];
    if (user) {
      (user as any).permissions = JSON.parse((user as any).permissions);
    }
    return user;
  }
};

export const getUserByUsername = async (username: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    if (user) {
      (user as any).permissions = JSON.parse((user as any).permissions);
    }
    return user;
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = (rows as any[])[0];
    if (user) {
      (user as any).permissions = JSON.parse((user as any).permissions);
    }
    return user;
  }
};

export const createUser = async (user: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO users (id, name, username, role, password, permissions) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(user.id, user.name, user.username, user.role, user.password, JSON.stringify(user.permissions));
  } else {
    await mysqlPool.execute(
      'INSERT INTO users (id, name, username, role, password, permissions) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.name, user.username, user.role, user.password, JSON.stringify(user.permissions)]
    );
  }
};

export const updateUser = async (id: string, user: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'UPDATE users SET name = ?, username = ?, role = ?, password = IFNULL(?, password), permissions = ? WHERE id = ?'
    );
    stmt.run(user.name, user.username, user.role, user.password || null, JSON.stringify(user.permissions), id);
  } else {
    await mysqlPool.execute(
      'UPDATE users SET name = ?, username = ?, role = ?, password = IFNULL(?, password), permissions = ? WHERE id = ?',
      [user.name, user.username, user.role, user.password || null, JSON.stringify(user.permissions), id]
    );
  }
};

export const deleteUser = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM users WHERE id = ?', [id]);
  }
};

// Donation categories functions
export const getAllDonationCategories = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM donation_categories ORDER BY name');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM donation_categories ORDER BY name');
    return rows;
  }
};

export const createDonationCategory = async (category: { id: string; name: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO donation_categories (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(category.id, category.name);
  } else {
    await mysqlPool.execute(
      'INSERT INTO donation_categories (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [category.id, category.name]
    );
  }
};

export const updateDonationCategory = async (id: string, name: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('UPDATE donation_categories SET name = ? WHERE id = ?');
    stmt.run(name, id);
  } else {
    await mysqlPool.execute('UPDATE donation_categories SET name = ? WHERE id = ?', [name, id]);
  }
};

export const deleteDonationCategory = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM donation_categories WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM donation_categories WHERE id = ?', [id]);
  }
};

// Expense categories functions
export const getAllExpenseCategories = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM expense_categories ORDER BY name');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM expense_categories ORDER BY name');
    return rows;
  }
};

export const createExpenseCategory = async (category: { id: string; name: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO expense_categories (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(category.id, category.name);
  } else {
    await mysqlPool.execute(
      'INSERT INTO expense_categories (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [category.id, category.name]
    );
  }
};

export const updateExpenseCategory = async (id: string, name: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('UPDATE expense_categories SET name = ? WHERE id = ?');
    stmt.run(name, id);
  } else {
    await mysqlPool.execute('UPDATE expense_categories SET name = ? WHERE id = ?', [name, id]);
  }
};

export const deleteExpenseCategory = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM expense_categories WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM expense_categories WHERE id = ?', [id]);
  }
};

// Service times functions
export const getAllServiceTimes = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM service_times ORDER BY time');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM service_times ORDER BY time');
    return rows;
  }
};

export const createServiceTime = async (serviceTime: { id: string; time: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO service_times (id, time, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(serviceTime.id, serviceTime.time);
  } else {
    await mysqlPool.execute(
      'INSERT INTO service_times (id, time, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [serviceTime.id, serviceTime.time]
    );
  }
};

export const updateServiceTime = async (id: string, time: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('UPDATE service_times SET time = ? WHERE id = ?');
    stmt.run(time, id);
  } else {
    await mysqlPool.execute('UPDATE service_times SET time = ? WHERE id = ?', [time, id]);
  }
};

export const deleteServiceTime = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM service_times WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM service_times WHERE id = ?', [id]);
  }
};

// Giving types functions
export const getAllGivingTypes = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM giving_types ORDER BY name');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM giving_types ORDER BY name');
    return rows;
  }
};

export const createGivingType = async (givingType: { id: string; name: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO giving_types (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(givingType.id, givingType.name);
  } else {
    await mysqlPool.execute(
      'INSERT INTO giving_types (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [givingType.id, givingType.name]
    );
  }
};

export const updateGivingType = async (id: string, name: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('UPDATE giving_types SET name = ? WHERE id = ?');
    stmt.run(name, id);
  } else {
    await mysqlPool.execute('UPDATE giving_types SET name = ? WHERE id = ?', [name, id]);
  }
};

export const deleteGivingType = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM giving_types WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM giving_types WHERE id = ?', [id]);
  }
};

// Networks functions
export const getAllNetworks = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM networks ORDER BY name');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM networks ORDER BY name');
    return rows;
  }
};

export const createNetwork = async (network: { id: string; name: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO networks (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run(network.id, network.name);
  } else {
    await mysqlPool.execute(
      'INSERT INTO networks (id, name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [network.id, network.name]
    );
  }
};

export const updateNetwork = async (id: string, name: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('UPDATE networks SET name = ? WHERE id = ?');
    stmt.run(name, id);
  } else {
    await mysqlPool.execute('UPDATE networks SET name = ? WHERE id = ?', [name, id]);
  }
};

export const deleteNetwork = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM networks WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM networks WHERE id = ?', [id]);
  }
};


// Members functions
export const createMember = async (member: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO members (id, name, email, phone, join_date, avatar_url, address, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(member.id, member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network);
  } else {
    await mysqlPool.execute(
      'INSERT INTO members (id, name, email, phone, join_date, avatar_url, address, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [member.id, member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network]
    );
  }
};

export const updateMember = async (id: string, member: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'UPDATE members SET name = ?, email = ?, phone = ?, join_date = ?, avatar_url = ?, address = ?, network = ? WHERE id = ?'
    );
    stmt.run(member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network, id);
  } else {
    await mysqlPool.execute(
      'UPDATE members SET name = ?, email = ?, phone = ?, join_date = ?, avatar_url = ?, address = ?, network = ? WHERE id = ?',
      [member.name, member.email, member.phone, member.join_date, member.avatar_url, member.address, member.network, id]
    );
  }
};

export const deleteMember = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM members WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM members WHERE id = ?', [id]);
  }
};

// Events functions
export const createEvent = async (event: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO events (id, title, date, description, resource) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(event.id, event.title, event.date, event.description, event.resource);
  } else {
    await mysqlPool.execute(
      'INSERT INTO events (id, title, date, description, resource) VALUES (?, ?, ?, ?, ?)',
      [event.id, event.title, event.date, event.description, event.resource]
    );
  }
};

export const updateEvent = async (id: string, event: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'UPDATE events SET title = ?, date = ?, description = ?, resource = ? WHERE id = ?'
    );
    stmt.run(event.title, event.date, event.description, event.resource, id);
  } else {
    await mysqlPool.execute(
      'UPDATE events SET title = ?, date = ?, description = ?, resource = ? WHERE id = ?',
      [event.title, event.date, event.description, event.resource, id]
    );
  }
};

export const deleteEvent = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM events WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM events WHERE id = ?', [id]);
  }
};

// Donations functions
export const createDonation = async (donation: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO donations (id, donor_name, member_id, amount, date, category, giving_type_id, service_time, recorded_by_id, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(donation.id, donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference);
  } else {
    await mysqlPool.execute(
      'INSERT INTO donations (id, donor_name, member_id, amount, date, category, giving_type_id, service_time, recorded_by_id, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [donation.id, donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference]
    );
  }
};

export const updateDonation = async (id: string, donation: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'UPDATE donations SET donor_name = ?, member_id = ?, amount = ?, date = ?, category = ?, giving_type_id = ?, service_time = ?, recorded_by_id = ?, reference = ? WHERE id = ?'
    );
    stmt.run(donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference, id);
  } else {
    await mysqlPool.execute(
      'UPDATE donations SET donor_name = ?, member_id = ?, amount = ?, date = ?, category = ?, giving_type_id = ?, service_time = ?, recorded_by_id = ?, reference = ? WHERE id = ?',
      [donation.donor_name, donation.member_id, donation.amount, donation.date, donation.category, donation.giving_type_id, donation.service_time, donation.recorded_by_id, donation.reference, id]
    );
  }
};

export const deleteDonation = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM donations WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM donations WHERE id = ?', [id]);
  }
};

// Expenses functions
export const createExpense = async (expense: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO expenses (id, description, amount, date, category, recorded_by_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(expense.id, expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id);
  } else {
    await mysqlPool.execute(
      'INSERT INTO expenses (id, description, amount, date, category, recorded_by_id) VALUES (?, ?, ?, ?, ?, ?)',
      [expense.id, expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id]
    );
  }
};

export const updateExpense = async (id: string, expense: any) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'UPDATE expenses SET description = ?, amount = ?, date = ?, category = ?, recorded_by_id = ? WHERE id = ?'
    );
    stmt.run(expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id, id);
  } else {
    await mysqlPool.execute(
      'UPDATE expenses SET description = ?, amount = ?, date = ?, category = ?, recorded_by_id = ? WHERE id = ?',
      [expense.description, expense.amount, expense.date, expense.category, expense.recorded_by_id, id]
    );
  }
};

export const deleteExpense = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM expenses WHERE id = ?', [id]);
  }
};

// Helper functions for reports and queries
export const getDonationsWithFilters = async (startDate?: string, endDate?: string) => {
  let query = 'SELECT * FROM donations WHERE 1=1';
  const params: any[] = [];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY date DESC';

  if (isElectron) {
    const stmt = sqliteDb.prepare(query);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
  } else {
    const [rows] = await mysqlPool.execute(query, params);
    return rows;
  }
};

export const getExpensesWithFilters = async (startDate?: string, endDate?: string) => {
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY date DESC';

  if (isElectron) {
    const stmt = sqliteDb.prepare(query);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
  } else {
    const [rows] = await mysqlPool.execute(query, params);
    return rows;
  }
};

export const getDistinctServiceTimes = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT DISTINCT service_time FROM donations WHERE service_time IS NOT NULL');
    return stmt.all().map((row: any) => row.service_time);
  } else {
    const [rows] = await mysqlPool.execute('SELECT DISTINCT service_time FROM donations WHERE service_time IS NOT NULL');
    return (rows as any[]).map((row: any) => row.service_time);
  }
};

// Settings functions
export const getSettings = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM settings WHERE id = ?');
    const setting = stmt.get('global');
    if (setting) {
      return {
        appName: setting.app_name,
        logoUrl: setting.logo_url,
        theme: setting.theme,
        backupTime: setting.backup_time,
        backupEnabled: setting.backup_enabled === 1
      };
    }
    // Return default settings if no settings found
    return {
      appName: 'CLC Finances',
      logoUrl: '/CLC logo2.png',
      theme: 'dark',
      backupTime: '02:00',
      backupEnabled: true
    };
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM settings WHERE id = ?', ['global']);
    const setting = rows[0];
    if (setting) {
      return {
        appName: setting.app_name,
        logoUrl: setting.logo_url,
        theme: setting.theme,
        backupTime: setting.backup_time,
        backupEnabled: setting.backup_enabled === 1
      };
    }
    // Return default settings if no settings found
    return {
      appName: 'CLC Finances',
      logoUrl: '/CLC logo2.png',
      theme: 'dark',
      backupTime: '02:00',
      backupEnabled: true
    };
  }
};

export const updateSettings = async (settings: {
  appName: string;
  logoUrl: string;
  theme: 'light' | 'dark';
  backupTime?: string;
  backupEnabled?: boolean;
}) => {
  const backupTime = settings.backupTime || '02:00';
  const backupEnabled = settings.backupEnabled !== undefined ? (settings.backupEnabled ? 1 : 0) : 1;

  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT OR REPLACE INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    );
    stmt.run('global', settings.appName, settings.logoUrl, settings.theme, backupTime, backupEnabled);
  } else {
    await mysqlPool.execute(
      'INSERT INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE app_name = VALUES(app_name), logo_url = VALUES(logo_url), theme = VALUES(theme), backup_time = VALUES(backup_time), backup_enabled = VALUES(backup_enabled), updated_at = CURRENT_TIMESTAMP',
      ['global', settings.appName, settings.logoUrl, settings.theme, backupTime, backupEnabled]
    );
  }
};

// Helper function for system reset
export const resetSystemData = async () => {
  if (isElectron) {
    // For SQLite, use transaction
    const transaction = sqliteDb.transaction(() => {
      // Clear all user-inputted data tables
      // Note: We keep the users table intact
      sqliteDb.prepare('DELETE FROM expenses').run();
      sqliteDb.prepare('DELETE FROM donations').run();
      sqliteDb.prepare('DELETE FROM events').run();
      sqliteDb.prepare('DELETE FROM members').run();
    });
    transaction();
  } else {
    // For MySQL, use connection pool
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      // Clear all user-inputted data tables
      // Note: We keep the users table intact
      await connection.execute('DELETE FROM expenses');
      await connection.execute('DELETE FROM donations');
      await connection.execute('DELETE FROM events');
      await connection.execute('DELETE FROM members');
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

// Resources functions
export const getAllResources = async () => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('SELECT * FROM resources ORDER BY name');
    return stmt.all();
  } else {
    const [rows] = await mysqlPool.execute('SELECT * FROM resources ORDER BY name');
    return rows;
  }
};

export const createResource = async (resource: { id: string; name: string }) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare(
      'INSERT INTO resources (id, name) VALUES (?, ?)'
    );
    stmt.run(resource.id, resource.name);
  } else {
    await mysqlPool.execute(
      'INSERT INTO resources (id, name) VALUES (?, ?)',
      [resource.id, resource.name]
    );
  }
};

export const deleteResource = async (id: string) => {
  if (isElectron) {
    const stmt = sqliteDb.prepare('DELETE FROM resources WHERE id = ?');
    stmt.run(id);
  } else {
    await mysqlPool.execute('DELETE FROM resources WHERE id = ?', [id]);
  }
};

// Helper function to close the database
export const closeDatabase = async () => {
  if (isElectron) {
    sqliteDb.close();
  } else {
    await mysqlPool.end();
  }
};
