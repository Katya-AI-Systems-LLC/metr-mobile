# sync-remotes.ps1 - Sync repository to multiple remotes (PowerShell)

$ErrorActionPreference = "Stop"

$Remotes = @(
    @{Name="origin"; Url="https://github.com/metr/metr-mobile.git"},
    @{Name="gitlab"; Url="https://gitlab.com/metr/metr-mobile.git"},
    @{Name="gitea"; Url="https://gitea.example.com/metr/metr-mobile.git"}
)

$Branch = git branch --show-current

Write-Host "🔄 Syncing to multiple remotes..." -ForegroundColor Cyan

foreach ($remote in $Remotes) {
    Write-Host "📤 Pushing to $($remote.Name)..." -ForegroundColor Yellow
    
    # Add remote if doesn't exist
    $existingRemotes = git remote
    if ($existingRemotes -notcontains $remote.Name) {
        git remote add $remote.Name $remote.Url
    }
    
    # Update remote URL
    git remote set-url $remote.Name $remote.Url
    
    # Push to remote
    try {
        git push $remote.Name $Branch
    } catch {
        Write-Host "⚠️  Failed to push to $($remote.Name)" -ForegroundColor Yellow
    }
}

Write-Host "✅ Sync complete!" -ForegroundColor Green


