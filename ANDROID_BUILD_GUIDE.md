# 📱 Android Debug Build Guide

## 🚀 Быстрая сборка Debug APK

### Windows (PowerShell):
```powershell
npm run build:android-debug:win
```

### Linux/Mac:
```bash
npm run build:android-debug:unix
```

### Или напрямую через Gradle:
```bash
cd android
./gradlew assembleDebug
```

---

## 📋 Требования

### 1. Java Development Kit (JDK)
- **Требуется**: JDK 17 или выше
- **Проверка**: `java -version`
- **Установка**: 
  - Windows: [Download JDK 17](https://adoptium.net/)
  - Mac: `brew install openjdk@17`
  - Linux: `sudo apt install openjdk-17-jdk`

### 2. Android SDK
- **Требуется**: Android SDK с API Level 31+
- **Проверка**: Проверьте наличие `$ANDROID_HOME` или `$ANDROID_SDK_ROOT`
- **Установка**: Через Android Studio или командную строку

### 3. Environment Variables

#### Windows (PowerShell):
```powershell
# Установите JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Установите ANDROID_HOME
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Добавьте в PATH
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### Linux/Mac:
```bash
# Добавьте в ~/.bashrc или ~/.zshrc
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

---

## 🔨 Пошаговая сборка

### Шаг 1: Проверка окружения
```bash
# Проверьте Java
java -version

# Проверьте Android SDK
echo $ANDROID_HOME  # Linux/Mac
echo $env:ANDROID_HOME  # Windows PowerShell
```

### Шаг 2: Установка зависимостей
```bash
npm install
```

### Шаг 3: Очистка предыдущих сборок (опционально)
```bash
cd android
./gradlew clean
cd ..
```

### Шаг 4: Сборка Debug APK
```bash
# Через npm скрипт
npm run build:android-debug:win  # Windows
npm run build:android-debug:unix  # Linux/Mac

# Или напрямую
cd android
./gradlew assembleDebug
```

### Шаг 5: Найти APK
После успешной сборки APK будет находиться в:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Также копия будет создана в корне проекта:
```
metr-debug.apk
```

---

## 🐛 Решение проблем

### Ошибка: JAVA_HOME is not set
**Решение**: Установите JDK 17 и настройте переменную окружения JAVA_HOME

### Ошибка: ANDROID_HOME is not set
**Решение**: Установите Android SDK и настройте переменную окружения ANDROID_HOME

### Ошибка: Gradle build failed
**Решение**: 
1. Очистите кеш: `cd android && ./gradlew clean`
2. Удалите `.gradle` папку: `rm -rf android/.gradle`
3. Пересоберите: `./gradlew assembleDebug`

### Ошибка: Metro bundler not running
**Решение**: Запустите Metro bundler в отдельном терминале:
```bash
npm start
```

### Ошибка: NDK not found
**Решение**: Установите NDK через Android Studio SDK Manager или добавьте в `android/local.properties`:
```
ndk.dir=/path/to/ndk
```

---

## 📦 Установка APK на устройство

### Через ADB:
```bash
adb install metr-debug.apk
```

### Через USB:
1. Включите "Отладка по USB" на устройстве
2. Подключите устройство к компьютеру
3. Запустите: `adb devices` (должно показать ваше устройство)
4. Установите: `adb install metr-debug.apk`

### Через файловый менеджер:
1. Скопируйте `metr-debug.apk` на устройство
2. Откройте файл на устройстве
3. Разрешите установку из неизвестных источников
4. Установите APK

---

## 🔍 Проверка сборки

### Проверить размер APK:
```bash
ls -lh metr-debug.apk  # Linux/Mac
Get-Item metr-debug.apk | Select-Object Length  # Windows
```

### Проверить подпись APK:
```bash
jarsigner -verify -verbose -certs metr-debug.apk
```

### Установить и запустить:
```bash
adb install -r metr-debug.apk
adb shell am start -n com.mattermost.rnbeta/.MainActivity
```

---

## 📝 Дополнительные команды

### Сборка с очисткой:
```bash
cd android
./gradlew clean assembleDebug
```

### Сборка для конкретного варианта:
```bash
cd android
./gradlew assembleDebug --variant=debug
```

### Просмотр всех вариантов сборки:
```bash
cd android
./gradlew tasks --all | grep assemble
```

### Установка на подключенное устройство:
```bash
cd android
./gradlew installDebug
```

---

## 🎯 Следующие шаги

После успешной сборки debug APK:

1. ✅ Установите APK на устройство
2. ✅ Протестируйте все функции METR
3. ✅ Проверьте работу AI модулей
4. ✅ Проверьте Web3 интеграцию
5. ✅ Протестируйте AR/VR функции
6. ✅ Проверьте платформо-специфичные функции

---

**Успешной сборки! 🚀**

