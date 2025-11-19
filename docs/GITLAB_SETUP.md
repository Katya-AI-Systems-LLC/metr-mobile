# GitLab Setup Guide for METR

## Overview

Руководство по настройке METR проекта в GitLab.

## Repository Setup

### 1. Create Repository

1. Создайте новый проект в GitLab
2. Выберите "Import project" или создайте пустой проект
3. Push ваш код:
   ```bash
   git remote add gitlab https://gitlab.com/your-username/metr-mobile.git
   git push gitlab main
   ```

## CI/CD Configuration

### GitLab CI/CD

Проект использует `.gitlab-ci.yml` для автоматизации:

- **Lint**: Проверка кода
- **Test**: Запуск тестов
- **Build**: Сборка Android/iOS
- **Deploy**: Деплой в stores

### Variables

Настройте следующие переменные в GitLab CI/CD Settings:

- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password
- `APP_STORE_CONNECT_API_KEY` - iOS App Store Connect API key
- `GOOGLE_PLAY_SERVICE_ACCOUNT` - Google Play service account JSON

### Runners

Убедитесь, что настроены runners:
- **Linux runner** для Android builds
- **macOS runner** для iOS builds (опционально)

## Merge Requests

### Workflow

1. Создайте feature branch
2. Внесите изменения
3. Создайте Merge Request
4. Дождитесь CI/CD проверок
5. Получите approval
6. Merge

### Merge Request Templates

Используйте шаблоны из `.gitlab/merge_request_templates/`

## Issues

### Issue Templates

- Bug report: `.gitlab/issue_templates/bug.md`
- Feature request: `.gitlab/issue_templates/feature.md`

## Security

### Secret Detection

GitLab автоматически сканирует код на секреты.

### Dependency Scanning

Включите Dependency Scanning в CI/CD:
```yaml
include:
  - template: Security/Dependency-Scanning.gitlab-ci.yml
```

## Container Registry

### Docker Images

GitLab Container Registry доступен для Docker образов:
```bash
docker login registry.gitlab.com
docker build -t registry.gitlab.com/your-username/metr-mobile .
docker push registry.gitlab.com/your-username/metr-mobile
```

## Pages

### Documentation

Настройте GitLab Pages для документации:
```yaml
pages:
  stage: deploy
  script:
    - npm run docs:build
  artifacts:
    paths:
      - public
  only:
    - main
```

## Best Practices

1. **Branch Protection**: Защитите main branch
2. **Merge Approvals**: Требуйте минимум 2 approvals
3. **CI/CD**: Всегда проверяйте CI/CD перед merge
4. **Documentation**: Обновляйте документацию в MR

## Troubleshooting

### CI/CD Failures

- Проверьте logs в GitLab CI/CD
- Убедитесь, что все переменные настроены
- Проверьте runner availability

### Build Issues

- Проверьте версии зависимостей
- Убедитесь, что cache очищен
- Проверьте runner resources

## Resources

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/)


