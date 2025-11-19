#!/bin/bash
# cleanup-repo.sh - Clean up Git repository

set -e

echo "🧹 Cleaning up Git repository..."

# Remove merged branches
echo "📋 Checking for merged branches..."
MERGED_BRANCHES=$(git branch --merged | grep -v "\*\|main\|develop\|master" || true)
if [ -n "$MERGED_BRANCHES" ]; then
    echo "🗑️  Removing merged branches..."
    echo "$MERGED_BRANCHES" | xargs -n 1 git branch -d
else
    echo "✅ No merged branches to remove"
fi

# Prune remote refs
echo "🌿 Pruning remote refs..."
git remote prune origin

# Clean untracked files
echo "🧽 Cleaning untracked files..."
read -p "Remove untracked files? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git clean -fd
else
    echo "Skipping untracked files cleanup"
fi

# Garbage collection
echo "🗑️  Running garbage collection..."
git gc --aggressive --prune=now

# Show repository size
echo ""
echo "📊 Repository size:"
du -sh .git

echo ""
echo "✅ Cleanup complete!"


