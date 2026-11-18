@echo off
setlocal
title ClaroGo! Genesys
rem ClaroGo! Genesys (herramienta no oficial): instala o actualiza la extension.
rem 1. Baja la version mas nueva y reemplaza todo en Documentos\ClaroGo\extension.
rem 2. Deja en el escritorio el acceso "Actualizar ClaroGo!", que siempre baja este mismo instalador al dia.
rem No necesita permisos de administrador ni pide claves.

set "BASE=%USERPROFILE%\Documents\ClaroGo"
set "DEST=%BASE%\extension"
set "ZIP=%TEMP%\clarogo-extension.zip"
set "WEB=https://cotizadora.github.io/clarogo/ext"

echo.
echo   ClaroGo! Genesys: descargando la version mas nueva...

curl.exe -fsSL "%WEB%/clarogo-genesys-extension.zip?v=%RANDOM%%RANDOM%" -o "%ZIP%"
if errorlevel 1 goto error

if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%" 2>nul
tar -xf "%ZIP%" -C "%DEST%" 2>nul
if errorlevel 1 powershell -NoProfile -Command "Expand-Archive -Force -LiteralPath '%ZIP%' -DestinationPath '%DEST%'"
del /q "%ZIP%" 2>nul
if not exist "%DEST%\manifest.json" goto error

rem Actualizador local: baja siempre el instalador mas nuevo y lo ejecuta
set "ACT=%BASE%\actualizar-clarogo.bat"
echo @echo off> "%ACT%"
echo title ClaroGo! Genesys>> "%ACT%"
echo curl.exe -fsSL "%WEB%/instalar-clarogo.bat?v=%%RANDOM%%%%RANDOM%%" -o "%%TEMP%%\instalar-clarogo.bat">> "%ACT%"
echo if errorlevel 1 goto sinred>> "%ACT%"
echo call "%%TEMP%%\instalar-clarogo.bat" ^& exit /b>> "%ACT%"
echo :sinred>> "%ACT%"
echo echo.>> "%ACT%"
echo echo   No se pudo conectar. Revisa tu internet y vuelve a intentarlo.>> "%ACT%"
echo timeout /t 8 ^>nul>> "%ACT%"

rem Acceso directo en el escritorio (tambien si el escritorio esta en OneDrive)
powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\Actualizar ClaroGo!.lnk');$s.TargetPath='%ACT%';$s.WorkingDirectory='%BASE%';$s.IconLocation='%SystemRoot%\System32\shell32.dll,238';$s.Description='Actualiza la extension ClaroGo! Genesys';$s.Save()" 2>nul

set "VER="
for /f "tokens=2 delims=:, " %%V in ('findstr /c:"\"version\"" "%DEST%\manifest.json"') do set "VER=%%~V"
echo|set /p="%DEST%"|clip

echo.
echo   LISTO: ClaroGo! version %VER%
echo.
echo   En tu escritorio quedo el acceso "Actualizar ClaroGo!".
echo   Primera vez: sigue el paso 2 de la pagina de instalacion.
echo   Si ya la tenias: en el icono de ClaroGo! presiona "Activar version nueva".
timeout /t 6 >nul
exit /b 0

:error
echo.
echo   No se pudo descargar. Revisa tu internet y vuelve a intentarlo.
timeout /t 8 >nul
exit /b 1
