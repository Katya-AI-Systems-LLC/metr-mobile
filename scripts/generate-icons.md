# 🎨 Генерация иконок METR

## 📐 Спецификации иконок

### Android

#### Адаптивная иконка (Android 8.0+):
- **Foreground**: 108x108dp (символ "M")
- **Background**: 108x108dp (градиентный фон)
- **Safe zone**: 72x72dp (внутренняя область)

#### Размеры для разных плотностей:
| Плотность | Размер (px) | Множитель |
|-----------|-------------|-----------|
| mdpi      | 48x48       | 1x        |
| hdpi      | 72x72       | 1.5x      |
| xhdpi     | 96x96       | 2x        |
| xxhdpi    | 144x144     | 3x        |
| xxxhdpi   | 192x192     | 4x        |

### iOS

#### Размеры для App Icon:
| Устройство | Размер (pt) | Размер (@2x) | Размер (@3x) |
|------------|-------------|--------------|--------------|
| iPhone     | 60x60       | 120x120      | 180x180      |
| iPad       | 76x76       | 152x152      | -            |
| App Store  | -           | -            | 1024x1024    |

---

## 🎨 Дизайн иконки METR

### Концепция:
- **Символ**: Буква "M" в виде горной вершины
- **Цвета**: Градиент Electric Purple → Cyber Teal → Neon Pink
- **Фон**: Темный (#0F0F0F) или прозрачный
- **Стиль**: Минималистичный, геометрический

### SVG шаблон:
```svg
<svg width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="metr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" fill="#0F0F0F" rx="200"/>
  
  <!-- Mountain M Symbol -->
  <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" 
        fill="url(#metr-gradient)" 
        stroke="none"/>
</svg>
```

---

## 🛠️ Инструменты для генерации

### 1. Используйте компонент METRLogo:
```typescript
import {METRLogo} from './app/components/branding/METRLogo';

// Экспортируйте как PNG/SVG
<METRLogo size={1024} variant="icon" color="primary" />
```

### 2. Онлайн генераторы:
- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- **App Icon Generator**: https://appicon.co/
- **Icon Kitchen**: https://icon.kitchen/

### 3. Figma/Sketch шаблоны:
Создайте шаблон с градиентом METR и экспортируйте для всех размеров.

---

## 📦 Структура файлов

### Android:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   ├── ic_launcher_background.png
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/
│   └── (те же файлы)
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
├── mipmap-xxxhdpi/
└── mipmap-anydpi-v26/
    ├── ic_launcher.xml
    └── ic_launcher_round.xml
```

### iOS:
```
ios/Mattermost/Images.xcassets/
└── AppIcon.appiconset/
    ├── Contents.json
    ├── Icon-App-20x20@2x.png
    ├── Icon-App-20x20@3x.png
    ├── Icon-App-29x29@2x.png
    ├── Icon-App-29x29@3x.png
    ├── Icon-App-40x40@2x.png
    ├── Icon-App-40x40@3x.png
    ├── Icon-App-60x60@2x.png
    ├── Icon-App-60x60@3x.png
    ├── Icon-App-76x76@1x.png
    ├── Icon-App-76x76@2x.png
    └── Icon-App-1024x1024@1x.png
```

---

## ✅ Чеклист генерации

- [ ] Создан исходный дизайн 1024x1024px
- [ ] Экспортированы все размеры для Android
- [ ] Экспортированы все размеры для iOS
- [ ] Созданы адаптивные иконки для Android
- [ ] Проверены иконки на реальных устройствах
- [ ] Обновлены splash screens
- [ ] Создана иконка уведомлений

