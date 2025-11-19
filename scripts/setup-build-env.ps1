# setup-build-env.ps1 - Setup Build Environment for METR
# This script helps set up the build environment for Android

Write-Host "=== METR Build Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Java
Write-Host "Step 1: Checking Java..." -ForegroundColor Yellow
$javaFound = $false

# Try to find Java in common locations
$javaPaths = @(
    "C:\Program Files\Java",
    "C:\Program Files (x86)\Java",
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Microsoft",
    "$env:ProgramFiles\Java",
    "$env:ProgramFiles(x86)\Java"
)

foreach ($basePath in $javaPaths) {
    if (Test-Path $basePath) {
        $jdkDirs = Get-ChildItem $basePath -Directory -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -like "*jdk*" -or $_.Name -like "*java*" } |
            Sort-Object Name -Descending
        
        if ($jdkDirs) {
            $latestJdk = $jdkDirs[0].FullName
            $javaExe = Join-Path $latestJdk "bin\java.exe"
            
            if (Test-Path $javaExe) {
                Write-Host "  Found Java at: $latestJdk" -ForegroundColor Green
                $env:JAVA_HOME = $latestJdk
                $env:PATH = "$latestJdk\bin;$env:PATH"
                $javaFound = $true
                
                # Test Java
                $javaVersion = & java -version 2>&1 | Select-Object -First 1
                Write-Host "  Java version: $javaVersion" -ForegroundColor Cyan
                break
            }
        }
    }
}

# Try where.exe as fallback
if (-not $javaFound) {
    $whereJava = where.exe java 2>$null
    if ($whereJava) {
        $javaPath = $whereJava | Select-Object -First 1
        $javaDir = Split-Path (Split-Path $javaPath -Parent) -Parent
        Write-Host "  Found Java via where.exe: $javaDir" -ForegroundColor Green
        $env:JAVA_HOME = $javaDir
        $javaFound = $true
    }
}

if (-not $javaFound) {
    Write-Host "  Java not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install JDK 17 or higher:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://adoptium.net/" -ForegroundColor Cyan
    Write-Host "  2. Install JDK 17 or higher" -ForegroundColor White
    Write-Host "  3. Set JAVA_HOME manually:" -ForegroundColor White
    Write-Host '     $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17-hotspot"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""

# Check Android SDK
Write-Host "Step 2: Checking Android SDK..." -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "  ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
    if (Test-Path $env:ANDROID_HOME) {
        Write-Host "  Android SDK found!" -ForegroundColor Green
    } else {
        Write-Host "  Warning: ANDROID_HOME path does not exist" -ForegroundColor Yellow
    }
} else {
    $defaultAndroidHome = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $defaultAndroidHome) {
        Write-Host "  Setting ANDROID_HOME to: $defaultAndroidHome" -ForegroundColor Green
        $env:ANDROID_HOME = $defaultAndroidHome
    } else {
        Write-Host "  Android SDK not found!" -ForegroundColor Red
        Write-Host "  Please install Android Studio or set ANDROID_HOME manually" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check Node.js
Write-Host "Step 3: Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "=== Environment Summary ===" -ForegroundColor Cyan
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor White
Write-Host ""
Write-Host "To make these settings permanent, add them to your system environment variables." -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready to build!" -ForegroundColor Green


