# 🎨 METR Complete Rebranding Guide

## 📋 Полный ребрендинг для всех платформ

Это руководство описывает все изменения, необходимые для полного ребрендинга Mattermost Mobile в METR.

---

## ✅ **ЧТО УЖЕ СДЕЛАНО**

### Конфигурационные файлы:
- ✅ `app.json` - название приложения
- ✅ `package.json` - название пакета и описание
- ✅ `android/app/build.gradle` - applicationId и версия
- ✅ `android/app/src/main/AndroidManifest.xml` - package и URL схемы
- ✅ `android/app/src/main/res/values/strings.xml` - название приложения
- ✅ `android/app/src/main/res/values/colors.xml` - цвета METR
- ✅ `android/app/src/main/res/values/styles.xml` - тема METR
- ✅ `ios/Mattermost/Info.plist` - Bundle ID и название
- ✅ `ios/MattermostShare/Info.plist` - Bundle ID
- ✅ `ios/NotificationService/Info.plist` - Bundle ID

---

## 🔧 **ЧТО НУЖНО СДЕЛАТЬ ВРУЧНУЮ**

### 1. **Переименование Java/Kotlin пакетов (Android)**

**ВНИМАНИЕ**: Это требует изменения структуры папок и всех импортов.

#### Текущая структура:
```
android/app/src/main/java/com/mattermost/rnbeta/
android/app/src/main/java/com/mattermost/share/
android/app/src/main/java/com/mattermost/helpers/
```

#### Новая структура:
```
android/app/src/main/java/com/metr/app/
android/app/src/main/java/com/metr/share/
android/app/src/main/java/com/metr/helpers/
```

#### Шаги:
1. Переименуйте папки в Android Studio или через файловый менеджер
2. Обновите все `package` декларации в Java/Kotlin файлах
3. Обновите все импорты в коде
4. Обновите `android/app/BUCK` файл

#### Файлы для обновления (66 файлов):
- Все файлы в `com/mattermost/rnbeta/` → `com/metr/app/`
- Все файлы в `com/mattermost/share/` → `com/metr/share/`
- Все файлы в `com/mattermost/helpers/` → `com/metr/helpers/`
- Все файлы в `com/mattermost/newarchitecture/` → `com/metr/newarchitecture/`

### 2. **Обновление iOS Bundle Identifiers**

#### Файлы для обновления:
- `ios/Mattermost.xcodeproj/project.pbxproj` - Bundle Identifiers
- `ios/Mattermost/Mattermost.entitlements` - App Groups
- `ios/MattermostShare/MattermostShare.entitlements` - App Groups
- `ios/NotificationService/NotificationService.entitlements` - App Groups

#### Изменения в Xcode:
1. Откройте `ios/Mattermost.xcworkspace` в Xcode
2. Выберите проект "Mattermost" в навигаторе
3. Выберите каждый target:
   - **Mattermost**: `com.metr.app`
   - **MattermostShare**: `com.metr.app.METRShare`
   - **NotificationService**: `com.metr.app.NotificationService`
4. Обновите App Groups:
   - `group.com.metr.app`
5. Обновите URL Schemes:
   - `metr`
   - `metrauth`

### 3. **Замена иконок приложения**

#### Android иконки:

**Расположение**: `android/app/src/main/res/mipmap-*/`

**Размеры иконок:**
- `ic_launcher.png` и `ic_launcher_round.png` для всех плотностей:
  - `mipmap-mdpi`: 48x48px
  - `mipmap-hdpi`: 72x72px
  - `mipmap-xhdpi`: 96x96px
  - `mipmap-xxhdpi`: 144x144px
  - `mipmap-xxxhdpi`: 192x192px

