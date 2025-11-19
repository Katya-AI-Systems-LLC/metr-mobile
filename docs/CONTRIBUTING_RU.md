# Руководство по внесению вклада в METR

## Как внести вклад

Спасибо за интерес к METR! Мы рады вашему вкладу.

## Процесс разработки

### 1. Fork репозитория

Создайте fork проекта на GitHub.

### 2. Создайте ветку

```bash
git checkout -b feature/amazing-feature
```

### 3. Внесите изменения

- Следуйте code style
- Добавьте тесты
- Обновите документацию

### 4. Commit

```bash
git commit -m "Add amazing feature"
```

### 5. Push

```bash
git push origin feature/amazing-feature
```

### 6. Pull Request

Создайте Pull Request с описанием изменений.

## Code Style

### TypeScript
- Используйте TypeScript строго
- Следуйте ESLint правилам
- Используйте Prettier для форматирования

### React Native
- Используйте функциональные компоненты
- Используйте hooks
- Оптимизируйте re-renders

### Naming
- Компоненты: PascalCase (`METRButton`)
- Функции: camelCase (`getUserData`)
- Константы: UPPER_SNAKE_CASE (`API_URL`)

## Тестирование

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
Стремитесь к покрытию > 80%.

## Документация

### Code Comments
- Используйте JSDoc для публичных API
- Комментируйте сложную логику
- Объясняйте "почему", а не "что"

### Documentation Updates
- Обновляйте README при необходимости
- Обновляйте API документацию
- Добавляйте примеры использования

## Pull Request Process

### Checklist
- [ ] Код следует стилю проекта
- [ ] Тесты добавлены и проходят
- [ ] Документация обновлена
- [ ] Коммиты следуют conventional commits
- [ ] PR имеет описание

### Review Process
1. Создайте PR
2. Дождитесь CI/CD проверок
3. Получите review
4. Внесите изменения при необходимости
5. После approval - merge

## Типы вкладов

### Bug Fixes
- Опишите проблему
- Покажите как воспроизвести
- Покажите исправление

### Features
- Опишите функцию
- Объясните use case
- Добавьте тесты

### Documentation
- Исправьте ошибки
- Улучшите ясность
- Добавьте примеры

### Tests
- Добавьте тесты для новых функций
- Улучшите coverage
- Исправьте flaky tests

## Вопросы?

- GitHub Discussions
- Discord: https://discord.gg/metr
- Email: dev@metr.app

## Code of Conduct

Следуйте [Code of Conduct](../.github/CODE_OF_CONDUCT.md).

## Лицензия

Внося вклад, вы соглашаетесь с лицензией проекта.


