# create-android-icons.ps1 - Create Android Icons from SVG
# Converts SVG logo to PNG icons for all Android densities

param(
    [string]$SourceSVG = "assets\branding\metr-logo-base.svg"
)

Write-Host "📱 Creating Android Icons" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $SourceSVG)) {
    Write-Host "❌ Source SVG not found: $SourceSVG" -ForegroundColor Red
    Write-Host "Creating base SVG..." -ForegroundColor Yellow
    
    $baseDir = "assets\branding"
    if (-not (Test-Path $baseDir)) {
        New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    }
    
    # Create base SVG if it doesn't exist
    $svgContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="metr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F0F0F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A1A1A;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#metr-bg)"/>
  <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" fill="url(#metr-gradient)"/>
</svg>
"@
    $svgContent | Out-File -FilePath $SourceSVG -Encoding UTF8
    Write-Host "✅ Created base SVG" -ForegroundColor Green
    Write-Host ""
}

$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $hasImageMagick) {
    Write-Host "⚠️  ImageMagick not found!" -ForegroundColor Yellow
    Write-Host "Install with: choco install imagemagick" -ForegroundColor White
    Write-Host "Or use online converter: https://cloudconvert.com/svg-to-png" -ForegroundColor White
    Write-Host ""
    Write-Host "SVG files created. Please convert manually:" -ForegroundColor Yellow
    exit 1
}

# Android icon sizes
$sizes = @(
    @{name="mdpi"; size=48},
    @{name="hdpi"; size=72},
    @{name="xhdpi"; size=96},
    @{name="xxhdpi"; size=144},
    @{name="xxxhdpi"; size=192}
)

Write-Host "Generating icons..." -ForegroundColor Yellow

foreach ($sizeInfo in $sizes) {
    $name = $sizeInfo.name
    $size = $sizeInfo.size
    $dir = "android\app\src\main\res\mipmap-$name"
    
    # Create directory
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Generate icon
    $iconPath = "$dir\ic_launcher.png"
    $roundIconPath = "$dir\ic_launcher_round.png"
    
    # Create square icon
    magick convert "$SourceSVG" -resize "${size}x${size}" -background none "$iconPath" 2>$null
    
    # Create round icon (same for now, Android will apply round mask)
    Copy-Item "$iconPath" "$roundIconPath" -Force
    
    # Create foreground (just the logo, no background)
    $foregroundSVG = $SourceSVG -replace 'metr-logo-base', 'metr-logo-foreground'
    if (-not (Test-Path $foregroundSVG)) {
        # Create foreground version (no background)
        $fgContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" fill="url(#metr-gradient)"/>
</svg>
"@
        $fgContent | Out-File -FilePath $foregroundSVG -Encoding UTF8
    }
    
    $foregroundPath = "$dir\ic_launcher_foreground.png"
    magick convert "$foregroundSVG" -resize "${size}x${size}" -background transparent "$foregroundPath" 2>$null
    
    # Create background (gradient only)
    $bgPath = "$dir\ic_launcher_background.png"
    magick convert -size "${size}x${size}" gradient:"#0F0F0F-#1A1A1A" "$bgPath" 2>$null
    
    Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Android icons created!" -ForegroundColor Green

