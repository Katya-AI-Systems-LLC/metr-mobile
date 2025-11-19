#!/bin/bash
# analyze-bundle.sh - Analyze bundle size for METR

echo "📦 Analyzing METR bundle size..."

# Install analyzer if needed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js."
    exit 1
fi

# Run bundle analyzer
echo "🔍 Running bundle analyzer..."
npx react-native-bundle-visualizer

# Analyze Android bundle
if [ -d "android" ]; then
    echo "📱 Analyzing Android bundle..."
    cd android
    ./gradlew bundleRelease
    cd ..
fi

# Analyze iOS bundle
if [ -d "ios" ]; then
    echo "🍎 Analyzing iOS bundle..."
    cd ios
    xcodebuild -workspace Mattermost.xcworkspace \
        -scheme Mattermost \
        -configuration Release \
        archive
    cd ..
fi

echo "✅ Bundle analysis complete!"
echo "📊 Check bundle-visualizer report for details."


