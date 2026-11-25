# ClaroGo! - Actualizar el stock desde el Excel diario
# Doble clic en "Actualizar stock ClaroGo" del escritorio. Elige el Excel, revisa el resumen y publica.
# Usa la sesión de GitHub que ya tiene este computador (no pide claves).
# Lee el Excel con las mismas reglas que la herramienta del portal:
#   Hoja Stock: Material, Marca, Stock disp., Pie Referencial y 18 cuotas referenciales (Financiamiento Portabilidad).
#   Hoja Planilla: Modelo Comercial para el nombre y equipos Vigentes sin stock (stock 0).
param([string]$Archivo = '', [switch]$Prueba, [string]$Salida = '', [switch]$SinPreguntar)

$ErrorActionPreference = 'Stop'
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Base = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = Join-Path $Base 'repo'
$Url = 'https://github.com/cotizadora/clarogo.git'
$Sitio = 'https://cotizadora.github.io/clarogo/'
$Dias = @('domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado')

function Aviso([string]$texto, [string]$icono = 'Information') { [void][Windows.Forms.MessageBox]::Show($texto, 'ClaroGo! Stock', 'OK', $icono) }
function Normal([string]$s) {
  $d = $s.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD); $sb = New-Object Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) { if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne 'NonSpacingMark') { [void]$sb.Append($ch) } }
  return ($sb.ToString() -replace '[^a-z0-9]', '')
}
function Num($v) {
  $x = 0.0
  if ([double]::TryParse(([string]$v).Replace(',', '.'), [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$x)) { return [long][Math]::Floor($x + 0.5) }
  return $null
}
function Celda($f, [int]$i) { if ($i -ge 0 -and $f.ContainsKey($i)) { return ([string]$f[$i]).Trim() } return '' }

function LeerXlsx([string]$ruta) {
  $zip = [IO.Compression.ZipFile]::OpenRead($ruta)
  try {
    $leer = { param($n) $e = $zip.GetEntry($n); if (-not $e) { return $null }; $r = New-Object IO.StreamReader($e.Open(), [Text.Encoding]::UTF8); try { $r.ReadToEnd() } finally { $r.Close() } }
    $S = @(); $ssTxt = & $leer 'xl/sharedStrings.xml'
    if ($ssTxt) { $S = @(foreach ($si in ([xml]$ssTxt).GetElementsByTagName('si')) { (@($si.GetElementsByTagName('t') | ForEach-Object { $_.InnerText })) -join '' }) }
    $wb = [xml](& $leer 'xl/workbook.xml'); $rels = [xml](& $leer 'xl/_rels/workbook.xml.rels'); $dest = @{}
    foreach ($r in $rels.GetElementsByTagName('Relationship')) { $dest[$r.GetAttribute('Id')] = $r.GetAttribute('Target') }
    $hojas = New-Object System.Collections.ArrayList
    foreach ($h in $wb.GetElementsByTagName('sheet')) {
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
          if ($tipo -eq 's') { $val = $S[[int]$val] } elseif ($tipo -eq 'inlineStr') { $val = (@($c.GetElementsByTagName('t') | ForEach-Object { $_.InnerText })) -join '' } elseif ($tipo -eq 'e') { $val = '#N/A' }
          $f[$col] = $val
        }
        $rn = $row.GetAttribute('r'); if ($rn) { $nFila = [int]$rn } else { $nFila++ }
        $filas[$nFila] = $f
      }
      [void]$hojas.Add([pscustomobject]@{ Nombre = $h.GetAttribute('name'); Filas = $filas })
    }
    return , $hojas
  } finally { $zip.Dispose() }
}

function Cabecera($hoja, [string[]]$req) {
  foreach ($n in 1..25) {
    if (-not $hoja.Filas.ContainsKey($n)) { continue }
    $f = $hoja.Filas[$n]; $col = @{}
    foreach ($k in ($f.Keys | Sort-Object)) { $nn = Normal ([string]$f[$k]); if ($nn -and -not $col.ContainsKey($nn)) { $col[$nn] = $k } }
    $ok = $true; foreach ($r in $req) { if (-not $col.ContainsKey($r)) { $ok = $false; break } }
    if ($ok) { return @{ Fila = $n; Col = $col; Hoja = $hoja } }
  }
  return $null
}

