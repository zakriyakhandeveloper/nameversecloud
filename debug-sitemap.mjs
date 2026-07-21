import { buildSitemapEntries, groupEntries } from './src/lib/seo/sitemap-data.mjs';

const result = await buildSitemapEntries();
const groups = groupEntries(result.entries);
console.log('names count:', groups.names?.length);
console.log('pages count:', groups.pages?.length);
console.log('blog count:', groups.blog?.length);
console.log('popularity count:', groups.popularity?.length);
console.log('letter count:', groups.letter?.length);
console.log('origin count:', groups.origin?.length);
console.log('category count:', groups.category?.length);
console.log('gender count:', groups.gender?.length);
console.log('total:', result.entries.length);
console.log('first 3 names:', groups.names?.slice(0,3).map(x => x.path));
