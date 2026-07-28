# Prompt for converting NameVerse from Vercel/Next.js to GitHub Pages static hosting

You are migrating the NameVerse repository from a Next.js/Vercel-style app to a fully static GitHub Pages deployment.

## Goal

Convert the site so it can be built into a static export using local JSON files in public/names/* as the primary source of truth for name pages, without requiring a Node server or runtime API.

## Current repository facts

- The app is a Next.js 16 app using the App Router.
- The main name detail route is [src/app/names/[religion]/[slug]/page.jsx](src/app/names/[religion]/[slug]/page.jsx).
- The current data flow is mixed:
  - the route tries server-side fetching from the old backend API
  - it also falls back to local helper data in [src/lib/data/local-name-data.mjs](src/lib/data/local-name-data.mjs)
  - the current local-data implementation is based on aggregated JSON files in [public/data](public/data), not the per-name files in [public/names](public/names)
- The repo already contains one JSON file per name under:
  - [public/names/islamic](public/names/islamic)
  - [public/names/christian](public/names/christian)
  - [public/names/hindu](public/names/hindu)
- The current next config does not contain `output: 'export'`.
- The project currently uses middleware, API routes, ISR-style `revalidate`, and server-side fetch helpers that are not suitable for plain GitHub Pages hosting.

## Required migration strategy

### 1. Make the site static-export friendly

- Add `output: 'export'` to [next.config.mjs](next.config.mjs).
- Remove any reliance on runtime-only Next.js features that GitHub Pages cannot serve.
- Ensure the app can build into a static folder such as `out/` without errors.

### 2. Replace backend-dependent name-page loading with local JSON loading

- For every dynamic name route under [src/app/names](src/app/names), load name data directly from the local JSON files in [public/names](public/names).
- Do not depend on the old Vercel backend API for name detail pages.
- The per-name files should be the primary source of truth.

### 3. Generate static params from the local file system

- Replace any static route generation that depends on a remote API or a separate data index with logic that reads the actual files under [public/names/islamic](public/names/islamic), [public/names/christian](public/names/christian), and [public/names/hindu](public/names/hindu).
- Build the list of slugs directly from the files on disk.
- Ensure the route generation covers the available name pages for all three religions.

### 4. Remove server-only features that break static hosting

- Disable or remove middleware-based redirects/validation logic that is not compatible with GitHub Pages.
- Remove or replace route handlers under [src/app/api](src/app/api) if they are required for the site to render.
- Avoid `getServerSideProps` and any server-only fetch pattern in page components.
- Avoid ISR and `revalidate` usage for the static export path unless it can be fully replaced with build-time generation.

### 5. Preserve SEO and metadata

- Keep metadata generation, canonical URLs, Open Graph tags, and JSON-LD schemas.
- Compute them from the same local per-name JSON data at build time.
- Ensure the static output still includes proper metadata for each generated name page.

### 6. Preserve existing page structure and UI

- Keep the current app layout, styling, and components where possible.
- Do not introduce unnecessary framework changes.
- The migration should focus on making the app static and GitHub Pages compatible, not redesigning the frontend.

## Important constraints

- Do not modify the core visual design unless required for compatibility.
- Do not introduce a Node server, serverless API, or runtime backend dependency.
- Do not rely on Vercel-specific features.
- The output should be deployable as a static site to GitHub Pages.

## Expected outcome

After the changes:

- `npm run build` should produce a static export successfully.
- The output should be generated into `out/` or the configured export directory.
- Name pages should be built from the per-name JSON files under [public/names](public/names).
- The project should no longer require the old backend API to render name detail pages.

## Implementation notes

- Prefer simple and explicit file-system-based logic over abstract data abstractions.
- Use the existing repository structure rather than creating a completely new architecture.
- If a feature cannot be made GitHub Pages compatible without major redesign, replace it with a simpler static equivalent.
- Keep the migration as incremental as possible, but make sure the final state is fully static.

## Deliverables

Produce:

1. a working static export build
2. a GitHub Pages-ready deployment configuration
3. a migration that removes the dependency on the old backend API for name pages
4. a clean static route generation strategy based on the JSON files in [public/names](public/names)
