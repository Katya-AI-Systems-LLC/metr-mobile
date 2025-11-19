# Travis CI Setup Guide for METR

## Overview

Руководство по настройке Travis CI для METR.

## Configuration

Проект использует `.travis.yml` для автоматизации.

## Setup Steps

1. **Sign up** на Travis CI
2. **Sync** с GitHub
3. **Enable** repository
4. **Configure** environment variables

## Environment Variables

Настройте в Travis CI Settings:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## Build Matrix

Travis CI поддерживает:
- Linux builds (Android)
- macOS builds (iOS)

## Resources

- [Travis CI Documentation](https://docs.travis-ci.com/)


