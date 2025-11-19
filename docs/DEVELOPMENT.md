# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- React Native CLI
- Xcode 14+ (для iOS)
- Android Studio (для Android)
- Java JDK 17+ (для Android)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/metr/metr-mobile.git
cd metr-mobile

# Install dependencies
npm install

# iOS dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npm start
```

## Development Workflow

### Running on Simulator/Emulator

```bash
# iOS
npm run ios

# Android
npm run android
```

### Running on Device

```bash
# iOS
npm run ios --device

# Android
npm run android --device
```

## Code Structure

### Directory Organization

```
app/
├── ai/              # AI modules
├── ar/              # AR/VR features
├── blockchain/      # Web3 integration
├── components/      # Reusable components
├── screens/         # Screen components
├── hooks/           # Custom hooks
├── utils/           # Utility functions
└── theme/           # Theme configuration
```

### Naming Conventions

- **Components**: PascalCase (`METRButton.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`UserProfile.ts`)

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
cd detox
npm test
```

### Writing Tests

```typescript
// Example test
describe('METRButton', () => {
  it('should render correctly', () => {
    const {getByText} = render(<METRButton title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

## Debugging

### React Native Debugger

1. Установите [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Запустите приложение
3. Откройте Dev Menu (Cmd+D / Cmd+M)
4. Выберите "Debug"

### Flipper

```bash
# Install Flipper
# https://fbflipper.com/

# Start with Flipper
npm start --flipper
```

### Logging

```typescript
import {Logger} from './utils/Logger';

Logger.info('Info message');
Logger.error('Error message', error);
Logger.debug('Debug message', data);
```

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

### Formatting

```bash
npm run format
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - Новые функции
- `fix/bug-name` - Исправления багов
- `docs/documentation-name` - Документация
- `refactor/refactor-name` - Рефакторинг

### Commit Messages

Следуйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ai): add smart reply suggestions
fix(android): resolve crash on startup
docs(readme): update installation guide
```

## Performance

### Optimization Tips

1. **Use React.memo** для компонентов
2. **Use useMemo/useCallback** для вычислений
3. **Lazy load** большие компоненты
4. **Optimize images** перед использованием
5. **Avoid unnecessary re-renders**

### Profiling

```bash
# React DevTools Profiler
# Enable in Dev Menu

# Performance Monitor
npm run perf
```

## Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
npm start -- --reset-cache
```

#### iOS build issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Android build issues
```bash
cd android
./gradlew clean
cd ..
```

### Getting Help

- Check [Issues](https://github.com/metr/metr-mobile/issues)
- Ask in [Discussions](https://github.com/metr/metr-mobile/discussions)
- Join [Discord](https://discord.gg/metr)

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [METR Architecture](ARCHITECTURE.md)
- [API Documentation](API.md)


