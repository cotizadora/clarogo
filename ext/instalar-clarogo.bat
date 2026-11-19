@echo off
setlocal
title GoExt
rem GoExt, la extension de ClaroGo! (herramienta no oficial): la instala o la actualiza.
rem 1. Baja la version mas nueva y reemplaza todo en Documentos\ClaroGo\extension.
rem 2. Deja en el escritorio el acceso "Actualizar GoExt", que siempre baja este mismo instalador al dia.
rem 3. Programa en Windows la tarea "GoExt actualizar": cada 2 horas, sin abrir ventanas, baja la version nueva.
rem    Con "/silencioso" (asi la llama la tarea) no muestra mensajes, no copia nada ni crea accesos.
rem No necesita permisos de administrador ni pide claves.

set "SIL="
if /i "%~1"=="/silencioso" set "SIL=1"
set "BASE=%USERPROFILE%\Documents\ClaroGo"
set "TAREA=GoExt actualizar"
rem Solo para pruebas: otra carpeta y otra tarea, sin tocar la instalacion real
if defined GOEXT_BASE set "BASE=%GOEXT_BASE%"
if defined GOEXT_BASE set "TAREA=GoExt actualizar (prueba)"
set "DEST=%BASE%\extension"
set "ZIP=%TEMP%\clarogo-extension-%RANDOM%.zip"
set "WEB=https://cotizadora.github.io/clarogo/ext"

if not defined SIL echo.
if not defined SIL echo   GoExt: descargando la version mas nueva...

curl.exe -fsSL "%WEB%/clarogo-genesys-extension.zip?v=%RANDOM%%RANDOM%" -o "%ZIP%"
if errorlevel 1 goto error

rem Se descomprime aparte y solo si viene completa reemplaza la carpeta (si falla, la extension anterior queda intacta)
set "NUEVO=%TEMP%\clarogo-extension-nueva-%RANDOM%"
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

rem Actualizador local: baja siempre el instalador mas nuevo y lo ejecuta (pasa "/silencioso" si viene de la tarea)
set "ACT=%BASE%\actualizar-clarogo.bat"
echo @echo off> "%ACT%"
echo title GoExt>> "%ACT%"
echo curl.exe -fsSL "%WEB%/instalar-clarogo.bat?v=%%RANDOM%%%%RANDOM%%" -o "%%TEMP%%\instalar-clarogo.bat">> "%ACT%"
echo if errorlevel 1 goto sinred>> "%ACT%"
echo call "%%TEMP%%\instalar-clarogo.bat" %%* ^& exit /b>> "%ACT%"
echo :sinred>> "%ACT%"
echo if /i "%%~1"=="/silencioso" exit /b 1>> "%ACT%"
echo echo.>> "%ACT%"
echo echo   No se pudo conectar. Revisa tu internet y vuelve a intentarlo.>> "%ACT%"
echo timeout /t 8 ^>nul>> "%ACT%"

if defined SIL goto fin

rem Lanzador silencioso para la tarea programada (corre el actualizador sin abrir ninguna ventana)
set "VBS=%BASE%\goext-silencioso.vbs"
echo CreateObject("WScript.Shell").Run """%ACT%"" /silencioso", 0, False> "%VBS%"

rem Tarea de Windows del usuario (no necesita administrador): cada 2 horas deja la version nueva en la carpeta.
rem Al abrir el navegador GoExt parte con ella; si ya estaba abierto, GoExt avisa "clic para activarla".
schtasks /create /tn "%TAREA%" /tr "wscript.exe \"%VBS%\"" /sc hourly /mo 2 /f >nul 2>&1

rem Enlace goext:// solo para este usuario (no necesita administrador): GoExt lo usa para actualizarse con un clic
reg add "HKCU\Software\Classes\goext" /ve /d "URL:GoExt" /f >nul 2>&1
reg add "HKCU\Software\Classes\goext" /v "URL Protocol" /d "" /f >nul 2>&1
reg add "HKCU\Software\Classes\goext\shell\open\command" /ve /d "\"%SystemRoot%\System32\cmd.exe\" /c \"%ACT%\"" /f >nul 2>&1

rem Acceso directo en el escritorio (tambien si el escritorio esta en OneDrive)
rem Se borra el acceso antiguo "Actualizar ClaroGo!" para que no queden dos
if not defined GOEXT_BASE powershell -NoProfile -Command "$e=[Environment]::GetFolderPath('Desktop');Remove-Item (Join-Path $e 'Actualizar ClaroGo!.lnk') -ErrorAction SilentlyContinue;$s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $e 'Actualizar GoExt.lnk'));$s.TargetPath='%ACT%';$s.WorkingDirectory='%BASE%';$s.IconLocation='%SystemRoot%\System32\shell32.dll,238';$s.Description='Actualiza GoExt, la extension de ClaroGo!';$s.Save()" 2>nul

set "VER="
for /f "tokens=2 delims=:, " %%V in ('findstr /c:"\"version\"" "%DEST%\manifest.json"') do set "VER=%%~V"
echo|set /p="%DEST%"|clip

echo.
echo   LISTO: GoExt version %VER%
echo.
echo   En tu escritorio quedo el acceso "Actualizar GoExt".
echo   Desde ahora GoExt se actualiza sola cada 2 horas.
echo   Primera vez: sigue el paso 2 de la pagina de instalacion.
echo   Si ya la tenias: en el icono de GoExt presiona "Activar version nueva".
timeout /t 6 >nul
:fin
exit /b 0

:error
if defined SIL exit /b 1
echo.
echo   No se pudo descargar. Revisa tu internet y vuelve a intentarlo.
timeout /t 8 >nul
exit /b 1
