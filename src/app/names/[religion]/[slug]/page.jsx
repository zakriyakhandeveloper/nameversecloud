import { notFound } from 'next/navigation';
import { createSlug, nameAbsoluteUrl, isValidSlug } from '@/lib/seo/url-builder';
import { generateNamePageMetadata, generateNamePageSchemas } from '@/lib/seo/name-page-seo';
import { sanitizeNameData } from '@/lib/utils/sanitizeNameData';
import NameDetailClient from '@/components/name/NameDetailClient';
import Script from 'next/script';
import NativeBanner from '@/components/Ads/NativeBanner';
import { readNameData, getNameSlugs, getNameList, filterKnownSlugs } from '@/lib/data/local-name-loader.mjs';

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = [];
  for (const religion of VALID_RELIGIONS) {
    for (const slug of getNameSlugs(religion)) {
      if (slug && isValidSlug(slug)) params.push({ religion, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const religion = normalizeReligion(resolvedParams?.religion);
  const slug = createSlug(resolvedParams?.slug);

  if (!religion || !slug || !isValidSlug(slug)) {
    return {
      title: 'Name Not Found | NameVerse',
      description: 'The requested linguistic analysis page could not be found on NameVerse.',
      robots: { index: false, follow: false },
    };
  }

  const nameData = readNameData(religion, slug);

  if (!nameData) {
    return {
      title: 'Name Not Found | NameVerse',
      description: 'The requested name page does not exist on NameVerse.',
      robots: { index: false, follow: false },
    };
  }

  // Clean name field before metadata generation
  if (nameData?.name && typeof nameData.name === 'string') {
    nameData.name = nameData.name.trim().replace(/^\n+/, '');
  }

  // If no data found anywhere, return 404
  if (!nameData) {
    return {
      title: 'Name Not Found | NameVerse',
      description: 'The requested name page does not exist on NameVerse.',
      robots: { index: false, follow: false },
    };
  }

  return generateNamePageMetadata(nameData, religion, slug);
}

function normalizeReligion(religion) {
  if (!religion || typeof religion !== 'string') return null;
  const normalized = religion.toLowerCase();
  if (normalized === 'islam' || normalized === 'muslim') return 'islamic';
  if (normalized === 'hinduism') return 'hindu';
  if (normalized === 'christianity') return 'christian';
  return VALID_RELIGIONS.includes(normalized) ? normalized : null;
}

export default async function NameDetailPage({ params }) {
  const resolvedParams = await params;
  const religion = normalizeReligion(resolvedParams?.religion);
  const slug = createSlug(resolvedParams?.slug);

  if (!religion || !slug || !isValidSlug(slug)) {
    return notFound();
  }

  const nameData = readNameData(religion, slug);

  if (!nameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Loading Name Data</h1>
          <p className="text-gray-600 mb-6">
            We're experiencing connectivity issues. Please refresh the page or try again later.
          </p>
          <a 
            href={`/names/${religion}/letter/a/1`} 
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
          >
            Browse All {religion.charAt(0).toUpperCase() + religion.slice(1)} Names
          </a>
        </div>
      </div>
    );
  }

  let sanitizedNameData = sanitizeNameData(nameData);

  // Pre-validate similar/related/variation links against the backend so the page
  // only renders internal <Link>s to name pages that actually exist (fixes a
  // long-standing source of 404s from similar_sounding_names).
  const [filteredSimilar, filteredRelated, filteredVariations] = await Promise.all([
    Promise.resolve(filterKnownSlugs(religion, sanitizedNameData.similar_sounding_names)),
    Promise.resolve(filterKnownSlugs(religion, sanitizedNameData.related_names)),
    Promise.resolve(filterKnownSlugs(religion, sanitizedNameData.name_variations)),
  ]);
  sanitizedNameData = {
    ...sanitizedNameData,
    similar_sounding_names: filteredSimilar,
    related_names: filteredRelated,
    name_variations: filteredVariations,
  };

  const pageUrl = nameAbsoluteUrl(religion, slug);
  const schemas = generateNamePageSchemas(sanitizedNameData, religion, slug);

  // ── FAQ data (Part 2) ──
  // The backend returns TWO faq arrays with different phrasing:
  //   data.seo.seo.faq  (primary, richer phrasing)
  //   data.seo.faq       (nested duplicate, different wording)
  // Use data.seo.seo.faq as primary; fall back to data.seo.faq only if the
  // former is missing/empty. NOTE: this duplication is an API/data bug — the
  // two arrays should be merged/normalised server-side. Temporary workaround
  // until that's fixed. See FAQ section below for the rendering guard.
  const apiSeo = sanitizedNameData?.seo || {};
  const nestedSeo = apiSeo?.seo || {};
  const primaryFaq = Array.isArray(nestedSeo?.faq) ? nestedSeo.faq : [];
  const fallbackFaq = Array.isArray(apiSeo?.faq) ? apiSeo.faq : [];
  const faqData = primaryFaq.length > 0 ? primaryFaq : fallbackFaq;

  const trendingNames = getNameList(religion, 8, slug);
  const trendingNamesSource = 'suggested';

  return (
    <>
      {/* hreflang tags — only en and x-default until translation routes exist */}
      <link rel="alternate" hrefLang="en" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />

      {schemas.dataset && (
        <Script
          id="dataset-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.dataset) }}
        />
      )}

      {schemas.webPage && (
        <Script
          id="webpage-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.webPage) }}
        />
      )}

      {schemas.article && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.article) }}
        />
      )}

      {schemas.definedTerm && (
        <Script
          id="definedterm-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.definedTerm) }}
        />
      )}

      {schemas.scholarlyArticle && (
        <Script
          id="scholarly-article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.scholarlyArticle) }}
        />
      )}

      {schemas.breadcrumb && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
        />
      )}

      <NativeBanner className="my-4" minHeight="90px" instanceId={`name-page-${slug}`} />

      <NameDetailClient
        data={sanitizedNameData}
        faqData={faqData}
        pageUrl={pageUrl}
        trendingNames={trendingNames}
        trendingNamesSource={trendingNamesSource}
      />
    </>
  );
}