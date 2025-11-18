# 🚀 Migration Guide: Mattermost → METR

## Overview
This guide will help you migrate from the legacy Mattermost Mobile to the new METR platform with all its modern features.

---

## ⚠️ Important Notice
**METR maintains backward compatibility with existing Mattermost servers while adding new AI-powered and Web3 features.**

---

## 📋 Migration Steps

### Step 1: Backup Current Data
```bash
# Backup your current installation
cp -r . ../mattermost-backup
git add .
git commit -m "Backup before METR migration"
git tag mattermost-final
```

### Step 2: Install New Dependencies
```bash
# Remove old node_modules and lockfile
rm -rf node_modules package-lock.json

# Copy new package configuration
cp package.metr.json package.json

# Install new dependencies
npm install

# Install iOS pods (for iOS development)
cd ios && pod install && cd ..
```

### Step 3: Update Project Configuration

#### Android Configuration
1. Update `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.metr.mobile"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 300
        versionName "3.0.0"
    }
}
```

2. Update `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">METR</string>
```

#### iOS Configuration
1. Update `ios/Mattermost/Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>METR</string>
<key>CFBundleIdentifier</key>
<string>com.metr.mobile</string>
```

### Step 4: Environment Configuration

Create `.env` file:
```env
# AI Configuration
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Web3 Configuration
INFURA_PROJECT_ID=your_infura_id
ALCHEMY_API_KEY=your_alchemy_key
WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Server Configuration (Mattermost compatibility)
MATTERMOST_SERVER_URL=https://your-server.com
ENABLE_LEGACY_MODE=true

# METR Features
ENABLE_AI_FEATURES=true
ENABLE_WEB3_FEATURES=true
ENABLE_AR_FEATURES=false
```

### Step 5: Update App Entry Point

Replace `index.ts` with:
```typescript
import {AppRegistry} from 'react-native';
import {MetrApp} from './app/MetrApp';
import {name as appName} from './app.json';
import AIManager from './app/ai/core/AIManager';
import Web3Manager from './app/web3/Web3Manager';

// Initialize core managers
AIManager.getInstance().initialize();
Web3Manager.getInstance().initialize();

AppRegistry.registerComponent(appName, () => MetrApp);
```

### Step 6: Database Migration

Run migration script:
```bash
npm run migrate:database
```

This will:
- Preserve all existing messages and channels
- Add new tables for AI features
- Add Web3 wallet connections
- Create productivity metrics tables

### Step 7: UI Theme Migration

Update theme imports in all components:
```typescript
// Old
import {theme} from '@app/theme';

// New
import {MetrTheme, getThemeColors} from '@app/theme/metrTheme';
```

### Step 8: Feature Flags

Configure feature flags in `app/config/features.ts`:
```typescript
export const FEATURES = {
  // Core features (always enabled)
  MESSAGING: true,
  FILE_SHARING: true,
  VIDEO_CALLS: true,
  
  // New METR features
  AI_ASSISTANT: true,
  SMART_SUMMARIES: true,
  PRODUCTIVITY_INSIGHTS: true,
  WEB3_WALLET: true,
  NFT_ACHIEVEMENTS: false, // Enable when ready
  DAO_GOVERNANCE: false,   // Enable for enterprise
  AR_MEETINGS: false,       // Experimental
};
```

---

## 🔄 Gradual Migration Path

### Phase 1: Core Migration (Week 1)
- [x] Update dependencies
- [x] Apply new branding
- [x] Enable basic AI features
- [x] Test with existing server

### Phase 2: AI Integration (Week 2)
- [ ] Configure AI providers
- [ ] Enable smart summaries
- [ ] Deploy personal assistant
- [ ] Test productivity insights

### Phase 3: Web3 Features (Week 3)
- [ ] Deploy smart contracts
- [ ] Enable wallet connection
- [ ] Test token economy
- [ ] Launch NFT achievements

### Phase 4: Advanced Features (Week 4)
- [ ] Enable AR features
- [ ] Configure DAO tools
- [ ] Launch analytics dashboard
- [ ] Full production deployment

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# AI module tests
npm run ai:test

# Web3 tests
npm run web3:test

# E2E tests
npm run e2e:ios
npm run e2e:android
```

### Test Checklist
- [ ] Existing messaging works
- [ ] File uploads functional
- [ ] Video calls operational
- [ ] AI assistant responds
- [ ] Smart summaries generate
- [ ] Wallet connects properly
- [ ] UI renders correctly
- [ ] Performance acceptable

---

## 🚀 Deployment

### Beta Release
```bash
# Build beta versions
npm run build:android:beta
npm run build:ios:beta

# Deploy to test stores
npm run deploy:beta
```

### Production Release
```bash
# Build production versions
npm run build:android:release
npm run build:ios:release

# Deploy to app stores
npm run deploy:production
```

---

## 🔙 Rollback Plan

If issues arise, rollback to Mattermost:
```bash
# Restore from backup
git checkout mattermost-final
npm install
cd ios && pod install && cd ..
```

---

## 📊 Migration Metrics

Track these metrics during migration:
- User adoption rate
- Performance impact
- AI feature usage
- Web3 engagement
- Bug reports
- User feedback

---

## 🆘 Troubleshooting

### Common Issues

#### Issue: AI features not working
```bash
# Check API keys
npm run check:ai-config

# Test AI connection
npm run ai:test-connection
```

#### Issue: Web3 wallet not connecting
```bash
# Check network configuration
npm run web3:check-network

# Test provider connection
npm run web3:test-provider
```

#### Issue: Performance degradation
```bash
# Analyze bundle size
npm run analyze:bundle

# Profile performance
npm run profile:performance
```

---

## 📚 Resources

- [METR Documentation](./docs/MODERNIZATION_CONCEPT_2025.md)
- [AI Module Guide](./app/ai/README.md)
- [Web3 Integration](./app/web3/README.md)
- [UI Components](./app/components/README.md)
- [Migration Support](https://metr.support/migration)

---

## 🤝 Support

For migration assistance:
- Slack: #metr-migration
- Email: migration@metr.io
- Discord: discord.gg/metr

---

## ✅ Post-Migration Checklist

- [ ] All users migrated
- [ ] Data integrity verified
- [ ] Features enabled per plan
- [ ] Performance benchmarked
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Monitoring configured
- [ ] Backup strategy updated
- [ ] Success metrics defined

---

**Welcome to the future of team collaboration with METR! 🎉**
