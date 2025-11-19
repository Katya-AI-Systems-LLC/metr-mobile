# Git Reflog Guide для METR

## Overview

Руководство по использованию git reflog для восстановления потерянных коммитов.

## What is Reflog?

Reflog отслеживает изменения в HEAD и других ссылках.

## Basic Usage

### View Reflog

```bash
# View reflog
git reflog

# View reflog for specific branch
git reflog show branch-name

# View reflog with dates
git reflog --date=relative

# View reflog with timestamps
git reflog --date=iso
```

### Recover Lost Commits

```bash
# View reflog to find lost commit
git reflog

# Recover commit
git checkout <commit-hash>

# Create branch from recovered commit
git checkout -b recovery-branch <commit-hash>
```

## Use Cases

### Recover Deleted Branch

```bash
# View reflog
git reflog

# Find branch deletion
# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

### Recover After Reset

```bash
# After hard reset
git reset --hard HEAD~3

# View reflog
git reflog

# Recover previous state
git reset --hard <commit-hash>
```

## Reflog Expiration

### Configure Expiration

```bash
# Set expiration time
git config gc.reflogExpire "90.days"

# Set unreachable expiration
git config gc.reflogExpireUnreachable "30.days"
```

### Clean Reflog

```bash
# Expire old entries
git reflog expire --expire=90.days.ago --expire-unreachable=now --all

# Run garbage collection
git gc --prune=now
```

## Best Practices

1. **Use for recovery**: Use reflog to recover lost work
2. **Don't rely on it**: Reflog can expire
3. **Backup**: Don't rely solely on reflog
4. **Document**: Document recovery process
5. **Test**: Test recovery process

## Resources

- [Git Reflog](https://git-scm.com/docs/git-reflog)


