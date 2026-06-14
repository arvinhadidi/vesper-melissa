import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 300;
const H = 527;
const RADIUS = 18;
const GOLD = '#C9A84C';

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r);
  ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h);
  ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r);
  ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}

function star4(cx, cy, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = GOLD;
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a  = (i * Math.PI) / 2 - Math.PI / 4;
    const aH = a + Math.PI / 4;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(aH) * (r * 0.2), Math.sin(aH) * (r * 0.2));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}

// ── 1. clip ───────────────────────────────────────────────────────────────────
roundedRect(0, 0, W, H, RADIUS);
ctx.clip();

// ── 2. background ─────────────────────────────────────────────────────────────
const bg = ctx.createLinearGradient(0, 0, 0, H);
bg.addColorStop(0,   '#2A1E6A');
bg.addColorStop(0.5, '#3A2880');
bg.addColorStop(1,   '#2E2068');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

const vign = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H) * 0.65);
vign.addColorStop(0, 'rgba(110,70,210,0.28)');
vign.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = vign;
ctx.fillRect(0, 0, W, H);

// ── 3. scattered background stars ────────────────────────────────────────────
for (let i = 0; i < 70; i++) {
  star4(rand() * W, rand() * H, 1.2 + rand() * 2.8, 0.15 + rand() * 0.45);
}

// ── 4. constellation nodes — spread freely across the whole card ──────────────
// Mix of edge, mid, and interior points so lines cross the card space
const nodes = [
  // top area
  [W*0.18, H*0.05],  // 0
  [W*0.55, H*0.08],  // 1
  [W*0.85, H*0.06],  // 2
  // upper-mid interior
  [W*0.30, H*0.18],  // 3
  [W*0.65, H*0.15],  // 4
  [W*0.80, H*0.24],  // 5
  [W*0.12, H*0.28],  // 6
  // centre-upper
  [W*0.42, H*0.32],  // 7
  [W*0.72, H*0.36],  // 8
  [W*0.20, H*0.40],  // 9
  // centre (avoiding the eye at H*0.5)
  [W*0.08, H*0.52],  // 10
  [W*0.88, H*0.48],  // 11
  [W*0.78, H*0.58],  // 12
  [W*0.25, H*0.60],  // 13
  // lower-mid interior
  [W*0.50, H*0.65],  // 14
  [W*0.15, H*0.70],  // 15
  [W*0.82, H*0.72],  // 16
  [W*0.38, H*0.76],  // 17
  [W*0.65, H*0.80],  // 18
  // bottom area
  [W*0.10, H*0.86],  // 19
  [W*0.35, H*0.88],  // 20
  [W*0.60, H*0.90],  // 21
  [W*0.85, H*0.87],  // 22
  [W*0.48, H*0.95],  // 23
];

// Edges that crisscross the card — diagonals, mid-jumps, not just border tracing
const edges = [
  // top cluster
  [0,3],[0,1],[1,4],[2,4],[2,5],
  // upper diagonal crosses
  [3,7],[4,7],[5,8],[6,9],[6,3],
  [7,9],[8,11],[8,5],
  // mid crosses — these cut across the centre area
  [9,13],[10,13],[10,15],[11,12],[11,8],
  [12,14],[13,14],[12,16],
  // lower diagonal crosses
  [14,17],[14,18],[15,17],[15,19],[16,18],[16,22],
  // bottom
  [17,20],[18,21],[19,20],[20,23],[21,23],[22,21],
];

ctx.save();
ctx.strokeStyle = 'rgba(201,168,76,0.20)';
ctx.lineWidth = 0.6;
for (const [a, b] of edges) {
  ctx.beginPath();
  ctx.moveTo(nodes[a][0], nodes[a][1]);
  ctx.lineTo(nodes[b][0], nodes[b][1]);
  ctx.stroke();
}
ctx.restore();
for (const [x, y] of nodes) star4(x, y, 3.0, 0.72);

