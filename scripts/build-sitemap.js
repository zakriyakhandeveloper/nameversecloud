const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const outDir = path.join(root, 'out');
const namesDir = path.join(publicDir, 'names');

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getReligionDirs() {
  return ['islamic', 'christian', 'hindu'].filter((religion) => fs.existsSync(path.join(namesDir, religion)));
}

function getSlugList(religion) {
  const religionDir = path.join(namesDir, religion);
  if (!fs.existsSync(religionDir)) return [];
  return fs
    .readdirSync(religionDir)
    .filter((entry) => entry.toLowerCase().endsWith('.json'))
    .map((entry) => entry.replace(/\.json$/i, ''))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function buildNameSitemap(religion, slugs) {
  const today = new Date().toISOString().split('T')[0];
  const urls = slugs
    .map((slug) => `  <url>\n    <loc>https://nameverse.site/names/${religion}/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildIndex() {
  const today = new Date().toISOString().split('T')[0];
  const entries = getReligionDirs()
    .map((religion) => `  <sitemap>\n    <loc>https://nameverse.site/sitemap-${religion}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

function ensureOutDir() {
  fs.mkdirSync(outDir, { recursive: true });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function main() {
  ensureOutDir();
  const religions = getReligionDirs();
  for (const religion of religions) {
    const slugs = getSlugList(religion);
    writeFile(path.join(outDir, `sitemap-${religion}.xml`), buildNameSitemap(religion, slugs));
  }
  writeFile(path.join(outDir, 'sitemap.xml'), buildIndex());
  writeFile(path.join(outDir, 'sitemap-blog.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://nameverse.site/blog</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>\n`);
  console.log(`Generated ${religions.length} sitemap files in out/.`);
}

main();
