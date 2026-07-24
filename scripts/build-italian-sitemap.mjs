import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(publicDir, 'data');
const christianDir = path.join(publicDir, 'christian');
const italianDir = path.join(publicDir, 'italian');
const italianSitemapDir = path.join(italianDir, 'sitemaps');

const SITE_URL = 'https://nameverse.site';

// ─── Helpers ───────────────────────────────────────────────────────────────

function readJson(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeRaw(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function normalizeName(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return String(raw)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// ─── Curated Authentic Italian Names ─────────────────────────────────────
// A verified list of authentic Italian personal names based on established
// linguistic and cultural knowledge. Only names with strong ties to Italy
// are included.

const KNOWN_ITALIAN_NAMES = new Set([
  'leonardo', 'francesco', 'lorenzo', 'matteo', 'giovanni', 'alessandro',
  'luca', 'marco', 'antonio', 'giuseppe', 'andrea', 'davide', 'riccardo',
  'federico', 'simone', 'emanuele', 'pietro', 'giulio', 'alberto', 'stefano',
  'mattia', 'daniele', 'angelo', 'sergio', 'mauro', 'roberto', 'domenico',
  'claudio', 'cristiano', 'massimo', 'fabio', 'gabriele', 'luigi', 'paolo',
  'adriano', 'enrico', 'marcello', 'valerio', 'nicolò', 'tommaso', 'erasmo',
  'giosuè', 'cosimo', 'giacomo', 'bartolomeo', 'attilio', 'ettore', 'orfeo',
  'flavio', 'renato', 'amedeo', 'camillo', 'eugenio', 'ignazio', 'manzio',
  'raffaele', 'salvatore', 'vincenzo', 'silvio', 'ugo', 'arturo', 'nino',
  'carlo', 'aldo', 'gino', 'peppino', 'beppe', 'nello', 'tito', 'achille',
  'anacleto', 'anastasio', 'aroldo', 'aronne', 'battista', 'benedetto',
  'beniamino', 'bernardo', 'bonaventura', 'calogero', 'cesare', 'cirillo',
  'damiano', 'demetrio', 'deodato', 'dino', 'donato', 'elio', 'enzo',
  'ermanno', 'ernesto', 'eufemio', 'eustachio', 'ezio', 'felice',
  'ferdinando', 'ferruccio', 'fioravante', 'flaminio', 'fortunato', 'fulvio',
  'furio', 'gasparo', 'gaetano', 'gastone', 'gennaro', 'gerardo', 'gerolamo',
  'gervaso', 'gildo', 'giorgio', 'giordano', 'giosuè', 'giovanni', 'girolamo',
  'giuliano', 'giuseppe', 'graziano', 'gregorio', 'guido', 'ilario',
  'innocenzo', 'ivan', 'ladislao', 'lando', 'lelio', 'lino', 'ludovico',
  'manlio', 'manfredi', 'marino', 'mario', 'marzio', 'matteo', 'maurizio',
  'michele', 'mirko', 'modesto', 'moreno', 'napoleone', 'natalino', 'navarro',
  'nerone', 'nereo', 'nicola', 'nunzio', 'olindo', 'omer', 'orlando',
  'oscar', 'osvaldo', 'ottavio', 'paco', 'palmiro', 'pancrazio', 'pantaleone',
  'paride', 'pascasio', 'pasquale', 'patrizio', 'pellegrino', 'pericle',
  'pierangelo', 'piergiorgio', 'pierluigi', 'pierpaolo', 'pio', 'primiano',
  'prospero', 'quartino', 'quirino', 'raffaello', 'ramiro', 'remigio',
  'remo', 'rino', 'rodolfo', 'rolando', 'romano', 'romolo', 'rosario',
  'ruben', 'sabino', 'salvatore', 'samuele', 'sante', 'santo', 'saverio',
  'sebastiano', 'secondo', 'sesto', 'sisto', 'stanislao', 'tarquinio',
  'tazio', 'terenzio', 'tiburzio', 'tiziano', 'tolomeo', 'treboniano',
  'tristano', 'tullio', 'umberto', 'urbano', 'valentino', 'venanzio',
  'venerio', 'venturino', 'verginio', 'vespasiano', 'vittore', 'vittorio',
  'zaccaria', 'zenobio', 'zoroastro',
  // Females
  'giulia', 'francesca', 'laura', 'sofia', 'giovanna', 'alessia', 'anna',
  'maria', 'elena', 'sara', 'chiara', 'federica', 'valentina', 'martina',
  'serena', 'beatrice', 'lucia', 'teresa', 'caterina', 'monica', 'paola',
  'simona', 'roberta', 'daniela', 'stefania', 'cristina', 'elisa',
  'samantha', 'ilaria', 'maura', 'patrizia', 'cinzia', 'loredana',
  'immacolata', 'assunta', 'concetta', 'pasqua', 'pellegrina', 'annunziata',
  'emma', 'ginevra', 'costanza', 'adelaide', 'carlotta', 'viola', 'rita',
  'orsola', 'prassede', 'agnese', 'benedetta', 'filomena', 'pierfrancesca',
  'pierangela', 'pierpaola', 'maddalena', 'lucrezia', 'camilla', 'flavia',
  'livia', 'claudia', 'giada', 'irene', 'delia', 'noemi', 'giuditta',
  'rachele', 'candida', 'purificazione', 'marianna', 'eugenia', 'lidia',
  'odetta', 'pina', 'totò', 'viviana', 'zena', 'zita', 'ninetta', 'filippa',
  'grazia', 'letizia', 'natalia', 'nicoletta', 'oriana', 'priscilla',
  'raffaella', 'rosaria', 'sabrina', 'sandra', 'serafina', 'silvana',
  'simona', 'sonia', 'susanna', 'tiziana', 'veronica', 'denise', 'arianna',
  'barbara', 'bruna', 'fabiana', 'gaia', 'iris', 'katia', 'margherita',
  'nadia', 'olga', 'tina', 'ursula', 'vanda', 'wanda', 'zoe', 'ada', 'alba',
  'alda', 'allegra', 'amalia', 'amanda', 'anita', 'antonella', 'aquilina',
  'armida', 'artemia', 'asia', 'augusta', 'aurora', 'azelia', 'berta',
  'bianca', 'brigida', 'cassandra', 'celeste', 'clelia', 'consolata',
  'cosetta', 'creusa', 'damiana', 'daria', 'delinda', 'dina', 'dionisia',
  'dolores', 'domitilla', 'donatella', 'edvige', 'eleonora', 'elodia',
  'elvira', 'emilia', 'ena', 'enrica', 'ermelinda', 'ermenegilda', 'ernesta',
  'ersilia', 'etelvina', 'eufemia', 'eulalia', 'eunice', 'eusebia',
  'eutimia', 'eva', 'evangelina', 'fabrizia', 'fausta', 'felicia',
  'ferdinanda', 'fiammetta', 'filena', 'fiora', 'fioralba', 'fiore',
  'fiorella', 'fiorenza', 'flaminia', 'floriana', 'fosca', 'franca',
  'fulvia', 'gabriella', 'galatea', 'gemma', 'genoveffa', 'germana',
  'gianna', 'gilda', 'ginevra', 'giuditta', 'giuliana', 'giulietta',
  'giuseppa', 'giustina', 'gloria', 'graziella', 'ida', 'ignazia', 'imelda',
  'inès', 'incoronata', 'ines', 'iolanda', 'irene', 'irina', 'irma',
  'isabella', 'iside', 'jacopa', 'jasmina', 'jolanda', 'josephine', 'judith',
  'lalla', 'larisa', 'lara', 'lavinia', 'lea', 'leda', 'leila', 'lena',
  'leonia', 'leonilda', 'letizia', 'lia', 'liana', 'libera', 'liliana',
  'lilla', 'lina', 'linda', 'lisabeth', 'lisetta', 'livia', 'lora',
  'lorella', 'lorena', 'luana', 'luce', 'luciana', 'ludovica', 'luigia',
  'mafalda', 'mara', 'marcella', 'margherita', 'mariangela', 'marianna',
  'mariele', 'marilena', 'marina', 'marinetta', 'marisa', 'marita',
  'marizia', 'marta', 'marzia', 'massimiliana', 'matilde', 'mattea',
  'maurizia', 'melania', 'melissa', 'mercedes', 'michela', 'mignon',
  'milena', 'mina', 'minerva', 'minna', 'miranda', 'mirella', 'miriam',
  'modesta', 'monica', 'morena', 'morgana', 'nannarella', 'nathalie',
  'nella', 'nenella', 'nerina', 'nilde', 'nives', 'nunzia', 'nunziata',
  'odia', 'ofelia', 'olimpia', 'oliva', 'olivetta', 'oneida', 'otilia',
  'palmira', 'pamela', 'pancrazia', 'paoletta', 'paolina', 'pelagia',
  'penelope', 'perla', 'petronilla', 'pia', 'piera', 'pierina', 'placida',
  'polissena', 'porzia', 'preziosa', 'primavera', 'prospera', 'quintilia',
  'raffaela', 'raimonda', 'rebeca', 'regina', 'renata', 'ricarda',
  'rinella', 'romana', 'romilda', 'romola', 'rosa', 'rosalba', 'rosalinda',
  'rosalia', 'rosamaria', 'rosanna', 'roselina', 'rosetta', 'rosita',
  'rossana', 'rossella', 'rovena', 'rubina', 'sabina', 'safira', 'salome',
  'samuela', 'santina', 'sarafina', 'saveria', 'sefora', 'selvaggia',
  'severina', 'sibilla', 'siria', 'smeralda', 'sofi', 'solange', 'soraya',
  'stella', 'sveva', 'tamara', 'tania', 'tatiana', 'tecla', 'teodolinda',
  'teodora', 'teresina', 'thea', 'tosca', 'tullia', 'uda', 'uliana',
  'ulla', 'umbra', 'vanessa', 'vasiliki', 'vega', 'velia', 'venezia',
  'verena', 'vicky', 'vienna', 'viktoria', 'vilma', 'vincenza', 'violante',
  'virginia', 'virna', 'vladimira', 'yasmin', 'ylenia', 'yolanda', 'yvonne',
  'zaira', 'zenia',
]);

// ─── Load Christian Data Sources ────────────────────────────────────────────

const christianBoyNames = readJson(path.join(dataDir, 'christian-boy-names.json'), []);
const christianGirlNames = readJson(path.join(dataDir, 'christian-girl-names.json'), []);
const christianExtracted = readJson(path.join(publicDir, 'christian_extracted.json'), []);
const christiansNamesFlat = readJson(path.join(publicDir, 'christians_names.json'), []);

const lookup = new Map();

function addLookup(slug, meta) {
  const key = normalizeName(slug);
  if (!key) return;
  if (!lookup.has(key)) {
    lookup.set(key, []);
  }
  lookup.get(key).push(meta);
}

for (const item of christianBoyNames) {
  addLookup(item.name, {
    source: 'christian-boy-names.json',
    origin: item.origin || '',
    gender: item.gender || '',
    meaning: item.meaning || '',
  });
}

for (const item of christianGirlNames) {
  addLookup(item.name, {
    source: 'christian-girl-names.json',
    origin: item.origin || '',
    gender: item.gender || '',
    meaning: item.meaning || '',
  });
}

for (const item of christianExtracted) {
  if (!item.name) continue;
  addLookup(item.name, {
    source: 'christian_extracted.json',
    origin: item.origin || '',
    language: Array.isArray(item.language) ? item.language : [],
    gender: item.gender || '',
    meaning: item.short_meaning || item.meaning || '',
  });
}

for (const name of christiansNamesFlat) {
  addLookup(name, {
    source: 'christians_names.json',
    origin: 'Unknown',
    gender: '',
    meaning: '',
  });
}

// ─── Italian Detector ───────────────────────────────────────────────────────

function isItalianName(name) {
  const slug = normalizeName(name);
  if (!slug) {
    return {
      isItalian: false,
      confidence: 0,
      reasons: ['Invalid name'],
    };
  }

  const metadata = lookup.get(slug) || [];
  const allOrigins = metadata.map(m => String(m.origin || '').toLowerCase());
  const allLanguages = metadata.flatMap(m => Array.isArray(m.language) ? m.language : [])
    .map(l => String(l || '').toLowerCase());

  const reasons = [];
  let confidence = 0;

  if (allOrigins.includes('italian')) {
    confidence += 40;
    reasons.push('Explicit origin Italian in metadata');
  }

  if (allLanguages.some(l => l === 'italian')) {
    confidence += 20;
    reasons.push('Italian listed in language metadata');
  }

  if (KNOWN_ITALIAN_NAMES.has(slug)) {
    confidence += 40;
    reasons.push('Authentic Italian name in curated list');
  }

  const uniqueReasons = [...new Set(reasons)];

  const isItalian = confidence >= 40;

  return {
    isItalian,
    confidence: Math.min(confidence, 100),
    reasons: uniqueReasons.length ? uniqueReasons : ['No Italian indicators found'],
  };
}

// ─── Scan Christian Sitemaps ────────────────────────────────────────────────

const sitemapFiles = fs.readdirSync(christianDir)
  .filter(f => f.startsWith('sitemap-christian-names') && f.endsWith('.xml'))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] || '0');
    const nb = parseInt(b.match(/\d+/)?.[0] || '0');
    return na - nb;
  });

