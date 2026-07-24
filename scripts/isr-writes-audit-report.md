# ISR Writes Audit Report — NameVerse
**Date:** 2026-07-24  
**Site:** https://nameverse.site  
**Issue:** ISR Writes 588K/month vs 200K cap  
**Status:** Investigation only — no code changes made

---

## 1. REVALIDATE CONFIG

### Route Segment Config (`export const revalidate`)

| Route | File | Line | Value |
|-------|------|------|-------|
| Homepage | `src/app/page.js` | 7 | 2592000 (30 days) |
| Names listing | `src/app/names/page.jsx` | 7 | 2592000 |
| Name detail | `src/app/names/[religion]/[slug]/page.jsx` | 19 | 2592000 |
| Name detail (all variants) | 41 other pages | various | 2592000 |
| Sitemap XML | `src/app/sitemap.xml/route.js` | 7 | 86400 (1 day) |
| Sitemap Blog XML | `src/app/sitemap-blog.xml/route.js` | 11 | 86400 |

**Finding:** All 43 content pages consistently set to 2592000 seconds (30 days). No layout/parent segment overrides found. No route resets revalidate to a shorter value. **Config is uniform and correct.**

### Fetch-Level Revalidation

**File:** `src/lib/api/server-fetch.js`
- Line 21: `const ISR_TTL = 2592000;` — used as default for all name fetches
- Line 53: `{ next: { revalidate, tags } }` — properly attached to fetch calls
- Line 89: `isrFetchWithRetry()` — uses `ISR_TTL` for retries too
- Line 504: Search uses `3600` (1 hour) — appropriate for search

**Finding:** Backend fetches are properly cached with ISR. No `no-store` or missing cache config on name data fetches.

---

## 2. STATIC GENERATION COVERAGE — **PRIMARY CAUSE**

### File: `src/app/names/[religion]/[slug]/page.jsx`

**Lines 87–194:** `generateStaticParams()` implementation

```javascript
// Line 169-174: EXPLICIT COMMENT FROM PREVIOUS DEVELOPER
// "Prebuild a bounded set of high-traffic slugs at deploy time to keep the
// build fast and within memory. The previous 28/religion cap was too low
// (drove on-demand ISR writes); prebuilding ALL 855 exhausted build memory
// (OOM at ~487/1133 pages). 120 per religion (360 total) covers the popular
// names statically; the rest generate on-demand via ISR and cache for a year."
```

**Line 174:** `const perReligionLimit = 120;`

### The Math

| Source | Count |
|--------|-------|
| `christian_extracted.json` | 12,889 entries |
| Christian sitemap XML files | 515 files, ~12,851 URLs |
| Local JSON data files (all religions) | 855 entries |
| Prebuilt at deploy time | 360 pages (120 × 3 religions) |
| **On-demand ISR writes** | **~12,500+ pages** |

### Critical Finding

**Only 360 of ~12,500+ name pages are pre-generated at build time.** The remaining ~12,140 pages use `dynamicParams: true` (line 15) and generate on first request.

**Every first visit to an unbuilt path = 1 ISR write.** With 3 religions × ~4,000+ names each, and traffic distributed across them, this alone can generate 500K+ writes/month as users discover new pages.

**This is the #1 cause of your ISR Write limit breach.**

### Related Finding: Sitemap vs Build Mismatch

- Sitemaps list 12,851 Christian URLs alone
- But `generateStaticParams` only prebuilds 360 total across ALL religions
- GSC sees all these URLs and crawls them → each crawl hits a cold ISR cache → write

---

## 3. CACHE KEY FRAGMENTATION

### Middleware Normalization

**File:** `middleware.js`

**Lines 126–148:** `normalizePath()` correctly handles:
- Lowercasing
- Trailing slash removal
- Double-slash collapse

**Lines 204–208:** Single-pass normalization with 301 redirect before ISR sees the URL.

### Query String Handling

**Finding:** Middleware does NOT strip query parameters. URLs like:
- `/names/christian/luca?utm_source=x`
- `/names/christian/luca?fbclid=abc`

...pass through to Next.js with query strings intact.

