# 🚀 Quick Build Guide для METR

## Быстрая сборка Android Debug APK

### Шаг 1: Настройка окружения

Запустите скрипт настройки окружения:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-build-env.ps1
```

Этот скрипт автоматически найдет и настроит:
- ✅ Java JDK
- ✅ Android SDK
- ✅ Node.js

### Шаг 2: Установка зависимостей

Если еще не установлены зависимости:

```powershell
npm install
```

### Шаг 3: Сборка

#### Вариант 1: Через npm скрипт (рекомендуется)

```powershell
npm run build:android-debug:win
```

#### Вариант 2: Напрямую через Gradle

```powershell
cd android
.\gradlew.bat assembleDebug
cd ..
```

#### Вариант 3: Через PowerShell скрипт

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-android-debug.ps1
```

---

## 📦 Результат

После успешной сборки APK будет находиться в:
- `android\app\build\outputs\apk\debug\app-debug.apk`
- Также копируется в корень проекта как `metr-debug.apk`

---

## ⚠️ Требования

### Обязательные:
- ✅ **Java JDK 17+** - https://adoptium.net/
- ✅ **Android SDK** - через Android Studio
- ✅ **Node.js 18+** - https://nodejs.org/

### Переменные окружения:

Если автоматическая настройка не сработала, установите вручную:

```powershell
# Java
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"
```

---

## 🔧 Устранение проблем

### Ошибка: JAVA_HOME is not set
**Решение**: Запустите `setup-build-env.ps1` или установите JAVA_HOME вручную

### Ошибка: ANDROID_HOME is not set
**Решение**: Установите Android Studio или установите ANDROID_HOME вручную

### Ошибка: Build failed
**Решение**: 
1. Очистите проект: `cd android && .\gradlew.bat clean && cd ..`
2. Удалите `node_modules` и переустановите: `rm -r node_modules && npm install`
3. Проверьте версию Java: `java -version` (должна быть 17+)

---

## 📝 Примечания

- Первая сборка может занять 5-10 минут
- Убедитесь, что у вас достаточно свободного места (минимум 2GB)
- Для установки APK на устройство: `adb install metr-debug.apk`

