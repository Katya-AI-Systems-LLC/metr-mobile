# Git Ignore Guide для METR

## Overview

Руководство по настройке .gitignore для проекта METR.

## Basic Usage

### Create .gitignore

```bash
# Create .gitignore
touch .gitignore

# Or edit existing
vim .gitignore
```

### Ignore Patterns

```bash
# Ignore file
file.txt

# Ignore directory
node_modules/

# Ignore pattern
*.log

# Ignore in specific directory
src/*.tmp

# Negate pattern
!important.log
```

## Common Patterns

### Node.js

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
```

### React Native

```gitignore
# OSX
.DS_Store

# Xcode
*.pbxuser
*.mode1v3
*.mode2v3
*.perspectivev3
*.xcuserstate
project.xcworkspace/
xcuserdata/

# Android
*.apk
*.ap_
*.aab
*.dex
*.class
bin/
gen/
out/
.gradle/
local.properties
```

### IDE

```gitignore
# VS Code
.vscode/
*.code-workspace

# IntelliJ
.idea/
*.iml
*.iws
*.ipr

# Sublime
*.sublime-project
*.sublime-workspace
```

## Best Practices

1. **Be specific**: Use specific patterns
2. **Document**: Document why files are ignored
3. **Review**: Review .gitignore regularly
4. **Use templates**: Use community templates
5. **Test**: Test ignore patterns

## Resources

- [Git Ignore](https://git-scm.com/docs/gitignore)
- [Gitignore Templates](https://github.com/github/gitignore)


