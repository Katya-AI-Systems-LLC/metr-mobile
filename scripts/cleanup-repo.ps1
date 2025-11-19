# cleanup-repo.ps1 - Clean up Git repository (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🧹 Cleaning up Git repository..." -ForegroundColor Cyan

# Remove merged branches
Write-Host "📋 Checking for merged branches..." -ForegroundColor Yellow
$mergedBranches = git branch --merged | Where-Object { $_ -notmatch "\*|main|develop|master" }
if ($mergedBranches) {
    Write-Host "🗑️  Removing merged branches..." -ForegroundColor Yellow
    $mergedBranches | ForEach-Object { git branch -d $_.Trim() }
} else {
    Write-Host "✅ No merged branches to remove" -ForegroundColor Green
}

# Prune remote refs
Write-Host "🌿 Pruning remote refs..." -ForegroundColor Yellow
git remote prune origin

# Clean untracked files
Write-Host "🧽 Cleaning untracked files..." -ForegroundColor Yellow
$removeUntracked = Read-Host "Remove untracked files? (y/N)"
if ($removeUntracked -eq "y" -or $removeUntracked -eq "Y") {
    git clean -fd
} else {
    Write-Host "Skipping untracked files cleanup" -ForegroundColor Yellow
}

# Garbage collection
Write-Host "🗑️  Running garbage collection..." -ForegroundColor Yellow
git gc --aggressive --prune=now

# Show repository size
Write-Host ""
Write-Host "📊 Repository size:" -ForegroundColor Cyan
$size = (Get-ChildItem -Path .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "$([math]::Round($size, 2)) MB" -ForegroundColor White

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green


