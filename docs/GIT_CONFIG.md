# Git Config Guide для METR

## Overview

Руководство по настройке Git конфигурации.

## Configuration Levels

### System Level

```bash
# System-wide configuration
git config --system user.name "METR Team"
git config --system user.email "team@metr.app"
```

### Global Level

```bash
# User-level configuration
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Local Level

```bash
# Repository-specific configuration
git config --local user.name "Project Name"
git config --local user.email "project@metr.app"
```

## Common Settings

### User Information

```bash
# Set user name
git config --global user.name "Your Name"

# Set user email
git config --global user.email "your@email.com"

# Set signing key
git config --global user.signingkey YOUR_KEY_ID
```

### Editor

```bash
# Set default editor
git config --global core.editor "code --wait"

# Or vim
git config --global core.editor "vim"

# Or nano
git config --global core.editor "nano"
```

### Default Branch

```bash
# Set default branch name
git config --global init.defaultBranch main
```

### Line Endings

```bash
# Windows
git config --global core.autocrlf true

# Linux/Mac
git config --global core.autocrlf input

# Disable
git config --global core.autocrlf false
```

## Performance Settings

```bash
# Enable file system cache
git config --global core.preloadindex true
git config --global core.fscache true

# Enable multi-pack index
git config --global core.multiPackIndex true

# Optimize pack files
git config --global pack.threads 0
git config --global pack.windowMemory "256m"
```

## View Configuration

```bash
# List all config
git config --list

# List global config
git config --global --list

# List local config
git config --local --list

# Get specific value
git config user.name
```

## Edit Configuration

```bash
# Edit config file
git config --global --edit

# Or edit directly
# Global: ~/.gitconfig
# Local: .git/config
```

## Best Practices

1. **Set user info**: Always set name and email
2. **Use global**: Use global for personal settings
3. **Use local**: Use local for project-specific
4. **Document**: Document custom settings
5. **Review**: Review config regularly

## Resources

- [Git Config](https://git-scm.com/docs/git-config)


