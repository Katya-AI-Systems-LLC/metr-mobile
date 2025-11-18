# create-simple-icons.ps1 - Create Simple PNG Icons using .NET
# Creates basic colored icons without external dependencies

Add-Type -AssemblyName System.Drawing

function New-METRIcon {
    param(
        [int]$Size = 1024,
        [string]$OutputPath
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Background gradient (dark)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Size, $Size),
        [System.Drawing.Color]::FromArgb(15, 15, 15),
        [System.Drawing.Color]::FromArgb(26, 26, 26)
    )
    $graphics.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    
    # Create gradient for M symbol
    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Size, $Size),
        [System.Drawing.Color]::FromArgb(139, 92, 246),  # #8B5CF6
        [System.Drawing.Color]::FromArgb(236, 72, 153)   # #EC4899
    )
    
    # Add middle color stop
    $colorBlend = New-Object System.Drawing.Drawing2D.ColorBlend
    $colorBlend.Colors = @(
        [System.Drawing.Color]::FromArgb(139, 92, 246),  # Purple
        [System.Drawing.Color]::FromArgb(20, 184, 166),  # Teal
        [System.Drawing.Color]::FromArgb(236, 72, 153)  # Pink
    )
    $colorBlend.Positions = @(0.0, 0.5, 1.0)
    $gradientBrush.InterpolationColors = $colorBlend
    
    # Draw Mountain M shape
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
    $graphics.FillPath($gradientBrush, $path)
    
    # Save
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $bgBrush.Dispose()
    $gradientBrush.Dispose()
    $path.Dispose()
}

Write-Host "🎨 Creating METR Icons (Simple Method)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Android icons
Write-Host "📱 Creating Android icons..." -ForegroundColor Yellow

$androidSizes = @(
    @{name="mdpi"; size=48},
    @{name="hdpi"; size=72},
    @{name="xhdpi"; size=96},
    @{name="xxhdpi"; size=144},
    @{name="xxxhdpi"; size=192}
)

foreach ($sizeInfo in $androidSizes) {
    $name = $sizeInfo.name
    $size = $sizeInfo.size
    $dir = "android\app\src\main\res\mipmap-$name"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $iconPath = "$dir\ic_launcher.png"
    $roundPath = "$dir\ic_launcher_round.png"
    $fgPath = "$dir\ic_launcher_foreground.png"
    $bgPath = "$dir\ic_launcher_background.png"
    
    # Create main icon
    New-METRIcon -Size $size -OutputPath $iconPath
    
    # Copy to round (Android will apply mask)
    Copy-Item $iconPath $roundPath -Force
    
    # Create foreground (logo only, transparent background)
    $fgBitmap = New-Object System.Drawing.Bitmap($size, $size)
    $fgGraphics = [System.Drawing.Graphics]::FromImage($fgBitmap)
    $fgGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Transparent background
    $fgGraphics.Clear([System.Drawing.Color]::Transparent)
    
    # Logo gradient
    $fgGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(139, 92, 246),
        [System.Drawing.Color]::FromArgb(236, 72, 153)
    )
    $fgColorBlend = New-Object System.Drawing.Drawing2D.ColorBlend
    $fgColorBlend.Colors = @(
        [System.Drawing.Color]::FromArgb(139, 92, 246),
        [System.Drawing.Color]::FromArgb(20, 184, 166),
        [System.Drawing.Color]::FromArgb(236, 72, 153)
    )
    $fgColorBlend.Positions = @(0.0, 0.5, 1.0)
    $fgGradient.InterpolationColors = $fgColorBlend
    
    $fgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $fgScale = $size / 1024.0
    $fgPoints = @(
        [System.Drawing.PointF]::new(200 * $fgScale, 800 * $fgScale),
        [System.Drawing.PointF]::new(350 * $fgScale, 300 * $fgScale),
        [System.Drawing.PointF]::new(500 * $fgScale, 600 * $fgScale),
        [System.Drawing.PointF]::new(650 * $fgScale, 200 * $fgScale),
        [System.Drawing.PointF]::new(800 * $fgScale, 800 * $fgScale)
    )
    $fgPath.AddPolygon($fgPoints)
    $fgGraphics.FillPath($fgGradient, $fgPath)
    $fgBitmap.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fgGraphics.Dispose()
    $fgBitmap.Dispose()
    
    # Create background (gradient only)
    $bgBitmap = New-Object System.Drawing.Bitmap($size, $size)
    $bgGraphics = [System.Drawing.Graphics]::FromImage($bgBitmap)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(15, 15, 15),
        [System.Drawing.Color]::FromArgb(26, 26, 26)
    )
    $bgGraphics.FillRectangle($bgBrush, 0, 0, $size, $size)
    $bgBitmap.Save($bgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bgGraphics.Dispose()
    $bgBitmap.Dispose()
    $bgBrush.Dispose()
    
    Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
}

