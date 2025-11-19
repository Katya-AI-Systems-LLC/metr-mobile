#!/bin/bash
# optimize-assets.sh - Optimize assets for METR

set -e

echo "🎨 Optimizing METR assets..."

# Check for required tools
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js."
    exit 1
fi

# Optimize images
echo "🖼️  Optimizing images..."
find assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read img; do
    echo "Optimizing $img..."
    npx sharp-cli -i "$img" -o "$img" --quality 80 --format webp
done

# Optimize SVGs
echo "📐 Optimizing SVGs..."
find assets -name "*.svg" | while read svg; do
    echo "Optimizing $svg..."
    npx svgo "$svg" -o "$svg"
done

echo "✅ Asset optimization complete!"


