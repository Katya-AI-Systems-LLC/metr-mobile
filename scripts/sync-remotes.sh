#!/bin/bash
# sync-remotes.sh - Sync repository to multiple remotes

set -e

REMOTES=(
    "origin:https://github.com/metr/metr-mobile.git"
    "gitlab:https://gitlab.com/metr/metr-mobile.git"
    "gitea:https://gitea.example.com/metr/metr-mobile.git"
)

BRANCH=$(git branch --show-current)

echo "🔄 Syncing to multiple remotes..."

for remote_info in "${REMOTES[@]}"; do
    IFS=':' read -r remote_name remote_url <<< "$remote_info"
    
    echo "📤 Pushing to $remote_name..."
    
    # Add remote if doesn't exist
    if ! git remote | grep -q "^$remote_name$"; then
        git remote add "$remote_name" "$remote_url"
    fi
    
    # Update remote URL
    git remote set-url "$remote_name" "$remote_url"
    
    # Push to remote
    git push "$remote_name" "$BRANCH" || echo "⚠️  Failed to push to $remote_name"
done

echo "✅ Sync complete!"


