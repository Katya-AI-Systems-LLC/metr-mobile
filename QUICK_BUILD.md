# ⚡ Быстрая сборка Android Debug APK

## 🚀 Команда для сборки

### Windows:
```powershell
npm run build:android-debug:win
```

### Linux/Mac:
```bash
npm run build:android-debug:unix
```

### Или напрямую:
```bash
cd android
./gradlew assembleDebug
```

---

## ⚙️ Перед сборкой

### 1. Установите JDK 17
- Скачайте: https://adoptium.net/
- Установите и настройте `JAVA_HOME`

### 2. Установите Android SDK
- Через Android Studio или командную строку
- Настройте `ANDROID_HOME`

### 3. Настройте переменные окружения

**Windows PowerShell:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

**Linux/Mac:**
```bash
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=$HOME/Android/Sdk
```

---

## 📦 Где найти APK

После сборки APK будет здесь:
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `metr-debug.apk` (копия в корне проекта)

---

## 📱 Установка на устройство

```bash
adb install metr-debug.apk
```

---

**Подробная инструкция**: `ANDROID_BUILD_GUIDE.md`

