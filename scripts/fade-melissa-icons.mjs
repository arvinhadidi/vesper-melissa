import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const images = [
  'public/melissa/melissa-default.png',
  'public/melissa/melissa-thinking.png',
  'public/melissa/melissa-insight.png',
  'public/landing/melissa_base.png',
  'public/landing/melissa_thinking.png',
  'public/landing/melissa_excited_transparent.png',
];

async function applyBottomFade(filePath) {
  const fullPath = path.resolve(root, filePath);
  const img = sharp(fullPath);
  const metadata = await img.metadata();
  const { width, height } = metadata;

  // Fade starts at 55% from top — bottom 45% fades to fully transparent
  const fadeStartPct = 55;

  // Create an SVG gradient mask (white = opaque, black = transparent)
  const mask = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white"/>
          <stop offset="${fadeStartPct}%" stop-color="white"/>
          <stop offset="90%" stop-color="black"/>
          <stop offset="100%" stop-color="black"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#fade)"/>
    </svg>
  `);

  const maskBuffer = await sharp(mask).resize(width, height).greyscale().toBuffer();

  // Ensure input has alpha, then composite the mask as dest-in
  const result = await sharp(fullPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = result;
  const maskRaw = await sharp(maskBuffer).raw().toBuffer();

  // Apply mask to alpha channel
  for (let i = 0; i < info.width * info.height; i++) {
    const alphaIdx = i * 4 + 3;
    const maskVal = maskRaw[i]; // greyscale single channel from raw
    data[alphaIdx] = Math.round((data[alphaIdx] * maskVal) / 255);
  }

  const outputPath = fullPath.replace('.png', '-faded.png');
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Created: ${path.relative(root, outputPath)}`);
}

for (const img of images) {
  await applyBottomFade(img);
}
console.log('\nDone! Review the -faded.png files, then approve to replace originals.');
