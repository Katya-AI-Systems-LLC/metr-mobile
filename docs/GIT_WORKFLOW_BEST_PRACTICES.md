# Git Workflow Best Practices для METR

## Overview

Руководство по best practices для работы с Git в проекте METR.

## Branch Strategy

### Git Flow

```
main (production)
  └── develop (development)
       └── feature/feature-name
       └── bugfix/bug-name
       └── hotfix/hotfix-name
       └── release/v2.2.0
```

### Branch Naming

- **Feature**: `feature/feature-name`
- **Bugfix**: `bugfix/bug-name`
- **Hotfix**: `hotfix/hotfix-name`
- **Release**: `release/v2.2.0`
- **Docs**: `docs/documentation-update`

## Commit Messages

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat(ai): add smart replies functionality

Add AI-powered smart replies that analyze context and generate
contextual responses.

Closes #123
```

## Pull Request Process

### Before Creating PR

1. ✅ Code follows style guide
2. ✅ Tests added and passing
3. ✅ Documentation updated
4. ✅ No console.logs or debug code
5. ✅ Self-review completed

### PR Description

- Clear title
- Description of changes
- Related issues
- Screenshots (if UI changes)
- Testing instructions

### Review Process

1. Create PR
2. Wait for CI/CD checks
3. Get review
4. Address feedback
5. Get approval
6. Merge

## Code Review Guidelines

### For Authors

- Keep PRs small (< 400 lines)
- Respond to feedback promptly
- Be open to suggestions
- Explain complex logic

### For Reviewers

- Be constructive
- Review within 24 hours
- Check functionality, not just style
- Approve when ready

## Merge Strategies

### Squash and Merge

- For feature branches
- Clean commit history
- Single commit per feature

### Merge Commit

- For release branches
- Preserves branch history

### Rebase

- For updating feature branches
- Clean linear history

## Best Practices

1. **Small Commits**: One logical change per commit
2. **Frequent Pushes**: Push regularly
3. **Clear Messages**: Descriptive commit messages
4. **Branch Protection**: Protect main branch
5. **Code Review**: Always review before merge
6. **Testing**: Test before committing
7. **Documentation**: Update docs with code

## Common Mistakes to Avoid

- ❌ Committing secrets
- ❌ Force pushing to main
- ❌ Large commits
- ❌ Vague commit messages
- ❌ Skipping tests
- ❌ Ignoring CI/CD failures

## Resources

- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book)


