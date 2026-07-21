import { loadMixedNames, groupEntries } from './src/lib/seo/sitemap-data.mjs';

const allNames = loadMixedNames();
const entries = [];
const seen = new Set();

for (const name of allNames) {
  if (!name.slug || !name.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) continue;
  const clean = `/names/${name.religion}/${name.slug}`;
  if (seen.has(clean)) continue;
  seen.add(clean);
  entries.push({
    loc: `https://nameverse.site${clean}`,
    lastmod: '2026-07-21',
    changefreq: 'weekly',
    priority: 0.8,
    type: 'name',
    path: clean,
  });
}

const groups = groupEntries(entries);
console.log('names count:', groups.names?.length);
console.log('pages count:', groups.pages?.length);
console.log('total entries:', entries.length);
console.log('first 3 names:', groups.names?.slice(0,3).map(x => x.path));
