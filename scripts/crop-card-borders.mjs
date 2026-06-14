import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsDir = join(__dirname, '../public/cards');

// Average brightness of a row/col across the middle 60% of the perpendicular axis
// must exceed this to be considered "real art" rather than border
const ART_THRESHOLD = 100;
const MAX_SCAN = 25;

function avgBrightness(data, W, isRow, index, lo, hi) {
  let sum = 0, count = 0;
  for (let i = lo; i < hi; i++) {
    const idx = isRow ? (index * W + i) * 4 : (i * W + index) * 4;
    sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    count++;
  }
  return sum / count;
}

function findCropBounds(data, W, H) {
  const xLo = Math.floor(W * 0.2), xHi = Math.floor(W * 0.8);
  const yLo = Math.floor(H * 0.2), yHi = Math.floor(H * 0.8);

  let top = 0, bottom = H - 1, left = 0, right = W - 1;

  for (let y = 0; y < MAX_SCAN; y++) {
    if (avgBrightness(data, W, true, y, xLo, xHi) < ART_THRESHOLD) top = y + 1; else break;
  }
  for (let y = H - 1; y > H - 1 - MAX_SCAN; y--) {
    if (avgBrightness(data, W, true, y, xLo, xHi) < ART_THRESHOLD) bottom = y - 1; else break;
  }
  for (let x = 0; x < MAX_SCAN; x++) {
    if (avgBrightness(data, W, false, x, yLo, yHi) < ART_THRESHOLD) left = x + 1; else break;
  }
  for (let x = W - 1; x > W - 1 - MAX_SCAN; x--) {
    if (avgBrightness(data, W, false, x, yLo, yHi) < ART_THRESHOLD) right = x - 1; else break;
  }

  return { top, bottom, left, right };
}

async function cropCard(filename, outputDir) {
  const img = await loadImage(join(cardsDir, filename));
  const W = img.width, H = img.height;

  const src = createCanvas(W, H);
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const data = sctx.getImageData(0, 0, W, H).data;

  const { top, bottom, left, right } = findCropBounds(data, W, H);
  const cropW = right - left + 1;
  const cropH = bottom - top + 1;

  console.log(`${filename}: crop ${left},${top} → ${right},${bottom}  (removed: L${left} R${W-1-right} T${top} B${H-1-bottom})`);

  const out = createCanvas(cropW, cropH);
  const octx = out.getContext('2d');
  octx.drawImage(src, left, top, cropW, cropH, 0, 0, cropW, cropH);

  writeFileSync(join(outputDir, filename), out.toBuffer('image/png'));
}

import { readdirSync } from 'fs';

const outDir = join(__dirname, '../public/cards-cropped');
mkdirSync(outDir, { recursive: true });

const allCards = readdirSync(cardsDir).filter(f => f.endsWith('.png'));
console.log(`Cropping ${allCards.length} cards...`);
for (const f of allCards) await cropCard(f, outDir);
console.log(`\nAll done — ${allCards.length} cards saved to public/cards-cropped/`);
