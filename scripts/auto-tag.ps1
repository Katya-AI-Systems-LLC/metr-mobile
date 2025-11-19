# auto-tag.ps1 - Automatically tag releases (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

# Validate version format
if ($Version -notmatch "^v\d+\.\d+\.\d+") {
    Write-Host "❌ Error: Invalid version format. Use vX.Y.Z" -ForegroundColor Red
    exit 1
}

# Check if tag exists
$tagExists = git rev-parse "$Version" 2>$null
if ($tagExists) {
    Write-Host "⚠️  Warning: Tag $Version already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        exit 1
    }
    git tag -d "$Version"
    git push origin --delete "$Version" 2>$null
}

# Ensure on main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "⚠️  Warning: Not on main branch (currently on $currentBranch)" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Get latest changes
Write-Host "📥 Pulling latest changes..." -ForegroundColor Cyan
git pull origin main

# Create annotated tag
Write-Host "🏷️  Creating tag $Version..." -ForegroundColor Cyan
$lastCommits = git log --oneline -10
$tagMessage = "Release $Version`n`n$lastCommits"
git tag -a "$Version" -m $tagMessage

# Push tag
Write-Host "📤 Pushing tag..." -ForegroundColor Cyan
git push origin "$Version"

Write-Host "✅ Tagged and pushed $Version" -ForegroundColor Green


