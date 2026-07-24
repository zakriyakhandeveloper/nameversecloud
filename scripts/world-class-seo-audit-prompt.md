# World-Class NameVerse SEO & Code Quality Audit Prompt

You are an elite SEO engineer and Next.js code auditor specializing in large-scale content sites. Your task is to perform a holistic, page-by-page audit of the NameVerse application, evaluating indexing, CTR potential, technical health, and SEO signal completeness.

## Output Format
Return a structured Markdown report with these exact top-level sections:
1. Executive Summary (score, critical blockers, quick wins)
2. Indexing & Discovery Audit
3. CTR & Search Visibility Audit
4. Technical SEO Error Inventory
5. Per-Page Type Scorecards
6. Priority Action Plan (P0/P1/P2)
7. Appendix: Route Map & Coverage

---

## 1. Executive Summary

Start with:
- Overall SEO Health Score (0–100)
- Number of pages audited
- Number of P0 (critical) issues
- Number of P1 (high) issues
- Number of P2 (medium) issues
- Top 3 quick wins that will move the needle fastest

---

## 2. Indexing & Discovery Audit

For the entire site, verify:

### Sitemaps
- Read `public/sitemap.xml` and all referenced child sitemaps.
- Confirm every major route type has a dedicated sitemap:
  - Name detail pages (`/names/[religion]/[slug]`)
  - Religion listing pages (`/names/[religion]`)
  - Letter pages (`/names/[religion]/letter/[letter]`)
  - Category pages (`/names/[religion]/categories/[category]`)
  - Blog pages (`/blog`, `/blog/[slug]`)
  - Static pages (about, privacy, contact, etc.)
- Flag missing route types.
- Confirm sitemap URLs use the canonical hostname (no localhost).
- Check for orphan pages (pages in code but missing from sitemaps).

### robots.txt
- Read `public/robots.txt`.
- Verify it allows crawling of important content paths (`/names/`, `/blog/`).
- Verify it disallows admin/tracking/internal paths.
- Check for conflicting `noindex` in meta robots vs robots.txt.

### Meta robots & canonicalization
- Read `src/app/layout.js` and check `metadata.robots`.
- For every page template, verify no `noindex` is accidentally hardcoded.
- Verify canonical tags are present and self-referencing on every page.
- Check for canonical loops or missing canonicals.

### Structured data / indexing signals
- Verify `StructuredData` component is present in layout.
- Check that JSON-LD is emitted for:
  - WebSite (with SearchAction)
  - Organization (with logo)
  - ItemList for listing pages
  - Article/BlogPosting for blog
  - DefinedTerm / WebPage for name pages
  - BreadcrumbList on all deep pages
- Flag any route missing structured data.

### Logo & Brand Signals
- Locate logo file (favicon, SVG, PNG) in `public/`.
- Verify `Organization` schema includes `logo`.
- Verify OG/Twitter images include logo or branded template.
- Check for favicon and apple-touch-icon in head.
- Verify site name consistency ("NameVerse") across schema, title templates, and OG.

---

## 3. CTR & Search Visibility Audit

For each page type, evaluate title tags and meta descriptions.

### Title Tag Rules
- Length: 50–60 characters ideal; never >65.
- Must include primary keyword near the start.
- Must include brand pipe (`| NameVerse`) via the app template.
- Check for:
  - Duplicate titles across pages
  - Keyword stuffing
  - Missing brand suffix
  - Generic titles (e.g., "Page 1", "Names")
  - Titles that Google is likely to rewrite

### Meta Description Rules
- Length: 145–160 characters ideal; never >165.
- Must contain primary keyword and at least one value proposition.
- Must include a call-to-action or unique hook.
- Check for:
  - Truncation risk (>165 chars)
  - Duplicate descriptions
  - Boilerplate reuse across different pages
  - Missing descriptions entirely

