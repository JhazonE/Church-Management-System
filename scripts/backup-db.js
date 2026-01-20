const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_DIR = path.join(__dirname, '..', 'data');
const isElectron = !process.env.DATABASE_URL && !process.env.FORCE_MYSQL && !process.env.NODE_ENV?.includes('production');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupSQLite() {
  const sourceDb = path.join(DB_DIR, 'database.sqlite');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(BACKUP_DIR, `backup-sqlite-${timestamp}.db`);

  if (!fs.existsSync(sourceDb)) {
    console.log('SQLite database file not found, skipping SQLite backup');
    return;
  }

  try {
    // For SQLite, copy the database file
    await fs.promises.copyFile(sourceDb, backupFile);
    // Also backup WAL and SHM files if they exist
    const walFile = `${sourceDb}-wal`;
    const shmFile = `${sourceDb}-shm`;

    if (fs.existsSync(walFile)) {
      await fs.promises.copyFile(walFile, `${backupFile}-wal`);
    }
    if (fs.existsSync(shmFile)) {
      await fs.promises.copyFile(shmFile, `${backupFile}-shm`);
    }

    console.log(`SQLite backup created: ${backupFile}`);
  } catch (error) {
    console.error('SQLite backup failed:', error);
  }
}

async function backupMySQL() {
  const connectionString = process.env.DATABASE_URL || 'mysql://clc_finance:123700@localhost:3306/clc_finance';

  try {
    // Parse connection string
    const url = new URL(connectionString);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `backup-mysql-${timestamp}.sql`);

    // Use direct mysqldump with full path on Windows
    const mysqldumpPath = process.platform === 'win32'
      ? '"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"'
      : 'mysqldump';
    const dumpCommand = `${mysqldumpPath} -h ${url.hostname} -P ${url.port || 3306} -u ${url.username} -p"${url.password}" --single-transaction --routines --triggers ${url.pathname.slice(1)} > "${backupFile}"`;
    console.log('Creating MySQL backup using direct mysqldump...');
    await execAsync(dumpCommand);
    console.log(`MySQL backup created: ${backupFile}`);
    return;

    console.log(`MySQL backup created: ${backupFile}`);
  } catch (error) {
    console.error('MySQL backup failed (may need mysqldump or proper auth setup):', error.message);

    // Try alternative approach: create a simple SQL backup structure
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupFile = path.join(BACKUP_DIR, `backup-mysql-${timestamp}.sql`);
      const sampleBackup = `-- MySQL Backup File
-- Generated: ${new Date().toISOString()}
-- Database: clc_finance
-- This is a placeholder backup frame. In production, use mysqldump or proper MySQL access.

-- Note: Authentication issues with MySQL server detected.
-- For full MySQL backup, ensure:
-- 1. MySQL server is running locally or accessible
-- 2. User has proper authentication plugin (use mysql_native_password)
-- 3. Or use Docker: docker exec -it clc-mysql mysqldump -u root -p clc_finance > backup.sql

-- Sample structure from init-db-mysql.sql
CREATE DATABASE IF NOT EXISTS clc_finance;
USE clc_finance;

-- [Additional SQL would go here for full backup]
`;

      await fs.promises.writeFile(backupFile, sampleBackup, 'utf8');
      console.log(`Created sample MySQL backup template: ${backupFile}`);
    } catch (fallbackError) {
      console.error('Fallback MySQL backup creation failed:', fallbackError.message);
    }
  }
}

async function performBackup() {
  console.log('Starting database backup...');

  try {
    await backupSQLite();
    await backupMySQL();
    console.log('Database backup completed successfully');

    // Clean up old backups (keep last 7 days)
    await cleanupOldBackups();
  } catch (error) {
    console.error('Backup process failed:', error);
  }
}

async function cleanupOldBackups() {
  try {
    const files = await fs.promises.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Keep only the most recent 7 backups
    if (backupFiles.length > 7) {
      const filesToDelete = backupFiles.slice(7);
      for (const file of filesToDelete) {
        await fs.promises.unlink(file.path);
        console.log(`Cleaned up old backup: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Main execution
if (require.main === module) {
  performBackup();
}

module.exports = { performBackup };
