# check-dependencies.ps1 - Check and update dependencies (PowerShell)

Write-Host "🔍 Checking METR dependencies..." -ForegroundColor Cyan

# Check Node version
$nodeVersion = node -v
Write-Host "Node version: $nodeVersion" -ForegroundColor Green

# Check npm version
$npmVersion = npm -v
Write-Host "npm version: $npmVersion" -ForegroundColor Green

# Check for outdated packages
Write-Host ""
Write-Host "📦 Checking for outdated packages..." -ForegroundColor Yellow
npm outdated

# Check for security vulnerabilities
Write-Host ""
Write-Host "🔒 Checking for security vulnerabilities..." -ForegroundColor Yellow
npm audit

# Check for missing dependencies
Write-Host ""
Write-Host "✅ Checking for missing dependencies..." -ForegroundColor Yellow
npm install --dry-run

Write-Host ""
Write-Host "✨ Dependency check complete!" -ForegroundColor Green


