# Gitea Setup Guide for METR

## Overview

Руководство по настройке METR проекта в Gitea (отечественная Git платформа).

## Repository Setup

### 1. Create Repository

1. Войдите в ваш Gitea instance
2. Создайте новый репозиторий
3. Push ваш код:
   ```bash
   git remote add gitea https://your-gitea-instance.com/your-username/metr-mobile.git
   git push gitea main
   ```

## CI/CD with Gitea Actions

### Gitea Actions Configuration

Создайте `.gitea/workflows/ci.yml`:

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

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
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

Создайте шаблоны в `.gitea/issue_templates/`:
- `bug.md`
- `feature.md`

## Webhooks

### CI/CD Integration

Настройте webhooks для интеграции с внешними CI/CD системами:
- Jenkins
- Drone CI
- Custom CI/CD

## Best Practices

1. **Branch Strategy**: Используйте Git Flow
2. **Code Review**: Требуйте reviews
3. **CI/CD**: Настройте автоматические проверки
4. **Documentation**: Ведите документацию

## Self-Hosted Considerations

### Advantages

- Полный контроль над данными
- Приватность
- Кастомизация

### Setup

1. Установите Gitea на ваш сервер
2. Настройте домен и SSL
3. Создайте репозиторий
4. Настройте CI/CD

## Resources

- [Gitea Documentation](https://docs.gitea.io/)
- [Gitea Actions](https://docs.gitea.io/en-us/usage/actions/)


