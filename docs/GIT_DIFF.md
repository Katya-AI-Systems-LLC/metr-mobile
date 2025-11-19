# Git Diff Guide для METR

## Overview

Руководство по использованию git diff для просмотра изменений.

## Basic Usage

### View Diff

```bash
# View unstaged changes
git diff

# View staged changes
git diff --staged

# View changes between commits
git diff HEAD~1 HEAD

# View changes between branches
git diff main..feature-branch
```

### Diff Options

```bash
# View diff with context
git diff -U5

# View diff for specific file
git diff file.js

# View diff for specific lines
git diff -L 10,20 file.js

# View word-level diff
git diff --word-diff

# View stat only
git diff --stat
```

## Advanced Usage

### Compare Specific Files

```bash
# Compare files between commits
git diff HEAD~1:file.js HEAD:file.js

# Compare files between branches
git diff main:file.js feature:file.js
```

### Diff Tools

```bash
# Use external diff tool
git difftool

# Configure diff tool
git config --global diff.tool vimdiff

# List available tools
git difftool --tool-help
```

## Use Cases

### Review Changes Before Commit

```bash
# Review unstaged changes
git diff

# Review staged changes
git diff --staged

# Review all changes
git diff HEAD
```

### Compare Versions

```bash
# Compare with previous version
git diff HEAD~1

# Compare with remote
git diff origin/main

# Compare specific commits
git diff <commit1> <commit2>
```

## Best Practices

1. **Review before commit**: Always review changes
2. **Use staging**: Stage changes to review separately
3. **Use tools**: Use diff tools for better visualization
4. **Document**: Document significant changes
5. **Test**: Test changes after reviewing

## Resources

- [Git Diff](https://git-scm.com/docs/git-diff)


