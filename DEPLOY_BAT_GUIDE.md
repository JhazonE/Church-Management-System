# CLC Finance - Windows One-Click Deployment Guide (deploy.bat)

This guide explains how to use the `deploy.bat` script for quick deployment of CLC Finance on Windows using Node.js server and MySQL database.

## 🚀 Quick Start

### Prerequisites

Before running `deploy.bat`, ensure you have:

1. **Node.js 18+** installed ([download here](https://nodejs.org/))
2. **MySQL Server** installed and running
3. The CLC Finance project files extracted/copied to your Windows machine

### MySQL Setup (Required)

The script expects MySQL to be configured with these credentials:

```sql
-- Run in MySQL Workbench or MySQL Command Line Client:
CREATE DATABASE clc_finance;
CREATE USER 'clc_finance'@'localhost' IDENTIFIED BY '123700';
GRANT ALL PRIVILEGES ON clc_finance.* TO 'clc_finance'@'localhost';
FLUSH PRIVILEGES;
```

## 📁 How to Deploy

### Step 1: Run the Deployment Script

**Option A: Double-click**
- Navigate to your CLC Finance project folder
- Double-click `deploy.bat`

**Option B: Command Prompt**
```cmd
cd C:\path\to\clc-finance
deploy.bat
```

### Step 2: Watch the Automated Process

The script will automatically:

```
========================================
  CLC Finance - Local Deployment
========================================

Checking Node.js installation...
[OK] Node.js is installed

Checking npm installation...
[OK] npm is available

Installing dependencies...
[OK] Dependencies installed

Building application for production...
[OK] Application built successfully

Checking database configuration...
Creating .env.local for MySQL database...
[OK] Created .env.local with MySQL configuration

Testing MySQL database connection...
[OK] MySQL connection successful

Initializing MySQL database with schema and sample data...
[OK] Database setup complete

========================================
  🎉 CLC Finance is starting up!
========================================

Application will be available at:
http://localhost:3000

Login Credentials:
Admin User: admin / password
Staff User: staff / password

Press Ctrl+C to stop the server
========================================
```

### Step 3: Access the Application

- **URL**: http://localhost:3000
- **Admin Login**:
  - Username: `admin`
  - Password: `password`
- **Staff Login**:
  - Username: `staff`
  - Password: `password`

## ⚙️ What deploy.bat Does

### 1. Environment Checks
- ✅ Verifies Node.js 18+ installation
- ✅ Confirms npm availability
- ❌ Stops deployment if Node.js is missing

### 2. Dependency Installation
- ✅ Installs all npm packages if `node_modules` doesn't exist
- ✅ Skips if already installed
- ❌ Stops if installation fails

### 3. Application Build
- ✅ Builds production version with `npm run build`
- ❌ Stops if build fails

### 4. Database Configuration
- ✅ Creates `.env.local` with MySQL settings if missing
- ✅ Tests MySQL database connection
- ⚠️ Warns if connection test fails but continues

### 5. Database Initialization
- ✅ Runs MySQL schema creation and data population
- ✅ Uses `scripts/migrate-to-mysql.js` for setup
- ⚠️ Warns if migration issues occur but continues

### 6. Server Startup
- ✅ Starts Node.js server on port 3000
- ✅ Application ready for access

## 🔧 Configuration

### Default MySQL Settings
```env
# Created automatically in .env.local
DATABASE_URL=mysql://clc_finance:123700@localhost:3306/clc_finance
```

### Changing Database Settings
If you need different MySQL credentials:

1. **Before running** `deploy.bat`:
   - Create `.env.local` manually
   - Set your DATABASE_URL

2. **Or after deployment**:
   - Edit `.env.local`
   - Restart the application

### Custom Port
To change the default port (3000):
```cmd
set PORT=8080
npm start
```

## 🛠️ Troubleshooting

### Common Issues

**"Node.js is not installed"**
- Download and install Node.js 18+ from nodejs.org
- Restart Command Prompt and try again

**"npm is not available"**
- npm is included with Node.js - reinstall Node.js

**"Dependencies installation failed"**
- Check internet connection
- Run: `npm cache clean --force`
- Try again

**"MySQL connection test failed"**
- Ensure MySQL server is running
- Check that database and user exist
- Verify password is "123700"
- Consult `NODEJS_MYSQL_DEPLOYMENT.md` for detailed MySQL setup

**"Database setup complete" warning**
- Check MySQL user permissions
- Verify database is accessible
- Review error messages above

**Application doesn't start**
- Check if port 3000 is already in use
- Review error messages
- Check firewall settings

### Manual Fixes

**Test MySQL connection:**
```cmd
npx tsx test-mysql-connection.js
```

**Manual database setup:**
```cmd
npx tsx scripts/migrate-to-mysql.js
```

**Start without deploy.bat:**
```cmd
npm install
npm run build
npm start
```

**Check logs:**
```cmd
# PM2 logs if using PM2
pm2 logs clc-finance

# Direct server logs
# Check console output
```

## 📊 Post-Deployment

### Application Management
```cmd
# Basic management (after first deployment)
npm start       # Start server
Ctrl+C          # Stop server

# Production management with PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs clc-finance
```

### Database Access
```cmd
# Direct MySQL access
mysql -u clc_finance -p clc_finance

# Check tables
SHOW TABLES;

# View data
SELECT * FROM users LIMIT 5;
```

### File Locations
- **Application**: `C:\path\to\clc-finance\`
- **Database**: MySQL server (external)
- **Config**: `.env.local`
- **Logs**: `logs\` directory (if using PM2)

## 🔒 Security Notes

- **Change default passwords** after first login
- **Database connection** uses localhost - ensure MySQL is secured if needed
- **Firewall**: Allow port 3000 in Windows Firewall
- **Environment file**: `.env.local` contains database credentials

## 📞 Support

If deployment fails:
1. Check error messages in Command Prompt
2. Verify MySQL is running and accessible
3. Confirm Node.js version: `node --version`
4. Review firewall settings for port 3000
5. Check Windows Event Viewer for system errors

For detailed troubleshooting, see:
- `WINDOWS_DEPLOYMENT.md` - Complete Windows deployment guide
- `NODEJS_MYSQL_DEPLOYMENT.md` - MySQL-specific deployment guide

---

**🎯 deploy.bat provides the fastest way to get CLC Finance running on Windows with MySQL database!**
