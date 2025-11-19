# Git Submodules Guide для METR

## Overview

Руководство по использованию Git submodules в проекте METR.

## What are Submodules?

Submodules позволяют включать один Git репозиторий в другой как подкаталог.

## Adding Submodules

### Add Submodule

```bash
# Add submodule
git submodule add https://github.com/user/repo.git path/to/submodule

# Initialize and update
git submodule update --init --recursive
```

### Clone Repository with Submodules

```bash
# Clone with submodules
git clone --recursive https://github.com/metr/metr-mobile.git

# Or clone then init
git clone https://github.com/metr/metr-mobile.git
cd metr-mobile
git submodule update --init --recursive
```

## Working with Submodules

### Update Submodule

```bash
# Update to latest
cd path/to/submodule
git pull origin main
cd ../..
git add path/to/submodule
git commit -m "chore: update submodule"
```

### Update All Submodules

```bash
# Update all submodules
git submodule update --remote --merge

# Commit updates
git add .
git commit -m "chore: update all submodules"
```

### Check Submodule Status

```bash
# Check submodule status
git submodule status

# Detailed status
git submodule foreach git status
```

## Removing Submodules

### Remove Submodule

```bash
# Remove submodule
git submodule deinit -f path/to/submodule
git rm -f path/to/submodule
rm -rf .git/modules/path/to/submodule
git commit -m "chore: remove submodule"
```

## Best Practices

1. **Use sparingly**: Only when necessary
2. **Pin versions**: Use specific commits
3. **Document**: Document why submodule is used
4. **Update carefully**: Test updates before committing
5. **Consider alternatives**: Git subtree or monorepo

## Alternatives

### Git Subtree

```bash
# Add subtree
git subtree add --prefix=path/to/subtree https://github.com/user/repo.git main --squash

# Update subtree
git subtree pull --prefix=path/to/subtree https://github.com/user/repo.git main --squash
```

### Monorepo

- Single repository for all code
- Easier to manage
- Better for related projects

## Resources

- [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Git Subtree](https://www.atlassian.com/git/tutorials/git-subtree)


