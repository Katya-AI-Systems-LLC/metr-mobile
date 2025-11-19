# Руководство по Git платформам для METR

## 🇷🇺 Отечественные Git платформы

### 1. GitLab (Российская версия)

GitLab доступен в России через:
- **GitLab.com** (международная версия)
- **Self-hosted GitLab** (полный контроль)

#### Настройка

1. Создайте репозиторий в GitLab
2. Используйте `.gitlab-ci.yml` для CI/CD
3. Настройте переменные окружения
4. Настройте runners

Подробнее: [GITLAB_SETUP.md](GITLAB_SETUP.md)

### 2. Gitea

Gitea - легковесная Git платформа, популярная в России.

#### Особенности

- Легковесная и быстрая
- Self-hosted решение
- Совместима с GitHub API
- Поддержка Actions

#### Настройка

1. Установите Gitea на сервер
2. Создайте репозиторий
3. Используйте `.gitea/workflows/` для Actions
4. Настройте webhooks для CI/CD

Подробнее: [GITEA_SETUP.md](GITEA_SETUP.md)

### 3. Bitbucket

Bitbucket доступен через Atlassian.

#### Настройка

1. Создайте репозиторий в Bitbucket
2. Используйте `bitbucket-pipelines.yml`
3. Настройте deployments
4. Настройте branch permissions

Подробнее: [BITBUCKET_SETUP.md](BITBUCKET_SETUP.md)

### 4. GitHub (через VPN/прокси)

GitHub доступен через:
- VPN сервисы
- Прокси
- Альтернативные DNS

#### Настройка

1. Используйте VPN/прокси
2. Создайте репозиторий на GitHub
3. Используйте `.github/workflows/`
4. Настройте GitHub Actions

## 🔧 Конфигурационные файлы

### Для всех платформ

- `.gitignore` - Игнорируемые файлы
- `.gitattributes` - Git атрибуты
- `.editorconfig` - Настройки редактора
- `.prettierrc.js` - Prettier конфигурация

### Специфичные для платформ

#### GitHub
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/ISSUE_TEMPLATE/`
- `.github/PULL_REQUEST_TEMPLATE.md`

#### GitLab
- `.gitlab-ci.yml`
- `.gitlab/merge_request_templates/`
- `.gitlab/issue_templates/`

#### Bitbucket
- `bitbucket-pipelines.yml`

#### Gitea
- `.gitea/workflows/ci.yml`
- `.gitea/issue_templates/`

## 🚀 CI/CD Comparison

| Платформа | CI/CD | Бесплатный план | Self-hosted |
|-----------|-------|-----------------|-------------|
| GitHub | Actions | ✅ Да | ❌ Нет |
| GitLab | CI/CD | ✅ Да | ✅ Да |
| Bitbucket | Pipelines | ✅ Да | ❌ Нет |
| Gitea | Actions | ✅ Да | ✅ Да |

## 📋 Рекомендации

### Для российских команд

1. **GitLab Self-hosted** - полный контроль, приватность
2. **Gitea** - легковесное решение
3. **Bitbucket** - если используете Atlassian экосистему

### Для международных команд

1. **GitHub** - наибольшая экосистема
2. **GitLab** - мощный CI/CD
3. **Bitbucket** - интеграция с Jira

## 🔐 Безопасность

### Self-hosted решения

- Полный контроль над данными
- Соответствие требованиям безопасности
- Приватность данных

### Cloud решения

- Используйте VPN/прокси при необходимости
- Настройте 2FA
- Используйте SSH keys
- Регулярно обновляйте зависимости

## 📚 Дополнительные ресурсы

- [GitLab Documentation](https://docs.gitlab.com/)
- [Gitea Documentation](https://docs.gitea.io/)
- [Bitbucket Documentation](https://support.atlassian.com/bitbucket-cloud/)
- [GitHub Documentation](https://docs.github.com/)

## 🆘 Поддержка

Для вопросов по настройке:
- Email: devops@metr.app
- Discord: https://discord.gg/metr
- GitHub Discussions: https://github.com/metr/metr-mobile/discussions


