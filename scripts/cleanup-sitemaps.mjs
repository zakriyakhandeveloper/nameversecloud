import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const SITE_URL = 'https://nameverse.site';

const filesToRemove = [
  'sitemap-islamic-names.xml',
  'sitemap-islamic-names-1.xml', 'sitemap-islamic-names-2.xml', 'sitemap-islamic-names-3.xml',
  'sitemap-islamic-names-4.xml', 'sitemap-islamic-names-5.xml', 'sitemap-islamic-names-6.xml',
  'sitemap-islamic-names-7.xml', 'sitemap-islamic-names-8.xml',
  'sitemap-hindu-names.xml',
  'sitemap-hindu-names-1.xml', 'sitemap-hindu-names-2.xml', 'sitemap-hindu-names-3.xml',
  'sitemap-hindu-names-4.xml', 'sitemap-hindu-names-5.xml',
  'sitemap-christian-names.xml',
  'sitemap-christian-names-1.xml', 'sitemap-christian-names-2.xml', 'sitemap-christian-names-3.xml',
  'sitemap-christian-names-4.xml', 'sitemap-christian-names-5.xml', 'sitemap-christian-names-6.xml',
  'top_islamic_sitemap.xml',
  'top_hindu_sitemap.xml',
  'top_christian_sitemap.xml',
];

for (const file of filesToRemove) {
  const fp = path.join(publicDir, file);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log(`Removed: ${file}`);
  }
}

const today = new Date().toISOString().split('T')[0];
const indexEntries = [];

const existingSitemaps = [
  'sitemap-pages.xml',
  'sitemap-blog.xml',
  'sitemap-popularity.xml',
  'sitemap-letter.xml',
  'sitemap-origin.xml',
  'sitemap-category.xml',
  'sitemap-gender.xml',
];

for (const f of existingSitemaps) {
  indexEntries.push(`  <sitemap>
    <loc>${SITE_URL}/${f}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
}

for (const religion of ['islamic', 'hindu', 'christian']) {
  const dir = path.join(publicDir, religion);
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('sitemap-') && f.endsWith('.xml') && f !== 'sitemap-index.xml')
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  
  const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map(f => `  <sitemap>
    <loc>${SITE_URL}/${religion}/${f}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`;
  
  const indexPath = path.join(dir, 'sitemap-index.xml');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Created: ${religion}/sitemap-index.xml (${files.length} sitemaps)`);
  
  indexEntries.push(`  <sitemap>
    <loc>${SITE_URL}/${religion}/sitemap-index.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
}

const newSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>
`;

const mainSitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(mainSitemapPath, newSitemapXml);
console.log('Updated: sitemap.xml');

console.log('\nDone!');
