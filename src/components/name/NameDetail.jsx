/**
 * Name Detail — Premium Editorial Redesign
 *
 * All business logic, SEO, structured data, routing, and data mapping
 * are preserved exactly as before. Only visual styles (JSX + Tailwind)
 * have been upgraded for a modern, premium, and highly performant UI.
 *
 * Uses nv-tokens.css design system. Mobile-first; 88% traffic mobile.
 */

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Volume2,
  Globe,
  BookOpen,
  Shield,
  Heart,
  Hash,
  Calendar,
  Users,
} from 'lucide-react';
import ShareButtons from './ShareButtons';
import KnowledgeGraph from './KnowledgeGraph';
import SectionHeading from './SectionHeading';
import SitePage from '@/components/Layout/SitePage';
import { createSlug, isValidSlug } from '@/lib/seo/url-builder';

// ── Helpers (unchanged) ──

function cleanText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getReligionLabel(religion) {
  const r = cleanText(religion).toLowerCase();
  if (r === 'islamic') return 'Islamic';
  if (r === 'christian') return 'Christian';
  if (r === 'hindu') return 'Hindu';
  return cleanText(religion);
}

function getGenderLabel(gender) {
  const value = cleanText(gender).toLowerCase();
  if (value.includes('female')) return 'Girl';
  if (value.includes('male')) return 'Boy';
  if (value.includes('unisex') || value.includes('neutral')) return 'Unisex';
  return cleanText(gender) || 'Baby';
}

function getGenderPath(religion, gender) {
  const value = cleanText(gender).toLowerCase();
  if (value.includes('male')) return `/${religion}/boy-names`;
  if (value.includes('female')) return `/${religion}/girl-names`;
  return null;
}

function normalizeTrendingName(name, religion) {
  const label = cleanText(typeof name === 'object' ? name.name : name);
  if (!label) return null;
  const slug = cleanText(typeof name === 'object' ? name.slug : '') || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug || slug.length < 2) return null;
  return { name: label, slug };
}

// ── Hero ──

