#!/bin/bash
# build-android-debug.sh - Build Android Debug APK Script
# Bash script for building METR Android debug APK

set -e

echo "🚀 Building METR Android Debug APK..."

# Check if JAVA_HOME is set
if [ -z "$JAVA_HOME" ]; then
    echo "❌ ERROR: JAVA_HOME is not set!"
    echo "Please set JAVA_HOME environment variable:"
    echo "  export JAVA_HOME=/path/to/jdk-17"
    exit 1
fi

# Check if Android SDK is configured
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  WARNING: ANDROID_HOME is not set!"
    echo "Setting default Android SDK location..."
    export ANDROID_HOME="$HOME/Android/Sdk"
fi

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug

# Find the generated APK
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    
    echo "✅ Build successful!"
    echo "📦 APK location: $(pwd)/$APK_PATH"
    echo "📊 APK size: $APK_SIZE"
    
    # Copy to root for easy access
    cp "$APK_PATH" ../metr-debug.apk
    echo "📋 APK also copied to: metr-debug.apk"
else
    echo "⚠️  APK not found at expected location: $APK_PATH"
fi

cd ..

echo "🎉 Done!"

