const cron = require('node-cron');
const { performBackup, getSettings } = require('../src/lib/database');
const fs = require('fs');
const path = require('path');

// Configuration
const LOG_FILE = path.join(__dirname, '..', 'logs', 'backup.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(message);

  // Ensure log directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Schedule daily backup based on settings
async function startScheduledBackup() {
  log('Starting automated backup service...');

  try {
    // Get backup settings from database
    const settings = await getSettings();

    if (!settings.backupEnabled) {
      log('Automatic backups are disabled. Starting without scheduler.');
      log('Backup service ready (manual backups only)');
      return;
    }

    const backupTime = settings.backupTime || '02:00';
    const [hours, minutes] = backupTime.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      log(`Invalid backup time format: ${backupTime}. Using default 02:00`);
      // Fallback to default time
      cron.schedule('0 2 * * *', createBackupJob);
    } else {
      // Schedule backup at specified time
      const cronExpression = `${minutes} ${hours} * * *`;
      log(`Scheduling daily backup at ${backupTime} (${cronExpression})`);
      cron.schedule(cronExpression, createBackupJob);
    }

    log('Backup scheduler started successfully');

  } catch (error) {
    log(`Error reading backup settings: ${error.message}. Using default schedule.`);
    // Fallback to default time
    cron.schedule('0 2 * * *', createBackupJob);
    log('Backup scheduler started successfully (with fallback settings)');
  }
}

// Create backup job function
async function createBackupJob() {
  log('Running scheduled backup...');
  try {
    await performBackup();
    log('Scheduled backup completed successfully');
  } catch (error) {
    log(`Scheduled backup failed: ${error.message}`);
  }
}

// Start the service
if (require.main === module) {
  startScheduledBackup();

  // Keep the process running
  process.on('SIGINT', () => {
    log('Backup service stopped');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('Backup service stopped');
    process.exit(0);
  });
}

module.exports = { startScheduledBackup };
