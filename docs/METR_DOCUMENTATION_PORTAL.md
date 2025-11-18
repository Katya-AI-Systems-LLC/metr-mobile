# METR Documentation Portal

Этот файл — центральная точка входа в документацию METR (Modern Enterprise Team Revolution).

## 1. Обзор продукта и концепции

- **Концепция модернизации и ребрендинга**  
  `docs/MODERNIZATION_CONCEPT_2025.md` — исходный стратегический документ, описывающий переход от Mattermost Mobile к METR.
- **Итоговый статус ребрендинга**  
  `FINAL_REBRANDING_STATUS.md` — что именно переименовано, какие экраны и модули обновлены визуально.
- **Итоговый статус по функциональности**  
  `FINAL_IMPLEMENTATION_STATUS.md` — сводный перечень реализованных модулей (AI, Web3, AR/VR, мобильные фичи).
- **Финальный статус проекта**  
  `FINAL_STATUS.md` / `IMPLEMENTATION_COMPLETE.md` / `ULTIMATE_CUSTOMIZATION_COMPLETE.md` — детальные отчёты о завершённой кастомизации.
- **Whitepaper и продуктовый обзор**  
  `docs/WHITEPAPER_METR.md` — высокоуровневое описание видения, монетизации и целевой аудитории METR (RU).  
  `docs/WHITEPAPER_METR_EN.md` — английская версия whitepaper.
- **Feature Spec Template**  
  `docs/FEATURE_SPEC_TEMPLATE_METR.md` — шаблон для описания новых фич.

Рекомендуемый порядок чтения:  
`MODERNIZATION_CONCEPT_2025.md → FINAL_REBRANDING_STATUS.md → FINAL_IMPLEMENTATION_STATUS.md`.

---

## 2. Быстрый старт для разработчиков

Основные документы по сборке и запуску:

- `README.md` — короткий обзор METR, архитектуры и ссылок на документацию.  
- `INSTALLATION_GUIDE.md` — пошаговая установка и подготовка окружения.  
- `ANDROID_BUILD_GUIDE.md` — нюансы сборки под Android.  
- `QUICK_BUILD.md` — быстрый сценарий сборки/запуска.

Дополнительно:

- `ANDROID_BUILD_GUIDE.md` + `QUICK_BUILD.md` пригодны для CI/CD сценариев (GitHub/GitLab/отечественные Git‑платформы).  
- `app.json`, `metro.config.js`, `babel.config.js` — базовые конфигурации React Native.

---

## 3. Архитектура и структура проекта

Ключевые директории:

- `app/` — основной код клиента (React Native + TypeScript):
  - `app/ai/` — AI‑модули (ассистенты, Digital Twin, аналитика).
  - `app/ui/` — UX‑подсистема (MicroInteractions, AdaptiveUI, GestureNavigation, SmartContextualMenus, DynamicThemes, HapticFeedback).
  - `app/web3/` — интеграция с Web3/ блокчейн‑стеком.
  - `app/computing/` — edge‑вычисления (`EdgeComputing.ts` и др.).
  - `app/sync/` — кросс‑платформенная синхронизация (`CrossPlatformSync.ts`).
  - `app/productivity/`, `app/collaboration/`, `app/audio/`, `app/ar/` — функциональные подсистемы.
- `contracts/` — Solidity‑контракты (NFT, DAO, Token, Blockchain Audit Trail).
- `docs/` — стратегические и технические документы (этот портал, концепция, базы данных и т.д.).
- `android/`, `ios/` — нативные проекты.
- `scripts/`, `detox/`, `test/` — утилиты, end‑to‑end и unit‑тесты.

Обзор архитектуры в одном месте: `docs/ARCHITECTURE_METR.md`.

Дополнительные описания:

- `CUSTOMIZATION_IMPLEMENTATION.md`, `CUSTOMIZATION_ROADMAP.md`, `FINAL_CUSTOMIZATION_SUMMARY.md`, `COMPLETE_CUSTOMIZATION_STATUS.md` — как именно модифицировался и расширялся проект.

---

## 4. AI, Web3, AR/VR и Edge

### 4.1 AI‑подсистема

- `app/ai/PersonalAssistant.ts` — персональный ассистент.  
- `app/ai/TeamAssistant.ts` — командный AI‑менеджер.  
- `app/ai/DigitalTwin.ts` — цифровой двойник команды.  
- `app/ai/EmotionAnalysis.ts` — анализ настроения.  
- `app/ai/ProductivityInsights.ts` — аналитика продуктивности.  
- `app/ai/workflows/*` — описания AI‑воркфлоу.

Сводный статус по AI: `FINAL_IMPLEMENTATION_STATUS.md` и `IMPLEMENTATION_COMPLETE.md`.

### 4.2 Web3 и токеномика

- `contracts/*.sol` — смарт‑контракты METR (NFT Achievements, DAO, Token, Audit Trail).  
- `app/web3/*` — менеджеры кошельков, WalletConnect, IPFS и интеграции.
- `BLOCKCHAIN_AUDIT_TRAIL` описан в `contracts/BlockchainAuditTrail.sol` и упомянут в `FINAL_IMPLEMENTATION_STATUS.md`.
 - `EMOTIONAL_BLOCKCHAIN` описан в `contracts/EmotionalBlockchain.sol` и документирован в `docs/EMOTIONAL_BLOCKCHAIN.md`.

