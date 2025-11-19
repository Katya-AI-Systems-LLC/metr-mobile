#!/bin/bash
# auto-tag.sh - Automatically tag releases

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: Version required"
    echo "Usage: ./auto-tag.sh v2.2.0"
    exit 1
fi

# Validate version format
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "❌ Error: Invalid version format. Use vX.Y.Z"
    exit 1
fi

# Check if tag exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "⚠️  Warning: Tag $VERSION already exists"
    read -p "Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    git tag -d "$VERSION"
    git push origin --delete "$VERSION" || true
fi

# Ensure on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch (currently on $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Create annotated tag
echo "🏷️  Creating tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION

$(git log --oneline -10)"

# Push tag
echo "📤 Pushing tag..."
git push origin "$VERSION"

echo "✅ Tagged and pushed $VERSION"


