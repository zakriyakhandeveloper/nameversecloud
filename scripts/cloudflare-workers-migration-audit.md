# Cloudflare Workers Migration Audit Report — NameVerse
**Date:** 2026-07-24  
**Site:** https://nameverse.site  
**Status:** Investigation only — no code changes made

---

## 1. RUNTIME COMPATIBILITY

### Node.js-only APIs Used in `src/`

| File | Line | API | Impact on Workers |
|------|------|-----|-------------------|
| `src/app/page.js` | 1-2 | `fs`, `path` | ❌ Blocking — reads blog-posts.json at module load |
| `src/app/names/[religion]/[slug]/page.jsx` | 8-9 | `fs`, `path` | ❌ Blocking — reads local JSON data in `generateStaticParams` and `loadLocalNameData` |
| `src/app/blog/page.jsx` | 37-38 | `fs.readFileSync`, `path.join` | ❌ Blocking — reads blog-posts.json at module load |
| `src/app/blog/[slug]/page.jsx` | 42-44 | JSON imports | ⚠️ OK if bundled, but large inline imports |
| `src/app/sitemap.xml/route.js` | 3-4 | `fs`, `path` | ❌ Blocking — reads sitemap files from filesystem |
| `src/app/sitemap-blog.xml/route.js` | 2 | `path.join` | ❌ Blocking — constructs filesystem paths |
| `src/app/meaning/[slug]/page.jsx` | 14 | `path.join(process.cwd(), ...)` | ❌ Blocking — `process.cwd()` is Node-only |
| `src/app/religions/[religion]/page.jsx` | 22 | `fs.readFileSync`, `path.join` | ❌ Blocking — reads meaning-content.json |
| `src/components/Blog/BlogSection.jsx` | 3-4 | `fs`, `path` | ❌ Blocking — reads blog-posts.json per render |
| `src/lib/seo/sitemap-data.mjs` | 17-19 | `fs`, `path`, `fileURLToPath` | ❌ Blocking — build-time script using Node fs |
| `src/lib/seo/italian-name-detector.mjs` | 5-7 | `fs`, `path`, `fileURLToPath` | ❌ Blocking — reads JSON files at module load |

### Runtime Exports

| File | Line | Runtime | Notes |
|------|------|---------|-------|
| `src/app/opengraph-image.jsx` | 3 | `edge` | ✅ Edge-compatible |
| `src/app/icon.jsx` | 4 | `edge` | ✅ Edge-compatible |
| `src/app/apple-icon.jsx` | 4 | `edge` | ✅ Edge-compatible |
| `src/app/sitemap.xml/route.js` | 6 | `force-static` | ⚠️ Static but uses Node fs |
| `middleware.js` | — | Default (edge) | ✅ Edge-compatible |
| All other pages | — | Unset (defaults to Node) | ❌ Would need `runtime = 'nodejs'` on Workers |

**Finding:** Most content pages default to Node.js runtime. On Cloudflare Workers with OpenNext, pages without explicit `runtime = 'nodejs'` may fail if they import Node-only modules.

### Dependencies Incompatible with Workers

| Package | Version | Issue |
|---------|---------|-------|
| `sharp` | ^0.34.4 | ❌ Native binary — incompatible with Workers runtime |
| `sitemap` | ^9.0.0 | ⚠️ Likely Node-only — uses `fs`/`path` internally |

**No `@vercel/*` packages found.**

---

## 2. RENDERING STRATEGY

### Output Mode
**File:** `next.config.mjs`  
**Finding:** No `output: 'export'` or `output: 'standalone'` configured. Uses Next.js default (server-side rendering with ISR).

### ISR Pages (`revalidate` set)

