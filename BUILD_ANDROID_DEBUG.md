# 📱 Сборка Android Debug APK для METR

## ⚠️ Требования

Перед сборкой необходимо установить:

### 1. Java Development Kit (JDK)
- **Требуется**: JDK 17 или выше
- **Скачать**: https://adoptium.net/
- **Установить** и добавить в PATH

### 2. Android SDK
- **Требуется**: Android SDK с API Level 31+
- **Установить через**: Android Studio или командную строку
- **Расположение**: `C:\Users\<USER>\AppData\Local\Android\Sdk`

### 3. Установка переменных окружения

Откройте PowerShell и выполните:

```powershell
# Установите JAVA_HOME (замените путь на ваш)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Установите ANDROID_HOME
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Добавьте в PATH
$env:PATH += ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"

# Проверьте установку
java -version
adb version
```

---

## 🚀 Сборка Debug APK

### Вариант 1: Через npm скрипт (рекомендуется)

```powershell
npm run build:android-debug:win
```

### Вариант 2: Напрямую через Gradle

```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Вариант 3: Через PowerShell скрипт

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-android-debug.ps1
```

---

## 📦 Результат сборки

После успешной сборки APK будет находиться в:
- `android\app\build\outputs\apk\debug\app-debug.apk`
- Также копируется в корень проекта как `metr-debug.apk`

---

## 🔧 Устранение проблем

### Ошибка: JAVA_HOME is not set
**Решение**: Установите переменную окружения JAVA_HOME:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Ошибка: ANDROID_HOME is not set
**Решение**: Установите переменную окружения ANDROID_HOME:
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Ошибка: Gradle wrapper not found
**Решение**: Убедитесь, что вы находитесь в корне проекта и папка `android` существует.

### Ошибка: Build failed
**Решение**: 
1. Проверьте, что все зависимости установлены: `npm install`
2. Очистите кеш: `cd android && .\gradlew.bat clean`
3. Попробуйте собрать снова

---

## 📝 Примечания

- Первая сборка может занять 5-10 минут
- Убедитесь, что у вас достаточно свободного места на диске (минимум 2GB)
- Для установки APK на устройство используйте: `adb install app-debug.apk`

