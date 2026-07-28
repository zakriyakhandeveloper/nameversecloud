import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');
const PUBLIC_NAMES_ROOT = path.join(projectRoot, 'public', 'names');
const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];

function normalizeReligion(religion) {
  if (!religion || typeof religion !== 'string') return null;
  const normalized = religion.toLowerCase().trim();
  if (normalized === 'islam' || normalized === 'muslim') return 'islamic';
  if (normalized === 'christianity') return 'christian';
  if (normalized === 'hinduism') return 'hindu';
  return VALID_RELIGIONS.includes(normalized) ? normalized : null;
}

function getReligionDir(religion) {
  const normalized = normalizeReligion(religion);
  if (!normalized) return null;
  return path.join(PUBLIC_NAMES_ROOT, normalized);
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

  const filePath = path.join(getReligionDir(normalizedReligion), `${normalizedSlug}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const payload = parsed?.data ?? parsed;
    return ensureRecordShape(normalizedReligion, payload);
  } catch {
    return null;
  }
}

export function getNameSlugs(religion) {
  const religionDir = getReligionDir(religion);
  if (!religionDir || !fs.existsSync(religionDir)) return [];

  return fs
    .readdirSync(religionDir)
    .filter((entry) => entry.toLowerCase().endsWith('.json'))
    .map((entry) => normalizeSlug(entry))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getNameList(religion, limit = 8, excludeSlug = '') {
  const normalizedReligion = normalizeReligion(religion);
  if (!normalizedReligion) return [];

  const slugs = getNameSlugs(normalizedReligion);
  const list = [];
  for (const slug of slugs) {
    if (slug === excludeSlug) continue;
    const record = readNameData(normalizedReligion, slug);
    if (!record?.name) continue;
    list.push({ name: String(record.name), slug, religion: normalizedReligion, updatedAt: record.updatedAt || record.updated_at || null });
    if (list.length >= limit) break;
  }
  return list;
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
