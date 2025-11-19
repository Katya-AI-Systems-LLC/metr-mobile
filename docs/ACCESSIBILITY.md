# Accessibility Guide для METR

## Overview

Руководство по обеспечению доступности METR для всех пользователей.

## WCAG Compliance

METR стремится соответствовать WCAG 2.1 Level AA.

## Accessibility Features

### Screen Reader Support
- Используйте `accessibilityLabel`
- Используйте `accessibilityHint`
- Тестируйте с VoiceOver/TalkBack

### Keyboard Navigation
- Поддержка keyboard navigation
- Focus management
- Keyboard shortcuts

### Color Contrast
- Минимум 4.5:1 для текста
- Минимум 3:1 для UI элементов
- Не полагайтесь только на цвет

### Text Scaling
- Поддержка dynamic type
- Адаптивный layout
- Тестирование с увеличенным текстом

## Implementation

### React Native Accessibility
```typescript
<View
  accessible={true}
  accessibilityLabel="Button"
  accessibilityHint="Double tap to activate"
  accessibilityRole="button"
>
  <Text>Click me</Text>
</View>
```

### Testing
```bash
# iOS
# Enable VoiceOver: Settings > Accessibility > VoiceOver

# Android
# Enable TalkBack: Settings > Accessibility > TalkBack
```

## Best Practices

1. **Semantic HTML**: Используйте правильные роли
2. **Labels**: Всегда добавляйте labels
3. **Contrast**: Проверяйте контрастность
4. **Testing**: Тестируйте с screen readers
5. **Feedback**: Предоставляйте feedback

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)


