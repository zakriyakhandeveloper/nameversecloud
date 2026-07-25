import { NextResponse } from 'next/server';
import manifest from '../../../public/seo-sitemap-manifest.json';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const urls = (manifest.sitemaps || [])
    .map((loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
