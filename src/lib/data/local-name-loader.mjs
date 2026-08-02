import { findLocalNameData, getLocalNameList, getAllLocalNameSlugs, getBuildStaticNameSlugs as getBoundStaticNameSlugs } from './local-name-data.mjs';

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];

function normalizeReligion(religion) {
  if (!religion || typeof religion !== 'string') return null;
  const normalized = religion.toLowerCase().trim();
  if (normalized === 'islam' || normalized === 'muslim') return 'islamic';
  if (normalized === 'christianity') return 'christian';
  if (normalized === 'hinduism') return 'hindu';
  return VALID_RELIGIONS.includes(normalized) ? normalized : null;
}

function normalizeSlug(slug) {
  return String(slug || '').trim().toLowerCase().replace(/\.json$/i, '');
}

function ensureRecordShape(religion, record) {
  if (!record || typeof record !== 'object') return null;
  const normalizedRecord = { ...record };
  if (!normalizedRecord.religion) normalizedRecord.religion = normalizeReligion(religion);
  if (!normalizedRecord.updatedAt && !normalizedRecord.updated_at) {
    normalizedRecord.updatedAt = new Date().toISOString();
  }
  return normalizedRecord;
}

export function readNameData(religion, slug) {
  const normalizedReligion = normalizeReligion(religion);
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedReligion || !normalizedSlug) return null;

  const record = findLocalNameData(normalizedReligion, normalizedSlug);
  if (!record) return null;

  return ensureRecordShape(normalizedReligion, record);
}

export function getNameSlugs(religion) {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  return getAllLocalNameSlugs(normalizedReligion)
    .map((slug) => normalizeSlug(slug))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getBuildStaticNameSlugs(religion, limit) {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  return getBoundStaticNameSlugs(normalizedReligion, limit)
    .map((slug) => normalizeSlug(slug))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getNameList(religion, limit = 8, excludeSlug = '') {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  return getLocalNameList(normalizedReligion, limit, excludeSlug).map((item) => ({
    name: String(item.name),
    slug: item.slug,
    religion: normalizedReligion,
    updatedAt: null,
  }));
}

export function getNameEntries(religion) {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  return getNameSlugs(normalizedReligion)
    .map((slug) => {
      const record = readNameData(normalizedReligion, slug);
      if (!record?.name) return null;
      return {
        name: String(record.name),
        slug,
        religion: normalizedReligion,
        data: record,
      };
    })
    .filter(Boolean);
}

export function filterKnownSlugs(religion, names, limit = 12) {
  if (!Array.isArray(names) || !names.length) return [];
  const seen = new Set();
  const unique = [];

  for (const name of names) {
    if (typeof name !== 'string') continue;
    const slug = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    unique.push({ name, slug });
    if (unique.length >= limit) break;
  }

  return unique
    .map((item) => {
      const record = readNameData(religion, item.slug);
      return record ? item.name : null;
    })
    .filter(Boolean);
}
