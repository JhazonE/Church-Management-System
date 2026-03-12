require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

async function migrateToPostgres() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    console.log('Connecting to Neon Postgres...');
    const pgPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    const sqlitePath = path.join(__dirname, '..', 'data', 'database.sqlite');
    console.log(`Connecting to SQLite: ${sqlitePath}`);
    const sqliteDb = new Database(sqlitePath);

    try {
        // 1. Create Tables in Postgres
        console.log('Creating tables in Postgres...');
        await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
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

      CREATE TABLE IF NOT EXISTS giving_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        donor_name TEXT NOT NULL,
        member_id TEXT REFERENCES members(id),
        amount DECIMAL(10,2) NOT NULL,
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
        amount DECIMAL(10,2) NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        recorded_by_id TEXT REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS donation_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expense_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS service_times (
        id TEXT PRIMARY KEY,
        time TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS networks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'global',
        app_name TEXT NOT NULL DEFAULT 'CLC Finances',
        logo_url TEXT NOT NULL DEFAULT '/CLC logo2.png',
        theme TEXT NOT NULL DEFAULT 'dark',
        backup_time TEXT NOT NULL DEFAULT '02:00',
        backup_enabled BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 2. Migrate Data
        const tables = [
            'users', 'members', 'events', 'resources',
            'giving_types', 'donation_categories', 'expense_categories',
            'service_times', 'networks', 'donations', 'expenses', 'settings'
        ];

        for (const table of tables) {
            console.log(`Checking table: ${table}...`);
            
            const tableExists = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
            if (!tableExists) {
                console.log(`Table ${table} does not exist in SQLite, skipping.`);
                continue;
            }

            console.log(`Migrating table: ${table}...`);
            const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();

            if (rows.length === 0) {
                console.log(`Table ${table} is empty, skipping.`);
                continue;
            }

            const columns = Object.keys(rows[0]);
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

            for (const row of rows) {
                const values = columns.map(col => row[col]);
                await pgPool.query(query, values);
            }
            console.log(`Migrated ${rows.length} rows from ${table}.`);
        }

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        sqliteDb.close();
        await pgPool.end();
    }
}

migrateToPostgres();
