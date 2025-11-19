# Git Remote Guide для METR

## Overview

Руководство по работе с Git remotes.

## Basic Usage

### View Remotes

```bash
# List remotes
git remote

# List remotes with URLs
git remote -v

# Show remote details
git remote show origin
```

### Add Remote

```bash
# Add remote
git remote add upstream https://github.com/original/repo.git

# Add remote with short name
git remote add gitlab https://gitlab.com/user/repo.git
```

### Remove Remote

```bash
# Remove remote
git remote remove upstream

# Or
git remote rm upstream
```

### Update Remote URL

```bash
# Change remote URL
git remote set-url origin https://new-url.com/repo.git

# Verify change
git remote -v
```

## Fetching and Pulling

### Fetch

```bash
# Fetch from remote
git fetch origin

# Fetch all remotes
git fetch --all

# Fetch specific branch
git fetch origin main

# Fetch with prune
git fetch --prune
```

### Pull

```bash
# Pull from remote
git pull origin main

# Pull with rebase
git pull --rebase origin main

# Pull all remotes
git pull --all
```

### Push

```bash
# Push to remote
git push origin main

# Push all branches
git push --all origin

# Push tags
git push --tags origin

# Force push (use with caution)
git push --force-with-lease origin main
```

## Multiple Remotes

### Setup Multiple Remotes

```bash
# Add GitHub remote
git remote add github https://github.com/user/repo.git

# Add GitLab remote
git remote add gitlab https://gitlab.com/user/repo.git

# Push to both
git push github main
git push gitlab main
```

### Sync Multiple Remotes

```bash
# Push to all remotes
git remote | xargs -I {} git push {} main

# Or use script
./scripts/sync-remotes.sh
```

## Best Practices

1. **Use descriptive names**: Name remotes clearly
2. **Keep URLs updated**: Update remote URLs when needed
3. **Use --force-with-lease**: Safer than --force
4. **Fetch before pull**: Fetch to see changes first
5. **Document remotes**: Document remote purposes

## Resources

- [Git Remote](https://git-scm.com/docs/git-remote)


