require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateToMySQL() {
  // Default MySQL connection
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

  let connection;

  try {
    console.log('Connecting to MySQL database...');

    // Parse connection string or use defaults
    const url = new URL(connectionString);

    // First, connect to mysql database to create the clc_finance database
    console.log('Creating database...');
    const rootConnection = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: 'root',
      password: 'rootpassword',
      database: 'mysql',
      multipleStatements: true
    });

    await rootConnection.execute(`ALTER USER 'root'@'localhost' IDENTIFIED BY 'rootpassword'`);
    await rootConnection.execute('CREATE DATABASE IF NOT EXISTS clc_finance');
    await rootConnection.execute(`CREATE USER IF NOT EXISTS '${url.username}'@'%' IDENTIFIED BY '${url.password}'`);
    await rootConnection.execute(`GRANT ALL PRIVILEGES ON clc_finance.* TO '${url.username}'@'%'`);
    await rootConnection.execute('FLUSH PRIVILEGES');

    await rootConnection.end();
    console.log('Database and user created successfully!');

    // Now connect with the application user
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) || 'clc_finance',
      multipleStatements: true // Allow multiple statements in one execution
    });

    console.log('Connected successfully!');

    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'init-db-mysql.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing migration script...');

    // Remove comment lines and clean up the SQL
    sql = sql.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();

    // Execute all statements at once using multipleStatements
    await connection.query(sql);

    console.log('Migration completed successfully!');

    // Verify the migration by checking tables
    console.log('Verifying migration...');
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('Created tables:', tables.map(row => Object.values(row)[0]).join(', '));

    console.log('\nMigration complete! Your database is ready.');
    console.log('\nAdmin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToMySQL();
}

module.exports = migrateToMySQL;
