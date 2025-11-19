# Git Aliases для METR

## Overview

Полезные Git aliases для ускорения работы.

## Setup

### Global Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

### Advanced Aliases

```bash
# Short log
git config --global alias.lg "log --oneline --decorate --graph --all"

# Last commit
git config --global alias.last "log -1 HEAD"

# Unstage
git config --global alias.unstage "reset HEAD --"

# Undo last commit
git config --global alias.undo "reset --soft HEAD~1"

# Stash with message
git config --global alias.stashm "stash push -m"

# Clean branches
git config --global alias.cleanup "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
```

## METR-Specific Aliases

```bash
# Quick commit
git config --global alias.qc "!f() { git add . && git commit -m \"$1\"; }; f"

# Feature branch
git config --global alias.fb "!f() { git checkout -b feature/$1; }; f"

# Bugfix branch
git config --global alias.bb "!f() { git checkout -b bugfix/$1; }; f"

# Hotfix branch
git config --global alias.hb "!f() { git checkout -b hotfix/$1; }; f"

# Sync with remote
git config --global alias.sync "!git fetch && git rebase origin/$(git branch --show-current)"

# Push and create PR
git config --global alias.pr "!f() { git push -u origin $(git branch --show-current) && echo 'PR URL: https://github.com/metr/metr-mobile/compare/$(git branch --show-current)'; }; f"
```

## Useful Commands

### View Aliases

```bash
git config --global --list | grep alias
```

### Remove Alias

```bash
git config --global --unset alias.alias-name
```

## Best Practices

1. **Keep it simple**: Don't overcomplicate aliases
2. **Document**: Document custom aliases
3. **Share**: Share useful aliases with team
4. **Test**: Test aliases before using

## Resources

- [Git Aliases](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases)


