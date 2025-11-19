# Release Process для METR

## Overview

Процесс релиза METR приложения.

## Release Types

### Patch Release (2.2.1)
- Bug fixes
- Security patches
- Minor improvements

### Minor Release (2.3.0)
- New features
- API additions
- Backward compatible

### Major Release (3.0.0)
- Breaking changes
- Major features
- Architecture changes

## Release Checklist

### Pre-Release
- [ ] Все фичи завершены
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] CHANGELOG обновлен
- [ ] Version bumped
- [ ] Security audit выполнен

### Release
- [ ] Tag создан
- [ ] CI/CD запущен
- [ ] Builds успешны
- [ ] Artifacts сохранены
- [ ] Release notes опубликованы

### Post-Release
- [ ] Deploy в stores
- [ ] Мониторинг метрик
- [ ] Сбор feedback
- [ ] Hotfix готовность

## Version Bumping

### package.json
```json
{
  "version": "2.2.0"
}
```

### Android
```gradle
versionCode 1
versionName "2.2.0"
```

### iOS
```plist
CFBundleShortVersionString: 2.2.0
CFBundleVersion: 1
```

## Release Steps

### 1. Prepare Release Branch
```bash
git checkout develop
git pull
git checkout -b release/v2.2.0
```

### 2. Update Version
```bash
npm version 2.2.0
git push origin release/v2.2.0
```

### 3. Create Tag
```bash
git tag -a v2.2.0 -m "Release v2.2.0"
git push origin v2.2.0
```

### 4. Build
- CI/CD автоматически соберет
- Или соберите вручную

### 5. Deploy
- Upload to App Store Connect
- Upload to Google Play Console

### 6. Merge to Main
```bash
git checkout main
git merge release/v2.2.0
git push origin main
```

## Hotfix Process

### 1. Create Hotfix Branch
```bash
git checkout main
git checkout -b hotfix/v2.2.1
```

### 2. Fix Issue
- Внесите исправления
- Добавьте тесты
- Обновите CHANGELOG

### 3. Release
- Следуйте обычному процессу
- Быстрый деплой

## Rollback Plan

### If Issues Found

1. **Stop Deployment**
   - Отмените деплой в stores
   - Уведомите команду

2. **Create Hotfix**
   - Создайте hotfix branch
   - Исправьте проблему
   - Быстрый релиз

3. **Communicate**
   - Уведомите пользователей
   - Обновите документацию

## Communication

### Release Notes
- Что нового
- Что исправлено
- Breaking changes
- Migration guide

### Channels
- GitHub Releases
- Email newsletter
- Discord announcement
- Blog post

## Monitoring

### Post-Release Monitoring
- Error rates
- Performance metrics
- User feedback
- Crash reports

### Metrics to Track
- App crashes
- API errors
- Performance degradation
- User complaints

## Best Practices

1. **Test Thoroughly**: Всегда тестируйте перед релизом
2. **Document Changes**: Документируйте все изменения
3. **Monitor Closely**: Внимательно следите после релиза
4. **Be Ready**: Будьте готовы к быстрому hotfix


