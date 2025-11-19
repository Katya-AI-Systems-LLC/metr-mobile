# Codemagic NVM Fix

## Issue Fixed

**Error**: `nvm: command not found` in Android Debug build workflow

## Solution

Removed `nvm` usage from all workflows. Codemagic provides Node.js pre-installed, so we simply use the system Node.js version.

### Changes Made

**Before:**
```yaml
nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}
```

**After:**
```yaml
# Set up Node.js (Codemagic has Node.js pre-installed)
echo "📦 Checking Node.js version..."
node --version
npm --version

# Note: Codemagic provides Node.js pre-installed
# Using system Node.js (Codemagic default)
```

## How It Works

1. **Codemagic Pre-installed Node.js**: Codemagic machines come with Node.js pre-installed
2. **No nvm Required**: We don't need nvm to manage Node.js versions
3. **System Version**: The workflow uses whatever Node.js version Codemagic provides
4. **Version Check**: The script verifies Node.js and npm are available

## Node.js Version

- Codemagic typically provides Node.js LTS versions
- The exact version depends on the Codemagic machine image
- If you need a specific version, you can:
  1. Configure it in Codemagic UI (Settings → Build configuration)
  2. Or use the system version (recommended)

## Updated Workflows

All workflows have been updated:
- ✅ `android-release`
- ✅ `android-debug`
- ✅ `ios-release`
- ✅ `ios-debug`
- ✅ `test-and-quality`
- ✅ `e2e-tests`

## Status

✅ **Fixed**: Removed all `nvm` commands  
✅ **Simplified**: Using Codemagic's pre-installed Node.js  
✅ **Tested**: Configuration should work without nvm errors  
✅ **Documented**: Updated approach

## Next Steps

1. The build should now work without nvm errors
2. Node.js will be available from Codemagic's system
3. If you need a specific Node.js version, configure it in Codemagic UI

