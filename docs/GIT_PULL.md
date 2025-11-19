# Git Pull Guide для METR

## Overview

Руководство по использованию git pull для получения и объединения изменений.

## Basic Usage

### Pull from Remote

```bash
# Pull from origin
git pull origin main

# Pull current branch
git pull

# Pull with rebase
git pull --rebase origin main

# Pull all remotes
git pull --all
```

### Pull Options

```bash
# Pull with no commit
git pull --no-commit origin main

# Pull with squash
git pull --squash origin main

# Pull with fast-forward only
git pull --ff-only origin main
```

## Pull vs Fetch + Merge

### Pull (Fetch + Merge)

```bash
# Pull = fetch + merge
git pull origin main
```

### Fetch + Merge Separately

```bash
# Fetch first
git fetch origin

# Check changes
git log HEAD..origin/main

# Merge if needed
git merge origin/main
```

## Best Practices

1. **Fetch first**: Fetch to see changes first
2. **Use rebase**: Use --rebase for cleaner history
3. **Resolve conflicts**: Resolve conflicts carefully
4. **Test after pull**: Test after pulling changes
5. **Document**: Document pull workflow

## Resources

- [Git Pull](https://git-scm.com/docs/git-pull)


