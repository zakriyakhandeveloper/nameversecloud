import { groupEntries } from './src/lib/seo/sitemap-data.mjs';

const testEntries = [
  { type: 'page', path: '/' },
  { type: 'name', path: '/names/islamic/muhammad' },
  { type: 'blog', path: '/blog/post' },
];

const groups = groupEntries(testEntries);
console.log('groups keys:', Object.keys(groups));
console.log('pages:', groups.pages.length);
console.log('name:', groups.name.length);
console.log('blog:', groups.blog.length);
console.log('page types:', groups.pages.map(e => e.type));
console.log('name types:', groups.name.map(e => e.type));
