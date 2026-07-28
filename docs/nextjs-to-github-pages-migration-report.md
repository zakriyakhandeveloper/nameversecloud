# NameVerse migration audit report

## 1. Project structure

### Directory tree (depth 3, excluding node_modules/.next/.git)

```text
.
├── Build
├── README.md
├── content/
├── docs/
├── eslint.config.mjs
├── git
├── jsconfig.json
├── middleware.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
│   ├── ads.txt
│   ├── manifest.json
│   ├── robots.txt
│   ├── blog-images/
│   ├── christian/
│   ├── hindu/
│   ├── islamic/
│   ├── names/
│   │   ├── christian/
│   │   ├── hindu/
│   │   └── islamic/
│   └── data/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── blog/
│   │   ├── christian/
│   │   ├── hindu/
│   │   ├── islamic/
│   │   ├── names/
│   │   └── search/
│   ├── components/
│   │   ├── Ads/
│   │   ├── Blog/
│   │   ├── Footer/
│   │   ├── HomePage/
│   │   ├── Layout/
│   │   ├── Navbar/
│   │   ├── SEO/
│   │   ├── name/
│   │   └── names/
│   ├── config/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── utils/
```

### Next.js version

- Next.js: 16.0.10 in package.json
- Next.js build output observed: 16.2.12 in the build log

### next.config contents

File: [next.config.mjs](next.config.mjs)

```js
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  skipTrailingSlashRedirect: false,
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'nameverse.site' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() { ... },
  async headers() { ... },
  async rewrites() { ... },
  experimental: { optimizePackageImports: [...] },
  turbopack: {},
};

export default nextConfig;
```

### package.json dependencies and versions

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.8.0",
    "next": "^16.0.10",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@opennextjs/cloudflare": "^1.20.2",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "rimraf": "^6.1.3",
    "tailwindcss": "^4",
    "tw-animate-css": "^1.3.6"
  }
}
```

### Current output mode

- No `output: 'export'` setting is present in [next.config.mjs](next.config.mjs).
- The current app is not configured for the static export mode expected by GitHub Pages.

## 2. Data flow (critical)

### Dynamic name page route: [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx)

The route is a Server Component that loads data like this:

```jsx
const fetchResult = await serverFetchNameDetail(religion, slug);

let nameData = fetchResult.data;

