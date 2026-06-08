const https = require('https');
const fs = require('fs');
const path = require('path');

const CARDS_API = 'https://tarotapi.dev/api/v1/cards';
const IMG_SRC = path.join(__dirname, '../tarot-cards/rider-waite/Cards-png');
const IMG_DEST = path.join(__dirname, '../public/cards');
const DATA_DEST = path.join(__dirname, '../src/data/cards.json');

// Maps API name_short → source image filename (no extension)
// Major arcana: API uses ar00-ar21, images use 00-TheFool.png etc.
// Minor arcana: API uses e.g. waac, wa02...wa10, wapa, wakn, waqu, waki
//               Images use Wands01.png...Wands14.png (ace=01, 2-10=02-10, page=11, knight=12, queen=13, king=14)
const SUIT_PREFIX = { wands: 'Wands', cups: 'Cups', pentacles: 'Pentacles', swords: 'Swords' };

// Major arcana image filenames in order (value_int 0-21)
const MAJOR_IMAGES = [
  '00-TheFool',
  '01-TheMagician',
  '02-TheHighPriestess',
  '03-TheEmpress',
  '04-TheEmperor',
  '05-TheHierophant',
  '06-TheLovers',
  '07-TheChariot',
  '08-Strength',
  '09-TheHermit',
  '10-WheelOfFortune',
  '11-Justice',
  '12-TheHangedMan',
  '13-Death',
  '14-Temperance',
  '15-TheDevil',
  '16-TheTower',
  '17-TheStar',
  '18-TheMoon',
  '19-TheSun',
  '20-Judgement',
  '21-TheWorld',
];

function getSourceImageName(card) {
  if (card.type === 'major') {
    return MAJOR_IMAGES[card.value_int];
  }
  // Minor arcana: map value_int (1-14) to padded number
  const suit = SUIT_PREFIX[card.suit];
  const num = String(card.value_int).padStart(2, '0');
  return `${suit}${num}`;
}

function extractKeywords(meaningUp) {
  const first = meaningUp.split(/[.;]/)[0];
  return first
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(IMG_DEST, { recursive: true });
  fs.mkdirSync(path.dirname(DATA_DEST), { recursive: true });

  console.log('Fetching cards from tarotapi.dev...');
  const { cards } = await fetch(CARDS_API);
  console.log(`Got ${cards.length} cards`);

  const transformed = cards
    .map(card => {
      const srcName = getSourceImageName(card);
      const srcPath = path.join(IMG_SRC, `${srcName}.png`);
      const destPath = path.join(IMG_DEST, `${card.name_short}.png`);

      if (!fs.existsSync(srcPath)) {
        console.warn(`  MISSING: ${srcPath}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }

      return {
        id: card.value_int,
        name_short: card.name_short,
        name: card.name,
        arcana: card.type === 'major' ? 'major' : 'minor',
        suit: card.suit || null,
        value_int: card.value_int,
        keywords: extractKeywords(card.meaning_up),
        meaning_up: card.meaning_up,
        meaning_rev: card.meaning_rev,
        desc: card.desc,
      };
    })
    .sort((a, b) => {
      // Sort: major first (0-21) then minor by suit order then value
      if (a.arcana !== b.arcana) return a.arcana === 'major' ? -1 : 1;
      if (a.arcana === 'major') return a.value_int - b.value_int;
      const suitOrder = ['wands', 'cups', 'pentacles', 'swords'];
      const si = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      return si !== 0 ? si : a.value_int - b.value_int;
    });

  // Re-assign sequential id 0-77 after sort
  transformed.forEach((c, i) => { c.id = i; });

  fs.writeFileSync(DATA_DEST, JSON.stringify(transformed, null, 2));
  console.log(`\nWrote ${transformed.length} cards to ${DATA_DEST}`);
  console.log(`Copied images to ${IMG_DEST}`);
  console.log('\nFirst 3 cards:');
  transformed.slice(0, 3).forEach(c => console.log(`  ${c.id} ${c.name_short} — ${c.name}`));
}

main().catch(err => { console.error(err); process.exit(1); });
