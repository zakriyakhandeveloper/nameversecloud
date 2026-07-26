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

function createSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildLocalIndex(religion) {
  const existing = LOCAL_DATA_INDEX.get(religion);
  if (existing) return existing;

  const files = LOCAL_DATA_MAP[religion] || [];
  const index = new Map();

  for (const list of files) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const nameValue = item && typeof item === 'object' ? item.name : typeof item === 'string' ? item : undefined;
      if (!nameValue) continue;

      const itemSlug = createSlug(nameValue);
      if (!itemSlug || index.has(itemSlug)) continue;

      const cleanedName = String(nameValue || '').trim().replace(/^\n+/, '');
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

      index.set(itemSlug, entry);
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
