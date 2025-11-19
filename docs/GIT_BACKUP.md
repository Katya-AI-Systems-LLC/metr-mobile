# Git Backup Guide для METR

## Overview

Руководство по резервному копированию Git репозиториев.

## Backup Strategies

### Local Backup

#### Mirror Clone

```bash
# Create mirror backup
git clone --mirror https://github.com/metr/metr-mobile.git backup.git

# Update backup
cd backup.git
git remote update
```

#### Bundle Backup

```bash
# Create bundle
git bundle create backup.bundle --all

# Restore from bundle
git clone backup.bundle restored-repo
```

### Remote Backup

#### Multiple Remotes

```bash
# Add backup remote
git remote add backup https://backup-server.com/repo.git

# Push to backup
git push backup main
```

#### Automated Backup

```bash
#!/bin/bash
# backup.sh

REPO_URL="https://github.com/metr/metr-mobile.git"
BACKUP_DIR="/backups/metr-mobile"
DATE=$(date +%Y%m%d)

# Clone mirror
git clone --mirror $REPO_URL $BACKUP_DIR/$DATE.git

# Compress
tar -czf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE.git

# Remove uncompressed
rm -rf $BACKUP_DIR/$DATE.git

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## Backup Schedule

### Daily Backup

```bash
# Cron job
0 2 * * * /path/to/backup.sh
```

### Weekly Backup

```bash
# Cron job
0 2 * * 0 /path/to/weekly-backup.sh
```

## Backup Verification

### Verify Backup

```bash
# Check bundle
git bundle verify backup.bundle

# Test clone
git clone backup.bundle test-repo
```

## Disaster Recovery

### Restore from Backup

```bash
# From mirror
git clone --mirror backup.git restored-repo

# From bundle
git clone backup.bundle restored-repo

# From remote
git clone backup-remote-url restored-repo
```

## Best Practices

1. **Regular Backups**: Backup daily or weekly
2. **Multiple Locations**: Store backups in multiple places
3. **Test Restores**: Regularly test restore process
4. **Automate**: Automate backup process
5. **Document**: Document backup and restore procedures

## Cloud Backup Options

### GitHub

- Built-in backup via API
- Archive repositories

### GitLab

- Built-in backup
- Export projects

### Gitea

- Built-in backup
- Database backup

## Resources

- [Git Backup](https://git-scm.com/book/en/v2/Git-Tools-Bundling)


