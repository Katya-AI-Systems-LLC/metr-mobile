# 🚀 METR Installation Guide

## Prerequisites
- Node.js 18+
- npm 9+ or yarn 3+
- React Native development environment
- iOS: Xcode 14+, macOS 13+
- Android: Android Studio, JDK 17

---

## 🔧 Quick Start

### 1. Clone and Setup
```bash
# Clone repository
git clone https://github.com/metr/metr-mobile.git
cd metr-mobile

# Switch to METR branch
git checkout metr-3.0
```

### 2. Install Dependencies
```bash
# Install Node dependencies using new package configuration
cp package.metr.json package.json
npm install

# Or using yarn
yarn install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys
nano .env
```

Required API Keys:
- `OPENAI_API_KEY` - For AI features
- `WALLETCONNECT_PROJECT_ID` - For Web3 wallet connection
- `MATTERMOST_SERVER_URL` - Your Mattermost server (for compatibility)

### 5. Run Development Build

#### iOS
```bash
npm run ios
# or
yarn ios
```

#### Android
```bash
npm run android
# or
yarn android
```

---

## 🎨 Customization

### Brand Customization
Edit `app/theme/metrTheme.ts` to customize:
- Colors
- Typography
- Spacing
- Animations

### Feature Toggles
Edit `app/config/features.ts` to enable/disable:
- AI features
- Web3 features
- AR/VR features
- Analytics

---

## 🤖 AI Configuration

### OpenAI Setup
1. Get API key from https://platform.openai.com
2. Add to `.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

### Local AI Models (Optional)
```bash
# Download local models
npm run ai:download-models

# Models will be stored in app/ai/models/
```

---

## 🔗 Web3 Configuration

### Wallet Connection
1. Get WalletConnect Project ID from https://cloud.walletconnect.com
2. Configure in `.env`:
```env
WALLETCONNECT_PROJECT_ID=...
NETWORK_TYPE=polygon
```

### Smart Contracts (Optional)
```bash
# Deploy METR contracts
npm run web3:deploy

# Contract addresses will be saved to contracts.json
```

---

## 🏗️ Build for Production

### Android
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/
```

### iOS
```bash
# Open in Xcode
open ios/Metr.xcworkspace

# Select 'Any iOS Device'
# Product > Archive
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx react-native start --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

### Dependency Issues
```bash
# Reset everything
rm -rf node_modules
rm -rf ios/Pods
rm package-lock.json
npm install
cd ios && pod install && cd ..
```

### Build Errors

#### Android
```bash
# Increase Java heap size
echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties

# Clean and rebuild
cd android && ./gradlew clean && ./gradlew assembleDebug
```

#### iOS
```bash
# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall pods
cd ios
pod deintegrate
pod install
```

---

## 📱 Device Testing

### iOS Simulator
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npm run ios -- --simulator="iPhone 15 Pro"
```

### Android Emulator
```bash
# List available emulators
emulator -list-avds

# Run on specific emulator
npm run android -- --deviceId="Pixel_7_API_34"
```

### Physical Devices

#### iOS
1. Connect iPhone via USB
2. Trust computer on device
3. Run: `npm run ios -- --device`

#### Android
1. Enable Developer Mode
2. Enable USB Debugging
3. Connect via USB
4. Run: `npm run android`

---

## 🔍 Development Tools

### Debugging
```bash
# Open React Native Debugger
npm run debugger

# Open Flipper
npm run flipper
```

### Performance Profiling
```bash
# Profile bundle size
npm run analyze:bundle

# Profile runtime performance
npm run profile:performance
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run e2e:ios
npm run e2e:android
```

---

## 📚 Documentation

- [Architecture Overview](./docs/MODERNIZATION_CONCEPT_2025.md)
- [AI Module Documentation](./app/ai/README.md)
- [Web3 Integration Guide](./app/web3/README.md)
- [Migration from Mattermost](./MIGRATION_TO_METR.md)

---

## 🆘 Getting Help

- GitHub Issues: https://github.com/metr/metr-mobile/issues
- Discord: https://discord.gg/metr
- Documentation: https://docs.metr.io
- Email: support@metr.io

---

## 📄 License

METR is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

**Welcome to METR! 🎉 Let's revolutionize team collaboration together!**
