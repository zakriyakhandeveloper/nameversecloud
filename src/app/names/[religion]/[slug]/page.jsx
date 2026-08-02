import { notFound } from 'next/navigation';
import { createSlug, isValidSlug } from '@/lib/seo/url-builder';
import { generateNamePageMetadata } from '@/lib/seo/name-page-seo';
import { readNameData, getNameSlugs } from '@/lib/data/local-name-loader.mjs';
import NameDetailClient from '@/components/name/NameDetailClient';
import NativeBanner from '@/components/Ads/NativeBanner';
import { nameAbsoluteUrl } from '@/lib/seo/url-builder';

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu'];
export const dynamicParams = true;
export const revalidate = 2592000;

export async function generateStaticParams() {
  const params = [];
  for (const religion of VALID_RELIGIONS) {
    for (const slug of getNameSlugs(religion)) {
      if (slug && isValidSlug(slug)) {
        params.push({ religion, slug });
        if (params.length >= 18000) return params;
      }
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

  if (nameData?.name && typeof nameData.name === 'string') {
    nameData.name = nameData.name.trim().replace(/^\n+/, '');
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

  const pageUrl = nameAbsoluteUrl(religion, slug);

  return (
    <>
      <link rel="alternate" hrefLang="en" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={pageUrl} />

      <NativeBanner className="my-4" minHeight="90px" instanceId={`name-page-${slug}`} />

      <NameDetailClient religion={religion} slug={slug} pageUrl={pageUrl} />
    </>
  );
}
