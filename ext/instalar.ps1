# ClaroGo! Genesys: instala o actualiza la extension (herramienta no oficial).
# Se usa pegando en la Terminal:  irm https://cotizadora.github.io/clarogo/ext/instalar.ps1 | iex
# 1. Crea la carpeta Documentos\ClaroGo\extension y baja los archivos de la extension.
# 2. Deja en Documentos\ClaroGo el actualizador y un acceso directo "Actualizar ClaroGo!" en el escritorio.
# 3. Copia la ruta de la carpeta y abre la pagina de extensiones de Edge.
# No pide claves ni datos personales y no instala programas.

$ErrorActionPreference = 'Stop'
$base   = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'ClaroGo'
$dest   = Join-Path $base 'extension'
$actual = Join-Path $base 'actualizar.ps1'

# Actualizador local: el acceso directo del escritorio lo ejecuta cada vez
$codigo = @'
$ErrorActionPreference = 'Stop'
$host.UI.RawUI.WindowTitle = 'ClaroGo! Genesys - actualizar'
$dest = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'ClaroGo\extension'
$web  = 'https://cotizadora.github.io/clarogo'
Write-Host ''
Write-Host '  ClaroGo! Genesys' -ForegroundColor White -BackgroundColor DarkRed
Write-Host ''
try {
  New-Item -ItemType Directory -Force $dest | Out-Null
  Write-Host '  Descargando la version mas nueva...' -ForegroundColor Gray
  $lista = (Invoke-RestMethod "$web/ext/extension-archivos.txt?v=$(Get-Random)") -split '\r?\n' | Where-Object { $_ }
  foreach ($f in $lista) {
    Invoke-WebRequest "$web/extension/$($f)?v=$(Get-Random)" -OutFile (Join-Path $dest "$f.nuevo") -UseBasicParsing
    Move-Item -Force (Join-Path $dest "$f.nuevo") (Join-Path $dest $f)
    Write-Host "   OK  $f" -ForegroundColor Green
  }
  $v = (Get-Content (Join-Path $dest 'manifest.json') -Raw | ConvertFrom-Json).version
  Set-Clipboard $dest
  Write-Host ''
  Write-Host "  LISTO: version $v descargada." -ForegroundColor Green
  Write-Host ''
  Write-Host '  La extension quedo en esta carpeta:' -ForegroundColor Cyan
  Write-Host "     $dest" -ForegroundColor White -BackgroundColor DarkBlue
  Write-Host '  (la ruta ya esta copiada: en Edge pegala con Ctrl+V)' -ForegroundColor Cyan
  Write-Host ''
  Write-Host '  Ahora, en la pagina de extensiones que se abre:' -ForegroundColor Yellow
  Write-Host '   - Si es la PRIMERA VEZ: activa "Modo para desarrolladores",'
  Write-Host '     presiona "Cargar desempaquetada", pega con Ctrl+V y elige "Seleccionar carpeta".'
  Write-Host '   - Si ya la tenias: busca ClaroGo! Genesys y presiona "Volver a cargar" (flecha circular).'
  Start-Process 'msedge.exe' 'edge://extensions'
} catch {
  Write-Host ''
  Write-Host '  No se pudo descargar. Revisa tu conexion a internet y vuelve a intentarlo.' -ForegroundColor Red
}
Write-Host ''
Read-Host '  Presiona Enter para cerrar'
'@

New-Item -ItemType Directory -Force $dest | Out-Null
Set-Content -Path $actual -Value $codigo -Encoding UTF8

# Acceso directo en el escritorio
$escritorio = [Environment]::GetFolderPath('Desktop')
$lnk = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $escritorio 'Actualizar ClaroGo!.lnk'))
$lnk.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$actual`""
$lnk.WorkingDirectory = $base
$lnk.IconLocation = (Join-Path $env:SystemRoot 'System32\shell32.dll') + ',238'
$lnk.Description = 'Descarga la version mas nueva de la extension ClaroGo! Genesys'
$lnk.Save()
Write-Host ''
Write-Host '  Se creo el acceso directo "Actualizar ClaroGo!" en tu escritorio.' -ForegroundColor Cyan

# Primera descarga
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $actual
