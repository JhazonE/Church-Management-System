# CLC Finance - Node.js Server with MySQL Database Deployment Guide

This guide provides complete step-by-step instructions for deploying the CLC Finance application using Node.js server with MySQL database. This is the recommended setup for production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [MySQL Database Setup](#mysql-database-setup)
- [Application Deployment](#application-deployment)
- [Database Migration from SQLite](#database-migration-from-sqlite)
- [Testing and Verification](#testing-and-verification)
- [Production Configuration](#production-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows
- **Node.js**: Version 18 or higher
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk Space**: 1GB available space
- **Network**: Internet access for initial setup

### Required Software
```bash
# Install Node.js 18+ (Linux example)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL Server
sudo apt-get install mysql-server
```

### Installation Verification
```bash
node --version           # Should show 18.x.x
npm --version           # Should show 8.x.x
mysql --version         # Should show MySQL version
```

## Architecture Overview

The application consists of:

- **Frontend**: Next.js 15 React application
- **Backend**: API routes for data operations
- **Database**: MySQL with connection pooling via mysql2
- **Authentication**: bcrypt-based user authentication
- **File Storage**: Local file system for database and logs

### Application Structure
```
CLC_finance/
├── src/
│   ├── app/api/          # API endpoints
│   ├── components/       # React components
│   ├── lib/
│   │   ├── database.ts   # Database connection logic
│   │   └── types.ts      # TypeScript types
├── scripts/
│   ├── init-db-mysql.sql # MySQL schema
│   ├── migrate-to-mysql.js # Migration script
│   └── populate-db.js    # Sample data
├── data/                 # SQLite fallback (when needed)
├── logs/                 # Application logs
└── .env.local           # Environment configuration
```

## MySQL Database Setup

### Step 1: Install and Configure MySQL

**Linux (Ubuntu/Debian):**
```bash
# Install MySQL Server
sudo apt-get update
sudo apt-get install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
# Follow prompts to set root password and secure installation
```

**macOS (with Homebrew):**
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

**Windows:**
```bash
# Download MySQL installer from https://dev.mysql.com/downloads/windows/
# Run installer as Administrator
# Choose "Developer Default" setup type
# Set root password during installation
# Start MySQL service after installation
```

### Step 2: Create Database and User

Connect to MySQL as root user and execute:

```sql
-- Login to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE clc_finance;
CREATE USER 'clc_finance_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON clc_finance.* TO 'clc_finance_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify user creation (optional)
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'clc_finance_user';

-- Exit MySQL
EXIT;
```

### Step 3: Test Database Connection

```bash
# Test basic MySQL connection
mysql -u clc_finance_user -p clc_finance -e "SELECT 1 as test;"

# Should return: test
# 1
```

## Application Deployment

### Step 1: Transfer Application Code

Copy your CLC Finance project to the target server:

**Using SCP (from development machine):**
```bash
# Copy project files
scp -r ./clc-finance user@target-server:~/clc-finance
```

**Using Git (if repository exists):**
```bash
# Clone repository
git clone https://github.com/your-org/clc-finance.git
cd clc-finance
```

### Step 2: Configure Environment

Create the environment configuration file:

```bash
# Navigate to application directory
cd ~/clc-finance

# Create environment file
nano .env.local
```

Add MySQL connection configuration:

```env
# MySQL Database Configuration
DATABASE_URL=mysql://clc_finance_user:secure_password_here@localhost:3306/clc_finance

# Node.js Environment
NODE_ENV=production

# Optional: Custom port (default 3000)
PORT=3000
```

**Security Note**: Replace `secure_password_here` with a strong password. Never commit `.env.local` to version control.

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install --production

# For development mode (if needed)
# npm install
```

### Step 4: Build Application

```bash
# Build production version
npm run build
```

### Step 5: Initialize Database Schema

```bash
# Run database initialization
npx tsx scripts/migrate-to-mysql.js
```

This script will:
- ✅ Create all required tables
- ✅ Insert default data (admin user, categories, etc.)
- ✅ Configure permissions and settings

**Expected Output:**
```
Connecting to MySQL database...
Database and user created successfully!
Connected successfully!
Executing migration script...
Migration completed successfully!
Verifying migration...
Created tables: users, members, events, donations, expenses, ...

Migration complete! Your database is ready.

Admin credentials:
Username: admin
Password: admin123
```

### Step 6: Test Database Connection

```bash
# Test application database connection
npx tsx test-mysql-connection.js
```

**Expected Output:**
```
Testing MySQL database connection...
Database connection successful!
Users in database: 1
Settings retrieved successfully: { appName: 'CLC Finances', ... }
```

### Step 7: Start Node.js Server

**Development/Testing Mode:**
```bash
# Basic start (not recommended for production)
npm start
```

**Production Mode with PM2:**

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Configure auto-start on system boot
pm2 startup
```

**Verify Application:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs clc-finance

# Test API connectivity
curl http://localhost:3000/api/health
```

### Step 8: Access Application

- **URL**: `http://your-server-ip:3000`
- **Admin Login**:
  - Username: `admin`
  - Password: `admin123` (change immediately after first login)

## Database Migration from SQLite

If you have existing SQLite data, migrate it to MySQL:

### Step 1: Export SQLite Data (if needed)

```bash
# Install sqlite3 command-line tool if not available
sudo apt-get install sqlite3

# View SQLite data (optional)
sqlite3 data/database.sqlite ".tables"
sqlite3 data/database.sqlite "SELECT COUNT(*) FROM users;"
```

### Step 2: Configure MySQL Environment

Ensure `.env.local` points to MySQL (see Step 2 above).

### Step 3: Export and Import Data (Manual Method)

```bash
# Create custom migration script
cat > migrate-data.js << 'EOF'
import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';

async function migrateData() {
  const mysqlUrl = process.env.DATABASE_URL;
  const url = new URL(mysqlUrl);

  // Connect to both databases
  const mysqlConn = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    multipleStatements: true
  });

  const sqliteDb = new Database(path.join('data', 'database.sqlite'));

  try {
    // Migrate users
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await mysqlConn.execute(
        'INSERT INTO users (id, name, username, role, password, permissions) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.name, user.username, user.role, user.password, user.permissions]
      );
    }

    // Add other migrations as needed...
    console.log('Migration completed successfully');

  } finally {
    sqliteDb.close();
    mysqlConn.end();
  }
}

migrateData();
EOF

# Run migration
node migrate-data.js
```

### Step 4: Switch to MySQL

```bash
# Restart application to use MySQL
pm2 restart clc-finance

# Verify MySQL connection
npx tsx test-mysql-connection.js
```

## Testing and Verification

### API Health Check

```bash
# Test application health
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

### Database Tests

```bash
# Test MySQL connectivity
mysql -u clc_finance_user -p clc_finance -e "
  SELECT COUNT(*) as users FROM users;
  SELECT COUNT(*) as members FROM members;
  SELECT COUNT(*) as donations FROM donations;
"

# Test application database queries
npx tsx -e "
import { getAllUsers, getAllSettings } from './src/lib/database.ts';
(async () => {
  const users = await getAllUsers();
  const settings = await getAllSettings();
  console.log('Users:', users.length, 'Settings:', settings.length);
})();
"
```

### Functional Testing

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return JWT token
```

## Production Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mysql://clc_finance_user:secure_password_here@localhost:3306/clc_finance

# Application
NODE_ENV=production
PORT=3000

# Security (add for production)
SESSION_SECRET=your-random-secret-here

# Logging
LOG_LEVEL=info

# Optional: Email configuration (if needed)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
```

### Process Management with PM2

```bash
# Advanced PM2 configuration
pm2 start ecosystem.config.js --env production

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Server Hardening

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Configure firewall (Linux)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 3000

# Install security updates
sudo unattended-upgrades
```

### SSL Certificate (Recommended)

**Using Certbot (Let's Encrypt):**
```bash
# Install Certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx reverse proxy (if used)
sudo apt-get install nginx
```

## Monitoring and Maintenance

### Application Monitoring

```bash
# PM2 monitoring
pm2 status
pm2 logs clc-finance
pm2 monit

# System resources
htop
df -h
free -h
```

### Database Monitoring

```sql
-- MySQL connection pool status
SHOW PROCESSLIST;

-- Table sizes
SELECT
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_in_mb
FROM information_schema.tables
WHERE table_schema = 'clc_finance'
ORDER BY size_in_mb DESC;

-- Slow queries
SHOW PROCESSLIST WHERE time > 10;
```

### Backup Strategy

**MySQL Database Backup:**
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/clc-finance"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="clc_finance_user"
DB_PASS="secure_password_here"
DB_NAME="clc_finance"

mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/mysql_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/mysql_backup_$DATE.sql

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Configuration Backup:**
```bash
# Backup environment and application state
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env.local ecosystem.config.js

# Schedule daily backups
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### Performance Optimization

**Database Tuning:**
```sql
-- Configure MySQL (add to /etc/mysql/my.cnf)
[mysqld]
innodb-buffer-pool-size=256M
max-connections=100
query-cache-size=32M
```

**Node.js Optimization:**
```bash
# Start with memory limits
node --max-old-space-size=512 server.js

# Or in PM2 ecosystem.config.js
env: {
  NODE_ENV: 'production',
  NODE_OPTIONS: '--max-old-space-size=512'
}
```

## Troubleshooting

### Common Issues

**1. MySQL Connection Failed**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Test connection manually
mysql -u clc_finance_user -p clc_finance
```

**2. Application Won't Start**
```bash
# Check Node.js build
npm run build

# Check PM2 logs
pm2 logs clc-finance --lines 50

# Test database connection
npx tsx test-mysql-connection.js
```

**3. Database Migration Issues**
```bash
# Verify MySQL permissions
mysql -u clc_finance_user -p -e "SHOW GRANTS;"

# Check database schema
mysql -u clc_finance_user -p clc_finance -e "SHOW TABLES;"

# Re-run migration
npx tsx scripts/migrate-to-mysql.js
```

**4. Permission Denied**
```bash
# Fix directory permissions
sudo chown -R your-user:your-user ~/clc-finance

# Grant MySQL privileges again
mysql -u root -p -e "GRANT ALL PRIVILEGES ON clc_finance.* TO 'clc_finance_user'@'localhost'; FLUSH PRIVILEGES;"
```

**5. Port Already in Use**
```bash
# Find process using port 3000
sudo netstat -tulpn | grep :3000

# Kill conflicting process
sudo kill -9 PROCESS_ID
```

### Debug Mode

```bash
# Run with detailed logging
DEBUG=* npm start

# MySQL debug connection
mysql -u clc_finance_user -p -e "
  SET GLOBAL general_log = 'ON';
  SHOW VARIABLES LIKE 'general_log%';
"
```

### Common Error Messages

**ER_ACCESS_DENIED_ERROR**: Check username/password in DATABASE_URL
**ETIMEDOUT**: MySQL server not running or firewall blocking access
**ECONNREFUSED**: Port 3000 already in use or application not running
**ENOTFOUND**: Hostname resolution failed, check DNS

### Log Analysis

```bash
# Application logs
tail -f logs/combined.log

# MySQL error log
sudo tail -f /var/log/mysql/error.log

# PM2 logs with filtering
pm2 logs clc-finance | grep ERROR
```

---

## Quick Reference

### Production Deployment Checklist
- [ ] MySQL server installed and running
- [ ] Database and user created with proper privileges
- [ ] Application code deployed
- [ ] Environment variables configured (.env.local)
- [ ] Dependencies installed (npm install)
- [ ] Application built (npm run build)
- [ ] Database initialized (npx tsx scripts/migrate-to-mysql.js)
- [ ] Database connection tested
- [ ] PM2 configured and started
- [ ] Application accessible and logging in works
- [ ] Firewall configured
- [ ] Backup script scheduled
- [ ] Monitoring tools configured

### Useful Commands
```bash
# Application management
pm2 restart clc-finance
pm2 stop clc-finance
pm2 logs clc-finance

# Database operations
mysql -u clc_finance_user -p clc_finance
mysqldump -u clc_finance_user -p clc_finance > backup.sql

# System maintenance
df -h  # Check disk space
free -h  # Check memory
top  # Process monitoring
```

---

**Default Credentials**:
- Username: `admin`
- Password: `admin123` (change after first login)

**Access URL**: `http://your-server-ip:3000`

This deployment provides a production-ready CLC Finance system with MySQL database, proper process management, and monitoring capabilities.
