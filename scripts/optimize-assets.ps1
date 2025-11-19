# optimize-assets.ps1 - Optimize assets for METR (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🎨 Optimizing METR assets..." -ForegroundColor Cyan

# Check for required tools
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npx not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Optimize images
Write-Host "🖼️  Optimizing images..." -ForegroundColor Yellow
Get-ChildItem -Path assets -Recurse -Include *.png,*.jpg,*.jpeg | ForEach-Object {
    Write-Host "Optimizing $($_.FullName)..." -ForegroundColor Gray
    npx sharp-cli -i $_.FullName -o $_.FullName --quality 80 --format webp
}

# Optimize SVGs
Write-Host "📐 Optimizing SVGs..." -ForegroundColor Yellow
Get-ChildItem -Path assets -Recurse -Include *.svg | ForEach-Object {
    Write-Host "Optimizing $($_.FullName)..." -ForegroundColor Gray
    npx svgo $_.FullName -o $_.FullName
}

Write-Host "✅ Asset optimization complete!" -ForegroundColor Green


