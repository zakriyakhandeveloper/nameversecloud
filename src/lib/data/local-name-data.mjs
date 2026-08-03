import fs from 'node:fs';
import path from 'node:path';

let islamicBoyNames;
let islamicGirlNames;
let islamicMixedNames;
let christianBoyNames;
let christianGirlNames;
let hinduBoyNames;
let hinduGirlNames;

const __isNode = typeof process !== 'undefined' && !!process.versions?.node;

if (__isNode) {
  const { createRequire } = await import('module');
  const req = createRequire(import.meta.url);
  try {
    islamicBoyNames = req('../../../public/data/islamic-boy-names.json');
    islamicGirlNames = req('../../../public/data/islamic-girl-names.json');
    islamicMixedNames = req('../../../public/islamic_names.json');
    christianBoyNames = req('../../../public/data/christian-boy-names.json');
    christianGirlNames = req('../../../public/data/christian-girl-names.json');
    hinduBoyNames = req('../../../public/data/hindu-boy-names.json');
    hinduGirlNames = req('../../../public/data/hindu-girl-names.json');
  } catch (e) {
    // fall through to dynamic import below if require fails
  }
}

if (!islamicBoyNames) {
  const t1 = await import('../../../public/data/islamic-boy-names.json', { assert: { type: 'json' } });
  const t2 = await import('../../../public/data/islamic-girl-names.json', { assert: { type: 'json' } });
  const t3 = await import('../../../public/islamic_names.json', { assert: { type: 'json' } });
  const t4 = await import('../../../public/data/christian-boy-names.json', { assert: { type: 'json' } });
  const t5 = await import('../../../public/data/christian-girl-names.json', { assert: { type: 'json' } });
  const t6 = await import('../../../public/data/hindu-boy-names.json', { assert: { type: 'json' } });
  const t7 = await import('../../../public/data/hindu-girl-names.json', { assert: { type: 'json' } });
  islamicBoyNames = t1?.default ?? t1;
  islamicGirlNames = t2?.default ?? t2;
  islamicMixedNames = t3?.default ?? t3;
  christianBoyNames = t4?.default ?? t4;
  christianGirlNames = t5?.default ?? t5;
  hinduBoyNames = t6?.default ?? t6;
  hinduGirlNames = t7?.default ?? t7;
}

const LOCAL_DATA_MAP = {
  islamic: [islamicBoyNames, islamicGirlNames, islamicMixedNames],
  christian: [christianBoyNames, christianGirlNames],
  hindu: [hinduBoyNames, hinduGirlNames],
};

const LOCAL_DATA_INDEX = new Map();
const DEFAULT_STATIC_NAME_LIMIT = 1000;
const HYBRID_BUILD_LIMIT = Number.parseInt(process.env.NEXT_STATIC_NAME_LIMIT || process.env.NEXT_PUBLIC_STATIC_NAME_LIMIT || String(DEFAULT_STATIC_NAME_LIMIT), 10);

function normalizeReligion(religion) {
  if (!religion || typeof religion !== 'string') return null;
  const normalized = religion.toLowerCase().trim();
  if (normalized === 'islam' || normalized === 'muslim') return 'islamic';
  if (normalized === 'christianity') return 'christian';
  if (normalized === 'hinduism') return 'hindu';
  return ['islamic', 'christian', 'hindu'].includes(normalized) ? normalized : null;
}

export function getBuildStaticNameSlugs(religion, limit = HYBRID_BUILD_LIMIT) {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  const slugs = getAllLocalNameSlugs(normalizedReligion)
    .map((slug) => normalizeSlug(slug))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (!Number.isFinite(limit) || limit <= 0) return slugs;
  return slugs.slice(0, Math.min(limit, slugs.length));
}

function normalizeSlug(value) {
  return String(value || '').trim().toLowerCase().replace(/\.json$/i, '');
}

function createSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeNameEntry(religion, slug, item) {
  const nameValue = item && typeof item === 'object' ? item.name : typeof item === 'string' ? item : undefined;
  if (!nameValue) return null;

  const cleanedName = String(nameValue || '').trim().replace(/^\n+/, '');
  const itemSlug = createSlug(slug || nameValue);
  if (!itemSlug) return null;

  const entry = {
    name: cleanedName,
    religion,
    slug: itemSlug,
  };

  if (item && typeof item === 'object') {
    entry.lucky_number = item.luckyNumber;
    entry.short_meaning = item.meaning;
    Object.assign(entry, item);
  }

  return entry;
}

function readPublicNameDirectory(religion) {
  if (!__isNode) return [];

  const dirPath = path.join(process.cwd(), 'public', 'names', religion);
  if (!fs.existsSync(dirPath)) return [];

  const records = [];
  for (const fileName of fs.readdirSync(dirPath)) {
    if (!fileName.endsWith('.json') || fileName.startsWith('_')) continue;
    const filePath = path.join(dirPath, fileName);
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const payload = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
      if (!payload || typeof payload !== 'object') continue;

      const slug = createSlug(payload.slug || path.basename(fileName, '.json'));
      if (!slug) continue;

      const entry = normalizeNameEntry(religion, slug, payload);
      if (entry) records.push(entry);
    } catch (error) {
      // Some JSON files in the export are partial or malformed; ignore them rather than breaking static generation.
    }
  }

  return records;
}

function buildLocalIndex(religion) {
  const existing = LOCAL_DATA_INDEX.get(religion);
  if (existing) return existing;

  const index = new Map();
  const publicEntries = readPublicNameDirectory(religion);

  for (const entry of publicEntries) {
    if (!entry?.slug) continue;
    index.set(entry.slug, entry);
  }

  const files = LOCAL_DATA_MAP[religion] || [];
  for (const list of files) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const entry = normalizeNameEntry(religion, null, item);
      if (!entry || index.has(entry.slug)) continue;
      index.set(entry.slug, entry);
    }
  }

  LOCAL_DATA_INDEX.set(religion, index);
  return index;
}

export function findLocalNameData(religion, slug) {
  const targetSlug = createSlug(slug);
  if (!targetSlug) return null;

  const index = buildLocalIndex(religion);
  const found = index.get(targetSlug);
  return found || null;
}

export function getLocalNameList(religion, limit = 8, excludeSlug = '') {
  const index = buildLocalIndex(religion);
  const seen = new Set();
  const names = [];

  for (const [slug, item] of index.entries()) {
    if (!item?.name) continue;
    if (!slug || slug === excludeSlug || seen.has(slug)) continue;

    seen.add(slug);
    names.push({ name: item.name, slug });
    if (names.length >= limit) return names;
  }

  return names;
}

export function getAllLocalNameSlugs(religion) {
  const index = buildLocalIndex(religion);
  return Array.from(index.keys());
}

// Pre-build indices for all known religion datasets at module initialization
for (const religion of Object.keys(LOCAL_DATA_MAP)) {
  try {
    buildLocalIndex(religion);
  } catch (e) {
    // swallow: if a dataset is missing or malformed, we don't want initialization to throw
    // runtime will still attempt to build lazily on first lookup
  }
}
