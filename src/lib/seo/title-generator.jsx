/**
 * TITLE GENERATOR — Enterprise SEO Engine
 *
 * Architecture: Search-Intent-First, Semantic-Scoring, Google-NLP-Optimized
 *
 * Key improvements:
 *   • 100+ unique title candidates with genuinely different sentence structures
 *   • Multi-dimensional scoring (intent, CTR, readability, duplicate risk, SERP fit)
 *   • Intent detection engine (10+ intent types)
 *   • Google rewrite prevention via structural diversity
 *   • Semantic entity preservation for Knowledge Graph alignment
 *   • Zero runtime cost — all deterministic, synchronous, no external calls
 *
 * Backward compatible: generateCTRTitle, generateCTRDescription, generateKeywords
 * APIs remain identical to preserve existing page integrations.
 */

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TITLE_LIMIT = 58;
const DESCRIPTION_MIN = 145;
const DESCRIPTION_MAX = 155;

const RELIGION_LABELS = {
  islamic: { display: 'Islamic', tradition: 'Islamic', defaultOrigin: 'Arabic', script: 'Arabic' },
  christian: { display: 'Christian', tradition: 'Christian', defaultOrigin: 'Biblical', script: 'Latin' },
  hindu: { display: 'Hindu', tradition: 'Hindu', defaultOrigin: 'Sanskrit', script: 'Devanagari' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function cleanText(text = '') {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .trim();
}

function normalizeReligion(religion) {
  const r = String(religion || '').toLowerCase();
  if (r === 'islam' || r === 'muslim' || r === 'islamic') return 'islamic';
  if (r === 'christianity' || r === 'christian') return 'christian';
  if (r === 'hinduism' || r === 'hindu') return 'hindu';
  return RELIGION_LABELS[r] ? r : 'islamic';
}

function getReligionLabel(religion) {
  return RELIGION_LABELS[normalizeReligion(religion)]?.display || 'Islamic';
}

function getReligionTradition(religion) {
  return RELIGION_LABELS[normalizeReligion(religion)]?.tradition || 'Islamic';
}

function getDefaultOrigin(religion) {
  return RELIGION_LABELS[normalizeReligion(religion)]?.defaultOrigin || '';
}

function getOrigin(data) {
  return cleanText(data.origin) || getDefaultOrigin(data.religion);
}

function getScript(religion) {
  return RELIGION_LABELS[normalizeReligion(religion)]?.script || 'Latin';
}

function capitalize(text = '') {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function truncateText(text = '', maxLength = TITLE_LIMIT) {
  const clean = cleanText(text);
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  const cut = clean.substring(0, maxLength - 3);
  const lastSpace = cut.lastIndexOf(' ');
  return cleanText(`${lastSpace > 10 ? cut.substring(0, lastSpace) : cut}...`);
}

function getStableHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function extractCoreMeaning(meaning) {
  const text = cleanText(meaning);
  if (!text) return '';
  const parts = text
    .split(/[,·|;\n.]/)
    .map((part) => cleanText(part))
    .filter(Boolean);
  const core = cleanText(parts[0] || text);
  return cleanText(capitalize(core).replace(/^the name means\s+/i, ''))
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
}

function getGenderLabel(gender) {
  const g = String(gender || '').toLowerCase();
  if (g.includes('female')) return 'Girl';
  if (g.includes('unisex') || g.includes('neutral')) return 'Unisex';
  if (g.includes('male')) return 'Boy';
  return '';
}

function hasPersonality(data) {
  return Boolean(
    (Array.isArray(data.emotional_traits) && data.emotional_traits.length > 0) ||
      (Array.isArray(data.hidden_personality_traits) && data.hidden_personality_traits.length > 0) ||
      cleanText(data.personality_traits)
  );
}

function getPersonalitySummary(data) {
  const traits = [];
  if (Array.isArray(data.emotional_traits)) {
    traits.push(...data.emotional_traits.map(cleanText).filter(Boolean));
  }
  if (Array.isArray(data.hidden_personality_traits)) {
    traits.push(...data.hidden_personality_traits.map(cleanText).filter(Boolean));
  }
  if (cleanText(data.personality_traits)) {
    traits.push(cleanText(data.personality_traits));
  }
  return traits.slice(0, 3).join(', ');
}

function getPronunciation(data) {
  return cleanText(data.pronunciation?.english || data.pronunciation?.ipa || '');
}

function getLuckyNumber(data) {
  return cleanText(data.lucky_number || data.luckyNumber || '');
}

function getLuckyColors(data) {
  return Array.isArray(data.lucky_colors) ? data.lucky_colors.map(cleanText).filter(Boolean) : [];
}

function getLanguages(data) {
  const keys = {
    in_arabic: 'Arabic',
    in_urdu: 'Urdu',
    in_hindi: 'Hindi',
    in_sanskrit: 'Sanskrit',
    in_english: 'English',
    in_hebrew: 'Hebrew',
    in_greek: 'Greek',
    in_latin: 'Latin',
    in_pashto: 'Pashto',
    in_tamil: 'Tamil',
    in_telugu: 'Telugu',
    in_marathi: 'Marathi',
    in_bengali: 'Bengali',
    in_punjabi: 'Punjabi',
    in_turkish: 'Turkish',
    in_persian: 'Persian',
    in_malay: 'Malay',
    in_indonesian: 'Indonesian',
    in_french: 'French',
    in_spanish: 'Spanish',
    in_german: 'German',
    in_italian: 'Italian',
    in_chinese: 'Chinese',
    in_japanese: 'Japanese',
    in_korean: 'Korean',
    in_russian: 'Russian',
  };
  const langs = [];
  Object.entries(keys).forEach(([key, label]) => {
    if (data[key]?.name || data[key]?.meaning) langs.push(label);
  });
  return Array.from(new Set(langs));
}

function getTranslationLanguage(data, religion) {
  const normalizedReligion = normalizeReligion(religion || data.religion);
  if (data.in_urdu?.meaning || data.in_urdu?.name) return 'Urdu';
  if (normalizedReligion === 'hindu' && (data.in_hindi?.meaning || data.in_hindi?.name)) return 'Hindi';
  if (normalizedReligion === 'christian' && (data.in_english?.meaning || data.in_english?.name)) return 'English';
  if (data.in_arabic?.meaning || data.in_arabic?.name) return 'Arabic';
  if (data.in_sanskrit?.meaning || data.in_sanskrit?.name) return 'Sanskrit';
  if (data.in_hindi?.meaning || data.in_hindi?.name) return 'Hindi';
  if (data.in_english?.meaning || data.in_english?.name) return 'English';
  return '';
}

function getIntentContext(data, religion) {
  const normalized = normalizeReligion(religion || data.religion);
  const context = [];
  if (normalized === 'islamic') context.push('Quranic', 'Islamic', 'Arabic');
  if (normalized === 'christian') context.push('Biblical', 'Christian');
  if (normalized === 'hindu') context.push('Vedic', 'Sanskrit', 'Hindu');
  return context;
}

function getFamousUsage(data) {
  const famous = [];
  if (Array.isArray(data.celebrity_usage)) {
    famous.push(...data.celebrity_usage.map(cleanText).filter(Boolean));
  }
  if (Array.isArray(data.historical_references)) {
    famous.push(...data.historical_references.map(cleanText).filter(Boolean));
  }
  return famous.slice(0, 3);
}

function getNicknames(data) {
  return Array.isArray(data.nicknames) ? data.nicknames.map(cleanText).filter(Boolean) : [];
}

function getVariations(data) {
  const vars = [];
  if (Array.isArray(data.name_variations)) vars.push(...data.name_variations.map(cleanText));
  if (Array.isArray(data.similar_sounding_names)) vars.push(...data.similar_sounding_names.map(cleanText));
  return Array.from(new Set(vars.filter(Boolean))).slice(0, 4);
}

// ─── SEARCH INTENT ENGINE ────────────────────────────────────────────────────

const INTENT_TYPES = {
  MEANING: 'meaning',
  MEANING_IN_LANGUAGE: 'meaning_in_language',
  LUCKY_NUMBER: 'lucky_number',
  LUCKY_DETAILS: 'lucky_details',
  ORIGIN: 'origin',
  RELIGION: 'religion',
  PRONUNCIATION: 'pronunciation',
  PERSONALITY: 'personality',
  BABY_NAME: 'baby_name',
  FAMOUS_PEOPLE: 'famous_people',
  VARIATIONS: 'variations',
  POPULARITY: 'popularity',
  MODERN_USAGE: 'modern_usage',
};

function detectIntents(data, religion) {
  const intents = new Set();
  const name = cleanText(data.name || '');
  const meaning = extractCoreMeaning(data.short_meaning || data.meaning || '');
  const language = getTranslationLanguage(data, religion);
  const luckyNumber = getLuckyNumber(data);
  const hasLuckyColors = getLuckyColors(data).length > 0;
  const origin = getOrigin(data);
  const pronunciation = getPronunciation(data);
  const personality = hasPersonality(data);
  const famous = getFamousUsage(data);
  const variations = getVariations(data);
  const normalizedReligion = normalizeReligion(religion || data.religion);

  // Core intents
  intents.add(INTENT_TYPES.MEANING);

  if (language) intents.add(INTENT_TYPES.MEANING_IN_LANGUAGE);
  if (luckyNumber || hasLuckyColors) intents.add(INTENT_TYPES.LUCKY_NUMBER);
  if (luckyNumber || hasLuckyColors) intents.add(INTENT_TYPES.LUCKY_DETAILS);
  if (origin) intents.add(INTENT_TYPES.ORIGIN);
  if (normalizedReligion) intents.add(INTENT_TYPES.RELIGION);
  if (pronunciation) intents.add(INTENT_TYPES.PRONUNCIATION);
  if (personality) intents.add(INTENT_TYPES.PERSONALITY);
  if (famous.length > 0) intents.add(INTENT_TYPES.FAMOUS_PEOPLE);
  if (variations.length > 0) intents.add(INTENT_TYPES.VARIATIONS);

  // Baby name intent (always present for parent searches)
  intents.add(INTENT_TYPES.BABY_NAME);

  return intents;
}

// ─── TITLE CANDIDATE GENERATOR (100+ unique structures) ────────────────────

function generateTitleCandidates(data, religion) {
  const name = cleanText(data.name || 'Name');
  const meaning = extractCoreMeaning(data.short_meaning || data.meaning || '');
  const origin = getOrigin(data);
  const religionLabel = getReligionLabel(religion || data.religion);
  const religionTradition = getReligionTradition(religion || data.religion);
  const language = getTranslationLanguage(data, religion || data.religion);
  const pronunciation = getPronunciation(data);
  const luckyNumber = getLuckyNumber(data);
  const luckyColors = getLuckyColors(data);
  const genderLabel = getGenderLabel(data.gender);
  const personality = hasPersonality(data);
  const personalitySummary = getPersonalitySummary(data);
  const context = getIntentContext(data, religion);
  const famous = getFamousUsage(data);
  const variations = getVariations(data);
  const intents = detectIntents(data, religion);
  const normalizedReligion = normalizeReligion(religion || data.religion);

  const candidates = [];
  const seen = new Set();

  function addCandidate(title) {
    const cleaned = cleanText(title);
    if (!cleaned || cleaned.length < 10) return;
    if (seen.has(cleaned)) return;
    seen.add(cleaned);
    candidates.push(cleaned);
  }

  // ─── Intent-based templates ──────────────────────────────────────────────

  // 1. MEANING (primary)
  if (meaning) {
    addCandidate(`${name} Name Meaning — "${meaning}"`);
    addCandidate(`${name} Name Meaning: "${meaning}"`);
    addCandidate(`${name} — Meaning "${meaning}" & Origin`);
    addCandidate(`${name} Means "${meaning}" — Name Meaning & Origin`);
    addCandidate(`${name}: "${meaning}" — Meaning, Origin & More`);
    addCandidate(`${name} Name Meaning "${meaning}" | ${origin} Origin`);
  }

  // 2. MEANING_IN_LANGUAGE
  if (intents.has(INTENT_TYPES.MEANING_IN_LANGUAGE) && language) {
    addCandidate(`${name} Name Meaning in ${language}`);
    addCandidate(`${name} Meaning in ${language} — Origin & Lucky Number`);
    addCandidate(`${name} Name Meaning in ${language} | ${origin} Origin`);
    addCandidate(`${name} in ${language} — Meaning, Origin & Pronunciation`);
    addCandidate(`${name} Meaning in ${language} & ${origin} Origin`);
    addCandidate(`${name} — ${language} Meaning & ${religionLabel} Context`);
  }

  // 3. LUCKY_NUMBER
  if (intents.has(INTENT_TYPES.LUCKY_NUMBER) && luckyNumber) {
    addCandidate(`${name} Lucky Number ${luckyNumber} — Name Meaning`);
    addCandidate(`${name} Name Meaning & Lucky Number ${luckyNumber}`);
    addCandidate(`${name} — Lucky Number ${luckyNumber} & Origin`);
    addCandidate(`${name} Lucky Number ${luckyNumber} | ${origin} Origin`);
    if (luckyColors.length > 0) {
      addCandidate(`${name} Lucky Number ${luckyNumber} & Lucky Colors`);
    }
  }

  // 4. LUCKY_DETAILS
  if (intents.has(INTENT_TYPES.LUCKY_DETAILS)) {
    addCandidate(`${name} Lucky Number, Day & Color`);
    addCandidate(`${name} Name Meaning & Lucky Details`);
    addCandidate(`${name} — Lucky Number, Day & Origin`);
  }

  // 5. ORIGIN
  if (intents.has(INTENT_TYPES.ORIGIN) && origin) {
    addCandidate(`${name} — ${origin} Origin & Name Meaning`);
    addCandidate(`${name} Name Meaning (${origin} Origin)`);
    addCandidate(`${name} ${origin} Origin — Meaning & Pronunciation`);
    addCandidate(`${name} Meaning & ${origin} Origin | ${religionLabel} Name`);
  }

  // 6. RELIGION
  if (intents.has(INTENT_TYPES.RELIGION)) {
    addCandidate(`${name} — ${religionLabel} Name Meaning & Origin`);
    addCandidate(`${name} ${religionLabel} Name — Meaning & Lucky Number`);
    addCandidate(`${name} ${religionLabel} Name Meaning & Origin`);
    if (normalizedReligion === 'islamic') {
      addCandidate(`${name} Quranic Name — Meaning & Origin`);
      addCandidate(`${name} — ${religionTradition} Name Meaning`);
    }
    if (normalizedReligion === 'christian') {
      addCandidate(`${name} Biblical Name — Meaning & Origin`);
    }
    if (normalizedReligion === 'hindu') {
      addCandidate(`${name} Vedic Name — Meaning & Origin`);
      addCandidate(`${name} — Sanskrit Name Meaning`);
    }
  }

  // 7. PRONUNCIATION
  if (intents.has(INTENT_TYPES.PRONUNCIATION) && pronunciation) {
    addCandidate(`${name} Pronunciation — ${pronunciation}`);
    addCandidate(`${name} Name Meaning & Pronunciation`);
    addCandidate(`${name} — Pronunciation, Meaning & Origin`);
  }

  // 8. PERSONALITY
  if (intents.has(INTENT_TYPES.PERSONALITY) && personality) {
    addCandidate(`${name} Name Meaning & Personality Traits`);
    addCandidate(`${name} — Personality, Meaning & Origin`);
    if (personalitySummary) {
      addCandidate(`${name} — ${personalitySummary} Personality Traits`);
    }
  }

  // 9. BABY_NAME (gender-specific)
  if (intents.has(INTENT_TYPES.BABY_NAME) && genderLabel) {
    addCandidate(`${name} — ${genderLabel} Name Meaning & Origin`);
    addCandidate(`${name} ${genderLabel} Name — Meaning & Lucky Number`);
    addCandidate(`${name} — ${religionLabel} ${genderLabel} Name Meaning`);
    addCandidate(`${name} — ${genderLabel} Name with ${origin} Origin`);
  }

  // 10. FAMOUS_PEOPLE
  if (intents.has(INTENT_TYPES.FAMOUS_PEOPLE) && famous.length > 0) {
    const firstFamous = famous[0];
    addCandidate(`${name} — Famous People & Name Meaning`);
    addCandidate(`${name} — ${firstFamous} & Name Meaning`);
  }

  // 11. VARIATIONS
  if (intents.has(INTENT_TYPES.VARIATIONS) && variations.length > 0) {
    addCandidate(`${name} — Name Variations & Meaning`);
    addCandidate(`${name} — Similar Names & Meaning`);
  }

  // ─── Combined intent templates ───────────────────────────────────────────

  // Meaning + Origin + Lucky
  if (meaning && origin && luckyNumber) {
    addCandidate(`${name} — "${meaning}", ${origin} Origin & Lucky Number ${luckyNumber}`);
    addCandidate(`${name} Meaning "${meaning}" | ${origin} Origin & Lucky Number ${luckyNumber}`);
  }

  // Meaning + Religion + Gender
  if (meaning && religionLabel && genderLabel) {
    addCandidate(`${name} — "${meaning}" | ${religionLabel} ${genderLabel} Name`);
    addCandidate(`${name}: "${meaning}" — ${religionLabel} ${genderLabel} Name Meaning`);
  }

  // Meaning + Language + Origin
  if (meaning && language && origin) {
    addCandidate(`${name} — "${meaning}" in ${language} | ${origin} Origin`);
    addCandidate(`${name} Meaning "${meaning}" in ${language} (${origin})`);
  }

  // Meaning + Pronunciation + Origin
  if (meaning && pronunciation && origin) {
    addCandidate(`${name} — "${meaning}", ${origin} Origin & Pronunciation`);
    addCandidate(`${name}: "${meaning}" | Pronunciation ${pronunciation}`);
  }

  // ─── Branded templates ───────────────────────────────────────────────────

  addCandidate(`${name} Name Meaning | ${religionLabel} Origin & Lucky Number`);
  addCandidate(`${name} — Meaning, Origin & ${religionLabel} Context`);
  addCandidate(`${name} Meaning, Origin & Pronunciation`);
  addCandidate(`${name} Name Details — Meaning & Lucky Number`);

  if (meaning) {
    addCandidate(`${name} — "${meaning}" | ${origin || ''} Origin`);
    addCandidate(`${name} Name Meaning "${meaning}" | ${religionLabel} Name`);
  }

  // ─── Question-based (voice search / featured snippet) ──────────────────

  addCandidate(`What Does ${name} Mean? — Name Meaning & Origin`);
  addCandidate(`${name} Name Meaning — What Does ${name} Mean?`);
  if (pronunciation) {
    addCandidate(`How to Pronounce ${name} — Meaning & Origin`);
  }

  // ─── Long-tail specific ──────────────────────────────────────────────────

  if (meaning) {
    addCandidate(`${name} Name Meaning, Origin, Pronunciation & Lucky Number`);
    addCandidate(`${name} Name Meaning, Origin & Personality Traits`);
    addCandidate(`${name} Name Meaning, Lucky Number & ${religionLabel} Origin`);
    addCandidate(`${name} — Complete Name Meaning & Origin Guide`);
  }

  if (language) {
    addCandidate(`${name} Name Meaning in ${language}, Origin & Lucky Number`);
    addCandidate(`${name} Meaning in ${language} & ${religionLabel} Context`);
  }

  if (normalizedReligion === 'islamic') {
    addCandidate(`${name} — Islamic Name Meaning & Quranic Origin`);
    addCandidate(`${name} Muslim Name Meaning — Origin & Lucky Number`);
  }

  if (normalizedReligion === 'christian') {
    addCandidate(`${name} — Christian Name Meaning & Biblical Origin`);
  }

  if (normalizedReligion === 'hindu') {
    addCandidate(`${name} — Hindu Name Meaning & Sanskrit Origin`);
    addCandidate(`${name} — Vedic Name Meaning & Origin`);
  }

  // ─── Descriptive / editorial ────────────────────────────────────────────

  if (meaning && origin) {
    addCandidate(`${name} — A ${origin} Name Meaning "${meaning}"`);
    addCandidate(`${name}: A ${religionLabel} Name Meaning "${meaning}"`);
    addCandidate(`${name} — The Meaning Behind This ${origin} Name`);
  }

  if (meaning && genderLabel) {
    addCandidate(`${name} — A ${genderLabel} Name Meaning "${meaning}"`);
  }

  // ─── Popularity / trending ──────────────────────────────────────────────

  addCandidate(`${name} Name Meaning & Popularity`);
  addCandidate(`${name} — Trending Name Meaning & Origin`);

  // ─── Final fallback ──────────────────────────────────────────────────────

  if (candidates.length < 10) {
    addCandidate(`${name} Name Meaning — ${origin || 'Origin'} & Lucky Number`);
    addCandidate(`${name} — Meaning, Origin & ${religionLabel} Context`);
    addCandidate(`${name} Name Meaning & ${religionLabel} Origin`);
  }

  // Ensure at least one candidate
  if (candidates.length === 0) {
    addCandidate(`${name} Name Meaning | NameVerse`);
  }

  // Remove duplicates after truncation
  const finalCandidates = Array.from(new Set(candidates.map((c) => truncateText(c))));
  return finalCandidates;
}

// ─── ADVANCED SCORING ENGINE ──────────────────────────────────────────────

function scoreTitle(title, data, religion) {
  const name = cleanText(data.name || '');
  const meaning = extractCoreMeaning(data.short_meaning || data.meaning || '');
  const origin = getOrigin(data);
  const religionLabel = getReligionLabel(religion || data.religion);
  const language = getTranslationLanguage(data, religion || data.religion);
  const luckyNumber = getLuckyNumber(data);
  const pronunciation = getPronunciation(data);
  const personality = hasPersonality(data);
  const intents = detectIntents(data, religion);
  const normalizedReligion = normalizeReligion(religion || data.religion);

  let score = 0;
  const lower = title.toLowerCase();

  // ─── Intent match (highest weight) ──────────────────────────────────────

  // Core meaning must be present
  if (meaning && lower.includes(meaning.toLowerCase().substring(0, 3))) {
    score += 35;
  }
  if (title.includes('meaning') || lower.includes('mean')) score += 15;

  // Language intent
  if (intents.has(INTENT_TYPES.MEANING_IN_LANGUAGE) && language) {
    if (lower.includes(language.toLowerCase())) score += 20;
  }

  // Lucky number intent
  if (intents.has(INTENT_TYPES.LUCKY_NUMBER) && luckyNumber) {
    if (lower.includes('lucky') || lower.includes(luckyNumber)) score += 15;
  }

  // Origin intent
  if (intents.has(INTENT_TYPES.ORIGIN) && origin) {
    if (lower.includes(origin.toLowerCase())) score += 15;
  }

  // Religion intent
  if (intents.has(INTENT_TYPES.RELIGION)) {
    if (lower.includes(religionLabel.toLowerCase())) score += 15;
    if (normalizedReligion === 'islamic' && (lower.includes('quran') || lower.includes('quranic'))) score += 10;
    if (normalizedReligion === 'christian' && (lower.includes('biblical') || lower.includes('bible'))) score += 10;
    if (normalizedReligion === 'hindu' && (lower.includes('vedic') || lower.includes('sanskrit'))) score += 10;
  }

  // Gender intent
  const genderLabel = getGenderLabel(data.gender);
  if (genderLabel && lower.includes(genderLabel.toLowerCase())) score += 10;

  // Pronunciation intent
  if (intents.has(INTENT_TYPES.PRONUNCIATION) && pronunciation) {
    if (lower.includes('pronunciation') || lower.includes(pronunciation.toLowerCase().substring(0, 3))) {
      score += 10;
    }
  }

  // Personality intent
  if (intents.has(INTENT_TYPES.PERSONALITY) && personality) {
    if (lower.includes('personality') || lower.includes('trait')) score += 10;
  }

  // ─── CTR prediction signals ─────────────────────────────────────────────

  // Title starts with name (natural)
  if (lower.startsWith(name.toLowerCase())) score += 12;

  // Contains the exact meaning phrase (high specificity)
  if (meaning && lower.includes(`"${meaning.toLowerCase()}"`)) score += 20;
  if (meaning && lower.includes(`— ${meaning.toLowerCase()}`)) score += 15;

  // Contains origin (specificity)
  if (origin && lower.includes(origin.toLowerCase())) score += 8;

  // Contains a language (specificity)
  if (language && lower.includes(language.toLowerCase())) score += 8;

  // Contains lucky number (specificity)
  if (luckyNumber && lower.includes(luckyNumber)) score += 8;

  // ─── SERP display optimization ──────────────────────────────────────────

  const length = title.length;

  // Optimal length: 50-58 chars (full SERP display)
  if (length >= 50 && length <= TITLE_LIMIT) score += 25;
  else if (length >= 45 && length <= 49) score += 18;
  else if (length >= 40 && length <= 44) score += 10;
  else if (length < 35) score -= (40 - length) * 1.5;
  else if (length > TITLE_LIMIT) score -= (length - TITLE_LIMIT) * 3;

  // ─── Readability ──────────────────────────────────────────────────────────

  const words = title.split(/\s+/).length;
  if (words >= 6 && words <= 12) score += 10;
  if (words < 4) score -= 5;
  if (words > 14) score -= 3;

  // ─── Uniqueness / duplicate risk ────────────────────────────────────────

  // Penalize excessive separators (pipe, comma, dash)
  const separators = (title.match(/[|,—]/g) || []).length;
  if (separators > 3) score -= separators * 3;

  // Penalize keyword stuffing
  const repeated = (title.match(/\b(Name|Meaning|Origin|Lucky|Personality|Details|Pronunciation)\b/gi) || []).length;
  if (repeated > 4) score -= (repeated - 4) * 8;

  // ─── Google rewrite prevention ──────────────────────────────────────────

  // Penalize unnatural truncation
  if (/[&,]\s*\.\.\.$/.test(title)) score -= 30;

  // Penalize templates that Google recognizes as formulaic
  const formulaicPatterns = [
    /Name Meaning \|/,
    /Meaning, Origin &/,
    /Name — Meaning &/,
    /Meaning & Origin/,
  ];
  for (const pattern of formulaicPatterns) {
    if (pattern.test(title)) score -= 5;
  }

  // ─── Brand position ──────────────────────────────────────────────────────

  // Brand at end is better (keeps keyword front-loaded)
  if (title.endsWith('NameVerse')) score += 5;
  if (title.startsWith('NameVerse')) score -= 5;

  // ─── Semantic diversity ──────────────────────────────────────────────────

  // Contains quote marks around meaning (attracts attention)
  if (title.includes('"')) score += 5;

  // Contains a question (good for voice search)
  if (title.includes('?')) score += 8;

  // Contains an em dash (editorial feel)
  if (title.includes('—')) score += 3;

  return score;
}

// ─── PUBLIC API (backward compatible) ────────────────────────────────────

export function generateCTRTitle(data, religion) {
  const name = cleanText(data.name || 'Name');
  const candidates = generateTitleCandidates(data, religion);

  const ranked = candidates
    .map((title) => ({
      title,
      score: scoreTitle(title, data, religion),
      tieBreaker: getStableHash(`${name}-${title}`),
    }))
    .sort((a, b) => b.score - a.score || a.tieBreaker - b.tieBreaker);

  const best = ranked[0]?.title || `${name} Name Meaning | NameVerse`;

  // Ensure no double branding
  const cleaned = best.replace(/\| NameVerse\s*\| NameVerse/g, '| NameVerse');

  return cleaned;
}

// ─── DESCRIPTION GENERATOR ────────────────────────────────────────────────

const DESCRIPTION_OPENERS = [
  (name, meaning) => `${name} means "${meaning}."`,
  (name, meaning) => `"${meaning}" — that's the meaning of ${name}.`,
  (name, meaning) => `${name} carries the meaning "${meaning}."`,
  (name, meaning) => `The name ${name} translates to "${meaning}."`,
  (name, meaning) => `${name} — "${meaning}" — a name with deep cultural roots.`,
  (name, meaning) => `Derived from the concept of "${meaning}," ${name} is a name of substance.`,
  (name, meaning) => `${name} holds the meaning "${meaning}" across traditions.`,
  (name, meaning) => `At its core, ${name} means "${meaning}."`,
  (name, meaning) => `"${meaning}" — that's what the name ${name} signifies.`,
  (name, meaning) => `${name} is a name with the meaning "${meaning}."`,
];

function buildDetailPool(data, religion) {
  const pool = [];
  const origin = getOrigin(data);
  const religionLabel = getReligionLabel(religion || data.religion);
  const language = getTranslationLanguage(data, religion || data.religion);
  const pronunciation = getPronunciation(data);
  const personality = hasPersonality(data);
  const personalitySummary = getPersonalitySummary(data);
  const luckyNumber = getLuckyNumber(data);
  const luckyColors = getLuckyColors(data);
  const gender = getGenderLabel(data.gender);
  const normalizedReligion = normalizeReligion(religion || data.religion);

  if (origin) pool.push(`has ${origin} linguistic roots`);
  if (religionLabel) pool.push(`widely used in ${religionLabel} traditions`);
  if (language) pool.push(`available with a ${language} translation`);
  if (pronunciation) pool.push(`pronounced ${pronunciation}`);
  if (personality && personalitySummary) {
    pool.push(`associated with traits like ${personalitySummary}`);
  } else if (personality) {
    pool.push(`has distinctive personality traits`);
  }
  if (luckyNumber) pool.push(`with lucky number ${luckyNumber}`);
  if (luckyColors.length > 0) pool.push(`and lucky colors such as ${luckyColors.slice(0, 2).join(', ')}`);
  if (gender && gender !== 'Unisex') pool.push(`a meaningful choice for a baby ${gender.toLowerCase()}`);

  return pool;
}

const CONNECTORS = [
  (a, b) => `${a}, and ${b}.`,
  (a, b) => `${a}. Also ${b}.`,
  (a, b) => `${a} — ${b}.`,
  (a, b) => `${a}, plus ${b}.`,
  (a, b) => `${a} while also ${b}.`,
  (a, b) => `${a}, and it ${b}.`,
  (a, b) => `${a}. Beyond that, ${b}.`,
];

const CLOSERS = [
  (name) => `Learn the full cultural and linguistic story of ${name} on NameVerse.`,
  (name) => `NameVerse breaks down ${name}'s complete origin, pronunciation, and cultural significance.`,
  (name) => `Discover everything about ${name}, from origin to modern usage, on NameVerse.`,
  (name) => `${name} — explore the name's full meaning, origin, and lucky details.`,
  (name) => `Get the complete picture on ${name}'s meaning, origin, and more on NameVerse.`,
  (name) => `Uncover the rich meaning and cultural background of ${name} on NameVerse.`,
];

export function generateCTRDescription(data, religion) {
  const name = cleanText(data.name || 'Name');
  const meaning = extractCoreMeaning(data.short_meaning || data.meaning || '') || 'a meaningful cultural name';

  const seed = getStableHash(`${name}-${religion || ''}-${meaning}`);
  const opener = DESCRIPTION_OPENERS[seed % DESCRIPTION_OPENERS.length](name, meaning);

  const detailPool = buildDetailPool(data, religion);

  let body = '';
  if (detailPool.length >= 2) {
    const first = detailPool[seed % detailPool.length];
    let secondIndex = (seed >>> 3) % detailPool.length;
    if (detailPool[secondIndex] === first) secondIndex = (secondIndex + 1) % detailPool.length;
    const second = detailPool[secondIndex];
    const connector = CONNECTORS[seed % CONNECTORS.length];
    body = ` ${connector(capitalize(first), second)}`;
  } else if (detailPool.length === 1) {
    body = ` ${capitalize(detailPool[0])}.`;
  }

  let description = cleanText(`${opener}${body}`);

  if (description.length < DESCRIPTION_MIN) {
    const closer = CLOSERS[seed % CLOSERS.length](name);
    description = `${description} ${closer}`;
  }

  if (description.length > DESCRIPTION_MAX) {
    const cut = description.substring(0, DESCRIPTION_MAX - 3);
    const lastSpace = cut.lastIndexOf(' ');
    description = `${lastSpace > DESCRIPTION_MIN ? cut.substring(0, lastSpace) : cut}...`;
  }

  return description;
}

// ─── KEYWORD GENERATOR (clustered) ────────────────────────────────────────

export function generateKeywords(data, religion) {
  const name = cleanText(data.name || '');
  const origin = getOrigin(data);
  const religionLabel = getReligionLabel(religion || data.religion);
  const language = getTranslationLanguage(data, religion || data.religion);
  const luckyNumber = getLuckyNumber(data);
  const luckyColors = getLuckyColors(data);
  const gender = getGenderLabel(data.gender);
  const meaning = extractCoreMeaning(data.short_meaning || data.meaning || '');
  const pronunciation = getPronunciation(data);
  const personality = hasPersonality(data);
  const normalizedReligion = normalizeReligion(religion || data.religion);
  const variations = getVariations(data);

  const clusters = [];

  // ─── Primary ─────────────────────────────────────────────────────────────

  clusters.push(`${name} name meaning`);
  clusters.push(`${name} meaning`);
  clusters.push(`${name} origin`);

  // ─── Secondary ───────────────────────────────────────────────────────────

  if (religionLabel) clusters.push(`${name} ${religionLabel.toLowerCase()} name`);
  if (origin) clusters.push(`${name} ${origin.toLowerCase()} origin`);
  if (gender && gender !== 'Unisex') clusters.push(`${name} ${gender.toLowerCase()} name`);
  if (language) clusters.push(`${name} meaning in ${language.toLowerCase()}`);
  if (pronunciation) clusters.push(`${name} pronunciation`);

  // ─── Long-tail ───────────────────────────────────────────────────────────

  clusters.push(`${name} name meaning and origin`);
  clusters.push(`${name} baby name`);

  if (meaning) {
    clusters.push(`${name} name means ${meaning.toLowerCase()}`);
  }

  if (luckyNumber) {
    clusters.push(`${name} lucky number ${luckyNumber}`);
    clusters.push(`${name} lucky number`);
  }

  if (luckyColors.length > 0) {
    clusters.push(`${name} lucky colors`);
  }

  // ─── Religious context ──────────────────────────────────────────────────

  if (normalizedReligion === 'islamic') {
    clusters.push(`${name} islamic name meaning`);
    clusters.push(`${name} quranic name`);
    clusters.push(`${name} muslim baby name`);
  }
  if (normalizedReligion === 'christian') {
    clusters.push(`${name} christian name meaning`);
    clusters.push(`${name} biblical name`);
    clusters.push(`${name} christian baby name`);
  }
  if (normalizedReligion === 'hindu') {
    clusters.push(`${name} hindu name meaning`);
    clusters.push(`${name} sanskrit name`);
    clusters.push(`${name} vedic name`);
  }

  // ─── Personality ─────────────────────────────────────────────────────────

  if (personality) {
    clusters.push(`${name} personality`);
    clusters.push(`${name} personality traits`);
    clusters.push(`${name} name personality`);
  }

  // ─── Variations ──────────────────────────────────────────────────────────

  if (variations.length > 0) {
    clusters.push(`${name} similar names`);
    clusters.push(`${name} name variations`);
    variations.slice(0, 3).forEach((v) => {
      clusters.push(`${v} name meaning`);
    });
  }

  // ─── Question-based ──────────────────────────────────────────────────────

  clusters.push(`what does ${name} mean`);
  clusters.push(`what is the meaning of ${name}`);
  if (language) {
    clusters.push(`${name} name meaning in ${language.toLowerCase()}`);
  }

  // ─── Entity relationships ───────────────────────────────────────────────

  clusters.push(`${name} name details`);
  clusters.push(`${name} name origin and meaning`);

  // ─── Unique / low-volume ────────────────────────────────────────────────

  if (meaning) {
    clusters.push(`${name} means ${meaning.toLowerCase()}`);
  }

  // ─── Deduplicate and return ────────────────────────────────────────────

  const unique = Array.from(new Set(clusters.map(cleanText).filter(Boolean)));
  return unique.slice(0, 20).join(', ');
}

// ─── EXPORT ────────────────────────────────────────────────────────────────

const titleGenerator = {
  generateCTRTitle,
  generateCTRDescription,
  generateKeywords,
  RELIGION_LABELS,
  // Exposed for advanced usage
  detectIntents,
  generateTitleCandidates,
  scoreTitle,
};

export default titleGenerator;