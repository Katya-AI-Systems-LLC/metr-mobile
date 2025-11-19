# Git Push Guide для METR

## Overview

Руководство по использованию git push для отправки изменений.

## Basic Usage

### Push to Remote

```bash
# Push current branch
git push origin

# Push specific branch
git push origin main

# Push all branches
git push --all origin

# Push tags
git push --tags origin
```

### Push Options

```bash
# Push with force (use with caution)
git push --force origin main

# Push with force-with-lease (safer)
git push --force-with-lease origin main

# Push without tags
git push --no-tags origin main

# Push with verbose output
git push --verbose origin main
```

## Use Cases

### Push Feature Branch

```bash
# Push feature branch
git push origin feature/new-feature

# Set upstream
git push -u origin feature/new-feature

# Push and create PR
git push origin feature/new-feature
```

### Push Tags

```bash
# Push single tag
git push origin v2.2.0

# Push all tags
git push --tags origin

# Push annotated tags only
git push --follow-tags origin
```

## Best Practices

1. **Use upstream**: Set upstream with -u
2. **Use force-with-lease**: Safer than --force
3. **Never force main**: Never force push to main
4. **Push regularly**: Push work regularly
5. **Test before push**: Test before pushing

## Resources

- [Git Push](https://git-scm.com/docs/git-push)


