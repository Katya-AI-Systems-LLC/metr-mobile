# Git LFS Guide для METR

## Overview

Руководство по использованию Git LFS для больших файлов.

## What is Git LFS?

Git LFS (Large File Storage) позволяет хранить большие файлы вне основного репозитория.

## Installation

### Install Git LFS

```bash
# macOS
brew install git-lfs

# Linux
sudo apt-get install git-lfs

# Windows
# Download from https://git-lfs.github.com/
```

### Initialize Git LFS

```bash
# Initialize in repository
git lfs install
```

## Using Git LFS

### Track Large Files

```bash
# Track specific file types
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.mov"

# Track specific files
git lfs track "large-file.bin"

# Commit .gitattributes
git add .gitattributes
git commit -m "chore: add Git LFS tracking"
```

### Check Tracked Files

```bash
# List tracked patterns
git lfs track

# List LFS files
git lfs ls-files
```

### Clone with LFS

```bash
# Clone repository
git clone https://github.com/metr/metr-mobile.git

# LFS files are downloaded automatically
```

### Pull LFS Files

```bash
# Pull LFS files
git lfs pull

# Pull specific files
git lfs pull --include="*.psd"
```

## File Size Limits

### Recommended Limits

- **Small files**: < 100KB (regular Git)
- **Medium files**: 100KB - 50MB (Git LFS)
- **Large files**: > 50MB (External storage)

## Best Practices

1. **Track early**: Set up LFS before adding large files
2. **Use patterns**: Track file types, not individual files
3. **Document**: Document LFS usage
4. **Monitor**: Monitor LFS storage usage
5. **Cleanup**: Remove large files from history if needed

## Migration

### Migrate Existing Files

```bash
# Migrate files to LFS
git lfs migrate import --include="*.psd" --everything

# Force push (coordinate with team)
git push --force --all
```

## Resources

- [Git LFS Documentation](https://git-lfs.github.com/)
- [Git LFS Tutorial](https://git-lfs.github.com/)


