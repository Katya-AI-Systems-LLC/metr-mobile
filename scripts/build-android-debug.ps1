# build-android-debug.ps1 - Build Android Debug APK Script
# PowerShell script for building METR Android debug APK

Write-Host "🚀 Building METR Android Debug APK..." -ForegroundColor Cyan

# Check if JAVA_HOME is set
if (-not $env:JAVA_HOME) {
    Write-Host "❌ ERROR: JAVA_HOME is not set!" -ForegroundColor Red
    Write-Host "Please set JAVA_HOME environment variable:" -ForegroundColor Yellow
    Write-Host '  $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"' -ForegroundColor Yellow
    Write-Host "Or install JDK 17 and set it in system environment variables" -ForegroundColor Yellow
    exit 1
}

# Check if Android SDK is configured
if (-not $env:ANDROID_HOME) {
    Write-Host "⚠️  WARNING: ANDROID_HOME is not set!" -ForegroundColor Yellow
    Write-Host "Setting default Android SDK location..." -ForegroundColor Yellow
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
}

# Navigate to android directory
Set-Location android

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
.\gradlew.bat clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean failed!" -ForegroundColor Red
    exit 1
}

# Build debug APK
Write-Host "🔨 Building debug APK..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Find the generated APK
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkFullPath = (Resolve-Path $apkPath).Path
    $apkSize = (Get-Item $apkPath).Length / 1MB
    
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📦 APK location: $apkFullPath" -ForegroundColor Cyan
    Write-Host "📊 APK size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    
    # Copy to root for easy access
    Copy-Item $apkPath -Destination "..\metr-debug.apk" -Force
    Write-Host "📋 APK also copied to: metr-debug.apk" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  APK not found at expected location: $apkPath" -ForegroundColor Yellow
}

Set-Location ..

Write-Host "🎉 Done!" -ForegroundColor Green

