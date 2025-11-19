# Git Stash Guide для METR

## Overview

Руководство по использованию git stash для временного сохранения изменений.

## Basic Usage

### Stash Changes

```bash
# Stash current changes
git stash

# Stash with message
git stash save "WIP: working on feature"

# Stash including untracked files
git stash -u

# Stash including ignored files
git stash -a
```

### List Stashes

```bash
# List stashes
git stash list

# Show stash content
git stash show

# Show detailed diff
git stash show -p
```

### Apply Stash

```bash
# Apply most recent stash
git stash apply

# Apply specific stash
git stash apply stash@{2}

# Apply and remove stash
git stash pop

# Apply specific stash and remove
git stash pop stash@{2}
```

### Delete Stash

```bash
# Delete most recent stash
git stash drop

# Delete specific stash
git stash drop stash@{2}

# Delete all stashes
git stash clear
```

## Advanced Usage

### Create Branch from Stash

```bash
# Create branch from stash
git stash branch new-branch stash@{1}
```

### Partial Stash

```bash
# Stash specific files
git stash push -m "message" file1.js file2.js

# Stash with pattern
git stash push -m "message" "*.js"
```

## Best Practices

1. **Use messages**: Always use descriptive messages
2. **Don't overuse**: Don't stash everything
3. **Apply soon**: Apply stashes soon after creating
4. **Clean up**: Delete old stashes
5. **Document**: Document why stashed

## Common Scenarios

### Switch Branches

```bash
# Stash current work
git stash save "WIP: feature work"

# Switch branches
git checkout other-branch

# Work on other branch
# Switch back
git checkout feature-branch

# Apply stash
git stash pop
```

### Pull Latest Changes

```bash
# Stash current changes
git stash

# Pull latest
git pull origin main

# Apply stash
git stash pop

# Resolve conflicts if any
```

## Resources

- [Git Stash](https://git-scm.com/docs/git-stash)
- [Git Stash Tutorial](https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning)


