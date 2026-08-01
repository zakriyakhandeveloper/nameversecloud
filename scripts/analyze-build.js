const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'out');

const GB = 1024 ** 3;
const MB = 1024 ** 2;
const KB = 1024;

function formatBytes(bytes) {
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

function collectFiles(dir, acc = [], relBase = dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, acc, relBase);
    } else if (entry.isFile()) {
      let size = 0;
      try {
        size = fs.statSync(fullPath).size;
      } catch {
        size = 0;
      }
      acc.push({ file: path.relative(relBase, fullPath), size, fullPath });
    }
  }
  return acc;
}

function aggregateByDir(files) {
  const dirMap = new Map();

  for (const { file, size } of files) {
    const parts = file.split(path.sep);
    for (let i = 0; i < parts.length; i++) {
      const partial = parts.slice(0, i).join('/');
      const dirKey = partial ? partial : '.';
      dirMap.set(dirKey, (dirMap.get(dirKey) || 0) + size);
    }
  }

  return dirMap;
}

function main() {
  if (!fs.existsSync(outDir)) {
    console.error(`\n[analyze-build] Output directory not found: ${outDir}`);
    console.error('[analyze-build] Run "npm run build" first.');
    process.exit(1);
  }

  const files = collectFiles(outDir);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalFiles = files.length;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  BUILD DIRECTORY SIZE REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Directory:  ${outDir}`);
  console.log(`  Files:      ${totalFiles.toLocaleString()}`);
  console.log(`  Total size: ${formatBytes(totalSize)} (${totalSize.toLocaleString()} bytes)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // ── Largest files ──
  console.log('── Top 25 Largest Files ──');
  files
    .slice()
    .sort((a, b) => b.size - a.size)
    .slice(0, 25)
    .forEach((f, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${formatBytes(f.size).padStart(10)}  ${f.file}`);
    });
  console.log('');

  // ── File count by extension ──
  console.log('── File Count by Extension ──');
  const extMap = new Map();
  for (const { file } of files) {
    const ext = path.extname(file).toLowerCase() || '(no extension)';
    extMap.set(ext, (extMap.get(ext) || 0) + 1);
  }
  const extSorted = [...extMap.entries()].sort((a, b) => b[1] - a[1]);
  const extMaxSize = Math.max(...extSorted.map(([e]) => e.length));
  extSorted.forEach(([ext, count]) => {
    const extSize = files
      .filter((f) => (path.extname(f.file).toLowerCase() || '(no extension)') === ext)
      .reduce((sum, f) => sum + f.size, 0);
    console.log(`  ${ext.padEnd(extMaxSize)}  ${count.toLocaleString().padStart(8)} files  ${formatBytes(extSize).padStart(10)}`);
  });
  console.log('');

  // ── Largest directories ──
  const dirMap = aggregateByDir(files);
  const dirEntries = [...dirMap.entries()].filter(([d]) => d !== '.');

  console.log('── Top 25 Largest Directories ──');
  dirEntries
    .slice()
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .forEach(([dir, size], i) => {
      const count = files.filter((f) => f.file.startsWith(dir + '/')).length;
      console.log(`  ${String(i + 1).padStart(2)}. ${formatBytes(size).padStart(10)}  ${count.toLocaleString().padStart(8)} files  ${dir}`);
    });
  console.log('');

  // ── Individual name detail pages ──
  const slugPages = files.filter((f) => {
    const parts = f.file.split('/');
    return (
      parts.length >= 5 &&
      parts[0] === 'names' &&
      ['islamic', 'christian', 'hindu'].includes(parts[1]) &&
      parts[3] === 'index.html' === false &&
      parts.includes('index.html')
    );
  });

  // More targeted: name detail pages are at names/{religion}/{slug}/index.html
  const detailPages = files.filter((f) => {
    const parts = f.file.split('/');
    return (
      parts.length === 4 &&
      parts[0] === 'names' &&
      ['islamic', 'christian', 'hindu'].includes(parts[1]) &&
      parts[3] === 'index.html'
    );
  });

  if (detailPages.length > 0) {
    const detailSize = detailPages.reduce((sum, f) => sum + f.size, 0);
    console.log('── Individual Name Detail Pages ──');
    console.log(`  Route: names/{religion}/{slug}/index.html`);
    console.log(`  Pages:  ${detailPages.length.toLocaleString()}`);
    console.log(`  Size:   ${formatBytes(detailSize)} (${(detailSize / totalSize * 100).toFixed(1)}% of total)`);
    console.log('');
  }

  // ── Listing / paginated pages ──
  const listingPages = files.filter((f) => {
    const parts = f.file.split('/');
    // matches names/{religion}/letter/{letter}/{page}/index.html,
    // names/religion/{religion}/{page}/index.html,
    // names/{religion}/categories/{cat}/{page}/index.html,
    // names/{religion}/origin/{origin}/{page}/index.html
    return (
      parts.length >= 5 &&
      parts[0] === 'names' &&
      parts.includes('index.html')
    );
  });

  if (listingPages.length > 0) {
    const listingSize = listingPages.reduce((sum, f) => sum + f.size, 0);
    console.log('── Paginated Listing Pages ──');
    console.log(`  Pages:  ${listingPages.length.toLocaleString()}`);
    console.log(`  Size:   ${formatBytes(listingSize)} (${(listingSize / totalSize * 100).toFixed(1)}% of total)`);
    console.log('');
  }

  // ── Public assets copied to out ──
  const dataFiles = files.filter((f) => {
    const parts = f.file.split('/');
    return parts.length === 2 && parts[0] === 'data' && parts[1].endsWith('.json');
  });

  if (dataFiles.length > 0) {
    const dataSize = dataFiles.reduce((sum, f) => sum + f.size, 0);
    console.log('── Public Data Files (out/data/) ──');
    dataFiles
      .slice()
      .sort((a, b) => b.size - a.size)
      .forEach((f) => {
        console.log(`  ${formatBytes(f.size).padStart(10)}  ${f.file}`);
      });
    console.log(`  Total: ${formatBytes(dataSize)} (${(dataSize / totalSize * 100).toFixed(1)}% of total)`);
    console.log('');
  }

  // ── Warning check ──
  if (totalSize > 1024 ** 3) {
    console.log('── ⚠  WARNING ──');
    console.log(`  Build size ${formatBytes(totalSize)} exceeds GitHub Pages 1 GB limit.`);
    console.log('  Primary cause: individual name detail pages (names/{religion}/{slug}/index.html).');
    console.log('  Consider limiting static generation to popular/top names only.');
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

main();
