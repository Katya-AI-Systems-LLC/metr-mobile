# 🎨 METR Complete Rebranding

## ✅ **СТАТУС: Конфигурация завершена**

Все конфигурационные файлы обновлены для полного ребрендинга Mattermost Mobile → METR.

---

## 📋 **ЧТО УЖЕ СДЕЛАНО**

### ✅ Конфигурационные файлы (100%)
- `app.json` - название "METR"
- `package.json` - название "metr-mobile"
- Android `build.gradle` - applicationId `com.metr.app`
- Android `AndroidManifest.xml` - package `com.metr.app`
- Android `strings.xml` - все строки обновлены
- Android `colors.xml` - цвета METR
- Android `styles.xml` - тема METR
- iOS `Info.plist` (все 3 файла) - Bundle IDs
- iOS `entitlements` (все 3 файла) - App Groups
- URL схемы: `metr://` и `metrauth://`

---

## ⚠️ **ЧТО НУЖНО СДЕЛАТЬ**

### 1. Создать и заменить иконки
- Android: все размеры в `mipmap-*/`
- iOS: все размеры в `AppIcon.appiconset/`
- Используйте компонент `METRLogo` для генерации

### 2. Обновить Xcode проект
- Откройте `ios/Mattermost.xcworkspace`
- Обновите Bundle Identifiers через интерфейс

### 3. Переименовать Java пакеты (опционально)
- Требует изменения структуры папок
- ~66 файлов для обновления

### 4. Создать splash screens
- Android: `splash.png` для всех плотностей
- iOS: `LaunchScreen.storyboard`

---

## 📚 **ДОКУМЕНТАЦИЯ**

- **REBRANDING_GUIDE.md** - Полное руководство по ребрендингу
- **REBRANDING_CHECKLIST.md** - Детальный чеклист
- **scripts/generate-icons.md** - Спецификации иконок
- **REBRANDING_SUMMARY.md** - Краткая сводка

---

## 🚀 **БЫСТРЫЙ СТАРТ**

После замены иконок:

```bash
# Очистка
cd android && ./gradlew clean
cd ../ios && xcodebuild clean

# Сборка
npm run build:android-debug:win
```

---

**Конфигурация готова! Осталось создать иконки.** ✅

