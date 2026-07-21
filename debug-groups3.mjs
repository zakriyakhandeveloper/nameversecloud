function groupEntries(entries) {
  const groups = { 
    pages: [], names: [], blog: [], 
    popularity: [], letter: [], origin: [], category: [], gender: [] 
  };
  for (const entry of entries) {
    if (groups[entry.type]) groups[entry.type].push(entry);
    else groups.pages.push(entry);
  }
  return groups;
}

const testEntries = [
  { type: 'page', path: '/' },
  { type: 'name', path: '/names/islamic/muhammad' },
  { type: 'blog', path: '/blog/post' },
];

const groups = groupEntries(testEntries);
console.log('pages:', groups.pages.length);
console.log('names:', groups.names.length);
console.log('blog:', groups.blog.length);
console.log('page entries:', groups.pages.map(e => e.type));
console.log('name entries:', groups.names.map(e => e.type));
