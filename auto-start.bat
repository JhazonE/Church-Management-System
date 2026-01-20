@echo off
echo Starting CLC Finance Node.js server automatically...
cd /d "D:\BHAGOH PROJECT\CLC_finance"
echo Current directory: %CD%

REM Start with PM2 if available, otherwise use npm start
npx pm2 resurrect >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo PM2 process restored successfully
) else (
    echo PM2 not available, starting with npm...
    npm start
)

echo CLC Finance server auto-start completed.
pause
