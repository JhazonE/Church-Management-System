# Chromium/PWA Deployment Script for CLC Finance
# This builds the app for Chromium browser deployment

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLC Finance - Chromium Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Build the application for production
Write-Host "Building application for production..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✓ Application built successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Populate database
Write-Host "Setting up database..." -ForegroundColor Yellow
try {
    npm run populate-db
    Write-Host "✓ Database populated" -ForegroundColor Green
} catch {
    Write-Host "⚠ Database population had issues, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Create a simple HTTP server script for serving the app
$serverScript = @"
const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
const server = createServer(app);

// Serve static files from the Next.js build
app.use(express.static(path.join(__dirname, '.next', 'static')));
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '.next', 'server', 'app', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`CLC Finance running on http://localhost:\${PORT}`);
  console.log('Press Ctrl+C to stop the server');
  console.log('');
  console.log('Login Credentials:');
  console.log('  Admin: admin / password');
  console.log('  Staff: staff / password');
});
"@

$serverScript | Out-File -FilePath "chromium-server.js" -Encoding UTF8
Write-Host "✓ Created Chromium server script" -ForegroundColor Green

# Install express for serving (if not already installed)
Write-Host "Installing express server..." -ForegroundColor Yellow
try {
    npm install --save-dev express
    Write-Host "✓ Express installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not install express, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

  🎉 CHROMIUM DEPLOYMENT READY!

Your CLC Finance application has been built for Chromium deployment!

DEPLOYMENT OPTIONS:

1. Quick Start (Recommended):
   npm run chromium-serve

2. Manual Start:
   node chromium-server.js

3. Access in Browser:
   Open Chrome/Chromium and go to: http://localhost:3000

LOGIN CREDENTIALS:
Admin User: admin / password
Staff User: staff / password

PWA INSTALLATION:
1. Open http://localhost:3000 in Chrome/Chromium
2. Click the install icon in the address bar
3. Or go to Menu → Install CLC Finances
4. The app will install as a standalone PWA

FEATURES INCLUDED:
✓ Progressive Web App (PWA) support
✓ Offline-capable with service worker
✓ Installable on desktop/mobile
✓ SQLite database (local storage)
✓ All features work offline

TROUBLESHOOTING:
• If port 3000 is busy: PORT=3001 node chromium-server.js
• Clear browser cache if having issues
• Check browser console for errors

To stop the server: Ctrl+C
"@

Write-Host $instructions -ForegroundColor White

# Add npm script for easy starting
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.scripts.'chromium-serve') {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name 'chromium-serve' -Value 'node chromium-server.js'
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✓ Added 'npm run chromium-serve' script" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  🎉 CHROMIUM DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the Chromium server, run:" -ForegroundColor Cyan
Write-Host "  npm run chromium-serve" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open Chrome/Chromium and go to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin / password" -ForegroundColor Yellow
Write-Host "  Staff: staff / password" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to finish"
# Add npm script for easy starting
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.scripts.'chromium-serve') {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name 'chromium-serve' -Value 'node chromium-server.js'
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✓ Added 'npm run chromium-serve' script" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  🎉 CHROMIUM DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Quick Start (Recommended):" -ForegroundColor White
Write-Host "   npm run chromium-serve" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Manual Start:" -ForegroundColor White
Write-Host "   node chromium-server.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Access in Browser:" -ForegroundColor White
Write-Host "   Open Chrome/Chromium and go to: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "LOGIN CREDENTIALS:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "Admin User: admin / password" -ForegroundColor Yellow
Write-Host "Staff User: staff / password" -ForegroundColor Yellow
Write-Host ""
Write-Host "PWA INSTALLATION:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in Chrome/Chromium" -ForegroundColor White
Write-Host "2. Click the install icon in the address bar" -ForegroundColor White
Write-Host "3. Or go to Menu → Install CLC Finances" -ForegroundColor White
Write-Host "4. The app will install as a standalone PWA" -ForegroundColor White
Write-Host ""
Write-Host "FEATURES INCLUDED:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "✓ Progressive Web App (PWA) support" -ForegroundColor Green
Write-Host "✓ Offline-capable with service worker" -ForegroundColor Green
Write-Host "✓ Installable on desktop/mobile" -ForegroundColor Green
Write-Host "✓ SQLite database (local storage)" -ForegroundColor Green
Write-Host "✓ All features work offline" -ForegroundColor Green
Write-Host ""
Write-Host "TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "• If port 3000 is busy: PORT=3001 node chromium-server.js" -ForegroundColor White
Write-Host "• Clear browser cache if having issues" -ForegroundColor White
Write-Host "• Check browser console for errors" -ForegroundColor White
Write-Host ""
Write-Host "To stop the server: Ctrl+C" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Green
=========================================
  🎉 CHROMIUM DEPLOYMENT READY!
=========================================

Your CLC Finance application has been built for Chromium deployment!

DEPLOYMENT OPTIONS:
==================

1. Quick Start (Recommended):
   npm run chromium-serve

2. Manual Start:
   node chromium-server.js

3. Access in Browser:
   Open Chrome/Chromium and go to: http://localhost:3000

LOGIN CREDENTIALS:
=================
Admin User: admin / password
Staff User: staff / password

PWA INSTALLATION:
===============
1. Open http://localhost:3000 in Chrome/Chromium
2. Click the install icon in the address bar
3. Or go to Menu → Install CLC Finances
4. The app will install as a standalone PWA

FEATURES INCLUDED:
================
✓ Progressive Web App (PWA) support
✓ Offline-capable with service worker
✓ Installable on desktop/mobile
✓ SQLite database (local storage)
✓ All features work offline

TROUBLESHOOTING:
==============
• If port 3000 is busy: PORT=3001 node chromium-server.js
• Clear browser cache if having issues
• Check browser console for errors

To stop the server: Ctrl+C
=========================================
"@

Write-Host $instructions -ForegroundColor White

# Add npm script for easy starting
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.scripts.'chromium-serve') {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name 'chromium-serve' -Value 'node chromium-server.js'
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✓ Added 'npm run chromium-serve' script" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  🎉 CHROMIUM DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the Chromium server, run:" -ForegroundColor Cyan
Write-Host "  npm run chromium-serve" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open Chrome/Chromium and go to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin / password" -ForegroundColor Yellow
Write-Host "  Staff: staff / password" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to finish"
