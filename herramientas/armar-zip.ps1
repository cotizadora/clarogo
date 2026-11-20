param([string]$Repo)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = Join-Path $Repo 'ext\clarogo-genesys-extension.zip'
$tmp = Join-Path $env:TEMP 'cgzip'
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmp | Out-Null
foreach ($f in (Get-Content (Join-Path $Repo 'ext\extension-archivos.txt') | Where-Object { $_ })) { Copy-Item (Join-Path $Repo "extension\$f") $tmp }
Remove-Item $zip -ErrorAction SilentlyContinue
[IO.Compression.ZipFile]::CreateFromDirectory($tmp, $zip)
$z = [IO.Compression.ZipFile]::OpenRead($zip)
$r = New-Object IO.StreamReader(($z.Entries | Where-Object Name -eq 'manifest.json').Open())
"archivos=$($z.Entries.Count) version=$(($r.ReadToEnd() | ConvertFrom-Json).version)"
$r.Close(); $z.Dispose()
