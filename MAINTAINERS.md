# METR Maintainers Guide

## Core Team

### Responsibilities

- Code review
- Release management
- Architecture decisions
- Community management
- Security issues

## Release Process

### Versioning

Мы следуем [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] Tagged release
- [ ] Published to stores

### Release Steps

1. **Prepare Release**
   ```bash
   npm version minor  # or major/patch
   git push --tags
   ```

2. **Build**
   ```bash
   npm run build:production:ios
   npm run build:production:android
   ```

3. **Deploy**
   - Upload to App Store Connect
   - Upload to Google Play Console
   - Update documentation

## Code Review Guidelines

### What to Look For

- Code quality
- Test coverage
- Documentation
- Performance
- Security
- Accessibility

### Review Process

1. Automated checks (CI)
2. Code review (2 approvals minimum)
3. QA testing
4. Merge

## Security

### Handling Security Issues

1. **DO NOT** create public issues
2. Email security@metr.app
3. Acknowledge within 48 hours
4. Fix and release ASAP
5. Credit researcher (if agreed)

## Community

### Communication Channels

- GitHub Issues/Discussions
- Discord
- Email

### Response Times

- Critical issues: 24 hours
- Regular issues: 72 hours
- Feature requests: 1 week

## Decision Making

### Process

1. Discuss in GitHub Discussions
2. Gather feedback
3. Make decision
4. Document in ADRs (Architecture Decision Records)

### ADR Template

```markdown
# ADR-XXX: Title

## Status
Proposed / Accepted / Rejected / Deprecated

## Context
Why this decision?

## Decision
What was decided?

## Consequences
What are the implications?
```

## Resources

- [Release Process](docs/DEPLOYMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security Policy](.github/SECURITY.md)


