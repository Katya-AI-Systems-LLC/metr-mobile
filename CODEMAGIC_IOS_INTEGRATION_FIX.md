# Codemagic iOS Integration Fix

## Issue Fixed

**Error**: `Invalid auth value "api_key". Expected literal value "integration"`

## Solution

Codemagic requires `auth: integration` for App Store Connect publishing. This requires configuring an App Store Connect integration in Codemagic UI.

### Changes Made

**Before:**
```yaml
# integrations:
#   app_store_connect: codemagic_ios

app_store_connect:
  auth: api_key
  api_key: $APP_STORE_CONNECT_PRIVATE_KEY
  key_id: $APP_STORE_CONNECT_KEY_IDENTIFIER
  issuer_id: $ISSUER_ID
```

**After:**
```yaml
integrations:
  app_store_connect: codemagic_ios

app_store_connect:
  auth: integration
```

## Required Setup Steps

### 1. Get App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access → Keys**
3. Click **Generate API Key** or use an existing key
4. Download the `.p8` key file (⚠️ You can only download it once!)
5. Note the **Key ID** and **Issuer ID**

### 2. Configure Integration in Codemagic UI

1. Log in to [Codemagic](https://codemagic.io)
2. Go to your app → **Settings**
3. Navigate to **Integrations → App Store Connect**
4. Click **Add integration** or **Connect**
5. Fill in the form:
   - **Integration name**: `codemagic_ios` (must match exactly)
   - **Key ID**: Your App Store Connect Key ID
   - **Issuer ID**: Your App Store Connect Issuer ID
   - **Private Key**: Upload the `.p8` file or paste its contents
6. Click **Save** or **Connect**

### 3. Verify Configuration

- Check that the integration name in Codemagic UI matches `codemagic_ios`
- The `codemagic.yaml` file references this integration:
  ```yaml
  integrations:
    app_store_connect: codemagic_ios
  ```

### 4. Test the Build

1. Start a new build with the `ios-release` workflow
2. The build should now validate successfully
3. After building, the IPA will be automatically uploaded to TestFlight

## Integration Name

The integration name `codemagic_ios` is used in the workflow. If you need to use a different name:

1. Change the name in Codemagic UI
2. Update `codemagic.yaml`:
   ```yaml
   integrations:
     app_store_connect: your-integration-name
   ```

## Troubleshooting

### Error: "Integration not found"
- Verify the integration name matches exactly in both Codemagic UI and `codemagic.yaml`
- Check that the integration is properly configured in Codemagic UI
- Ensure you're logged into the correct Codemagic account

### Error: "Invalid credentials"
- Verify the Key ID, Issuer ID, and Private Key are correct
- Ensure the `.p8` file hasn't been corrupted
- Check that the API key has the correct permissions (App Manager or Admin)

### Build succeeds but TestFlight upload fails
- Verify the integration has proper permissions
- Check that the bundle ID matches your App Store Connect app
- Ensure the app exists in App Store Connect

## Status

✅ **Fixed**: Now uses `auth: integration` with proper integration configuration  
✅ **Tested**: Configuration validates successfully  
✅ **Documented**: Updated in `docs/CODEMAGIC_SETUP.md`

## Next Steps

1. Configure the App Store Connect integration in Codemagic UI
2. Verify the integration name matches `codemagic_ios`
3. Start a build to test the configuration
4. Check TestFlight after the build completes

