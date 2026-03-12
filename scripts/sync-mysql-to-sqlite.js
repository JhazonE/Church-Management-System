const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

async function syncMySQLToSQLite() {
    console.log('Starting MySQL to SQLite sync...\n');

    // Parse MySQL connection string
    const url = new URL(DATABASE_URL);
    const mysqlConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        insecureAuth: true,
    };

    console.log(`Connecting to MySQL: ${mysqlConfig.user}@${mysqlConfig.host}:${mysqlConfig.port}/${mysqlConfig.database}`);

    let mysqlConnection;
    let sqliteDb;

    try {
        // Connect to MySQL
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✓ Connected to MySQL\n');

        // Connect to SQLite
        const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');

        // Ensure data directory exists
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`Created directory: ${dataDir}`);
        }

        sqliteDb = new Database(dbPath);
        console.log(`✓ Connected to SQLite: ${dbPath}\n`);

        // Enable WAL mode for better performance
        sqliteDb.pragma('journal_mode = WAL');

        // Disable foreign key constraints temporarily
        sqliteDb.pragma('foreign_keys = OFF');
        console.log('Disabled foreign key constraints\n');

        // Tables to sync in dependency order (tables without foreign keys first)
        const tables = [
            'users',
            'donation_categories',
            'expense_categories',
            'service_times',
            'giving_types',
            'networks',
            'resources',
            'settings',
            'members',
            'events',
            'donations',
            'expenses'
        ];

        console.log('Checking MySQL tables...\n');

        for (const table of tables) {
            try {
                // Get data from MySQL
                const [rows] = await mysqlConnection.execute(`SELECT * FROM ${table}`);
                console.log(`Table: ${table} - ${rows.length} rows in MySQL`);

                if (rows.length > 0) {
                    // Get SQLite row count
                    let sqliteCount;
                    try {
                        sqliteCount = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                        console.log(`  SQLite has ${sqliteCount.count} rows`);
                    } catch (err) {
                        console.log(`  ✗ Table ${table} doesn't exist in SQLite, skipping...`);
                        continue;
                    }

                    // Clear SQLite table
                    sqliteDb.prepare(`DELETE FROM ${table}`).run();
                    console.log(`  Cleared SQLite table`);

                    // Insert data into SQLite
                    const columns = Object.keys(rows[0]);

                    // Filter out columns that don't exist in SQLite
                    const sqliteColumns = sqliteDb.prepare(`PRAGMA table_info(${table})`).all().map(col => col.name);
                    const validColumns = columns.filter(col => sqliteColumns.includes(col));

                    if (validColumns.length === 0) {
                        console.log(`  ✗ No matching columns found, skipping...`);
                        continue;
                    }

                    const placeholders = validColumns.map(() => '?').join(', ');
                    const insertStmt = sqliteDb.prepare(
                        `INSERT INTO ${table} (${validColumns.join(', ')}) VALUES (${placeholders})`
                    );

                    const insertMany = sqliteDb.transaction((data) => {
                        for (const row of data) {
                            const values = validColumns.map(col => {
                                const value = row[col];
                                // Convert Date objects to ISO strings
                                if (value instanceof Date) {
                                    return value.toISOString();
                                }
                                // Convert boolean to 0/1 for SQLite
                                if (typeof value === 'boolean') {
                                    return value ? 1 : 0;
                                }
                                return value;
                            });
                            insertStmt.run(values);
                        }
                    });

                    insertMany(rows);
                    console.log(`  ✓ Synced ${rows.length} rows to SQLite\n`);
                } else {
                    console.log(`  No data to sync\n`);
                }
            } catch (error) {
                console.error(`  ✗ Error syncing table ${table}:`, error.message);
            }
        }

        // Re-enable foreign key constraints
        sqliteDb.pragma('foreign_keys = ON');
        console.log('Re-enabled foreign key constraints');

        console.log('\n✓ Sync completed successfully!');

    } catch (error) {
        console.error('\n✗ Sync failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        // Close connections
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('\nMySQL connection closed');
        }
        if (sqliteDb) {
            sqliteDb.close();
            console.log('SQLite connection closed');
        }
    }
}

// Run the sync
syncMySQLToSQLite();
