# Git Performance Guide для METR

## Overview

Руководство по оптимизации производительности Git.

## Repository Size

### Check Repository Size

```bash
# Repository size
du -sh .git

# Largest files
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -10
```

### Reduce Repository Size

```bash
# Clean up
git gc --aggressive --prune=now

# Remove large files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch large-file" \
  --prune-empty --tag-name-filter cat -- --all
```

## Shallow Clone

### Clone Shallow

```bash
# Clone with limited history
git clone --depth 1 https://github.com/metr/metr-mobile.git

# Increase depth if needed
git fetch --unshallow
```

## Sparse Checkout

### Enable Sparse Checkout

```bash
# Enable sparse checkout
git config core.sparseCheckout true

# Specify directories
echo "app/" >> .git/info/sparse-checkout
echo "docs/" >> .git/info/sparse-checkout

# Update working directory
git read-tree -mu HEAD
```

## Git Config Optimizations

### Performance Settings

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

## Large File Storage

### Use Git LFS

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.psd"
git lfs track "*.zip"

# Commit .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

## Best Practices

1. **Keep repos small**: Remove large files
2. **Use shallow clones**: For CI/CD
3. **Use sparse checkout**: For large repos
4. **Optimize config**: Enable performance settings
5. **Use Git LFS**: For large files
6. **Regular cleanup**: Run git gc regularly

## Resources

- [Git Performance](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)
- [Git LFS](https://git-lfs.github.com/)


