# generate-assets.ps1 - Generate METR Visual Assets
# PowerShell script to generate all METR branding assets

Write-Host "🎨 METR Asset Generation Script" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Check if ImageMagick is available
$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $hasImageMagick) {
    Write-Host "⚠️  ImageMagick not found. Installing instructions:" -ForegroundColor Yellow
    Write-Host "   choco install imagemagick" -ForegroundColor White
    Write-Host "   Or download from: https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host ""
}

# METR Colors
$colors = @{
    Primary = "#8B5CF6"
    Secondary = "#14B8A6"
    Accent = "#EC4899"
    DarkBg = "#0F0F0F"
    DarkSurface = "#1A1A1A"
}

# Android icon sizes
$androidSizes = @(
    @{name="mdpi"; size=48},
    @{name="hdpi"; size=72},
    @{name="xhdpi"; size=96},
    @{name="xxhdpi"; size=144},
    @{name="xxxhdpi"; size=192}
)

# Create base SVG logo
function New-METRLogoSVG {
    param([int]$Size = 1024)
    
    $svg = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="$Size" height="$Size" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:$($colors.Primary);stop-opacity:1" />
      <stop offset="50%" style="stop-color:$($colors.Secondary);stop-opacity:1" />
      <stop offset="100%" style="stop-color:$($colors.Accent);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="metr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:$($colors.DarkBg);stop-opacity:1" />
      <stop offset="100%" style="stop-color:$($colors.DarkSurface);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" rx="200" fill="url(#metr-bg)"/>
  
  <!-- Mountain M Symbol -->
  <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" 
        fill="url(#metr-gradient)" 
        stroke="none"/>
</svg>
"@
    return $svg
}

# Create splash screen SVG
function New-SplashScreenSVG {
    $svg = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splash-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:$($colors.DarkBg);stop-opacity:1" />
      <stop offset="100%" style="stop-color:$($colors.DarkSurface);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:$($colors.Primary);stop-opacity:1" />
      <stop offset="50%" style="stop-color:$($colors.Secondary);stop-opacity:1" />
      <stop offset="100%" style="stop-color:$($colors.Accent);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="1080" height="1920" fill="url(#splash-bg)"/>
  
  <g transform="translate(290, 760)">
    <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" 
          fill="url(#logo-grad)" 
          transform="scale(0.5)"/>
  </g>
  
  <text x="540" y="1200" font-family="system-ui" font-size="72" font-weight="bold" 
        fill="$($colors.Primary)" text-anchor="middle">METR</text>
  <text x="540" y="1300" font-family="system-ui" font-size="32" fill="#A3A3A3" 
        text-anchor="middle">Measure Your Team's Potential</text>
</svg>
"@
    return $svg
}

Write-Host "📱 Generating Android assets..." -ForegroundColor Yellow

# Generate Android icons
foreach ($sizeInfo in $androidSizes) {
    $name = $sizeInfo.name
    $size = $sizeInfo.size
    $dir = "android\app\src\main\res\mipmap-$name"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Generate SVG
    $svg = New-METRLogoSVG -Size $size
    $svgPath = "$dir\ic_launcher.svg"
    $svg | Out-File -FilePath $svgPath -Encoding UTF8
    
    # Convert to PNG if ImageMagick available
    if ($hasImageMagick) {
        $pngPath = "$dir\ic_launcher.png"
        magick convert "$svgPath" -background none "$pngPath" 2>$null
        Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $name SVG created (convert to PNG manually)" -ForegroundColor Yellow
    }
}

# Generate adaptive icon XMLs
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

Write-Host "  ✅ Adaptive icon XMLs created" -ForegroundColor Green
Write-Host ""

Write-Host "🖼️  Generating splash screens..." -ForegroundColor Yellow

# Generate splash screens for all densities
$splashSizes = @(
    @{name="mdpi"; width=320; height=480},
    @{name="hdpi"; width=480; height=800},
    @{name="xhdpi"; width=720; height=1280},
    @{name="xxhdpi"; width=1080; height=1920},
    @{name="xxxhdpi"; width=1440; height=2560}
)

foreach ($splash in $splashSizes) {
    $dir = "android\app\src\main\res\drawable-$($splash.name)"
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $svg = New-SplashScreenSVG
    $svgPath = "$dir\splash_background.svg"
    $svg | Out-File -FilePath $svgPath -Encoding UTF8
    
    if ($hasImageMagick) {
        $pngPath = "$dir\splash_background.png"
        magick convert "$svgPath" -resize "$($splash.width)x$($splash.height)" "$pngPath" 2>$null
        Write-Host "  ✅ $($splash.name) splash screen" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($splash.name) SVG created" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Asset generation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Convert SVG files to PNG using ImageMagick or online tools" -ForegroundColor White
Write-Host "  2. Replace icon files in Android/iOS projects" -ForegroundColor White
Write-Host "  3. Update splash screens" -ForegroundColor White
Write-Host ""

