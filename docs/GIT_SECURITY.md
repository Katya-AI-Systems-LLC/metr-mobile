# Git Security Guide для METR

## Overview

Руководство по безопасности при работе с Git.

## Secrets Management

### Never Commit Secrets

❌ **Don't:**
```bash
git add config.json  # Contains API keys
git commit -m "Add config"
```

✅ **Do:**
```bash
# Use environment variables
export API_KEY=secret-key

# Use .env file (in .gitignore)
echo "API_KEY=secret-key" > .env

# Use secrets management tools
# AWS Secrets Manager, HashiCorp Vault, etc.
```

### Check for Secrets

```bash
# Pre-commit hook
git diff --cached | grep -E "(password|secret|api_key)"

# Use tools
git-secrets
truffleHog
```

## Access Control

### SSH Keys

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to Git platform
cat ~/.ssh/id_ed25519.pub
```

### GPG Signing

```bash
# Generate GPG key
gpg --full-generate-key

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

## Branch Protection

### Protect Main Branch

- Require pull requests
- Require reviews
- Require status checks
- Restrict pushes
- Require signed commits

## Audit Logging

### Enable Audit Logs

- Track all repository access
- Monitor changes
- Review logs regularly

## Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use SSH keys**: More secure than passwords
3. **Sign commits**: Verify commit authenticity
4. **Protect branches**: Prevent direct pushes
5. **Regular audits**: Review access regularly
6. **Update regularly**: Keep Git and tools updated
7. **Use 2FA**: Enable two-factor authentication

## Incident Response

### If Secrets Committed

1. **Immediately revoke**: Revoke exposed secrets
2. **Remove from history**: Use git filter-branch
3. **Force push**: Update remote (coordinate with team)
4. **Notify team**: Inform team members
5. **Rotate secrets**: Generate new secrets

### Remove Secrets from History

```bash
# Use git-filter-repo (recommended)
git filter-repo --path secrets.txt --invert-paths

# Or git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch secrets.txt" \
  --prune-empty --tag-name-filter cat -- --all
```

## Tools

### Secret Scanning

- **git-secrets**: AWS tool
- **truffleHog**: Detects secrets
- **git-hound**: Finds secrets in Git history

### Security Tools

- **Gitleaks**: Secret detection
- **GitGuardian**: Secret scanning
- **Snyk**: Security scanning

## Resources

- [Git Security](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)
- [Git Secrets](https://github.com/awslabs/git-secrets)


