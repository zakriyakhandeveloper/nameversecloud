import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const religions = [
  { key: 'hindu', file: 'sitemap-hindu-names.xml', out: 'older_hindu_sitemap.xml' },
  { key: 'islamic', file: 'sitemap-islamic-names.xml', out: 'older_islamic_sitemap.xml' },
  { key: 'christian', file: 'sitemap-christian-names.xml', out: 'older_christian_sitemap.xml' },
];

for (const rel of religions) {
  const srcPath = path.join(publicDir, rel.file);
  const outPath = path.join(publicDir, rel.out);
  const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
  const header = lines.slice(0, 2).join('\n');
  let count = 0;
  const bodyLines = [];
  for (let i = 2; i < lines.length && count < 50; i++) {
    bodyLines.push(lines[i]);
    if (lines[i].trim() === '</url>') count++;
  }
  const content = `${header}\n${bodyLines.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(outPath, content);
  console.log(`Wrote ${outPath} with ${count} URLs`);
}
