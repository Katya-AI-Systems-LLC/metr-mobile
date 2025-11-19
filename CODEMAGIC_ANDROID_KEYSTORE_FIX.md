# Codemagic Android Keystore Fix

## Issue Fixed

**Error**: `No suitable keystores found matching reference "keystore_reference". Available options are: .`

## Solution

Removed the `android_signing` section that referenced a non-existent keystore. The workflow now uses environment variables for signing, which is automatically handled by a script step.

### Changes Made

**Before:**
```yaml
android_signing:
  - keystore_reference  # This reference didn't exist
```

**After:**
```yaml
# Android signing: Using environment variables from codemagic_android group
# The workflow automatically decodes the keystore and sets up signing
```

### How It Works Now

1. **Environment Variables**: The `codemagic_android` group contains:
   - `ANDROID_SIGNING_KEYSTORE` (base64-encoded keystore)
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`

2. **Automatic Setup**: A script step (`Setup Android signing`) runs before the build:
   - Decodes the base64 keystore to `android/app/release.keystore`
   - Sets environment variables that Gradle expects:
     - `MATTERMOST_RELEASE_STORE_FILE`
     - `MATTERMOST_RELEASE_PASSWORD`
     - `MATTERMOST_RELEASE_KEY_ALIAS`

3. **Gradle Build**: The Android build.gradle reads these environment variables and signs the release build automatically.

## Required Setup

### Step 1: Encode Your Keystore

```bash
# macOS
base64 -i your-keystore.jks | pbcopy

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("your-keystore.jks")) | clip

# Linux
base64 your-keystore.jks | xclip -selection clipboard
```

### Step 2: Set Environment Variables in Codemagic

1. Go to your app in Codemagic
2. Navigate to **Settings → Environment variables**
3. Create or edit the `codemagic_android` group
4. Add these variables:
   - `ANDROID_SIGNING_KEYSTORE`: Paste the base64-encoded keystore
   - `KEYSTORE_PASSWORD`: Your keystore password
   - `KEY_ALIAS`: Your key alias
   - `KEY_PASSWORD`: Your key password (usually same as keystore password)

### Step 3: Verify Configuration

- The workflow will automatically use these variables
- No additional configuration needed in `codemagic.yaml`
- The build will be signed automatically

## Alternative: Using Codemagic UI Keystore

If you prefer to manage the keystore through Codemagic UI:

1. **Upload Keystore in UI:**
   - Go to Settings → Android → Signing
   - Upload your keystore file
   - Enter passwords and key alias
   - Save and note the keystore reference name

2. **Update codemagic.yaml:**
   ```yaml
   android_signing:
     - your_keystore_reference_name  # Use the actual reference name from UI
   ```

3. **Remove environment variables:**
   - You can remove `ANDROID_SIGNING_KEYSTORE` from environment variables
   - Keep `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` if needed

## Troubleshooting

### Build fails: "Keystore file not found"
- Verify `ANDROID_SIGNING_KEYSTORE` is set correctly
- Check that the base64 encoding is correct (no extra spaces/newlines)
- Ensure the keystore is valid (try decoding locally)

### Build fails: "Invalid keystore password"
- Verify `KEYSTORE_PASSWORD` matches your keystore password
- Check for extra spaces or special characters
- Ensure the password is correct

### Build succeeds but APK/AAB is unsigned
- Check that all environment variables are set
- Verify the keystore was decoded correctly
- Check build logs for signing errors

### "No suitable keystores found"
- This error is now fixed by removing the `android_signing` reference
- If you see this error, ensure you're not referencing a non-existent keystore

## Status

✅ **Fixed**: Removed invalid keystore reference  
✅ **Implemented**: Automatic keystore decoding and setup  
✅ **Tested**: Configuration validates successfully  
✅ **Documented**: Updated in `docs/CODEMAGIC_SETUP.md`

## Next Steps

1. Set up the `codemagic_android` environment variable group
2. Encode and add your keystore
3. Start a build - signing will happen automatically
4. Verify the built APK/AAB is signed correctly

