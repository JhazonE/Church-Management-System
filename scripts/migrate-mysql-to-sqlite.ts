import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MYSQL_URL = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

// Tables to migrate in order (respecting foreign key dependencies)
const TABLES = [
  'users',
  'members',
  'giving_types',
  'donation_categories',
  'expense_categories',
  'service_times',
  'networks',
  'resources',
  'events',
  'donations',
  'expenses',
  'settings'
];

interface MigrationStats {
  table: string;
  records: number;
  success: boolean;
  error?: string;
}

async function connectMySQL() {
  const url = new URL(MYSQL_URL);
  const pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 5,
  });
  
  return pool;
}

function connectSQLite() {
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, 'database.sqlite');
  
  // Backup existing database if it exists
  if (fs.existsSync(dbPath)) {
    const backupPath = path.join(dataDir, `database.backup.${Date.now()}.sqlite`);
    console.log(`📦 Backing up existing database to: ${backupPath}`);
    fs.copyFileSync(dbPath, backupPath);
  }
  
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  return db;
}

function convertMySQLValueToSQLite(value: any, columnName: string): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Convert MySQL DATETIME to ISO string
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Convert MySQL DECIMAL to number
  if (typeof value === 'string' && columnName.includes('amount')) {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
  
  // Convert MySQL BOOLEAN (tinyint) to 0/1
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  return value;
}

async function migrateTable(
  mysqlPool: mysql.Pool,
  sqliteDb: Database.Database,
  tableName: string
): Promise<MigrationStats> {
  try {
    console.log(`\n📊 Migrating table: ${tableName}`);
    
    // Fetch all data from MySQL
    const [rows] = await mysqlPool.execute(`SELECT * FROM ${tableName}`);
    const records = rows as any[];
    
    if (records.length === 0) {
      console.log(`   ℹ️  No records found in ${tableName}`);
      return { table: tableName, records: 0, success: true };
    }
    
    console.log(`   📥 Found ${records.length} records`);
    
    // Clear existing data in SQLite table
    sqliteDb.prepare(`DELETE FROM ${tableName}`).run();
    
    // Get column names from first record
    const columns = Object.keys(records[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.join(', ');
    
    // Prepare insert statement
    const insertStmt = sqliteDb.prepare(
      `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`
    );
    
    // Insert all records in a transaction
    const insertMany = sqliteDb.transaction((records: any[]) => {
      for (const record of records) {
        const values = columns.map(col => convertMySQLValueToSQLite(record[col], col));
        insertStmt.run(...values);
      }
    });
    
    insertMany(records);
    
    console.log(`   ✅ Successfully migrated ${records.length} records`);
    
    return { table: tableName, records: records.length, success: true };
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error);
    return {
      table: tableName,
      records: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function initializeSQLiteSchema(sqliteDb: Database.Database) {
  console.log('\n🔧 Initializing SQLite schema...');
  
  const schema = `
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
  
  sqliteDb.exec(schema);
  console.log('   ✅ Schema initialized');
}

async function main() {
  console.log('🚀 Starting MySQL to SQLite Migration\n');
  console.log('━'.repeat(60));
  
  let mysqlPool: mysql.Pool | null = null;
  let sqliteDb: Database.Database | null = null;
  
  try {
    // Connect to MySQL
    console.log('\n📡 Connecting to MySQL...');
    mysqlPool = await connectMySQL();
    console.log('   ✅ Connected to MySQL');
    
    // Connect to SQLite
    console.log('\n💾 Connecting to SQLite...');
    sqliteDb = connectSQLite();
    console.log('   ✅ Connected to SQLite');
    
    // Initialize SQLite schema
    await initializeSQLiteSchema(sqliteDb);
    
    // Migrate each table
    console.log('\n📦 Starting data migration...');
    console.log('━'.repeat(60));
    
    const stats: MigrationStats[] = [];
    
    for (const table of TABLES) {
      const stat = await migrateTable(mysqlPool, sqliteDb, table);
      stats.push(stat);
    }
    
    // Print summary
    console.log('\n\n📊 Migration Summary');
    console.log('━'.repeat(60));
    
    const successCount = stats.filter(s => s.success).length;
    const failureCount = stats.filter(s => !s.success).length;
    const totalRecords = stats.reduce((sum, s) => sum + s.records, 0);
    
    console.log(`\n✅ Successful: ${successCount}/${TABLES.length} tables`);
    console.log(`❌ Failed: ${failureCount}/${TABLES.length} tables`);
    console.log(`📝 Total records migrated: ${totalRecords}\n`);
    
    console.table(stats.map(s => ({
      Table: s.table,
      Records: s.records,
      Status: s.success ? '✅ Success' : '❌ Failed',
      Error: s.error || '-'
    })));
    
    if (failureCount > 0) {
      console.log('\n⚠️  Some tables failed to migrate. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration completed successfully!');
      console.log(`\n📁 SQLite database location: ${path.join(process.cwd(), 'data', 'database.sqlite')}`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Cleanup connections
    if (mysqlPool) {
      await mysqlPool.end();
      console.log('\n🔌 Disconnected from MySQL');
    }
    if (sqliteDb) {
      sqliteDb.close();
      console.log('🔌 Disconnected from SQLite');
    }
  }
}

// Run migration
main().catch(console.error);
