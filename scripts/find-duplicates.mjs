import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');

const URL_REGEX = /<loc>(.*?)<\/loc>/g;

const filesToCheck = [];

// Old files in public root
const oldPatterns = [
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
];

for (const pattern of oldPatterns) {
  const fp = path.join(publicDir, pattern);
  if (fs.existsSync(fp)) {
    filesToCheck.push(fp);
  }
}

const allUrls = new Map(); // url -> [filepaths]

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8');
  const urls = new Set();
  let match;
  while ((match = URL_REGEX.exec(content)) !== null) {
    urls.add(match[1]);
  }
  
  const relative = path.relative(publicDir, file);
  console.log(`${relative}: ${urls.size} URLs`);
  
  for (const url of urls) {
    if (!allUrls.has(url)) allUrls.set(url, []);
    allUrls.get(url).push(relative);
  }
}

// Find duplicates
let duplicateCount = 0;
const duplicates = [];
for (const [url, files] of allUrls.entries()) {
  if (files.length > 1) {
    duplicateCount++;
    if (duplicates.length < 10) {
      duplicates.push({ url, files });
    }
  }
}

console.log(`\nTotal unique URLs: ${allUrls.size}`);
console.log(`URLs appearing in multiple files: ${duplicateCount}`);

if (duplicates.length > 0) {
  console.log('\nFirst 10 duplicates:');
  for (const d of duplicates) {
    console.log(`  ${d.url}`);
    console.log(`    in: ${d.files.join(', ')}`);
  }
}

// Check for overlaps between old root files and new religion folder files
const newReligionFiles = [];
for (const religion of ['islamic', 'hindu', 'christian']) {
  const dir = path.join(publicDir, religion);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('sitemap-') && f.endsWith('.xml'));
    for (const f of files) {
      newReligionFiles.push(path.join(dir, f));
    }
  }
}

console.log(`\nNew religion folder files: ${newReligionFiles.length}`);

const newUrls = new Map();
for (const file of newReligionFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = URL_REGEX.exec(content)) !== null) {
    if (!newUrls.has(match[1])) newUrls.set(match[1], []);
    newUrls.get(match[1]).push(path.relative(publicDir, file));
  }
}

let overlapCount = 0;
for (const [url, oldFiles] of allUrls.entries()) {
  if (newUrls.has(url)) {
    overlapCount++;
  }
}

console.log(`Overlap between old root files and new religion files: ${overlapCount}`);