function FechaDeNombre([string]$nombre) {
  $m = [regex]::Match($nombre, '(?:^|\D)(\d{1,2})[-_.](\d{1,2})(?:[-_.](\d{4}|\d{2}))?(?=\D|$)')
  if (-not $m.Success) { return $null }
  $d = [int]$m.Groups[1].Value; $mes = [int]$m.Groups[2].Value
  if ($mes -lt 1 -or $mes -gt 12 -or $d -lt 1 -or $d -gt 31) { return $null }
  $hoy = Get-Date
  if ($m.Groups[3].Success) { $y = [int]$m.Groups[3].Value; if ($y -lt 100) { $y += 2000 } } else { $y = $hoy.Year }
  try { $f = Get-Date -Year $y -Month $mes -Day $d -Hour 0 -Minute 0 -Second 0 } catch { return $null }
  if (-not $m.Groups[3].Success -and ($f - $hoy).TotalDays -gt 30) { $f = $f.AddYears(-1) }
  return $f.Date
}

function ArmarStock($hojas) {
  $cS = $null; $cP = $null
  foreach ($h in $hojas) {
    if (-not $cS) { $c = Cabecera $h @('material', 'marca', 'stockdisp', 'piereferencial', '18cuotasreferenciales'); if ($c) { $cS = $c; continue } }
    if (-not $cP) { $c = Cabecera $h @('status', 'sku', 'modelocomercial', 'piereferencial', '18cuotasreferenciales'); if ($c) { $cP = $c } }
  }
  if (-not $cS) { throw 'No encontré la hoja Stock con las columnas Material, Marca, Stock disp., Pie Referencial y 18 cuotas referenciales.' }
  $S = $cS.Col; $iModeloS = if ($S.ContainsKey('modelo')) { $S['modelo'] } else { -1 }
  $pl = New-Object System.Collections.Specialized.OrderedDictionary
  if ($cP) {
    $P = $cP.Col
    foreach ($n in ($cP.Hoja.Filas.Keys | Where-Object { $_ -gt $cP.Fila } | Sort-Object)) { $f = $cP.Hoja.Filas[$n]; $sku = Celda $f $P['sku']; if ($sku -and -not $pl.Contains($sku)) { $pl[$sku] = $f } }
  }
  $filas = New-Object System.Collections.ArrayList; $vistos = @{}; $sinPrecio = New-Object System.Collections.ArrayList
  $dup = 0; $conStock = 0; $sinStock = 0; $antiguos = 0
  foreach ($n in ($cS.Hoja.Filas.Keys | Where-Object { $_ -gt $cS.Fila } | Sort-Object)) {
    $f = $cS.Hoja.Filas[$n]; $sku = Celda $f $S['material']
    if (-not $sku -or $sku -notmatch '\d') { continue }
    if ($vistos.ContainsKey($sku)) { $st = Num (Celda $f $S['stockdisp']); if ($null -eq $st -or $st -lt 0) { $st = 0 }; $vistos[$sku].stock += $st; $dup++; continue }
    $modelo = ''; if ($cP -and $pl.Contains($sku)) { $modelo = Celda $pl[$sku] $P['modelocomercial'] }
    if (-not $modelo) { $modelo = Celda $f $iModeloS }
    $pie = Num (Celda $f $S['piereferencial']); $cuotas = Num (Celda $f $S['18cuotasreferenciales'])
    if ($null -eq $pie -or $null -eq $cuotas) { [void]$sinPrecio.Add($(if ($modelo) { $modelo } else { $sku })); continue }
    $st = Num (Celda $f $S['stockdisp']); if ($null -eq $st -or $st -lt 0) { $st = 0 }
    $o = [pscustomobject]@{ sku = $sku; marca = (Celda $f $S['marca']).ToUpperInvariant(); modelo = $modelo; stock = $st; pie = $pie; cuotas = $cuotas }
    $vistos[$sku] = $o; [void]$filas.Add($o); $conStock++
  }
  if ($cP) {
    foreach ($sku in @($pl.Keys)) {
      if ($vistos.ContainsKey($sku)) { continue }
      $f = $pl[$sku]
      if ((Normal (Celda $f $P['status'])) -ne 'vigente') { $antiguos++; continue }
      $pie = Num (Celda $f $P['piereferencial']); $cuotas = Num (Celda $f $P['18cuotasreferenciales']); $modelo = Celda $f $P['modelocomercial']
      if ($null -eq $pie -or $null -eq $cuotas -or -not $modelo) { continue }
      $o = [pscustomobject]@{ sku = $sku; marca = (Celda $f $P['marca']).ToUpperInvariant(); modelo = $modelo; stock = 0; pie = $pie; cuotas = $cuotas }
      $vistos[$sku] = $o; [void]$filas.Add($o); $sinStock++
    }
  }
  return [pscustomobject]@{ Filas = $filas; ConStock = $conStock; SinStock = $sinStock; SinPrecio = $sinPrecio; Antiguos = $antiguos; Dup = $dup; Precios = $(if ($cP) { $cP.Hoja.Nombre } else { '' }) }
}

