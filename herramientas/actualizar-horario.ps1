# ClaroGo! - Actualizar el Horario Ejecutivos desde el Excel de turnos
# Doble clic en "Actualizar horario ClaroGo" del escritorio. Elige el Excel, revisa el resumen y publica.
# Usa la sesión de GitHub que ya tiene este computador (no pide claves).
# Lee la primera hoja: una fila con las fechas (números de fecha de Excel), la columna "Ejecutivo" con los nombres
# y los turnos ("10:00 a 19:00", "Sin turno" = libre). Cualquier otra columna (por ejemplo los grupos A, B, C, D) se ignora.
param([string]$Archivo = '', [switch]$Prueba, [string]$Salida = '', [switch]$SinPreguntar)

$ErrorActionPreference = 'Stop'
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Base = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = Join-Path $Base 'repo'
$Url = 'https://github.com/cotizadora/clarogo.git'
$Sitio = 'https://cotizadora.github.io/clarogo/'

function Aviso([string]$texto, [string]$icono = 'Information') { [void][Windows.Forms.MessageBox]::Show($texto, 'ClaroGo! Horario', 'OK', $icono) }
function GitOk { & git @args; if ($LASTEXITCODE -ne 0) { throw "Git falló: git $($args -join ' ')" } }

# Primera hoja del Excel: devuelve un diccionario fila -> (columna -> texto)
function LeerHoja([string]$ruta) {
  $zip = [IO.Compression.ZipFile]::OpenRead($ruta)
  try {
    $leer = { param($n) $e = $zip.GetEntry($n); if (-not $e) { return $null }; $r = New-Object IO.StreamReader($e.Open(), [Text.Encoding]::UTF8); try { $r.ReadToEnd() } finally { $r.Close() } }
    $S = @(); $ssTxt = & $leer 'xl/sharedStrings.xml'
    if ($ssTxt) { $S = @(foreach ($si in ([xml]$ssTxt).GetElementsByTagName('si')) { (@($si.GetElementsByTagName('t') | ForEach-Object { $_.InnerText })) -join '' }) }
    $wb = [xml](& $leer 'xl/workbook.xml'); $rels = [xml](& $leer 'xl/_rels/workbook.xml.rels'); $dest = @{}
    foreach ($r in $rels.GetElementsByTagName('Relationship')) { $dest[$r.GetAttribute('Id')] = $r.GetAttribute('Target') }
    $h = $wb.GetElementsByTagName('sheet').Item(0)
    $t = $dest[$h.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')]
    if ($t.StartsWith('/')) { $t = $t.Substring(1) } else { $t = 'xl/' + $t }
    $doc = [xml](& $leer $t); $filas = @{}; $nFila = 0
    foreach ($row in $doc.GetElementsByTagName('row')) {
      $f = @{}; $col = -1
      foreach ($c in $row.GetElementsByTagName('c')) {
        $ref = $c.GetAttribute('r')
        if ($ref) { $col = 0; foreach ($ch in ($ref -replace '\d', '').ToCharArray()) { $col = $col * 26 + ([int]$ch - 64) }; $col-- } else { $col++ }
        $tipo = $c.GetAttribute('t'); $ve = $c.GetElementsByTagName('v').Item(0)
        $val = if ($ve) { $ve.InnerText } else { '' }
        if ($tipo -eq 's') { $val = $S[[int]$val] } elseif ($tipo -eq 'inlineStr') { $val = (@($c.GetElementsByTagName('t') | ForEach-Object { $_.InnerText })) -join '' }
        $f[$col] = ([string]$val).Trim()
      }
      $rn = $row.GetAttribute('r'); if ($rn) { $nFila = [int]$rn } else { $nFila++ }
      $filas[$nFila] = $f
    }
    return $filas
  } finally { $zip.Dispose() }
}

# Nombre en mayúsculas y sin tildes (la Ñ se mantiene), igual que en ClaroGo!
function NombreLimpio([string]$s) {
  $n = $s.Trim() -replace '\s+', ' '
  $d = $n.Normalize([Text.NormalizationForm]::FormD); $sb = New-Object Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark' -or $ch -eq [char]0x0303) { [void]$sb.Append($ch) } }
  return $sb.ToString().Normalize([Text.NormalizationForm]::FormC).ToUpper()
}

# Turno en el formato de ClaroGo!: "10:00 a 19:00", "Libre" o vacío
function Turno([string]$v) {
  $v = $v.Trim()
  if (-not $v) { return '' }
  if ($v -match '^(sin turno|libre)') { return 'Libre' }
  if ($v -match '(\d{1,2})[:.](\d{2})\s*(a|-|–|hasta)\s*(\d{1,2})[:.](\d{2})') { return ('{0:00}:{1} a {2:00}:{3}' -f [int]$matches[1], $matches[2], [int]$matches[4], $matches[5]) }
  return $v
}

function ArmarHorario($filas) {
  # Fila de fechas: la que tiene más números de fecha de Excel (entre 2020 y 2040)
  $filaFechas = $null; $mejor = 0
  foreach ($k in ($filas.Keys | Sort-Object)) { $n = @($filas[$k].Values | Where-Object { $_ -match '^\d{5}(\.0+)?$' -and [double]$_ -gt 43800 -and [double]$_ -lt 51150 }).Count; if ($n -gt $mejor) { $mejor = $n; $filaFechas = $k } }
  if ($mejor -lt 3) { throw 'No encontré la fila con las fechas de los turnos.' }
  $cols = @{}
  foreach ($c in ($filas[$filaFechas].Keys | Sort-Object)) { $v = $filas[$filaFechas][$c]; if ($v -match '^\d{5}(\.0+)?$' -and [double]$v -gt 43800 -and [double]$v -lt 51150) { $cols[$c] = [datetime]::FromOADate([double]$v).ToString('yyyy-MM-dd') } }
  # Columna de nombres: la que dice "Ejecutivo"; si no está, la que está justo antes de la primera fecha
  $colNom = $null
  foreach ($k in ($filas.Keys | Sort-Object)) { foreach ($c in ($filas[$k].Keys | Sort-Object)) { if ($filas[$k][$c] -match '^ejecutiv') { $colNom = $c } }; if ($null -ne $colNom) { break } }
  $colOrden = @($cols.Keys | Sort-Object)
  if ($null -eq $colNom) { $colNom = $colOrden[0] - 1 }
  $ejecutivos = New-Object System.Collections.ArrayList
  foreach ($k in ($filas.Keys | Sort-Object)) {
    if ($k -le $filaFechas) { continue }
    $f = $filas[$k]; $nombre = if ($f.ContainsKey($colNom)) { $f[$colNom] } else { '' }
    if (-not $nombre -or $nombre -match '^(ejecutiv|grupo\b)' -or $nombre -notmatch '[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}') { continue }
    $turnos = [ordered]@{}; $hay = 0
    foreach ($c in $colOrden) { $t = Turno $(if ($f.ContainsKey($c)) { $f[$c] } else { '' }); $turnos[$cols[$c]] = $t; if ($t) { $hay++ } }
    if ($hay) { [void]$ejecutivos.Add([pscustomobject]@{ nombre = (NombreLimpio $nombre); turnos = $turnos }) }
  }
  if (-not $ejecutivos.Count) { throw 'No encontré ejecutivos con turnos en el Excel.' }
  $dias = @($colOrden | ForEach-Object { $cols[$_] })
  return [pscustomobject]@{ Dias = $dias; Desde = $dias[0]; Hasta = $dias[-1]; Ejecutivos = $ejecutivos }
}

function EscribirJson($res, [string]$archivo, [string]$carpeta, [string]$publicado) {
  $obj = [ordered]@{ publicado = $publicado; archivo = $archivo; desde = $res.Desde; hasta = $res.Hasta; ejecutivos = @($res.Ejecutivos | ForEach-Object { [ordered]@{ nombre = $_.nombre; turnos = $_.turnos } }) }
  $json = $obj | ConvertTo-Json -Depth 6 -Compress
  New-Item -ItemType Directory -Force $carpeta | Out-Null
  [IO.File]::WriteAllText((Join-Path $carpeta 'horario.json'), $json + "`n", (New-Object Text.UTF8Encoding $false))
}

$fmt = { param($iso) ([datetime]::ParseExact($iso, 'yyyy-MM-dd', $null)).ToString('dd-MM-yyyy') }

try {
  # 1. Elegir el Excel
  if (-not $Archivo) {
    $desc = Join-Path $env:USERPROFILE 'Downloads'
    $dlg = New-Object Windows.Forms.OpenFileDialog
    $dlg.Title = 'Elige el Excel de turnos'; $dlg.Filter = 'Excel (*.xlsx)|*.xlsx'
    $dlg.InitialDirectory = $desc
    $ultimo = Get-ChildItem $desc -Filter '*turno*.xlsx' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '~$*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($ultimo) { $dlg.FileName = $ultimo.Name }
    if ($dlg.ShowDialog() -ne 'OK') { exit }
    $Archivo = $dlg.FileName
  }
  $nombre = [IO.Path]::GetFileName($Archivo)
  Write-Host "Leyendo $nombre ..."
  $res = ArmarHorario (LeerHoja $Archivo)

  if ($Prueba) {
    if (-not $Salida) { $Salida = $Base }
    EscribirJson $res $nombre $Salida '2000-01-01T00:00:00.000Z'
    Write-Host "Prueba: $($res.Ejecutivos.Count) ejecutivos, del $(& $fmt $res.Desde) al $(& $fmt $res.Hasta) ($($res.Dias.Count) dias). Archivo: $(Join-Path $Salida 'horario.json')"
    exit
  }

  # 2. Confirmar
  if (-not $SinPreguntar) {
    $txt = "Archivo: $nombre`n`nTurnos del $(& $fmt $res.Desde) al $(& $fmt $res.Hasta) ($($res.Dias.Count) días)`nEjecutivos: $($res.Ejecutivos.Count)`n`n" +
      (($res.Ejecutivos | ForEach-Object { '• ' + $_.nombre }) -join "`n") +
      "`n`nNo se publica ninguna otra columna (por ejemplo los grupos).`n`n¿Publicar este horario para todos?"
    if ([Windows.Forms.MessageBox]::Show($txt, 'ClaroGo! Horario', 'YesNo', 'Question') -ne 'Yes') { exit }
  }

  # 3. Publicar en GitHub con la sesión de este computador
  Write-Host 'Preparando la copia del sitio...'
  if (-not (Test-Path (Join-Path $Repo '.git'))) { GitOk clone -q $Url $Repo }
  GitOk -C $Repo config user.name 'cotizadora'
  GitOk -C $Repo config user.email '290839906+cotizadora@users.noreply.github.com'
  GitOk -C $Repo fetch -q origin main
  GitOk -C $Repo checkout -q -B main origin/main
  $publicado = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'")
  EscribirJson $res $nombre (Join-Path $Repo 'datos') $publicado
  GitOk -C $Repo add datos/horario.json
  Write-Host 'Publicando...'
  GitOk -C $Repo commit -q -m "Horario del $(& $fmt $res.Desde) al $(& $fmt $res.Hasta) (desde el escritorio)"
  $subido = $false
  for ($k = 0; $k -lt 3 -and -not $subido; $k++) {
    & git -C $Repo push -q origin main
    if ($LASTEXITCODE -eq 0) { $subido = $true } else { Start-Sleep -Seconds 3; GitOk -C $Repo pull -q --rebase origin main }
  }
  if (-not $subido) { throw 'No se pudo subir a GitHub. Revisa la conexión a internet e inténtalo de nuevo.' }

  # 4. Esperar a que esté en línea
  Write-Host 'Publicado. Esperando que el sitio se actualice (uno o dos minutos)...'
  $ok = $false
  for ($i = 0; $i -lt 24; $i++) {
    Start-Sleep -Seconds 10
    try { $j = Invoke-RestMethod -Uri ($Sitio + 'datos/horario.json?v=' + (Get-Random)) -Headers @{ 'Cache-Control' = 'no-cache' }; if ($j.publicado -eq $publicado) { $ok = $true; break } } catch {}
    Write-Host '.' -NoNewline
  }
  Write-Host ''
  if ($SinPreguntar) { Write-Host "Resultado en linea: $ok"; exit }
  if ($ok) { Aviso "Listo. El horario del $(& $fmt $res.Desde) al $(& $fmt $res.Hasta) ya está en línea para todos." }
  else { Aviso 'El horario quedó publicado, pero el sitio está tardando en mostrarlo. Revísalo en unos minutos.' 'Warning' }
  Start-Process ($Sitio + '#horario')
} catch {
  if ($Prueba -or $SinPreguntar) { Write-Host ("ERROR: " + $_.Exception.Message + " (linea " + $_.InvocationInfo.ScriptLineNumber + ")") } else { Aviso ("No se pudo actualizar el horario.`n`n" + $_.Exception.Message) 'Error' }
  exit 1
}
