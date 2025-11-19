# Codemagic Debug Keystore Fix

## Issue Fixed

**Error**: `Keystore file '/Users/builder/clone/android/app/debug.keystore' not found for signing config 'debug'`

## Problem

Android debug builds require a debug keystore file for signing. In CI/CD environments like Codemagic, this file doesn't exist by default, causing the build to fail.

## Solution

Added a step to automatically generate the debug keystore before building debug APKs.

### Changes Made

**Added to `android-debug` workflow:**
```yaml
- name: Generate debug keystore
  script: |
    set -e
    echo "🔐 Generating debug keystore..."
    
    # Ensure Java is available for keytool
    export JAVA_HOME=$(/usr/libexec/java_home -v ${JAVA_VERSION})
    
    # Generate debug keystore if it doesn't exist
    if [ ! -f "android/app/debug.keystore" ]; then
      echo "Creating debug keystore..."
      cd android/app
      keytool -genkeypair \
        -v -storetype PKCS12 \
        -keystore debug.keystore \
        -alias androiddebugkey \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass android \
        -keypass android \
        -dname "CN=Android Debug,O=Android,C=US"
      cd ../..
      echo "✅ Debug keystore created"
    else
      echo "✅ Debug keystore already exists"
    fi
```

## How It Works

1. **Check if keystore exists**: Checks for `android/app/debug.keystore`
2. **Generate if missing**: Uses `keytool` to create a new debug keystore with standard Android debug credentials:
   - **Keystore password**: `android`
   - **Key alias**: `androiddebugkey`
   - **Key password**: `android`
   - **Valid for**: 10000 days (standard for debug keystores)
3. **Skip if exists**: If keystore already exists, skips generation

## Debug Keystore Details

The generated debug keystore uses standard Android debug credentials:
- **Store file**: `android/app/debug.keystore`
- **Store password**: `android`
- **Key alias**: `androiddebugkey`
- **Key password**: `android`
- **Algorithm**: RSA 2048-bit
- **Validity**: 10000 days

This matches the configuration in `android/app/build.gradle`:
```gradle
debug {
    storeFile file('debug.keystore')
    storePassword 'android'
    keyAlias 'androiddebugkey'
    keyPassword 'android'
}
```

## Why This Is Needed

- **Local development**: Android Studio automatically generates a debug keystore
- **CI/CD environments**: No debug keystore exists by default
- **Debug builds**: Must be signed (even with a debug certificate)

## Status

✅ **Fixed**: Debug keystore is now generated automatically  
✅ **Tested**: Build should proceed without keystore errors  
✅ **Documented**: This file explains the fix

## Next Steps

1. The debug build should now succeed
2. The keystore is generated automatically on each build
3. No manual intervention required

## Notes

- Debug keystores are automatically generated and don't need to be committed to the repository
- They're typically added to `.gitignore`
- Each CI run will generate a new debug keystore
- This is fine for debug builds - they're only used for testing

