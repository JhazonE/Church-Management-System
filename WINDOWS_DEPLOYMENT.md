# CLC Finance - Windows Deployment Guide (Node.js)

This guide provides step-by-step instructions for deploying the CLC Finance application on Windows using Node.js server. Choose the deployment method that fits your needs.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (One-Click Deployment)](#quick-start-one-click-deployment)
- [Manual SQLite Deployment](#manual-sqlite-deployment)
- [Production MySQL Deployment](#production-mysql-deployment)
- [Process Management with PM2](#process-management-with-pm2)
- [Windows Services Deployment](#windows-services-deployment)
- [IIS Deployment (Advanced)](#iis-deployment-advanced)
- [Troubleshooting Windows Issues](#troubleshooting-windows-issues)

## Prerequisites

### System Requirements
- **Windows**: 10/11
- **RAM**: Minimum 4GB, Recommended 8GB
- **Disk Space**: 500MB free space
- **Network**: Internet access for initial setup

### Install Node.js

1. **Download Node.js 18+**:
   - Visit: https://nodejs.org/
   - Download the **Windows Installer (.msi)**
   - Choose LTS version recommended

2. **Install Node.js**:
   - Run the downloaded installer as Administrator
   - Accept default installation settings
   - Ensure "Add to PATH" is checked

3. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```

   Expected output: Node.js 18.x.x and npm 8.x.x

## Quick Start (One-Click Deployment)

The easiest way to deploy on Windows:

1. **Double-click `deploy.bat`** in the project root directory

   **OR** run from Command Prompt:
   ```cmd
   deploy.bat
   ```

2. **Wait for installation** (may take 10-15 minutes for first run)

3. **Access the application**:
   - Open browser to: `http://localhost:3000`
   - Default login: `admin` / `password`

The script automatically:
- ✅ Checks Node.js installation
- ✅ Installs dependencies
- ✅ Builds the application
- ✅ Sets up SQLite database with sample data
- ✅ Starts the Node.js server

## Manual SQLite Deployment

For manual control over the deployment process:

### Step 1: Prepare the Environment

```cmd
# Navigate to project directory
cd C:\path\to\clc-finance

# Install dependencies
npm install
```

### Step 2: Build the Application

```cmd
# Build for production
npm run build
```

### Step 3: Setup Database

```cmd
# Populate SQLite database with sample data
npm run populate-db
```

### Step 4: Start the Server

**Option A: Using npm start** (Basic)
```cmd
# Start the Node.js server
npm start
```
- Access at: `http://localhost:3000`
- Stop with `Ctrl+C`

**Option B: Using server.js directly**
```cmd
# Start with custom server
node server.js
```
- Same functionality, different startup method
- Useful for custom hosting configurations

## Production MySQL Deployment

For production use with MySQL database:

### Step 1: Install MySQL Server

1. **Download MySQL**:
   - Visit: https://dev.mysql.com/downloads/windows/
   - Download "MySQL Installer for Windows"
   - Run as Administrator

2. **Configure MySQL**:
   - Choose "Developer Default" setup type
   - Set root password when prompted
   - Start MySQL service after installation

3. **Create Database and User**:
   ```sql
   -- Run in MySQL Workbench or Command Prompt
   CREATE DATABASE clc_finance;
   CREATE USER 'clc_finance_user'@'localhost' IDENTIFIED BY 'secure_password_here';
   GRANT ALL PRIVILEGES ON clc_finance.* TO 'clc_finance_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Step 2: Configure Environment

Create `.env.local` file in project root:
```env
DATABASE_URL=mysql://clc_finance_user:secure_password_here@localhost:3306/clc_finance
```

### Step 3: Initialize and Start

```cmd
# Install dependencies
npm install

# Build application
npm run build

# Initialize MySQL database
call npm run populate-db

# Test database connection
call npx tsx test-mysql-connection.js

# Start server
call npm start
```

## Process Management with PM2

PM2 provides advanced process management, automatic restarts, and monitoring:

### Installation

```cmd
# Install PM2 globally (as Administrator)
npm install -g pm2
```

### Start Application with PM2

```cmd
# Start using PM2 configuration
pm2 start ecosystem.config.js

# Save current processes
pm2 save

# Configure PM2 to start on Windows boot
pm2-startup install

# Generate startup script
pm2-startup

# Start PM2 service
sc start PM2
```

### PM2 Management Commands

```cmd
# Check status
pm2 status

# View logs
pm2 logs clc-finance

# Restart application
pm2 restart clc-finance

# Stop application
pm2 stop clc-finance

# Monitor resources
pm2 monit

# Save current configuration
pm2 save
```

### Logs Management

PM2 automatically creates log files:
- `logs/combined.log` - All output
- `logs/err.log` - Error output
- `logs/out.log` - Standard output

```cmd
# View recent logs
pm2 logs clc-finance --lines 50

# Monitor logs in real-time
pm2 logs clc-finance --follow
```

## Windows Services Deployment

For running as a Windows Service (starts automatically):

### Using NSSM (Non-Sucking Service Manager)

1. **Download NSSM**:
   - Visit: https://nssm.cc/download
   - Download the latest win64 release

2. **Install NSSM**:
   ```cmd
   # Extract to a folder, e.g., C:\nssm
   ```

3. **Install as Service**:
   ```cmd
   # Run Command Prompt as Administrator
   cd C:\nssm\win64

   # Install CLC Finance service
   nssm install CLCFinance "C:\Program Files\nodejs\node.exe" server.js

   # Set working directory
   nssm set CLCFinance AppDirectory "C:\path\to\clc-finance"
   ```

4. **Configure Service**:
   ```cmd
   # Set log file location
   nssm set CLCFinance AppStdout "C:\path\to\clc-finance\logs\service.log"
   nssm set CLCFinance AppStderr "C:\path\to\clc-finance\logs\service-error.log"

   # Set restart options
   nssm set CLCFinance AppRestartDelay 5000
   ```

5. **Start Service**:
   ```cmd
   # Start the service
   sc start CLCFinance

   # Check status
   sc query CLCFinance
   ```

6. **Manage Service**:
   ```cmd
   # Stop service
   sc stop CLCFinance

   # Remove service
   sc delete CLCFinance
   ```

## IIS Deployment (Advanced)

For deployment behind IIS (Internet Information Services):

### Install IIS

1. **Enable IIS Windows Feature**:
   - Open "Turn Windows features on or off"
   - Check "Internet Information Services"
   - Install URL Rewrite and Application Request Routing

### Configure IIS

1. **Install IISNode**:
   ```cmd
   # Download from: https://github.com/Azure/iisnode
   # Run installer as Administrator
   ```

2. **Create IIS Site**:
   - Open IIS Manager
   - Add website pointing to your clc-finance directory
   - Set port to 8080 (or your preferred port)

3. **Configure web.config**:
   Your project includes a `web.config` file for IIS integration:
   ```xml
   <configuration>
     <system.webServer>
       <iisnode
         nodeProcessCommandLine="C:\Program Files\nodejs\node.exe"
         watchedFiles="*.js;*.json;web.config"
         loggingEnabled="true"
         logDirectory="C:\path\to\clc-finance\logs\iis"
         debugHeaderEnabled="false"/>
     </system.webServer>
   </configuration>
   ```

4. **Set Permissions**:
   ```cmd
   # Grant IIS_IUSRS permissions to project directory
   icacls "C:\path\to\clc-finance" /grant "IIS_IUSRS:(OI)(CI)F" /T
   ```

5. **Configure URL Rewrite** (for clean URLs):
   - Install URL Rewrite module
   - Configure rules to route all requests to server.js

## Firewall and Network Configuration

### Open Firewall Port

**Windows Firewall (GUI)**:
1. Search for "Windows Firewall"
2. Click "Advanced settings"
3. Create new inbound rule for port 3000 (or your configured port)

**Command Line**:
```cmd
# Open port 3000
netsh advfirewall firewall add rule name="CLC Finance" dir=in action=allow protocol=TCP localport=3000

# Check firewall status
netsh advfirewall show allprofiles
```

### Remote Access

For accessing from other machines:
1. Configure Windows Firewall to allow external connections
2. Ensure no antivirus blocking the port
3. Use Windows Event Viewer to check for connection logs

## Backup and Maintenance

### Database Backup (SQLite)

```cmd
# Create backup script (backup.bat)
@echo off
set BACKUP_DIR=C:\backups\clc-finance
set DATESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

# Stop application for clean backup (optional)
pm2 stop clc-finance || taskkill /F /IM node.exe

# Copy database
copy data\database.sqlite "%BACKUP_DIR%\database_%DATESTAMP%.sqlite"

# Backup environment files
copy .env.local "%BACKUP_DIR%\env_%DATESTAMP%.local"

# Restart application
pm2 start clc-finance

# Clean old backups (keep last 30)
forfiles /p %BACKUP_DIR% /s /m *.sqlite /d -30 /c "cmd /c del @path"
```

### Scheduling Backups

1. **Create backup task**:
   ```cmd
   # Create scheduled task
   schtasks /create /tn "CLC Finance Backup" /tr "cmd /c 'C:\path\to\clc-finance\backup.bat'" /sc daily /st 02:00
   ```

2. **Manage scheduled tasks**:
   ```cmd
   # List tasks
   schtasks /query

   # Delete task
   schtasks /delete /tn "CLC Finance Backup"
   ```

## Troubleshooting Windows Issues

### Common Issues

**1. Node.js Not Found**
```cmd
# Check PATH
where node

# Reinstall Node.js or add to PATH
setx PATH "%PATH%;C:\Program Files\nodejs\"
```

**2. Port Already in Use**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace XXXX with PID)
taskkill /PID XXXX /F
```

**3. Permission Errors**
```cmd
# Run Command Prompt as Administrator
# OR set proper permissions
icacls "C:\path\to\clc-finance" /grant "Users:(OI)(CI)F" /T
```

**4. Database Connection Failed**
```cmd
# For MySQL: Test connection
mysql -u clc_finance_user -p -e "SHOW DATABASES;"

# For SQLite: Check file
dir data\database.sqlite
```

**5. npm install Fails**
```cmd
# Clear npm cache
npm cache clean --force

# Install with verbose logging
npm install --verbose

# Check proxy settings
npm config get proxy
npm config delete proxy
npm config delete https-proxy
```

### Performance Issues

**Memory Usage**:
```cmd
# Monitor memory usage
tasklist /FI "MEMUSAGE gt 100000"

# Set memory limit for Node.js
set NODE_OPTIONS=--max-old-space-size=4096
pm2 restart clc-finance
```

**Disk Space**:
```cmd
# Check disk usage
wmic logicaldisk get size,freespace,caption

# Clean npm cache
npm cache clean --force

# Clean Windows temp files
cleanmgr /sagerun:1
```

### Logs Analysis

**Event Viewer**:
- Windows + R → `eventvwr`
- Check "Windows Logs" → "Application"
- Look for Node.js or CLC Finance related events

**Application Logs**:
```cmd
# PM2 logs
pm2 logs clc-finance

# Windows Event Logs
wevtutil qe Application /c:100 /rd:true /f:text | findstr "node"
```

### PowerShell Alternative Deployment

```powershell
# Install dependencies
npm install

# Build application
npm run build

# Populate database
npm run populate-db

# Start application
npm start
```

## Monitoring and Management

### Windows Task Manager
- Monitor CPU/Memory usage
- Active network connections
- Services status

### Performance Monitor
```cmd
# Open Performance Monitor
perfmon

# Add counters for Node.js processes
```

### Resource Monitor
```cmd
# Check network activity
resmon

# Monitor disk I/O for database operations
```

---

## Default Login Credentials

- **Admin User**: username: `admin`, password: `password`
- **Staff User**: username: `staff`, password: `password`

## Access Points

- **Local Access**: `http://localhost:3000`
- **Network Access**: `http://YOUR-IP:3000`
- **API Endpoints**: `http://localhost:3000/api/*`

## Support

For Windows-specific issues:
1. Check Event Viewer (Windows + R → `eventvwr`)
2. Verify Windows Firewall settings
3. Test database connections manually
4. Check User Account Control (UAC) settings

---

*This Windows deployment guide covers the most common deployment scenarios for Node.js server. For enterprise deployments or IIS integration, consider consulting with Windows system administrators.*
