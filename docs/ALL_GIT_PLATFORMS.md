# Полное руководство по Git платформам для METR

## 🌍 Международные платформы

### GitHub
- **Файлы**: `.github/workflows/`, `.github/ISSUE_TEMPLATE/`
- **CI/CD**: GitHub Actions
- **Документация**: [GitHub Setup](https://docs.github.com/)

### GitLab
- **Файлы**: `.gitlab-ci.yml`, `.gitlab/`
- **CI/CD**: GitLab CI/CD
- **Документация**: [GITLAB_SETUP.md](GITLAB_SETUP.md)

### Bitbucket
- **Файлы**: `bitbucket-pipelines.yml`
- **CI/CD**: Bitbucket Pipelines
- **Документация**: [BITBUCKET_SETUP.md](BITBUCKET_SETUP.md)

## 🇷🇺 Отечественные платформы

### Gitea
- **Файлы**: `.gitea/workflows/`, `.gitea/issue_templates/`
- **CI/CD**: Gitea Actions
- **Документация**: [GITEA_SETUP.md](GITEA_SETUP.md)

### GitLab Self-hosted
- **Файлы**: `.gitlab-ci.yml`
- **CI/CD**: GitLab CI/CD
- **Документация**: [GITLAB_SETUP.md](GITLAB_SETUP.md)

## 🔧 CI/CD платформы

### Jenkins
- **Файлы**: `Jenkinsfile`
- **Документация**: [JENKINS_SETUP.md](JENKINS_SETUP.md)

### Drone CI
- **Файлы**: `.drone.yml`
- **Документация**: [DRONE_CI_SETUP.md](DRONE_CI_SETUP.md)

### CircleCI
- **Файлы**: `.circleci/config.yml`
- **Документация**: [CIRCLE_CI_SETUP.md](CIRCLE_CI_SETUP.md)

### Travis CI
- **Файлы**: `.travis.yml`
- **Документация**: [TRAVIS_CI_SETUP.md](TRAVIS_CI_SETUP.md)

## 📊 Сравнительная таблица

| Платформа | CI/CD | Self-hosted | Бесплатный план | Популярность в РФ |
|-----------|-------|-------------|-----------------|-------------------|
| GitHub | ✅ Actions | ❌ | ✅ | ⭐⭐⭐ |
| GitLab | ✅ CI/CD | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Bitbucket | ✅ Pipelines | ❌ | ✅ | ⭐⭐ |
| Gitea | ✅ Actions | ✅ | ✅ | ⭐⭐⭐⭐ |
| Jenkins | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Drone CI | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |

## 🚀 Быстрый старт

### Выбор платформы

1. **Для российских команд**: GitLab Self-hosted или Gitea
2. **Для международных**: GitHub или GitLab.com
3. **Для корпораций**: GitLab Self-hosted или Jenkins
4. **Для стартапов**: GitHub или GitLab.com

### Миграция между платформами

Все платформы используют стандартный Git, поэтому миграция проста:

```bash
# Добавить новый remote
git remote add new-platform https://new-platform.com/user/repo.git

# Push в новую платформу
git push new-platform main
```

## 📋 Checklist для настройки

- [ ] Выбрана платформа
- [ ] Репозиторий создан
- [ ] CI/CD настроен
- [ ] Переменные окружения настроены
- [ ] Runners настроены
- [ ] Branch protection настроена
- [ ] Issue templates созданы
- [ ] PR/MR templates созданы
- [ ] Документация обновлена

## 🔐 Безопасность

### Best Practices

1. Используйте SSH keys вместо паролей
2. Включите 2FA
3. Настройте branch protection
4. Используйте secrets management
5. Регулярно обновляйте зависимости
6. Проводите security audits

## 📚 Дополнительные ресурсы

- [Git Documentation](https://git-scm.com/doc)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Semantic Versioning](https://semver.org/)

## 🆘 Поддержка

Для вопросов:
- Email: devops@metr.app
- Discord: https://discord.gg/metr
- Documentation: https://docs.metr.app


