@echo off
echo ========================================
echo  CLC Finance - Electron Build Script
echo ========================================
echo.

echo Step 1: Building Next.js application...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Next.js build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Step 2: Building Electron application...
echo.
call npm run build-electron-win
if %errorlevel% neq 0 (
    echo ERROR: Electron build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo  Build Complete!
echo ========================================
echo.
echo Your installer is located at:
echo dist-electron-new\CLC Finance Setup X.X.X.exe
echo.
echo Opening output directory...
start "" "%~dp0dist-electron-new"
echo.
pause
