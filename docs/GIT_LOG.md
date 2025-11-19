# Git Log Guide для METR

## Overview

Руководство по использованию git log для просмотра истории коммитов.

## Basic Usage

### View Log

```bash
# View log
git log

# View log with one line per commit
git log --oneline

# View log with graph
git log --oneline --graph --all

# View log with decorations
git log --oneline --decorate
```

### Log Options

```bash
# Limit number of commits
git log -10

# View log since date
git log --since="2024-01-01"

# View log until date
git log --until="2024-12-31"

# View log for author
git log --author="John Doe"

# View log for file
git log -- file.js

# View log with diff
git log -p

# View log with stat
git log --stat
```

## Advanced Usage

### Custom Format

```bash
# Custom log format
git log --pretty=format:"%h - %an, %ar : %s"

# Show only commit hash and message
git log --pretty=format:"%h %s"

# Show full details
git log --pretty=fuller
```

### Search Log

```bash
# Search in commit messages
git log --grep="bug"

# Search in code
git log -S "functionName"

# Search in code with regex
git log -G "regex pattern"
```

## Use Cases

### Find When Bug Was Introduced

```bash
# Search for bug-related commits
git log --grep="bug" --oneline

# Search in code
git log -S "buggyCode" -p
```

### Review Changes

```bash
# Review changes in feature branch
git log main..feature-branch

# Review changes with diff
git log main..feature-branch -p
```

## Best Practices

1. **Use filters**: Filter log to find relevant commits
2. **Use format**: Customize output for readability
3. **Combine options**: Combine multiple options
4. **Save output**: Save log output for reference
5. **Document**: Document important findings

## Resources

- [Git Log](https://git-scm.com/docs/git-log)


