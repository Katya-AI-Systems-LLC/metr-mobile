# Расширенное руководство по российским Git платформам

## 🇷🇺 Отечественные Git платформы

### 1. Gitea

**Статус**: ✅ Полная поддержка

Gitea - легковесная Git платформа, очень популярная в России.

#### Особенности
- Легковесная и быстрая
- Self-hosted решение
- Совместима с GitHub API
- Поддержка Actions

#### Файлы поддержки
- `.gitea/workflows/ci.yml`
- `.gitea/issue_templates/`
- `docs/GITEA_SETUP.md`

### 2. Forgejo

**Статус**: ✅ Полная поддержка

Forgejo - форк Gitea, созданный для независимости.

#### Особенности
- Community-driven
- Совместим с Gitea
- Независимое развитие
- Те же функции что Gitea

#### Файлы поддержки
- Использует `.gitea/` конфигурации
- `docs/FORGEJO_SETUP.md`
- `docs/GITEA_FORGEJO_COMPARISON.md`

### 3. GitLab Self-Hosted

**Статус**: ✅ Полная поддержка

GitLab можно self-host, популярен в российских компаниях.

#### Особенности
- Полный контроль
- Мощный CI/CD
- Enterprise features
- Российские компании используют

#### Файлы поддержки
- `.gitlab-ci.yml`
- `.gitlab/` (50+ шаблонов)
- `docs/GITLAB_SETUP.md`

### 4. Russian GitLab Instance

**Статус**: ⚠️ Частичная поддержка

Некоторые российские компании используют локальные GitLab инстансы.

#### Особенности
- Локальное размещение
- Соответствие требованиям
- Полный контроль

#### Файлы поддержки
- Использует стандартные GitLab конфиги
- `docs/GITLAB_SETUP.md`

## Сравнительная таблица

| Платформа | Self-Hosted | CI/CD | Actions | Популярность в РФ | METR Support |
|-----------|-------------|-------|---------|-------------------|--------------|
| Gitea | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | ✅ Полная |
| Forgejo | ✅ | ✅ | ✅ | ⭐⭐⭐ | ✅ Полная |
| GitLab Self-Hosted | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | ✅ Полная |

## Рекомендации для российских команд

### Для стартапов
- **Gitea** - легковесное решение
- **Forgejo** - если нужна независимость

### Для средних компаний
- **GitLab Self-Hosted** - мощное решение
- **Gitea** - если нужна простота

### Для крупных компаний
- **GitLab Self-Hosted** - enterprise features
- **Custom setup** - полный контроль

## Compliance и требования

### Российские требования
- Локальное хранение данных
- Соответствие ФЗ-152
- Контроль доступа

### Все платформы поддерживают
- Self-hosting
- Полный контроль данных
- Приватность

## Миграция между платформами

### Gitea ↔ Forgejo
- Простая миграция
- Совместимые форматы
- Минимальные изменения

### GitLab ↔ Gitea/Forgejo
- Требует экспорт/импорт
- Возможна миграция
- Нужна настройка

## Best Practices

1. **Выбор платформы**: Исходя из потребностей
2. **Self-hosting**: Для контроля данных
3. **Backup**: Регулярные бэкапы
4. **Security**: Регулярные обновления
5. **Documentation**: Ведите документацию

## Resources

- [Gitea Setup](GITEA_SETUP.md)
- [Forgejo Setup](FORGEJO_SETUP.md)
- [GitLab Setup](GITLAB_SETUP.md)
- [Russian Git Platforms](RU_GIT_PLATFORMS.md)

## Support

Для вопросов по российским платформам:
- Email: devops@metr.app
- Discord: https://discord.gg/metr
- GitHub Discussions: https://github.com/metr/metr-mobile/discussions