| Route | File | Line | Interval |
|-------|------|------|----------|
| Homepage | `src/app/page.js` | 7 | 2592000 (30 days) |
| Names listing | `src/app/names/page.jsx` | 7 | 2592000 |
| Name detail | `src/app/names/[religion]/[slug]/page.jsx` | 19 | 2592000 |
| Religion listing | `src/app/names/religion/[religion]/[page]/page.jsx` | 20 | 2592000 |
| Letter pages | `src/app/names/[religion]/letter/[letter]/[page]/page.jsx` | 15 | 2592000 |
| Origin pages | `src/app/names/[religion]/origin/[origin]/[page]/page.jsx` | 13 | 2592000 |
| Category pages | `src/app/names/[religion]/categories/[category]/[page]/page.jsx` | 14 | 2592000 |
| Blog index | `src/app/blog/page.jsx` | 46 | 2592000 |
| Blog post | `src/app/blog/[slug]/page.jsx` | 51 | 2592000 |
| + 30 more pages | various | various | 2592000 |
| Sitemap XML | `src/app/sitemap.xml/route.js` | 7 | 86400 (1 day) |
| Sitemap Blog XML | `src/app/sitemap-blog.xml/route.js` | 11 | 86400 |

**Total:** 43 pages with ISR + 2 sitemap routes.

### SSR / Dynamic Pages (no revalidate)
- **None found.** All pages either have `revalidate` set or are static assets.

### Static Generation Coverage

**File:** `src/app/names/[religion]/[slug]/page.jsx`  
**Lines:** 169-194

```javascript
// Line 174: const perReligionLimit = 120;
// Only 120 names per religion are prebuilt = 360 total
// ~12,140+ name pages generate on-demand at request time
```

**File:** `src/app/names/[religion]/[slug]/page.jsx`  
**Line 15:** `export const dynamicParams = true;`

**Finding:** Only **360 of ~12,500+** name pages are pre-generated at build time. The rest use `dynamicParams: true` and generate on first request via ISR.

---

## 3. STATE ACROSS WORKERS ISOLATE REUSE

### Module-Level Mutable State (CRITICAL for Workers)

| File | Line | State | Risk |
|------|------|-------|------|
| `src/lib/api/server-fetch.js` | 24 | `const slugTimestampCache = new Map();` | 🔴 **HIGH** — persists across requests in same isolate, can leak data between users |
| `src/lib/api/names.js` | 712 | `const requestCache = new Map();` | 🔴 **HIGH** — in-memory request dedup cache, survives across requests |
| `src/lib/seo/sitemap-data.mjs` | 327 | `const backendSlugCache = new Map();` | 🟡 **MEDIUM** — build-time cache, but loaded at module init |
| `src/lib/seo/italian-name-detector.mjs` | 128 | `const lookup = new Map();` | 🟡 **MEDIUM** — populated at module load from fs reads |

### Immutable Module-Level Constants (Safe)

| File | Line | State | Safe? |
|------|------|-------|-------|
| `src/lib/seo/url-builder.js` | 27 | `const RESERVED_SLUGS = new Set([...])` | ✅ Immutable after creation |
| `src/lib/seo/faq-engine.js` | various | Template functions | ✅ No mutation |
| `src/lib/seo/title-generator.jsx` | various | Pure functions | ✅ No mutation |

### globalThis Usage
**None found.** No `globalThis` caching detected.

### Isolate Reuse Risk Summary
Cloudflare Workers reuse isolates across requests. Any module-level `Map`/`Set`/object that gets mutated during request handling will **leak state between users**. The `slugTimestampCache` and `requestCache` are particularly dangerous because they store per-request data.

---

## 4. BACKEND API + FAQ DATA HANDLING

### Backend API Calls