if (!nameData) {
  nameData = findLocalNameData(religion, slug);
}
```

The helper in [src/lib/api/server-fetch.js](src/lib/api/server-fetch.js) shows the current behavior:

```js
export const serverFetchNameDetail = cache(async (religion, slug) => {
  const normalizedReligion = normalizeReligion(religion);
  const lookupSlug = String(slug).trim().toLowerCase();
  const safeSlug = encodeURIComponent(lookupSlug);

  const localNameData = findLocalNameData(normalizedReligion, lookupSlug);
  if (localNameData) {
    return { data: { ...localNameData, religion: normalizedReligion }, notFound: false, error: false };
  }

  let result = await isrFetchWithRetry(
    `${getApiBase()}/api/v1/names/${normalizedReligion}/${safeSlug}`,
    2,
    ISR_TTL,
    [NAME_TAG]
  );
```

That means the route is currently mixed:

- It checks local name data first in the helper.
- If not found, it falls back to the old backend API at `https://name-meaning-site-backend.vercel.app`.

### Where the local JSON data is actually used

The helper [src/lib/data/local-name-data.mjs](src/lib/data/local-name-data.mjs) reads JSON bundles from [public/data](public/data), not from [public/names](public/names) directly.

```js
islamicBoyNames = req('../../../public/data/islamic-boy-names.json');
```

So the current repo is not yet fully using the per-name JSON files in [public/names](public/names) for the main name-detail route.

### Dynamic route generation

The per-name route uses `generateStaticParams()` in [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx):

```js
export async function generateStaticParams() {
  const staticNames = [];
  const addSlugs = (slugs, religion) => {
    for (const s of slugs) {
      if (s && isValidSlug(s)) staticNames.push({ religion, slug: s });
    }
  };

  addSlugs(getAllLocalNameSlugs('islamic'), 'islamic');
  addSlugs(getAllLocalNameSlugs('christian'), 'christian');
  addSlugs(getAllLocalNameSlugs('hindu'), 'hindu');
  ...
}
```

This is derived from the local index built from JSON data, but the index is generated from the older aggregated JSON files in [public/data](public/data), not from the directory listing of [public/names](public/names).

### Total page count per category

Verified by counting files in the folders:

- Islamic: 18,656 JSON files
- Christian: 12,894 JSON files
- Hindu: 10,411 JSON files

## 3. Build behavior

### Build command

Executed:

```bash
cd /workspaces/NameVerseCloud && CI=1 npm run build
```

### Result

- Exit status: 0 from the earlier successful build run.
- Build duration observed in the shell: about 23 seconds for a later rerun (the environment changed slightly, but the build completed successfully in the earlier run).

### SSG / ISR evidence

The project uses ISR via `revalidate` exports, for example:

```js
export const revalidate = 2592000;
```

and in multiple route files such as:

- [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx)
- [src/app/names/[religion]/letter/[letter]/[page]/page.jsx](src/app/names/[religion]/letter/[letter]/[page]/page.jsx)
- [src/app/names/[religion]/categories/[category]/[page]/page.jsx](src/app/names/[religion]/categories/[category]/[page]/page.jsx)
- [src/app/names/[religion]/origin/[origin]/[page]/page.jsx](src/app/names/[religion]/origin/[origin]/[page]/page.jsx)

The build log also showed `revalidate` declarations, but it did not show the explicit Next.js `Generating static pages (X/X)` lines in the captured log excerpt.

### `.next` output size

Verified with:

```bash
du -sh .next
```

Result:

- `.next` size: about 29M

### `next export` / `output: export`

Executed:

```bash
npx next export
```

Result:

```text
⨯ `next export` has been removed in favor of 'output: export' in next.config.js.
```

So the current setup does not support the old `next export` workflow and does not yet have the proper static-export configuration for GitHub Pages.

## 4. Assets & rendering

### Client-side JS libraries used on name pages

The name-detail page imports several UI and client-side pieces, including:

- [src/components/name/NameDetail.jsx](src/components/name/NameDetail.jsx)
- [src/components/Ads/NativeBanner.jsx](src/components/Ads/NativeBanner.jsx)
- [src/components/Ads/NativeBarAd.jsx](src/components/Ads/NativeBarAd.jsx)
- [src/components/Ads/NativeAdScript.jsx](src/components/Ads/NativeAdScript.jsx)

Notable client-side behavior includes:

- `adsbygoogle` injection in [src/components/Ads/NativeBanner.jsx](src/components/Ads/NativeBanner.jsx)
- global ad script injection in [src/components/Ads/NativeAdScript.jsx](src/components/Ads/NativeAdScript.jsx)
- `IntersectionObserver` usage for lazy ad visibility in [src/components/Ads/NativeBarAd.jsx](src/components/Ads/NativeBarAd.jsx)

The project also includes analytics-related logic in [src/lib/performance/index.js](src/lib/performance/index.js) and [src/config/env.js](src/config/env.js), though the name-detail route itself does not appear to use a heavyweight charting library.

### Image handling

The app uses Next.js image support and sets `images.unoptimized: true` in [next.config.mjs](next.config.mjs):

```js
images: {
  unoptimized: true,
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'nameverse.site' },
  ],
}
```

This means images are rendered without the standard Next.js optimization pipeline, which is acceptable for static hosting but should be verified against the actual asset sources.

### Adsterra / ad script loading pattern

The current pattern is a client-side script injection pattern, not a server-rendered blocking script:

[ src/components/Ads/NativeAdScript.jsx ](src/components/Ads/NativeAdScript.jsx)

```jsx
useEffect(function () {
  if (typeof window === 'undefined') return;

  REVOLTHEM_SCRIPTS.forEach(function (scriptConfig) {
    if (document.getElementById(scriptConfig.id)) return;

    var script = document.createElement('script');
    script.id = scriptConfig.id;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = scriptConfig.src;
    document.head.appendChild(script);
  });
}, []);
```

This is not a full render blocker by itself, but it does add third-party runtime work and can delay interactive rendering on the client.

## 5. SEO elements per page

### JSON-LD and meta tags

The per-name page builds metadata and schema objects server-side:

- [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx)
- [src/lib/seo/name-page-seo.jsx](src/lib/seo/name-page-seo.jsx)

The page uses `generateNamePageMetadata()` and `generateNamePageSchemas()` and injects JSON-LD with `next/script`.

Example:

```jsx
const schemas = generateNamePageSchemas(nameData, religion, slug);

{schemas.dataset && (
  <Script id="dataset-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.dataset) }} />
)}
```

### Canonical and alternate tags

The page also renders canonical-style hreflang tags:

```jsx
<link rel="alternate" hrefLang="en" href={pageUrl} />
<link rel="alternate" hrefLang="x-default" href={pageUrl} />
```

### Sitemap generation method

The app generates sitemaps using route handlers:

- [src/app/sitemap.xml/route.js](src/app/sitemap.xml/route.js)
- [src/app/sitemap-blog.xml/route.js](src/app/sitemap-blog.xml/route.js)

These are route-based XML outputs, not static files committed into [public](public).

## 6. GitHub Pages compatibility blockers

### 1. API routes require a Node server

File: [src/app/api/revalidate/route.js](src/app/api/revalidate/route.js)

```js
export async function POST() { ... }
```

These routes are not compatible with a purely static GitHub Pages host.

### 2. Middleware requires Next.js runtime

File: [middleware.js](middleware.js)

```js
export function middleware(request) {
  ...
}
```

This is a Next.js middleware feature and is not supported by static GitHub Pages hosting.

### 3. Image optimization API usage

Configured in [next.config.mjs](next.config.mjs) via `images.unoptimized: true`, but the app still uses Next.js image primitives and image pipeline assumptions. For GitHub Pages, this should be migrated to plain static `<img>` or a build-time image pipeline.

### 4. Server-side data fetching and ISR

Files:

- [src/lib/api/server-fetch.js](src/lib/api/server-fetch.js)
- [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx)

These rely on server-side fetching, revalidation, and cached server functions that are not suitable for a pure static export without further refactoring.

### 5. Rewrites/redirects in next.config

File: [next.config.mjs](next.config.mjs)

These are runtime Next.js features and are not available in a plain GitHub Pages static deployment.

## 7. File update cost

If one file under [public/names/islamic](public/names/islamic) is edited and the site is redeployed, the current build behavior depends on the route configuration.

The per-name route uses `generateStaticParams()` in [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx), which builds a list of slugs from the local helper index. In the current implementation, the build will re-run for the whole app build and regenerate the relevant routes as part of the build pipeline. It is not currently a granular per-file incremental HTML update.

In short:

- A single JSON edit does not trigger a tiny one-page rebuild in the current setup.
- The current app rebuilds a full Next.js production build, which regenerates the relevant static pages as part of the broader build graph.
- Because the route uses `generateStaticParams()` and ISR-style revalidation, the build is still effectively a static build pipeline rather than a per-file hot update system.

## Bottom line

The repo already has a strong static-data foundation, but it is not yet a true GitHub Pages-ready static site. The main gaps are:

- no `output: 'export'` configuration
- still relying on runtime Next.js features such as middleware and route handlers
- still using server-side fetch logic and ISR for name data
- not yet consuming the per-name JSON files in [public/names](public/names) as the primary source for all name detail pages

That combination makes the current project a hybrid Next.js app rather than a pure GitHub Pages-compatible static site.