function NameHero({ data, pageUrl }) {
  const religion = cleanText(data.religion || 'islamic').toLowerCase();
  const religionDisplay = getReligionLabel(religion);
  const genderDisplay = getGenderLabel(data.gender);
  const subtitleMeaning = data.short_meaning || data.meaning || 'Meaningful cultural name';
  const pronunciation = data.pronunciation?.english || data.pronunciation?.ipa || '';
  const h1Label = [religionDisplay, genderDisplay, data.origin].filter(Boolean).join(' ');

  const infoItems = [
    { label: 'Name', value: data.name },
    { label: 'Meaning', value: subtitleMeaning },
    { label: 'Origin', value: data.origin },
    { label: 'Religion', value: religionDisplay },
    { label: 'Gender', value: genderDisplay },
    { label: 'Pronunciation', value: pronunciation || 'Not listed' },
    { label: 'Lucky Number', value: data.lucky_number || data.luckyNumber || 'Not listed' },
  ].filter((item) => cleanText(item.value));

  const statItems = [
    (data.lucky_number || data.luckyNumber) && { label: 'Lucky Number', value: data.lucky_number || data.luckyNumber, icon: Hash },
    data.lucky_day && { label: 'Lucky Day', value: data.lucky_day, icon: Calendar },
    data.gender && { label: 'Gender', value: genderDisplay, icon: Heart },
  ].filter(Boolean);

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-[color:var(--nv-surface-elevated)] p-6 shadow-[0_12px_48px_-12px_var(--nv-shadow)] sm:p-8 lg:p-10"
      aria-label={`${data.name} name meaning, origin, pronunciation and lucky number`}
    >
      {/* Soft editorial gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(14,165,164,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(79,70,229,0.10),transparent_44%),radial-gradient(circle_at_30%_90%,rgba(245,158,11,0.12),transparent_46%)]" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--nv-surface-inverse)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--nv-on-inverse)]">
            <BookOpen className="h-4 w-4" /> {religionDisplay} Name Meaning & Origin Guide
          </div>
          <div className="relative mt-6">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-[color:var(--nv-ink)] sm:text-6xl lg:text-7xl xl:text-8xl">
              {data.name}
            </h1>
            <span className="pointer-events-none absolute -right-2 -top-8 hidden text-[14rem] font-black leading-none opacity-[0.03] select-none sm:block" aria-hidden="true">
              {data.name.charAt(0)}
            </span>
          </div>
          {h1Label && (
            <p className="mt-3 text-sm font-normal text-[color:var(--nv-muted)] sm:text-base">
              {h1Label} name meaning
            </p>
          )}
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--nv-ink)] sm:text-xl">
            {subtitleMeaning}
          </p>
          {pronunciation && (
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[color:var(--nv-muted)]">
              <Volume2 className="h-4 w-4 text-[color:var(--nv-accent-2)]" />
              <span className="font-semibold text-[color:var(--nv-ink)]">Pronunciation:</span> {pronunciation}
            </p>
          )}
        </div>

        {/* ShareButtons — scrolls normally on mobile, no sticky */}
        <div className="w-full shrink-0 lg:w-[280px]">
          <div className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <ShareButtons
              name={data.name}
              pageUrl={pageUrl}
              description={`${data.name} name meaning, ${data.origin || 'origin'}, pronunciation, lucky number and ${religionDisplay.toLowerCase()} context.`}
            />
          </div>
        </div>
      </div>

      {/* Info stats — premium cards */}
      <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)]/70 p-4 transition hover:-translate-y-1 hover:border-[color:var(--nv-accent-2)]/30 hover:shadow-md"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">
              {item.label}
            </div>
            <div className="mt-1.5 break-words text-base font-semibold leading-snug text-[color:var(--nv-ink)]">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Lucky / gender stat cards with icons */}
      {statItems.length > 0 && (
        <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)]/70 p-4 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--nv-accent-3-soft-bg)] text-[color:var(--nv-accent-3-soft-fg)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold text-[color:var(--nv-ink)]">{item.value}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Language constants & helpers (unchanged) ──

const LANG_KEYS = [
  'in_sanskrit', 'in_english', 'in_urdu', 'in_arabic', 'in_hindi',
  'in_hebrew', 'in_greek', 'in_latin', 'in_pashto', 'in_tamil',
  'in_telugu', 'in_marathi', 'in_bengali', 'in_punjabi', 'in_turkish',
  'in_persian', 'in_malay', 'in_indonesian', 'in_french', 'in_spanish',
  'in_german', 'in_italian', 'in_chinese', 'in_japanese', 'in_korean',
  'in_russian',
];

const LANG_LABEL = {
  in_sanskrit: 'Sanskrit',
  in_english: 'English',
  in_urdu: 'Urdu',
  in_arabic: 'Arabic',
  in_hindi: 'Hindi',
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

function getLanguages(data) {
  return LANG_KEYS
    .map((key) => ({ key, value: data[key] }))
    .filter(({ value }) => value && (value.name || value.meaning))
    .map(({ key, value }) => ({ code: key.replace('in_', ''), label: LANG_LABEL[key] || key, value }));
}

function getTranslation(data) {
  const origin = cleanText(data.origin).toLowerCase();
  const map = {
    arabic: 'in_arabic',
    urdu: 'in_urdu',
    hindi: 'in_hindi',
    sanskrit: 'in_sanskrit',
    english: 'in_english',
    hebrew: 'in_hebrew',
    greek: 'in_greek',
    latin: 'in_latin',
    biblical: 'in_greek',
    persian: 'in_persian',
    turkish: 'in_turkish',
  };
  const key = map[origin];
  if (key && data[key]?.name) return { label: LANG_LABEL[key], value: data[key] };
  const preferred = ['in_arabic', 'in_sanskrit', 'in_hindi', 'in_english', 'in_urdu', 'in_hebrew', 'in_greek', 'in_latin'];
  const found = preferred.find((k) => data[k]?.name);
  return found ? { label: LANG_LABEL[found], value: data[found] } : null;
}

function getTraits(data) {
  const t = [];
  if (Array.isArray(data.emotional_traits)) t.push(...data.emotional_traits.map(cleanText));
  if (Array.isArray(data.hidden_personality_traits)) t.push(...data.hidden_personality_traits.map(cleanText));
  if (cleanText(data.personality_traits)) t.push(cleanText(data.personality_traits));
  return Array.from(new Set(t.filter(Boolean))).slice(0, 4);
}

function getLuckyColors(data) {
  return Array.isArray(data.lucky_colors) ? data.lucky_colors.map(cleanText).filter(Boolean) : [];
}

function buildSnippet(data) {
  const name = cleanText(data.name || 'This name');
  const meaning = cleanText(data.short_meaning || data.meaning || 'meaningful cultural name').split(/[,.]/)[0];
  const origin = cleanText(data.origin) || 'multiple linguistic traditions';
  const religion = getReligionLabel(data.religion);
  const gender = getGenderLabel(data.gender).toLowerCase();
  const languages = getLanguages(data).map((l) => l.label);
  const pronunciation = cleanText(data.pronunciation?.english || data.pronunciation?.ipa);
  let text = `${name} is a ${gender} name from ${origin} origin meaning "${meaning}". It is used in ${religion} naming contexts${languages.length ? ` and appears in ${languages.join(', ')}` : ''}.${pronunciation ? ` Pronunciation: ${pronunciation}.` : ''}`;
  return text.split(/\s+/).slice(0, 58).join(' ');
}

// ── Translation Card (unchanged) ──

function TranslationCard({ language }) {
  if (!language?.value) return null;
  return (
    <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[color:var(--nv-ink)]">
        <span>{language.label}</span>
      </div>
      <p className="font-semibold text-[color:var(--nv-ink)]">{language.value.name || 'Name translation'}</p>
      {language.value.meaning ? (
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--nv-muted)]">{language.value.meaning}</p>
      ) : null}
    </div>
  );
}

