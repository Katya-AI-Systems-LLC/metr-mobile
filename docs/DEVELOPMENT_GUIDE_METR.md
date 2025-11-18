# Руководство разработчика METR

Этот документ описывает, как работать с кодовой базой METR, какие соглашения по коду действуют и как правильно добавлять новые фичи.

## 1. Технологический стек

- **Язык**: TypeScript (React Native), частично JavaScript.
- **Фреймворк**: React Native 0.70+.
- **Стили**: JS‑стили + утилитарные подходы (в духе Tailwind для RN).
- **Сборка**: Metro bundler, Gradle (Android), Xcode (iOS).
- **Тесты**: Jest, Detox (e2e), вспомогательные скрипты в `detox/` и `test/`.

Подробнее о зависимостях — `package.json` и `INSTALLATION_GUIDE.md`.

---

## 2. Структура проекта (кратко)

- `app/` — основной код клиента:
  - `app/ai/` — AI, Digital Twin, аналитика;
  - `app/ui/` — UI/UX подсистема;
  - `app/web3/` — Web3 менеджер и интеграции;
  - `app/computing/` — edge‑вычисления;
  - `app/sync/` — синхронизация и cross‑device сценарии;
  - `app/productivity/`, `app/collaboration/`, `app/ar/`, `app/audio/` и др.
- `contracts/` — смарт‑контракты (Solidity).
- `docs/` — документация (портал, гайды, отчёты).
- `android/`, `ios/` — нативные проекты.

Навигация по документации — `docs/METR_DOCUMENTATION_PORTAL.md`.

---

## 3. Соглашения по коду

### 3.1 TypeScript

- Не использовать `any`, кроме как временную меру; по возможности — явные типы.
- Интерфейсы и типы — рядом с кодом (`types.ts`) или в соответствующих модулях.
- Соблюдать strict‑режим `tsconfig.json` (по мере его ужесточения).

### 3.2 Импорт модулей

- Относительные импорты внутри одного домена (`./Something` / `../sub/Thing`).
- Абсолютные/алиас‑импорты — в соответствии с настройками `babel-plugin-module-resolver`.
- Не создавать "циклы" между доменами (например, `app/ai` ↔ `app/ui`) без явной необходимости; лучше обмениваться событием/данными через слой менеджеров.

### 3.3 Стиль

- Использовать ESLint конфиг из `@react-native-community/eslint-config` + локальные правила.
- Запускать `npm run lint` и `npm run tsc` перед PR.
- Именование файлов: `PascalCase` для компонентов, `CamelCase` для утилит, `kebab-case` для некоторых вспомогательных файлов.

---

## 4. Добавление новой фичи

### 4.1 Общий паттерн

1. Определить домен:
   - AI‑логика → `app/ai/`;
   - UI‑элементы → `app/ui/` / `app/components/`;
   - Web3 → `app/web3/` + при необходимости контракт в `contracts/`;
   - Edge → `app/computing/`;
   - Синхронизация → `app/sync/`;
   - Общие фичи → соответствующий доменный каталог.

2. Создать модуль/класс/хуки внутри домена:
   - следовать существующим паттернам (Singleton‑сервисы, EventEmitter, hooks).

3. Добавить точки интеграции:
   - UI вызывает методы сервиса;
   - сервис генерирует события;
   - AI/Web3/Edge реагируют на события или вызываются напрямую.

4. Добавить тесты (по возможности):
   - unit‑тесты в `test/`;
   - e2e‑сценарии в `detox/` (при необходимости).

5. Обновить документацию:
   - добавить ссылки в соответствующий README / портал, если фича крупная.

### 4.2 Пример: новая AI‑фича

1. Создать файл `app/ai/MyNewInsight.ts`.
2. Описать входные данные (типизированные), выход (метрики/рекомендации).
3. Интегрировать с `DigitalTwin`/`TeamAssistant`, зарегистрировав модуль в их пайплайнах.
4. Добавить визуализацию в UI (например, новый виджет в analytics‑экране).
5. При необходимости — добавить Web3‑связь (награды/NFT за улучшение метрик).

---

## 5. Git‑workflow и PR

- Ветки:
  - `feature/<описание>` — новые фичи;
  - `fix/<описание>` — фиксы;
  - `docs/<описание>` — документация;
  - `chore/<описание>` — инфраструктура/CI.
- Сообщения коммитов — желательно в стиле conventional commits.
- Перед PR:
  - `npm run lint`;
  - `npm run tsc`;
  - `npm test` (по возможности).

Подробнее о Git‑практиках — `docs/GIT_PLATFORM_GUIDE.md`.

---

## 6. Лицензирование и заголовки файлов

При создании новых файлов рекомендуется использовать заголовок вида:

```text
Copyright 2023-2025 Katya AI Systems LLC and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

Подробности — `LICENSE.txt`, `NOTICE.txt`, `LICENSE_METR.md`.

---

## 7. Дополнительные материалы

- Обзор архитектуры — `ARCHITECTURE_METR.md`.
- Whitepaper — `WHITEPAPER_METR.md`.
- CI/CD — `CI_CD_METR.md`.
- Портал документации — `METR_DOCUMENTATION_PORTAL.md`.

При существенных изменениях архитектуры или процессов разработки обновляйте этот документ и связанные гайды.
