# Git Worktree Guide для METR

## Overview

Руководство по использованию git worktree для работы с несколькими ветками одновременно.

## What is Worktree?

Worktree позволяет иметь несколько рабочих директорий для одного репозитория.

## Basic Usage

### Create Worktree

```bash
# Create worktree for feature branch
git worktree add ../metr-feature feature/new-feature

# Create worktree from existing branch
git worktree add ../metr-hotfix hotfix/critical-fix

# Create worktree with new branch
git worktree add -b feature/new-feature ../metr-feature
```

### List Worktrees

```bash
# List all worktrees
git worktree list

# Show worktree paths
git worktree list --porcelain
```

### Remove Worktree

```bash
# Remove worktree
git worktree remove ../metr-feature

# Force remove (if worktree has uncommitted changes)
git worktree remove --force ../metr-feature
```

## Use Cases

### Multiple Features

```bash
# Main worktree
cd metr-mobile

# Feature 1
git worktree add ../metr-feature1 feature/feature1

# Feature 2
git worktree add ../metr-feature2 feature/feature2

# Work on both simultaneously
cd ../metr-feature1
# Make changes
cd ../metr-feature2
# Make changes
```

### Testing Different Versions

```bash
# Test version 2.1.0
git worktree add ../metr-v2.1.0 v2.1.0

# Test version 2.2.0
git worktree add ../metr-v2.2.0 v2.2.0

# Compare behavior
```

## Best Practices

1. **Organize paths**: Use consistent naming
2. **Clean up**: Remove unused worktrees
3. **Don't commit from multiple**: Avoid conflicts
4. **Use for testing**: Great for testing different versions
5. **Document**: Document worktree usage

## Resources

- [Git Worktree](https://git-scm.com/docs/git-worktree)


