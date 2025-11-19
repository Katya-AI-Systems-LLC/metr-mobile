# Git Hooks для METR

## Overview

Руководство по настройке Git hooks для автоматизации проверок.

## Pre-commit Hook

### Setup

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

### Pre-commit Checks

- Lint check
- Type check
- Format check
- Test check (optional)

## Pre-push Hook

### Setup

```bash
npx husky add .husky/pre-push "npm test"
```

### Pre-push Checks

- Run tests
- Check coverage
- Security scan

## Commit-msg Hook

### Setup

```bash
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

### Commit Message Validation

- Check conventional commits format
- Validate commit message structure

## Post-commit Hook

### Setup

```bash
npx husky add .husky/post-commit "npm run post-commit"
```

### Post-commit Actions

- Update changelog
- Send notifications
- Update documentation

## Custom Hooks

### Example: Check for Secrets

```bash
#!/bin/sh
# .husky/pre-commit

# Check for secrets
if git diff --cached | grep -E "(password|secret|api_key)"; then
  echo "Error: Potential secrets detected!"
  exit 1
fi
```

## Husky Configuration

### package.json

```json
{
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Best Practices

1. **Fast Hooks**: Keep hooks fast (< 10 seconds)
2. **Fail Fast**: Exit early on errors
3. **Clear Messages**: Provide helpful error messages
4. **Skip Option**: Allow skipping with --no-verify
5. **Documentation**: Document all hooks

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks](https://git-scm.com/docs/githooks)


