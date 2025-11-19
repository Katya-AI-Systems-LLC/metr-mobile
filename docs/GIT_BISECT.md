# Git Bisect Guide для METR

## Overview

Руководство по использованию git bisect для поиска багов.

## What is Git Bisect?

Git bisect использует бинарный поиск для нахождения коммита, который ввел баг.

## Basic Usage

### Start Bisect

```bash
# Start bisect
git bisect start

# Mark current commit as bad
git bisect bad

# Mark known good commit
git bisect good v2.1.0
```

### During Bisect

```bash
# Test the code
npm test

# Mark as good if tests pass
git bisect good

# Mark as bad if tests fail
git bisect bad

# Git will checkout different commits
# Repeat until bug is found
```

### Finish Bisect

```bash
# Reset to original branch
git bisect reset
```

## Automated Bisect

### Using Test Script

```bash
# Create test script
echo '#!/bin/bash
npm test' > test.sh
chmod +x test.sh

# Run automated bisect
git bisect start HEAD v2.1.0
git bisect run ./test.sh
git bisect reset
```

### Using npm Script

```bash
# Run bisect with npm script
git bisect start HEAD v2.1.0
git bisect run npm test
git bisect reset
```

## Advanced Usage

### Skip Commits

```bash
# Skip commit that can't be tested
git bisect skip
```

### Visualize Bisect

```bash
# See bisect log
git bisect log

# Replay bisect session
git bisect replay bisect.log
```

## Best Practices

1. **Know good commit**: Identify a known good commit
2. **Automate**: Use scripts for automated bisect
3. **Document**: Document the bug being searched
4. **Test thoroughly**: Test each commit carefully
5. **Reset**: Always reset after bisect

## Example

```bash
# Bug introduced between v2.1.0 and HEAD
git bisect start
git bisect bad HEAD
git bisect good v2.1.0

# Git checks out middle commit
# Test: npm test
# If fails: git bisect bad
# If passes: git bisect good

# Repeat until found
# Git shows the bad commit

# Reset
git bisect reset
```

## Resources

- [Git Bisect](https://git-scm.com/docs/git-bisect)
- [Git Bisect Tutorial](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git)


