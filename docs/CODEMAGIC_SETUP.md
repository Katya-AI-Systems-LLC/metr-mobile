# Codemagic CI/CD Setup Guide for METR Mobile

This guide explains how to set up and use Codemagic CI/CD for the METR Mobile project.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Variables](#environment-variables)
- [Workflows](#workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Codemagic is a CI/CD platform specifically designed for mobile app development. Our `codemagic.yaml` configuration includes:

- **Android Release Build**: Builds signed AAB and APK files for Google Play Store
- **Android Debug Build**: Quick debug builds for testing
- **iOS Release Build**: Builds signed IPA files for App Store
- **iOS Debug Build**: Quick debug builds for testing
- **Test & Quality**: Runs linting, type checking, and unit tests
- **E2E Tests**: Runs end-to-end tests with Detox

## Prerequisites

1. **Codemagic Account**: Sign up at [codemagic.io](https://codemagic.io)
2. **GitHub/GitLab/Bitbucket Repository**: Your METR Mobile repository
3. **App Store Connect API Key** (for iOS): Required for App Store distribution
4. **Google Play Service Account** (for Android): Required for Play Store distribution
5. **Signing Certificates**: iOS certificates and Android keystore

## Initial Setup

### 1. Connect Your Repository

1. Log in to Codemagic
2. Click "Add application"
3. Select your Git provider (GitHub/GitLab/Bitbucket)
4. Choose the `metr-mobile` repository
5. Codemagic will detect the `codemagic.yaml` file automatically

### 2. Configure Environment Variables

Navigate to your app settings in Codemagic and configure the following environment variable groups:

#### Android Signing (`codemagic_android`)

```
ANDROID_SIGNING_KEYSTORE=<base64-encoded-keystore>
KEYSTORE_PASSWORD=<your-keystore-password>
KEY_ALIAS=<your-key-alias>
KEY_PASSWORD=<your-key-password>
```

**To encode your keystore:**
```bash
base64 -i your-keystore.jks | pbcopy  # macOS
base64 your-keystore.jks | clip       # Windows
```

#### Android Credentials (`codemagic_android_credentials`)

```
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=<base64-encoded-json-key>
# Optional: GOOGLE_PLAY_TRACK (if not set, defaults to 'internal' in codemagic.yaml)
# GOOGLE_PLAY_TRACK=internal  # or 'alpha', 'beta', 'production'
```

**To get Google Play credentials:**
1. Go to Google Play Console → Setup → API access
2. Create a service account
3. Download the JSON key file
4. Encode it: `base64 -i service-account-key.json | pbcopy`

**Note**: The `GOOGLE_PLAY_TRACK` variable is optional. By default, the workflow uses `internal` track. To change it:
- **Option 1**: Edit `codemagic.yaml` and change `track: internal` to your desired track
- **Option 2**: Set `GOOGLE_PLAY_TRACK` in the `codemagic_android_credentials` group and update the workflow to use `track: $GOOGLE_PLAY_TRACK`

#### iOS Signing (`codemagic_ios`)

```
APP_STORE_CONNECT_KEY_IDENTIFIER=<your-key-id>
ISSUER_ID=<your-issuer-id>
PRIVATE_KEY=<your-private-key>
```

**To get App Store Connect API Key:**
1. Go to App Store Connect → Users and Access → Keys
2. Create a new key with App Manager or Admin role
3. Download the `.p8` key file
4. Copy the Key ID and Issuer ID

#### iOS Certificates (`codemagic_certificates`)

```
CERTIFICATE_PRIVATE_KEY=<base64-encoded-private-key>
CERTIFICATE_PASSWORD=<certificate-password>
```

#### Custom Environment Variables (`codemagic_env`)

Add any custom environment variables your app needs:
```
API_URL=https://api.metr.app
SENTRY_DSN=your-sentry-dsn
ANALYTICS_KEY=your-analytics-key
```

### 3. Configure Signing

#### Android Signing

1. Go to App Settings → Android → Signing
2. Upload your keystore file or paste the base64-encoded keystore
3. Enter keystore password, key alias, and key password
4. Save the configuration

#### iOS Signing

1. Go to App Settings → iOS → Signing
2. Choose "Automatic" or "Manual" signing
3. For automatic signing, provide your App Store Connect API key
4. For manual signing, upload your certificates and provisioning profiles

## Workflows

### Android Release Build

**Trigger**: Manual or on push to `main`/`master` branch

**What it does:**
1. Sets up Node.js, Java, and Android SDK
2. Installs dependencies
3. Generates assets and i18n files
4. Runs linting and type checking
5. Runs tests
6. Builds signed AAB and APK
7. Publishes to Google Play Store (if configured)

**Usage:**
```bash
# Trigger manually from Codemagic UI
# Or push to main branch
git push origin main
```

### Android Debug Build

**Trigger**: Manual or on pull requests

**What it does:**
1. Quick setup and dependency installation
2. Generates assets
3. Builds unsigned debug APK

**Usage:**
- Perfect for testing builds quickly
- No signing required
- Faster build times

### iOS Release Build

**Trigger**: Manual or on push to `main`/`master` branch

**What it does:**
1. Sets up Node.js and CocoaPods
2. Installs dependencies and pods
3. Generates assets and i18n files
4. Runs linting and type checking
5. Runs tests
6. Builds signed IPA
7. Publishes to TestFlight/App Store (if configured)

**Usage:**
```bash
# Trigger manually from Codemagic UI
# Or push to main branch
git push origin main
```

### iOS Debug Build

**Trigger**: Manual or on pull requests

**What it does:**
1. Quick setup and dependency installation
2. Generates assets
3. Builds unsigned debug IPA

**Usage:**
- Perfect for testing builds quickly
- No signing required
- Faster build times

### Test & Quality

**Trigger**: On every push and pull request

**What it does:**
1. Installs dependencies
2. Generates assets
3. Runs ESLint
4. Runs TypeScript type checking
5. Runs unit tests with coverage
6. Checks i18n files

**Usage:**
- Automatically runs on every commit
- Provides feedback before merging PRs
- Generates coverage reports

### E2E Tests

**Trigger**: Manual or on release branches

**What it does:**
1. Sets up environment
2. Installs dependencies
3. Generates assets
4. Runs Detox E2E tests for Android and iOS

**Usage:**
- Run before major releases
- Test critical user flows
- Generate test reports

## Troubleshooting

### Build Fails: "Unable to resolve module ../../dist/assets/i18n/en.json"

**Problem**: Assets haven't been generated before the build.

**Solution**: The workflow includes an asset generation step. If this error persists:

1. Check that `scripts/generate-assets.js` runs successfully
2. Verify that `assets/base/i18n/en.json` exists
3. Ensure the `dist/assets/i18n/` directory is created

**Manual fix in workflow:**
```yaml
- name: Generate assets and i18n files
  script: |
    set -e
    mkdir -p dist/assets
    node scripts/generate-assets.js
    # Fallback: copy i18n files directly if generation fails
    mkdir -p dist/assets/i18n
    cp -r assets/base/i18n/* dist/assets/i18n/
```

### Build Fails: "Gradle daemon error" or "OutOfMemoryError"

**Problem**: Gradle is running out of memory.

**Solution**: The workflow sets `GRADLE_OPTS` with increased memory. If issues persist:

1. Increase memory allocation in workflow:
```yaml
GRADLE_OPTS: "-Xmx6144m -XX:MaxPermSize=512m"
```

2. Disable Gradle daemon:
```yaml
--no-daemon
```

### iOS Build Fails: "Code signing error"

**Problem**: Signing certificates or provisioning profiles are missing or invalid.

**Solution**:
1. Verify certificates are uploaded in Codemagic
2. Check certificate expiration dates
3. Ensure bundle identifier matches: `com.metr.mobile`
4. Verify App Store Connect API key is correct

### Android Build Fails: "Keystore not found"

**Problem**: Keystore file is not properly configured.

**Solution**:
1. Verify keystore is base64-encoded correctly
2. Check environment variable names match exactly
3. Ensure keystore password, key alias, and key password are correct

### Tests Fail: "Module not found" or "Import errors"

**Problem**: Dependencies or assets not properly set up.

**Solution**:
1. Ensure `npm ci` runs before tests
2. Verify asset generation step runs before tests
3. Check that `dist/assets/` directory exists

### Build Times Are Too Long

**Optimization tips**:
1. Enable Codemagic caching (automatic for dependencies)
2. Use `--ignore-scripts` during npm install when possible
3. Cache Gradle dependencies:
```yaml
- name: Cache Gradle
  script: |
    if [ -d "$HOME/.gradle" ]; then
      echo "Caching Gradle..."
    fi
```

## Best Practices

### 1. Branch Strategy

- **main/master**: Production releases (triggers release builds)
- **develop**: Development builds (triggers debug builds)
- **feature/***: Test builds only
- **release/***: Pre-release builds

### 2. Environment Variables

- Never commit secrets to the repository
- Use Codemagic environment variable groups
- Rotate keys regularly
- Use different keys for staging and production

### 3. Build Optimization

- Use appropriate instance types (mac_mini_m2 for faster builds)
- Enable caching for dependencies
- Run tests in parallel when possible
- Use build matrices for multiple configurations

### 4. Deployment

- Always test debug builds before release builds
- Use TestFlight for iOS beta testing
- Use Google Play internal testing track first
- Monitor build times and optimize slow steps

### 5. Security

- Keep signing keys secure
- Use Codemagic's secure environment variables
- Enable two-factor authentication on Codemagic account
- Review build logs for exposed secrets

### 6. Monitoring

- Set up email notifications for build failures
- Monitor build success rates
- Track build times and optimize slow workflows
- Review test coverage reports

## Advanced Configuration

### Custom Build Scripts

You can add custom scripts to workflows:

```yaml
- name: Custom build step
  script: |
    set -e
    # Your custom commands here
    npm run custom:build
```

### Conditional Builds

Build only on specific branches:

```yaml
triggering:
  events:
    - push
  branch_patterns:
    - pattern: 'main'
      include: true
      source: true
```

### Build Notifications

Configure Slack, Discord, or other notifications:

```yaml
publishing:
  slack:
    webhook: $SLACK_WEBHOOK_URL
    channel: '#builds'
    notify_on_build_start: true
```

## Resources

- [Codemagic Documentation](https://docs.codemagic.io/)
- [Codemagic YAML Reference](https://docs.codemagic.io/yaml/yaml-getting-started/)
- [Android Signing Guide](https://docs.codemagic.io/code-signing/android-code-signing/)
- [iOS Signing Guide](https://docs.codemagic.io/code-signing/ios-code-signing/)
- [METR Mobile Repository](https://github.com/Katya-AI-Systems-LLC/metr-mobile)

## Support

For issues specific to METR Mobile builds:
1. Check the troubleshooting section above
2. Review build logs in Codemagic
3. Open an issue in the repository
4. Contact the METR development team

For Codemagic platform issues:
- [Codemagic Support](https://codemagic.io/support/)
- [Codemagic Community Forum](https://codemagic.io/community/)

