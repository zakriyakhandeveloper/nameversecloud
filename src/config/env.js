/**
 * Environment Configuration
 * Validates and exports environment variables with defaults
 */

import { getSiteUrl } from '@/lib/seo/site';

/**
 * Validates required environment variables
 * @throws {Error} If required env vars are missing
 */
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_API_BASE',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}. Using defaults.`);
  }
}

// Only validate during build, not at runtime on Workers
if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
  validateEnv();
}

const _rawSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl();
const _apiBase = () => (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');
const _apiTimeout = () => parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000', 10);

export const env = new Proxy({}, {
  get(_target, prop) {
    switch (prop) {
      case 'site':
        return {
          get url() { return _rawSiteUrl(); },
          get name() { return process.env.NEXT_PUBLIC_SITE_NAME || 'NameVerse'; },
        };
      case 'api':
        return {
          get baseUrl() { return _apiBase(); },
          get timeout() { return _apiTimeout(); },
          get version() { return ''; },
        };
      case 'nodeEnv':
        return process.env.NODE_ENV || 'development';
      case 'isDevelopment':
        return process.env.NODE_ENV === 'development';
      case 'isProduction':
        return process.env.NODE_ENV === 'production';
      case 'isTest':
        return process.env.NODE_ENV === 'test';
      case 'features':
        return {
          get analytics() { return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'; },
          get pwa() { return process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false'; },
          get sentry() { return process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true'; },
        };
      case 'analytics':
        return {
          get gaId() { return process.env.NEXT_PUBLIC_GA_ID || ''; },
          get gtmId() { return process.env.NEXT_PUBLIC_GTM_ID || ''; },
        };
      case 'limits':
        return {
          get maxRequestsPerWindow() { return parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT || '60', 10); },
          get windowMs() { return parseInt(process.env.NEXT_PUBLIC_RATE_WINDOW_MS || '60000', 10); },
        };
      case 'build':
        return {
          get static() { return process.env.NEXT_PUBLIC_BUILD_STATIC === 'true'; },
          get staticNamesLimit() { return parseInt(process.env.NEXT_PUBLIC_STATIC_NAMES_LIMIT || '10', 10); },
          get staticLangLimit() { return parseInt(process.env.NEXT_PUBLIC_STATIC_LANG_LIMIT || '0', 10); },
          get skipMetadataFetch() { return process.env.NEXT_PUBLIC_SKIP_METADATA_FETCH === 'true'; },
        };
      default:
        return undefined;
    }
  },
  getOwnPropertyDescriptor(_target, prop) {
    return {
      configurable: true,
      enumerable: true,
      value: (env)[prop],
      writable: false,
    };
  },
});

export default env;
