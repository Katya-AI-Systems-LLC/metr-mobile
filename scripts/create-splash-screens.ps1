# create-splash-screens.ps1 - Create Splash Screens for Android
# Generates splash screens for all Android densities

param(
    [string]$SourceSVG = "assets\branding\metr-splash-screen.svg"
)

Write-Host "🖼️  Creating Splash Screens" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $SourceSVG)) {
    Write-Host "Creating splash screen SVG..." -ForegroundColor Yellow
    
    $baseDir = "assets\branding"
    if (-not (Test-Path $baseDir)) {
        New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    }
    
    # Create splash screen SVG
    $splashContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splash-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F0F0F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A1A1A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#splash-bg)"/>
  <g transform="translate(290, 760)">
    <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" fill="url(#logo-grad)" transform="scale(0.5)"/>
  </g>
  <text x="540" y="1200" font-family="system-ui" font-size="72" font-weight="bold" fill="#8B5CF6" text-anchor="middle">METR</text>
  <text x="540" y="1300" font-family="system-ui" font-size="32" fill="#A3A3A3" text-anchor="middle">Measure Your Team's Potential</text>
</svg>
"@
    $splashContent | Out-File -FilePath $SourceSVG -Encoding UTF8
    Write-Host "✅ Created splash screen SVG" -ForegroundColor Green
    Write-Host ""
}

$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $hasImageMagick) {
    Write-Host "⚠️  ImageMagick not found!" -ForegroundColor Yellow
    Write-Host "SVG created. Please convert manually." -ForegroundColor Yellow
    exit 1
}

# Android splash screen sizes
$splashSizes = @(
    @{name="mdpi"; width=320; height=480},
    @{name="hdpi"; width=480; height=800},
    @{name="xhdpi"; width=720; height=1280},
    @{name="xxhdpi"; width=1080; height=1920},
    @{name="xxxhdpi"; width=1440; height=2560}
)

Write-Host "Generating splash screens..." -ForegroundColor Yellow

foreach ($splash in $splashSizes) {
    $name = $splash.name
    $width = $splash.width
    $height = $splash.height
    $dir = "android\app\src\main\res\drawable-$name"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $splashPath = "$dir\splash_background.png"
    magick convert "$SourceSVG" -resize "${width}x${height}" "$splashPath" 2>$null
    
    # Also create splash.png (same as background)
    $splashPng = "$dir\splash.png"
    Copy-Item "$splashPath" "$splashPng" -Force
    
    Write-Host "  ✅ $name ($width x $height)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Splash screens created!" -ForegroundColor Green

