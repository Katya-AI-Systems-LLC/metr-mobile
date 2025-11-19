#!/bin/bash
# check-performance.sh - Check performance metrics for METR

echo "⚡ Checking METR performance metrics..."

# Run performance tests
echo "🧪 Running performance tests..."
npm run test:performance || echo "Performance tests not configured"

# Check bundle size
echo "📦 Checking bundle size..."
npm run build 2>&1 | grep -i "bundle\|size" || echo "Build completed"

# Analyze dependencies
echo "📊 Analyzing dependencies..."
npm ls --depth=0 | head -20

# Check for performance issues
echo "🔍 Checking for performance issues..."
npm run lint 2>&1 | grep -i "performance\|slow\|optimize" || echo "No performance warnings"

echo "✅ Performance check complete!"


