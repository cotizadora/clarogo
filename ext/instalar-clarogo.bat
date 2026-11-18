@echo off
setlocal
title ClaroGo! Genesys
rem ClaroGo! Genesys (herramienta no oficial): instala o actualiza la extension.
rem Siempre en Documentos\ClaroGo\extension y reemplazando todos los archivos.
rem No necesita permisos de administrador ni pide claves.

set "DEST=%USERPROFILE%\Documents\ClaroGo\extension"
set "ZIP=%TEMP%\clarogo-extension.zip"

echo.
echo   ClaroGo! Genesys: instalando...

curl.exe -fsSL "https://cotizadora.github.io/clarogo/ext/clarogo-genesys-extension.zip?v=%RANDOM%%RANDOM%" -o "%ZIP%"
if errorlevel 1 goto error

if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%" 2>nul
tar -xf "%ZIP%" -C "%DEST%" 2>nul
if errorlevel 1 powershell -NoProfile -Command "Expand-Archive -Force -LiteralPath '%ZIP%' -DestinationPath '%DEST%'"
del /q "%ZIP%" 2>nul
if not exist "%DEST%\manifest.json" goto error

set "VER="
for /f "tokens=2 delims=:, " %%V in ('findstr /c:"\"version\"" "%DEST%\manifest.json"') do set "VER=%%~V"
echo|set /p="%DEST%"|clip

echo   Listo: version %VER% instalada en
echo   %DEST%
echo   (la ruta quedo copiada)
timeout /t 4 >nul
exit /b 0

:error
echo.
echo   No se pudo descargar. Revisa tu internet y vuelve a abrir este archivo.
timeout /t 8 >nul
exit /b 1
