# Contributing to METR

Спасибо за интерес к проекту METR! Мы рады вашему вкладу.

## 📋 Содержание

- [Code of Conduct](#code-of-conduct)
- [Как помочь](#как-помочь)
- [Процесс разработки](#процесс-разработки)
- [Стиль кода](#стиль-кода)
- [Commit сообщения](#commit-сообщения)
- [Pull Requests](#pull-requests)
- [Тестирование](#тестирование)
- [Документация](#документация)

---

## Code of Conduct

Этот проект следует [Code of Conduct](.github/CODE_OF_CONDUCT.md). Участвуя, вы соглашаетесь соблюдать его условия.

---

## Как помочь

### 🐛 Сообщить о баге

1. Проверьте, не был ли баг уже зарегистрирован в [Issues](https://github.com/metr/metr-mobile/issues)
2. Если нет, создайте новый issue с:
   - Четким описанием проблемы
   - Шагами для воспроизведения
   - Ожидаемым и фактическим поведением
   - Скриншотами (если применимо)
   - Информацией об окружении (OS, версия приложения)

### 💡 Предложить новую функцию

1. Откройте [Feature Request](https://github.com/metr/metr-mobile/issues/new?template=feature_request.md)
2. Опишите функцию и ее пользу
3. Объясните, как она должна работать

### 🔧 Исправить баг или добавить функцию

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Внесите изменения
4. Добавьте тесты
5. Убедитесь, что все тесты проходят
6. Commit изменения
7. Push в ваш fork
8. Откройте Pull Request

---

## Процесс разработки

### Настройка окружения

1. **Fork и Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/metr-mobile.git
   cd metr-mobile
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

3. **Настройка Git**
   ```bash
   git remote add upstream https://github.com/metr/metr-mobile.git
   ```

### Workflow

1. **Обновите ваш fork**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Создайте branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Внесите изменения**
   - Пишите чистый код
   - Следуйте стилю проекта
   - Добавляйте тесты
   - Обновляйте документацию

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Создайте Pull Request**
   - Заполните шаблон PR
   - Опишите изменения
   - Укажите связанные issues

---

## Стиль кода

### TypeScript/JavaScript

- Используйте TypeScript для новых файлов
- Следуйте [ESLint конфигурации](.eslintrc.js)
- Используйте Prettier для форматирования
- Максимальная длина строки: 100 символов
- Используйте meaningful имена переменных

### React Native

- Используйте функциональные компоненты с hooks
- Избегайте лишних re-renders
- Используйте `React.memo` где необходимо
- Оптимизируйте изображения и assets

### Структура файлов

```
app/
├── feature-name/
│   ├── components/      # Компоненты фичи
│   ├── screens/         # Экраны
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Утилиты
│   ├── types.ts         # TypeScript типы
│   └── index.ts         # Экспорты
```

---

## Commit сообщения

Мы следуем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Новая функция
- `fix`: Исправление бага
- `docs`: Изменения в документации
- `style`: Форматирование, отсутствующие точки с запятой и т.д.
- `refactor`: Рефакторинг кода
- `test`: Добавление тестов
- `chore`: Изменения в build процессе или вспомогательных инструментах

### Примеры

```
feat(ai): add smart reply suggestions
fix(android): resolve crash on startup
docs(readme): update installation instructions
refactor(components): simplify button component
```

---

## Pull Requests

### Checklist

- [ ] Код следует стилю проекта
- [ ] Добавлены тесты для новых функций
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] Commit сообщения следуют конвенции
- [ ] PR связан с issue (если есть)
- [ ] Код проверен на линтер ошибки

### Review процесс

1. Автоматические проверки (CI/CD)
2. Code review от maintainers
3. Обсуждение и правки
4. Approval и merge

---

## Тестирование

### Unit тесты

```bash
npm test
```

### E2E тесты

```bash
cd detox && npm test
```

### Покрытие кода

```bash
npm run test:coverage
```

**Минимальное покрытие**: 70%

---

## Документация

### Обновление документации

- Обновляйте README.md при добавлении новых функций
- Добавляйте JSDoc комментарии к публичным API
- Обновляйте CHANGELOG.md для значимых изменений

### Документация кода

```typescript
/**
 * Generates smart reply suggestions based on message context
 * 
 * @param message - The message to generate replies for
 * @param context - Additional context (conversation history, user preferences)
 * @returns Array of suggested replies
 * 
 * @example
 * const replies = generateSmartReplies("Hello", { history: [] });
 */
export function generateSmartReplies(message: string, context: Context): string[] {
  // ...
}
```

---

## Вопросы?

Если у вас есть вопросы:

- Откройте [Discussion](https://github.com/metr/metr-mobile/discussions)
- Присоединитесь к [Discord](https://discord.gg/metr)
- Напишите на support@metr.app

---

## Благодарности

Спасибо всем контрибьюторам! 🙏

---

**Happy Coding! 🚀**
