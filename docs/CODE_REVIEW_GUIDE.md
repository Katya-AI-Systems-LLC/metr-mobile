# Code Review Guide для METR

## Overview

Руководство по code review процессу в METR.

## Review Checklist

### Code Quality
- [ ] Код следует стилю проекта
- [ ] Нет дублирования кода
- [ ] Используются правильные паттерны
- [ ] Код читаемый и понятный

### Functionality
- [ ] Код работает как задумано
- [ ] Edge cases обработаны
- [ ] Error handling присутствует
- [ ] Performance considerations учтены

### Testing
- [ ] Тесты добавлены
- [ ] Тесты покрывают новый код
- [ ] Все тесты проходят
- [ ] Тесты понятные

### Documentation
- [ ] Комментарии добавлены где нужно
- [ ] JSDoc присутствует для публичных API
- [ ] README обновлен (если нужно)
- [ ] CHANGELOG обновлен (если нужно)

### Security
- [ ] Нет hardcoded секретов
- [ ] Input validation присутствует
- [ ] Security best practices соблюдены
- [ ] Dependencies проверены

## Review Process

### 1. Author
- Создает PR/MR
- Заполняет template
- Добавляет reviewers
- Готов к review

### 2. Reviewer
- Читает код
- Проверяет checklist
- Оставляет комментарии
- Approves или requests changes

### 3. Author
- Отвечает на комментарии
- Вносит изменения
- Обновляет PR/MR

### 4. Merge
- Все проверки пройдены
- Все approvals получены
- CI/CD passing
- Merge выполнен

## Review Guidelines

### Be Constructive
- Предлагайте решения, не только проблемы
- Объясняйте почему
- Будьте вежливыми

### Be Thorough
- Проверяйте весь код
- Не пропускайте детали
- Задавайте вопросы

### Be Timely
- Review в течение 24 часов
- Комментируйте быстро
- Не блокируйте без причины

## Common Issues

### Code Style
- Используйте Prettier
- Следуйте ESLint правилам
- Проверьте перед PR

### Performance
- Избегайте лишних re-renders
- Оптимизируйте loops
- Используйте memoization

### Security
- Не храните секреты в коде
- Валидируйте input
- Используйте prepared statements

## Tools

### Automated Checks
- ESLint для linting
- Prettier для formatting
- TypeScript для type checking
- Jest для тестирования

### Review Tools
- GitHub Review
- GitLab Review
- CodeClimate
- SonarQube

## Best Practices

1. **Small PRs**: Легче review
2. **Clear descriptions**: Понятные описания
3. **Self-review**: Проверьте свой код перед PR
4. **Respond promptly**: Быстро отвечайте на комментарии


