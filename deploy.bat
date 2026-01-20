@echo off
echo ========================================
echo   CLC Finance - Local Deployment
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

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

REM Build the application
echo Building application for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build application!
    echo Please check for any build errors above.
    pause
    exit /b 1
)
echo [OK] Application built successfully
echo.

REM Check for MySQL database configuration
echo Checking database configuration...

REM Create .env.local if it doesn't exist and switch to MySQL
if not exist ".env.local" (
    echo Creating .env.local for MySQL database...
    echo DATABASE_URL=mysql://clc_user:clc_password@localhost:3307/clc_finance> .env.local
    echo [OK] Created .env.local with MySQL configuration
) else (
    echo [OK] .env.local already exists
)

REM Test MySQL connection
echo Testing MySQL database connection...
call npx tsx test-mysql-connection.js
if errorlevel 1 (
    echo [WARNING] MySQL connection test failed
    echo Please ensure MySQL is installed and the database is accessible
    echo Continuing with setup...
) else (
    echo [OK] MySQL connection successful
)

REM Initialize MySQL database schema
echo Initializing MySQL database with schema and sample data...
call npx tsx scripts/migrate-to-mysql.js
if errorlevel 1 (
    echo [WARNING] MySQL initialization may have issues, but continuing...
)
echo [OK] Database setup complete
echo.

REM Setup auto-start on machine boot
echo Setting up auto-start when machine is turned on...
call powershell -ExecutionPolicy Bypass -File "setup-auto-start-no-admin.ps1"
if errorlevel 1 (
    echo [WARNING] Failed to create auto-start shortcut
    echo You can manually run 'setup-auto-start-no-admin.ps1' later
) else (
    echo [OK] Auto-start enabled - server will start automatically when machine boots
)
echo.

REM Start the application
echo ========================================
echo   🎉 CLC Finance is starting up!
echo ========================================
echo.
echo Application will be available at:
echo   http://localhost:3000
echo.
echo Login Credentials:
echo   Admin User: admin / password
echo   Staff User: staff / password
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start
