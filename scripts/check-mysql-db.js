const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

async function checkMySQLDatabase() {
    console.log('Checking MySQL Database...\n');

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

    console.log(`Connection Details:`);
    console.log(`  Host: ${mysqlConfig.host}`);
    console.log(`  Port: ${mysqlConfig.port}`);
    console.log(`  User: ${mysqlConfig.user}`);
    console.log(`  Database: ${mysqlConfig.database}\n`);

    let connection;

    try {
        // Connect to MySQL
        connection = await mysql.createConnection(mysqlConfig);
        console.log('✓ Successfully connected to MySQL\n');

        // Get all tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`Found ${tables.length} tables:\n`);

        // Get row count for each table
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            const count = countResult[0].count;
            console.log(`  ${tableName.padEnd(25)} - ${count} rows`);
        }

        console.log('\n✓ Database check completed successfully!');

    } catch (error) {
        console.error('\n✗ Database check failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nConnection closed');
        }
    }
}

// Run the check
checkMySQLDatabase();
