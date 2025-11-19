# CircleCI Setup Guide for METR

## Overview

Руководство по настройке CircleCI для METR.

## Configuration

Проект использует `.circleci/config.yml` для автоматизации.

## Setup Steps

1. **Sign up** на CircleCI
2. **Add project** из GitHub/GitLab/Bitbucket
3. **Configure** environment variables
4. **Start building**

## Environment Variables

Настройте в CircleCI Project Settings:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## Workflows

CircleCI автоматически запускает:
- Lint на каждом PR
- Tests на каждом PR
- Build на main/develop branches

## Resources

- [CircleCI Documentation](https://circleci.com/docs/)


