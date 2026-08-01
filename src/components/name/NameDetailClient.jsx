'use client';

import { useEffect, useMemo, useState } from 'react';
import CulturalNameAnalysisCard from '@/components/name/NameDetail';
import { sanitizeNameData } from '@/lib/utils/sanitizeNameData';
import { generateNamePageSchemas } from '@/lib/seo/name-page-seo';
import { nameAbsoluteUrl } from '@/lib/seo/url-builder';
import { Script } from 'next/script';

export default function NameDetailClient({ religion, slug, pageUrl }) {
  const [data, setData] = useState(null);
  const [trendingNames, setTrendingNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      try {
        const jsonUrl = `${window.location.pathname.replace(/\/$/, '')}.json`;
        const res = await fetch(`${jsonUrl}?ts=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const payload = await res.json();
        const rawData = payload?.data ?? payload;

        if (!cancelled) {
          const sanitized = sanitizeNameData(rawData);
          if (sanitized?.name && typeof sanitized.name === 'string') {
            sanitized.name = sanitized.name.trim().replace(/^\n+/, '');
          }
          setData(sanitized);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [religion, slug]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      try {
        const extractedUrl = `/${religion}_extracted.json`;
        const res = await fetch(extractedUrl, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const arr = await res.json();
        if (cancelled) return;

        const names = Array.isArray(arr)
          ? arr
              .filter((item) => item?.name && typeof item.name === 'string' && item.slug !== slug)
              .slice(0, 8)
              .map((item) => ({
                name: String(item.name),
                slug: item.slug || String(item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                religion: religion,
              }))
          : [];
        setTrendingNames(names);
      } catch {
        // silent fail
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [religion, slug]);

  const schemas = useMemo(() => {
    if (!data) return null;
    return generateNamePageSchemas(data, religion, slug);
  }, [data, religion, slug]);

  const faqData = useMemo(() => {
    if (!data) return [];
    const apiSeo = data?.seo || {};
    const nestedSeo = apiSeo?.seo || {};
    const primaryFaq = Array.isArray(nestedSeo?.faq) ? nestedSeo.faq : [];
    const fallbackFaq = Array.isArray(apiSeo?.faq) ? apiSeo.faq : [];
    return primaryFaq.length > 0 ? primaryFaq : fallbackFaq;
  }, [data]);

  const resolvedPageUrl = pageUrl || (data ? nameAbsoluteUrl(religion, slug) : null);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Name Not Found</h1>
          <p className="text-gray-600 mb-6">
            The requested name page does not exist on NameVerse.
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

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Loading Name Data</h1>
          <p className="text-gray-600 mb-6">
            We're loading the name details. Please refresh if this takes too long.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {schemas?.dataset && (
        <Script
          id="dataset-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.dataset) }}
        />
      )}
      {schemas?.webPage && (
        <Script
          id="webpage-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.webPage) }}
        />
      )}
      {schemas?.article && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.article) }}
        />
      )}
      {schemas?.definedTerm && (
        <Script
          id="definedterm-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.definedTerm) }}
        />
      )}
      {schemas?.scholarlyArticle && (
        <Script
          id="scholarly-article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.scholarlyArticle) }}
        />
      )}
      {schemas?.breadcrumb && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }}
        />
      )}
      {schemas?.faq && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }}
        />
      )}

      <CulturalNameAnalysisCard
        data={data}
        faqData={faqData}
        pageUrl={resolvedPageUrl}
        trendingNames={trendingNames}
        trendingNamesSource="suggested"
      />
    </>
  );
}
