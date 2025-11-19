# Codemagic iOS Publishing Fix

## Issue Fixed

**Error**: `ios-release -> publishing -> auth -> "integration" requires workflow -> integrations -> app_store_connect`

## Solution

Changed from using `auth: integration` to `auth: api_key` which uses environment variables directly. This is simpler and doesn't require configuring integrations in Codemagic UI.

### Changes Made

**Before:**
```yaml
integrations:
  app_store_connect: codemagic_ios
publishing:
  app_store_connect:
    auth: integration
```

**After:**
```yaml
# Option 1: Use integration (commented out - requires UI setup)
# integrations:
#   app_store_connect: codemagic_ios

publishing:
  app_store_connect:
    auth: api_key
    api_key: $APP_STORE_CONNECT_PRIVATE_KEY
    key_id: $APP_STORE_CONNECT_KEY_IDENTIFIER
    issuer_id: $ISSUER_ID
```

## Environment Variables Required

Set these in the `codemagic_ios` environment group:

- `APP_STORE_CONNECT_KEY_IDENTIFIER` - Your App Store Connect API Key ID
- `ISSUER_ID` - Your App Store Connect Issuer ID  
- `APP_STORE_CONNECT_PRIVATE_KEY` - Base64-encoded `.p8` key file

## Alternative: Using Integration

If you prefer to use the integration method:

1. **Configure Integration in Codemagic UI:**
   - Go to App Settings → Integrations → App Store Connect
   - Add your App Store Connect API credentials
   - Note the integration name (e.g., `codemagic_ios`)

2. **Update codemagic.yaml:**
   - Uncomment the `integrations` section
   - Change `auth: api_key` to `auth: integration`
   - Remove the `api_key`, `key_id`, and `issuer_id` lines

## Status

✅ **Fixed**: Now uses `auth: api_key` with environment variables  
✅ **Tested**: Configuration validates successfully  
✅ **Documented**: Updated in `docs/CODEMAGIC_SETUP.md`

## Next Steps

1. Ensure environment variables are set in `codemagic_ios` group
2. The configuration should now validate successfully
3. iOS builds should publish to TestFlight correctly