function Campo($s) { $s = [string]$s; if ($s -match '[;"\n]') { return '"' + $s.Replace('"', '""') + '"' } return $s }
function JsonTxt([string]$s) { return '"' + $s.Replace('\', '\\').Replace('"', '\"') + '"' }

function EscribirArchivos($res, [datetime]$fecha, [string]$archivo, [string]$carpeta, [string]$publicado) {
  $sb = New-Object Text.StringBuilder
  [void]$sb.Append("sku;marca;modelo;stock;pie;cuotas`r`n")
  foreach ($r in $res.Filas) { [void]$sb.Append(((Campo $r.sku), (Campo $r.marca), (Campo $r.modelo), $r.stock, $r.pie, $r.cuotas) -join ';'); [void]$sb.Append("`r`n") }
  [IO.File]::WriteAllText((Join-Path $carpeta 'stock.csv'), $sb.ToString(), (New-Object Text.UTF8Encoding($true)))
  $conStock = @($res.Filas | Where-Object { $_.stock -gt 0 }).Count
  $info = "{`n `"fecha`": $(JsonTxt $fecha.ToString('yyyy-MM-dd'))," + "`n `"archivo`": $(JsonTxt $archivo)," + "`n `"precios`": $(JsonTxt $res.Precios)," + "`n `"publicado`": $(JsonTxt $publicado)," + "`n `"equipos`": $($res.Filas.Count)," + "`n `"conStock`": $conStock`n}`n"
  [IO.File]::WriteAllText((Join-Path $carpeta 'stock-info.json'), $info, (New-Object Text.UTF8Encoding($false)))
}

function GitOk { & git @args; if ($LASTEXITCODE -ne 0) { throw "Git falló: git $($args -join ' ')" } }

try {
  # 1. Elegir el Excel
  if (-not $Archivo) {
    $desc = Join-Path $env:USERPROFILE 'Downloads'
    $dlg = New-Object Windows.Forms.OpenFileDialog
    $dlg.Title = 'Elige el Excel del stock diario'; $dlg.Filter = 'Excel (*.xlsx)|*.xlsx'
    $dlg.InitialDirectory = $desc
    $ultimo = Get-ChildItem $desc -Filter 'Stock Diario*.xlsx' -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '~$*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($ultimo) { $dlg.FileName = $ultimo.Name }
    if ($dlg.ShowDialog() -ne 'OK') { exit }
    $Archivo = $dlg.FileName
  }
  $nombre = [IO.Path]::GetFileName($Archivo)
  Write-Host "Leyendo $nombre ..."

  # 2. Leer y armar el stock
  $res = ArmarStock (LeerXlsx $Archivo)
  if ($res.Filas.Count -lt 1) { throw 'No encontré equipos en el Excel.' }
  $fecha = FechaDeNombre $nombre
  if (-not $fecha) { $fecha = (Get-Date).Date }

  if ($Prueba) {
    if (-not $Salida) { $Salida = $Base }
    EscribirArchivos $res $fecha $nombre $Salida '2000-01-01T00:00:00.000Z'
    Write-Host "Prueba: $($res.Filas.Count) equipos ($($res.ConStock) con stock, $($res.SinStock) vigentes sin stock), $($res.SinPrecio.Count) sin precio, $($res.Antiguos) no vigentes, $($res.Dup) SKU repetidos sumados. Fecha $($fecha.ToString('dd-MM-yyyy')). Archivos en $Salida"
    exit
  }

  # 3. Confirmar
  while (-not $SinPreguntar) {
    $txt = "Archivo: $nombre`n`n" +
      "Fecha del stock: $($Dias[[int]$fecha.DayOfWeek]) $($fecha.ToString('dd-MM-yyyy'))`n" +
      "Equipos: $($res.Filas.Count) ($($res.ConStock) con stock y $($res.SinStock) vigentes sin stock)`n" +
      "Precios: $($res.Precios)`n" +
      $(if ($res.SinPrecio.Count) { "No se incluyen $($res.SinPrecio.Count) productos sin pie o cuota (#N/A).`n" } else { '' }) +
      $(if ($res.Dup) { "$($res.Dup) SKU venían en más de una fila: se sumó su stock.`n" } else { '' }) +
      "`n¿Publicar este stock para todos?`n`nSí: publicar.   No: cambiar la fecha.   Cancelar: salir."
    $r = [Windows.Forms.MessageBox]::Show($txt, 'ClaroGo! Stock', 'YesNoCancel', 'Question')
    if ($r -eq 'Cancel') { exit }
    if ($r -eq 'Yes') { break }
    $nueva = [Microsoft.VisualBasic.Interaction]::InputBox('Escribe la fecha del stock (DD-MM-AAAA):', 'ClaroGo! Stock', $fecha.ToString('dd-MM-yyyy'))
    if ($nueva) { $f2 = FechaDeNombre $nueva; if ($f2) { $fecha = $f2 } else { Aviso 'No entendí la fecha. Usa el formato DD-MM-AAAA, por ejemplo 16-11-2026.' 'Warning' } }
  }

  # 4. Publicar en GitHub con la sesión de este computador
  Write-Host 'Preparando la copia del sitio...'
  if (-not (Test-Path (Join-Path $Repo '.git'))) { GitOk clone -q $Url $Repo }
  GitOk -C $Repo config user.name 'cotizadora'
  GitOk -C $Repo config user.email '290839906+cotizadora@users.noreply.github.com'
  GitOk -C $Repo fetch -q origin main
  GitOk -C $Repo checkout -q -B main origin/main
  $publicado = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'")
  EscribirArchivos $res $fecha $nombre (Join-Path $Repo 'datos') $publicado
  GitOk -C $Repo add datos/stock.csv datos/stock-info.json
  Write-Host 'Publicando...'
  GitOk -C $Repo commit -q -m "Stock del $($fecha.ToString('dd-MM-yyyy')) (desde el escritorio)"
  # Si alguien publicó al mismo tiempo, se pone al día y reintenta
  $subido = $false
  for ($k = 0; $k -lt 3 -and -not $subido; $k++) {
    & git -C $Repo push -q origin main
    if ($LASTEXITCODE -eq 0) { $subido = $true } else { Start-Sleep -Seconds 3; GitOk -C $Repo pull -q --rebase origin main }
  }
  if (-not $subido) { throw 'No se pudo subir a GitHub. Revisa la conexión a internet e inténtalo de nuevo.' }

  # 5. Esperar a que esté en línea
  Write-Host 'Publicado. Esperando que el sitio se actualice (uno o dos minutos)...'
  $ok = $false
  for ($i = 0; $i -lt 24; $i++) {
    Start-Sleep -Seconds 10
    try { $j = Invoke-RestMethod -Uri ($Sitio + 'datos/stock-info.json?v=' + (Get-Random)) -Headers @{ 'Cache-Control' = 'no-cache' }; if ($j.publicado -eq $publicado) { $ok = $true; break } } catch {}
    Write-Host '.' -NoNewline
  }
  Write-Host ''
  if ($SinPreguntar) { Write-Host "Resultado en linea: $ok"; exit }
  if ($ok) { Aviso "Listo. El stock del $($fecha.ToString('dd-MM-yyyy')) ya está en línea para todos." }
  else { Aviso 'El stock quedó publicado, pero el sitio está tardando en mostrarlo. Revísalo en unos minutos.' 'Warning' }
  # Con el stock en línea, ClaroGo! abre la gráfica "Stock actualizado" para compartir por WhatsApp
  if ($ok) { Start-Process ($Sitio + '?stocklisto=1#stock') } else { Start-Process ($Sitio + '#stock') }
} catch {
  Aviso ("No se pudo actualizar el stock.`n`n" + $_.Exception.Message) 'Error'
  exit 1
}
