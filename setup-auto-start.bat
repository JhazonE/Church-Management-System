@echo off
echo Setting up CLC Finance auto-start on machine boot...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator.
) else (
    echo Please run this script as Administrator.
    echo Right-click the batch file and select "Run as administrator"
    pause
    exit /b 1
)

echo Installing PM2 globally (if not already installed)...
npm install -g pm2
if %errorlevel% neq 0 (
    echo Failed to install PM2. Please check Node.js installation.
    pause
    exit /b 1
)

echo.
echo Starting CLC Finance with PM2...
pm2 start ecosystem.config.js
pm2 save

echo.
echo Setting up Windows auto-start service...
pm2-startup install
if %errorlevel% neq 0 (
    echo PM2 startup install failed. Trying alternative method...
)

pm2-startup
sc start PM2

echo.
echo Checking PM2 service status...
sc query PM2

echo.
echo CLC Finance auto-start setup completed!
echo The server will now start automatically when the machine boots.
echo.
echo You can check status with: pm2 status
echo View logs with: pm2 logs clc-finance
echo.
pause