### 4.3 AR/VR и пространственные коммуникации

- `app/ar/ARAnnotations.ts` — AR‑аннотации.  
- `app/audio/SpatialAudioRooms.ts` — 3D‑аудио‑комнаты.  
- `app/collaboration/VirtualOffice*` — виртуальные офисы и «holographic»‑сценарии.

Концепция **Quantum Meetings** и сценарии "параллельных реальностей" описаны в `docs/QUANTUM_MEETINGS.md`.

### 4.4 Edge‑вычисления и офлайн‑режим

- `app/computing/EdgeComputing.ts` — распределение задач между устройствами.  
- `app/sync/P2PSync.ts` (если присутствует) — P2P‑синхронизация.
- `OfflineAI`/кэш моделей — офлайн‑инференс.

---

## 5. UI/UX и дизайн

Основные документы и модули:

- `REBRANDING_GUIDE.md` — подробный гайд по ребрендингу METR.  
- `REBRANDING_SUMMARY.md`, `REBRANDING_COMPLETE.md`, `FINAL_REBRANDING_STATUS.md` — статус и детали внедрения.
- `app/theme/metrTheme.ts` — основная тема METR (цвета Electric Purple, Cyber Teal, Neon Pink, Dark Mode first).
- `app/components/glassmorphism/*` — компоненты в стиле glassmorphism.
- `app/ui/MicroInteractions.ts` — микро‑анимации и микровзаимодействия.  
- `app/ui/AdaptiveUI.ts` — адаптивный UI.  
- `app/ui/GestureNavigation.ts` — управление жестами.  
- `app/ui/SmartContextualMenus.ts` — умные контекстные меню.  
- `app/ui/DynamicThemes.ts` — динамические темы по времени суток и контексту.  
- `app/ui/HapticFeedback.ts` — тактильная обратная связь.

Исторические и вспомогательные статусы по UI/UX также отмечены в:  
`REBRANDING_CHECKLIST.md`, `FINAL_REBRANDING_STATUS.md`.

---

## 6. Базы данных и конфигурация

Внутри `docs/database/`:

- описания схем, миграций и особенностей хранения данных;  
- рекомендации по развёртыванию и обновлению БД для self‑hosted инсталляций.

Базовые конфигурации смотрите также в:

- `docs/base_configs.md` — общие параметры и рекомендуемые настройки;  
- `*.config.js` в корне проекта.

---

## 7. Git‑платформы и рабочие процессы

Для GitHub, GitLab, Bitbucket, Gitea/Forgejo и отечественных Git‑платформ (GitFlic и др.) подготовлен отдельный документ:

- `docs/GIT_PLATFORM_GUIDE.md` —
  - рекомендуемая стратегия веток и PR;  
  - использование шаблонов `ISSUE_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md`;  
  - общие рекомендации по настройке CI/CD;  
  - зеркалирование и форки для изолированных сред.

Дополнительно для CI/CD:

- `codemagic.yaml` — основной файл конфигурации Pipelines Codemagic.  
- `docs/CI_CD_METR.md` — подробный гайд по CI/CD для METR.

---

## 8. Безопасность и лицензирование

- `SECURITY.md` — политика безопасности, канал для репортов, PGP‑ключ.  
- `LICENSE.txt` — оригинальная Apache License 2.0 от Mattermost, Inc.  
- `NOTICE.txt` — список сторонних компонентов и атрибуций.  
- `LICENSE_METR.md` — обзор лицензирования METR и статуса производного проекта.

Важно: METR является производным от Mattermost Mobile и соблюдает требования Apache 2.0.  
Все новые модули и документация следуют тем же принципам, если явно не указано иное.

---

## 9. Вклад и развитие

- `CONTRIBUTING.md` — правила внесения вкладов.  
- `ISSUE_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md` — шаблоны задач и запросов на слияние.  
- `FINAL_RELEASE.md`, `RELEASE_NOTES.md`, `RELEASE_STATUS.md`, `FINAL_RELEASE_STATUS.md` — дорожная карта и заметки к релизам.
- `docs/CHANGELOG_METR.md` — сводный changelog модернизации METR поверх оригинального Mattermost Mobile.

Для разработчиков также доступно:

- `docs/DEVELOPMENT_GUIDE_METR.md` — руководство по разработке и расширению METR.

Рекомендуется при планировании изменений ориентироваться на:

- `CUSTOMIZATION_ROADMAP.md` — дальнейшее развитие фич;  
- `FINAL_STATUS.md` — какие направления уже закрыты, какие находятся в прогрессе.

---

## 10. Как пользоваться этим порталом

1. Если вы **новый разработчик** — начните с разделов 1–3 и `README.md`.  
2. Если вы занимаетесь **DevOps/инфраструктурой** — читайте разделы 2, 3, 6, 7, 8.  
3. Если вы отвечаете за **продукт и UX** — разделы 1, 4, 5 и REBRANDING‑документы.  
4. Для **юристов и compliance** — раздел 8 и файлы `LICENSE*.md`, `NOTICE.txt`.

Этот файл должен оставаться актуальной картой всей документации METR; при добавлении новых ключевых документов обновляйте соответствующий раздел.
