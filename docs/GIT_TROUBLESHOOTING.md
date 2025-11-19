# Git Troubleshooting Guide для METR

## Common Issues

### Issue: Merge Conflicts

#### Solution
```bash
# See conflicts
git status

# Resolve conflicts manually
# Edit conflicted files

# Mark as resolved
git add <file>

# Complete merge
git commit
```

### Issue: Accidental Commit to Wrong Branch

#### Solution
```bash
# Undo commit, keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit again
git commit -m "message"
```

### Issue: Need to Change Last Commit

#### Solution
```bash
# Amend commit message
git commit --amend -m "new message"

# Add files to last commit
git add <file>
git commit --amend --no-edit
```

### Issue: Lost Commit

#### Solution
```bash
# Find lost commit
git reflog

# Recover commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

### Issue: Force Push Needed

#### Solution
```bash
# Force push (use with caution!)
git push --force-with-lease origin branch-name

# Never force push to main!
```

### Issue: Large File Committed

#### Solution
```bash
# Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch large-file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force --all
```

### Issue: Wrong Remote URL

#### Solution
```bash
# Check current remote
git remote -v

# Change remote URL
git remote set-url origin new-url

# Verify
git remote -v
```

### Issue: Stash Conflicts

#### Solution
```bash
# Apply stash
git stash apply

# Resolve conflicts
# Then drop stash
git stash drop
```

## Advanced Issues

### Issue: Repository Corruption

#### Solution
```bash
# Check repository
git fsck

# Recover from backup
# Or clone fresh and copy files
```

### Issue: Submodule Issues

#### Solution
```bash
# Update submodules
git submodule update --init --recursive

# Remove submodule
git submodule deinit -f <submodule>
git rm -f <submodule>
```

## Prevention

1. **Regular Backups**: Backup repository regularly
2. **Small Commits**: Keep commits small
3. **Frequent Pushes**: Push regularly
4. **Branch Protection**: Protect main branch
5. **Code Review**: Always review before merge

## Getting Help

- Check Git documentation
- Search Stack Overflow
- Ask team members
- Check Git log for history

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [Git Troubleshooting](https://git-scm.com/docs/git-help)


