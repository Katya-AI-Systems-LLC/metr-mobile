# METR Integrations Guide

## Available Integrations

### Development Tools
- **GitHub**: Code hosting, CI/CD
- **GitLab**: Code hosting, CI/CD
- **Bitbucket**: Code hosting, CI/CD
- **Jenkins**: CI/CD
- **CircleCI**: CI/CD
- **Travis CI**: CI/CD

### Communication
- **Discord**: Team communication
- **Slack**: Team communication (via webhook)
- **Email**: Notifications

### Analytics
- **Sentry**: Error tracking
- **Analytics**: Usage analytics
- **Performance Monitoring**: App performance

### Storage
- **AWS S3**: File storage
- **Google Cloud Storage**: File storage
- **IPFS**: Decentralized storage

### Authentication
- **OAuth 2.0**: Standard OAuth
- **SAML**: Enterprise SSO
- **LDAP**: Directory services

## Setting Up Integrations

### GitHub Integration

1. Go to Settings > Integrations
2. Select GitHub
3. Authorize access
4. Configure webhooks

### Sentry Integration

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### Discord Integration

```typescript
// Webhook URL
const webhookUrl = 'https://discord.com/api/webhooks/...';

// Send notification
fetch(webhookUrl, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({content: 'Message'}),
});
```

## Custom Integrations

### API Gateway

Используйте `APIGateway.ts` для создания custom интеграций:

```typescript
import {APIGateway} from './app/integrations/APIGateway';

const gateway = APIGateway.getInstance();
gateway.registerIntegration('custom', {
  endpoint: 'https://api.example.com',
  auth: {type: 'bearer', token: 'token'},
});
```

## Webhook Configuration

### Incoming Webhooks

Настройте webhooks для получения событий:

```typescript
DeviceEventEmitter.addListener('webhook_received', (data) => {
  // Handle webhook
});
```

### Outgoing Webhooks

Настройте webhooks для отправки событий:

```typescript
DeviceEventEmitter.emit('webhook_send', {
  url: 'https://webhook.url',
  payload: {event: 'user_action'},
});
```

## Best Practices

1. **Secure Credentials**: Используйте environment variables
2. **Error Handling**: Обрабатывайте ошибки интеграций
3. **Rate Limiting**: Соблюдайте rate limits
4. **Monitoring**: Мониторьте интеграции

## Resources

- [API Documentation](API.md)
- [Integration Examples](../examples/)