| Function | File | Line | Endpoint | Cache |
|----------|------|------|----------|-------|
| `serverFetchNameDetail` | `src/lib/api/server-fetch.js` | 232 | `/api/v1/names/:religion/:slug` | ISR 30d + tag `name-data` |
| `serverFetchFilters` | `src/lib/api/server-fetch.js` | 104 | `/api/v1/names/:religion/filters` | ISR 30d |
| `serverFetchTrendingNames` | `src/lib/api/server-fetch.js` | 348 | `/api/names?religion=X` | ISR 30d |
| `serverFetchRelatedNames` | `src/lib/api/server-fetch.js` | 376 | `/api/names/:religion/:slug/related` | ISR 30d |
| `serverFetchSimilarNames` | `src/lib/api/server-fetch.js` | 404 | `/api/names/:religion/:slug/similar` | ISR 30d |
| `serverFetchNamesByLetter` | `src/lib/api/server-fetch.js` | 131 | `/api/v1/names/:religion?alphabet=X` | ISR 30d |
| `serverFetchNamesWithAdvancedFilters` | `src/lib/api/server-fetch.js` | 173 | `/api/v1/names/:religion` | ISR 30d |
| `serverSearchNames` | `src/lib/api/server-fetch.js` | 491 | `/api/v1/names/search?q=X` | ISR 1h |
| `serverFetchNamesByCategory` | `src/lib/api/server-fetch.js` | 432 | `/api/v1/names?category=X` | ISR 30d |
| `serverFetchNamesByOrigin` | `src/lib/api/server-fetch.js` | 461 | `/api/v1/names?origin=X` | ISR 30d |

### FAQ Data Bug — Confirmed

**File:** `src/app/names/[religion]/[slug]/page.jsx`  
**Lines:** 319-329

```javascript
// The backend returns TWO faq arrays with different phrasing:
//   data.seo.seo.faq  (primary, richer phrasing)
//   data.seo.faq       (nested duplicate, different wording)
// Use data.seo.seo.faq as primary; fall back to data.seo.faq only if the
// former is missing/empty.
const apiSeo = nameData?.seo || {};
const nestedSeo = apiSeo?.seo || {};
const primaryFaq = Array.isArray(nestedSeo?.faq) ? nestedSeo.faq : [];
const fallbackFaq = Array.isArray(apiSeo?.faq) ? apiSeo.faq : [];
const faqData = primaryFaq.length > 0 ? primaryFaq : fallbackFaq;
```

**File:** `src/lib/seo/name-page-seo.jsx`  
**Line:** 253 — `faqData: faqItems` returned in metadata

**File:** `src/components/names/NameDetailClient.jsx`  
**Lines:** 306-336 — Client-side FAQ generation with fallback

**Finding:** The FAQ data has a known duplicate array bug from the backend. The workaround exists in both server and client components. On Workers, this logic would still work, but the FAQ data is fetched at **request time** (SSR/ISR), not build time. Each request regenerates FAQs via `generateFAQs()` in `faq-engine.js`.

### FAQ Generation Timing
- **Fetched:** Request time (SSR/ISR)
- **Generated:** `generateFAQs()` in `faq-engine.js` — pure function, deterministic
- **Cached:** Via ISR on the page (`revalidate = 2592000`)
- **No separate build-time FAQ cache exists**

---

## 5. ENVIRONMENT VARIABLES AND CONFIG

### `process.env` Usage

| File | Line | Variable | Scope | Workers Safe? |
|------|------|----------|-------|---------------|
| `src/config/env.js` | 21, 38, 43, 45, 50-53, 57-59, 64-65, 70-71, 76-79 | Multiple `NEXT_PUBLIC_*` | Module load | ⚠️ Reads at import time |
| `src/lib/api/server-fetch.js` | 20 | `NEXT_PUBLIC_API_BASE` | Module load | ⚠️ Reads at import time |
| `src/lib/seo/sitemap-data.mjs` | 34 | `NEXT_PUBLIC_API_BASE` | Module load | ⚠️ Reads at import time |
| `src/lib/seo/site.js` | 7 | `NEXT_PUBLIC_SITE_URL` | Function scope | ✅ Safe |
| `src/app/page.js` | 9 | `NEXT_PUBLIC_SITE_URL` | Module load | ⚠️ Reads at import time |
| `src/app/sitemap.xml/route.js` | 5 | `NEXT_PUBLIC_SITE_URL` | Request handler | ✅ Safe |
| `src/app/sitemap-blog.xml/route.js` | 5 | `NEXT_PUBLIC_SITE_URL` | Request handler | ✅ Safe |

