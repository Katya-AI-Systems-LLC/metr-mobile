# Git Collaboration Guide для METR

## Overview

Руководство по совместной работе с Git в команде METR.

## Team Workflows

### Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Code Review Process

1. **Author**: Create PR with description
2. **Reviewer**: Review code, leave comments
3. **Author**: Address feedback, push changes
4. **Reviewer**: Approve when ready
5. **Author**: Merge after approval

### Pair Programming

```bash
# Developer A creates branch
git checkout -b feature/pair-programming

# Developer A pushes
git push origin feature/pair-programming

# Developer B pulls
git fetch origin
git checkout feature/pair-programming

# Both work, commit, push
# Use clear commit messages to track who did what
```

## Conflict Resolution

### Merge Conflicts

```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Edit conflicted files

# Mark as resolved
git add <resolved-file>

# Complete merge
git commit -m "fix: resolve merge conflicts"
```

### Rebase Conflicts

```bash
# Start rebase
git rebase main

# Resolve conflicts
# Edit conflicted files

# Continue rebase
git add <resolved-file>
git rebase --continue

# Abort if needed
git rebase --abort
```

## Code Sharing

### Sharing Work in Progress

```bash
# Push WIP branch
git push origin feature/wip-feature

# Share branch name with team
# Team can checkout and review
```

### Stashing Changes

```bash
# Stash current changes
git stash save "WIP: working on feature"

# Switch branches
git checkout other-branch

# Apply stash later
git stash pop
```

## Communication

### Commit Messages

- Clear and descriptive
- Reference issues/PRs
- Explain why, not just what

### PR Descriptions

- What changed
- Why changed
- How to test
- Screenshots if UI changes

### Code Comments

- Explain complex logic
- Reference related code
- Document assumptions

## Best Practices

1. **Communicate**: Discuss before major changes
2. **Small PRs**: Keep PRs focused and small
3. **Review Promptly**: Review within 24 hours
4. **Be Respectful**: Constructive feedback only
5. **Test Together**: Test changes together when possible

## Tools

### Code Review Tools

- GitHub Pull Requests
- GitLab Merge Requests
- Reviewable
- CodeStream

### Communication Tools

- Slack/Discord for quick questions
- GitHub Discussions for longer discussions
- Email for formal communication

## Resources

- [Git Collaboration](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)


