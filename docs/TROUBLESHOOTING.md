# Troubleshooting Guide для METR

## Common Issues

### Metro Bundler Issues

#### Problem: Metro не запускается
**Solution:**
```bash
npm start -- --reset-cache
```

#### Problem: Module not found
**Solution:**
```bash
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### iOS Build Issues

#### Problem: Pod install fails
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Problem: Xcode build fails
**Solution:**
1. Clean build folder (Cmd+Shift+K)
2. Clean derived data
3. Restart Xcode

### Android Build Issues

#### Problem: Gradle build fails
**Solution:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

#### Problem: SDK not found
**Solution:**
1. Установите Android SDK
2. Настройте ANDROID_HOME
3. Проверьте PATH

### Dependency Issues

#### Problem: Version conflicts
**Solution:**
```bash
npm ls
npm install --legacy-peer-deps
```

#### Problem: Native modules not linking
**Solution:**
```bash
cd ios && pod install && cd ..
cd android && ./gradlew clean && cd ..
```

## Performance Issues

### Slow Builds
- Используйте Gradle daemon
- Увеличьте heap size
- Используйте build cache

### Slow App Performance
- Проверьте re-renders
- Используйте React.memo
- Оптимизируйте images

## Debugging

### React Native Debugger
1. Установите React Native Debugger
2. Запустите приложение
3. Откройте Dev Menu
4. Выберите "Debug"

### Flipper
1. Установите Flipper
2. Запустите приложение
3. Откройте Flipper
4. Используйте plugins

### Logs
```typescript
import {Logger} from './utils/Logger';

Logger.debug('Debug message', data);
Logger.error('Error message', error);
```

## Getting Help

### Before Asking
1. Проверьте документацию
2. Поищите в Issues
3. Проверьте logs
4. Попробуйте решения выше

### When Asking
- Опишите проблему четко
- Приложите logs
- Укажите шаги для воспроизведения
- Укажите окружение

### Where to Ask
- GitHub Issues
- Discord
- Email: support@metr.app


