# Git Patch Guide для METR

## Overview

Руководство по созданию и применению Git patches.

## Creating Patches

### Create Patch

```bash
# Create patch from last commit
git format-patch -1 HEAD

# Create patch from range
git format-patch HEAD~3..HEAD

# Create patch from branch
git format-patch main..feature-branch

# Create patch with numbered files
git format-patch -3 --numbered-files
```

### Patch Options

```bash
# Include commit message
git format-patch -1 HEAD

# Include diffstat
git format-patch --stat -1 HEAD

# Include cover letter
git format-patch --cover-letter -1 HEAD
```

## Applying Patches

### Apply Patch

```bash
# Apply patch
git apply patch-file.patch

# Check patch without applying
git apply --check patch-file.patch

# Apply with 3-way merge
git apply --3way patch-file.patch
```

### Apply with am

```bash
# Apply patch and create commit
git am patch-file.patch

# Apply multiple patches
git am *.patch

# Continue after conflict resolution
git am --continue

# Abort patch application
git am --abort
```

## Use Cases

### Share Changes Without Push

```bash
# Create patch
git format-patch HEAD~1

# Email patch
git send-email patch-file.patch

# Or share file manually
```

### Backup Changes

```bash
# Create patch backup
git format-patch origin/main..HEAD -o patches/

# Restore later
git am patches/*.patch
```

## Best Practices

1. **Test patches**: Test before sharing
2. **Clear messages**: Use clear commit messages
3. **One change per patch**: Keep patches focused
4. **Document**: Document patch purpose
5. **Verify**: Verify patches apply correctly

## Resources

- [Git Patch](https://git-scm.com/docs/git-format-patch)
- [Git Apply](https://git-scm.com/docs/git-apply)


