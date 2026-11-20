# ClaroGo! - Iniciar sesión en GitHub en este PC (se hace una sola vez por computador)
# Usa el inicio por código de dispositivo: muestra un código de 8 caracteres, abre github.com/login/device en Edge,
# el usuario entra con su cuenta (cotizadora), escribe el código y presiona Authorize. No se escribe ninguna clave aquí.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File herramientas\login-github.ps1
$candidatos = @("$env:LOCALAPPDATA\Programs\Git", "$env:ProgramFiles\Git", "${env:ProgramFiles(x86)}\Git")
$gitDir = $candidatos | Where-Object { Test-Path (Join-Path $_ 'cmd\git.exe') } | Select-Object -First 1
if (-not $gitDir) { Write-Host 'No encontré Git. Instálalo primero: winget install --id Git.Git -e' -ForegroundColor Red; exit 1 }
$env:Path = (Join-Path $gitDir 'cmd') + ';' + $env:Path
$gcm = Get-ChildItem $gitDir -Recurse -Filter git-credential-manager.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if (-not $gcm) { Write-Host 'No encontré Git Credential Manager dentro de Git.' -ForegroundColor Red; exit 1 }
$env:GCM_GUI_PROMPT = 'false'   # el código sale en esta ventana (la ventanita gráfica a veces queda escondida)
Write-Host ''
Write-Host 'Abajo aparece un codigo de 8 caracteres. En Edge se abrira github.com/login/device:' -ForegroundColor Yellow
Write-Host 'entra con la cuenta cotizadora, escribe el codigo, Continue y Authorize.' -ForegroundColor Yellow
Write-Host ''
Start-Process msedge 'https://github.com/login/device'
& $gcm github login --device
if ($LASTEXITCODE -eq 0) { Write-Host ''; Write-Host 'Listo, sesion de GitHub guardada.' -ForegroundColor Green }
else { Write-Host ''; Write-Host 'No se pudo iniciar sesion. Vuelve a intentarlo.' -ForegroundColor Red }