# Create adaptive icon XMLs
$anydpiDir = "android\app\src\main\res\mipmap-anydpi-v26"
if (-not (Test-Path $anydpiDir)) {
    New-Item -ItemType Directory -Path $anydpiDir -Force | Out-Null
}

$adaptiveIcon = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"@

$adaptiveIcon | Out-File -FilePath "$anydpiDir\ic_launcher.xml" -Encoding UTF8
$adaptiveIcon | Out-File -FilePath "$anydpiDir\ic_launcher_round.xml" -Encoding UTF8

Write-Host "  ✅ Adaptive icon XMLs" -ForegroundColor Green
Write-Host ""

# iOS icons
Write-Host "🍎 Creating iOS icons..." -ForegroundColor Yellow

$iosIcons = @(
    @{name="Icon-App-20x20@2x"; size=40},
    @{name="Icon-App-20x20@3x"; size=60},
    @{name="Icon-App-29x29@2x"; size=58},
    @{name="Icon-App-29x29@3x"; size=87},
    @{name="Icon-App-40x40@2x"; size=80},
    @{name="Icon-App-40x40@3x"; size=120},
    @{name="Icon-App-60x60@2x"; size=120},
    @{name="Icon-App-60x60@3x"; size=180},
    @{name="Icon-App-76x76@1x"; size=76},
    @{name="Icon-App-76x76@2x"; size=152},
    @{name="Icon-App-1024x1024@1x"; size=1024}
)

$iconSetDir = "ios\Mattermost\Images.xcassets\AppIcon.appiconset"
if (-not (Test-Path $iconSetDir)) {
    New-Item -ItemType Directory -Path $iconSetDir -Force | Out-Null
}

foreach ($icon in $iosIcons) {
    $name = $icon.name
    $size = $icon.size
    $iconPath = "$iconSetDir\$name.png"
    
    New-METRIcon -Size $size -OutputPath $iconPath
    Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
}

# Create Contents.json
$contentsJson = @{
    images = @(
        @{idiom="iphone"; size="20x20"; scale="2x"; filename="Icon-App-20x20@2x.png"},
        @{idiom="iphone"; size="20x20"; scale="3x"; filename="Icon-App-20x20@3x.png"},
        @{idiom="iphone"; size="29x29"; scale="2x"; filename="Icon-App-29x29@2x.png"},
        @{idiom="iphone"; size="29x29"; scale="3x"; filename="Icon-App-29x29@3x.png"},
        @{idiom="iphone"; size="40x40"; scale="2x"; filename="Icon-App-40x40@2x.png"},
        @{idiom="iphone"; size="40x40"; scale="3x"; filename="Icon-App-40x40@3x.png"},
        @{idiom="iphone"; size="60x60"; scale="2x"; filename="Icon-App-60x60@2x.png"},
        @{idiom="iphone"; size="60x60"; scale="3x"; filename="Icon-App-60x60@3x.png"},
        @{idiom="ipad"; size="20x20"; scale="1x"; filename="Icon-App-20x20@2x.png"},
        @{idiom="ipad"; size="20x20"; scale="2x"; filename="Icon-App-20x20@3x.png"},
        @{idiom="ipad"; size="29x29"; scale="1x"; filename="Icon-App-29x29@2x.png"},
        @{idiom="ipad"; size="29x29"; scale="2x"; filename="Icon-App-29x29@3x.png"},
        @{idiom="ipad"; size="40x40"; scale="1x"; filename="Icon-App-40x40@2x.png"},
        @{idiom="ipad"; size="40x40"; scale="2x"; filename="Icon-App-40x40@3x.png"},
        @{idiom="ipad"; size="76x76"; scale="1x"; filename="Icon-App-76x76@1x.png"},
        @{idiom="ipad"; size="76x76"; scale="2x"; filename="Icon-App-76x76@2x.png"},
        @{idiom="ios-marketing"; size="1024x1024"; scale="1x"; filename="Icon-App-1024x1024@1x.png"}
    )
    info = @{
        version = 1
        author = "METR Team"
    }
}

$contentsJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "$iconSetDir\Contents.json" -Encoding UTF8

Write-Host "  ✅ Contents.json created" -ForegroundColor Green
Write-Host ""

# Splash screens
Write-Host "🖼️  Creating splash screens..." -ForegroundColor Yellow

function New-SplashScreen {
    param(
        [int]$Width = 1080,
        [int]$Height = 1920,
        [string]$OutputPath
    )
    
    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Background gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Width, $Height),
        [System.Drawing.Color]::FromArgb(15, 15, 15),
        [System.Drawing.Color]::FromArgb(26, 26, 26)
    )
    $graphics.FillRectangle($bgBrush, 0, 0, $Width, $Height)
    
    # Logo gradient
    $logoGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Width, $Height),
        [System.Drawing.Color]::FromArgb(139, 92, 246),
        [System.Drawing.Color]::FromArgb(236, 72, 153)
    )
    $logoColorBlend = New-Object System.Drawing.Drawing2D.ColorBlend
    $logoColorBlend.Colors = @(
        [System.Drawing.Color]::FromArgb(139, 92, 246),
        [System.Drawing.Color]::FromArgb(20, 184, 166),
        [System.Drawing.Color]::FromArgb(236, 72, 153)
    )
    $logoColorBlend.Positions = @(0.0, 0.5, 1.0)
    $logoGradient.InterpolationColors = $logoColorBlend
    
    # Draw logo (centered, scaled)
    $logoSize = [Math]::Min($Width, $Height) * 0.3
    $logoX = ($Width - $logoSize) / 2
    $logoY = ($Height - $logoSize) / 2 - 100
    
    $logoPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $logoScale = $logoSize / 1024.0
    $logoPoints = @(
        [System.Drawing.PointF]::new($logoX + 200 * $logoScale, $logoY + 800 * $logoScale),
        [System.Drawing.PointF]::new($logoX + 350 * $logoScale, $logoY + 300 * $logoScale),
        [System.Drawing.PointF]::new($logoX + 500 * $logoScale, $logoY + 600 * $logoScale),
        [System.Drawing.PointF]::new($logoX + 650 * $logoScale, $logoY + 200 * $logoScale),
        [System.Drawing.PointF]::new($logoX + 800 * $logoScale, $logoY + 800 * $logoScale)
    )
    $logoPath.AddPolygon($logoPoints)
    $graphics.FillPath($logoGradient, $logoPath)
    
    # Text
    $font = New-Object System.Drawing.Font("Arial", $Width / 15, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(139, 92, 246))
    $textFormat = New-Object System.Drawing.StringFormat
    $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString("METR", $font, $textBrush, $Width / 2, $Height * 0.6, $textFormat)
    
    $font.Dispose()
    $textBrush.Dispose()
    $textFormat.Dispose()
    $bgBrush.Dispose()
    $logoGradient.Dispose()
    $logoPath.Dispose()
    
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

$splashSizes = @(
    @{name="mdpi"; width=320; height=480},
    @{name="hdpi"; width=480; height=800},
    @{name="xhdpi"; width=720; height=1280},
    @{name="xxhdpi"; width=1080; height=1920},
    @{name="xxxhdpi"; width=1440; height=2560}
)

foreach ($splash in $splashSizes) {
    $name = $splash.name
    $width = $splash.width
    $height = $splash.height
    $dir = "android\app\src\main\res\drawable-$name"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $splashPath = "$dir\splash_background.png"
    New-SplashScreen -Width $width -Height $height -OutputPath $splashPath
    
    # Also create splash.png
    Copy-Item $splashPath "$dir\splash.png" -Force
    
    Write-Host "  ✅ $name ($width x $height)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All assets created successfully!" -ForegroundColor Green
Write-Host ""