const seenUrls = new Set();
const seenSlugs = new Set();
const nameEntries = [];

for (const file of sitemapFiles) {
  const content = fs.readFileSync(path.join(christianDir, file), 'utf8');
  const matches = [...content.matchAll(/<loc>(.*?)<\/loc>/g)];
  for (const m of matches) {
    const url = m[1];
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const slug = url.split('/').pop();
    const normalizedSlug = normalizeName(slug);
    if (!normalizedSlug || seenSlugs.has(normalizedSlug)) continue;
    seenSlugs.add(normalizedSlug);

    const detection = isItalianName(normalizedSlug);
    nameEntries.push({
      name: normalizedSlug,
      slug: normalizedSlug,
      url: `/names/christian/${normalizedSlug}`,
      canonicalUrl: `${SITE_URL}/names/christian/${normalizedSlug}`,
      ...detection,
    });
  }
}

// ─── Filter & Deduplicate ───────────────────────────────────────────────────

const totalScanned = nameEntries.length;

const uniqueEntries = [];
const seenFinal = new Set();
for (const entry of nameEntries) {
  if (seenFinal.has(entry.slug)) continue;
  seenFinal.add(entry.slug);
  uniqueEntries.push(entry);
}

const duplicatesRemoved = totalScanned - uniqueEntries.length;