**Дизайн иконки METR:**
- Символ "M" в виде горной вершины
- Градиент: Electric Purple (#8B5CF6) → Cyber Teal (#14B8A6) → Neon Pink (#EC4899)
- Фон: Dark (#0F0F0F) или прозрачный
- Форма: Квадратная с закругленными углами (для Android)
- Адаптивная иконка: Используйте `ic_launcher_foreground.png` и `ic_launcher_background.png`

**Файлы для замены:**
```
android/app/src/main/res/mipmap-*/ic_launcher.png
android/app/src/main/res/mipmap-*/ic_launcher_round.png
android/app/src/main/res/mipmap-*/ic_launcher_background.png
android/app/src/main/res/mipmap-*/ic_launcher_foreground.png
android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
```

#### iOS иконки:

**Расположение**: `ios/Mattermost/Images.xcassets/AppIcon.appiconset/`

**Размеры иконок iOS:**
- iPhone: 60x60pt (@2x = 120x120px, @3x = 180x180px)
- iPad: 76x76pt (@2x = 152x152px)
- App Store: 1024x1024px
- Spotlight: 80x80pt (@2x = 160x160px, @3x = 240x240px)
- Settings: 58x58pt (@2x = 116x116px, @3x = 174x174px)
- Notification: 40x40pt (@2x = 80x80px, @3x = 120x120px)

**Дизайн:**
- Используйте тот же дизайн что и для Android
- iOS требует квадратную иконку без закруглений (система добавит их сама)

**Файлы для замены:**
- Все файлы в `ios/Mattermost/Images.xcassets/AppIcon.appiconset/`
- Или используйте Asset Catalog в Xcode

### 4. **Splash Screen (Экран загрузки)**

#### Android:
**Файлы**: `android/app/src/main/res/drawable-*/splash.png` и `splash_background.png`

**Дизайн:**
- Фон: #0F0F0F (METR Dark Background)
- Логотип METR по центру
- Градиентный акцент (Electric Purple → Cyber Teal)

#### iOS:
**Файл**: `ios/Mattermost/LaunchScreen.storyboard` или `ios/Mattermost/Images.xcassets/LaunchImage.imageset/`

**Дизайн:**
- Тот же что и для Android

### 5. **Уведомления иконка**

#### Android:
**Файл**: `android/app/src/main/res/mipmap-*/ic_notification.png`

**Размеры**: 24x24dp для всех плотностей

**Дизайн:**
- Упрощенная версия логотипа METR
- Монохромная версия для уведомлений

---

## 🎨 **ЦВЕТОВАЯ ПАЛИТРА METR**

### Основные цвета:
- **Electric Purple**: `#8B5CF6` (Primary)
- **Cyber Teal**: `#14B8A6` (Secondary)
- **Neon Pink**: `#EC4899` (Accent)

### Темная тема:
- **Background**: `#0F0F0F`
- **Surface**: `#1A1A1A`
- **Text**: `#FFFFFF`
- **Text Secondary**: `#A3A3A3`

### Светлая тема:
- **Background**: `#FFFFFF`
- **Surface**: `#F9FAFB`
- **Text**: `#111827`
- **Text Secondary**: `#6B7280`

---

## 📱 **URL SCHEMES И DEEP LINKS**

### Обновлено:
- ✅ Android: `metr://` и `metrauth://`
- ✅ iOS: `metr://` и `metrauth://`

### Использование:
```typescript
// Открыть METR
metr://channel/team-id/channel-id

// Авторизация
metrauth://token=xxx
```

---

## 🔄 **МИГРАЦИЯ ДАННЫХ**

### Android:
При изменении `applicationId` с `com.mattermost.rnbeta` на `com.metr.app`:
- Старые данные останутся в старом пакете
- Новое приложение будет иметь новый пакет
- Пользователям нужно будет:
  1. Экспортировать данные из старого приложения
  2. Установить новое приложение
  3. Импортировать данные

### iOS:
При изменении Bundle ID:
- Аналогично Android
- iCloud данные также будут в новом контейнере

---

## 📝 **ЧЕКЛИСТ РЕБРЕНДИНГА**

### Android:
- [x] Обновлен `applicationId` в `build.gradle`
- [x] Обновлен `package` в `AndroidManifest.xml`
- [x] Обновлены строки в `strings.xml`
- [x] Обновлены цвета в `colors.xml`
- [x] Обновлены стили в `styles.xml`
- [x] Обновлены URL схемы
- [ ] Переименованы Java/Kotlin пакеты
- [ ] Заменены иконки приложения
- [ ] Заменен splash screen
- [ ] Заменена иконка уведомлений
- [ ] Обновлен `BUCK` файл

### iOS:
- [x] Обновлен `CFBundleIdentifier` в `Info.plist`
- [x] Обновлен `CFBundleDisplayName`
- [x] Обновлены URL схемы
- [x] Обновлены App Groups
- [ ] Обновлены Bundle IDs в Xcode проекте
- [ ] Заменены иконки приложения
- [ ] Заменен Launch Screen
- [ ] Обновлены entitlements файлы

### Общее:
- [x] Обновлен `app.json`
- [x] Обновлен `package.json`
- [ ] Обновлена документация
- [ ] Обновлены скриншоты
- [ ] Обновлены маркетинговые материалы

---

## 🛠️ **ИНСТРУМЕНТЫ ДЛЯ СОЗДАНИЯ ИКОНОК**

### Онлайн генераторы:
1. **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
2. **App Icon Generator**: https://appicon.co/
3. **Icon Kitchen**: https://icon.kitchen/

### Рекомендации:
1. Создайте иконку 1024x1024px с прозрачным фоном
2. Используйте градиент METR (Purple → Teal → Pink)
3. Символ "M" должен быть четко виден
4. Экспортируйте для всех требуемых размеров
5. Проверьте иконку на реальных устройствах

---

## 🎯 **БЫСТРЫЙ СТАРТ**

### После обновления конфигурации:

1. **Очистите проект:**
```bash
cd android
./gradlew clean
cd ../ios
xcodebuild clean
```

2. **Пересоберите:**
```bash
# Android
npm run build:android-debug

# iOS
npm run build:ios
```

3. **Проверьте:**
- Название приложения отображается как "METR"
- Иконка приложения показывает новый логотип
- Цвета соответствуют палитре METR
- URL схемы работают (`metr://`)

---

## 📞 **ПОДДЕРЖКА**

Если возникнут проблемы:
1. Проверьте все конфигурационные файлы
2. Убедитесь что все пакеты переименованы
3. Очистите кеш и пересоберите проект
4. Проверьте логи сборки на ошибки

---

**Успешного ребрендинга! 🚀**

