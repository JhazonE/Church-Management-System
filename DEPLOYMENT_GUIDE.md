# CLC Finance Management System - Deployment Guide

This comprehensive guide covers deploying the CLC Finance application to another machine using Node.js server. Choose the deployment method that best fits your needs and infrastructure.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Database Options](#database-options)
- [Deployment Methods](#deployment-methods)
- [Process Management](#process-management)
- [Security Configuration](#security-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Maintenance](#backup-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

## Prerequisites

### Target Machine Requirements
- **Operating System**: Windows, Linux, or macOS
- **Node.js**: Version 18 or higher
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk Space**: Minimum 500MB available
- **Network**: Internet access for initial setup

### Installation
```bash
# Download and install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18.x.x or higher
npm --version   # Should be 8.x.x or higher
```

### Firewall Configuration
Ensure the target port (default: 3000) is open:
```bash
# Linux (UFW)
sudo ufw allow 3000

# Windows Firewall
# Add inbound rule for port 3000 TCP
```

## Architecture Overview

The CLC Finance application is a Next.js web application that supports multiple database backends:

- **Frontend**: Next.js 15 with React 18, TypeScript
- **Backend**: API routes for data operations
- **Database**: SQLite (development/simple) or MySQL (production)
- **Authentication**: Custom bcrypt-based authentication

### Application Modes
- **SQLite Mode**: Standalone, no external database required
- **MySQL Mode**: Production-ready with external database server

## Database Options

### Option 1: SQLite (Recommended for Simple Deployments)

**Advantages**:
- No external database setup required
- Single file database, easy backup
- Lower resource requirements
- Perfect for single-user or small team use

**Configuration**:
- Ensure no `DATABASE_URL` environment variable is set
- Database file: `./data/database.sqlite`
- Auto-created on first run

### Option 2: MySQL (Recommended for Production)

**Advantages**:
- Better performance with multiple concurrent users
- Robust backup and recovery options
- Industry standard database server
- Supports advanced features and scaling

**Setup on Target Machine**:
```bash
# Install MySQL Server
sudo apt-get install mysql-server  # Ubuntu/Debian
# OR
sudo yum install mysql-server      # CentOS/RHEL

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
mysql -u root -p
```

```sql
-- Run these commands in MySQL console
CREATE DATABASE clc_finance;
CREATE USER 'clc_finance_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON clc_finance.* TO 'clc_finance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Environment Configuration**:
Create `.env.local` file:
```env
DATABASE_URL=mysql://clc_finance_user:secure_password_here@localhost:3306/clc_finance
```

## Deployment Methods

### Method 1: Quick SQLite Deployment

1. **Transfer Code**:
   ```bash
   # Copy project files to target machine
   scp -r ./clc-finance user@target-machine:~/clc-finance
   ```

2. **Install Dependencies**:
   ```bash
   cd ~/clc-finance
   npm install --production
   ```

3. **Build Application**:
   ```bash
   npm run build
   ```

4. **Initialize Database**:
   ```bash
   npm run populate-db  # Loads sample data
   ```

5. **Start Application**:
   ```bash
   npm start
   ```

6. **Access Application**:
   ```
   http://target-machine-ip:3000
   ```

### Method 2: Production MySQL Deployment

1. **Install MySQL and Dependencies**:
   ```bash
   cd ~/clc-finance
   npm install
   ```

2. **Configure Environment**:
   ```bash
   # Create .env.local with MySQL connection
   DATABASE_URL=mysql://clc_finance_user:secure_password_here@localhost:3306/clc_finance
   ```

3. **Build and Initialize**:
   ```bash
   npm run build
   npm run populate-db
   ```

4. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

### Method 3: Custom Server Deployment

For custom hosting requirements:

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Start with Custom Server**:
   ```bash
   node server.js
   ```

3. **Or with PM2**:
   ```json
   // custom-ecosystem.json
   {
     "apps": [{
       "name": "clc-finance-custom",
       "script": "server.js",
       "env": {
         "NODE_ENV": "production",
         "PORT": 3000
       }
     }]
   }
   ```

   ```bash
   pm2 start custom-ecosystem.json
   ```

## Process Management

### Using PM2 (Recommended)

PM2 provides advanced process management, monitoring, and automatic restarts.

**Installation and Setup**:
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Configure auto-start on boot
pm2 startup
pm2 save

# Enable log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 10
```

**PM2 Commands**:
```bash
pm2 list                    # List all processes
pm2 logs clc-finance       # View logs
pm2 restart clc-finance    # Restart application
pm2 stop clc-finance       # Stop application
pm2 delete clc-finance     # Remove from PM2
pm2 monit                  # Monitor resources
```

### Using systemd (Linux)

For native system integration:

1. **Create Service File** (`/etc/systemd/system/clc-finance.service`):
   ```ini
   [Unit]
   Description=CLC Finance Application
   After=network.target mysql.service

   [Service]
   Type=simple
   User=clc-user
   WorkingDirectory=/home/clc-user/clc-finance
   ExecStart=/usr/bin/node server.js
   Environment=NODE_ENV=production
   Environment=PORT=3000
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and Start Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable clc-finance
   sudo systemctl start clc-finance
   sudo systemctl status clc-finance
   ```

### Using Windows Services

For Windows deployments:

```powershell
# Install as Windows service using NSSM or similar
nssm install CLCFinance "C:\Program Files\nodejs\node.exe"
nssm set CLCFinance AppDirectory "C:\clc-finance"
nssm set CLCFinance AppParameters server.js
nssm start CLCFinance
```

## Security Configuration

### Environment Security
```bash
# Set secure permissions
chmod 600 .env.local

# Never commit sensitive files
echo .env.local >> .gitignore
```

### Database Security
- Use strong passwords for database users
- Configure MySQL to only accept local connections if possible
- Regularly update database passwords

### Network Security
```bash
# Configure firewall to limit access
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw --force enable
```

### SSL/TLS Configuration (Recommended)

For HTTPS in production:

1. **Install Nginx as Reverse Proxy**:
   ```bash
   sudo apt-get install nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/clc-finance`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable SSL**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Monitoring and Logging

### Application Logs
```bash
# PM2 logs
pm2 logs clc-finance

# Application-specific logs
tail -f logs/combined-0.log
tail -f logs/err-0.log
```

### System Monitoring
```bash
# Check application status
pm2 status

# System resources
htop
free -h
df -h

# Network connections
netstat -tulpn | grep :3000
```

### Health Check Endpoint
The application includes built-in health checks. Verify:
```bash
curl http://localhost:3000/api/health
```

### Log Rotation
Configure PM2 log rotation:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 7     # Keep 7 log files
pm2 set pm2-logrotate:compress true # Compress old logs
pm2 set pm2-logrotate:rotateModule true
```

## Backup and Maintenance

### SQLite Database Backups
```bash
#!/bin/bash
# Daily backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/clc-finance"

mkdir -p $BACKUP_DIR

# Stop application for clean backup (optional for SQLite)
pm2 stop clc-finance

# Backup database
cp data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup configuration
cp .env.local $BACKUP_DIR/env_$DATE.local

# Restart application
pm2 start clc-finance

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
find $BACKUP_DIR -name "*.local" -mtime +30 -delete
```

### MySQL Database Backups
```bash
#!/bin/bash
# MySQL backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/clc-finance"
DB_USER="clc_finance_user"
DB_PASS="secure_password_here"
DB_NAME="clc_finance"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/mysql_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/mysql_backup_$DATE.sql

# Clean old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Application Updates
```bash
# Stop application
pm2 stop clc-finance

# Backup current version
cp -r clc-finance clc-finance.backup.$(date +%Y%m%d)

# Update code (replace with your update method)
git pull origin main
npm install --production
npm run build

# Migrate database (if needed)
npm run populate-db

# Restart application
pm2 start clc-finance

# Test application
curl http://localhost:3000/api/health
```

## Troubleshooting

### Application Won't Start
1. **Check Node.js version**:
   ```bash
   node --version
   ```

2. **Dependencies check**:
   ```bash
   npm ls --depth=0
   ```

3. **Build verification**:
   ```bash
   ls -la .next/
   ```

4. **Port conflicts**:
   ```bash
   netstat -tulpn | grep :3000
   ```

5. **Logs review**:
   ```bash
   pm2 logs clc-finance --lines 50
   ```

### Database Connection Issues

**SQLite Issues**:
```bash
# Check database file
ls -la data/database.sqlite

# Check permissions
chmod 664 data/database.sqlite

# Reset database
rm data/database.sqlite
npm run populate-db
```

**MySQL Issues**:
```bash
# Test connection
mysql -u clc_finance_user -p -e "SHOW DATABASES;"

# Check MySQL service
sudo systemctl status mysql

# Test application connection
npx tsx test-mysql-connection.js
```

### Performance Issues
```bash
# Check memory usage
pm2 monit

# Check system resources
free -h
df -h

# Optimize Node.js
node --max-old-space-size=4096 server.js
```

### Common Error Messages

**"EADDRINUSE: address already in use"**
```bash
# Find process using port
sudo netstat -tulpn | grep :3000
# Kill the process or change port
```

**"ER_ACCESS_DENIED_ERROR" (MySQL)**
- Verify database credentials in `.env.local`
- Check user permissions in MySQL

**"Cannot find module"**
```bash
npm install
npm run build
```

## Advanced Topics

### Clustering and Load Balancing

For high-traffic deployments:

1. **PM2 Clustering**:
   ```bash
   pm2 start ecosystem.config.js -i max
   ```

2. **Nginx Load Balancer**:
   ```nginx
   upstream clc_app {
       server localhost:3000;
       server localhost:3001;
       server localhost:3002;
   }

   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://clc_app;
           # ... proxy settings
       }
   }
   ```

### Custom SSL/TLS Certificates

1. **Generate certificate**:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

2. **Configure in Node.js** (if not using Nginx):
   ```javascript
   const https = require('https');
   const { createServer } = require('http');
   const app = next({ dev: false });
   const handle = app.getRequestHandler();

   const server = https.createServer({
       key: fs.readFileSync('key.pem'),
       cert: fs.readFileSync('cert.pem')
   }, (req, res) => {
       handle(req, res, parse(req.url, true));
   });

   server.listen(443);
   ```

### Database Migration

To migrate from SQLite to MySQL:

```bash
# Export SQLite data
npx tsx scripts/migrate-to-mysql.js

# Configure .env.local for MySQL
# Start application
npm start
```

### Automated Deployment

Using deployment scripts or CI/CD:

```bash
#!/bin/bash
# deploy.sh

# Variables
REMOTE_HOST="your-server.com"
REMOTE_USER="deploy"
REMOTE_DIR="/home/deploy/clc-finance"

# Deploy
rsync -avz --delete --exclude='node_modules' --exclude='.next' --exclude='data' . $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# Remote commands
ssh $REMOTE_USER@$REMOTE_HOST << EOF
cd $REMOTE_DIR
npm install --production
npm run build
pm2 restart clc-finance
EOF
```

---

## Support

For deployment issues:
1. Check application logs: `pm2 logs clc-finance`
2. Verify system resources are adequate
3. Test database connections
4. Review firewall and network configuration

**Default Login Credentials**:
- **Admin**: username `admin`, password `password`
- **Staff**: username `staff`, password `password`

**Ports**: 3000 (HTTP), 443 (HTTPS if configured)

**Documentation**: Main README.md for application-specific features

---

*This deployment guide covers the most common scenarios. For specialized requirements, consult the application documentation or seek professional system administration support.*
