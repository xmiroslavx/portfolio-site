@echo off
title BuzzCast
cd /d "C:\Users\mirko\Downloads\buzzcast-1.0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (-not (Test-Path node_modules)) { npm install }; node server.js"
pause
