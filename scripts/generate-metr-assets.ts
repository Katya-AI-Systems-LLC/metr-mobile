// generate-metr-assets.ts - Generate METR Brand Assets
// This script generates all visual assets for METR rebranding

import * as fs from 'fs';
import * as path from 'path';

interface IconSize {
  name: string;
  size: number;
  density?: string;
}

const METR_COLORS = {
  primary: '#8B5CF6', // Electric Purple
  secondary: '#14B8A6', // Cyber Teal
  accent: '#EC4899', // Neon Pink
  darkBg: '#0F0F0F',
  darkSurface: '#1A1A1A',
};

// Android icon sizes
const ANDROID_ICON_SIZES: IconSize[] = [
  {name: 'mdpi', size: 48, density: '1x'},
  {name: 'hdpi', size: 72, density: '1.5x'},
  {name: 'xhdpi', size: 96, density: '2x'},
  {name: 'xxhdpi', size: 144, density: '3x'},
  {name: 'xxxhdpi', size: 192, density: '4x'},
];

// iOS icon sizes
const IOS_ICON_SIZES: IconSize[] = [
  {name: 'Icon-App-20x20@2x', size: 40},
  {name: 'Icon-App-20x20@3x', size: 60},
  {name: 'Icon-App-29x29@2x', size: 58},
  {name: 'Icon-App-29x29@3x', size: 87},
  {name: 'Icon-App-40x40@2x', size: 80},
  {name: 'Icon-App-40x40@3x', size: 120},
  {name: 'Icon-App-60x60@2x', size: 120},
  {name: 'Icon-App-60x60@3x', size: 180},
  {name: 'Icon-App-76x76@1x', size: 76},
  {name: 'Icon-App-76x76@2x', size: 152},
  {name: 'Icon-App-1024x1024@1x', size: 1024},
];

// Generate SVG logo
function generateMETRLogoSVG(size: number): string {
  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 1024;
  
  // Mountain M path (scaled)
  const mPath = `
    M ${200 * scale} ${800 * scale}
    L ${350 * scale} ${300 * scale}
    L ${500 * scale} ${600 * scale}
    L ${650 * scale} ${200 * scale}
    L ${800 * scale} ${800 * scale}
    Z
  `.trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${METR_COLORS.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${METR_COLORS.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${METR_COLORS.accent};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="metr-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${METR_COLORS.darkBg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${METR_COLORS.darkSurface};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#metr-bg-gradient)"/>
  
  <!-- Mountain M Symbol -->
  <path d="${mPath}" 
        fill="url(#metr-gradient)" 
        stroke="none"
        transform="translate(${centerX - 400 * scale}, ${centerY - 400 * scale})"/>
</svg>`;
}

// Generate Android adaptive icon XML
function generateAndroidAdaptiveIconXML(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
}

// Generate Android adaptive icon round XML
function generateAndroidAdaptiveIconRoundXML(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
}

// Generate splash screen SVG
function generateSplashScreenSVG(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${METR_COLORS.darkBg};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${METR_COLORS.darkSurface};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${METR_COLORS.darkBg};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${METR_COLORS.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${METR_COLORS.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${METR_COLORS.accent};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#splash-gradient)"/>
  
  <!-- METR Logo centered -->
  <g transform="translate(290, 760)">
    <path d="M 200 800 L 350 300 L 500 600 L 650 200 L 800 800 Z" 
          fill="url(#logo-gradient)" 
          stroke="none"
          transform="scale(0.5)"/>
  </g>
  
  <!-- METR Text -->
  <text x="540" y="1200" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="72" 
        font-weight="bold"
        fill="${METR_COLORS.primary}"
        text-anchor="middle">METR</text>
  
  <!-- Tagline -->
  <text x="540" y="1300" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="32" 
        fill="#A3A3A3"
        text-anchor="middle">Measure Your Team's Potential</text>
</svg>`;
}

// Create directories if they don't exist
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }
}

// Main generation function
function generateAllAssets(): void {
  console.log('🎨 Generating METR brand assets...\n');

  // Generate Android icons
  console.log('📱 Generating Android icons...');
  ANDROID_ICON_SIZES.forEach(({name, size}) => {
    const dir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', `mipmap-${name}`);
    ensureDir(dir);
    
    const svgPath = path.join(dir, 'ic_launcher.svg');
    fs.writeFileSync(svgPath, generateMETRLogoSVG(size));
    
    console.log(`  ✅ Generated ${name} icon (${size}x${size})`);
  });

  // Generate Android adaptive icon XMLs
  const anydpiDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26');
  ensureDir(anydpiDir);
  fs.writeFileSync(
    path.join(anydpiDir, 'ic_launcher.xml'),
    generateAndroidAdaptiveIconXML()
  );
  fs.writeFileSync(
    path.join(anydpiDir, 'ic_launcher_round.xml'),
    generateAndroidAdaptiveIconRoundXML()
  );
  console.log('  ✅ Generated adaptive icon XMLs\n');

  // Generate splash screens
  console.log('🖼️  Generating splash screens...');
  const splashDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'drawable');
  ensureDir(splashDir);
  fs.writeFileSync(
    path.join(splashDir, 'splash_background.svg'),
    generateSplashScreenSVG()
  );
  console.log('  ✅ Generated splash screen\n');

  // Generate iOS icons (SVG templates)
  console.log('🍎 Generating iOS icon templates...');
  const iosIconDir = path.join(__dirname, '..', 'ios', 'Mattermost', 'Images.xcassets', 'AppIcon.appiconset');
  ensureDir(iosIconDir);
  
  IOS_ICON_SIZES.forEach(({name, size}) => {
    const svgPath = path.join(iosIconDir, `${name}.svg`);
    fs.writeFileSync(svgPath, generateMETRLogoSVG(size));
  });
  console.log('  ✅ Generated iOS icon templates\n');

  console.log('✅ All assets generated!');
  console.log('\n⚠️  Note: SVG files need to be converted to PNG for use.');
  console.log('   Use online tools or ImageMagick to convert:');
  console.log('   convert icon.svg -resize 1024x1024 icon.png');
}

// Run if executed directly
if (require.main === module) {
  generateAllAssets();
}

export {generateMETRLogoSVG, generateSplashScreenSVG, generateAllAssets};

