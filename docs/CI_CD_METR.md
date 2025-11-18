# CI/CD для METR (codemagic.yaml и не только)

Этот документ описывает, как устроен CI/CD для METR на базе **Codemagic**, и как он сочетается с существующими сборочными/документными файлами.

## 1. Основные цели CI/CD

- Автоматическая проверка кода (lint, TypeScript, тесты) при каждом push/PR.
- Сборка debug‑сборок для iOS и Android для разработчиков и QA.
- Сборка и публикация release‑артефактов:
  - Android `.aab` / `.apk` → Google Play.
  - iOS `.ipa` → App Store Connect / TestFlight.
- Максимально повторно использовать уже существующие скрипты и конфиги проекта.

---

## 2. Файл codemagic.yaml

В корне репозитория находится файл `codemagic.yaml`, содержащий **три ключевых workflow**:

1. `metr-dev-ci` — Dev CI (Android & iOS, debug):
   - триггеры: `push` и `pull_request` в ветки `develop`, `main`;
   - шаги:
     - `npm install`;
     - `npm run lint` + `npm run tsc`;
     - `npm test`;
     - сборка Android debug APK (`./gradlew assembleDebug`);
     - `pod install` и сборка iOS debug IPA (`xcode-project build-ipa --skip_codesign`).

2. `metr-android-release` — Android Release:
   - триггер: **теги** вида `v*` (например, `v1.0.0`);
   - сборка `.aab` через `./gradlew bundleRelease`;
   - публикация в Google Play (internal track) через блок `publishing.google_play`.

3. `metr-ios-release` — iOS Release:
   - триггер: **теги** вида `ios-*` (например, `ios-1.0.0`);
   - `npm install`, `pod install`;
   - `xcode-project use-profiles` и `xcode-project build-ipa` для сборки подписанного `.ipa`;
   - публикация в TestFlight через `publishing.app_store_connect`.

Сами детали скриптов см. в файле `codemagic.yaml`.

---

## 3. Связь с существующими гидами

- `ANDROID_BUILD_GUIDE.md` и `QUICK_BUILD.md` описывают локальную и быструю сборку, их логика использована при составлении шагов в `codemagic.yaml` (gradle-команды, setup `local.properties`).
- `INSTALLATION_GUIDE.md` помогает подготовить окружение локально, что полезно при отладке CI‑падений.
- `docs/GIT_PLATFORM_GUIDE.md` даёт общие рекомендации по Git‑workflow и может использоваться в связке с Codemagic (например, триггеры по веткам и тегам).

---

## 4. Настройка Codemagic

### 4.1 Добавление репозитория

1. Залогиниться на [codemagic.io](https://codemagic.io/).
2. Подключить репозиторий METR (GitHub/GitLab/Gitea/отечественная платформа через HTTPS/SSH).
3. Убедиться, что в корне есть `codemagic.yaml`.

### 4.2 Переменные окружения и группы

В Codemagic UI необходимо создать следующие группы/переменные:

- **android-signing**:
  - `CM_KEYSTORE` — keystore (encrypted);
  - `CM_KEYSTORE_PASSWORD`;
  - `CM_KEY_ALIAS`;
  - `CM_KEY_PASSWORD`.

- **google-play**:
  - `GOOGLE_PLAY_CONFIG` — JSON service account файл для Google Play (encrypted).

- **ios-signing**:
  - сертификаты и provisioning profiles (загружаются через интерфейс Codemagic);
  - привязка к группе `ios-signing`.

- **app-store-connect**:
  - `APP_STORE_CONNECT_API_KEY`;
  - `APP_STORE_CONNECT_KEY_ID`;
  - `APP_STORE_CONNECT_ISSUER_ID`.

Также в `vars` нужно заполнить реальные значения:

- `XCODE_WORKSPACE` — имя `.xcworkspace` в `ios/` (например, `Mattermost.xcworkspace`);
- `XCODE_SCHEME` — схема приложения;
- `ANDROID_PACKAGE_NAME` — `applicationId` из `android/app/build.gradle`;
- `BUNDLE_ID` — `CFBundleIdentifier` из iOS.

---

## 5. Потоки CI/CD

### 5.1 Dev CI (metr-dev-ci)

Используется для:

- автоматического прогона lint/tsc/test на каждом PR;
- сборки debug APK/IPA для QA;
- раннего обнаружения проблем с зависимостями и конфигами.

Рекомендуется включить обязательное прохождение этого workflow для merge в `develop` и `main`.

### 5.2 Release Android (metr-android-release)

Используется для:

- создания релизных `.aab` и `.apk` при создании тега `vX.Y.Z`;
- автоматической публикации на track `internal` Google Play.

Можно адаптировать:

- track → `alpha`/`beta`/`production`;
- добавить `in_app_update_priority` и `rollout_fraction` при необходимости.

### 5.3 Release iOS (metr-ios-release)

Используется для:

- сборки подписанного `.ipa`;
- публикации в TestFlight.

Можно расширить:

- автоматическую отправку в App Store (изменив `submit_to_app_store` на true);
- интеграцию со Slack или другими мессенджерами через webhooks.

---

## 6. CI/CD в контексте других платформ

Хотя `codemagic.yaml` ориентирован на Codemagic, общие концепции применимы и к другим системам CI/CD (GitLab CI, GitHub Actions, локальные раннеры):

- шаги установки зависимостей, линтинга и тестов аналогичны;
- сборка Android/iOS может использовать те же gradle/xcode команды;
- деплой в стора аналогично настраивается через соответствующие action/runner.

Подробнее о сценариях для разных Git‑платформ см. в `docs/GIT_PLATFORM_GUIDE.md`.

---

## 7. Рекомендации по дальнейшему расширению

- Добавить интеграцию с **Detox** (e2e‑тесты) в отдельный workflow (например, `metr-e2e`).
- Использовать build‑matrix для разных конфигураций (debug/release, фичефлаги).
- Включить статический анализ (ESLint/TypeScript уже есть, можно добавить дополнительные проверки).

Этот документ и `codemagic.yaml` вместе образуют ядро CI/CD‑стека METR; при изменении пайплайнов обязательно обновляйте оба файла и, при необходимости, `docs/GIT_PLATFORM_GUIDE.md`.
