'use client';

import { useEffect, useRef } from 'react';

export default function NativeBanner({ className = '', minHeight = '90px', instanceId = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('[NativeBanner] adsbygoogle error:', err.message);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-format="autorelaxed"
        data-ad-slot={instanceId || undefined}
      />
    </div>
  );
}
