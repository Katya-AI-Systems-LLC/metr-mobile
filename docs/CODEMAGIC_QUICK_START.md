# Codemagic Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Connect Repository
- Go to [codemagic.io](https://codemagic.io)
- Click "Add application"
- Select your Git provider
- Choose `metr-mobile` repository

### 2. Configure Signing

#### Android
```
Settings → Android → Signing
- Upload keystore or paste base64
- Enter passwords
```

#### iOS
```
Settings → iOS → Signing
- Choose automatic signing
- Add App Store Connect API key
```

### 3. Set Environment Variables

Create these groups in Codemagic:

**`codemagic_android`**
- `ANDROID_SIGNING_KEYSTORE` (base64)
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

**`codemagic_android_credentials`**
- `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` (base64 JSON)
- `GOOGLE_PLAY_TRACK` (internal/alpha/beta/production)

**`codemagic_ios`**
- `APP_STORE_CONNECT_KEY_IDENTIFIER`
- `ISSUER_ID`
- `PRIVATE_KEY` (base64 .p8 file)

### 4. Start Building

Click "Start new build" → Select workflow → Build! 🎉

## 📋 Common Commands

### Encode Keystore (macOS)
```bash
base64 -i your-keystore.jks | pbcopy
```

### Encode Service Account Key
```bash
base64 -i service-account-key.json | pbcopy
```

### Test Locally (simulate Codemagic)
```bash
# Install dependencies
npm ci --ignore-scripts
npx patch-package

# Generate assets
mkdir -p dist/assets
node scripts/generate-assets.js

# Build Android
cd android && ./gradlew bundleRelease --no-daemon
```

## 🔧 Troubleshooting

### Build fails: "i18n files not found"
**Fix**: Ensure `node scripts/generate-assets.js` runs before build

### Build fails: "Out of memory"
**Fix**: Increase `GRADLE_OPTS` memory: `-Xmx6144m`

### iOS signing fails
**Fix**: Check bundle ID matches `com.metr.mobile`

## 📚 Full Documentation

See [CODEMAGIC_SETUP.md](./CODEMAGIC_SETUP.md) for complete guide.

