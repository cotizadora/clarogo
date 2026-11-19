@echo off
setlocal
title GoExt
rem GoExt, la extension de ClaroGo! (herramienta no oficial): la instala o la actualiza.
rem 1. Baja la version mas nueva y reemplaza todo en Documentos\ClaroGo\extension.
rem 2. Deja en el escritorio el acceso "Actualizar GoExt", que siempre baja este mismo instalador al dia.
rem No necesita permisos de administrador ni pide claves.

set "BASE=%USERPROFILE%\Documents\ClaroGo"
set "DEST=%BASE%\extension"
set "ZIP=%TEMP%\clarogo-extension.zip"
set "WEB=https://cotizadora.github.io/clarogo/ext"

echo.
echo   GoExt: descargando la version mas nueva...

curl.exe -fsSL "%WEB%/clarogo-genesys-extension.zip?v=%RANDOM%%RANDOM%" -o "%ZIP%"
if errorlevel 1 goto error

rem Se descomprime aparte y solo si viene completa reemplaza la carpeta (si falla, la extension anterior queda intacta)
set "NUEVO=%TEMP%\clarogo-extension-nueva"
if exist "%NUEVO%" rmdir /s /q "%NUEVO%"
mkdir "%NUEVO%" 2>nul
tar -xf "%ZIP%" -C "%NUEVO%" 2>nul
if errorlevel 1 powershell -NoProfile -Command "Expand-Archive -Force -LiteralPath '%ZIP%' -DestinationPath '%NUEVO%'"
del /q "%ZIP%" 2>nul
if not exist "%NUEVO%\manifest.json" goto error
if not exist "%NUEVO%\fondo.js" goto error
robocopy "%NUEVO%" "%DEST%" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto error
rmdir /s /q "%NUEVO%" 2>nul
if not exist "%DEST%\manifest.json" goto error

rem Actualizador local: baja siempre el instalador mas nuevo y lo ejecuta
set "ACT=%BASE%\actualizar-clarogo.bat"
echo @echo off> "%ACT%"
echo title GoExt>> "%ACT%"
echo curl.exe -fsSL "%WEB%/instalar-clarogo.bat?v=%%RANDOM%%%%RANDOM%%" -o "%%TEMP%%\instalar-clarogo.bat">> "%ACT%"
echo if errorlevel 1 goto sinred>> "%ACT%"
echo call "%%TEMP%%\instalar-clarogo.bat" ^& exit /b>> "%ACT%"
echo :sinred>> "%ACT%"
echo echo.>> "%ACT%"
echo echo   No se pudo conectar. Revisa tu internet y vuelve a intentarlo.>> "%ACT%"
echo timeout /t 8 ^>nul>> "%ACT%"

rem Enlace goext:// solo para este usuario (no necesita administrador): GoExt lo usa para actualizarse con un clic
reg add "HKCU\Software\Classes\goext" /ve /d "URL:GoExt" /f >nul 2>&1
reg add "HKCU\Software\Classes\goext" /v "URL Protocol" /d "" /f >nul 2>&1
reg add "HKCU\Software\Classes\goext\shell\open\command" /ve /d "\"%SystemRoot%\System32\cmd.exe\" /c \"%ACT%\"" /f >nul 2>&1

rem Acceso directo en el escritorio (tambien si el escritorio esta en OneDrive)
rem Se borra el acceso antiguo "Actualizar ClaroGo!" para que no queden dos
powershell -NoProfile -Command "$e=[Environment]::GetFolderPath('Desktop');Remove-Item (Join-Path $e 'Actualizar ClaroGo!.lnk') -ErrorAction SilentlyContinue;$s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $e 'Actualizar GoExt.lnk'));$s.TargetPath='%ACT%';$s.WorkingDirectory='%BASE%';$s.IconLocation='%SystemRoot%\System32\shell32.dll,238';$s.Description='Actualiza GoExt, la extension de ClaroGo!';$s.Save()" 2>nul

set "VER="
for /f "tokens=2 delims=:, " %%V in ('findstr /c:"\"version\"" "%DEST%\manifest.json"') do set "VER=%%~V"
echo|set /p="%DEST%"|clip

echo.
echo   LISTO: GoExt version %VER%
echo.
echo   En tu escritorio quedo el acceso "Actualizar GoExt".
echo   Primera vez: sigue el paso 2 de la pagina de instalacion.
echo   Si ya la tenias: en el icono de GoExt presiona "Activar version nueva".
timeout /t 6 >nul
exit /b 0

:error
echo.
echo   No se pudo descargar. Revisa tu internet y vuelve a intentarlo.
timeout /t 8 >nul
exit /b 1
