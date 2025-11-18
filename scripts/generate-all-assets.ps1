# generate-all-assets.ps1 - Generate All METR Brand Assets
# Master script to generate all visual assets for rebranding

Write-Host "🎨 METR Complete Asset Generation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check ImageMagick
$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $hasImageMagick) {
    Write-Host "⚠️  ImageMagick not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install ImageMagick:" -ForegroundColor White
    Write-Host "  choco install imagemagick" -ForegroundColor Cyan
    Write-Host "  Or: https://imagemagick.org/script/download.php" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "SVG files will be created, but PNG conversion will be skipped." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Step 1: Create base SVG assets
Write-Host "📐 Step 1: Creating base SVG assets..." -ForegroundColor Yellow
& "$PSScriptRoot\generate-assets.ps1"
Write-Host ""

# Step 2: Create Android icons
Write-Host "📱 Step 2: Creating Android icons..." -ForegroundColor Yellow
& "$PSScriptRoot\create-android-icons.ps1"
Write-Host ""

# Step 3: Create iOS icons
Write-Host "🍎 Step 3: Creating iOS icons..." -ForegroundColor Yellow
& "$PSScriptRoot\create-ios-icons.ps1"
Write-Host ""

# Step 4: Create splash screens
Write-Host "🖼️  Step 4: Creating splash screens..." -ForegroundColor Yellow
& "$PSScriptRoot\create-splash-screens.ps1"
Write-Host ""

Write-Host "✅ All assets generated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Base SVG assets created" -ForegroundColor White
Write-Host "  ✅ Android icons (all densities)" -ForegroundColor White
Write-Host "  ✅ iOS icons (all sizes)" -ForegroundColor White
Write-Host "  ✅ Splash screens (all densities)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review generated assets" -ForegroundColor White
Write-Host "  2. Test on devices" -ForegroundColor White
Write-Host "  3. Build and deploy" -ForegroundColor White
Write-Host ""

