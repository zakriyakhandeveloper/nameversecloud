// lib/seo/religion.js
/**
 * Single source of truth for religion normalization/labeling and gender
 * labeling across all SEO generators (title-generator, structured-data,
 * name-page-seo).
 *
 * WHY THIS EXISTS:
 * These helpers were previously copy-pasted into three separate files with
 * subtly different behavior:
 *  - title-generator.jsx silently coerced any unrecognized religion value
 *    to "islamic", while structured-data.jsx and name-page-seo.jsx left it
 *    as the raw value / "Cultural".
 *  - structured-data.jsx's getGender() checked "male" before "female" —
 *    and since "female" contains "male" as a substring, every girl-name
 *    page was publishing Gender: "Male" in its JSON-LD.
 *
 * That drift meant the same page could show one religion label in its
 * <title>, a different one in its meta description, and a third in its
 * schema — which search engines read as a quality/trust problem, not just
 * a cosmetic one. Import from here everywhere instead of re-implementing.
 */

export function cleanText(text = '') {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const RELIGION_LABELS = {
  islamic: { display: 'Islamic', tradition: 'Islamic', defaultOrigin: 'Arabic' },
  christian: { display: 'Christian', tradition: 'Christian', defaultOrigin: 'Biblical' },
  hindu: { display: 'Hindu', tradition: 'Hindu', defaultOrigin: 'Sanskrit' },
};

export function normalizeReligion(religion) {
  const r = String(religion || '').toLowerCase();
  if (r === 'islam' || r === 'muslim' || r === 'islamic') return 'islamic';
  if (r === 'christianity' || r === 'christian') return 'christian';
  if (r === 'hinduism' || r === 'hindu') return 'hindu';
  // Do NOT coerce unrecognized values to "islamic" (previous behavior in
  // title-generator.jsx). Leave it as the cleaned raw value so callers pick
  // an explicit, honest fallback instead of inheriting a wrong assumption.
  return r;
}

export function getReligionLabel(religion) {
  const normalized = normalizeReligion(religion);
  return RELIGION_LABELS[normalized]?.display || cleanText(religion) || 'Cultural';
}

export function getReligionDefaultOrigin(religion) {
  return RELIGION_LABELS[normalizeReligion(religion)]?.defaultOrigin || '';
}

/**
 * Gender label. IMPORTANT: "female" contains "male" as a substring, so
 * "male" must always be checked AFTER "female" and "unisex"/"neutral", or
 * every girl and unisex name gets misclassified as a boy.
 */
export function getGenderLabel(genderRaw) {
  const gender = cleanText(genderRaw).toLowerCase();
  if (gender.includes('female')) return 'Female';
  if (gender.includes('unisex') || gender.includes('neutral')) return 'Unisex';
  if (gender.includes('male')) return 'Male';
  return cleanText(genderRaw) || 'Unisex';
}

const religionUtils = {
  cleanText,
  RELIGION_LABELS,
  normalizeReligion,
  getReligionLabel,
  getReligionDefaultOrigin,
  getGenderLabel,
};

export default religionUtils;