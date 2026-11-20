param([string]$Html)
$t = [IO.File]::ReadAllText($Html, [Text.Encoding]::UTF8)
$m = [regex]::Match($t, 'FB_PUBLIC_LOAD_DATA_ = (.*?);</script>', 'Singleline')
$d = $m.Groups[1].Value | ConvertFrom-Json
foreach ($q in $d[1][1]) {
  $titulo = $q[1]
  if (-not $q[4]) { "## $titulo (sin campo)"; continue }
  foreach ($c in $q[4]) {
    $ops = @(); if ($c[1]) { $ops = $c[1] | ForEach-Object { $_[0] } }
    "## $titulo  [entry.$($c[0])]"
    if ($ops.Count) { "   opciones: " + ($ops -join ' | ') }
  }
}
