# analyze-bundle.ps1 - Analyze bundle size for METR (PowerShell)

Write-Host "📦 Analyzing METR bundle size..." -ForegroundColor Cyan

# Check for npx
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npx not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Run bundle analyzer
Write-Host "🔍 Running bundle analyzer..." -ForegroundColor Yellow
npx react-native-bundle-visualizer

# Analyze Android bundle
if (Test-Path "android") {
    Write-Host "📱 Analyzing Android bundle..." -ForegroundColor Yellow
    Push-Location android
    ./gradlew bundleRelease
    Pop-Location
}

# Analyze iOS bundle
if (Test-Path "ios") {
    Write-Host "🍎 Analyzing iOS bundle..." -ForegroundColor Yellow
    Push-Location ios
    xcodebuild -workspace Mattermost.xcworkspace `
        -scheme MatterR `
        -configuration Release `
        archive
    Pop-Location
}

Write-Host "✅ Bundle analysis complete!" -ForegroundColor Green
Write-Host "📊 Check bundle-visualizer report for details." -ForegroundColor Cyan


