# 🚀 METR - Measure Your Team's Potential

<div align="center">

![METR Logo](assets/branding/metr-logo-base.svg)

**AI-powered team productivity platform built with React Native**

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/metr/metr-mobile)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE.txt)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://github.com/metr/metr-mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-blue.svg)](https://reactnative.dev/)

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 О проекте

**METR** (Modern Enterprise Team Revolution) - это не просто мессенджер, а интеллектуальная экосистема для командной работы нового поколения. Платформа объединяет AI, Web3, AR/VR и передовые технологии для максимальной продуктивности команд.

### 🎯 Ключевые принципы

- **AI-First**: Встроенный AI-ассистент для каждой команды
- **Privacy-First**: Полный контроль над данными с возможностью self-hosting
- **Web3-Ready**: Интеграция с блокчейн для прозрачности и токенизации
- **Metaverse-Compatible**: Готовность к виртуальным пространствам
- **Productivity-Focused**: Фокус на результатах, а не на переписке

---

## ✨ Features

### 🤖 AI Capabilities
- **Personal AI Assistant** - Персональный ассистент для каждого пользователя
- **Team AI Manager** - Командный AI-менеджер для проектов
- **Smart Summaries** - Автоматические саммари длинных дискуссий
- **Action Items Extraction** - Выделение задач из переписки
- **Emotion Analysis** - Анализ настроения команды
- **Code Review Assistant** - Помощь в код-ревью
- **Predictive Analytics** - Прогнозирование сроков и рисков

### 💎 Web3 Integration
- **NFT Achievements** - Награды за достижения в виде NFT
- **DAO Governance** - Управление организацией через DAO
- **Token Economy** - Внутренние токены для мотивации
- **Blockchain Audit Trail** - Неизменяемая история действий
- **DeFi Integration** - Интеграция с крипто-платежами

### 🥽 AR/VR Features
- **Spatial Audio Rooms** - 3D аудио-комнаты
- **Virtual Offices** - Виртуальные офисы для удаленных команд
- **Holographic Meetings** - Голографические встречи
- **AR Annotations** - AR-аннотации к документам

### 🔐 Advanced Security
- **Zero-Knowledge Encryption** - Шифрование с нулевым разглашением
- **Biometric Authentication** - Биометрическая аутентификация
- **Quantum-Resistant Cryptography** - Квантово-устойчивая криптография

### 📋 Productivity Suite
- **Task Management 2.0** - Встроенный таск-менеджер с AI
- **Time Tracking** - Автоматический тайм-трекинг
- **Goal Setting & OKRs** - Система целей и OKR
- **Knowledge Base** - Встроенная база знаний с AI-поиском
- **Workflow Builder** - Визуальный конструктор процессов

### 🤝 Collaboration Tools
- **Whiteboard 3D** - Трехмерные доски для brainstorming
- **Code Collaboration** - Совместное программирование в реальном времени
- **Design Review** - Инструменты для дизайн-ревью
- **Video Messages** - Асинхронные видео-сообщения
- **Voice Notes** - Голосовые заметки с расшифровкой

### 📊 Analytics & Insights
- **Team Health Dashboard** - Дашборд здоровья команды
- **Performance Metrics** - Метрики производительности
- **Communication Patterns** - Анализ паттернов коммуникации
- **Burnout Prevention** - Предотвращение выгорания
- **Skills Matrix** - Матрица компетенций команды

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+ и npm/yarn
- **React Native** 0.73+
- **Java JDK** 17+ (для Android)
- **Xcode** 14+ (для iOS)
- **Android Studio** (для Android)

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/metr/metr-mobile.git
cd metr-mobile

# Установить зависимости
npm install

# Для iOS
cd ios && pod install && cd ..

# Запустить Metro bundler
npm start

# Запустить на iOS
npm run ios

# Запустить на Android
npm run android
```

Подробнее в [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

---

## 📱 Сборка

### Android Debug APK

```bash
# Windows
npm run build:android-debug:win

# Linux/Mac
npm run build:android-debug:unix
```

Подробнее в [BUILD_ANDROID_DEBUG.md](BUILD_ANDROID_DEBUG.md)

### iOS Build

```bash
cd ios
xcodebuild -workspace Mattermost.xcworkspace -scheme Mattermost -configuration Debug
```

---

## 📚 Документация

- [Installation Guide](INSTALLATION_GUIDE.md) - Подробная инструкция по установке
- [Modernization Concept](docs/MODERNIZATION_CONCEPT_2025.md) - Концепция модернизации
- [API Documentation](docs/API.md) - Документация API
- [Architecture](docs/ARCHITECTURE.md) - Архитектура приложения
- [Contributing Guide](CONTRIBUTING.md) - Руководство для контрибьюторов
- [Security Policy](SECURITY.md) - Политика безопасности
- [Release Notes](RELEASE_NOTES.md) - Заметки о релизах

---

## 🏗️ Архитектура

```
metr-mobile/
├── app/
│   ├── ai/                 # AI модули
│   ├── ar/                 # AR/VR функции
│   ├── blockchain/         # Web3 интеграция
│   ├── collaboration/      # Инструменты коллаборации
│   ├── components/         # UI компоненты
│   ├── productivity/       # Продуктивность
│   ├── security/           # Безопасность
│   └── ...
├── contracts/              # Smart contracts
├── android/                # Android нативные модули
├── ios/                    # iOS нативные модули
└── docs/                   # Документация
```

---

## 🧪 Тестирование

```bash
# Unit тесты
npm test

# E2E тесты (Detox)
cd detox && npm test

# Линтинг
npm run lint

# Type checking
npm run type-check
```

---

## 🤝 Contributing

Мы приветствуем вклад в проект! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) для получения подробной информации.

### Процесс

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован под Apache License 2.0 - см. [LICENSE.txt](LICENSE.txt) для деталей.

---

## 👥 Команда

- **METR Team** - Разработка и поддержка

---

## 🙏 Благодарности

- React Native Community
- Mattermost (базовая платформа)
- Все контрибьюторы

---

## 📞 Контакты

- **Website**: [metr.app](https://metr.app)
- **Email**: support@metr.app
- **Discord**: [Join our community](https://discord.gg/metr)
- **Twitter**: [@metrapp](https://twitter.com/metrapp)

---

## 🌟 Star History

Если проект полезен, поставьте ⭐ на GitHub!

---

<div align="center">

**Made with ❤️ by METR Team**

[⬆ Back to Top](#-metr---measure-your-teams-potential)

</div>
