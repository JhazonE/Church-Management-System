# Database Backup System

This project includes an automated backup system for both SQLite and MySQL databases used in the CLC Finance application.

## Features

- **Automated Daily Backups**: Scheduled backups run every day at 2:00 AM
- **Multi-Database Support**: Handles both SQLite (for Electron/desktop builds) and MySQL (for web deployments)
- **Backup Retention**: Keeps the 7 most recent backups, automatically cleaning up older ones
- **Comprehensive Logging**: All backup operations are logged to `logs/backup.log`
- **API Integration**: Manual backups can be triggered via REST API
- **Monitoring**: Backup status and file information available via API

## File Structure

- `scripts/backup-db.js` - Main backup script that handles both SQLite and MySQL
- `scripts/auto-backup.js` - Cron-based scheduler for automatic backups
- `src/app/api/backup/route.ts` - REST API endpoints for backup operations
- `backups/` - Directory containing backup files (excluded from git)
- `logs/backup.log` - Backup operation logs

## How It Works

### Automatic Backups

- The `scripts/auto-backup.js` starts a cron scheduler when the server starts
- Backups run daily at 2:00 AM using node-cron
- If a backup fails, it's logged and the system continues

### SQLite Backups

- Copies the database file (`database.sqlite`)
- Also copies WAL (`-wal`) and SHM (`-shm`) files if they exist
- Backup filename: `backup-sqlite-YYYY-MM-DDTHH-MM-SS.db`

### MySQL Backups

- Uses `mysqldump` to create SQL export files
- Requires MySQL credentials to be set in environment variables
- Backup filename: `backup-mysql-YYYY-MM-DDTHH-MM-SS.sql`

## Manual Usage

### Command Line

```bash
# Run a backup manually
npm run backup

# Start backup service (for testing)
npm run backup-service
```

### API Endpoints

#### Get Backup Status
```http
GET /api/backup
```

Response:
```json
{
  "success": true,
  "data": {
    "backupFiles": [...],
    "recentLogs": "...",
    "lastBackup": {...},
    "totalBackups": 7,
    "backupDirectory": "D:/BHAGOH PROJECT/CLC_finance/backups"
  }
}
```

#### Trigger Manual Backup
```http
POST /api/backup
```

Response:
```json
{
  "success": true,
  "message": "Backup completed successfully"
}
```

## Configuration

### Environment Variables

For MySQL backups:
- `DATABASE_URL` - MySQL connection string (e.g., `mysql://user:pass@host:port/db`)

### Docker Environment

When using Docker MySQL, the backup script may need modifications to run mysqldump inside the container. For production deployments, consider updating the `backupMySQL()` function to use `docker exec`.

## Monitoring

### Logs

Check backup logs:
```bash
tail -f logs/backup.log
```

### Backup Files

- Files are stored in the `backups/` directory
- Older backups are automatically deleted to keep only the 7 most recent ones
- File sizes and timestamps are tracked

## Troubleshooting

### Common Issues

1. **MySQL Authentication Error**: Update MySQL configuration to use `mysql_native_password` instead of newer auth plugins
2. **Permission Errors**: Ensure the application has write permissions to `backups/` and `logs/` directories
3. **Containerized MySQL**: Consider using `docker exec` for backups in containerized environments
4. **Large Backup Files**: Monitor disk space usage, especially for large databases

### Error Codes

- `AUTH_SWITCH_PLUGIN_ERROR`: MySQL authentication plugin issue
- `ECONNREFUSED`: Cannot connect to MySQL server
- `EACCES`: File system permission error

## Security Considerations

- Backup files contain sensitive data and should be encrypted in production
- Store backups in a secure location or cloud storage
- Regularly review backup logs for anomalies
- Consider offsite backup storage for disaster recovery
