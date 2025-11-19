# Git Cherry-Pick Guide для METR

## Overview

Руководство по использованию git cherry-pick для применения отдельных коммитов.

## Basic Usage

### Cherry-Pick Commit

```bash
# Cherry-pick single commit
git cherry-pick <commit-hash>

# Cherry-pick multiple commits
git cherry-pick <commit1> <commit2> <commit3>

# Cherry-pick range
git cherry-pick <start-commit>..<end-commit>
```

### Cherry-Pick Options

```bash
# Cherry-pick without committing
git cherry-pick --no-commit <commit-hash>

# Cherry-pick and edit commit message
git cherry-pick --edit <commit-hash>

# Cherry-pick with signoff
git cherry-pick --signoff <commit-hash>
```

## Use Cases

### Apply Hotfix to Multiple Branches

```bash
# Fix in main
git checkout main
git commit -m "fix: critical bug"

# Apply to develop
git checkout develop
git cherry-pick <commit-hash>

# Apply to release branch
git checkout release/v2.2.0
git cherry-pick <commit-hash>
```

### Backport Features

```bash
# Feature in develop
git checkout develop
git log --oneline

# Backport to release branch
git checkout release/v2.2.0
git cherry-pick <feature-commit>
```

## Conflict Resolution

### Resolve Conflicts

```bash
# Cherry-pick causes conflict
git cherry-pick <commit-hash>

# Resolve conflicts
# Edit conflicted files

# Continue cherry-pick
git add <resolved-files>
git cherry-pick --continue

# Abort if needed
git cherry-pick --abort
```

## Best Practices

1. **Use sparingly**: Prefer merge when possible
2. **Test after**: Always test after cherry-pick
3. **Document**: Document why cherry-picked
4. **Avoid duplicates**: Check if already applied
5. **Coordinate**: Coordinate with team

## Resources

- [Git Cherry-Pick](https://git-scm.com/docs/git-cherry-pick)


