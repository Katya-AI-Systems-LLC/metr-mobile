# Changelog Guide для METR

## Format

Changelog следует формату [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [Version] - YYYY-MM-DD

### Added
- Новые функции

### Changed
- Изменения в существующих функциях

### Deprecated
- Функции, которые будут удалены

### Removed
- Удаленные функции

### Fixed
- Исправления багов

### Security
- Исправления безопасности
```

## Categories

### Added
Новые функции, которые были добавлены.

### Changed
Изменения в существующих функциях.

### Deprecated
Функции, которые будут удалены в будущих версиях.

### Removed
Функции, которые были удалены.

### Fixed
Исправления багов.

### Security
Исправления уязвимостей безопасности.

## Examples

### Good Example
```markdown
## [2.2.0] - 2025-01-15

### Added
- AI Assistant integration
- Web3 wallet support
- AR/VR virtual offices

### Changed
- Updated UI/UX design
- Improved performance

### Fixed
- Fixed crash on Android 13
- Fixed memory leak in chat
```

### Bad Example
```markdown
## [2.2.0] - 2025-01-15
- Fixed stuff
- Added things
```

## Best Practices

1. **Be Specific**: Опишите что именно изменилось
2. **User-Focused**: Пишите с точки зрения пользователя
3. **Link Issues**: Ссылайтесь на issues/PRs
4. **Group Changes**: Группируйте связанные изменения
5. **Be Honest**: Не скрывайте breaking changes

## Automation

Changelog может генерироваться автоматически из:
- Git commits
- GitHub releases
- Pull requests

## Release Notes

Release notes отличаются от changelog:
- Более подробные
- Включают screenshots
- Фокусируются на пользовательском опыте


