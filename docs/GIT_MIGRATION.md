# Git Migration Guide для METR

## Overview

Руководство по миграции между Git платформами.

## Migration Scenarios

### GitHub to GitLab

#### Steps
1. Create GitLab repository
2. Add GitLab remote:
   ```bash
   git remote add gitlab https://gitlab.com/user/repo.git
   ```
3. Push to GitLab:
   ```bash
   git push gitlab main
   ```
4. Update default remote:
   ```bash
   git remote set-url origin https://gitlab.com/user/repo.git
   ```

### GitLab to GitHub

#### Steps
1. Create GitHub repository
2. Add GitHub remote:
   ```bash
   git remote add github https://github.com/user/repo.git
   ```
3. Push to GitHub:
   ```bash
   git push github main
   ```
4. Update default remote:
   ```bash
   git remote set-url origin https://github.com/user/repo.git
   ```

### Gitea/Forgejo Migration

#### Steps
1. Export from source:
   ```bash
   git clone --mirror source-repo
   ```
2. Create target repository
3. Push to target:
   ```bash
   git push --mirror target-repo
   ```

## Preserving History

### Full History Migration

```bash
# Clone with all branches and tags
git clone --mirror source-repo

# Push to target
cd source-repo.git
git remote set-url origin target-repo
git push --mirror
```

### Selective Migration

```bash
# Clone specific branch
git clone -b main source-repo

# Push to target
git remote set-url origin target-repo
git push -u origin main
```

## Migrating Issues

### GitHub to GitLab

1. Export GitHub issues:
   ```bash
   gh issue list --json number,title,body > issues.json
   ```
2. Import to GitLab:
   ```bash
   # Use GitLab API or migration tool
   ```

### GitLab to GitHub

1. Export GitLab issues:
   ```bash
   # Use GitLab API
   ```
2. Import to GitHub:
   ```bash
   # Use GitHub API or migration tool
   ```

## Migrating CI/CD

### GitHub Actions to GitLab CI

1. Convert workflows to `.gitlab-ci.yml`
2. Update runner tags
3. Update environment variables
4. Test pipeline

### GitLab CI to GitHub Actions

1. Convert `.gitlab-ci.yml` to workflows
2. Update secrets
3. Update environment variables
4. Test workflows

## Migrating Settings

### Branch Protection

- GitHub: Settings > Branches
- GitLab: Settings > Repository > Protected Branches
- Gitea: Settings > Branches

### Webhooks

- Export webhook configurations
- Import to new platform
- Update URLs

### Secrets/Variables

- Export from source platform
- Import to target platform
- Update variable names if needed

## Best Practices

1. **Test Migration**: Test on small repo first
2. **Backup**: Backup before migration
3. **Document**: Document migration steps
4. **Verify**: Verify all data migrated
5. **Update**: Update documentation and links

## Tools

### Migration Tools

- **GitLab Import**: Built-in GitHub import
- **GitHub Importer**: Built-in GitLab import
- **gitea-migrate**: Gitea migration tool

## Resources

- [GitLab Migration](https://docs.gitlab.com/ee/user/project/import/github.html)
- [GitHub Migration](https://docs.github.com/en/migrations)