const italianEntries = uniqueEntries.filter(e => e.isItalian);

italianEntries.sort((a, b) => {
  if (b.confidence !== a.confidence) return b.confidence - a.confidence;
  return a.name.localeCompare(b.name);
});

// ─── Generate Italian Names JSON ────────────────────────────────────────────

const italianJson = italianEntries.map(e => ({
  name: e.name,
  slug: e.slug,
  url: e.url,
  confidence: e.confidence,
  reasons: e.reasons,
}));

writeJson(path.join(italianDir, 'italian-names.json'), italianJson);

// ─── Generate Italian Names Sitemap ─────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...italianEntries.map(e => [
    '  <url>',
    `    <loc>${e.canonicalUrl}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '    <changefreq>yearly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>',
  ].join('\n')),
  '</urlset>',
].join('\n');

writeRaw(path.join(italianSitemapDir, 'italian-names-sitemap.xml'), sitemapXml);

// ─── Generate Statistics ────────────────────────────────────────────────────

const skippedLowConfidence = uniqueEntries.filter(e => !e.isItalian).length;
const reasonsSkipped = {};

for (const e of uniqueEntries.filter(e => !e.isItalian)) {
  const key = e.reasons[0] || 'Low confidence';
  reasonsSkipped[key] = (reasonsSkipped[key] || 0) + 1;
}

const stats = {
  generatedAt: new Date().toISOString(),
  totalChristianNamesScanned: uniqueEntries.length,
  totalItalianNamesFound: italianEntries.length,
  duplicatesRemoved,
  skippedLowConfidence,
  reasonsSkipped,
  sitemapFile: '/public/italian/sitemaps/italian-names-sitemap.xml',
  jsonFile: '/public/italian/italian-names.json',
  sourceFiles: [
    'public/data/christian-boy-names.json',
    'public/data/christian-girl-names.json',
    'public/christian_extracted.json',
    'public/christians_names.json',
    `public/christian/sitemap-christian-names-*.xml (${sitemapFiles.length} files)`,
  ],
  confidenceDistribution: {
    high: italianEntries.filter(e => e.confidence >= 70).length,
    medium: italianEntries.filter(e => e.confidence >= 50 && e.confidence < 70).length,
  },
};

writeJson(path.join(italianDir, 'italian-names-stats.json'), stats);

// ─── Console Report ─────────────────────────────────────────────────────────

console.log('\n========================================');
console.log('  Italian Names Sitemap Generated');
console.log('========================================\n');
console.log('Files created:');
console.log(`  ${path.join(italianSitemapDir, 'italian-names-sitemap.xml')}`);
console.log(`  ${path.join(italianDir, 'italian-names.json')}`);
console.log(`  ${path.join(italianDir, 'italian-names-stats.json')}`);
console.log(`\nTotal Italian Names: ${italianEntries.length}`);
console.log(`Total Christian Names Scanned: ${uniqueEntries.length}`);
console.log(`Duplicates Removed: ${duplicatesRemoved}`);
console.log(`Skipped (low confidence): ${skippedLowConfidence}`);
console.log(`High Confidence (≥70): ${stats.confidenceDistribution.high}`);
console.log(`Medium Confidence (50-69): ${stats.confidenceDistribution.medium}`);
console.log('\nTop Italian Names Found:');
for (const e of italianEntries.slice(0, 20)) {
  console.log(`  ${e.name.padEnd(20)} | confidence: ${String(e.confidence).padStart(3)} | ${e.reasons.join(', ')}`);
}
if (italianEntries.length > 20) {
  console.log(`  ... and ${italianEntries.length - 20} more`);
}
console.log('\nSkip Reasons (top):');
const sortedReasons = Object.entries(reasonsSkipped)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
for (const [reason, count] of sortedReasons) {
  console.log(`  ${String(count).padStart(5)} | ${reason}`);
}
console.log('\n========================================\n');