### CTR Scoring Matrix (per page)
| Factor | Points |
|---|---|
| Title ≤60 chars | +10 |
| Title starts with target keyword | +10 |
| Title has emotional/unique hook | +10 |
| Description ≤160 chars | +10 |
| Description has keyword + CTA | +10 |
| Description unique vs other pages | +10 |
| Schema rich-result eligible | +10 |
| No Google rewrite risk signals | +10 |
| URL is short, clean, keyword-inclusive | +10 |
| Total | /100 |

---

## 4. Technical SEO Error Inventory

Scan for and categorize:

### A. Routing & Rendering
- Dynamic routes with missing `generateStaticParams` (causing CSR instead of SSG/SSR).
- Pages using `revalidate` (ISR) but generating huge numbers of static files without pagination strategy.
- Hardcoded slugs or religion values that don't map to canonical URLs.
- Routes with client-side-only data fetching that should be server-side.

### B. Image & Media
- Missing `alt` attributes on main images, OG images, logos.
- LCP image not preloaded or using `priority` flag.
- Next/Image used without width/height or fill without proper container sizing.
- Blog featured images with broken or relative paths that break OG sharing.

### C. Content Quality
- Thin content pages (word count estimation from JSX/rendered view).
- Duplicate content risk across religion listing pages with identical structure.
- Missing H1, or multiple H1s per page.
- Heading hierarchy breaks (H1 → H3 jumps).

### D. Internal Linking
- No breadcrumbs on deep pages.
- Missing contextual links from blog to name pages.
- Listing pages without "View all names in X" hub links.
- Orphan pages not linked from nav or sitemap.

### E. Performance (SEO-adjacent)
- CLS risks (dynamic ad containers without reserved space).
- Missing `next/font` preload declarations.
- Excessive client-side bundles on name detail pages.
- API calls blocking above-the-fold render.

### F. Ad & UX
- Ads above the fold without proper layout shifts checks.
- Popups/pop-unders not compliant with Google UX policies.
- Mobile viewport or tap target issues.

---

## 5. Per-Page Type Scorecards

Evaluate and score each route pattern found in `src/app/`. Use this template for each:

| Route Pattern | Sample Path | Indexable? | Title Score /10 | Desc Score /10 | Technical Score /10 | Overall /100 | Top Issue |
|---|---|---|---|---|---|---|---|

Evaluate at least these route groups:
- `/names/[religion]/[slug]` — Single name detail
- `/names/[religion]` — Religion listing
- `/names/[religion]/letter/[letter]` — Letter index
- `/names/[religion]/categories/[category]` — Category pages
- `/blog/[slug]` — Blog posts
- `/blog` — Blog index
- `/` — Homepage
- Static pages (`about`, `contact`, `privacy`, `terms`)

Add any additional route types you discover.

---

## 6. Priority Action Plan

### P0 — Fix This Week (blocks indexing or kills CTR)
- ...

### P1 — Fix This Month (significant impact)
- ...

### P2 — Fix This Quarter (polish & defensiveness)
- ...

Each item must include:
- Exact file path and line range
- Current code snippet
- Recommended fix
- Expected SEO impact

---

## 7. Appendix: Route Map & Coverage

List every directory under `src/app/` and mark:
- Audited: [x]
- Has `generateMetadata`: [x]
- Has `generateStaticParams`: [x]
- In sitemap: [x]
- Noindex risk: [x]

---

## Codebase Context (for your reference)

- **Framework**: Next.js (App Router)
- **SEO libs**: `src/lib/seo/title-generator.jsx`, `src/lib/seo/name-page-seo.jsx`, `src/lib/seo/meta-helpers`, `src/lib/seo/structured-data`
- **Layout**: `src/app/layout.js`
- **Sitemaps**: `public/sitemap*.xml`
- **Data**: `public/*.json`
- **Key pages**: home, names, blog, meaning, search, popularity, religions, guides

## Rules
1. Read actual source files before scoring. Do not hallucinate.
2. If a value is unknown, read the file or state that it needs live-url verification.
3. Be precise: use exact file paths and line numbers.
4. Group related issues together; do not scatter findings.
5. End with a 1-paragraph summary of the single biggest SEO opportunity.
