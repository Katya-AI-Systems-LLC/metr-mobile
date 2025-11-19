# Agile Workflow для METR

## Overview

Руководство по Agile процессу разработки METR.

## Sprint Planning

### Sprint Duration
- **2 недели** - стандартный спринт
- **1 неделя** - короткие спринты для hotfixes

### Sprint Planning Meeting
1. Review backlog
2. Estimate tasks
3. Assign tasks
4. Set sprint goals

## Daily Standup

### Формат
- Что сделал вчера?
- Что буду делать сегодня?
- Есть ли блокеры?

### Время
- **15 минут** максимум
- Каждый день в одно время

## Sprint Review

### Демонстрация
- Показать завершенные фичи
- Собрать feedback
- Обновить roadmap

## Retrospective

### Формат
- Что прошло хорошо?
- Что можно улучшить?
- Action items

## Tools

### Issue Tracking
- GitHub Issues
- GitLab Issues
- Jira (если используется)

### Project Management
- GitHub Projects
- GitLab Boards
- Trello
- Notion

### Communication
- Discord для команды
- Email для формальных коммуникаций
- Slack (опционально)

## Branch Strategy

### Git Flow

```
main (production)
  └── develop (development)
       └── feature/feature-name
       └── bugfix/bug-name
       └── hotfix/hotfix-name
```

### Workflow

1. **Feature**: `feature/feature-name`
2. **Bugfix**: `bugfix/bug-name`
3. **Hotfix**: `hotfix/hotfix-name`
4. **Release**: `release/v2.2.0`

## Definition of Done

- [ ] Code written and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] CI/CD passing
- [ ] No critical bugs
- [ ] QA approved

## Metrics

### Velocity
- Story points completed per sprint
- Track trends over time

### Burndown
- Track remaining work
- Identify blockers early

### Cycle Time
- Time from start to completion
- Identify bottlenecks

## Best Practices

1. **Small PRs**: Легче review
2. **Frequent commits**: Регулярные коммиты
3. **Clear communication**: Понятная коммуникация
4. **Continuous improvement**: Постоянное улучшение


