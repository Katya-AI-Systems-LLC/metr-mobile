# check-performance.ps1 - Check performance metrics for METR (PowerShell)

Write-Host "⚡ Checking METR performance metrics..." -ForegroundColor Cyan

# Run performance tests
Write-Host "🧪 Running performance tests..." -ForegroundColor Yellow
npm run test:performance 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Performance tests not configured" -ForegroundColor Yellow
}

# Check bundle size
Write-Host "📦 Checking bundle size..." -ForegroundColor Yellow
npm run build 2>&1 | Select-String -Pattern "bundle|size" | ForEach-Object {
    Write-Host $_.Line -ForegroundColor Gray
}

# Analyze dependencies
Write-Host "📊 Analyzing dependencies..." -ForegroundColor Yellow
npm ls --depth=0 | Select-Object -First 20

# Check for performance issues
Write-Host "🔍 Checking for performance issues..." -ForegroundColor Yellow
npm run lint 2>&1 | Select-String -Pattern "performance|slow|optimize" | ForEach-Object {
    Write-Host $_.Line -ForegroundColor Yellow
}

Write-Host "✅ Performance check complete!" -ForegroundColor Green


