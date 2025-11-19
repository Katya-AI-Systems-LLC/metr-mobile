# Git Attributes Guide для METR

## Overview

Руководство по использованию .gitattributes для контроля обработки файлов.

## Basic Usage

### Create .gitattributes

```bash
# Create .gitattributes
touch .gitattributes

# Or edit existing
vim .gitattributes
```

### Attribute Syntax

```gitattributes
# Set file attributes
*.js text eol=lf
*.sh text eol=lf
*.bat text eol=crlf

# Binary files
*.png binary
*.jpg binary
*.zip binary

# Diff settings
*.json diff=json
*.md diff=markdown

# Merge settings
*.lock merge=ours
```

## Common Attributes

### Line Endings

```gitattributes
# Unix line endings
* text=auto eol=lf

# Windows line endings
* text=auto eol=crlf

# Specific files
*.sh text eol=lf
*.bat text eol=crlf
```

### Binary Files

```gitattributes
# Images
*.png binary
*.jpg binary
*.gif binary

# Archives
*.zip binary
*.tar.gz binary

# Executables
*.exe binary
*.dll binary
```

### Diff Settings

```gitattributes
# JSON files
*.json diff=json

# Markdown files
*.md diff=markdown

# Custom diff
*.custom diff=custom
```

### Merge Settings

```gitattributes
# Lock files
package-lock.json merge=ours
yarn.lock merge=ours

# Config files
config.json merge=ours
```

## Best Practices

1. **Set early**: Set attributes early in project
2. **Be consistent**: Use consistent line endings
3. **Document**: Document custom attributes
4. **Test**: Test attribute effects
5. **Review**: Review attributes regularly

## Resources

- [Git Attributes](https://git-scm.com/docs/gitattributes)


