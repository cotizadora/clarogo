@echo off
setlocal EnableExtensions EnableDelayedExpansion
title ClaroGo^^! Genesys - instalar o actualizar
color 0F

rem ClaroGo! Genesys: instala o actualiza la extension.
rem Descarga los archivos desde https://cotizadora.github.io/clarogo y los deja siempre en la misma carpeta.
rem No pide claves ni datos personales. Herramienta no oficial.

set "DEST=%USERPROFILE%\Documents\ClaroGo\extension"
set "BASE=https://cotizadora.github.io/clarogo"
set "LISTA=%TEMP%\clarogo-archivos.txt"

echo.
echo  ==========================================================
echo     ClaroGo^^! Genesys   -   instalar o actualizar
echo  ==========================================================
echo.
echo  Carpeta de la extension:
echo     %DEST%
echo.

where curl.exe >nul 2>&1
if errorlevel 1 (
  echo  [X] Este computador no tiene curl. Usa Windows 10 o 11 actualizado.
  goto fin
)

if not exist "%DEST%" (
  mkdir "%DEST%"
  if errorlevel 1 ( echo  [X] No pude crear la carpeta. & goto fin )
  echo  [+] Carpeta creada.
)

echo  [ ] Buscando la lista de archivos...
curl.exe -fsSL "%BASE%/ext/extension-archivos.txt?v=%RANDOM%%RANDOM%" -o "%LISTA%"
if errorlevel 1 (
  echo  [X] No pude conectarme. Revisa tu internet y vuelve a intentarlo.
  goto fin
)

set /a N=0
for /f "usebackq delims=" %%F in ("%LISTA%") do (
  set "ARCH=%%F"
  if not "!ARCH!"=="" (
    curl.exe -fsSL "%BASE%/extension/!ARCH!?v=%RANDOM%%RANDOM%" -o "%DEST%\!ARCH!.nuevo"
    if errorlevel 1 (
      echo  [X] Fallo la descarga de !ARCH!. No se cambio nada de ese archivo.
      if exist "%DEST%\!ARCH!.nuevo" del /q "%DEST%\!ARCH!.nuevo"
    ) else (
      move /y "%DEST%\!ARCH!.nuevo" "%DEST%\!ARCH!" >nul
      set /a N+=1
      echo  [OK] !ARCH!
    )
  )
)
del /q "%LISTA%" >nul 2>&1

set "VER="
for /f "tokens=2 delims=:," %%V in ('findstr /c:"\"version\"" "%DEST%\manifest.json"') do set "VER=%%~V"
if defined VER set "VER=!VER: =!"
if defined VER set "VER=!VER:"=!"

echo.
echo  ==========================================================
echo     Listo: !N! archivos al dia.  Version de la extension: %VER%
echo  ==========================================================
echo.
echo  La ruta de la carpeta quedo copiada (Ctrl+V para pegarla).
echo|set /p="%DEST%" | clip

echo.
echo  PRIMERA VEZ:
echo    1. Se abrira la pagina de extensiones de Edge.
echo    2. Activa "Modo para desarrolladores" (abajo a la izquierda).
echo    3. Presiona "Cargar desempaquetada", pega la ruta con Ctrl+V
echo       en la barra de arriba de la ventana y elige "Seleccionar carpeta".
echo.
echo  ACTUALIZAR (las proximas veces):
echo    Busca ClaroGo^^! Genesys y presiona "Volver a cargar" (flecha circular).
echo.
start "" msedge "edge://extensions" >nul 2>&1

:fin
echo.
echo  Presiona cualquier tecla para cerrar esta ventana.
pause >nul
endlocal