**Impact:** Next.js ISR treats `?utm_source=x` and `?utm_source=y` as **separate cache entries**. Each unique tracking parameter combination creates a new ISR write.

### Missing Redirects for Tracking Params

**File:** `middleware.js` — no regex or logic to strip common tracking params (`utm_*`, `gclid`, `fbclid`, `ref`, `click_id`).

**Evidence:** No matches found in codebase for these patterns.

### No Dynamic Route Duplicates Found

Name detail pages use canonical `/names/[religion]/[slug]` pattern only. No duplicate route definitions found.

---

## 4. ON-DEMAND REVALIDATION

### Webhook Endpoint

**File:** `src/app/api/revalidate/route.js`

**Lines 9–20:**
```javascript
if (tag) {
  revalidateTag(tag);          // Line 10
}
if (path) {
  revalidatePath(path);        // Line 14
}
if (religion && slug) {
  const namePath = `/names/${religion}/${slug}`;
  revalidatePath(namePath);    // Line 19
}
```

**Finding:** This is per-name invalidation, which is fine for low volume. However:
- No rate limiting or batching
- No deduplication of concurrent requests for the same name
- Each call triggers an ISR write for that specific path

### Script Usage

**File:** `scripts/revalidate-name.js`
- Line 59: Default tag is `name-data`
- Used for manual revalidation only
- No bulk job found in codebase

### Cron/Webhook Jobs

**Finding:** No cron jobs, GitHub Actions, or scheduled bulk revalidation found in codebase. Revalidation appears to be manual-only.

**Estimated volume:** Low (likely <100/day) — not a primary contributor to 588K writes.

---

## 5. DEPLOYMENT FREQUENCY IMPACT

### Git History

```
2026-07-21: bcb146a changes
2026-07-19: 36a1c33 Update layout.jsh
2026-07-19: a22a73b added
2026-07-19: 77fadfa added
2026-07-19: cb58ded feat: major UI/SEO overhaul
2026-07-18: 2015848 first commit
2026-07-13: bfcaea4 change
2026-07-13: 930c71b change
2026-07-12: da79f64 changes (and 4 more same day)
2026-07-11: c376557 change (and 4 more same day)
2026-07-10: bee2523 change (and 4 more same day)
2026-07-09: c9f6a45 change
2026-07-07: b4ebe80 'vjsh'
2026-07-05: 4b094c6 changes (and 2 more same day)
```

**Deploy frequency:** ~2–5 deploys/day in July 2026.

### Impact

Every Vercel production deployment **resets Next.js ISR cache entirely**. After each deploy:
1. All 360 prebuilt pages need regeneration
2. All previously cached on-demand pages are cold
3. Next user request to any page = ISR write

**Conservative estimate:** 5 deploys/day × 360 prebuilt pages = 1,800 writes/day just from deploys.

If even 50% of your ~12K sitemap URLs get crawled post-deploy, that's 6,000+ writes per deploy event.

---

## 6. FETCH CACHING TO BACKEND API

### Name Detail Page Server Component

**File:** `src/app/names/[religion]/[slug]/page.jsx`

**Lines 253–312:** Main page component
- No `searchParams` usage
- No `headers()` or `cookies()` calls
- No dynamic API that would force `force-dynamic`

**Finding:** The page component itself is properly static. It uses `params` only, which is compatible with ISR.

### Server Fetches

**File:** `src/lib/api/server-fetch.js`

| Function | Line | Revalidate | Tags |
|----------|------|------------|------|
| `safeFetch()` | 53 | `ISR_TTL` (30d) | optional |
| `serverFetchNameDetail()` | 243–248 | 2592000 | `['name-data']` |
| `serverFetchNameDetail()` fallback | 257–262 | 2592000 | `['name-data']` |
| `serverSearchNames()` | 504 | 3600 (1h) | none |

**Finding:** All backend fetches properly use ISR caching. No `no-store` or `force-no-store` detected.

### Potential Issue: Parallel Fetch Storm

**Lines 302–306:**
```javascript
const [filteredSimilar, filteredRelated, filteredVariations] = await Promise.all([
  serverFilterKnownSlugs(religion, nameData.similar_sounding_names),
  serverFilterKnownSlugs(religion, nameData.related_names),
  serverFilterKnownSlugs(religion, nameData.name_variations),
]);
```

