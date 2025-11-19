# API Versioning Guide для METR

## Versioning Strategy

METR использует [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: Новые функции (backward compatible)
- **PATCH**: Исправления багов (backward compatible)

## API Version Format

```
/v{version}/endpoint
```

Примеры:
- `/v1/users`
- `/v2/teams`
- `/v3/ai/assistant`

## Version Lifecycle

### Active Versions
- **v1**: Current stable
- **v2**: Latest version

### Deprecated Versions
- **v0**: Deprecated, будет удалена через 6 месяцев

### End of Life
- **v0**: EOL после 6 месяцев deprecation

## Breaking Changes

### What Constitutes Breaking Change?
- Удаление endpoints
- Изменение request/response format
- Изменение authentication
- Изменение required fields

### Process
1. Объявить deprecation
2. Поддержать старую версию 6 месяцев
3. Удалить после EOL

## Migration Guide

### From v1 to v2
```typescript
// v1
const response = await fetch('/v1/users');

// v2
const response = await fetch('/v2/users');
```

## Version Headers

API версия может указываться через:
- URL path: `/v2/endpoint`
- Header: `API-Version: 2`
- Query param: `?version=2`

## Best Practices

1. **Maintain Compatibility**: Старайтесь не ломать API
2. **Document Changes**: Документируйте все изменения
3. **Provide Migration**: Дайте время на миграцию
4. **Version Early**: Версионируйте с самого начала

## Deprecation Policy

1. **Announcement**: Объявление за 6 месяцев
2. **Support**: Поддержка в течение 6 месяцев
3. **Removal**: Удаление после EOL

## Examples

### Adding New Endpoint
```typescript
// v1 - не существует
// v2 - новый endpoint
GET /v2/ai/assistant
```

### Changing Response Format
```typescript
// v1
{
  "user": {...}
}

// v2 - breaking change
{
  "data": {
    "user": {...}
  }
}
```


