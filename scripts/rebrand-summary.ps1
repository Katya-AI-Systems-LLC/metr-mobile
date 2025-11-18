# rebrand-summary.ps1 - METR Rebranding Summary Script
# Показывает статус ребрендинга

Write-Host "🎨 METR Rebranding Status" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ ЗАВЕРШЕНО:" -ForegroundColor Green
Write-Host "  - app.json: название 'METR'" -ForegroundColor White
Write-Host "  - package.json: название 'metr-mobile'" -ForegroundColor White
Write-Host "  - Android: applicationId 'com.metr.app'" -ForegroundColor White
Write-Host "  - Android: все строки и цвета обновлены" -ForegroundColor White
Write-Host "  - iOS: все Bundle IDs обновлены" -ForegroundColor White
Write-Host "  - iOS: все App Groups обновлены" -ForegroundColor White
Write-Host "  - URL схемы: metr:// и metrauth://" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  ТРЕБУЕТ РУЧНОЙ РАБОТЫ:" -ForegroundColor Yellow
Write-Host "  1. Переименование Java/Kotlin пакетов (66 файлов)" -ForegroundColor White
Write-Host "  2. Обновление Xcode проекта (Bundle IDs)" -ForegroundColor White
Write-Host "  3. Создание и замена иконок приложения" -ForegroundColor White
Write-Host "  4. Создание splash screens" -ForegroundColor White
Write-Host ""

Write-Host "📚 ДОКУМЕНТАЦИЯ:" -ForegroundColor Cyan
Write-Host "  - REBRANDING_GUIDE.md - Полное руководство" -ForegroundColor White
Write-Host "  - REBRANDING_CHECKLIST.md - Детальный чеклист" -ForegroundColor White
Write-Host "  - scripts/generate-icons.md - Спецификации иконок" -ForegroundColor White
Write-Host ""

Write-Host "🚀 СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Cyan
Write-Host "  1. Создайте иконки используя METRLogo компонент" -ForegroundColor White
Write-Host "  2. Откройте Xcode и обновите Bundle IDs" -ForegroundColor White
Write-Host "  3. Переименуйте Java пакеты в Android Studio" -ForegroundColor White
Write-Host "  4. Замените splash screens" -ForegroundColor White
Write-Host "  5. Пересоберите проект" -ForegroundColor White
Write-Host ""

Write-Host "📊 Прогресс: ~60% завершено" -ForegroundColor Yellow
Write-Host ""

