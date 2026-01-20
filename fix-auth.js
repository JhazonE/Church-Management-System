const mysql = require('mysql2/promise');

async function fixAuth() {
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_user:clc_password@localhost:3307/clc_finance';

  try {
    console.log('Connecting to MySQL database as root...');

    // Parse connection string
    const url = new URL(connectionString);

    // Connect as root to mysql database
    const rootConnection = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: 'root',
      password: 'rootpassword',
      database: 'mysql',
      connectTimeout: 10000
    });

    console.log('Connected as root successfully!');

    // Alter the user to use mysql_native_password
    console.log('Altering user authentication plugin...');
    await rootConnection.execute(`ALTER USER '${url.username}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${url.password}'`);
    await rootConnection.execute('FLUSH PRIVILEGES');

    console.log('User authentication plugin fixed successfully!');

    await rootConnection.end();

  } catch (error) {
    console.error('Error fixing authentication:', error.message);
    console.error('Full error:', error);
  }
}

fixAuth();
