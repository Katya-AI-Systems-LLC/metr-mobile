# Forgejo Setup Guide for METR

## Overview

Руководство по настройке METR проекта в Forgejo (форк Gitea, популярный в России).

## What is Forgejo?

Forgejo - это форк Gitea, созданный для обеспечения независимости и community-driven развития.

## Repository Setup

### 1. Create Repository

1. Создайте новый репозиторий в Forgejo
2. Выберите "Import repository" или создайте пустой
3. Push ваш код:
   ```bash
   git remote add forgejo https://your-forgejo-instance.com/your-username/metr-mobile.git
   git push forgejo main
   ```

## CI/CD with Forgejo Actions

### Forgejo Actions Configuration

Forgejo Actions совместимы с Gitea Actions. Используйте `.gitea/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
```

## Pull Requests

### Workflow

1. Создайте feature branch
2. Внесите изменения
3. Создайте Pull Request
4. Дождитесь CI проверок
5. Получите approval
6. Merge

### Branch Protection

Настройте branch protection rules:
- Require pull request reviews
- Require status checks
- Restrict pushes

## Issues

### Issue Templates

Используйте шаблоны из `.gitea/issue_templates/` или `.gitlab/issue_templates/`

## Webhooks

### CI/CD Integration

Настройте webhooks для интеграции с внешними CI/CD системами:
- Jenkins
- Drone CI
- Custom CI/CD

## Self-Hosted Considerations

### Advantages

- Полный контроль над данными
- Приватность
- Кастомизация
- Независимость от внешних сервисов

### Setup

1. Установите Forgejo на ваш сервер
2. Настройте домен и SSL
3. Создайте репозиторий
4. Настройте CI/CD

## Migration from Gitea

Forgejo полностью совместим с Gitea:
- Используйте те же конфигурации
- Миграция данных проста
- API совместим

## Best Practices

1. **Branch Strategy**: Используйте Git Flow
2. **Code Review**: Требуйте reviews
3. **CI/CD**: Настройте автоматические проверки
4. **Documentation**: Ведите документацию

## Resources

- [Forgejo Documentation](https://forgejo.org/docs/)
- [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/)
- [Migration from Gitea](https://forgejo.org/docs/latest/admin/migration/)


