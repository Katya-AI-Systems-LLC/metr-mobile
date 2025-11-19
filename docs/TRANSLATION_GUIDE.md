# Translation Guide для METR

## Overview

Руководство по переводу и локализации METR.

## Supported Languages

- English (en) - Default
- Russian (ru) - In Progress
- Spanish (es) - Planned
- German (de) - Planned
- French (fr) - Planned

## Translation Files

Translations находятся в:
```
app/locales/
  en/
    common.json
    errors.json
    ui.json
  ru/
    common.json
    errors.json
    ui.json
```

## Translation Format

### JSON Structure
```json
{
  "common": {
    "welcome": "Welcome to METR",
    "loading": "Loading..."
  },
  "errors": {
    "network": "Network error",
    "unknown": "Unknown error"
  }
}
```

## Using Translations

### In Components
```typescript
import {useTranslation} from 'react-i18next';

const Component = () => {
  const {t} = useTranslation();
  return <Text>{t('common.welcome')}</Text>;
};
```

### In Code
```typescript
import i18n from './i18n';

const message = i18n.t('errors.network');
```

## Adding New Language

### 1. Create Locale Directory
```bash
mkdir -p app/locales/es
```

### 2. Copy Translation Files
```bash
cp app/locales/en/*.json app/locales/es/
```

### 3. Translate
Переведите все строки в JSON файлах.

### 4. Register Language
```typescript
i18n.addResourceBundle('es', 'common', {
  welcome: 'Bienvenido a METR',
});
```

## Translation Guidelines

### 1. Context
- Сохраняйте контекст
- Учитывайте культурные различия
- Избегайте дословного перевода

### 2. Length
- Учитывайте длину строк
- UI должен работать с разными длинами
- Тестируйте на реальных устройствах

### 3. Formatting
- Сохраняйте форматирование
- Используйте placeholders правильно
- Тестируйте с разными данными

### 4. Technical Terms
- Используйте стандартные термины
- Избегайте транслитерации
- Используйте глоссарий

## Contributing Translations

### Process
1. Fork репозитория
2. Создайте translation branch
3. Переведите файлы
4. Создайте PR
5. Получите review от native speakers

### Quality Checklist
- [ ] Все строки переведены
- [ ] Нет дословных переводов
- [ ] Форматирование сохранено
- [ ] Технические термины правильные
- [ ] Протестировано в приложении

## Tools

### i18next
- Основная библиотека для i18n
- Поддержка pluralization
- Interpolation support

### Translation Management
- Crowdin (планируется)
- Weblate (планируется)

## Best Practices

1. **Don't Hardcode**: Никогда не хардкодьте строки
2. **Use Keys**: Используйте ключи вместо текста
3. **Context**: Добавляйте контекст в комментарии
4. **Test**: Тестируйте переводы в UI
5. **Review**: Получайте review от native speakers

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [Translation Best Practices](https://www.i18next.com/principles/fallback)


