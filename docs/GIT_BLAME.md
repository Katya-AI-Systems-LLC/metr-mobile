# Git Blame Guide для METR

## Overview

Руководство по использованию git blame для отслеживания изменений в файлах.

## Basic Usage

### View Blame

```bash
# View blame for file
git blame file.js

# View blame for specific lines
git blame -L 10,20 file.js

# View blame with line numbers
git blame -n file.js

# View blame with email
git blame -e file.js
```

### Blame Options

```bash
# Ignore whitespace changes
git blame -w file.js

# Show original commit
git blame -S file.js

# Follow file renames
git blame -C file.js

# Show commit summary
git blame -s file.js
```

## Use Cases

### Find Who Changed Code

```bash
# Find who changed specific function
git blame -L 50,100 file.js

# Find who introduced bug
git blame buggy-file.js
```

### Track Code History

```bash
# See when code was added
git blame --date=short file.js

# See full commit info
git blame --show-email --show-number file.js
```

## Best Practices

1. **Use for debugging**: Find who introduced bugs
2. **Don't blame**: Use for information, not blame
3. **Check context**: Check commit messages
4. **Follow up**: Contact author if needed
5. **Document findings**: Document what you found

## Resources

- [Git Blame](https://git-scm.com/docs/git-blame)