// ── Meaning Panel (all sections redesigned) ──

function MeaningPanel({ data, nativeBanner }) {
  const languages = getLanguages(data);
  const translation = getTranslation(data);
  const traits = getTraits(data);
  const luckyColors = getLuckyColors(data);
  const pronunciation = data.pronunciation?.english || data.pronunciation?.ipa;
  const religionLabel = getReligionLabel(data.religion);
  const genderLabel = getGenderLabel(data.gender);
  const origin = cleanText(data.origin) || 'Multiple linguistic traditions';
  const meaning = cleanText(data.short_meaning || data.meaning).split(/[,.]/)[0];
  const luckyNumber = data.lucky_number || data.luckyNumber;
  const lifePathNumber = cleanText(data.life_path_number);
  const numerologyMeaning = cleanText(data.numerology_meaning);

  return (
    <div className="space-y-6">
      {/* Quick Answer / Meaning Summary */}
      <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
        <SectionHeading
          icon={BookOpen}
          eyebrow="Quick Answer"
          title="Meaning Summary"
          description="A concise answer for featured snippets and voice search."
          category="lucky"
        />
        <div className="mt-4 rounded-2xl bg-[color:var(--nv-accent-3-soft-bg)] p-6 ring-1 ring-[color:var(--nv-accent-3)]/10">
          <h3 className="text-xl font-bold text-[color:var(--nv-ink)]">What does {data.name} mean?</h3>
          <p className="mt-3 leading-relaxed text-[color:var(--nv-muted)]">{buildSnippet(data)}</p>
        </div>
      </section>

      {/* Translation (if available) */}
      {translation && (
        <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
          <SectionHeading
            icon={Globe}
            eyebrow="Source Language"
            title={`Meaning in ${translation.label}`}
            category="linguistic"
          />
          <div className="mt-4">
            <TranslationCard language={translation} />
          </div>
        </section>
      )}

      {/* Pronunciation */}
      <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
        <SectionHeading
          icon={Volume2}
          eyebrow="Pronunciation"
          title="How to Pronounce the Name"
          category="linguistic"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.pronunciation?.english && (
            <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">English</p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--nv-ink)]">{data.pronunciation.english}</p>
            </div>
          )}
          {data.pronunciation?.ipa && (
            <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">IPA</p>
              <p className="mt-2 text-xl font-semibold text-[color:var(--nv-ink)]">{data.pronunciation.ipa}</p>
            </div>
          )}
          {!pronunciation && (
            <p className="text-[color:var(--nv-muted)]">NameVerse does not list a pronunciation guide for this name.</p>
          )}
        </div>
      </section>

      {/* Origin & Language Usage */}
      <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
        <SectionHeading
          icon={Globe}
          eyebrow="Origin"
          title="Name Origin"
          category="linguistic"
        />
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Root Origin</p>
            <p className="mt-1.5 text-base font-semibold text-[color:var(--nv-ink)]">{origin}</p>
          </div>
          {languages.length > 0 && (
            <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Language Usage</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {languages.map((l) => (
                  <span
                    key={l.code}
                    className="rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-3 py-1 text-sm text-[color:var(--nv-ink)]"
                  >
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Religion Context */}
      <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
        <SectionHeading
          icon={Shield}
          eyebrow="Religion"
          title={`${religionLabel} Name Context`}
          category="spiritual"
        />
        <div className="mt-4 rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 leading-relaxed text-[color:var(--nv-muted)]">
          {data.name} is listed as a {religionLabel.toLowerCase()} {genderLabel.toLowerCase()} name with {origin} origin. Its meaning is {meaning}.
        </div>
      </section>

      {/* Lucky Details */}
      {(luckyNumber || data.lucky_day || luckyColors.length > 0 || data.lucky_stone || lifePathNumber) && (
        <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
          <SectionHeading
            icon={Sparkles}
            eyebrow="Lucky Details"
            title="Lucky Number, Day and Color"
            category="lucky"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {luckyNumber && (
              <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Lucky Number</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--nv-ink)]">{luckyNumber}</p>
              </div>
            )}
            {data.lucky_day && (
              <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Lucky Day</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--nv-ink)]">{data.lucky_day}</p>
              </div>
            )}
            {luckyColors.length > 0 && (
              <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Lucky Colors</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {luckyColors.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-3 py-1 text-sm text-[color:var(--nv-ink)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.lucky_stone && (
              <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Lucky Stone</p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--nv-ink)]">{data.lucky_stone}</p>
              </div>
            )}
            {lifePathNumber && (
              <div className="rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Life Path</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--nv-ink)]">{lifePathNumber}</p>
              </div>
            )}
          </div>
          {numerologyMeaning && (
            <div className="mt-5 rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 text-sm leading-relaxed text-[color:var(--nv-muted)]">
              <span className="font-semibold text-[color:var(--nv-ink)]">Numerology:</span> {numerologyMeaning}
            </div>
          )}
        </section>
      )}

      {/* Personality Traits */}
      {traits.length > 0 && (
        <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
          <SectionHeading
            icon={Heart}
            eyebrow="Personality"
            title="Personality Traits"
            category="personality"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {traits.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-4 py-2 text-sm font-medium text-[color:var(--nv-ink)]"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Spiritual Meaning */}
      {data.spiritual_meaning && (
        <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
          <SectionHeading
            icon={BookOpen}
            eyebrow="Spiritual"
            title="Spiritual Significance"
            category="spiritual"
          />
          <div className="mt-4 rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-5 leading-relaxed text-[color:var(--nv-muted)]">
            {data.spiritual_meaning}
          </div>
        </section>
      )}

      {nativeBanner}
    </div>
  );
}

// ── FAQ Section ──

function buildFaqJsonLd(faqs, name) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function FaqSection({ faqs = [], name }) {
  const safeFaqs = Array.isArray(faqs)
    ? faqs.filter((item) => item && typeof item === 'object' && item.q && item.a)
    : [];
  if (safeFaqs.length === 0) return null;

  const jsonLd = buildFaqJsonLd(safeFaqs, name);

  return (
    <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8" aria-labelledby="faq-heading">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <SectionHeading
        icon={ChevronDown}
        eyebrow="Common Questions"
        title={`Frequently Asked Questions about ${name}`}
        description={`Common questions about the meaning and origin of ${name}.`}
        category="spiritual"
        headingId="faq-heading"
      />
      <div className="mt-4 space-y-3">
        {safeFaqs.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] transition hover:border-[color:var(--nv-accent-2)]/30 hover:shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-sm font-semibold text-[color:var(--nv-ink)] transition-colors hover:text-[color:var(--nv-accent-2)]">
              <span className="flex-1">{item.q}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-[color:var(--nv-muted)] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-[color:var(--nv-muted)]">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Related Names ──

function normalizeRelatedLink(name, religion) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.trim();
  if (cleaned.length < 2) return null;
  const segment = createSlug(cleaned);
  if (!segment || !isValidSlug(segment)) return null;
  if (/^\d+$/.test(segment)) return null;
  return `/names/${(religion || 'islamic').toLowerCase()}/${segment}`;
}

function RelatedNames({ data }) {
  const religionKey = data.religion?.toLowerCase() || 'islamic';
  const similarNames = Array.isArray(data.similar_sounding_names) ? data.similar_sounding_names : [];
  const variations = Array.isArray(data.name_variations) ? data.name_variations : [];
  const relatedNames = Array.isArray(data.related_names) ? data.related_names : [];
  if (!similarNames.length && !variations.length && !relatedNames.length) return null;

  const renderGroup = (heading, names) => (
    <div>
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">{heading}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {names.slice(0, 12).map((name) => {
          const link = normalizeRelatedLink(name, religionKey);
          if (!link) {
            return (
              <span
                key={name}
                className="break-words rounded-full border border-[color:var(--nv-accent-3)]/30 bg-[color:var(--nv-accent-3-soft-bg)] px-4 py-2 text-sm text-[color:var(--nv-accent-3-soft-fg)]"
              >
                {name}
              </span>
            );
          }
          return (
            <Link
              key={name}
              href={link}
              className="break-words rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-4 py-2 text-sm font-medium text-[color:var(--nv-ink)] transition hover:-translate-y-0.5 hover:border-[color:var(--nv-accent-2)] hover:bg-[color:var(--nv-accent-2-soft-bg)] hover:text-[color:var(--nv-accent-2)] hover:shadow-sm"
            >
              {name}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <section aria-labelledby="similar-names-heading">
      <SectionHeading
        icon={Users}
        title="Similar Names"
        description="Explore names with the same sound, spelling, or origin."
        category="social"
        headingId="similar-names-heading"
      />
      <div className="mt-4 space-y-6">
        {similarNames.length > 0 && renderGroup('Similar sounding names', similarNames)}
        {relatedNames.length > 0 && renderGroup('Related names', relatedNames)}
        {variations.length > 0 && renderGroup('Spelling variations', variations)}
      </div>
    </section>
  );
}

// ── Top-level Component ──

export default function CulturalNameAnalysisCard({
  data,
  faqData = [],
  pageUrl,
  trendingNames = [],
  trendingNamesSource = 'suggested',
}) {
  const safeFaqData = Array.isArray(faqData) ? faqData : [];
  const religion = cleanText(data.religion || 'islamic').toLowerCase();
  const religionLabel = getReligionLabel(religion);
  const normalizedTrending = trendingNames
    .map((n) => normalizeTrendingName(n, religion))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <SitePage
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Names', href: '/names' },
        { label: `${religionLabel} Names`, href: `/names/religion/${religion}/1` },
        { label: data.name },
      ]}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[color:var(--nv-muted)]" aria-label="Breadcrumb">
          <Link href={`/names/${religion}`} className="font-medium transition hover:text-[color:var(--nv-ink)]">
            {religionLabel} Names
          </Link>
          <span>/</span>
          <span className="font-medium text-[color:var(--nv-ink)]">{data.name}</span>
        </nav>

        {/* Hero */}
        <NameHero data={data} pageUrl={pageUrl} />

        {/* Trending chips */}
        {normalizedTrending.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">Trending:</span>
            {normalizedTrending.map((item) => (
              <Link
                key={item.slug}
                href={`/names/${religion}/${item.slug}`}
                className="rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-4 py-1.5 text-sm font-medium text-[color:var(--nv-ink)] transition hover:border-[color:var(--nv-accent-2)] hover:text-[color:var(--nv-accent-2)] hover:shadow-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MeaningPanel data={data} />
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-5 shadow-sm transition hover:shadow-md sm:p-6">
                <KnowledgeGraph data={data} religion={religion} />
              </section>
            </div>
          </div>
        </div>

        {/* Bottom row: Related Names + Trending Now */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
            <RelatedNames data={data} />
          </section>
          {normalizedTrending.length > 0 && (
            <section className="rounded-3xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface-elevated)] p-6 shadow-sm transition hover:shadow-md sm:p-8">
              <SectionHeading
                icon={TrendingUp}
                title="Trending Now"
                description="Names gaining popularity"
                category="social"
              />
              <div className="mt-4 space-y-2">
                {normalizedTrending.slice(0, 5).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/names/${religion}/${item.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--nv-accent-2)] hover:shadow-sm"
                  >
                    <span className="text-sm font-bold text-[color:var(--nv-ink)]">{item.name}</span>
                    <ArrowRight className="h-4 w-4 text-[color:var(--nv-muted)] transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FAQ */}
        <FaqSection faqs={safeFaqData} name={data.name} />
      </div>
    </SitePage>
  );
}