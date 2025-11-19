# Deployment Guide для METR

## Overview

Руководство по деплою METR в различные окружения.

## Environments

### Development
- **Purpose**: Локальная разработка
- **Build**: Debug builds
- **API**: Development API

### Staging
- **Purpose**: Тестирование перед production
- **Build**: Release builds
- **API**: Staging API

### Production
- **Purpose**: Реальные пользователи
- **Build**: Release builds (signed)
- **API**: Production API

## Android Deployment

### Debug Build
```bash
npm run build:android-debug:win
```

### Release Build
```bash
cd android
./gradlew assembleRelease
```

### Signing
1. Создайте keystore
2. Настройте `android/app/build.gradle`
3. Добавьте signing config

### Google Play
1. Создайте release в Play Console
2. Upload APK/AAB
3. Fill release notes
4. Submit for review

## iOS Deployment

### Debug Build
```bash
npm run ios
```

### Release Build
```bash
cd ios
xcodebuild -workspace Mattermost.xcworkspace \
  -scheme Mattermost \
  -configuration Release \
  archive
```

### App Store
1. Archive в Xcode
2. Upload to App Store Connect
3. Fill metadata
4. Submit for review

## CI/CD Deployment

### GitHub Actions
Автоматический деплой через workflows.

### GitLab CI/CD
Автоматический деплой через `.gitlab-ci.yml`.

## Environment Variables

### Development
```env
API_URL=http://localhost:3000
WS_URL=ws://localhost:3000
```

### Staging
```env
API_URL=https://staging-api.metr.app
WS_URL=wss://staging-ws.metr.app
```

### Production
```env
API_URL=https://api.metr.app
WS_URL=wss://ws.metr.app
```

## Rollback Plan

### If Issues Found
1. Stop deployment
2. Identify issue
3. Create hotfix
4. Deploy hotfix
5. Communicate to users

## Monitoring

### Post-Deployment
- Monitor error rates
- Check performance metrics
- Collect user feedback
- Watch crash reports

## Best Practices

1. **Test Thoroughly**: Тестируйте перед деплоем
2. **Gradual Rollout**: Постепенный rollout
3. **Monitor Closely**: Внимательный мониторинг
4. **Be Ready**: Готовность к rollback

## Resources

- [React Native Deployment](https://reactnative.dev/docs/signed-apk-android)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
