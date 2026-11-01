// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver...). Run after a prod deploy: npm run indexnow
// The key file public/d46b03ac84583bfa1092b18032b5533f.txt must be live at https://vesper.cards/d46b03ac84583bfa1092b18032b5533f.txt first.
const HOST = "vesper.cards";
const KEY = "d46b03ac84583bfa1092b18032b5533f";
const SITEMAP = `https://${HOST}/sitemap.xml`;
const BATCH = 10000;

async function locs(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const xml = await res.text();
  const found = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  if (/<sitemapindex[\s>]/.test(xml)) {
    const out = [];
    for (const child of found) out.push(...(await locs(child, seen)));
    return out;
  }
  return found;
}

const urls = [...new Set(await locs(SITEMAP))].filter((u) => new URL(u).host === HOST);
console.log(`${urls.length} URLs from ${SITEMAP}`);
let failed = false;
for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(`batch ${i / BATCH + 1}: ${urlList.length} URLs -> HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  if (res.status !== 200 && res.status !== 202) failed = true;
}
process.exit(failed ? 1 : 0);
