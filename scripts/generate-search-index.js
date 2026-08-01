const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const namesDir = path.join(publicDir, 'names');

const religions = ['islamic', 'hindu', 'christian'];

function readReligion(religion) {
  const dir = path.join(namesDir, religion);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.json'));
  const out = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
       const json = JSON.parse(raw);
       const payload = json && typeof json === 'object' && 'data' in json ? json.data : json;
       const name = (
         payload?.name || payload?.na || payload?.title ||
         json?.name || json?.na || json?.title || ''
       ).toString();
       if (!name) continue;
       out.push({
         name: name,
         slug: payload?.slug || '',
         short_meaning: payload?.short_meaning || payload?.meaning || '',
         meaning: payload?.meaning || payload?.short_meaning || '',
         origin: payload?.origin || payload?.origins || '',
         gender: payload?.gender || '',
         language: payload?.language || '',
         category: payload?.category || '',
       });
    } catch (e) {
      // ignore malformed
    }
  }
  return out;
}

function main() {
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  for (const r of religions) {
    const arr = readReligion(r);
    const outPath = path.join(publicDir, `${r}_extracted.json`);
    fs.writeFileSync(outPath, JSON.stringify(arr, null, 2), 'utf8');
    console.log(`Wrote ${outPath} (${arr.length} items)`);
  }
}

main();
