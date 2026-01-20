require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mysql = require('mysql2/promise');

async function checkSettingsTable() {
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

  let connection;

  try {
    console.log('Connecting to MySQL database...');

    const url = new URL(connectionString);

    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });

    console.log('Connected successfully!');

    // Check table structure
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM settings"
    );

    console.log('Settings table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default !== null ? `DEFAULT '${col.Default}'` : ''}`);
    });

    // Check current settings data
    const [rows] = await connection.execute('SELECT * FROM settings WHERE id = ?', ['global']);
    console.log('\nCurrent settings data:', rows[0]);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSettingsTable();
