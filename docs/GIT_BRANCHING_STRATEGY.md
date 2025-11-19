# Git Branching Strategy для METR

## Overview

Стратегия ветвления для проекта METR.

## Branch Types

### Main Branches

#### main
- Production-ready code
- Protected branch
- Only merged from release branches
- Tagged with versions

#### develop
- Integration branch
- All features merged here
- Testing happens here
- Protected branch

### Supporting Branches

#### Feature Branches
```
feature/feature-name
```
- Created from: develop
- Merged to: develop
- Naming: feature/description
- Lifecycle: Temporary, deleted after merge

#### Bugfix Branches
```
bugfix/bug-description
```
- Created from: develop or main
- Merged to: develop or main
- Naming: bugfix/description
- Lifecycle: Temporary, deleted after merge

#### Hotfix Branches
```
hotfix/hotfix-description
```
- Created from: main
- Merged to: main and develop
- Naming: hotfix/description
- Lifecycle: Temporary, deleted after merge

#### Release Branches
```
release/v2.2.0
```
- Created from: develop
- Merged to: main and develop
- Naming: release/version
- Lifecycle: Temporary, deleted after merge

## Workflow

### Feature Development

```bash
# Start feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
# Create PR: feature/new-feature -> develop
```

### Bug Fix

```bash
# Start bugfix
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-bug

# Fix bug
git add .
git commit -m "fix: resolve bug"

# Push and create PR
git push origin bugfix/fix-bug
# Create PR: bugfix/fix-bug -> develop
```

### Hotfix

```bash
# Start hotfix
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Fix critical issue
git add .
git commit -m "fix: critical security fix"

# Push and create PRs
git push origin hotfix/critical-fix
# Create PR: hotfix/critical-fix -> main
# Create PR: hotfix/critical-fix -> develop
```

### Release

```bash
# Start release
git checkout develop
git pull origin develop
git checkout -b release/v2.2.0

# Prepare release
# Update version numbers
# Update changelog
git add .
git commit -m "chore: prepare release v2.2.0"

# Push and create PRs
git push origin release/v2.2.0
# Create PR: release/v2.2.0 -> main
# Create PR: release/v2.2.0 -> develop
```

## Branch Protection

### Main Branch
- Require pull request
- Require 2 approvals
- Require status checks
- No direct pushes
- Require signed commits

### Develop Branch
- Require pull request
- Require 1 approval
- Require status checks
- No direct pushes

## Best Practices

1. **Keep branches short-lived**: Merge quickly
2. **One feature per branch**: Focused changes
3. **Regular sync**: Sync with develop regularly
4. **Clear naming**: Descriptive branch names
5. **Delete after merge**: Clean up merged branches

## Cleanup

### Delete Merged Branches

```bash
# Local cleanup
git branch --merged develop | grep -v "\*\|develop\|main" | xargs -n 1 git branch -d

# Remote cleanup
git remote prune origin
```

## Resources

- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [GitHub Flow](https://guides.github.com/introduction/flow/)


