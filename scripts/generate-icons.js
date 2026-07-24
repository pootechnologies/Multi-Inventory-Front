import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const outputDir = path.resolve(__dirname, '../public');

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

const splashSizes = [
  { size: 640, name: 'splash-640x1136.png' },
  { size: 750, name: 'splash-750x1334.png' },
  { size: 1242, name: 'splash-1242x2208.png' },
  { size: 1125, name: 'splash-1125x2436.png' }
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`Generated ${name}`);
  }
  
  console.log('All icons generated successfully!');
}

async function generateSplashScreens() {
  const splashSvgPath = path.resolve(__dirname, '../public/splash.svg');
  const splashSvgBuffer = fs.readFileSync(splashSvgPath);
  
  for (const { size, name } of splashSizes) {
    const height = Math.round(size * (16/9)); // 16:9 aspect ratio
    await sharp(splashSvgBuffer)
      .resize(size, height)
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`Generated ${name}`);
  }
  
  console.log('All splash screens generated successfully!');
}

async function generateAll() {
  await generateIcons();
  await generateSplashScreens();
}

generateAll().catch(console.error);
