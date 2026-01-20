import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const LOG_FILE = path.join(process.cwd(), 'logs', 'backup.log');

// Helper function to get backup files info
function getBackupFiles() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIR);
    return files
      .filter(file => file.startsWith('backup-'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
          type: file.includes('sqlite') ? 'SQLite' : 'MySQL'
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error reading backup files:', error);
    return [];
  }
}

// Helper function to get recent backup logs
function getBackupLogs(lines = 50) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return 'No backup logs available';
    }

    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const logLines = logContent.trim().split('\n');
    return logLines.slice(-lines).join('\n');
  } catch (error) {
    console.error('Error reading backup logs:', error);
    return 'Error reading backup logs';
  }
}

// POST /api/backup - Trigger manual backup
export async function POST(request: NextRequest) {
  try {
    console.log('Manual backup initiated via API');
    const scriptPath = path.join(process.cwd(), 'scripts', 'backup-db.js');
    await execAsync(`node "${scriptPath}"`);
    return NextResponse.json({
      success: true,
      message: 'Backup completed successfully'
    });
  } catch (error) {
    console.error('Manual backup failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Backup failed',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

// GET /api/backup - Get backup status and files
export async function GET(request: NextRequest) {
  // Get backup status and files
  try {
    const backupFiles = getBackupFiles();
    const recentLogs = getBackupLogs(20);

    return NextResponse.json({
      success: true,
      data: {
        backupFiles,
        recentLogs,
        lastBackup: backupFiles.length > 0 ? backupFiles[0] : null,
        totalBackups: backupFiles.length,
        backupDirectory: BACKUP_DIR
      }
    });
  } catch (error) {
    console.error('Error getting backup status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get backup status',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}
