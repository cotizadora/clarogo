param([string]$Salida)
Add-Type -AssemblyName System.Drawing
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'; $g.InterpolationMode = 'HighQualityBicubic'

# Fondo: degradado oscuro a rojo, como la imagen de ClaroGo!
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$fondo = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(20, 24, 44)), ([System.Drawing.Color]::FromArgb(110, 10, 22)), 25
$g.FillRectangle($fondo, $rect)
# Círculo rojo arriba a la derecha, anillo y círculo gris abajo a la izquierda
$g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(217, 0, 0))), 820, -230, 620, 610)
$g.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(130, 255, 255, 255)), 2), 760, -290, 740, 730)
$g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(95, 150, 150, 165))), -140, 430, 420, 420)

# Ícono de GoExt: círculo rojo con "G!" blanco
$ix = 96; $iy = 118; $is = 170
$g.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70, 0, 0, 0))), ($ix + 6), ($iy + 10), $is, $is)
$rIco = New-Object System.Drawing.Rectangle $ix, $iy, $is, $is
$ico = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rIco, ([System.Drawing.Color]::FromArgb(240, 40, 50)), ([System.Drawing.Color]::FromArgb(190, 0, 20)), 90
$g.FillEllipse($ico, $rIco)
$g.DrawEllipse((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(230, 255, 255, 255)), 5), $ix, $iy, $is, $is)
$fIco = New-Object System.Drawing.Font 'Segoe UI Black', 70, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat; $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
$g.DrawString('G!', $fIco, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF ($ix + 2), ($iy + 4), $is, $is), $sf)

# Título "GoExt" (Go blanco, Ext rojo claro)
$blanco = [System.Drawing.Brushes]::White
$rojoClaro = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 77, 79))
$fTit = New-Object System.Drawing.Font 'Segoe UI Black', 132, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$fmt = [System.Drawing.StringFormat]::GenericTypographic
$x = 300; $y = 112
$g.DrawString('Go', $fTit, $blanco, $x, $y, $fmt)
$anchoGo = $g.MeasureString('Go', $fTit, 1000, $fmt).Width
$g.DrawString('Ext', $fTit, $rojoClaro, ($x + $anchoGo), $y, $fmt)

# Mensaje principal y subtítulo
$fMsg = New-Object System.Drawing.Font 'Segoe UI', 44, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('ClaroGo! funciona mucho mejor con GoExt', $fMsg, $blanco, 98, 330, $fmt)
$fSub = New-Object System.Drawing.Font 'Segoe UI', 31, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$suave = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 228, 232))
$g.DrawString('La extensión para Edge y Chrome · Instálala en 2 pasos', $fSub, $suave, 100, 396, $fmt)
$g.FillRectangle($rojoClaro, 100, 456, 120, 7)

# Botón blanco "Descargar e instalar"
$bx = 100; $by = 488; $bw = 420; $bh = 74; $r = 37
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($bx, $by, $r * 2, $r * 2, 90, 180); $path.AddArc(($bx + $bw - $r * 2), $by, $r * 2, $r * 2, 270, 180); $path.CloseFigure()
$g.FillPath([System.Drawing.Brushes]::White, $path)
$fBtn = New-Object System.Drawing.Font 'Segoe UI', 32, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$sfB = [System.Drawing.StringFormat]::GenericTypographic.Clone(); $sfB.Alignment = 'Center'; $sfB.LineAlignment = 'Center'
$g.DrawString('⬇ Descargar e instalar', $fBtn, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 0, 20))), (New-Object System.Drawing.RectangleF $bx, $by, $bw, $bh), $sfB)

# Pie
$fPie = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Herramienta de apoyo no oficial · Desarrollado por Eduardo Pérez', $fPie, $suave, 100, 588, $fmt)

$g.Dispose()
$bmp.Save($Salida, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"ok $Salida"
