@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ==============================================
echo   parkSafe - Running Automated Unit Tests
echo ==============================================
node --test test/parking.test.js
pause
