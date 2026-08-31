@echo off
title BuzzCast asennus
set "TARGET=C:\Users\mirko\Downloads\buzzcast-1.0"
cd /d "%TARGET%"

echo === BuzzCast v1.0 + hold-patch ===
echo Kansio: %TARGET%
echo.

echo [1/5] Ladataan koko lahdekoodi GitHubista...
curl -L -o "%TEMP%\buzzcast-v1.0.zip" "https://github.com/bacoinz/buzzcast/archive/refs/tags/v1.0.zip"
if errorlevel 1 goto :fail

echo [2/5] Puretaan...
mkdir "%TEMP%\buzzcast-src" 2>nul
tar -xf "%TEMP%\buzzcast-v1.0.zip" -C "%TEMP%\buzzcast-src"
if not exist "%TEMP%\buzzcast-src\buzzcast-1.0\config.js" goto :fail

echo [3/5] Kopioidaan puuttuvat tiedostot...
xcopy /E /Y /I "%TEMP%\buzzcast-src\buzzcast-1.0\*" "%TARGET%\"
if errorlevel 1 goto :fail

echo [4/5] Ladataan patch.js...
curl -L -o "%TARGET%\patch.js" "https://raw.githubusercontent.com/xmiroslavx/portfolio-site/cursor/buzzcast-hold-patch-dedc/buzzcast-patch/patch.js"

echo [5/5] Ajetaan patch + npm install...
cd /d "%TARGET%"
node patch.js
if errorlevel 1 goto :fail
call npm install
if errorlevel 1 goto :fail

echo.
echo === VALMIS ===
echo Kaynnistetaan BuzzCast...
echo ALa sulje tata ikkunaa pelin aikana!
echo.
node server.js
goto :end

:fail
echo.
echo VIRHE asennuksessa. Tarkista internetyhteys.
pause
exit /b 1

:end
pause
