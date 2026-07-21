'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * NativeBarAd — reserved-height native ad slot with desktop/mobile variants.
 *
 * - Renders a server-visible, CSS-reserved slot (`.native-bar`) so there is
 *   ZERO layout shift (CLS) regardless of when the ad script fills it.
 * - The Revolthem invoke.js script (loaded globally in the layout) targets the
 *   inner `id={containerId}` div. Each placement passes a UNIQUE containerId so
 *   multiple slots don't collide.
 * - Mobile vs desktop is handled purely by CSS (`.lg:hidden` / `.hidden.lg:block`)
 *   so no JS breakpoint logic is needed and the reserved space is always present.
 *
 * @param {Object} props
 * @param {'desktop'|'mobile'} props.variant   Which slot to render (responsive CSS toggle)
 * @param {string} props.containerId           UNIQUE id for this placement's inner div
 * @param {string} [props.className]           Extra wrapper classes
 * @param {string} [props.minHeight]           Override reserved height (default from CSS)
 */

function isAdFreePage() {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname.toLowerCase();
  const adFreePaths = ['/privacy', '/terms', '/login', '/signup', '/dashboard', '/admin'];
  return adFreePaths.some((p) => pathname.startsWith(p));
}

export default function NativeBarAd({ variant = 'desktop', containerId, className = '', minHeight }) {
  const wrapperRef = useRef(null);
  const [canRender, setCanRender] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setCanRender(!isAdFreePage());
  }, []);

  useEffect(() => {
    if (!canRender || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canRender]);

  if (!canRender || !containerId) return null;

  const visibilityClass = variant === 'mobile' ? 'lg:hidden' : 'hidden lg:block';

  return (
    <div
      ref={wrapperRef}
      className={`native-bar ${visibilityClass} ${className}`}
      style={minHeight ? { minHeight } : undefined}
      aria-hidden="true"
    >
      {inView && (
        <div
          id={containerId}
          style={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            marginTop: '16px',
            marginBottom: '24px',
          }}
        />
      )}
    </div>
  );
}
