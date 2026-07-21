'use client';

import { useEffect } from 'react';

/**
 * NativeAdScript — Loads all global Revolthem monetization scripts once.
 *
 * Each script is loaded a single time (guarded by a unique id) and mounted in
 * <head>. Because this component is rendered at the root layout level, the
 * scripts run site-wide (every page).
 *
 * Scripts:
 *   - Native ads invoke.js (renders inside any container-* divs)
 *   - Social bar
 *   - Popunder
 */
const REVOLTHEM_SCRIPTS = [
  {
    id: 'revolthem-native-invoke',
    src: 'https://revolthem.com/c90e1cf06dc7451f1fd3d33c703af951/invoke.js',
  },
  {
    id: 'revolthem-popunder',
    src: 'https://revolthem.com/5e0cdf883b6f082ca7c001d812ce1be6.js',
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
