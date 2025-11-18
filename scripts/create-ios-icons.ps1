# create-ios-icons.ps1 - Create iOS Icons from SVG
# Converts SVG logo to PNG icons for all iOS sizes

param(
    [string]$SourceSVG = "assets\branding\metr-logo-base.svg"
)

Write-Host "🍎 Creating iOS Icons" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $SourceSVG)) {
    Write-Host "❌ Source SVG not found: $SourceSVG" -ForegroundColor Red
    exit 1
}

$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $hasImageMagick) {
    Write-Host "⚠️  ImageMagick not found!" -ForegroundColor Yellow
    Write-Host "Install with: choco install imagemagick" -ForegroundColor White
    exit 1
}

# iOS icon sizes (pt x multiplier = px)
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

Write-Host "Generating iOS icons..." -ForegroundColor Yellow

foreach ($icon in $iosIcons) {
    $name = $icon.name
    $size = $icon.size
    $iconPath = "$iconSetDir\$name.png"
    
    magick convert "$SourceSVG" -resize "${size}x${size}" -background none "$iconPath" 2>$null
    
    Write-Host "  ✅ $name ($size x $size)" -ForegroundColor Green
}

# Create Contents.json for Asset Catalog
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

Write-Host ""
Write-Host "✅ iOS icons created!" -ForegroundColor Green
Write-Host "✅ Contents.json created!" -ForegroundColor Green

