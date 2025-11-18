# METR — Modern Enterprise Team Revolution

**"Measure Your Team's Potential"**

METR — это полное переосмысление Mattermost Mobile как AI-powered платформы для продуктивности команд. Мы объединили автономных AI-агентов, Web3-механику, AR/VR коммуникацию, edge-вычисления и глубокую мобильную интеграцию в одном приложении, готовом к self-hosting и enterprise масштабам.

---

## 📌 Ключевая ценность

| Столп | Что включает |
|-------|--------------|
| **AI-First** | Персональные и командные ассистенты, Digital Twin, Emotion Analysis, Predictive Insights |
| **Privacy & Security** | Zero-Knowledge Encryption, Biometric Auth, Quantum-Resistant Crypto |
| **Web3-Ready** | NFT Achievements, DAO governance, Token economy, Blockchain Audit Trail |
| **Metaverse-Compatible** | Spatial Audio Rooms, Virtual Offices, AR Annotations, Holographic meetings |
| **Productivity-Focused** | Workflow Builder, OKRs, Time Tracking, Knowledge Graph, Automation Suites |

Полный список модулей и API см. в [`FINAL_IMPLEMENTATION_STATUS.md`](./FINAL_IMPLEMENTATION_STATUS.md).

---

## 🧭 Архитектура

- **Frontend**: React Native 0.73+, Expo SDK 50 optional, Reanimated 3, RN Skia, Tailwind-подобные утилиты.
- **AI Stack**: TensorFlow Lite, локальные модели (Whisper-tiny, BERT-tiny), OpenAI/Whisper/DALL·E коннекторы, автономные агенты.
- **Web3 Stack**: Solidity контракты (Polygon/Ethereum), WalletConnect, IPFS, Ceramic ID.
- **Sync & Edge**: CrossPlatformSync (handoff/clipboard), P2P mesh, Offline AI кэширование, `EdgeComputing` для распределённых задач.
- **Security**: Hardware keystore, biometric fallback, zero-knowledge поток для чувствительных данных.

Схемы данных и событий — в [`docs/base_configs.md`](./docs/base_configs.md) и `app/*` подпакетах.

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/katya-ai-systems/metr-mobile.git
cd metr-mobile
npm install # или yarn

# Быстрая сборка dev окружения
npx react-native start
npx react-native run-ios   # или run-android

# Edge/AI симуляторы
npm run simulate:ai
npm run simulate:web3
```

**Минимальные версии серверов**: METR Core 1.0+ (совместим с Mattermost ESR 7.1).  
**Поддержка платформ**: iOS 14+, Android 10+.  
**Push**: используйте self-hosted METR Push Relay (`docs/INSTALLATION_GUIDE.md`).

---

## 📚 Документация

| Раздел | Файл |
|--------|------|
| Стратегия модернизации | [`docs/MODERNIZATION_CONCEPT_2025.md`](./docs/MODERNIZATION_CONCEPT_2025.md) |
| Полная реализация | [`IMPLEMENTATION_COMPLETE.md`](./IMPLEMENTATION_COMPLETE.md) |
| Ребрендинг | [`FINAL_REBRANDING_STATUS.md`](./FINAL_REBRANDING_STATUS.md) |
| Установка и DevOps | [`INSTALLATION_GUIDE.md`](./INSTALLATION_GUIDE.md), [`ANDROID_BUILD_GUIDE.md`](./ANDROID_BUILD_GUIDE.md), [`QUICK_BUILD.md`](./QUICK_BUILD.md) |
| Безопасность | [`SECURITY.md`](./SECURITY.md) |
| Миграция | [`MIGRATION_TO_METR.md`](./MIGRATION_TO_METR.md) |
| Док для Git-платформ | [`docs/GIT_PLATFORM_GUIDE.md`](./docs/GIT_PLATFORM_GUIDE.md) |
| Лицензирование | [`LICENSE_METR.md`](./LICENSE_METR.md) + [`LICENSE.txt`](./LICENSE.txt) |

Полный навигатор по файлам см. в [`docs/METR_DOCUMENTATION_PORTAL.md`](./docs/METR_DOCUMENTATION_PORTAL.md).

---

## 🧠 AI & Automation

- `app/ai/PersonalAssistant.ts`: персональный ассистент с Smart Replies, расписаниями, Code Review.
- `app/ai/TeamAssistant.ts`: командный менеджер со сводками митингов.
- `app/ai/DigitalTwin.ts`: цифровой двойник команды (предиктивные сценарии, health-score).
- `app/ai/MicroInteractions.ts` + `app/ui/HapticFeedback.ts`: полный UX motion kit.

AI рабочие процессы определяются в `app/ai/workflows/*` и кастомизируются через Workflow Builder (см. `app/workflows/WorkflowBuilder.tsx`).

---

## 🌐 Web3 & Compliance

- Контракты лежат в [`contracts/`](./contracts) (NFT, Governance, AuditTrail).
- Интеграция с WalletConnect/IPFS и корпоративными кошельками описана в `app/web3/*`.
- Лицензирование и открытые компоненты сведены в [`LICENSE_METR.md`](./LICENSE_METR.md) и `NOTICE.txt`.

---

## 📱 Mobile-First возможности

| Модуль | Описание |
|--------|----------|
| `EdgeComputing.ts` | распределённые задания, mesh discovery, ML-инференс |
| `CrossPlatformSync.ts` | Handoff, Universal Clipboard, Seamless Switching |
| `GestureNavigation.ts` | мультитач навигация + хаптика |
| `SmartContextualMenus.ts` | AI меню с предсказаниями действий |
| `DynamicThemes.ts` | адаптивные темы по времени/контексту |

Планы по iOS Shortcuts, Widgets, Android Material You и Bubbles задокументированы в [`CUSTOMIZATION_ROADMAP.md`](./CUSTOMIZATION_ROADMAP.md).

---

## 🤝 Как внести вклад

1. Ознакомьтесь с [`CONTRIBUTING.md`](./CONTRIBUTING.md) и `SECURITY.md`.
2. Выберите задачу в [`FINAL_STATUS.md`](./FINAL_STATUS.md) → раздел «Next Steps».
3. Соблюдайте гайд по коммитам/PR из [`PULL_REQUEST_TEMPLATE.md`](./PULL_REQUEST_TEMPLATE.md).
4. Для отечественных Git-платформ используйте сценарии из [`docs/GIT_PLATFORM_GUIDE.md`](./docs/GIT_PLATFORM_GUIDE.md).

Мы принимаем вклад в форме кода, UX-концептов, Solidity-контрактов и документации.

---

## 📣 Связь и поддержка

- **Product Hunt / Launch**: готовится к Q1 2025 (см. `FINAL_RELEASE.md`).
- **Community**: Discord, Matrix, self-hosted METR Hub (описание в `REBRANDING_GUIDE.md`).
- **Security reports**: security@metr.app (PGP fingerprint указан в `SECURITY.md`).

METR — катализатор эволюции командной работы. Добро пожаловать в будущее! 🚀
