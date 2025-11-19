# Gitea vs Forgejo Comparison

## Overview

Сравнение Gitea и Forgejo для выбора платформы для METR.

## Key Differences

### Governance

| Aspect | Gitea | Forgejo |
|--------|-------|---------|
| Governance | Company-led | Community-driven |
| Decision Making | Centralized | Decentralized |
| License | MIT | MIT |

### Features

| Feature | Gitea | Forgejo |
|---------|-------|---------|
| Actions | ✅ | ✅ |
| Packages | ✅ | ✅ |
| Pages | ✅ | ✅ |
| CI/CD | ✅ | ✅ |
| API | ✅ | ✅ |

### Compatibility

- **API**: Полностью совместимы
- **Data Migration**: Простая миграция
- **Configurations**: Используют те же конфиги

## Recommendations

### Choose Gitea If
- Нужна стабильность
- Предпочитаете company-backed проект
- Нужна коммерческая поддержка

### Choose Forgejo If
- Предпочитаете community-driven проект
- Нужна независимость
- Хотите больше контроля

## METR Support

METR поддерживает обе платформы:
- Используйте `.gitea/` конфигурации для обеих
- Workflows совместимы
- Templates работают на обеих

## Migration

Миграция между платформами проста:
1. Export данные из Gitea
2. Import в Forgejo (или наоборот)
3. Обновите remote URL
4. Готово!

## Resources

- [Gitea Documentation](https://docs.gitea.io/)
- [Forgejo Documentation](https://forgejo.org/docs/)


