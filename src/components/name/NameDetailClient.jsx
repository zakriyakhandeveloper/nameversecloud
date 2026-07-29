'use client';

import { useEffect, useMemo, useState } from 'react';
import CulturalNameAnalysisCard from '@/components/name/NameDetail';

export default function NameDetailClient({ data, faqData, pageUrl, trendingNames, trendingNamesSource }) {
  const [freshData, setFreshData] = useState(data);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch(`${window.location.pathname.replace(/\/$/, '')}.json?ts=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const payload = await res.json();
        const nextData = payload?.data ?? payload;
        const currentUpdated = freshData?.updatedAt || freshData?.updated_at || null;
        const nextUpdated = nextData?.updatedAt || nextData?.updated_at || null;
        if (!cancelled && nextUpdated && (!currentUpdated || new Date(nextUpdated) > new Date(currentUpdated))) {
          setFreshData({ ...freshData, ...nextData });
        }
      } catch {
        // Ignore client refresh failures; keep the static shell intact.
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const renderedData = useMemo(() => ({ ...freshData }), [freshData]);

  return (
    <CulturalNameAnalysisCard
      data={renderedData}
      faqData={faqData}
      pageUrl={pageUrl}
      trendingNames={trendingNames}
      trendingNamesSource={trendingNamesSource}
    />
  );
}
