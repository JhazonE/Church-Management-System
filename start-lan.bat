@echo off
echo Starting CLC Finance on Local Network...
echo.
echo ===============================================================
echo  Make sure you have allowed Node.js through your Windows Firewall!
echo  To access from other devices, use your Computer's IP Address.
echo ===============================================================
echo.
echo IP Configuration:
ipconfig | findstr /i "ipv4"
echo.
echo Starting server on http://0.0.0.0:3000
echo.
npm run start -- -H 0.0.0.0
pause
