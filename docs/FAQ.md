# FAQ - Часто задаваемые вопросы

## General

### Что такое METR?
METR (Modern Enterprise Team Revolution) - это AI-powered платформа для командной продуктивности.

### Как установить METR?
См. [INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md)

### Какие платформы поддерживаются?
- iOS 12.1+
- Android 7.0+

## Development

### Как начать разработку?
См. [DEVELOPMENT.md](DEVELOPMENT.md) и [ONBOARDING.md](ONBOARDING.md)

### Как запустить тесты?
```bash
npm test
```

### Как собрать APK?
```bash
npm run build:android-debug:win
```

## Features

### Как использовать AI Assistant?
```typescript
import METR from './app/core/METRIntegration';
const response = await METR.AI.personal.ask('question');
```

### Как подключить Web3?
См. [API.md](API.md) раздел Web3 Module

### Как использовать Virtual Offices?
См. [API.md](API.md) раздел AR/VR Module

## Troubleshooting

### Приложение не запускается
См. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Build fails
См. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Metro bundler issues
```bash
npm start -- --reset-cache
```

## Contributing

### Как внести вклад?
См. [CONTRIBUTING.md](../CONTRIBUTING.md)

### Как создать PR?
1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте PR

### Какие стандарты кода?
См. [CONTRIBUTING.md](../CONTRIBUTING.md) раздел Code Style

## Support

### Где получить помощь?
- GitHub Issues
- Discord: https://discord.gg/metr
- Email: support@metr.app

### Как сообщить о баге?
Создайте issue используя bug report template

### Как предложить функцию?
Создайте issue используя feature request template