**Critical Issue:** `src/config/env.js` reads ~15 environment variables at **module load time** (outside any function). On Workers, `process.env` is populated at runtime, but module-level reads happen during the first import and may not reflect runtime values correctly across isolate reuse.

**File:** `src/config/env.js`  
**Line 21:**
```javascript
if (missing.length > 0 && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
```

This reads `NODE_ENV` and `NEXT_PHASE` at module load — these are build-time values and won't exist at runtime on Workers.

---

## 6. VERCEL-SPECIFIC APIS

### `@vercel/*` Packages
**None found.** No Vercel-specific npm packages in use.

### `next/image` Usage
- Used in `src/app/blog/page.jsx` and other pages
- Configured with `remotePatterns` for `images.unsplash.com` and `nameverse.site`
- On Workers, `next/image` requires OpenNext compatibility layer or falls back to `<img>`

### `ImageResponse` / `next/og`
- Used in `src/app/opengraph-image.jsx`, `src/app/icon.jsx`, `src/app/apple-icon.jsx`
- All explicitly set `runtime = 'edge'`
- On Workers, `ImageResponse` is supported via OpenNext polyfill or native Workers API

### Vercel Headers
- `next.config.mjs` sets security headers but no Vercel-specific headers
- No usage of `x-vercel-*` headers in application code

### Middleware
- `middleware.js` uses standard `NextResponse` — compatible with Workers via OpenNext
- No Vercel-specific middleware APIs

---

## 7. EXISTING OPENNEXT / WRANGLER SETUP

### Files Found
**None.** The repository has:
- ❌ No `wrangler.toml`
- ❌ No `open-next.config.ts`
- ❌ No `.open-next/` directory
- ❌ No Cloudflare-specific configuration
- ❌ No `@opennextjs/cloudflare` package in dependencies

### What Would Need to Be Added
1. `wrangler.toml` — Workers configuration
2. `open-next.config.ts` — OpenNext adapter config
3. `@opennextjs/cloudflare` — npm package
4. Updated `next.config.js` — output mode and adapter

---

## SUMMARY: BLOCKERS FOR CLOUDFLARE MIGRATION

### 🔴 Hard Blockers (will break immediately)

1. **`sharp` package** — Native binary, incompatible with Workers
2. **`fs`/`path`/`process.cwd()` in Server Components** — Node.js filesystem APIs used in 10+ page files
3. **Module-level `Map` mutations** — `slugTimestampCache`, `requestCache`, `backendSlugCache` will leak state between requests
4. **`process.env` at module load** — `src/config/env.js` reads 15 vars at import time

### 🟡 Medium Risk (need adaptation)

5. **ISR on Workers** — OpenNext supports ISR via Durable Objects, but requires configuration
6. **`sitemap` npm package** — Likely Node-only, may need replacement
7. **`generateStaticParams` only covers 360 pages** — 12K+ pages generate on-demand, which works differently on Workers
8. **FAQ duplicate array bug** — Works but generates per-request; may need caching adjustment

### 🟢 Easy Wins

9. **Edge runtime routes** — `icon.jsx`, `apple-icon.jsx`, `opengraph-image.jsx` already set to edge
10. **No Vercel lock-in** — No `@vercel/*` packages found
11. **Middleware** — Standard `NextResponse`, compatible with Workers
12. **No `globalThis` abuse** — Clean state management

### Estimated Migration Effort

| Component | Effort | Description |
|-----------|--------|-------------|
| Replace `sharp` | Medium | Use `@vercel/og` or Cloudflare Images alternative |
| Replace `fs`/`path` reads | High | Move all JSON reads to fetch from public/ or embed data |
| Fix module-level state | Medium | Move caches into request-scoped functions |
| Fix env var reads | Low | Move `process.env` reads inside functions |
| Add OpenNext config | Low | Create `wrangler.toml` + `open-next.config.ts` |
| Test ISR on Workers | Medium | Verify Durable Object storage works |

**Total estimated effort:** 2-3 days of focused migration work.
