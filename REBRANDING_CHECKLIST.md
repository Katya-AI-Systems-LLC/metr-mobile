# ✅ METR Rebranding Checklist

## 📋 Полный чеклист ребрендинга

### ✅ **КОНФИГУРАЦИОННЫЕ ФАЙЛЫ (ЗАВЕРШЕНО)**

#### Общие:
- [x] `app.json` - название "METR"
- [x] `package.json` - название пакета "metr-mobile"
- [x] Версия обновлена до 2.2.0

#### Android:
- [x] `android/app/build.gradle` - applicationId "com.metr.app"
- [x] `android/app/src/main/AndroidManifest.xml` - package "com.metr.app"
- [x] `android/app/src/main/res/values/strings.xml` - app_name "METR"
- [x] `android/app/src/main/res/values/colors.xml` - цвета METR
- [x] `android/app/src/main/res/values/styles.xml` - тема METR
- [x] `android/app/src/main/res/values-night/colors.xml` - темная тема
- [x] `android/app/BUCK` - package "com.metr.app"
- [x] URL схемы: `metr://` и `metrauth://`

#### iOS:
- [x] `ios/Mattermost/Info.plist` - Bundle ID "com.metr.app"
- [x] `ios/MattermostShare/Info.plist` - Bundle ID "com.metr.app.METRShare"
- [x] `ios/NotificationService/Info.plist` - Bundle ID "com.metr.app.NotificationService"
- [x] `ios/Mattermost/Mattermost.entitlements` - App Group "group.com.metr.app"
- [x] `ios/MattermostShare/MattermostShare.entitlements` - App Group
- [x] `ios/NotificationService/NotificationService.entitlements` - App Group
- [x] URL схемы: `metr://` и `metrauth://`

---

### ⚠️ **ТРЕБУЕТ РУЧНОГО ВМЕШАТЕЛЬСТВА**

#### 1. Переименование Java/Kotlin пакетов (Android)

**Критично**: Это требует изменения структуры папок и всех импортов.

**Текущая структура:**
```
android/app/src/main/java/com/mattermost/
├── rnbeta/
├── share/
├── helpers/
└── newarchitecture/
```

**Новая структура:**
```
android/app/src/main/java/com/metr/
├── app/
├── share/
├── helpers/
└── newarchitecture/
```

**Действия:**
1. Переименуйте папки в Android Studio
2. Обновите все `package` декларации (66 файлов)
3. Обновите все импорты
4. Пересоберите проект

**Файлы для обновления:**
- Все `.java` файлы в `com/mattermost/*`
- Все `.kt` файлы в `com/mattermost/*`
- Все импорты в коде

#### 2. Обновление Xcode проекта (iOS)

**Действия в Xcode:**
1. Откройте `ios/Mattermost.xcworkspace`
2. Выберите проект "Mattermost"
3. Для каждого target обновите:
   - **Product Bundle Identifier**
   - **App Groups**
   - **URL Schemes**
   - **Display Name**

**Targets:**
- Mattermost: `com.metr.app`
- MattermostShare: `com.metr.app.METRShare`
- NotificationService: `com.metr.app.NotificationService`

**Файл для обновления:**
- `ios/Mattermost.xcodeproj/project.pbxproj` (лучше через Xcode)

#### 3. Замена иконок приложения

**Android:**
- [ ] Создать иконки для всех плотностей
- [ ] Заменить `ic_launcher.png` и `ic_launcher_round.png`
- [ ] Создать адаптивные иконки (foreground/background)
- [ ] Обновить `ic_launcher.xml` и `ic_launcher_round.xml`

**iOS:**
- [ ] Создать иконки для всех размеров
- [ ] Заменить файлы в `AppIcon.appiconset/`
- [ ] Обновить через Asset Catalog в Xcode

**Дизайн:**
- Символ "M" в виде горной вершины
- Градиент: Purple → Teal → Pink
- Фон: Dark (#0F0F0F)

#### 4. Замена Splash Screen

**Android:**
- [ ] Обновить `splash.png` и `splash_background.png`
- [ ] Для всех плотностей (drawable-*)

**iOS:**
- [ ] Обновить `LaunchScreen.storyboard`
- [ ] Или создать LaunchImage в Asset Catalog

#### 5. Иконка уведомлений

**Android:**
- [ ] Создать `ic_notification.png` для всех плотностей
- [ ] Монохромная версия логотипа METR

**iOS:**
- [ ] Включена в AppIcon (автоматически)

---

## 🎨 **БРЕНДИНГ ЭЛЕМЕНТЫ**

### Цвета METR:
- ✅ Electric Purple: `#8B5CF6`
- ✅ Cyber Teal: `#14B8A6`
- ✅ Neon Pink: `#EC4899`
- ✅ Dark Background: `#0F0F0F`

### Названия:
- ✅ Приложение: "METR"
- ✅ Слоган: "Measure Your Team's Potential"
- ✅ Package ID: `com.metr.app`
- ✅ Bundle ID: `com.metr.app`

### URL Schemes:
- ✅ `metr://` - основной
- ✅ `metrauth://` - авторизация

---

## 📝 **ИНСТРУКЦИИ ПО СОЗДАНИЮ ИКОНОК**

### Быстрый способ:
1. Используйте компонент `METRLogo` для генерации
2. Экспортируйте в PNG/SVG
3. Используйте онлайн генераторы для всех размеров

### Онлайн генераторы:
- Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/
- App Icon Generator: https://appicon.co/

### Ручной способ:
1. Создайте дизайн 1024x1024px
2. Экспортируйте для каждого размера
3. Разместите в соответствующих папках

---

## 🔄 **ПОСЛЕ РЕБРЕНДИНГА**

### Очистка:
```bash
# Android
cd android
./gradlew clean

# iOS
cd ios
xcodebuild clean
```

### Пересборка:
```bash
# Android Debug
npm run build:android-debug:win

# iOS
npm run build:ios
```

### Проверка:
- [ ] Название приложения: "METR"
- [ ] Иконка показывает новый логотип
- [ ] Цвета соответствуют палитре METR
- [ ] URL схемы работают
- [ ] Splash screen обновлен

---

## 📚 **ДОКУМЕНТАЦИЯ**

- `REBRANDING_GUIDE.md` - Подробное руководство
- `scripts/generate-icons.md` - Спецификации иконок
- `ANDROID_BUILD_GUIDE.md` - Инструкции по сборке

---

## ⚠️ **ВАЖНЫЕ ЗАМЕЧАНИЯ**

1. **Переименование пакетов** требует изменения структуры папок - делайте это аккуратно
2. **Bundle IDs** в Xcode лучше обновлять через интерфейс, а не вручную
3. **Иконки** должны быть созданы для всех требуемых размеров
4. **Тестирование** на реальных устройствах обязательно
5. **Миграция данных** - пользователям нужно будет переустановить приложение

---

**Статус: Конфигурация завершена, требуется замена иконок и обновление пакетов** ✅

