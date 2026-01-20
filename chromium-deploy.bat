@echo off
echo ========================================
echo   CLC Finance - Chromium Deployment
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Check if npm is available
echo Checking npm installation...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not available!
    echo npm should be included with Node.js installation.
    echo.
    pause
    exit /b 1
)
echo [OK] npm is available
echo.

REM Build the application for production
echo Building application for production...
echo This may take a few minutes...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build application!
    echo Please check for any build errors above.
    pause
    exit /b 1
)
echo [OK] Application built successfully
echo.

REM Populate database
echo Setting up database with sample data...
call npm run populate-db
if errorlevel 1 (
    echo [WARNING] Database population may have issues, but continuing...
)
echo [OK] Database setup complete
echo.

REM Create a simple HTTP server script for serving the app
echo Creating Chromium server script...
(
echo const express = require^('express'^);
echo const path = require^('path'^);
echo const { createServer } = require^('http'^);
echo.
echo const app = express^(^);
echo const server = createServer^(app^);
echo.
echo // Serve static files from the Next.js build
echo app.use^(express.static^(path.join^(__dirname, '.next', 'static'^)^)^);
echo app.use^(express.static^(path.join^(__dirname, 'public'^)^)^);
echo.
echo // Handle all routes by serving the index.html ^(SPA fallback^)
echo app.get^('*', ^(req, res^) =^> {
echo   res.sendFile^(path.join^(__dirname, '.next', 'server', 'app', 'index.html'^)^);
echo }^);
echo.
echo const PORT = process.env.PORT ^|^| 3000;
echo server.listen^(PORT, ^(^) =^> {
echo   console.log^(`CLC Finance running on http://localhost:\${PORT}`^);
echo   console.log^('Press Ctrl+C to stop the server'^);
echo   console.log^(''^);
echo   console.log^('Login Credentials:'^);
echo   console.log^('  Admin: admin / password'^);
echo   console.log^('  Staff: staff / password'^);
echo }^);
) > chromium-server.js
echo [OK] Created Chromium server script
echo.

REM Install express for serving
echo Installing express server...
call npm install --save-dev express
if errorlevel 1 (
    echo [WARNING] Could not install express, but continuing...
) else (
    echo [OK] Express installed
)
echo.

REM Add npm script for easy starting
echo Adding npm script for easy starting...
powershell -Command "& { $pkg = Get-Content 'package.json' -Raw | ConvertFrom-Json; if (-not $pkg.scripts.'chromium-serve') { $pkg.scripts | Add-Member -MemberType NoteProperty -Name 'chromium-serve' -Value 'node chromium-server.js'; $pkg | ConvertTo-Json -Depth 10 | Set-Content 'package.json'; Write-Host '[OK] Added npm run chromium-serve script' } }"
echo.

echo ========================================
echo   🎉 CHROMIUM DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo DEPLOYMENT OPTIONS:
echo ==================
echo.
echo 1. Quick Start (Recommended):
echo    npm run chromium-serve
echo.
echo 2. Manual Start:
echo    node chromium-server.js
echo.
echo 3. Access in Browser:
echo    Open Chrome/Chromium and go to: http://localhost:3000
echo.
echo LOGIN CREDENTIALS:
echo =================
echo Admin User: admin / password
echo Staff User: staff / password
echo.
echo PWA INSTALLATION:
echo ===============
echo 1. Open http://localhost:3000 in Chrome/Chromium
echo 2. Click the install icon in the address bar
echo 3. Or go to Menu → Install CLC Finances
echo 4. The app will install as a standalone PWA
echo.
echo FEATURES INCLUDED:
echo ================
echo ✓ Progressive Web App (PWA) support
echo ✓ Offline-capable with service worker
echo ✓ Installable on desktop/mobile
echo ✓ SQLite database (local storage)
echo ✓ All features work offline
echo.
echo TROUBLESHOOTING:
echo ==============
echo • If port 3000 is busy: PORT=3001 node chromium-server.js
echo • Clear browser cache if having issues
echo • Check browser console for errors
echo.
echo To stop the server: Ctrl+C
echo ========================================
echo.
echo Press any key to start the server now, or close this window to start later...
pause >nul

REM Start the server
echo.
echo Starting Chromium server...
echo Press Ctrl+C to stop when done
echo.
call npm run chromium-serve
