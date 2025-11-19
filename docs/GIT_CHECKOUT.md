# Git Checkout Guide для METR

## Overview

Руководство по использованию git checkout для переключения между ветками и коммитами.

## Basic Usage

### Checkout Branch

```bash
# Checkout existing branch
git checkout main

# Checkout and create branch
git checkout -b feature/new-feature

# Checkout remote branch
git checkout -b local-branch origin/remote-branch
```

### Checkout Commit

```bash
# Checkout specific commit
git checkout <commit-hash>

# Checkout tag
git checkout v2.2.0

# Checkout file from commit
git checkout <commit-hash> -- file.js
```

## New Git Switch Command

### Switch Branch (Git 2.23+)

```bash
# Switch to branch
git switch main

# Switch and create branch
git switch -c feature/new-feature

# Switch to previous branch
git switch -
```

## Best Practices

1. **Commit before checkout**: Commit or stash before switching
2. **Use switch**: Use git switch for branches (newer Git)
3. **Check status**: Check status before checkout
4. **Create branches**: Create branches for new work
5. **Document**: Document checkout workflow

## Resources

- [Git Checkout](https://git-scm.com/docs/git-checkout)
- [Git Switch](https://git-scm.com/docs/git-switch)


