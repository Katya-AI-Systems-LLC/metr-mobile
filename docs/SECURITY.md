# Security Policy для METR

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :x:                |
| < 2.0   | :x:                |

## Reporting a Vulnerability

### How to Report

Если вы обнаружили уязвимость безопасности:

1. **НЕ** создавайте публичный issue
2. Отправьте email на: security@metr.app
3. Включите:
   - Описание уязвимости
   - Шаги для воспроизведения
   - Потенциальное воздействие
   - Предложения по исправлению

### Response Time

- **Initial Response**: В течение 48 часов
- **Status Update**: Каждые 7 дней
- **Fix Timeline**: Зависит от severity

## Security Features

### Encryption
- End-to-end encryption для сообщений
- Zero-knowledge encryption для данных
- Quantum-resistant cryptography

### Authentication
- Biometric authentication
- Multi-factor authentication (MFA)
- OAuth 2.0 / SAML support

### Privacy
- Self-hosting support
- Data minimization
- GDPR compliance
- Privacy-first design

## Security Best Practices

### For Developers
1. Никогда не коммитьте секреты
2. Используйте environment variables
3. Регулярно обновляйте зависимости
4. Проводите security audits
5. Используйте secure coding practices

### For Users
1. Используйте сильные пароли
2. Включите 2FA
3. Регулярно обновляйте приложение
4. Не делитесь учетными данными
5. Используйте VPN при необходимости

## Security Updates

### Regular Updates
- Security patches выпускаются немедленно
- Regular updates каждые 2 недели
- Major updates каждые 3 месяца

### Security Advisories
- Публикуются в [SECURITY_ADVISORIES.md](../SECURITY_ADVISORIES.md)
- Уведомления через email
- GitHub Security Advisories

## Responsible Disclosure

Мы следуем принципам responsible disclosure:
- Не разглашайте уязвимости публично до исправления
- Дайте нам время на исправление
- Работайте с нами над исправлением

## Security Audit

### Regular Audits
- Ежеквартальные security audits
- Dependency scanning
- Code reviews
- Penetration testing

### Third-Party Audits
- Годовые независимые аудиты
- Bug bounty program (планируется)

## Contact

- **Security Email**: security@metr.app
- **PGP Key**: [Download](../SECURITY_PGP_KEY.asc)


