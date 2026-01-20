require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mysql = require('mysql2/promise');

async function addBackupSettingsColumns() {
  // Use the same connection logic as in database.ts
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_user:clc_password@localhost:3306/clc_finance';

  let connection;

  try {
    console.log('Connecting to MySQL database...');

    // Parse connection string
    const url = new URL(connectionString);

    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    });

    console.log('Connected successfully!');

    // Check if the columns already exist
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM settings WHERE Field IN ('backup_time', 'backup_enabled')"
    );

    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns);

    // Add backup_time column if it doesn't exist
    if (!existingColumns.includes('backup_time')) {
      console.log('Adding backup_time column...');
      await connection.execute(
        "ALTER TABLE settings ADD COLUMN backup_time VARCHAR(10) NOT NULL DEFAULT '02:00'"
      );
      console.log('backup_time column added successfully!');
    } else {
      console.log('backup_time column already exists');
    }

    // Add backup_enabled column if it doesn't exist
    if (!existingColumns.includes('backup_enabled')) {
      console.log('Adding backup_enabled column...');
      await connection.execute(
        "ALTER TABLE settings ADD COLUMN backup_enabled BOOLEAN NOT NULL DEFAULT 1"
      );
      console.log('backup_enabled column added successfully!');
    } else {
      console.log('backup_enabled column already exists');
    }

    // Update existing records to have default values if they are NULL
    console.log('Updating existing records with default values...');
    await connection.execute(
      "UPDATE settings SET backup_time = '02:00', backup_enabled = 1 WHERE backup_time IS NULL OR backup_enabled IS NULL"
    );

    console.log('Migration completed successfully!');

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
  addBackupSettingsColumns();
}

module.exports = addBackupSettingsColumns;
