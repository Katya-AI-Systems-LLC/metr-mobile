# Build Android Debug APK for METR
Write-Host "Building METR Android Debug APK..." -ForegroundColor Cyan

# Set ANDROID_HOME if not set
if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Yellow
}

# Check JAVA_HOME
if (-not $env:JAVA_HOME) {
    Write-Host "ERROR: JAVA_HOME is not set!" -ForegroundColor Red
    Write-Host "Please set JAVA_HOME:" -ForegroundColor Yellow
    Write-Host '  $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"' -ForegroundColor Yellow
    exit 1
}

# Navigate to android directory
Set-Location android

# Clean
Write-Host "Cleaning..." -ForegroundColor Yellow
.\gradlew.bat clean

# Build
Write-Host "Building..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "Build successful!" -ForegroundColor Green
        Write-Host "APK: $apkPath" -ForegroundColor Cyan
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}

Set-Location ..


