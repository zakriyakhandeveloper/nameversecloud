import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const URL_REGEX = /<loc>(.*?)<\/loc>/g;

// Check top sitemaps
const topFiles = ['top_islamic_sitemap.xml', 'top_hindu_sitemap.xml', 'top_christian_sitemap.xml'];
const newUrls = new Map();

// First load all new religion folder URLs
for (const religion of ['islamic', 'hindu', 'christian']) {
  const dir = path.join(publicDir, religion);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('sitemap-') && f.endsWith('.xml'));
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    let match;
    while ((match = URL_REGEX.exec(content)) !== null) {
      if (!newUrls.has(match[1])) newUrls.set(match[1], []);
      newUrls.get(match[1]).push(`${religion}/${f}`);
    }
  }
}

console.log(`Total URLs in new religion folders: ${newUrls.size}`);

for (const topFile of topFiles) {
  const fp = path.join(publicDir, topFile);
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, 'utf8');
  const urls = new Set();
  let match;
  while ((match = URL_REGEX.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  let overlaps = 0;
  for (const url of urls) {
    if (newUrls.has(url)) overlaps++;
  }
  
  console.log(`${topFile}: ${urls.size} URLs, ${overlaps} overlap with new folders (${Math.round(overlaps/urls.size*100)}%)`);
}
