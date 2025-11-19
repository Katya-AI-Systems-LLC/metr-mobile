# Installation Guide для METR

## Prerequisites

### Required Software
- Node.js 18+ ([Download](https://nodejs.org/))
- npm или yarn
- Git ([Download](https://git-scm.com/))

### For Android Development
- Java JDK 17+ ([Download](https://adoptium.net/))
- Android Studio ([Download](https://developer.android.com/studio))
- Android SDK (через Android Studio)

### For iOS Development
- macOS (требуется для iOS разработки)
- Xcode 14+ ([Download](https://developer.apple.com/xcode/))
- CocoaPods (`sudo gem install cocoapods`)

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/metr/metr-mobile.git
cd metr-mobile
```

### 2. Install Dependencies

```bash
npm install
# или
yarn install
```

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Android Setup

1. Откройте Android Studio
2. Установите Android SDK через SDK Manager
3. Настройте ANDROID_HOME:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### 5. Run Project

```bash
# Start Metro bundler
npm start

# Run iOS (в другом терминале)
npm run ios

# Run Android (в другом терминале)
npm run android
```

## Environment Variables

Создайте `.env` файл:

```env
API_URL=https://api.metr.app
WS_URL=wss://ws.metr.app
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Pod Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Gradle Issues
```bash
cd android
./gradlew clean
cd ..
```

## Verification

После установки проверьте:

```bash
# Check Node version
node -v  # Should be 18+

# Check React Native CLI
npx react-native --version

# Check Android setup
npx react-native doctor
```

## Next Steps

- [DEVELOPMENT.md](DEVELOPMENT.md) - Начните разработку
- [ONBOARDING.md](ONBOARDING.md) - Onboarding для новых разработчиков
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Решение проблем


