#!/bin/bash
# backup-repo.sh - Backup METR repository

set -e

REPO_URL="${REPO_URL:-https://github.com/metr/metr-mobile.git}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="metr-mobile-backup-$DATE"

echo "🔄 Starting backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Clone mirror
echo "📦 Cloning repository..."
git clone --mirror "$REPO_URL" "$BACKUP_DIR/$BACKUP_NAME.git"

# Create bundle
echo "📦 Creating bundle..."
cd "$BACKUP_DIR"
git --git-dir="$BACKUP_NAME.git" bundle create "$BACKUP_NAME.bundle" --all

# Compress
echo "🗜️  Compressing..."
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME.git" "$BACKUP_NAME.bundle"

# Remove uncompressed files
rm -rf "$BACKUP_NAME.git" "$BACKUP_NAME.bundle"

# Cleanup old backups (keep last 30 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup complete: $BACKUP_DIR/$BACKUP_NAME.tar.gz"


