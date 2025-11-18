# create-notification-icons.ps1 - Create Notification Icons
# Creates small monochrome icons for notifications

Add-Type -AssemblyName System.Drawing

function New-NotificationIcon {
    param(
        [int]$Size = 24,
        [string]$OutputPath
    )
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Transparent background
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # White M symbol (for notifications)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $scale = $Size / 1024.0
    
    $points = @(
        [System.Drawing.PointF]::new(200 * $scale, 800 * $scale),
        [System.Drawing.PointF]::new(350 * $scale, 300 * $scale),
        [System.Drawing.PointF]::new(500 * $scale, 600 * $scale),
        [System.Drawing.PointF]::new(650 * $scale, 200 * $scale),
        [System.Drawing.PointF]::new(800 * $scale, 800 * $scale)
    )
    
    $path.AddPolygon($points)
    $graphics.FillPath($whiteBrush, $path)
    
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $whiteBrush.Dispose()
    $path.Dispose()
}

Write-Host "🔔 Creating Notification Icons" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Android notification icons
$androidNotificationSizes = @(
    @{name="mdpi"; size=24},
    @{name="hdpi"; size=36},
    @{name="xhdpi"; size=48},
    @{name="xxhdpi"; size=72},
    @{name="xxxhdpi"; size=96}
)

Write-Host "📱 Creating Android notification icons..." -ForegroundColor Yellow

foreach ($sizeInfo in $androidNotificationSizes) {
    $name = $sizeInfo.name
    $size = $sizeInfo.size
    $dir = "android\app\src\main\res\mipmap-$name"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $iconPath = "$dir\ic_notification.png"
    New-NotificationIcon -Size $size -OutputPath $iconPath
    
    Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Notification icons created!" -ForegroundColor Green