// ── 5. gold glowing eye — centred, per-element glow ──────────────────────────
const eyeCX = W / 2;
const eyeCY = H / 2;
const eyeW  = 76;
const eyeH  = 32;

// Helper: draw a glowing line segment from (x1,y1) to (x2,y2)
function glowLine(x1, y1, x2, y2, glowColor, glowWidth, lineColor, lineWidth) {
  // soft glow pass
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
  // crisp line on top
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// Helper: draw a glowing arc/circle
function glowCircle(cx, cy, r, glowColor, glowWidth, lineColor, lineWidth, startA, endA) {
  const s = startA ?? 0;
  const e = endA ?? Math.PI * 2;
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, s, e);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, r, s, e);
  ctx.stroke();
  ctx.restore();
}

// Helper: draw glowing bezier path (almond eye shape)
function glowAlmond(cx, cy, ew, eh, glowColor, glowWidth, lineColor, lineWidth) {
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(cx - ew, cy);
    ctx.bezierCurveTo(cx - ew*0.4, cy - eh, cx + ew*0.4, cy - eh, cx + ew, cy);
    ctx.bezierCurveTo(cx + ew*0.4, cy + eh, cx - ew*0.4, cy + eh, cx - ew, cy);
    ctx.closePath();
  };
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;
  path(); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  path(); ctx.stroke();
  ctx.restore();
}

// Eye almond outline
glowAlmond(eyeCX, eyeCY, eyeW, eyeH,
  'rgba(201,168,76,0.35)', 5,
  'rgba(220,185,90,0.95)', 1.4);

// Iris ring
glowCircle(eyeCX, eyeCY, eyeH * 0.78,
  'rgba(201,168,76,0.35)', 4,
  'rgba(220,185,90,0.85)', 1.0);

// Pupil dot with radial glow
const pupilGlow = ctx.createRadialGradient(eyeCX, eyeCY, 0, eyeCX, eyeCY, eyeH * 0.75);
pupilGlow.addColorStop(0,   'rgba(240,200,100,0.9)');
pupilGlow.addColorStop(0.35,'rgba(201,168,76,0.55)');
pupilGlow.addColorStop(1,   'rgba(201,168,76,0)');
ctx.fillStyle = pupilGlow;
ctx.beginPath();
ctx.arc(eyeCX, eyeCY, eyeH * 0.75, 0, Math.PI * 2);
ctx.fill();

ctx.save();
ctx.fillStyle = 'rgba(230,190,80,0.95)';
ctx.shadowColor = 'rgba(201,168,76,0.9)';
ctx.shadowBlur = 6;
ctx.beginPath();
ctx.arc(eyeCX, eyeCY, eyeH * 0.30, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Lashes — each with its own glow
const lashCount = 9;
for (let i = 0; i < lashCount; i++) {
  const t     = i / (lashCount - 1);
  const angle = -Math.PI + t * Math.PI;
  const bx    = eyeCX + Math.cos(angle) * eyeW * 0.85;
  const by    = eyeCY + Math.sin(angle) * eyeH * 0.85;
  const ex    = bx + Math.cos(angle) * 14;
  const ey    = by + Math.sin(angle) * 12;
  glowLine(bx, by, ex, ey,
    'rgba(201,168,76,0.30)', 5,
    'rgba(220,185,90,0.80)', 1.2);
}

// ── 6. borders ────────────────────────────────────────────────────────────────
ctx.save();
roundedRect(4, 4, W - 8, H - 8, RADIUS - 3);
ctx.strokeStyle = 'rgba(201,168,76,0.28)';
ctx.lineWidth = 1;
ctx.stroke();

roundedRect(1, 1, W - 2, H - 2, RADIUS);
ctx.strokeStyle = 'rgba(201,168,76,0.48)';
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.restore();

const outPath = join(__dirname, '../public/card-back.png');
writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log(`Written: ${outPath}`);