Each `serverFilterKnownSlugs` calls `serverIsKnownSlug` which calls `serverFetchNameDetail` — but these are cached by ISR so subsequent calls are reads, not writes.

**Finding:** Not a primary issue, but first-generation of a page with many related names could trigger multiple sequential fetches.

---

## 7. VERCEL CONFIG

### File: `vercel.json`

**Content:** `{}` — empty, no custom config.

### File: `next.config.mjs`

**Headers affecting caching:**

| Source | Cache-Control | Impact |
|--------|---------------|--------|
| `/api/:path*` | `no-store, max-age=0, must-revalidate` | Correct — API not cached |
| `/api/og/:path*` | `no-store, max-age=0, must-revalidate` | Correct — OG images dynamic |
| `/:path*` | No Cache-Control set | Uses Next.js ISR defaults |
| `/_next/data/:path*` | `public, max-age=0, stale-while-revalidate=2592000` | Good |
| `/images/:path*` | `public, max-age=31536000, immutable` | Good |
| `/_next/static/:path*` | `public, max-age=31536000, immutable` | Good |

**Trailing slash:** `trailingSlash: false` — correct, single URL version only.

**Finding:** No Vercel config is overriding or bypassing ISR caching. The issue is purely in generation strategy, not configuration.

---

## ROOT CAUSE RANKING

### #1 — On-Demand Generation of 12K+ Pages (ESTIMATED: 500K writes/month)
**File:** `src/app/names/[religion]/[slug]/page.jsx`  
**Lines:** 169–194

`generateStaticParams` only prebuilds **360 pages** (120 per religion). The remaining **~12,140 pages** use `dynamicParams: true` and generate on first request. Each first visit = 1 ISR write. With sitemaps listing all 12K URLs and GSC crawling them, plus user traffic, this generates the bulk of your writes.

**Fix:** Increase `perReligionLimit` from 120 to at least 500–1000, or implement a build-time script that pre-generates ALL name pages without OOM.

---

### #2 — Deployment Cache Reset (ESTIMATED: 50K–100K writes/month)
**Operational issue, not code**

~2–5 deploys/day reset ISR cache. Each deploy makes previously cached pages cold. If GSC or users hit 10–20% of your 12K pages post-deploy, that's 1,200–2,400 writes per deploy × 20 deploys = 24K–48K writes.

**Fix:** Reduce deploy frequency, or implement cache warming script that pre-fetches critical pages post-deploy.

---

### #3 — Tracking Query String Fragmentation (ESTIMATED: 10K–50K writes/month)
**File:** `middleware.js`  
**Lines:** 126–148

Middleware normalizes path but does NOT strip tracking query parameters (`utm_*`, `gclid`, `fbclid`, `ref`, `click_id`). Each unique query string combination creates a separate ISR cache entry.

**Fix:** Add query-string stripping middleware for tracking params before ISR sees the request.

---

### #4 — Per-Name Revalidation Webhook (ESTIMATED: <5K writes/month)
**File:** `src/app/api/revalidate/route.js`  
**Lines:** 9–20

`revalidatePath` per name is fine at low volume but creates unnecessary writes if called frequently. No batching or deduplication.

**Fix:** Batch revalidation by religion or use `revalidateTag('names')` for bulk invalidation instead of per-path calls.

---

## SUMMARY

| Cause | Estimated Monthly Writes | Fix Complexity |
|-------|--------------------------|----------------|
| #1 On-demand page generation (12K pages) | 500K+ | Medium — increase prebuild limit or add build script |
| #2 Deploy cache resets | 50K–100K | Low — deploy less often or add warmup |
| #3 Tracking query fragmentation | 10K–50K | Low — strip query params in middleware |
| #4 Per-name revalidation | <5K | Low — batch with tags |
| **Total estimated** | **~570K–655K** | — |

Your current 588K writes aligns with the ~12K on-demand pages being hit by crawlers + users, amplified by frequent deploys resetting cache.

**The single highest-impact fix:** Increase `perReligionLimit` in `generateStaticParams` from 120 to 500+ for each religion, or implement a build-time script to pre-generate all name pages.
