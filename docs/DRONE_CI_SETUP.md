# Drone CI Setup Guide for METR

## Overview

Руководство по настройке Drone CI для METR (популярная CI платформа в России).

## .drone.yml

Создайте `.drone.yml` в корне проекта:

```yaml
kind: pipeline
type: docker
name: default

steps:
  - name: lint
    image: node:18-alpine
    commands:
      - npm ci
      - npm run lint
      - npm run type-check

  - name: test
    image: node:18-alpine
    commands:
      - npm ci
      - npm test -- --coverage

  - name: build-android
    image: openjdk:17-jdk-slim
    commands:
      - apt-get update && apt-get install -y wget unzip
      - export ANDROID_HOME=/opt/android-sdk
      - export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
      - |
        if [ ! -d "$ANDROID_HOME" ]; then
          mkdir -p $ANDROID_HOME
          wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
          unzip commandlinetools-linux-9477386_latest.zip -d $ANDROID_HOME/cmdline-tools
          rm commandlinetools-linux-9477386_latest.zip
          yes | $ANDROID_HOME/cmdline-tools/bin/sdkmanager --licenses
        fi
      - curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
      - apt-get install -y nodejs
      - npm ci
      - cd android && ./gradlew assembleDebug
    when:
      branch:
        - main
        - develop

trigger:
  branch:
    - main
    - develop
  event:
    - push
    - pull_request
```

## Drone Configuration

### 1. Install Drone

```bash
# Docker Compose example
version: '3'
services:
  drone-server:
    image: drone/drone:latest
    ports:
      - "80:80"
    volumes:
      - ./drone:/data
    environment:
      - DRONE_GITEA_SERVER=https://your-gitea-instance.com
      - DRONE_GITEA_CLIENT_ID=your-client-id
      - DRONE_GITEA_CLIENT_SECRET=your-client-secret
      - DRONE_RPC_SECRET=your-rpc-secret
      - DRONE_SERVER_HOST=your-drone-instance.com
      - DRONE_SERVER_PROTO=https

  drone-runner:
    image: drone/drone-runner-docker:latest
    depends_on:
      - drone-server
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DRONE_RPC_HOST=drone-server
      - DRONE_RPC_PROTO=http
      - DRONE_RPC_SECRET=your-rpc-secret
```

### 2. Configure Secrets

```bash
drone secret add \
  --repository your-username/metr-mobile \
  --name android_keystore_password \
  --data your-password
```

## Multi-Pipeline Setup

```yaml
---
kind: pipeline
type: docker
name: lint-test

steps:
  - name: lint
    image: node:18-alpine
    commands:
      - npm ci
      - npm run lint

  - name: test
    image: node:18-alpine
    commands:
      - npm ci
      - npm test

---
kind: pipeline
type: docker
name: build

depends_on:
  - lint-test

steps:
  - name: build-android
    image: openjdk:17-jdk-slim
    commands:
      - npm ci
      - cd android && ./gradlew assembleDebug
```

## Resources

- [Drone CI Documentation](https://docs.drone.io/)
- [Drone Gitea Integration](https://docs.drone.io/server/provider/gitea/)


