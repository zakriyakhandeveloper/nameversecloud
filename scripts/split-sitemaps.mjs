import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const religions = [
  { key: 'islamic', files: ['sitemap-islamic-names.xml', 'sitemap-islamic-names-1.xml', 'sitemap-islamic-names-2.xml', 'sitemap-islamic-names-3.xml', 'sitemap-islamic-names-4.xml', 'sitemap-islamic-names-5.xml', 'sitemap-islamic-names-6.xml', 'sitemap-islamic-names-7.xml', 'sitemap-islamic-names-8.xml'] },
  { key: 'hindu', files: ['sitemap-hindu-names.xml', 'sitemap-hindu-names-1.xml', 'sitemap-hindu-names-2.xml', 'sitemap-hindu-names-3.xml', 'sitemap-hindu-names-4.xml', 'sitemap-hindu-names-5.xml'] },
  { key: 'christian', files: ['sitemap-christian-names.xml', 'sitemap-christian-names-1.xml', 'sitemap-christian-names-2.xml', 'sitemap-christian-names-3.xml', 'sitemap-christian-names-4.xml', 'sitemap-christian-names-5.xml', 'sitemap-christian-names-6.xml'] },
];

const URL_REGEX = /<url>([\s\S]*?)<\/url>/g;
const LOC_REGEX = /<loc>(.*?)<\/loc>/;
const LASTMOD_REGEX = /<lastmod>(.*?)<\/lastmod>/;
const CHANGEFREQ_REGEX = /<changefreq>(.*?)<\/changefreq>/;
const PRIORITY_REGEX = /<priority>(.*?)<\/priority>/;

const CHUNK_SIZE = 50;
const SITE_URL = 'https://nameverse.site';

for (const religion of religions) {
  const outDir = path.join(publicDir, religion.key);
  fs.mkdirSync(outDir, { recursive: true });

  const allEntries = [];

  for (const file of religion.files) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = URL_REGEX.exec(content)) !== null) {
      const urlBlock = match[1];
      const loc = LOC_REGEX.exec(urlBlock)?.[1];
      const lastmod = LASTMOD_REGEX.exec(urlBlock)?.[1];
      const changefreq = CHANGEFREQ_REGEX.exec(urlBlock)?.[1];
      const priority = PRIORITY_REGEX.exec(urlBlock)?.[1];
      if (loc) {
        allEntries.push({ loc, lastmod: lastmod || '2026-07-21', changefreq: changefreq || 'weekly', priority: priority || '0.6' });
      }
    }
  }

  console.log(`[split] ${religion.key}: ${allEntries.length} total URLs`);

  const chunks = [];
  for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
    chunks.push(allEntries.slice(i, i + CHUNK_SIZE));
  }

  const writtenFiles = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const fileNum = i + 1;
    const fileName = chunks.length === 1 ? `sitemap-${religion.key}-names.xml` : `sitemap-${religion.key}-names-${fileNum}.xml`;
    const filePath = path.join(outDir, fileName);
    const urlsXml = chunks[i].map((entry) => `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`;
    fs.writeFileSync(filePath, xml);
    writtenFiles.push(`/${religion.key}/${fileName}`);
    console.log(`[split] Wrote ${filePath} (${chunks[i].length} URLs)`);
  }

  console.log(`[split] ${religion.key}: ${writtenFiles.length} sitemap files written`);
}
