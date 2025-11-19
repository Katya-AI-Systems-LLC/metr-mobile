# Git Cleanup Guide для METR

## Overview

Руководство по очистке Git репозитория.

## Cleanup Commands

### Remove Untracked Files

```bash
# Preview untracked files
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# Remove ignored files too
git clean -fX
```

### Remove Merged Branches

```bash
# List merged branches
git branch --merged

# Delete merged branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Delete remote tracking branches
git remote prune origin
```

### Cleanup Refs

```bash
# Remove stale refs
git fetch --prune

# Clean up reflog
git reflog expire --expire=90.days.ago --expire-unreachable=now --all
git gc --prune=now
```

### Optimize Repository

```bash
# Garbage collection
git gc

# Aggressive cleanup
git gc --aggressive --prune=now

# Repack
git repack -ad
```

## Remove Large Files

### Find Large Files

```bash
# Find large files in history
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -10
```

### Remove from History

```bash
# Use git filter-repo (recommended)
git filter-repo --path large-file --invert-paths

# Or git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch large-file" \
  --prune-empty --tag-name-filter cat -- --all
```

## Cleanup Script

```bash
#!/bin/bash
# cleanup.sh

echo "🧹 Cleaning up Git repository..."

# Remove merged branches
echo "Removing merged branches..."
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Prune remote refs
echo "Pruning remote refs..."
git remote prune origin

# Clean untracked files
echo "Cleaning untracked files..."
git clean -fd

# Garbage collection
echo "Running garbage collection..."
git gc --aggressive --prune=now

echo "✅ Cleanup complete!"
```

## Best Practices

1. **Regular cleanup**: Clean up regularly
2. **Backup first**: Backup before major cleanup
3. **Test**: Test cleanup on copy first
4. **Document**: Document cleanup steps
5. **Automate**: Automate regular cleanup

## Resources

- [Git Cleanup](https://git-scm.com/docs/git-gc)
- [Git Filter Repo](https://github.com/newren/git-filter-repo)


