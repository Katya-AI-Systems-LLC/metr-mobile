# Bitbucket Setup Guide for METR

## Overview

Руководство по настройке METR проекта в Bitbucket.

## Repository Setup

### 1. Create Repository

1. Создайте новый репозиторий в Bitbucket
2. Выберите "Import repository" или создайте пустой
3. Push ваш код:
   ```bash
   git remote add bitbucket https://bitbucket.org/your-username/metr-mobile.git
   git push bitbucket main
   ```

## Pipelines Configuration

### Bitbucket Pipelines

Проект использует `bitbucket-pipelines.yml` для автоматизации.

### Variables

Настройте следующие переменные в Repository Settings > Pipelines > Repository variables:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `APP_STORE_CONNECT_API_KEY`
- `GOOGLE_PLAY_SERVICE_ACCOUNT`

### Runners

Bitbucket Cloud предоставляет:
- **Linux runners** (по умолчанию)
- **macOS runners** (требуют активации)

## Pull Requests

### Workflow

1. Создайте feature branch
2. Внесите изменения
3. Создайте Pull Request
4. Дождитесь pipeline проверок
5. Получите approval
6. Merge

### Branch Permissions

Настройте branch permissions:
- Require approvals для main
- Require passing builds
- Restrict merges

## Issues

### Issue Tracking

Используйте Bitbucket Issues для:
- Bug tracking
- Feature requests
- Task management

## Pipelines

### Custom Pipelines

Создайте custom pipelines для специфичных задач:
```yaml
custom:
  security-scan:
    - step:
        name: Security Scan
        script:
          - npm audit
```

## Artifacts

### Build Artifacts

Артефакты автоматически сохраняются:
- APK files
- Build logs
- Test reports

## Deployments

### Environments

Настройте environments:
- **Staging**: Автоматический деплой из develop
- **Production**: Ручной деплой из tags

## Best Practices

1. **Branch Strategy**: Используйте Git Flow
2. **Code Review**: Требуйте минимум 1 reviewer
3. **CI/CD**: Всегда проверяйте pipelines
4. **Documentation**: Обновляйте в PR

## Troubleshooting

### Pipeline Failures

- Проверьте logs в Pipelines
- Убедитесь, что переменные настроены
- Проверьте runner availability

### Build Issues

- Проверьте версии зависимостей
- Очистите cache
- Проверьте runner resources

## Resources

- [Bitbucket Pipelines Docs](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Bitbucket Deployments](https://support.atlassian.com/bitbucket-cloud/docs/deploy-to-environments-with-bitbucket-pipelines/)


