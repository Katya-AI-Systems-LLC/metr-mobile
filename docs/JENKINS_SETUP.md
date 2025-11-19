# Jenkins Setup Guide for METR

## Overview

Руководство по настройке Jenkins CI/CD для METR.

## Jenkinsfile

Создайте `Jenkinsfile` в корне проекта:

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        ANDROID_HOME = '/opt/android-sdk'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')]
                }
            }
        }
        
        stage('Build Android') {
            steps {
                dir('android') {
                    sh './gradlew assembleDebug'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'android/app/build/outputs/apk/debug/app-debug.apk', fingerprint: true
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            emailext(
                subject: "METR Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Build failed. Check console output: ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

## Jenkins Configuration

### 1. Install Plugins

- NodeJS Plugin
- Android Emulator Plugin
- Pipeline Plugin
- Coverage Plugin
- Email Extension Plugin

### 2. Configure Tools

- Node.js 18+
- Java JDK 17+
- Android SDK
- Gradle

### 3. Create Pipeline Job

1. New Item > Pipeline
2. Configure SCM (Git)
3. Set Jenkinsfile path
4. Save

## Multi-Branch Pipeline

Для автоматической сборки всех branches:

```groovy
pipeline {
    agent any
    
    triggers {
        pollSCM('H/15 * * * *')
    }
    
    stages {
        // Same as above
    }
}
```

## Android Build Configuration

### Setup Android SDK

```groovy
stage('Setup Android') {
    steps {
        sh '''
            export ANDROID_HOME=/opt/android-sdk
            export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
            sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
        '''
    }
}
```

## iOS Build Configuration

Для iOS требуется macOS agent:

```groovy
pipeline {
    agent {
        label 'macos'
    }
    
    stages {
        stage('Build iOS') {
            steps {
                sh '''
                    cd ios
                    pod install
                    xcodebuild -workspace Mattermost.xcworkspace \
                        -scheme Mattermost \
                        -configuration Release \
                        clean build
                '''
            }
        }
    }
}
```

## Deployment

### Staging Deployment

```groovy
stage('Deploy Staging') {
    when {
        branch 'develop'
    }
    steps {
        sh './scripts/deploy-staging.sh'
    }
}
```

### Production Deployment

```groovy
stage('Deploy Production') {
    when {
        tag 'v*'
    }
    steps {
        input message: 'Deploy to Production?', ok: 'Deploy'
        sh './scripts/deploy-production.sh'
    }
}
```

## Best Practices

1. **Use Credentials**: Храните секреты в Jenkins Credentials
2. **Parallel Execution**: Используйте parallel stages
3. **Artifact Management**: Сохраняйте артефакты
4. **Notifications**: Настройте email/Slack уведомления

## Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkinsfile Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)


