# Git Rebase Guide для METR

## Overview

Руководство по использованию git rebase в проекте METR.

## What is Rebase?

Rebase перемещает или объединяет последовательность коммитов в новый базовый коммит.

## Basic Rebase

### Rebase Current Branch

```bash
# Update feature branch
git checkout feature/new-feature
git rebase main

# Resolve conflicts if any
# Continue rebase
git rebase --continue

# Abort if needed
git rebase --abort
```

### Interactive Rebase

```bash
# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Options:
# pick - use commit
# reword - change commit message
# edit - modify commit
# squash - combine with previous
# fixup - like squash, discard message
# drop - remove commit
```

## Rebase vs Merge

### When to Rebase

- ✅ Feature branches
- ✅ Clean history
- ✅ Before merging to main
- ✅ Personal branches

### When to Merge

- ✅ Shared branches
- ✅ Public branches
- ✅ Release branches
- ✅ When history matters

## Best Practices

1. **Don't rebase public branches**: Never rebase shared branches
2. **Rebase before merge**: Rebase feature branches before merging
3. **Use interactive**: Use interactive rebase for cleanup
4. **Test after rebase**: Always test after rebasing
5. **Communicate**: Tell team if rebasing shared branch

## Common Scenarios

### Update Feature Branch

```bash
# Rebase on latest main
git checkout feature/new-feature
git fetch origin
git rebase origin/main

# Force push (if branch is yours)
git push --force-with-lease origin feature/new-feature
```

### Clean Up Commits

```bash
# Interactive rebase
git rebase -i HEAD~5

# Squash commits
# Change "pick" to "squash" for commits to combine

# Edit commit messages
# Save and close editor
```

### Change Commit Message

```bash
# Interactive rebase
git rebase -i HEAD~3

# Change "pick" to "reword" for commit to change
# Save and close
# Edit commit message in new editor
```

## Resources

- [Git Rebase](https://git-scm.com/docs/git-rebase)
- [Git Rebase Tutorial](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)


