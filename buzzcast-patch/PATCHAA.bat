@echo off
title BuzzCast patch
cd /d "%~dp0"
node patch.js
if errorlevel 1 pause & exit /b 1
call npm install
echo.
echo Valmis! Kaynnista: node server.js
pause
