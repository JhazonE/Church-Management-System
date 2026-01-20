# CLC Finance - Local Deployment Guide

## 🚀 Quick Start

### Option 1: One-Click Deployment (Windows)
```bash
# Double-click this file or run in command prompt:
deploy.bat
```

### Option 2: Manual Deployment
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Populate database with sample data
npm run populate-db

# Start the application
npm start
```

## 📋 Prerequisites

- **Node.js** 18+ (Download: https://nodejs.org/)
- **Windows/Linux/macOS** operating system

## 🔧 Deployment Options

### 1. Development Mode (Recommended for testing)
```bash
npm run dev
```
- Access at: `http://localhost:9002`
- Hot reload enabled
- SQLite database

### 2. Production Mode
```bash
npm run build
npm start
```
- Access at: `http://localhost:3000`
- Optimized for production
- SQLite database

### 3. Electron Desktop App
```bash
npm run electron-dev
```
- Desktop application
- SQLite database
- Cross-platform

### 4. Docker Deployment
```bash
docker-compose up -d
```
- PostgreSQL database
- Containerized deployment
- Requires Docker

## 🔐 Login Credentials

### Admin User
- **Username**: `admin`
- **Password**: `password`
- **Permissions**: Full access to all features

### Staff User
- **Username**: `staff`
- **Password**: `password`
- **Permissions**: Limited access (no user management)

## 📁 Project Structure

```
CLC_finance/
├── src/                    # Application source code
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/              # Utilities and database
│   └── types.ts          # TypeScript definitions
├── database.sqlite       # SQLite database (auto-created)
├── deploy.bat           # Windows deployment script
├── ecosystem.config.js  # PM2 configuration
├── Dockerfile          # Docker configuration
└── docker-compose.yml  # Docker Compose setup
```

## 🗄️ Database

- **Type**: SQLite (local file-based)
- **Location**: `database.sqlite`
- **Auto-created**: Yes
- **Sample data**: Loaded via `npm run populate-db`

## 🌐 Access Points

- **Web Application**: `http://localhost:3000` (production)
- **Development**: `http://localhost:9002` (development)
- **API Endpoints**: `/api/*` routes
- **Health Check**: `/api/health`

## 🔄 Data Management

### Populate Sample Data
```bash
npm run populate-db
```

### Backup Data
- Use the in-app backup feature
- Or copy `database.sqlite` file

### Reset Data
- Use the in-app reset feature
- Or delete `database.sqlite` and run `npm run populate-db`

## 🛠️ Troubleshooting

### Application Won't Start
1. Check Node.js version: `node --version`
2. Clear cache: `npm run build` (force rebuild)
3. Check port availability: `netstat -ano | findstr :3000`

### Database Issues
1. Delete `database.sqlite`
2. Run `npm run populate-db`
3. Restart application

### Port Conflicts
- Change port in `package.json` or use:
```bash
PORT=3001 npm start
```

## 📊 Features Included

- ✅ **Dashboard** with financial overview
- ✅ **Members** management system
- ✅ **Events** scheduling
- ✅ **Donations** tracking
- ✅ **Expenses** management
- ✅ **Financial Reports** and analytics
- ✅ **User Management** (Admin only)
- ✅ **Data Backup/Restore**
- ✅ **System Reset** functionality

## 🔒 Security Notes

- Default passwords should be changed in production
- SQLite database is suitable for single-user applications
- For multi-user/production use, consider PostgreSQL migration

## 📞 Support

If you encounter issues:
1. Check the logs in `logs/` directory (if using PM2)
2. Verify Node.js and npm versions
3. Ensure all dependencies are installed
4. Check database file permissions

---

**🎉 Your CLC Finance application is now ready for local deployment!**
