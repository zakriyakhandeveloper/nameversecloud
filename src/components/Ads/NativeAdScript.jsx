'use client';

import { useEffect } from 'react';

/**
  * NativeAdScript — Loads global Revolthem native ad script once.
  *
  * Because this component is rendered at the root layout level, the
  * script runs site-wide (every page).
  *
  * Scripts:
  *   - Native ads invoke.js (renders inside any container-* divs)
 */
const REVOLTHEM_SCRIPTS = [
  {
    id: 'revolthem-native-invoke',
    src: 'https://revolthem.com/c90e1cf06dc7451f1fd3d33c703af951/invoke.js',
  },
];

export default function NativeAdScript() {
  useEffect(function () {
    if (typeof window === 'undefined') return;

    REVOLTHEM_SCRIPTS.forEach(function (scriptConfig) {
      // Only load once
      if (document.getElementById(scriptConfig.id)) return;

      var script = document.createElement('script');
      script.id = scriptConfig.id;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptConfig.src;
      document.head.appendChild(script);
    });
  }, []);

  return null;
}
