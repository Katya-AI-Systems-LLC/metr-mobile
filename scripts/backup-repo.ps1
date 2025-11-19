# backup-repo.ps1 - Backup METR repository (PowerShell)

$ErrorActionPreference = "Stop"

$RepoUrl = if ($env:REPO_URL) { $env:REPO_URL } else { "https://github.com/metr/metr-mobile.git" }
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "./backups" }
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupName = "metr-mobile-backup-$Date"

Write-Host "🔄 Starting backup..." -ForegroundColor Cyan

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Clone mirror
Write-Host "📦 Cloning repository..." -ForegroundColor Yellow
git clone --mirror $RepoUrl "$BackupDir\$BackupName.git"

# Create bundle
Write-Host "📦 Creating bundle..." -ForegroundColor Yellow
Push-Location "$BackupDir"
git --git-dir="$BackupName.git" bundle create "$BackupName.bundle" --all
Pop-Location

# Compress
Write-Host "🗜️  Compressing..." -ForegroundColor Yellow
Compress-Archive -Path "$BackupDir\$BackupName.git", "$BackupDir\$BackupName.bundle" -DestinationPath "$BackupDir\$BackupName.zip" -Force

# Remove uncompressed files
Remove-Item -Recurse -Force "$BackupDir\$BackupName.git", "$BackupDir\$BackupName.bundle"

# Cleanup old backups (keep last 30 days)
Write-Host "🧹 Cleaning up old backups..." -ForegroundColor Yellow
Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item

Write-Host "✅ Backup complete: $BackupDir\$BackupName.zip" -ForegroundColor Green


