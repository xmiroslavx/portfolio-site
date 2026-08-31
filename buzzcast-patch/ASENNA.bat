@echo off
title BuzzCast asennus
cd /d "%~dp0"

echo === BuzzCast v1.0 + hold-patch ===
echo.

if not exist "server.js" (
  echo Ladataan BuzzCast lahdekoodi...
  curl -L -o buzzcast-v1.0.zip "https://github.com/bacoinz/buzzcast/archive/refs/tags/v1.0.zip"
  if errorlevel 1 (
    echo VIRHE: lataus epaonnistui
    pause
    exit /b 1
  )
  echo Puretaan...
  tar -xf buzzcast-v1.0.zip
  if exist "buzzcast-1.0\server.js" (
    echo Siirretaan tiedostot tahan kansioon...
    xcopy /E /Y /I "buzzcast-1.0\*" "."
    rmdir /S /Q "buzzcast-1.0" 2>nul
    del buzzcast-v1.0.zip 2>nul
  ) else (
    echo VIRHE: purku epaonnistui. Kokeile purkaa buzzcast-1.0.zip kasin.
    pause
    exit /b 1
  )
)

if not exist "patch.js" (
  echo Ladataan patch.js...
  curl -L -o patch.js "https://raw.githubusercontent.com/xmiroslavx/portfolio-site/cursor/buzzcast-hold-patch-dedc/buzzcast-patch/patch.js"
)

echo Ajetaan patch...
node patch.js
if errorlevel 1 (
  echo VIRHE: patch epaonnistui
  pause
  exit /b 1
)

echo npm install...
call npm install
if errorlevel 1 (
  echo VIRHE: npm install epaonnistui
  pause
  exit /b 1
)

echo.
echo === VALMIS ===
echo Kaynnistetaan BuzzCast...
echo Sulje ikkuna lopettaaksesi.
echo.
node server.js
pause
