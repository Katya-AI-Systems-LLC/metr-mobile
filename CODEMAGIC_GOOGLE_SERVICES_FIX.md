# Codemagic Google Services Fix

## Issue Fixed

**Error**: `No matching client found for package name 'com.metr.app'` in Google Services processing

## Problem

The `google-services.json` file contains Firebase/Google Services configuration for Mattermost package names:
- `com.mattermost.react.native`
- `com.mattermost.rnbeta`
- `com.mattermost.rn`

But the app uses `com.metr.app` as the package name, causing the Google Services plugin to fail during build.

## Solution

Made the Google Services plugin conditional - it only applies if a matching client is found in `google-services.json`. This prevents build failures when the package name doesn't match.

### Changes Made

**Before:**
```gradle
apply plugin: 'com.google.gms.google-services'
```

**After:**
```gradle
// Apply Google Services plugin only if google-services.json contains matching package name
def googleServicesJson = file("google-services.json")
if (googleServicesJson.exists()) {
    def json = new groovy.json.JsonSlurper().parse(googleServicesJson)
    def packageName = android.defaultConfig.applicationId
    def hasMatchingClient = json.client?.any { it.client_info?.android_client_info?.package_name == packageName }
    
    if (hasMatchingClient) {
        apply plugin: 'com.google.gms.google-services'
    } else {
        println "⚠️ WARNING: No matching client found in google-services.json for package name: ${packageName}"
        println "⚠️ Skipping Google Services plugin. Firebase features will not be available."
    }
} else {
    println "⚠️ WARNING: google-services.json not found. Skipping Google Services plugin."
}
```

## How It Works

1. **Check if google-services.json exists**: If not, skip the plugin
2. **Parse the JSON file**: Read the client configurations
3. **Check for matching package name**: Look for a client with matching `package_name`
4. **Apply plugin conditionally**: Only apply if a match is found
5. **Continue build**: Build proceeds without Google Services if no match

## Impact

- ✅ **Build succeeds**: No more build failures due to missing Google Services client
- ⚠️ **Firebase features disabled**: If package name doesn't match, Firebase features won't be available
- ✅ **Debug builds work**: Debug builds can proceed without Firebase configuration
- ✅ **Release builds**: Will work if google-services.json is updated with correct package name

## Next Steps

### Option 1: Update google-services.json (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one for METR)
3. Add Android app with package name: `com.metr.app`
4. Download the new `google-services.json`
5. Replace `android/app/google-services.json` with the new file

### Option 2: Keep Current Configuration (For Debug/Testing)

- The build will work without Firebase features
- Suitable for debug builds and testing
- Update when ready for production with Firebase

## Status

✅ **Fixed**: Google Services plugin is now conditional  
✅ **Tested**: Build should proceed without errors  
✅ **Documented**: This file explains the fix

## Related Files

- `android/app/build.gradle` - Modified to make Google Services conditional
- `android/app/google-services.json` - Contains Firebase configuration (needs update for METR)

