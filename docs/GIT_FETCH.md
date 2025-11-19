# Git Fetch Guide для METR

## Overview

Руководство по использованию git fetch для получения изменений.

## Basic Usage

### Fetch from Remote

```bash
# Fetch from origin
git fetch origin

# Fetch all remotes
git fetch --all

# Fetch specific branch
git fetch origin main

# Fetch tags
git fetch --tags
```

### Fetch Options

```bash
# Fetch with prune
git fetch --prune

# Fetch with force
git fetch --force

# Fetch specific ref
git fetch origin refs/heads/main:refs/remotes/origin/main
```

## Use Cases

### Check for Updates

```bash
# Fetch to see updates
git fetch origin

# Compare with local
git log HEAD..origin/main

# Merge if needed
git merge origin/main
```

### Update Remote Tracking

```bash
# Fetch to update remote tracking branches
git fetch origin

# View remote branches
git branch -r

# Checkout remote branch
git checkout -b local-branch origin/remote-branch
```

## Best Practices

1. **Fetch regularly**: Fetch before starting work
2. **Use prune**: Use --prune to clean up
3. **Check before merge**: Check changes before merging
4. **Update tracking**: Keep remote tracking updated
5. **Document**: Document fetch workflow

## Resources

- [Git Fetch](https://git-scm.com/docs/git-fetch)


