# Testing Guide для METR

## Testing Strategy

### Test Pyramid
- **Unit Tests**: Большинство тестов
- **Integration Tests**: Средний слой
- **E2E Tests**: Небольшое количество

## Unit Tests

### Setup
```typescript
import {render, fireEvent} from '@testing-library/react-native';

test('renders correctly', () => {
  const {getByText} = render(<Component />);
  expect(getByText('Hello')).toBeTruthy();
});
```

### Best Practices
- Тестируйте поведение, не реализацию
- Используйте descriptive names
- Изолируйте тесты
- Используйте mocks для зависимостей

## Integration Tests

### Example
```typescript
test('user can login', async () => {
  const {getByPlaceholderText, getByText} = render(<LoginScreen />);
  
  fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'password');
  fireEvent.press(getByText('Login'));
  
  await waitFor(() => {
    expect(getByText('Welcome')).toBeTruthy();
  });
});
```

## E2E Tests

### Detox Setup
```typescript
describe('Login Flow', () => {
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

## Test Coverage

### Target Coverage
- **Overall**: > 80%
- **Critical Paths**: > 90%
- **Utilities**: > 95%

### Running Coverage
```bash
npm test -- --coverage
```

## Best Practices

1. **Write Tests First**: TDD когда возможно
2. **Keep Tests Simple**: Простые и понятные тесты
3. **Test Edge Cases**: Тестируйте граничные случаи
4. **Mock External**: Мокайте внешние зависимости
5. **Maintain Tests**: Поддерживайте тесты актуальными

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)


