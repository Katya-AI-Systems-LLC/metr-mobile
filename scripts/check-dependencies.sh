#!/bin/bash
# check-dependencies.sh - Check and update dependencies

echo "🔍 Checking METR dependencies..."

# Check Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"

# Check for outdated packages
echo ""
echo "📦 Checking for outdated packages..."
npm outdated

# Check for security vulnerabilities
echo ""
echo "🔒 Checking for security vulnerabilities..."
npm audit

# Check for missing dependencies
echo ""
echo "✅ Checking for missing dependencies..."
npm install --dry-run

echo ""
echo "✨ Dependency check complete!"


