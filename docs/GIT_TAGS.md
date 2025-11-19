# Git Tags Guide для METR

## Overview

Руководство по использованию Git tags в проекте METR.

## Tag Types

### Annotated Tags (Recommended)

```bash
# Create annotated tag
git tag -a v2.2.0 -m "Release version 2.2.0"

# View tag
git show v2.2.0

# Push tag
git push origin v2.2.0
```

### Lightweight Tags

```bash
# Create lightweight tag
git tag v2.2.0

# Push tag
git push origin v2.2.0
```

## Versioning

### Semantic Versioning

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Examples

```
v2.2.0  # Minor release
v2.2.1  # Patch release
v3.0.0  # Major release
```

## Tagging Workflow

### Create Release Tag

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create tag
git tag -a v2.2.0 -m "Release v2.2.0: New features and bug fixes"

# Push tag
git push origin v2.2.0
```

### Create Pre-release Tag

```bash
# Pre-release tag
git tag -a v2.2.0-rc1 -m "Release candidate 1 for v2.2.0"
git push origin v2.2.0-rc1
```

### Create Beta Tag

```bash
# Beta tag
git tag -a v2.2.0-beta1 -m "Beta 1 for v2.2.0"
git push origin v2.2.0-beta1
```

## Tag Management

### List Tags

```bash
# List all tags
git tag

# List tags matching pattern
git tag -l "v2.2.*"

# List tags with messages
git tag -n
```

### Delete Tag

```bash
# Delete local tag
git tag -d v2.2.0

# Delete remote tag
git push origin --delete v2.2.0
```

### Checkout Tag

```bash
# Checkout tag (detached HEAD)
git checkout v2.2.0

# Create branch from tag
git checkout -b release/v2.2.0 v2.2.0
```

## Tagging Best Practices

1. **Use annotated tags**: More information
2. **Follow semantic versioning**: Clear versioning
3. **Tag releases**: Tag all releases
4. **Push tags**: Share tags with team
5. **Document tags**: Clear tag messages

## Automation

### Auto-tagging Script

```bash
#!/bin/bash
# auto-tag.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./auto-tag.sh v2.2.0"
    exit 1
fi

# Create tag
git tag -a "$VERSION" -m "Release $VERSION"

# Push tag
git push origin "$VERSION"

echo "Tagged and pushed $VERSION"
```

## Resources

- [Git Tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Semantic Versioning](https://semver.org/)


